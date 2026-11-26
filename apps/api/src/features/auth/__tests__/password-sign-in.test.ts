import { AUDIT_ACTION } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import { AUTH_OUTCOME, SIGN_IN_METHOD } from "../constants/auth-audit"
import { SIGN_IN_RATE_LIMIT } from "../constants/auth-settings"
import { auditRows } from "./support/audit-rows"
import { AUTH_URL, createOwnerClient, OWNER } from "./support/owner-client"

const WRONG_PASSWORD = "esta-no-es-la-clave"
const OTHER_CLIENT_IP = "198.51.100.7"
const NEW_PASSWORD = "otra-clave-de-recuperacion"

async function bootstrappedOwner() {
  await createOwnerClient().bootstrap()
}

describe("password sign-in (fallback)", () => {
  it("signs the owner in and audits it", async () => {
    await bootstrappedOwner()
    const browser = createOwnerClient()

    const response = await browser.signInWithPassword()

    expect(response.status).toBe(200)
    const session = await browser.session()
    expect(session?.user.id).toEqual(expect.any(String))
    const passwordSignIns = (await auditRows(AUDIT_ACTION.authSignIn)).filter(
      (row) => row.entityId === session?.user.id && row.details?.method === SIGN_IN_METHOD.password,
    )
    expect(passwordSignIns.at(-1)?.details).toEqual({
      method: SIGN_IN_METHOD.password,
      outcome: AUTH_OUTCOME.success,
    })
  })

  it("audits a wrong password as a failure without the password", async () => {
    await bootstrappedOwner()

    const response = await createOwnerClient().signInWithPassword(WRONG_PASSWORD)

    expect(response.status).toBe(401)
    const failures = (await auditRows(AUDIT_ACTION.authSignIn)).filter(
      (row) => row.details?.outcome === AUTH_OUTCOME.failure,
    )
    expect(failures).toEqual([
      {
        entityId: null,
        details: { method: SIGN_IN_METHOD.password, outcome: AUTH_OUTCOME.failure },
      },
    ])
    expect(JSON.stringify(failures)).not.toContain(WRONG_PASSWORD)
  })

  it("rate limits the sixth attempt within 15 minutes", async () => {
    await bootstrappedOwner()
    const attacker = createOwnerClient()

    for (let attempt = 0; attempt < SIGN_IN_RATE_LIMIT.max; attempt++) {
      expect((await attacker.signInWithPassword(WRONG_PASSWORD)).status).toBe(401)
    }
    const sixth = await attacker.signInWithPassword()

    expect(sixth.status).toBe(429)
  })

  it("keeps the limit per client IP", async () => {
    await bootstrappedOwner()
    const attacker = createOwnerClient()
    for (let attempt = 0; attempt < SIGN_IN_RATE_LIMIT.max; attempt++) {
      await attacker.signInWithPassword(WRONG_PASSWORD)
    }

    const owner = createOwnerClient(OTHER_CLIENT_IP)

    expect((await owner.signInWithPassword()).status).toBe(200)
  })

  it("changes the password through Better Auth and audits it", async () => {
    const owner = createOwnerClient()
    const { userId } = (await (await owner.bootstrap()).json()) as { userId: string }

    const response = await owner.request(`${AUTH_URL}/change-password`, {
      body: { currentPassword: OWNER.password, newPassword: NEW_PASSWORD },
    })

    expect(response.status).toBe(200)
    expect((await createOwnerClient(OTHER_CLIENT_IP).signInWithPassword(NEW_PASSWORD)).status).toBe(
      200,
    )
    expect(await auditRows(AUDIT_ACTION.authPasswordChanged)).toEqual([
      { entityId: userId, details: null },
    ])
  })

  it("rejects public sign-up", async () => {
    const response = await createOwnerClient().request(`${AUTH_URL}/sign-up/email`, {
      body: { ...OWNER, email: "otro@example.com" },
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: "EMAIL_PASSWORD_SIGN_UP_DISABLED" })
  })
})

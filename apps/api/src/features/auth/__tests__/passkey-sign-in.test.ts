import { AUDIT_ACTION } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import { AUTH_OUTCOME, SIGN_IN_METHOD } from "../constants/auth-audit"
import { auditRows } from "./support/audit-rows"
import { ownerWithPasskey } from "./support/owner-with-passkey"
import { signInWithPasskey } from "./support/passkey-flows"

const FOREIGN_ORIGIN = "https://evil.example"
const FOREIGN_RP_ID = "evil.example"
const AUTHENTICATION_FAILED = { code: "AUTHENTICATION_FAILED" }

async function passkeySignIns() {
  const rows = await auditRows(AUDIT_ACTION.authSignIn)
  return rows.filter((row) => row.details?.method === SIGN_IN_METHOD.passkey)
}

describe("passkey sign-in", () => {
  it("creates a session and audits the success", async () => {
    const { authenticator, browser } = await ownerWithPasskey()

    const response = await signInWithPasskey(browser, authenticator)

    expect(response.status).toBe(200)
    const session = await browser.session()
    expect(session?.user.id).toEqual(expect.any(String))
    expect(await passkeySignIns()).toEqual([
      {
        entityId: session?.user.id,
        details: { method: SIGN_IN_METHOD.passkey, outcome: AUTH_OUTCOME.success },
      },
    ])
  })

  it("rejects an assertion made for a different origin", async () => {
    const { authenticator, browser } = await ownerWithPasskey()

    const response = await signInWithPasskey(browser, authenticator, { origin: FOREIGN_ORIGIN })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject(AUTHENTICATION_FAILED)
    expect(await browser.session()).toBeNull()
  })

  it("rejects an assertion made for a different rpID", async () => {
    const { authenticator, browser } = await ownerWithPasskey()

    const response = await signInWithPasskey(browser, authenticator, { rpId: FOREIGN_RP_ID })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject(AUTHENTICATION_FAILED)
    expect(await browser.session()).toBeNull()
  })

  it("rejects an assertion without user verification", async () => {
    const { authenticator, browser } = await ownerWithPasskey()

    const response = await signInWithPasskey(browser, authenticator, { userVerified: false })

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject(AUTHENTICATION_FAILED)
    expect(await browser.session()).toBeNull()
  })

  it("audits a rejected assertion as a failure without a user", async () => {
    const { authenticator, browser } = await ownerWithPasskey()

    await signInWithPasskey(browser, authenticator, { userVerified: false })

    expect(await passkeySignIns()).toEqual([
      {
        entityId: null,
        details: { method: SIGN_IN_METHOD.passkey, outcome: AUTH_OUTCOME.failure },
      },
    ])
  })
})

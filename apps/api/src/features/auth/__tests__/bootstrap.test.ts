import { AUDIT_ACTION } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import { ERROR_CODES } from "../../shared"
import { allAuditText, auditRows } from "./support/audit-rows"
import { createOwnerClient, OWNER } from "./support/owner-client"

const WRONG_TOKEN = "not-the-bootstrap-token-0123456789abcdef"

describe("POST /api/v1/bootstrap", () => {
  it("creates the owner once and returns a working session", async () => {
    const client = createOwnerClient()

    const response = await client.bootstrap()

    expect(response.status).toBe(201)
    const { userId } = (await response.json()) as { userId: string }
    expect((await client.session())?.user.id).toBe(userId)
    expect(await auditRows(AUDIT_ACTION.authBootstrap)).toEqual([
      { entityId: userId, details: null },
    ])
  })

  it("returns 410 once the owner exists", async () => {
    await createOwnerClient().bootstrap()

    const second = await createOwnerClient().bootstrap()

    expect(second.status).toBe(410)
    expect(await second.json()).toEqual({ error: ERROR_CODES.ownerExists })
  })

  it("returns 401 for a wrong token, before looking at the body", async () => {
    const response = await createOwnerClient().bootstrap(WRONG_TOKEN, { not: "a valid body" })

    expect(response.status).toBe(401)
    expect(await auditRows(AUDIT_ACTION.authBootstrap)).toEqual([])
  })

  it("returns 401 without a token", async () => {
    const client = createOwnerClient()

    const response = await client.request("/api/v1/bootstrap", { body: OWNER })

    expect(response.status).toBe(401)
  })

  it("returns 400 for a password under 12 characters", async () => {
    const response = await createOwnerClient().bootstrap(undefined, { ...OWNER, password: "corta" })

    expect(response.status).toBe(400)
  })

  it("stores no password or token in the audit log", async () => {
    await createOwnerClient().bootstrap()

    const text = await allAuditText()

    expect(text).not.toContain(OWNER.password)
    expect(text).not.toContain("token")
  })
})

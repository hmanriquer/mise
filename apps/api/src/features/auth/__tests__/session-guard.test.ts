import { AUDIT_ACTION } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import { SESSION_EXPIRES_IN_SECONDS } from "../constants/auth-settings"
import { auditRows } from "./support/audit-rows"
import { createOwnerClient, REVOKE_ALL_URL } from "./support/owner-client"

const FOREIGN_ORIGIN = "https://evil.example"
const FORM_TYPE = "application/x-www-form-urlencoded"
const SESSION_COOKIE_NAME = "__Secure-better-auth.session_token"

describe("/api/v1 session guard", () => {
  it("returns 401 without a session", async () => {
    const response = await createOwnerClient().request(REVOKE_ALL_URL, { method: "POST" })

    expect(response.status).toBe(401)
  })

  it("returns 200 with a session", async () => {
    const owner = createOwnerClient()
    await owner.bootstrap()

    const response = await owner.request(REVOKE_ALL_URL, { method: "POST" })

    expect(response.status).toBe(200)
  })

  it("rejects a cross-origin form POST to a mutation", async () => {
    const owner = createOwnerClient()
    await owner.bootstrap()

    const response = await owner.request(REVOKE_ALL_URL, {
      method: "POST",
      headers: { origin: FOREIGN_ORIGIN, "content-type": FORM_TYPE },
    })

    expect(response.status).toBe(403)
    expect(await owner.session()).not.toBeNull()
  })

  it("sends a CSP that forbids loading or framing anything", async () => {
    const response = await createOwnerClient().request(REVOKE_ALL_URL, { method: "POST" })

    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'")
    expect(response.headers.get("content-security-policy")).toContain("default-src 'none'")
  })
})

describe("POST /api/v1/auth/revoke-all", () => {
  it("closes every session of the owner and audits it", async () => {
    const pc = createOwnerClient()
    const { userId } = (await (await pc.bootstrap()).json()) as { userId: string }
    const tablet = createOwnerClient()
    await tablet.signInWithPassword()

    await pc.request(REVOKE_ALL_URL, { method: "POST" })

    expect(await pc.session()).toBeNull()
    expect(await tablet.session()).toBeNull()
    expect(await auditRows(AUDIT_ACTION.authSessionsRevoked)).toEqual([
      { entityId: userId, details: null },
    ])
  })
})

describe("session cookie", () => {
  it("is httpOnly, Secure, SameSite=Lax and lasts 30 days", async () => {
    const response = await createOwnerClient().bootstrap()

    const cookie = response.headers
      .getSetCookie()
      .find((header) => header.startsWith(`${SESSION_COOKIE_NAME}=`))

    expect(cookie).toBeDefined()
    expect(cookie).toMatch(/; HttpOnly/i)
    expect(cookie).toMatch(/; Secure/i)
    expect(cookie).toMatch(/; SameSite=Lax/i)
    expect(cookie).toContain(`Max-Age=${SESSION_EXPIRES_IN_SECONDS}`)
  })
})

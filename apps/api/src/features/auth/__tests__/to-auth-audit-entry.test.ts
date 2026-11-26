import { AUDIT_ACTION } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import { AUTH_OUTCOME, SIGN_IN_METHOD } from "../constants/auth-audit"
import { AUTH_ENDPOINT } from "../constants/auth-endpoints"
import { type AuthEndpointResult, toAuthAuditEntry } from "../helpers/to-auth-audit-entry"

const USER_ID = "user-1"
const PASSKEY_ID = "passkey-1"

function result(overrides: Partial<AuthEndpointResult>): AuthEndpointResult {
  return {
    path: "/",
    body: undefined,
    returned: undefined,
    failed: false,
    signedInUserId: undefined,
    ...overrides,
  }
}

describe("toAuthAuditEntry", () => {
  it.each([
    [AUTH_ENDPOINT.signInEmail, SIGN_IN_METHOD.password],
    [AUTH_ENDPOINT.passkeySignIn, SIGN_IN_METHOD.passkey],
  ])("records a successful sign-in on %s with method %s", (path, method) => {
    expect(toAuthAuditEntry(result({ path, signedInUserId: USER_ID }))).toEqual({
      action: AUDIT_ACTION.authSignIn,
      entityType: "user",
      entityId: USER_ID,
      details: { method, outcome: AUTH_OUTCOME.success },
    })
  })

  it("records a failed sign-in without a user and without the request body", () => {
    const entry = toAuthAuditEntry(
      result({ path: AUTH_ENDPOINT.signInEmail, failed: true, body: { password: "secreto" } }),
    )

    expect(entry).toEqual({
      action: AUDIT_ACTION.authSignIn,
      entityType: "user",
      entityId: undefined,
      details: { method: SIGN_IN_METHOD.password, outcome: AUTH_OUTCOME.failure },
    })
    expect(JSON.stringify(entry)).not.toContain("secreto")
  })

  it("records an added passkey by the id it returned", () => {
    const entry = toAuthAuditEntry(
      result({ path: AUTH_ENDPOINT.passkeyRegister, returned: { id: PASSKEY_ID, publicKey: "k" } }),
    )

    expect(entry).toEqual({
      action: AUDIT_ACTION.authPasskeyAdded,
      entityType: "passkey",
      entityId: PASSKEY_ID,
    })
  })

  it("records a renamed passkey by the id in the body", () => {
    const entry = toAuthAuditEntry(
      result({ path: AUTH_ENDPOINT.passkeyRename, body: { id: PASSKEY_ID, name: "PC" } }),
    )

    expect(entry?.action).toBe(AUDIT_ACTION.authPasskeyRenamed)
    expect(entry?.entityId).toBe(PASSKEY_ID)
  })

  it("records whether a deletion confirmed the last passkey", () => {
    const confirmed = toAuthAuditEntry(
      result({
        path: AUTH_ENDPOINT.passkeyDelete,
        body: { id: PASSKEY_ID, confirmLastPasskey: true },
      }),
    )
    const plain = toAuthAuditEntry(
      result({ path: AUTH_ENDPOINT.passkeyDelete, body: { id: PASSKEY_ID } }),
    )

    expect(confirmed?.details).toEqual({ lastPasskeyConfirmed: true })
    expect(plain?.details).toEqual({ lastPasskeyConfirmed: false })
  })

  it("records a password change by the returned user", () => {
    const entry = toAuthAuditEntry(
      result({
        path: AUTH_ENDPOINT.changePassword,
        returned: { token: "t", user: { id: USER_ID } },
      }),
    )

    expect(entry).toEqual({
      action: AUDIT_ACTION.authPasswordChanged,
      entityType: "user",
      entityId: USER_ID,
    })
  })

  it("ignores failed changes and unrelated endpoints", () => {
    expect(toAuthAuditEntry(result({ path: AUTH_ENDPOINT.passkeyDelete, failed: true }))).toBeNull()
    expect(toAuthAuditEntry(result({ path: AUTH_ENDPOINT.getSession }))).toBeNull()
  })
})

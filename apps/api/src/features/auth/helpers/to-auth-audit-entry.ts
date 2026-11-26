import {
  AUDIT_ACTION,
  type AuditAction,
  LAST_PASSKEY_CONFIRMATION_FIELD,
} from "@workspace/contracts"
import { z } from "zod"
import type { AuditEntry } from "../../shared"
import { AUTH_OUTCOME, SIGN_IN_METHOD, type SignInMethod } from "../constants/auth-audit"
import { AUTH_ENDPOINT } from "../constants/auth-endpoints"
import { OWNER_ENTITY_TYPE, PASSKEY_ENTITY_TYPE } from "../constants/auth-settings"

// What a Better Auth after-hook saw. Only ids are read from it, never credential material.
export type AuthEndpointResult = {
  path: string
  body: unknown
  returned: unknown
  failed: boolean
  signedInUserId: string | undefined
}

const SIGN_IN_METHOD_BY_PATH: Readonly<Record<string, SignInMethod>> = {
  [AUTH_ENDPOINT.signInEmail]: SIGN_IN_METHOD.password,
  [AUTH_ENDPOINT.passkeySignIn]: SIGN_IN_METHOD.passkey,
}

const withIdSchema = z.object({ id: z.string() })
const withUserSchema = z.object({ user: withIdSchema })
const deleteConfirmationSchema = z.object({ [LAST_PASSKEY_CONFIRMATION_FIELD]: z.literal(true) })

function idOf(value: unknown): string | undefined {
  return withIdSchema.safeParse(value).data?.id
}

function signInEntry(method: SignInMethod, result: AuthEndpointResult): AuditEntry {
  const succeeded = !result.failed && result.signedInUserId !== undefined
  return {
    action: AUDIT_ACTION.authSignIn,
    entityType: OWNER_ENTITY_TYPE,
    entityId: succeeded ? result.signedInUserId : undefined,
    details: { method, outcome: succeeded ? AUTH_OUTCOME.success : AUTH_OUTCOME.failure },
  }
}

function passkeyEntry(action: AuditAction, passkeyId: string | undefined): AuditEntry {
  return { action, entityType: PASSKEY_ENTITY_TYPE, entityId: passkeyId }
}

const SUCCESS_ENTRY_BY_PATH: Readonly<Record<string, (result: AuthEndpointResult) => AuditEntry>> =
  {
    [AUTH_ENDPOINT.passkeyRegister]: (result) =>
      passkeyEntry(AUDIT_ACTION.authPasskeyAdded, idOf(result.returned)),
    [AUTH_ENDPOINT.passkeyRename]: (result) =>
      passkeyEntry(AUDIT_ACTION.authPasskeyRenamed, idOf(result.body)),
    [AUTH_ENDPOINT.passkeyDelete]: (result) => ({
      ...passkeyEntry(AUDIT_ACTION.authPasskeyDeleted, idOf(result.body)),
      details: {
        lastPasskeyConfirmed: deleteConfirmationSchema.safeParse(result.body).success,
      },
    }),
    [AUTH_ENDPOINT.changePassword]: (result) => ({
      action: AUDIT_ACTION.authPasswordChanged,
      entityType: OWNER_ENTITY_TYPE,
      entityId: withUserSchema.safeParse(result.returned).data?.user.id,
    }),
  }

// Sign-ins are audited either way; other changes only when they succeed.
export function toAuthAuditEntry(result: AuthEndpointResult): AuditEntry | null {
  const signInMethod = SIGN_IN_METHOD_BY_PATH[result.path]
  if (signInMethod) {
    return signInEntry(signInMethod, result)
  }
  if (result.failed) {
    return null
  }
  return SUCCESS_ENTRY_BY_PATH[result.path]?.(result) ?? null
}

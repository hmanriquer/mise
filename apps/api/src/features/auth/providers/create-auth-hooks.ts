import { deletePasskeyRequestSchema } from "@workspace/contracts"
import { APIError, createAuthMiddleware, getSessionFromCtx, isAPIError } from "better-auth/api"
import type { AuditLogWriter } from "../../shared"
import { AUTH_ENDPOINT } from "../constants/auth-endpoints"
import { LAST_PASSKEY_CONFIRMATION_REQUIRED } from "../constants/auth-errors"
import { toAuthAuditEntry } from "../helpers/to-auth-audit-entry"
import type { PasskeyRepository } from "../repositories/passkey-repository"
import type { AuthHooks } from "../types/auth-hooks"

const LAST_PASSKEY_COUNT = 1

type AuthHooksDependencies = {
  auditLog: AuditLogWriter
  passkeys: PasskeyRepository
}

export function createAuthHooks({ auditLog, passkeys }: AuthHooksDependencies): AuthHooks {
  return {
    // The password fallback still works without passkeys, but losing the last one must be
    // a deliberate choice.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== AUTH_ENDPOINT.passkeyDelete) {
        return
      }
      const request = deletePasskeyRequestSchema.safeParse(ctx.body)
      if (!request.success || request.data.confirmLastPasskey) {
        return
      }
      const session = await getSessionFromCtx(ctx)
      if (!session) {
        return
      }
      if ((await passkeys.countForUser(session.user.id)) <= LAST_PASSKEY_COUNT) {
        throw new APIError("CONFLICT", LAST_PASSKEY_CONFIRMATION_REQUIRED)
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const entry = toAuthAuditEntry({
        path: ctx.path,
        body: ctx.body,
        returned: ctx.context.returned,
        failed: isAPIError(ctx.context.returned),
        signedInUserId: ctx.context.newSession?.user.id,
      })
      if (entry) {
        await auditLog.record(entry)
      }
    }),
  }
}

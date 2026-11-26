import type { MiddlewareHandler } from "hono"
import {
  createAuditLogRepository,
  createAuditLogWriter,
  ERROR_CODES,
  HTTP_STATUS,
  randomIdGenerator,
  systemClock,
} from "../../shared"
import { createPasskeyRepository } from "../repositories/passkey-repository"
import { authEnvSchema } from "../schemas/auth-env-schema"
import type { AuthAppEnv } from "../types/auth-app-env"
import { createAuth } from "./create-auth"
import { createAuthHooks } from "./create-auth-hooks"

// Bindings arrive per request on Workers, so the auth instance is built per request too.
export const authMiddleware: MiddlewareHandler<AuthAppEnv> = async (c, next) => {
  const parsed = authEnvSchema.safeParse(c.env)
  if (!parsed.success) {
    return c.json({ error: ERROR_CODES.invalidEnvironment }, HTTP_STATUS.internalServerError)
  }
  const { db } = c.var
  const auditLog = createAuditLogWriter({
    repository: createAuditLogRepository(db),
    clock: systemClock,
    idGenerator: randomIdGenerator,
  })
  const hooks = createAuthHooks({ auditLog, passkeys: createPasskeyRepository(db) })
  c.set("authEnv", parsed.data)
  c.set("auditLog", auditLog)
  c.set("auth", createAuth({ env: parsed.data, db, hooks }))
  await next()
}

import type { AppVariables, AuditLogWriter } from "../../shared"
import type { Auth } from "../providers/create-auth"
import type { AuthEnv } from "../schemas/auth-env-schema"

export type AuthSession = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>

export type AuthVariables = AppVariables & {
  authEnv: AuthEnv
  auth: Auth
  auditLog: AuditLogWriter
}

export type AuthAppEnv = {
  Bindings: Record<string, unknown>
  Variables: AuthVariables
}

// Every route behind requireSession: the owner's session is always there.
export type SessionAppEnv = {
  Bindings: Record<string, unknown>
  Variables: AuthVariables & { session: AuthSession }
}

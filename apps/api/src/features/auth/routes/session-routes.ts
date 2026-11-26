import { AUDIT_ACTION, REVOKE_ALL_SESSIONS_PATH } from "@workspace/contracts"
import { Hono } from "hono"
import { HTTP_STATUS } from "../../shared"
import { OWNER_ENTITY_TYPE } from "../constants/auth-settings"
import { appendSetCookies } from "../helpers/append-set-cookies"
import type { SessionAppEnv } from "../types/auth-app-env"

export const sessionRoutes = new Hono<SessionAppEnv>().post(REVOKE_ALL_SESSIONS_PATH, async (c) => {
  const requestHeaders = c.req.raw.headers
  await c.var.auth.api.revokeSessions({ headers: requestHeaders })
  // Every session row is gone; signing out also clears this browser's cookies.
  const { headers } = await c.var.auth.api.signOut({ headers: requestHeaders, returnHeaders: true })
  await c.var.auditLog.record({
    action: AUDIT_ACTION.authSessionsRevoked,
    entityType: OWNER_ENTITY_TYPE,
    entityId: c.var.session.user.id,
  })
  appendSetCookies(c, headers)
  return c.json({ revoked: true }, HTTP_STATUS.ok)
})

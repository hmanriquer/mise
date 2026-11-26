import type { MiddlewareHandler } from "hono"
import { ERROR_CODES, HTTP_STATUS } from "../../shared"
import { appendSetCookies } from "../helpers/append-set-cookies"
import type { SessionAppEnv } from "../types/auth-app-env"

export const requireSession: MiddlewareHandler<SessionAppEnv> = async (c, next) => {
  const { headers, response: session } = await c.var.auth.api.getSession({
    headers: c.req.raw.headers,
    returnHeaders: true,
  })
  if (!session) {
    return c.json({ error: ERROR_CODES.unauthorized }, HTTP_STATUS.unauthorized)
  }
  // The sliding refresh renews the cookie; pass it on.
  appendSetCookies(c, headers)
  c.set("session", session)
  await next()
}

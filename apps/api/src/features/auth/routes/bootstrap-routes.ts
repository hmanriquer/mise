import {
  BOOTSTRAP_PATH,
  BOOTSTRAP_TOKEN_HEADER,
  bootstrapRequestSchema,
} from "@workspace/contracts"
import { Hono } from "hono"
import { ERROR_CODES, HTTP_STATUS } from "../../shared"
import { appendSetCookies } from "../helpers/append-set-cookies"
import { bootstrapServiceFrom } from "../providers/bootstrap-service-provider"
import { BOOTSTRAP_OUTCOME } from "../services/bootstrap-service"
import type { AuthAppEnv } from "../types/auth-app-env"

// The token is checked before anything else, so an anonymous caller learns nothing.
export const bootstrapRoutes = new Hono<AuthAppEnv>().post(BOOTSTRAP_PATH, async (c) => {
  const service = await bootstrapServiceFrom(c.var)
  if (!(await service.isAuthorized(c.req.header(BOOTSTRAP_TOKEN_HEADER)))) {
    return c.json({ error: ERROR_CODES.unauthorized }, HTTP_STATUS.unauthorized)
  }
  const request = bootstrapRequestSchema.safeParse(await c.req.json().catch(() => null))
  if (!request.success) {
    return c.json({ error: ERROR_CODES.invalidBody }, HTTP_STATUS.badRequest)
  }
  const result = await service.createOwner(request.data)
  if (result.outcome === BOOTSTRAP_OUTCOME.ownerExists) {
    return c.json({ error: ERROR_CODES.ownerExists }, HTTP_STATUS.gone)
  }
  // Signs the new owner in, so the next step is registering a passkey.
  const { headers } = await c.var.auth.api.signInEmail({
    body: { email: request.data.email, password: request.data.password },
    headers: c.req.raw.headers,
    returnHeaders: true,
  })
  appendSetCookies(c, headers)
  return c.json({ userId: result.userId }, HTTP_STATUS.created)
})

import type { MiddlewareHandler } from "hono"
import { ERROR_CODES } from "../constants/error-codes"
import { HTTP_STATUS } from "../constants/http-status"
import { envSchema } from "../schemas/env-schema"
import type { AppEnv } from "../types/app-env"

export const envMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const parsed = envSchema.safeParse(c.env)
  if (!parsed.success) {
    return c.json({ error: ERROR_CODES.invalidEnvironment }, HTTP_STATUS.internalServerError)
  }
  c.set("env", parsed.data)
  await next()
}

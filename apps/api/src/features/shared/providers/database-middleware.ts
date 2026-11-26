import { createDatabase } from "@workspace/db"
import type { MiddlewareHandler } from "hono"
import { ERROR_CODES } from "../constants/error-codes"
import { HTTP_STATUS } from "../constants/http-status"
import { databaseEnvSchema } from "../schemas/database-env-schema"
import type { AppEnv } from "../types/app-env"

export const databaseMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const parsed = databaseEnvSchema.safeParse(c.env)
  if (!parsed.success) {
    return c.json({ error: ERROR_CODES.invalidEnvironment }, HTTP_STATUS.internalServerError)
  }
  c.set("db", createDatabase(parsed.data.DB))
  await next()
}

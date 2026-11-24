import { HEALTH_PATH, HEALTH_STATUS } from "@workspace/contracts"
import { Hono } from "hono"
import type { AppEnv } from "../../shared"

export const healthRoutes = new Hono<AppEnv>().get(HEALTH_PATH, (c) =>
  c.json({ status: HEALTH_STATUS.ok, version: c.var.env.APP_VERSION }),
)

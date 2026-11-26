import { Hono } from "hono"
import type { AuthAppEnv } from "../types/auth-app-env"

const AUTH_METHODS = ["GET", "POST"]
const ALL_AUTH_ENDPOINTS = "/*"

export const betterAuthRoutes = new Hono<AuthAppEnv>().on(AUTH_METHODS, ALL_AUTH_ENDPOINTS, (c) =>
  c.var.auth.handler(c.req.raw),
)

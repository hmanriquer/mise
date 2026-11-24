import { API_PATH_PREFIX } from "@workspace/contracts"
import { Hono } from "hono"
import { secureHeaders } from "hono/secure-headers"
import { healthRoutes } from "./features/health"
import { type AppEnv, envMiddleware } from "./features/shared"

export const app = new Hono<AppEnv>().basePath(API_PATH_PREFIX)

app.use("*", secureHeaders())
app.use("*", envMiddleware)
app.route("/", healthRoutes)

import {
  API_PATH_PREFIX,
  API_VERSION_PREFIX,
  AUTH_PATH_PREFIX,
  BOOTSTRAP_PATH,
} from "@workspace/contracts"
import { Hono } from "hono"
import { except } from "hono/combine"
import { secureHeaders } from "hono/secure-headers"
import {
  authMiddleware,
  betterAuthRoutes,
  bootstrapRoutes,
  csrfProtection,
  requireSession,
  sessionRoutes,
} from "./features/auth"
import { healthRoutes } from "./features/health"
import {
  API_CONTENT_SECURITY_POLICY,
  type AppEnv,
  databaseMiddleware,
  envMiddleware,
} from "./features/shared"

const ANY_SUBPATH = "/*"
const AUTH_ROUTES = `${AUTH_PATH_PREFIX}${ANY_SUBPATH}`
const V1_ROUTES = `${API_VERSION_PREFIX}${ANY_SUBPATH}`
// The one /v1 route without a session: it creates the first one.
const PUBLIC_V1_PATHS = [`${API_PATH_PREFIX}${API_VERSION_PREFIX}${BOOTSTRAP_PATH}`]

export const app = new Hono<AppEnv>().basePath(API_PATH_PREFIX)

app.use("*", secureHeaders({ contentSecurityPolicy: API_CONTENT_SECURITY_POLICY }))
app.use("*", envMiddleware)
app.use(AUTH_ROUTES, databaseMiddleware, authMiddleware, csrfProtection)
app.use(V1_ROUTES, databaseMiddleware, authMiddleware, csrfProtection)
app.use(V1_ROUTES, except(PUBLIC_V1_PATHS, requireSession))

app.route("/", healthRoutes)
app.route(AUTH_PATH_PREFIX, betterAuthRoutes)
app.route(API_VERSION_PREFIX, bootstrapRoutes)
app.route(API_VERSION_PREFIX, sessionRoutes)

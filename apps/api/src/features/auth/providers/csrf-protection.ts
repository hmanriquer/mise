import type { Context } from "hono"
import { csrf } from "hono/csrf"
import type { AuthAppEnv } from "../types/auth-app-env"

// Same origin only: mise-web forwards /api/* through its Service Binding, so the browser's
// Origin is always AUTH_ORIGIN for a legitimate mutation.
export const csrfProtection = csrf({
  origin: (origin, c: Context<AuthAppEnv>) => origin === c.var.authEnv.AUTH_ORIGIN,
})

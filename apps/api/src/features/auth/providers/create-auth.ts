import { passkey } from "@better-auth/passkey"
import { OWNER_PASSWORD_MAX_LENGTH, OWNER_PASSWORD_MIN_LENGTH } from "@workspace/contracts"
import { type Database, schema } from "@workspace/db"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { AUTH_ENDPOINT } from "../constants/auth-endpoints"
import {
  AUTH_BASE_PATH,
  AUTHENTICATOR_SELECTION,
  CLIENT_IP_HEADER,
  DATABASE_PROVIDER,
  RATE_LIMIT_STORAGE,
  RP_NAME,
  SESSION_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
  SIGN_IN_RATE_LIMIT,
} from "../constants/auth-settings"
import type { AuthEnv } from "../schemas/auth-env-schema"
import type { AuthHooks } from "../types/auth-hooks"

type CreateAuthDependencies = {
  env: AuthEnv
  db: Database
  hooks?: AuthHooks
}

export function createAuth({ env, db, hooks }: CreateAuthDependencies) {
  return betterAuth({
    appName: RP_NAME,
    baseURL: env.AUTH_ORIGIN,
    basePath: AUTH_BASE_PATH,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.AUTH_ORIGIN],
    database: drizzleAdapter(db, { provider: DATABASE_PROVIDER, schema }),
    // Rare fallback and recovery path. scrypt overruns the 10 ms CPU budget, which is accepted;
    // never weaken its parameters to fit.
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: OWNER_PASSWORD_MIN_LENGTH,
      maxPasswordLength: OWNER_PASSWORD_MAX_LENGTH,
    },
    session: {
      expiresIn: SESSION_EXPIRES_IN_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    rateLimit: {
      enabled: true,
      storage: RATE_LIMIT_STORAGE,
      customRules: {
        [AUTH_ENDPOINT.signInEmail]: SIGN_IN_RATE_LIMIT,
        // Read-only and frequent; limiting it would only add two D1 queries per check.
        [AUTH_ENDPOINT.getSession]: false,
      },
    },
    advanced: {
      useSecureCookies: true,
      defaultCookieAttributes: { httpOnly: true, secure: true, sameSite: "lax" },
      ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] },
    },
    telemetry: { enabled: false },
    plugins: [
      passkey({
        rpID: env.AUTH_RP_ID,
        rpName: RP_NAME,
        origin: env.AUTH_ORIGIN,
        authenticatorSelection: AUTHENTICATOR_SELECTION,
      }),
    ],
    hooks,
  })
}

export type Auth = ReturnType<typeof createAuth>

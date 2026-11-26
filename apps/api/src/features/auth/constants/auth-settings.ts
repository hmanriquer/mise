import { API_PATH_PREFIX, AUTH_PATH_PREFIX } from "@workspace/contracts"

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_DAY = 24 * 60 * SECONDS_PER_MINUTE
const SESSION_LIFETIME_DAYS = 30
const SIGN_IN_WINDOW_MINUTES = 15

export const AUTH_BASE_PATH = `${API_PATH_PREFIX}${AUTH_PATH_PREFIX}`
export const RP_NAME = "Mise"
export const OWNER_ENTITY_TYPE = "user"
export const PASSKEY_ENTITY_TYPE = "passkey"

export const SESSION_EXPIRES_IN_SECONDS = SESSION_LIFETIME_DAYS * SECONDS_PER_DAY
// Sliding refresh: a session used after a day gets a new 30-day expiry.
export const SESSION_UPDATE_AGE_SECONDS = SECONDS_PER_DAY

export const SIGN_IN_RATE_LIMIT = {
  window: SIGN_IN_WINDOW_MINUTES * SECONDS_PER_MINUTE,
  max: 5,
} as const

// Cloudflare sets it at the edge, and mise-api is reachable only through mise-web's binding.
export const CLIENT_IP_HEADER = "cf-connecting-ip"
export const RATE_LIMIT_STORAGE = "database"
export const DATABASE_PROVIDER = "sqlite"

export const AUTHENTICATOR_SELECTION = {
  residentKey: "required",
  userVerification: "required",
} as const

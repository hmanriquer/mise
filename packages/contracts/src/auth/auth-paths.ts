// Better Auth serves its own endpoints under `${API_PATH_PREFIX}${AUTH_PATH_PREFIX}`.
export const AUTH_PATH_PREFIX = "/auth"
// Mise's own auth routes, under `${API_PATH_PREFIX}${API_VERSION_PREFIX}`.
export const BOOTSTRAP_PATH = "/bootstrap"
export const REVOKE_ALL_SESSIONS_PATH = "/auth/revoke-all"
export const BOOTSTRAP_TOKEN_HEADER = "X-Bootstrap-Token"

export const API_PATH_PREFIX = "/api"
export const API_VERSION_PREFIX = "/v1"

const PATH_SEPARATOR = "/"

export function isApiPath(pathname: string): boolean {
  return pathname === API_PATH_PREFIX || pathname.startsWith(`${API_PATH_PREFIX}${PATH_SEPARATOR}`)
}

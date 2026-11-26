import { SELF } from "cloudflare:test"
import { env } from "cloudflare:workers"
import { BOOTSTRAP_TOKEN_HEADER } from "@workspace/contracts"

export const AUTH_URL = "/api/auth"
export const BOOTSTRAP_URL = "/api/v1/bootstrap"
export const REVOKE_ALL_URL = "/api/v1/auth/revoke-all"
export const OWNER = {
  email: "dueno@reinadeespadas.mx",
  name: "Dueño",
  password: "una-clave-de-recuperacion",
} as const

const JSON_TYPE = "application/json"
const CLIENT_IP_HEADER = "cf-connecting-ip"
const DEFAULT_CLIENT_IP = "203.0.113.10"
const COOKIE_PAIR_SEPARATOR = "; "
const EXPIRED_MAX_AGE = "max-age=0"

type RequestOptions = { method?: string; body?: unknown; headers?: Record<string, string> }

// One browser: keeps cookies across requests and always sends the app's own Origin.
export function createOwnerClient(clientIp = DEFAULT_CLIENT_IP) {
  const cookies = new Map<string, string>()

  function storeCookies(response: Response): void {
    for (const header of response.headers.getSetCookie()) {
      const [pair = ""] = header.split(";")
      const separator = pair.indexOf("=")
      const name = pair.slice(0, separator)
      const value = pair.slice(separator + 1)
      const expired = value === "" || header.toLowerCase().includes(EXPIRED_MAX_AGE)
      expired ? cookies.delete(name) : cookies.set(name, value)
    }
  }

  async function request(path: string, options: RequestOptions = {}): Promise<Response> {
    const headers: Record<string, string> = {
      origin: env.AUTH_ORIGIN,
      [CLIENT_IP_HEADER]: clientIp,
      ...options.headers,
    }
    if (cookies.size > 0) {
      headers.cookie = [...cookies]
        .map(([name, value]) => `${name}=${value}`)
        .join(COOKIE_PAIR_SEPARATOR)
    }
    if (options.body !== undefined) {
      headers["content-type"] = JSON_TYPE
    }
    const response = await SELF.fetch(`${env.AUTH_ORIGIN}${path}`, {
      method: options.method ?? (options.body === undefined ? "GET" : "POST"),
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
    storeCookies(response)
    return response
  }

  return {
    request,
    hasCookies: () => cookies.size > 0,
    clearCookies: () => cookies.clear(),

    bootstrap(token: string = env.OWNER_BOOTSTRAP_TOKEN, body: unknown = OWNER) {
      return request(BOOTSTRAP_URL, { body, headers: { [BOOTSTRAP_TOKEN_HEADER]: token } })
    },

    signInWithPassword(password: string = OWNER.password) {
      return request(`${AUTH_URL}/sign-in/email`, { body: { email: OWNER.email, password } })
    },

    async session(): Promise<{ user: { id: string } } | null> {
      const response = await request(`${AUTH_URL}/get-session`)
      return response.json()
    },
  }
}

export type OwnerClient = ReturnType<typeof createOwnerClient>

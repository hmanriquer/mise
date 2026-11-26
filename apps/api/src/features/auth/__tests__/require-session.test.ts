import { Hono } from "hono"
import { describe, expect, it } from "vitest"
import { ERROR_CODES } from "../../shared"
import { requireSession } from "../providers/require-session"
import type { SessionAppEnv } from "../types/auth-app-env"

const PROTECTED_PATH = "/protected"
const REFRESHED_COOKIE = "__Secure-better-auth.session_token=renewed; Path=/; HttpOnly"
const SESSION = { user: { id: "owner" }, session: { id: "session-1" } }

type GetSessionResult = { headers: Headers; response: typeof SESSION | null }

function appWith(getSessionResult: GetSessionResult) {
  const fakeAuth = { api: { getSession: async () => getSessionResult } }
  return new Hono<SessionAppEnv>()
    .use("*", async (c, next) => {
      c.set("auth", fakeAuth as unknown as SessionAppEnv["Variables"]["auth"])
      await next()
    })
    .use("*", requireSession)
    .get(PROTECTED_PATH, (c) => c.json({ userId: c.var.session.user.id }))
}

describe("requireSession", () => {
  it("returns 401 and never reaches the route without a session", async () => {
    const response = await appWith({ headers: new Headers(), response: null }).request(
      PROTECTED_PATH,
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: ERROR_CODES.unauthorized })
  })

  it("passes the session to the route", async () => {
    const response = await appWith({ headers: new Headers(), response: SESSION }).request(
      PROTECTED_PATH,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ userId: "owner" })
  })

  it("forwards the sliding-refresh cookie", async () => {
    const headers = new Headers([["set-cookie", REFRESHED_COOKIE]])

    const response = await appWith({ headers, response: SESSION }).request(PROTECTED_PATH)

    expect(response.headers.getSetCookie()).toEqual([REFRESHED_COOKIE])
  })
})

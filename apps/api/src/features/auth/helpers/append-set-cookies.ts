import type { Context } from "hono"

const SET_COOKIE_HEADER = "set-cookie"

export function appendSetCookies(c: Context, source: Headers): void {
  for (const cookie of source.getSetCookie()) {
    c.header(SET_COOKIE_HEADER, cookie, { append: true })
  }
}

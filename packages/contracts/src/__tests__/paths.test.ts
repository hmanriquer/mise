import { describe, expect, it } from "vitest"
import { isApiPath } from "../api/paths"

describe("isApiPath", () => {
  it.each(["/api", "/api/health", "/api/v1/x"])("treats %s as an API path", (pathname) => {
    expect(isApiPath(pathname)).toBe(true)
  })

  it.each(["/apiary", "/api-docs", "/", "/vender"])("keeps %s out of the API", (pathname) => {
    expect(isApiPath(pathname)).toBe(false)
  })
})

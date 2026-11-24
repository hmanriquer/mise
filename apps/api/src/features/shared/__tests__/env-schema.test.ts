import { describe, expect, it } from "vitest"
import { envSchema } from "../schemas/env-schema"

describe("envSchema", () => {
  it("accepts a non-empty APP_VERSION", () => {
    expect(envSchema.parse({ APP_VERSION: "abc1234" })).toEqual({ APP_VERSION: "abc1234" })
  })

  it("rejects a missing APP_VERSION", () => {
    expect(() => envSchema.parse({})).toThrow()
  })

  it("rejects an empty APP_VERSION", () => {
    expect(() => envSchema.parse({ APP_VERSION: "" })).toThrow()
  })

  it("rejects a whitespace-only APP_VERSION", () => {
    expect(() => envSchema.parse({ APP_VERSION: "   " })).toThrow()
  })
})

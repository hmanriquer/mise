import { describe, expect, it } from "vitest"
import { healthResponseSchema } from "../health/health-schema"

describe("healthResponseSchema", () => {
  it("accepts an ok status with a version", () => {
    const body = { status: "ok", version: "abc1234" }

    expect(healthResponseSchema.parse(body)).toEqual(body)
  })

  it("rejects any status other than ok", () => {
    expect(() => healthResponseSchema.parse({ status: "down", version: "x" })).toThrow()
  })

  it("rejects an empty version", () => {
    expect(() => healthResponseSchema.parse({ status: "ok", version: "" })).toThrow()
  })

  it("rejects a response without a version", () => {
    expect(() => healthResponseSchema.parse({ status: "ok" })).toThrow()
  })
})

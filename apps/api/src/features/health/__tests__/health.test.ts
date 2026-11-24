import { SELF } from "cloudflare:test"
import { HEALTH_STATUS, healthResponseSchema } from "@workspace/contracts"
import { describe, expect, it } from "vitest"

const ORIGIN = "http://mise.test"
const HEALTH_URL = `${ORIGIN}/api/health`
const UNKNOWN_URL = `${ORIGIN}/api/nope`
const CONFIGURED_VERSION = "dev"
const NOSNIFF = "nosniff"

describe("GET /api/health", () => {
  it("reports ok with the configured version through the real Worker", async () => {
    const response = await SELF.fetch(HEALTH_URL)

    expect(response.status).toBe(200)
    expect(healthResponseSchema.parse(await response.json())).toEqual({
      status: HEALTH_STATUS.ok,
      version: CONFIGURED_VERSION,
    })
  })

  it("sends secure headers", async () => {
    const response = await SELF.fetch(HEALTH_URL)

    expect(response.headers.get("x-content-type-options")).toBe(NOSNIFF)
  })

  it("returns 404 for an unknown API path", async () => {
    const response = await SELF.fetch(UNKNOWN_URL)

    expect(response.status).toBe(404)
  })
})

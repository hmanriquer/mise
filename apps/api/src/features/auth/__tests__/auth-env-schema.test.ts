import { describe, expect, it } from "vitest"
import { authEnvSchema } from "../schemas/auth-env-schema"

const SECRET = "s".repeat(32)
const VALID_ENV = {
  AUTH_RP_ID: "mise-web.example.workers.dev",
  AUTH_ORIGIN: "https://mise-web.example.workers.dev",
  BETTER_AUTH_SECRET: SECRET,
}

describe("authEnvSchema", () => {
  it("accepts an origin whose host is the rpID, with or without a bootstrap token", () => {
    expect(authEnvSchema.safeParse(VALID_ENV).success).toBe(true)
    expect(authEnvSchema.safeParse({ ...VALID_ENV, OWNER_BOOTSTRAP_TOKEN: SECRET }).success).toBe(
      true,
    )
  })

  it("accepts an rpID that is a parent domain of the origin", () => {
    const env = { ...VALID_ENV, AUTH_RP_ID: "espadas.lat", AUTH_ORIGIN: "https://pos.espadas.lat" }

    expect(authEnvSchema.safeParse(env).success).toBe(true)
  })

  it("accepts localhost for local dev", () => {
    const env = { ...VALID_ENV, AUTH_RP_ID: "localhost", AUTH_ORIGIN: "http://localhost:3000" }

    expect(authEnvSchema.safeParse(env).success).toBe(true)
  })

  it.each([
    ["an rpID that does not cover the origin", { AUTH_RP_ID: "espadas.lat" }],
    ["an origin with a path", { AUTH_ORIGIN: "https://mise-web.example.workers.dev/app" }],
    ["a short secret", { BETTER_AUTH_SECRET: "short" }],
    ["a short bootstrap token", { OWNER_BOOTSTRAP_TOKEN: "short" }],
    ["a missing secret", { BETTER_AUTH_SECRET: undefined }],
  ])("rejects %s", (_label, overrides) => {
    expect(authEnvSchema.safeParse({ ...VALID_ENV, ...overrides }).success).toBe(false)
  })
})

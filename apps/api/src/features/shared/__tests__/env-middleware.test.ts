import { describe, expect, it } from "vitest"
import { app } from "../../../app"
import { ERROR_CODES } from "../constants/error-codes"

const HEALTH_URL = "/api/health"
const SECRET_LIKE_VALUE = "s3cr3t"

describe("envMiddleware", () => {
  it("fails with a 500 and the error code when the environment is empty", async () => {
    const response = await app.request(HEALTH_URL, {}, {})

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: ERROR_CODES.invalidEnvironment })
  })

  it("never echoes environment values in the failure response", async () => {
    const response = await app.request(
      HEALTH_URL,
      {},
      { APP_VERSION: "", SECRET_LIKE: SECRET_LIKE_VALUE },
    )

    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain(SECRET_LIKE_VALUE)
  })
})

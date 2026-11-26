import { describe, expect, it } from "vitest"
import { isSameSecret } from "../helpers/is-same-secret"

describe("isSameSecret", () => {
  it("matches identical secrets", async () => {
    expect(await isSameSecret("token-abc", "token-abc")).toBe(true)
  })

  it("rejects a different secret of the same length", async () => {
    expect(await isSameSecret("token-abc", "token-abd")).toBe(false)
  })

  it("rejects a prefix without throwing on the length difference", async () => {
    expect(await isSameSecret("token", "token-abc")).toBe(false)
  })
})

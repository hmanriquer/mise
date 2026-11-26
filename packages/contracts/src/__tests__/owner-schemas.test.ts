import { describe, expect, it } from "vitest"
import {
  bootstrapRequestSchema,
  deletePasskeyRequestSchema,
  OWNER_PASSWORD_MAX_LENGTH,
  OWNER_PASSWORD_MIN_LENGTH,
} from "../auth/owner-schemas"

const VALID_BOOTSTRAP = {
  email: "dueno@reinadeespadas.mx",
  name: "Dueño",
  password: "x".repeat(OWNER_PASSWORD_MIN_LENGTH),
}

describe("bootstrapRequestSchema", () => {
  it("accepts an email, a name and a 12-character password", () => {
    expect(bootstrapRequestSchema.parse(VALID_BOOTSTRAP)).toEqual(VALID_BOOTSTRAP)
  })

  it("rejects a password shorter than 12 characters", () => {
    const body = { ...VALID_BOOTSTRAP, password: "x".repeat(OWNER_PASSWORD_MIN_LENGTH - 1) }

    expect(bootstrapRequestSchema.safeParse(body).success).toBe(false)
  })

  it("rejects a password longer than the hashing limit", () => {
    const body = { ...VALID_BOOTSTRAP, password: "x".repeat(OWNER_PASSWORD_MAX_LENGTH + 1) }

    expect(bootstrapRequestSchema.safeParse(body).success).toBe(false)
  })

  it("rejects an invalid email", () => {
    expect(bootstrapRequestSchema.safeParse({ ...VALID_BOOTSTRAP, email: "dueno" }).success).toBe(
      false,
    )
  })

  it("rejects a blank name", () => {
    expect(bootstrapRequestSchema.safeParse({ ...VALID_BOOTSTRAP, name: "   " }).success).toBe(
      false,
    )
  })
})

describe("deletePasskeyRequestSchema", () => {
  it("accepts an id with an optional last-passkey confirmation", () => {
    expect(deletePasskeyRequestSchema.parse({ id: "pk", confirmLastPasskey: true })).toEqual({
      id: "pk",
      confirmLastPasskey: true,
    })
    expect(deletePasskeyRequestSchema.parse({ id: "pk" })).toEqual({ id: "pk" })
  })

  it("rejects a non-boolean confirmation", () => {
    expect(
      deletePasskeyRequestSchema.safeParse({ id: "pk", confirmLastPasskey: "yes" }).success,
    ).toBe(false)
  })
})

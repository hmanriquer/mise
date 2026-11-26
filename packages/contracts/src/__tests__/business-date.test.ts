import { describe, expect, it } from "vitest"
import { businessDateSchema, toBusinessDate } from "../time/business-date"

const LAST_MS_OF_NOV_20_LOCAL = Date.parse("2026-11-21T05:59:59.999Z")
const FIRST_MS_OF_NOV_21_LOCAL = Date.parse("2026-11-21T06:00:00.000Z")
const UTC_MIDNIGHT_NOV_21 = Date.parse("2026-11-21T00:00:00.000Z")
// Mexico City dropped daylight saving time in 2022, so summer stays at UTC-6 too.
const LAST_MS_OF_JUL_15_LOCAL = Date.parse("2026-07-16T05:59:59.999Z")
const FIRST_MS_OF_JUL_16_LOCAL = Date.parse("2026-07-16T06:00:00.000Z")
const FIRST_MS_OF_2027_LOCAL = Date.parse("2027-01-01T06:00:00.000Z")

describe("toBusinessDate", () => {
  it("keeps 23:59:59.999 in Mexico City on the same day", () => {
    expect(toBusinessDate(LAST_MS_OF_NOV_20_LOCAL)).toBe("2026-11-20")
  })

  it("moves a sale at local midnight to the new day", () => {
    expect(toBusinessDate(FIRST_MS_OF_NOV_21_LOCAL)).toBe("2026-11-21")
  })

  it("uses Mexico City time, not UTC", () => {
    expect(toBusinessDate(UTC_MIDNIGHT_NOV_21)).toBe("2026-11-20")
  })

  it("stays at UTC-6 in summer", () => {
    expect(toBusinessDate(LAST_MS_OF_JUL_15_LOCAL)).toBe("2026-07-15")
    expect(toBusinessDate(FIRST_MS_OF_JUL_16_LOCAL)).toBe("2026-07-16")
  })

  it("rolls the year over at local midnight", () => {
    expect(toBusinessDate(FIRST_MS_OF_2027_LOCAL - 1)).toBe("2026-12-31")
    expect(toBusinessDate(FIRST_MS_OF_2027_LOCAL)).toBe("2027-01-01")
  })

  it("returns a value the business date schema accepts", () => {
    expect(businessDateSchema.parse(toBusinessDate(FIRST_MS_OF_NOV_21_LOCAL))).toBe("2026-11-21")
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY])("rejects %s", (epochMs) => {
    expect(() => toBusinessDate(epochMs)).toThrow(RangeError)
  })
})

describe("businessDateSchema", () => {
  it.each(["2026-11-2", "20261120", "2026/11/20", "2026-11-20T00:00"])("rejects %s", (value) => {
    expect(businessDateSchema.safeParse(value).success).toBe(false)
  })
})

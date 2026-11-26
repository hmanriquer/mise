import { describe, expect, it } from "vitest"
import { centsSchema, formatMxn, toCents } from "../money/money"

describe("formatMxn", () => {
  it.each([
    [0, "$0.00"],
    [1500, "$15.00"],
    [8500, "$85.00"],
    [5, "$0.05"],
    [123456, "$1,234.56"],
    [875000, "$8,750.00"],
    [-1500, "-$15.00"],
  ])("formats %i cents as %s", (cents, expected) => {
    expect(formatMxn(cents)).toBe(expected)
  })

  it.each([12.5, Number.NaN, Number.MAX_SAFE_INTEGER + 2])(
    "rejects %s as non-integer cents",
    (cents) => {
      expect(() => formatMxn(cents)).toThrow(RangeError)
    },
  )
})

describe("toCents", () => {
  it.each([
    [15, 1500],
    [55, 5500],
    [0.1 + 0.2, 30],
    [19.99, 1999],
    [1.005, 101],
    [0, 0],
  ])("converts %d pesos to %i cents", (pesos, expected) => {
    expect(toCents(pesos)).toBe(expected)
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY])("rejects %s", (pesos) => {
    expect(() => toCents(pesos)).toThrow(RangeError)
  })
})

describe("centsSchema", () => {
  it.each([-1, 1.5])("rejects %d", (value) => {
    expect(centsSchema.safeParse(value).success).toBe(false)
  })
})

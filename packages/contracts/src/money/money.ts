import { z } from "zod"

export const CENTS_PER_PESO = 100
export const MONEY_LOCALE = "es-MX"
export const MONEY_CURRENCY = "MXN"
// Rounding to 15 significant digits first drops float noise such as 1.005 * 100 = 100.49999…
const FLOAT_SAFE_PRECISION = 15

const mxnFormatter = new Intl.NumberFormat(MONEY_LOCALE, {
  style: "currency",
  currency: MONEY_CURRENCY,
})

export const centsSchema = z.number().int().nonnegative()

export function toCents(pesos: number): number {
  if (!Number.isFinite(pesos)) {
    throw new RangeError(`Cannot convert ${pesos} pesos to cents`)
  }
  return Math.round(Number((pesos * CENTS_PER_PESO).toPrecision(FLOAT_SAFE_PRECISION)))
}

export function formatMxn(cents: number): string {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError(`Money must be integer cents, got ${cents}`)
  }
  return mxnFormatter.format(cents / CENTS_PER_PESO)
}

import { z } from "zod"
import type { EnumValue } from "./enum-values"

// The server accepts these orders and flags them instead of rejecting them.
export const ORDER_FLAG = {
  priceDrift: "price_drift",
  clockSkew: "clock_skew",
} as const

export const orderFlagSchema = z.enum(ORDER_FLAG)

export type OrderFlag = EnumValue<typeof ORDER_FLAG>

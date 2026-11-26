import { z } from "zod"
import type { EnumValue } from "./enum-values"

export const COST_SOURCE = {
  manual: "manual",
  suggested: "suggested",
} as const

export const costSourceSchema = z.enum(COST_SOURCE)

export type CostSource = EnumValue<typeof COST_SOURCE>

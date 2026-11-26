import { z } from "zod"
import type { EnumValue } from "./enum-values"

export const CHANNEL = {
  counter: "counter",
  didiFood: "didi_food",
} as const

export const channelSchema = z.enum(CHANNEL)

export type Channel = EnumValue<typeof CHANNEL>

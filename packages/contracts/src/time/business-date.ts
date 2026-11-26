import { z } from "zod"

export const BUSINESS_TIME_ZONE = "America/Mexico_City"

const BUSINESS_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// en-CA formats dates as YYYY-MM-DD, which is the business date format.
const businessDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export const businessDateSchema = z.string().regex(BUSINESS_DATE_PATTERN)

export type BusinessDate = z.infer<typeof businessDateSchema>

// There is no business-day cutoff: a sale after midnight belongs to the new day.
export function toBusinessDate(epochMs: number): BusinessDate {
  if (!Number.isFinite(epochMs)) {
    throw new RangeError(`Invalid epoch ms: ${epochMs}`)
  }
  return businessDateFormatter.format(epochMs)
}

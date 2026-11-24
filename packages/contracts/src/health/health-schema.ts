import { z } from "zod"

export const HEALTH_PATH = "/health"

export const HEALTH_STATUS = { ok: "ok" } as const

export const healthResponseSchema = z.object({
  status: z.literal(HEALTH_STATUS.ok),
  version: z.string().min(1),
})

export type HealthResponse = z.infer<typeof healthResponseSchema>

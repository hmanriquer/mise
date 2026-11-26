import { z } from "zod"

const D1_PREPARE_METHOD = "prepare"

function isD1Database(value: unknown): value is D1Database {
  return typeof value === "object" && value !== null && D1_PREPARE_METHOD in value
}

export const databaseEnvSchema = z.object({
  DB: z.custom<D1Database>(isD1Database),
})

import { z } from "zod"

const MIN_APP_VERSION_LENGTH = 1

export const envSchema = z.object({
  APP_VERSION: z.string().trim().min(MIN_APP_VERSION_LENGTH),
})

export type Env = z.infer<typeof envSchema>

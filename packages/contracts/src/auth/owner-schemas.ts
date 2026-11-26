import { z } from "zod"

export const OWNER_PASSWORD_MIN_LENGTH = 12
// Better Auth's own maximum; longer input only burns hashing CPU.
export const OWNER_PASSWORD_MAX_LENGTH = 128
const MIN_NAME_LENGTH = 1

export const bootstrapRequestSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(MIN_NAME_LENGTH),
  password: z.string().min(OWNER_PASSWORD_MIN_LENGTH).max(OWNER_PASSWORD_MAX_LENGTH),
})

export type BootstrapRequest = z.infer<typeof bootstrapRequestSchema>

// Deleting the last passkey leaves only the password fallback, so the client must say so.
export const LAST_PASSKEY_CONFIRMATION_FIELD = "confirmLastPasskey"

export const deletePasskeyRequestSchema = z.object({
  id: z.string().min(1),
  [LAST_PASSKEY_CONFIRMATION_FIELD]: z.boolean().optional(),
})

export type DeletePasskeyRequest = z.infer<typeof deletePasskeyRequestSchema>

import { z } from "zod"

// Better Auth needs at least 32 characters of secret; the bootstrap token gets the same bar.
const MIN_SECRET_LENGTH = 32
const MIN_RP_ID_LENGTH = 1

function isBareOrigin(value: string): boolean {
  return new URL(value).origin === value
}

// The rpID must be the origin's host or a registrable suffix of it, or WebAuthn refuses it.
function rpIdCoversOrigin(env: { AUTH_RP_ID: string; AUTH_ORIGIN: string }): boolean {
  const { hostname } = new URL(env.AUTH_ORIGIN)
  return hostname === env.AUTH_RP_ID || hostname.endsWith(`.${env.AUTH_RP_ID}`)
}

export const authEnvSchema = z
  .object({
    AUTH_RP_ID: z.string().trim().min(MIN_RP_ID_LENGTH),
    AUTH_ORIGIN: z.url().refine(isBareOrigin),
    BETTER_AUTH_SECRET: z.string().min(MIN_SECRET_LENGTH),
    // Deleted after the owner exists (runbook); bootstrap then always answers 401.
    OWNER_BOOTSTRAP_TOKEN: z.string().min(MIN_SECRET_LENGTH).optional(),
  })
  .refine(rpIdCoversOrigin)

export type AuthEnv = z.infer<typeof authEnvSchema>

import type { EnumValue } from "@workspace/contracts"

export const SIGN_IN_METHOD = { passkey: "passkey", password: "password" } as const
export type SignInMethod = EnumValue<typeof SIGN_IN_METHOD>

export const AUTH_OUTCOME = { success: "success", failure: "failure" } as const
export type AuthOutcome = EnumValue<typeof AUTH_OUTCOME>

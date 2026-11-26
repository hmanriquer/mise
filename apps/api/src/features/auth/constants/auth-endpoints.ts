// Better Auth endpoint paths, relative to AUTH_BASE_PATH, as hooks and rate limits see them.
export const AUTH_ENDPOINT = {
  signInEmail: "/sign-in/email",
  signUpEmail: "/sign-up/email",
  getSession: "/get-session",
  changePassword: "/change-password",
  passkeySignIn: "/passkey/verify-authentication",
  passkeyRegister: "/passkey/verify-registration",
  passkeyRename: "/passkey/update-passkey",
  passkeyDelete: "/passkey/delete-passkey",
} as const

export const CREDENTIAL_PROVIDER_ID = "credential"

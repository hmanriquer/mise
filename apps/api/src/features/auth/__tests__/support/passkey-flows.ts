import { AUTH_URL, type OwnerClient } from "./owner-client"
import type { AssertionOverrides, SoftwareAuthenticator } from "./software-authenticator"

type ChallengeOptions = { challenge: string }

export async function registerPasskey(
  client: OwnerClient,
  authenticator: SoftwareAuthenticator,
  name: string,
  overrides: AssertionOverrides = {},
): Promise<Response> {
  const options = await client.request(`${AUTH_URL}/passkey/generate-register-options`)
  const response = await authenticator.register(
    (await options.json()) as ChallengeOptions,
    overrides,
  )
  return client.request(`${AUTH_URL}/passkey/verify-registration`, { body: { response, name } })
}

export async function signInWithPasskey(
  client: OwnerClient,
  authenticator: SoftwareAuthenticator,
  overrides: AssertionOverrides = {},
): Promise<Response> {
  const options = await client.request(`${AUTH_URL}/passkey/generate-authenticate-options`)
  const response = await authenticator.authenticate(
    (await options.json()) as ChallengeOptions,
    overrides,
  )
  return client.request(`${AUTH_URL}/passkey/verify-authentication`, { body: { response } })
}

export async function listPasskeys(client: OwnerClient): Promise<{ id: string; name: string }[]> {
  const response = await client.request(`${AUTH_URL}/passkey/list-user-passkeys`)
  return response.json()
}

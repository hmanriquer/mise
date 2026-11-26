import { env } from "cloudflare:workers"
import { createOwnerClient, type OwnerClient } from "./owner-client"
import { registerPasskey } from "./passkey-flows"
import { createSoftwareAuthenticator, type SoftwareAuthenticator } from "./software-authenticator"

export function newAuthenticator(): Promise<SoftwareAuthenticator> {
  return createSoftwareAuthenticator({ origin: env.AUTH_ORIGIN, rpId: env.AUTH_RP_ID })
}

// The owner after bootstrap, with one passkey registered and a fresh signed-out browser.
export async function ownerWithPasskey(): Promise<{
  authenticator: SoftwareAuthenticator
  browser: OwnerClient
}> {
  const setup = createOwnerClient()
  await setup.bootstrap()
  const authenticator = await newAuthenticator()
  const registration = await registerPasskey(setup, authenticator, "Tableta")
  if (!registration.ok) {
    throw new Error(`Passkey registration failed: ${registration.status}`)
  }
  return { authenticator, browser: createOwnerClient() }
}

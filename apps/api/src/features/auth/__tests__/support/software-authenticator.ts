import {
  type CborKey,
  type CborValue,
  concatBytes,
  encodeCbor,
  rawEcdsaToDer,
  sha256,
  toBase64Url,
} from "./webauthn-encoding"

const FLAG_USER_PRESENT = 0x01
const FLAG_USER_VERIFIED = 0x04
const FLAG_ATTESTED_CREDENTIAL = 0x40
const CREDENTIAL_ID_BYTES = 16
const AAGUID = new Uint8Array(16)
const COUNTER_BYTES = 4
const COSE_KEY_TYPE_EC2 = 2
const COSE_ALG_ES256 = -7
const COSE_CURVE_P256 = 1
const P256_COORDINATE_BYTES = 32
const EC_KEY = { name: "ECDSA", namedCurve: "P-256" } as const
const ES256 = { name: "ECDSA", hash: "SHA-256" } as const
const PUBLIC_KEY_TYPE = "public-key"

type Ceremony = "webauthn.create" | "webauthn.get"

// Lets a test forge what a hostile or misconfigured client would send.
export type AssertionOverrides = { origin?: string; rpId?: string; userVerified?: boolean }

type ChallengeOptions = { challenge: string }

export async function createSoftwareAuthenticator(defaults: { origin: string; rpId: string }) {
  const keys = (await crypto.subtle.generateKey(EC_KEY, false, ["sign", "verify"])) as CryptoKeyPair
  const credentialId = crypto.getRandomValues(new Uint8Array(CREDENTIAL_ID_BYTES))
  const encodedCredentialId = toBase64Url(credentialId)
  let counter = 0

  async function authenticatorData(
    rpId: string,
    flags: number,
    attested: Uint8Array = new Uint8Array(),
  ) {
    const counterBytes = new Uint8Array(COUNTER_BYTES)
    new DataView(counterBytes.buffer).setUint32(0, counter)
    const rpIdHash = await sha256(new TextEncoder().encode(rpId))
    return concatBytes(rpIdHash, Uint8Array.of(flags), counterBytes, attested)
  }

  function clientData(type: Ceremony, challenge: string, origin: string): Uint8Array {
    const json = JSON.stringify({ type, challenge, origin, crossOrigin: false })
    return new TextEncoder().encode(json)
  }

  function flagsFor(overrides: AssertionOverrides): number {
    const userVerified = overrides.userVerified ?? true
    return FLAG_USER_PRESENT | (userVerified ? FLAG_USER_VERIFIED : 0)
  }

  async function coseKey(): Promise<Uint8Array> {
    const raw = new Uint8Array(
      (await crypto.subtle.exportKey("raw", keys.publicKey)) as ArrayBuffer,
    )
    const x = raw.slice(1, 1 + P256_COORDINATE_BYTES)
    const y = raw.slice(1 + P256_COORDINATE_BYTES)
    return encodeCbor(
      new Map<CborKey, CborValue>([
        [1, COSE_KEY_TYPE_EC2],
        [3, COSE_ALG_ES256],
        [-1, COSE_CURVE_P256],
        [-2, x],
        [-3, y],
      ]),
    )
  }

  return {
    credentialId: encodedCredentialId,

    async register(options: ChallengeOptions, overrides: AssertionOverrides = {}) {
      const idLength = Uint8Array.of(credentialId.length >> 8, credentialId.length & 0xff)
      const attested = concatBytes(AAGUID, idLength, credentialId, await coseKey())
      const flags = flagsFor(overrides) | FLAG_ATTESTED_CREDENTIAL
      const authData = await authenticatorData(overrides.rpId ?? defaults.rpId, flags, attested)
      const attestationObject = encodeCbor(
        new Map<CborKey, CborValue>([
          ["fmt", "none"],
          ["attStmt", new Map()],
          ["authData", authData],
        ]),
      )
      const origin = overrides.origin ?? defaults.origin
      return {
        id: encodedCredentialId,
        rawId: encodedCredentialId,
        type: PUBLIC_KEY_TYPE,
        response: {
          clientDataJSON: toBase64Url(clientData("webauthn.create", options.challenge, origin)),
          attestationObject: toBase64Url(attestationObject),
          transports: ["internal"],
        },
        clientExtensionResults: {},
      }
    },

    async authenticate(options: ChallengeOptions, overrides: AssertionOverrides = {}) {
      counter += 1
      const authData = await authenticatorData(overrides.rpId ?? defaults.rpId, flagsFor(overrides))
      const origin = overrides.origin ?? defaults.origin
      const clientDataJSON = clientData("webauthn.get", options.challenge, origin)
      const signed = concatBytes(authData, await sha256(clientDataJSON))
      const signature = new Uint8Array(await crypto.subtle.sign(ES256, keys.privateKey, signed))
      return {
        id: encodedCredentialId,
        rawId: encodedCredentialId,
        type: PUBLIC_KEY_TYPE,
        response: {
          clientDataJSON: toBase64Url(clientDataJSON),
          authenticatorData: toBase64Url(authData),
          signature: toBase64Url(rawEcdsaToDer(signature)),
        },
        clientExtensionResults: {},
      }
    },
  }
}

export type SoftwareAuthenticator = Awaited<ReturnType<typeof createSoftwareAuthenticator>>

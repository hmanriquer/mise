// Just enough CBOR, DER and base64url for a software authenticator in tests.
export type CborKey = number | string
export type CborValue = number | string | Uint8Array | ReadonlyMap<CborKey, CborValue>

const MAJOR_UNSIGNED = 0
const MAJOR_NEGATIVE = 1
const MAJOR_BYTES = 2
const MAJOR_TEXT = 3
const MAJOR_MAP = 5
const ONE_BYTE_LENGTH = 24
const TWO_BYTE_LENGTH = 25
const BYTE_LIMIT = 256
const TWO_BYTE_LIMIT = 65536
const MAJOR_SHIFT = 5

export function concatBytes(...parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0))
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

function cborHeader(major: number, length: number): Uint8Array<ArrayBuffer> {
  const prefix = major << MAJOR_SHIFT
  if (length < ONE_BYTE_LENGTH) return Uint8Array.of(prefix | length)
  if (length < BYTE_LIMIT) return Uint8Array.of(prefix | ONE_BYTE_LENGTH, length)
  if (length < TWO_BYTE_LIMIT) {
    return Uint8Array.of(prefix | TWO_BYTE_LENGTH, length >> 8, length & 0xff)
  }
  throw new Error(`CBOR length too large for tests: ${length}`)
}

export function encodeCbor(value: CborValue): Uint8Array<ArrayBuffer> {
  if (typeof value === "number") {
    return value >= 0 ? cborHeader(MAJOR_UNSIGNED, value) : cborHeader(MAJOR_NEGATIVE, -1 - value)
  }
  if (typeof value === "string") {
    const bytes = new TextEncoder().encode(value)
    return concatBytes(cborHeader(MAJOR_TEXT, bytes.length), bytes)
  }
  if (value instanceof Uint8Array) {
    return concatBytes(cborHeader(MAJOR_BYTES, value.length), value)
  }
  const entries = [...value.entries()].flatMap(([key, item]) => [encodeCbor(key), encodeCbor(item)])
  return concatBytes(cborHeader(MAJOR_MAP, value.size), ...entries)
}

export function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")
}

export function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replaceAll("-", "+").replaceAll("_", "/")
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

const DER_SEQUENCE = 0x30
const DER_INTEGER = 0x02
const HIGH_BIT = 0x80

function derInteger(bytes: Uint8Array): Uint8Array {
  let start = 0
  while (start < bytes.length - 1 && bytes[start] === 0) start++
  const trimmed = bytes.slice(start)
  const needsPadding = (trimmed[0] ?? 0) & HIGH_BIT
  const body = needsPadding ? concatBytes(Uint8Array.of(0), trimmed) : trimmed
  return concatBytes(Uint8Array.of(DER_INTEGER, body.length), body)
}

// Web Crypto signs ECDSA as raw r||s; WebAuthn carries it as an ASN.1 DER sequence.
export function rawEcdsaToDer(raw: Uint8Array): Uint8Array {
  const half = raw.length / 2
  const body = concatBytes(derInteger(raw.slice(0, half)), derInteger(raw.slice(half)))
  return concatBytes(Uint8Array.of(DER_SEQUENCE, body.length), body)
}

export async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
}

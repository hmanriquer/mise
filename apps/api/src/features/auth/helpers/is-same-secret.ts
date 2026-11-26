const DIGEST_ALGORITHM = "SHA-256"
const encoder = new TextEncoder()

function digest(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest(DIGEST_ALGORITHM, encoder.encode(value))
}

// Hashing first gives both sides the same length, so the comparison leaks neither content
// nor length through timing.
export async function isSameSecret(provided: string, expected: string): Promise<boolean> {
  const [providedDigest, expectedDigest] = await Promise.all([digest(provided), digest(expected)])
  return crypto.subtle.timingSafeEqual(providedDigest, expectedDigest)
}

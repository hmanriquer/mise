// WebUSB rejects with DOMExceptions whose name ("NotFoundError", "SecurityError",
// "NetworkError") is what tells "cancelled" from "the OS driver holds the printer".
export function toErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message }
  }
  return { name: typeof error, message: String(error) }
}

const CANCELLED_ERROR_NAME = "NotFoundError"

export function isChooserCancelled(error: unknown): boolean {
  return error instanceof Error && error.name === CANCELLED_ERROR_NAME
}

import type { Page } from "@playwright/test"

const CONSOLE_ERROR_TYPE = "error"

// Collects uncaught exceptions and console errors so a test can assert that the page ran cleanly.
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("pageerror", (error) => {
    errors.push(error.message)
  })
  page.on("console", (message) => {
    if (message.type() === CONSOLE_ERROR_TYPE) {
      errors.push(message.text())
    }
  })
  return errors
}

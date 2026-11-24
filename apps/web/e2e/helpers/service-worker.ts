import { expect, type Page } from "@playwright/test"

const CONTROL_POLL_INTERVAL_MS = 100
const CONTROL_POLL_TIMEOUT_MS = 10_000

export async function waitForServiceWorkerControl(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  if (await isPageControlled(page)) {
    return
  }
  // The worker does not claim open pages (clientsClaim is false), so the first load is uncontrolled.
  await page.reload()
  await expect
    .poll(() => isPageControlled(page), {
      intervals: [CONTROL_POLL_INTERVAL_MS],
      timeout: CONTROL_POLL_TIMEOUT_MS,
    })
    .toBe(true)
}

function isPageControlled(page: Page): Promise<boolean> {
  return page.evaluate(() => navigator.serviceWorker.controller !== null)
}

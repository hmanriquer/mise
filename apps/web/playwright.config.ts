import os from "node:os"
import { defineConfig, devices } from "@playwright/test"

const PREVIEW_PORT = 4173
const BASE_URL = `http://localhost:${PREVIEW_PORT}`
const HEALTH_URL = `${BASE_URL}/api/health`
const E2E_DIRECTORY = "./e2e"
const BUILD_AND_PREVIEW_COMMAND = "pnpm build && pnpm preview"
const SERVER_START_TIMEOUT_MS = 180_000
const CI_RETRIES = 1
const LOCAL_RETRIES = 0
const CHROMIUM_PROJECT_NAME = "chromium"
const CI_REPORTERS = [["dot"], ["html", { open: "never" }]] as const
const LOCAL_REPORTER = "list"
const TRACE_MODE = "on-first-retry"

export default defineConfig({
  testDir: E2E_DIRECTORY,
  fullyParallel: true,
  workers: process.env.CI ? os.cpus().length : undefined,
  retries: process.env.CI ? CI_RETRIES : LOCAL_RETRIES,
  reporter: process.env.CI ? [...CI_REPORTERS] : LOCAL_REPORTER,
  use: {
    baseURL: BASE_URL,
    trace: TRACE_MODE,
  },
  projects: [
    {
      name: CHROMIUM_PROJECT_NAME,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: BUILD_AND_PREVIEW_COMMAND,
    url: HEALTH_URL,
    reuseExistingServer: !process.env.CI,
    timeout: SERVER_START_TIMEOUT_MS,
  },
})

import { fileURLToPath } from "node:url"
import { configDefaults, defineConfig } from "vitest/config"

const SOURCE_ROOT = fileURLToPath(new URL("./src/", import.meta.url))
const UI_SOURCE_ROOT = fileURLToPath(new URL("../../packages/ui/src/", import.meta.url))
const TEST_ENVIRONMENT = "happy-dom"
const SETUP_FILE = "./src/test/setup.ts"
const E2E_EXCLUDE_GLOB = "e2e/**"

export default defineConfig({
  resolve: {
    alias: [
      { find: "@/", replacement: SOURCE_ROOT },
      { find: "@workspace/ui/", replacement: UI_SOURCE_ROOT },
    ],
  },
  test: {
    environment: TEST_ENVIRONMENT,
    setupFiles: [SETUP_FILE],
    include: ["src/**/*.test.{ts,tsx}", "scripts/__tests__/**/*.test.mjs"],
    exclude: [...configDefaults.exclude, E2E_EXCLUDE_GLOB],
  },
})

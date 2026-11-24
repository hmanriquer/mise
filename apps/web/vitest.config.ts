import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const SOURCE_ROOT = fileURLToPath(new URL("./src/", import.meta.url))
const UI_SOURCE_ROOT = fileURLToPath(new URL("../../packages/ui/src/", import.meta.url))
const TEST_ENVIRONMENT = "happy-dom"
const SETUP_FILE = "./src/test/setup.ts"

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
  },
})

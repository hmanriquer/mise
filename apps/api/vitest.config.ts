import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin"
import { defineConfig } from "vitest/config"

const WRANGLER_CONFIG = "./wrangler.jsonc"
const MIGRATIONS_DIRECTORY = "../../packages/db/migrations"
const SETUP_FILE = "./src/features/shared/__tests__/support/setup-database.ts"

// Test-only values. The real secrets live in .dev.vars locally and in `wrangler secret`.
const TEST_AUTH_BINDINGS = {
  AUTH_ORIGIN: "https://mise.test",
  AUTH_RP_ID: "mise.test",
  BETTER_AUTH_SECRET: "test-only-better-auth-secret-0123456789",
  OWNER_BOOTSTRAP_TOKEN: "test-only-bootstrap-token-0123456789abc",
}

export default defineConfig(async () => {
  // Read once per run; the setup file applies them to each test file's D1.
  const migrations = await readD1Migrations(MIGRATIONS_DIRECTORY)
  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: WRANGLER_CONFIG },
        miniflare: { bindings: { ...TEST_AUTH_BINDINGS, TEST_MIGRATIONS: migrations } },
      }),
    ],
    test: { setupFiles: [SETUP_FILE] },
  }
})

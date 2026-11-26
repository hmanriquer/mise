import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin"
import { defineConfig } from "vitest/config"

const MIGRATIONS_DIRECTORY = "./migrations"
const COMPATIBILITY_DATE = "2026-11-01"

export default defineConfig(async () => {
  // Read once per run; the setup file applies them to each test file's D1.
  const migrations = await readD1Migrations(MIGRATIONS_DIRECTORY)
  return {
    plugins: [
      cloudflareTest({
        miniflare: {
          compatibilityDate: COMPATIBILITY_DATE,
          compatibilityFlags: ["nodejs_compat"],
          d1Databases: ["DB"],
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    test: { setupFiles: ["./src/__tests__/support/setup-database.ts"] },
  }
})

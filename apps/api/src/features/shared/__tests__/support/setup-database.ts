import { applyD1Migrations } from "cloudflare:test"
import { env } from "cloudflare:workers"
import { beforeEach } from "vitest"

// Children before parents, so foreign keys hold while rows are deleted.
const TABLES_IN_DELETE_ORDER = [
  "audit_log",
  "passkey",
  "session",
  "account",
  "verification",
  "rate_limit",
  "user",
]

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)

// Storage is shared by the tests of a file, so each test starts from empty auth tables.
beforeEach(async () => {
  await env.DB.batch(
    TABLES_IN_DELETE_ORDER.map((table) => env.DB.prepare(`DELETE FROM "${table}"`)),
  )
})

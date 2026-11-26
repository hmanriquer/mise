import { applyD1Migrations } from "cloudflare:test"
import { env } from "cloudflare:workers"
import { getTableName } from "drizzle-orm"
import { beforeEach } from "vitest"
import * as schema from "../../schema"

// Children before parents, so foreign keys hold while rows are deleted.
const TABLES_IN_DELETE_ORDER = [
  schema.auditLog,
  schema.orderVoid,
  schema.orderItem,
  schema.order,
  schema.expense,
  schema.device,
  schema.variantPrice,
  schema.variantOptionValue,
  schema.variant,
  schema.optionValue,
  schema.optionGroup,
  schema.product,
  schema.category,
  schema.businessProfile,
]

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)

// Storage is shared by the tests of a file, so each test starts from an empty schema.
beforeEach(async () => {
  await env.DB.batch(
    TABLES_IN_DELETE_ORDER.map((table) => env.DB.prepare(`DELETE FROM "${getTableName(table)}"`)),
  )
})

import { drizzle } from "drizzle-orm/sqlite-proxy"
import * as schema from "../schema"
import { inlineSqlParams } from "./inline-sql-params"
import type { SeedRows } from "./seed-rows"

type Insertable = Parameters<ReturnType<typeof drizzle>["insert"]>[0]

// The builder only renders SQL; the seed runs through `wrangler d1 execute`.
const sqlBuilder = drizzle(async () => {
  throw new Error("The seed SQL builder never executes queries")
})

// Parents before children, so foreign keys hold.
const INSERT_ORDER: readonly [Insertable, keyof SeedRows][] = [
  [schema.businessProfile, "businessProfiles"],
  [schema.category, "categories"],
  [schema.product, "products"],
  [schema.optionGroup, "optionGroups"],
  [schema.optionValue, "optionValues"],
  [schema.variant, "variants"],
  [schema.variantOptionValue, "variantOptionValues"],
  [schema.variantPrice, "variantPrices"],
]

// ON CONFLICT DO NOTHING keeps the seed safe to re-run: existing rows, including any the
// owner has since edited, are left as they are.
export function buildSeedStatements(rows: SeedRows): string[] {
  return INSERT_ORDER.filter(([, key]) => rows[key].length > 0).map(([table, key]) => {
    const { sql, params } = sqlBuilder.insert(table).values(rows[key]).onConflictDoNothing().toSQL()
    return inlineSqlParams(sql, params)
  })
}

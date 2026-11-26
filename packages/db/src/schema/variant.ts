import { CHANNEL, COST_SOURCE, enumValues } from "@workspace/contracts"
import { check, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { archivedAt, createdAt, enumText, isActive, sortOrder, updatedAt, version } from "./columns"
import { optionValue } from "./option"
import { product } from "./product"
import { isNonNegative, isNullOrNonNegative, isNullTogether, isOneOf } from "./sql-checks"

export const variant = sqliteTable(
  "variant",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id),
    label: text("label").notNull(),
    sortOrder: sortOrder(),
    isActive: isActive(),
    archivedAt: archivedAt(),
    // NULL means the cost is unknown; margin only counts sales with a known cost.
    estimatedCostCents: integer("estimated_cost_cents"),
    costSource: enumText("cost_source", COST_SOURCE),
    version: version(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("variant_product_id_idx").on(table.productId),
    check("variant_estimated_cost_cents_check", isNullOrNonNegative(table.estimatedCostCents)),
    check("variant_cost_source_check", isOneOf(table.costSource, enumValues(COST_SOURCE))),
    check(
      "variant_cost_known_with_source_check",
      isNullTogether(table.estimatedCostCents, table.costSource),
    ),
  ],
)

export const variantOptionValue = sqliteTable(
  "variant_option_value",
  {
    variantId: text("variant_id")
      .notNull()
      .references(() => variant.id),
    optionValueId: text("option_value_id")
      .notNull()
      .references(() => optionValue.id),
  },
  (table) => [
    primaryKey({ columns: [table.variantId, table.optionValueId] }),
    index("variant_option_value_option_value_id_idx").on(table.optionValueId),
  ],
)

export const variantPrice = sqliteTable(
  "variant_price",
  {
    variantId: text("variant_id")
      .notNull()
      .references(() => variant.id),
    channel: enumText("channel", CHANNEL).notNull(),
    priceCents: integer("price_cents").notNull(),
    // DiDi prices stay placeholders (equal to counter prices) until the owner edits them.
    isPlaceholder: integer("is_placeholder", { mode: "boolean" }).notNull().default(false),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({ columns: [table.variantId, table.channel] }),
    check("variant_price_channel_check", isOneOf(table.channel, enumValues(CHANNEL))),
    check("variant_price_price_cents_check", isNonNegative(table.priceCents)),
  ],
)

import { sql } from "drizzle-orm"
import { check, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { order } from "./order"
import { columnRef, isNonNegative, isNullOrNonNegative, isPositive } from "./sql-checks"
import { variant } from "./variant"

export const orderItem = sqliteTable(
  "order_item",
  {
    orderId: text("order_id")
      .notNull()
      .references(() => order.id),
    lineNumber: integer("line_number").notNull(),
    variantId: text("variant_id")
      .notNull()
      .references(() => variant.id),
    // Snapshots taken at sale time.
    productName: text("product_name").notNull(),
    variantLabel: text("variant_label").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    // NULL when the variant's cost was unknown at sale time.
    unitCostCents: integer("unit_cost_cents"),
    note: text("note"),
  },
  (table) => [
    primaryKey({ columns: [table.orderId, table.lineNumber] }),
    index("order_item_variant_id_idx").on(table.variantId),
    check("order_item_line_number_check", isPositive(table.lineNumber)),
    check("order_item_quantity_check", isPositive(table.quantity)),
    check("order_item_unit_price_cents_check", isNonNegative(table.unitPriceCents)),
    check(
      "order_item_line_total_cents_check",
      sql`${columnRef(table.lineTotalCents)} = ${columnRef(table.unitPriceCents)} * ${columnRef(table.quantity)}`,
    ),
    check("order_item_unit_cost_cents_check", isNullOrNonNegative(table.unitCostCents)),
  ],
)

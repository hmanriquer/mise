import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { archivedAt, createdAt, sortOrder, updatedAt } from "./columns"
import { product } from "./product"

// For example the Banderilla groups Sabor and Relleno.
export const optionGroup = sqliteTable(
  "option_group",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id),
    name: text("name").notNull(),
    sortOrder: sortOrder(),
    archivedAt: archivedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("option_group_product_id_idx").on(table.productId)],
)

export const optionValue = sqliteTable(
  "option_value",
  {
    id: text("id").primaryKey(),
    optionGroupId: text("option_group_id")
      .notNull()
      .references(() => optionGroup.id),
    name: text("name").notNull(),
    sortOrder: sortOrder(),
    archivedAt: archivedAt(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("option_value_option_group_id_idx").on(table.optionGroupId)],
)

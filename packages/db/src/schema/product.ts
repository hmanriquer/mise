import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { category } from "./category"
import { archivedAt, createdAt, isActive, sortOrder, updatedAt, version } from "./columns"

export const product = sqliteTable(
  "product",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
    name: text("name").notNull(),
    sortOrder: sortOrder(),
    isActive: isActive(),
    archivedAt: archivedAt(),
    version: version(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("product_category_id_idx").on(table.categoryId)],
)

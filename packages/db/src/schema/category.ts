import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { archivedAt, createdAt, isActive, sortOrder, updatedAt, version } from "./columns"

export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: sortOrder(),
  isActive: isActive(),
  archivedAt: archivedAt(),
  version: version(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

import { sql } from "drizzle-orm"
import { check, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { createdAt } from "./columns"
import { columnRef } from "./sql-checks"

export const device = sqliteTable(
  "device",
  {
    id: text("id").primaryKey(),
    // One letter, A to Z. Folios read `{code}-{seq}`.
    code: text("code").notNull(),
    label: text("label").notNull(),
    createdAt: createdAt(),
    lastSeenAt: integer("last_seen_at"),
    revokedAt: integer("revoked_at"),
  },
  (table) => [
    check("device_code_check", sql`${columnRef(table.code)} GLOB '[A-Z]'`),
    // A revoked device frees its letter for a new registration.
    uniqueIndex("device_active_code_unique")
      .on(table.code)
      .where(sql`${columnRef(table.revokedAt)} IS NULL`),
  ],
)

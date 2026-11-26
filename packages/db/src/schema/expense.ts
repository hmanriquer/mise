import { EXPENSE_CATEGORY, enumValues } from "@workspace/contracts"
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createdAt, enumText, updatedAt, version } from "./columns"
import { device } from "./device"
import { isBusinessDate, isOneOf, isPositive } from "./sql-checks"

export const expense = sqliteTable(
  "expense",
  {
    id: text("id").primaryKey(),
    deviceId: text("device_id").references(() => device.id),
    category: enumText("category", EXPENSE_CATEGORY).notNull(),
    amountCents: integer("amount_cents").notNull(),
    description: text("description").notNull(),
    supplier: text("supplier"),
    spentAt: integer("spent_at").notNull(),
    businessDate: text("business_date").notNull(),
    payloadHash: text("payload_hash").notNull(),
    version: version(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    // Soft delete: deleted expenses stay in D1 but leave every list and total.
    deletedAt: integer("deleted_at"),
  },
  (table) => [
    index("expense_business_date_idx").on(table.businessDate),
    check("expense_category_check", isOneOf(table.category, enumValues(EXPENSE_CATEGORY))),
    check("expense_amount_cents_check", isPositive(table.amountCents)),
    check("expense_business_date_check", isBusinessDate(table.businessDate)),
  ],
)

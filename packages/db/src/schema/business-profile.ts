import { sql } from "drizzle-orm"
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { updatedAt, version } from "./columns"
import { columnRef } from "./sql-checks"

// One owner, one business: the profile is a single row.
export const BUSINESS_PROFILE_ID = 1

export const businessProfile = sqliteTable(
  "business_profile",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    ticketHeader: text("ticket_header"),
    ticketFooter: text("ticket_footer"),
    printCustomerTicket: integer("print_customer_ticket", { mode: "boolean" })
      .notNull()
      .default(true),
    version: version(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check(
      "business_profile_single_row_check",
      sql`${columnRef(table.id)} = ${sql.raw(String(BUSINESS_PROFILE_ID))}`,
    ),
  ],
)

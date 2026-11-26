import { AUDIT_ACTION, enumValues } from "@workspace/contracts"
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { enumText } from "./columns"
import { isNullOrJsonObject, isOneOf } from "./sql-checks"

// Never store passwords, tokens or credential material here.
export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    action: enumText("action", AUDIT_ACTION).notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    // JSON object, e.g. old and new price.
    details: text("details"),
    occurredAt: integer("occurred_at").notNull(),
  },
  (table) => [
    index("audit_log_occurred_at_idx").on(table.occurredAt),
    check("audit_log_action_check", isOneOf(table.action, enumValues(AUDIT_ACTION))),
    check("audit_log_details_check", isNullOrJsonObject(table.details)),
  ],
)

import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { device } from "./device"
import { order } from "./order"
import { isNotBlank } from "./sql-checks"

// The OrderVoided event. An order is voided at most once.
export const orderVoid = sqliteTable(
  "order_void",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => order.id),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id),
    reason: text("reason").notNull(),
    voidedAt: integer("voided_at").notNull(),
    receivedAt: integer("received_at").notNull(),
    payloadHash: text("payload_hash").notNull(),
  },
  (table) => [check("order_void_reason_check", isNotBlank(table.reason))],
)

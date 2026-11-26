import {
  ALLOWED_PAYMENTS_BY_CHANNEL,
  CHANNEL,
  enumValues,
  PAYMENT_METHOD,
} from "@workspace/contracts"
import { type SQL, sql } from "drizzle-orm"
import {
  check,
  index,
  integer,
  type SQLiteColumn,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"
import { enumText } from "./columns"
import { device } from "./device"
import {
  columnRef,
  equalsLiteral,
  isBusinessDate,
  isJsonArray,
  isNonNegative,
  isNullOrNonNegative,
  isNullTogether,
  isOneOf,
  isPositive,
} from "./sql-checks"

const EMPTY_FLAGS = "[]"

// Orders are immutable, append-only facts. Names, prices and costs are snapshots, so a
// later price change never rewrites a past order. A void is its own event (order_void).
export const order = sqliteTable(
  "order",
  {
    id: text("id").primaryKey(),
    deviceId: text("device_id")
      .notNull()
      .references(() => device.id),
    folioSeq: integer("folio_seq").notNull(),
    folio: text("folio").notNull(),
    businessDate: text("business_date").notNull(),
    channel: enumText("channel", CHANNEL).notNull(),
    paymentMethod: enumText("payment_method", PAYMENT_METHOD).notNull(),
    totalCents: integer("total_cents").notNull(),
    // NULL when no line had a known cost at sale time.
    estimatedCostCents: integer("estimated_cost_cents"),
    cashReceivedCents: integer("cash_received_cents"),
    changeCents: integer("change_cents"),
    // "Folio DiDi", optional and only for DiDi Food orders.
    externalRef: text("external_ref"),
    customerName: text("customer_name"),
    note: text("note"),
    // JSON array of ORDER_FLAG values, e.g. ["price_drift"].
    flags: text("flags").notNull().default(EMPTY_FLAGS),
    soldAt: integer("sold_at").notNull(),
    receivedAt: integer("received_at").notNull(),
    payloadHash: text("payload_hash").notNull(),
    voidedAt: integer("voided_at"),
    voidReason: text("void_reason"),
  },
  (table) => [
    uniqueIndex("order_device_id_business_date_folio_seq_unique").on(
      table.deviceId,
      table.businessDate,
      table.folioSeq,
    ),
    index("order_business_date_idx").on(table.businessDate),
    check("order_folio_seq_check", isPositive(table.folioSeq)),
    check("order_business_date_check", isBusinessDate(table.businessDate)),
    check("order_channel_check", isOneOf(table.channel, enumValues(CHANNEL))),
    check("order_payment_method_check", isOneOf(table.paymentMethod, enumValues(PAYMENT_METHOD))),
    check(
      "order_payment_for_channel_check",
      paymentAllowedForChannel(table.channel, table.paymentMethod),
    ),
    check("order_total_cents_check", isNonNegative(table.totalCents)),
    check("order_estimated_cost_cents_check", isNullOrNonNegative(table.estimatedCostCents)),
    check("order_cash_fields_check", cashFieldsMatchPayment(table)),
    check("order_external_ref_check", externalRefOnlyForDidi(table.externalRef, table.channel)),
    check("order_flags_check", isJsonArray(table.flags)),
    check("order_void_fields_check", isNullTogether(table.voidedAt, table.voidReason)),
  ],
)

function paymentAllowedForChannel(channel: SQLiteColumn, paymentMethod: SQLiteColumn): SQL {
  const allowedPerChannel = Object.entries(ALLOWED_PAYMENTS_BY_CHANNEL).map(
    ([channelValue, payments]) =>
      sql`(${equalsLiteral(channel, channelValue)} AND ${isOneOf(paymentMethod, payments)})`,
  )
  return sql.join(allowedPerChannel, sql` OR `)
}

type CashColumns = {
  paymentMethod: SQLiteColumn
  totalCents: SQLiteColumn
  cashReceivedCents: SQLiteColumn
  changeCents: SQLiteColumn
}

// Cash sales record what was received and the change; every other payment records neither.
function cashFieldsMatchPayment(table: CashColumns): SQL {
  const isCash = equalsLiteral(table.paymentMethod, PAYMENT_METHOD.cash)
  return sql`CASE WHEN ${isCash} THEN ${columnRef(table.cashReceivedCents)} IS NOT NULL
    AND ${columnRef(table.cashReceivedCents)} >= ${columnRef(table.totalCents)}
    AND ${columnRef(table.changeCents)} = ${columnRef(table.cashReceivedCents)} - ${columnRef(table.totalCents)}
    ELSE ${columnRef(table.cashReceivedCents)} IS NULL AND ${columnRef(table.changeCents)} IS NULL END`
}

function externalRefOnlyForDidi(externalRef: SQLiteColumn, channel: SQLiteColumn): SQL {
  return sql`${columnRef(externalRef)} IS NULL OR ${equalsLiteral(channel, CHANNEL.didiFood)}`
}

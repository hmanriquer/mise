import { CHANNEL, PAYMENT_METHOD } from "@workspace/contracts"
import type { device, order } from "../../schema"

type DeviceInsert = typeof device.$inferInsert
type OrderInsert = typeof order.$inferInsert

const SOLD_AT_MS = Date.parse("2026-11-20T21:14:00.000Z")
const TOTAL_CENTS = 8500
const CASH_RECEIVED_CENTS = 10000

export function buildDevice(overrides: Partial<DeviceInsert> = {}): DeviceInsert {
  return {
    id: crypto.randomUUID(),
    code: "A",
    label: "Mostrador",
    createdAt: SOLD_AT_MS,
    ...overrides,
  }
}

// A valid counter cash sale: $85 total, $100 received, $15 change.
export function buildOrder(deviceId: string, overrides: Partial<OrderInsert> = {}): OrderInsert {
  return {
    id: crypto.randomUUID(),
    deviceId,
    folioSeq: 42,
    folio: "A-042",
    businessDate: "2026-11-20",
    channel: CHANNEL.counter,
    paymentMethod: PAYMENT_METHOD.cash,
    totalCents: TOTAL_CENTS,
    cashReceivedCents: CASH_RECEIVED_CENTS,
    changeCents: CASH_RECEIVED_CENTS - TOTAL_CENTS,
    soldAt: SOLD_AT_MS,
    receivedAt: SOLD_AT_MS,
    payloadHash: "hash",
    ...overrides,
  }
}

// A valid DiDi Food manual record: no cash, no change.
export function buildDidiOrder(
  deviceId: string,
  overrides: Partial<OrderInsert> = {},
): OrderInsert {
  return buildOrder(deviceId, {
    channel: CHANNEL.didiFood,
    paymentMethod: PAYMENT_METHOD.didiFood,
    cashReceivedCents: null,
    changeCents: null,
    ...overrides,
  })
}

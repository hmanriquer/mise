import { env } from "cloudflare:workers"
import { CHANNEL, type Channel, PAYMENT_METHOD, type PaymentMethod } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import * as schema from "../schema"
import { expectConstraintFailure, testDatabase } from "./support/database"
import { buildDevice, buildDidiOrder, buildOrder } from "./support/factories"

const FOLIO_INDEX = "order_device_id_business_date_folio_seq_unique"
// Values the TypeScript enums would refuse, cast so the database is what rejects them.
const UNKNOWN_CHANNEL = "uber_eats" as Channel
const UNKNOWN_PAYMENT = "transfer" as PaymentMethod

async function insertDevice() {
  const device = buildDevice()
  await testDatabase().insert(schema.device).values(device)
  return device.id
}

describe("order constraints", () => {
  it("accepts a valid counter cash sale and a DiDi manual record", async () => {
    const deviceId = await insertDevice()
    const db = testDatabase()

    await db.insert(schema.order).values(buildOrder(deviceId))
    await db
      .insert(schema.order)
      .values(buildDidiOrder(deviceId, { folioSeq: 43, externalRef: "DD-1" }))

    expect(await db.$count(schema.order)).toBe(2)
  })

  it("rejects an unknown channel", async () => {
    const deviceId = await insertDevice()
    const query = testDatabase()
      .insert(schema.order)
      .values(buildOrder(deviceId, { channel: UNKNOWN_CHANNEL }))
    await expectConstraintFailure(query, "order_channel_check")
  })

  it("rejects an unknown payment method", async () => {
    const deviceId = await insertDevice()
    const query = testDatabase()
      .insert(schema.order)
      .values(buildOrder(deviceId, { paymentMethod: UNKNOWN_PAYMENT }))
    await expectConstraintFailure(query, "order_payment_method_check")
  })

  it.each([
    [CHANNEL.counter, PAYMENT_METHOD.didiFood],
    [CHANNEL.didiFood, PAYMENT_METHOD.cardTerminal],
  ])("rejects %s paid with %s", async (channel, paymentMethod) => {
    const deviceId = await insertDevice()
    const query = testDatabase()
      .insert(schema.order)
      .values(buildDidiOrder(deviceId, { channel, paymentMethod }))
    await expectConstraintFailure(query, "order_payment_for_channel_check")
  })

  it("rejects cash fields on a DiDi Food order", async () => {
    const deviceId = await insertDevice()
    const query = testDatabase()
      .insert(schema.order)
      .values(buildDidiOrder(deviceId, { cashReceivedCents: 10000, changeCents: 1500 }))
    await expectConstraintFailure(query, "order_cash_fields_check")
  })

  it("rejects a cash sale whose change does not add up", async () => {
    const deviceId = await insertDevice()
    const query = testDatabase()
      .insert(schema.order)
      .values(buildOrder(deviceId, { changeCents: 2000 }))
    await expectConstraintFailure(query, "order_cash_fields_check")
  })

  it("rejects a malformed business date", async () => {
    const deviceId = await insertDevice()
    const query = testDatabase()
      .insert(schema.order)
      .values(buildOrder(deviceId, { businessDate: "20/11/2026" }))
    await expectConstraintFailure(query, "order_business_date_check")
  })

  it("has the unique folio index on device, business date and folio sequence", async () => {
    const { results } = await env.DB.prepare(`PRAGMA index_list("order")`).all<{
      name: string
      unique: number
    }>()
    const { results: columns } = await env.DB.prepare(`PRAGMA index_info("${FOLIO_INDEX}")`).all<{
      name: string
    }>()

    expect(results).toContainEqual(expect.objectContaining({ name: FOLIO_INDEX, unique: 1 }))
    expect(columns.map((column) => column.name)).toEqual([
      "device_id",
      "business_date",
      "folio_seq",
    ])
  })

  it("rejects a second order with the same folio on the same device and day", async () => {
    const deviceId = await insertDevice()
    const db = testDatabase()
    await db.insert(schema.order).values(buildOrder(deviceId))

    await expectConstraintFailure(
      db.insert(schema.order).values(buildOrder(deviceId)),
      "UNIQUE constraint failed",
    )
  })

  it("allows the same folio sequence on another business date", async () => {
    const deviceId = await insertDevice()
    const db = testDatabase()
    await db.insert(schema.order).values(buildOrder(deviceId))
    await db.insert(schema.order).values(buildOrder(deviceId, { businessDate: "2026-11-21" }))

    expect(await db.$count(schema.order)).toBe(2)
  })
})

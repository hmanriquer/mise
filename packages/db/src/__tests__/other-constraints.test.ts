import {
  type AuditAction,
  CHANNEL,
  type Channel,
  COST_SOURCE,
  EXPENSE_CATEGORY,
  type ExpenseCategory,
} from "@workspace/contracts"
import { eq } from "drizzle-orm"
import { describe, expect, it } from "vitest"
import * as schema from "../schema"
import { expectConstraintFailure, runSeed, testDatabase } from "./support/database"
import { buildDevice } from "./support/factories"

const VARIANT_ID = "refresco"
const NOW_MS = Date.parse("2026-11-20T18:00:00.000Z")
// Values the TypeScript enums would refuse, cast so the database is what rejects them.
const UNKNOWN_CHANNEL = "rappi" as Channel
const UNKNOWN_CATEGORY = "rent" as ExpenseCategory
const UNKNOWN_ACTION = "order.edit" as AuditAction

function buildExpense(category: ExpenseCategory) {
  return {
    id: crypto.randomUUID(),
    category,
    amountCents: 25000,
    description: "Salchichas",
    spentAt: NOW_MS,
    businessDate: "2026-11-20",
    payloadHash: "hash",
    createdAt: NOW_MS,
    updatedAt: NOW_MS,
  }
}

describe("variant cost", () => {
  it("accepts a cost together with its source", async () => {
    await runSeed()
    const db = testDatabase()
    await db
      .update(schema.variant)
      .set({ estimatedCostCents: 900, costSource: COST_SOURCE.manual })
      .where(eq(schema.variant.id, VARIANT_ID))

    const [variant] = await db
      .select()
      .from(schema.variant)
      .where(eq(schema.variant.id, VARIANT_ID))
    expect(variant).toMatchObject({ estimatedCostCents: 900, costSource: COST_SOURCE.manual })
  })

  it("rejects a cost without a source", async () => {
    await runSeed()
    const query = testDatabase()
      .update(schema.variant)
      .set({ estimatedCostCents: 900 })
      .where(eq(schema.variant.id, VARIANT_ID))
    await expectConstraintFailure(query, "variant_cost_known_with_source_check")
  })

  it("rejects a price for an unknown channel", async () => {
    await runSeed()
    const query = testDatabase().insert(schema.variantPrice).values({
      variantId: VARIANT_ID,
      channel: UNKNOWN_CHANNEL,
      priceCents: 3000,
      updatedAt: NOW_MS,
    })
    await expectConstraintFailure(query, "variant_price_channel_check")
  })

  it("rejects a negative price", async () => {
    await runSeed()
    const query = testDatabase()
      .update(schema.variantPrice)
      .set({ priceCents: -1 })
      .where(eq(schema.variantPrice.channel, CHANNEL.counter))
    await expectConstraintFailure(query, "variant_price_price_cents_check")
  })
})

describe("device", () => {
  it("rejects a code that is not one letter A to Z", async () => {
    const query = testDatabase()
      .insert(schema.device)
      .values(buildDevice({ code: "AA" }))
    await expectConstraintFailure(query, "device_code_check")
  })

  it("frees a revoked device's letter", async () => {
    const db = testDatabase()
    await db.insert(schema.device).values(buildDevice({ revokedAt: NOW_MS }))
    await db.insert(schema.device).values(buildDevice())

    await expectConstraintFailure(
      db.insert(schema.device).values(buildDevice()),
      "UNIQUE constraint failed",
    )
  })
})

describe("expense and audit log", () => {
  it("accepts a known expense category", async () => {
    const db = testDatabase()
    await db.insert(schema.expense).values(buildExpense(EXPENSE_CATEGORY.supplies))

    expect(await db.$count(schema.expense)).toBe(1)
  })

  it("rejects an unknown expense category", async () => {
    const query = testDatabase().insert(schema.expense).values(buildExpense(UNKNOWN_CATEGORY))
    await expectConstraintFailure(query, "expense_category_check")
  })

  it("rejects an unknown audit action", async () => {
    const query = testDatabase()
      .insert(schema.auditLog)
      .values({ id: crypto.randomUUID(), action: UNKNOWN_ACTION, occurredAt: NOW_MS })
    await expectConstraintFailure(query, "audit_log_action_check")
  })
})

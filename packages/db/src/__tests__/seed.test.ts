import { CHANNEL } from "@workspace/contracts"
import { and, eq, getTableName, type Table } from "drizzle-orm"
import { describe, expect, it } from "vitest"
import * as schema from "../schema"
import { runSeed, SEEDED_AT_MS, testDatabase } from "./support/database"

const SEEDED_TABLES: Table[] = [
  schema.businessProfile,
  schema.category,
  schema.product,
  schema.optionGroup,
  schema.optionValue,
  schema.variant,
  schema.variantOptionValue,
  schema.variantPrice,
]
const LATER_RUN_MS = SEEDED_AT_MS + 60_000
const EDITED_DIDI_PRICE_CENTS = 6200
const COREANA_QUESO_ID = "banderilla-coreana-queso"

async function snapshotSeededTables() {
  const db = testDatabase()
  const entries = await Promise.all(
    SEEDED_TABLES.map(
      async (table) => [getTableName(table), await db.select().from(table)] as const,
    ),
  )
  return Object.fromEntries(entries)
}

describe("menu seed on D1", () => {
  it("fills an empty database with the menu", async () => {
    await runSeed()
    const db = testDatabase()

    expect(await db.$count(schema.category)).toBe(3)
    expect(await db.$count(schema.product)).toBe(9)
    expect(await db.$count(schema.variant)).toBe(28)
    expect(await db.$count(schema.variant, eq(schema.variant.productId, "banderilla"))).toBe(20)
    expect(await db.$count(schema.variantPrice, eq(schema.variantPrice.isPlaceholder, true))).toBe(
      28,
    )
  })

  it("changes nothing when it runs a second time", async () => {
    await runSeed()
    const afterFirstRun = await snapshotSeededTables()

    await runSeed(LATER_RUN_MS)

    expect(await snapshotSeededTables()).toEqual(afterFirstRun)
  })

  it("keeps the owner's edits when it runs again", async () => {
    await runSeed()
    const db = testDatabase()
    const coreanaQuesoDidi = and(
      eq(schema.variantPrice.variantId, COREANA_QUESO_ID),
      eq(schema.variantPrice.channel, CHANNEL.didiFood),
    )
    await db
      .update(schema.variantPrice)
      .set({ priceCents: EDITED_DIDI_PRICE_CENTS, isPlaceholder: false })
      .where(coreanaQuesoDidi)

    await runSeed(LATER_RUN_MS)

    const [price] = await db.select().from(schema.variantPrice).where(coreanaQuesoDidi)
    expect(price).toMatchObject({ priceCents: EDITED_DIDI_PRICE_CENTS, isPlaceholder: false })
  })

  it("stores unknown costs as NULL", async () => {
    await runSeed()
    const [variant] = await testDatabase()
      .select()
      .from(schema.variant)
      .where(eq(schema.variant.id, COREANA_QUESO_ID))

    expect(variant).toMatchObject({
      label: "Coreana · Queso",
      estimatedCostCents: null,
      costSource: null,
    })
  })
})

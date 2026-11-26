import { CHANNEL } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import { buildSeedRows, MENU_SEED } from "../seed"

const NOW_MS = Date.parse("2026-11-20T18:00:00.000Z")
const BANDERILLA_ID = "banderilla"
const BANDERILLA_VARIANT_COUNT = 20
const TOTAL_VARIANT_COUNT = 28

function counterPriceOf(variantId: string): number | undefined {
  return buildSeedRows(MENU_SEED, NOW_MS).variantPrices.find(
    (price) => price.variantId === variantId && price.channel === CHANNEL.counter,
  )?.priceCents
}

describe("buildSeedRows", () => {
  const rows = buildSeedRows(MENU_SEED, NOW_MS)

  it("seeds the business profile", () => {
    expect(rows.businessProfiles).toEqual([
      expect.objectContaining({ name: "Reina de Espadas", tagline: "Sabor digno de la realeza" }),
    ])
  })

  it("has 3 categories, 9 products and 28 variants", () => {
    expect(rows.categories.map((category) => category.name)).toEqual([
      "Banderillas",
      "Papas",
      "Bebidas",
    ])
    expect(rows.products).toHaveLength(9)
    expect(rows.variants).toHaveLength(TOTAL_VARIANT_COUNT)
  })

  it("gives the Banderilla exactly 20 Sabor × Relleno variants", () => {
    const banderillas = rows.variants.filter((variant) => variant.productId === BANDERILLA_ID)
    expect(banderillas).toHaveLength(BANDERILLA_VARIANT_COUNT)
    expect(new Set(banderillas.map((variant) => variant.label)).size).toBe(BANDERILLA_VARIANT_COUNT)
    expect(banderillas.map((variant) => variant.label)).toContain("Flamin' Blue · Combinada")
  })

  it("links each Banderilla variant to one Sabor and one Relleno", () => {
    const links = rows.variantOptionValues.filter(
      (link) => link.variantId === "banderilla-coreana-queso",
    )
    expect(links.map((link) => link.optionValueId)).toEqual([
      "banderilla-sabor-coreana",
      "banderilla-relleno-queso",
    ])
    expect(rows.variantOptionValues).toHaveLength(BANDERILLA_VARIANT_COUNT * 2)
  })

  it.each([
    ["banderilla-coreana-queso", 5500],
    ["banderilla-sencilla-mini-salchicha", 1500],
    ["banderilla-sencilla-queso", 4000],
    ["banderilla-flamin-hot-combinada", 4200],
    ["banderilla-flamin-blue-combinada", 4200],
    ["papas-a-la-francesa", 4500],
    ["papas-preparadas", 6000],
    ["cafe-ole", 3800],
  ])("prices %s at %i cents at the counter", (variantId, expectedCents) => {
    expect(counterPriceOf(variantId)).toBe(expectedCents)
  })

  it("seeds every DiDi price as a placeholder equal to the counter price", () => {
    const didiPrices = rows.variantPrices.filter((price) => price.channel === CHANNEL.didiFood)
    expect(didiPrices).toHaveLength(TOTAL_VARIANT_COUNT)
    for (const didiPrice of didiPrices) {
      expect(didiPrice.isPlaceholder).toBe(true)
      expect(didiPrice.priceCents).toBe(counterPriceOf(didiPrice.variantId))
    }
  })

  it("leaves every estimated cost unknown", () => {
    for (const variant of rows.variants) {
      expect(variant.estimatedCostCents).toBeNull()
      expect(variant.costSource).toBeNull()
    }
  })
})

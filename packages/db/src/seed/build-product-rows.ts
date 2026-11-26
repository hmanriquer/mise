import { CHANNEL, toCents } from "@workspace/contracts"
import type { ProductRows, SeedRows } from "./seed-rows"
import type { MatrixProductSeed, OptionGroupSeed, ProductSeed, SingleProductSeed } from "./types"

const ID_SEPARATOR = "-"
const VARIANT_LABEL_SEPARATOR = " · "

type VariantRow = SeedRows["variants"][number]
type PriceRow = SeedRows["variantPrices"][number]

export function buildProductRows(seed: ProductSeed, nowMs: number): ProductRows {
  return seed.kind === "single" ? buildSingleRows(seed, nowMs) : buildMatrixRows(seed, nowMs)
}

function buildSingleRows(seed: SingleProductSeed, nowMs: number): ProductRows {
  const variantId = seed.id
  return {
    optionGroups: [],
    optionValues: [],
    variants: [
      newVariant({ id: variantId, productId: seed.id, label: seed.name, sortOrder: 0 }, nowMs),
    ],
    variantOptionValues: [],
    variantPrices: pricesFor(variantId, toCents(seed.pricePesos), nowMs),
  }
}

function buildMatrixRows(seed: MatrixProductSeed, nowMs: number): ProductRows {
  const groups = [seed.rowGroup, seed.columnGroup]
  const rows: ProductRows = {
    optionGroups: groups.map((group, index) => ({
      id: group.id,
      productId: seed.id,
      name: group.name,
      sortOrder: index,
      createdAt: nowMs,
      updatedAt: nowMs,
    })),
    optionValues: groups.flatMap((group) => optionValueRows(group, nowMs)),
    variants: [],
    variantOptionValues: [],
    variantPrices: [],
  }
  for (const [rowIndex, rowValue] of seed.rowGroup.values.entries()) {
    for (const [columnIndex, columnValue] of seed.columnGroup.values.entries()) {
      const variantId = [seed.id, rowValue.id, columnValue.id].join(ID_SEPARATOR)
      const sortOrder = rowIndex * seed.columnGroup.values.length + columnIndex
      const label = [rowValue.name, columnValue.name].join(VARIANT_LABEL_SEPARATOR)
      const priceCents = toCents(matrixPrice(seed, rowValue.id, columnValue.id))
      rows.variants.push(newVariant({ id: variantId, productId: seed.id, label, sortOrder }, nowMs))
      rows.variantOptionValues.push(
        { variantId, optionValueId: optionValueId(seed.rowGroup, rowValue.id) },
        { variantId, optionValueId: optionValueId(seed.columnGroup, columnValue.id) },
      )
      rows.variantPrices.push(...pricesFor(variantId, priceCents, nowMs))
    }
  }
  return rows
}

function optionValueRows(group: OptionGroupSeed, nowMs: number): SeedRows["optionValues"] {
  return group.values.map((value, index) => ({
    id: optionValueId(group, value.id),
    optionGroupId: group.id,
    name: value.name,
    sortOrder: index,
    createdAt: nowMs,
    updatedAt: nowMs,
  }))
}

// Option value ids are global, so they carry their group id.
function optionValueId(group: OptionGroupSeed, valueId: string): string {
  return [group.id, valueId].join(ID_SEPARATOR)
}

function matrixPrice(seed: MatrixProductSeed, rowValueId: string, columnValueId: string): number {
  const price = seed.pricesPesos[rowValueId]?.[columnValueId]
  if (price === undefined) {
    throw new Error(`Missing price for ${seed.id} ${rowValueId} × ${columnValueId}`)
  }
  return price
}

type VariantIdentity = Pick<VariantRow, "id" | "productId" | "label" | "sortOrder">

// Estimated cost stays NULL (unknown) until the owner enters it or accepts a suggestion.
function newVariant(identity: VariantIdentity, nowMs: number): VariantRow {
  return {
    ...identity,
    estimatedCostCents: null,
    costSource: null,
    createdAt: nowMs,
    updatedAt: nowMs,
  }
}

// DiDi Food prices are placeholders equal to the counter price until the client sends them.
function pricesFor(variantId: string, counterCents: number, nowMs: number): PriceRow[] {
  return [
    {
      variantId,
      channel: CHANNEL.counter,
      priceCents: counterCents,
      isPlaceholder: false,
      updatedAt: nowMs,
    },
    {
      variantId,
      channel: CHANNEL.didiFood,
      priceCents: counterCents,
      isPlaceholder: true,
      updatedAt: nowMs,
    },
  ]
}

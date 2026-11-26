export type OptionValueSeed = {
  id: string
  name: string
}

export type OptionGroupSeed = {
  id: string
  name: string
  values: readonly OptionValueSeed[]
}

// A product sold as one variant, e.g. Refresco.
export type SingleProductSeed = {
  kind: "single"
  id: string
  name: string
  pricePesos: number
}

// A product whose variants are every row × column pair, e.g. Banderilla Sabor × Relleno.
// Prices are keyed by row value id, then column value id.
export type MatrixProductSeed = {
  kind: "matrix"
  id: string
  name: string
  rowGroup: OptionGroupSeed
  columnGroup: OptionGroupSeed
  pricesPesos: Readonly<Record<string, Readonly<Record<string, number>>>>
}

export type ProductSeed = SingleProductSeed | MatrixProductSeed

export type CategorySeed = {
  id: string
  name: string
  products: readonly ProductSeed[]
}

export type MenuSeed = {
  profile: { name: string; tagline: string }
  categories: readonly CategorySeed[]
}

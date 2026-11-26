import type {
  businessProfile,
  category,
  optionGroup,
  optionValue,
  product,
  variant,
  variantOptionValue,
  variantPrice,
} from "../schema"

export type SeedRows = {
  businessProfiles: (typeof businessProfile.$inferInsert)[]
  categories: (typeof category.$inferInsert)[]
  products: (typeof product.$inferInsert)[]
  optionGroups: (typeof optionGroup.$inferInsert)[]
  optionValues: (typeof optionValue.$inferInsert)[]
  variants: (typeof variant.$inferInsert)[]
  variantOptionValues: (typeof variantOptionValue.$inferInsert)[]
  variantPrices: (typeof variantPrice.$inferInsert)[]
}

export type ProductRows = Pick<
  SeedRows,
  "optionGroups" | "optionValues" | "variants" | "variantOptionValues" | "variantPrices"
>

export function emptyProductRows(): ProductRows {
  return {
    optionGroups: [],
    optionValues: [],
    variants: [],
    variantOptionValues: [],
    variantPrices: [],
  }
}

export function mergeProductRows(first: ProductRows, second: ProductRows): ProductRows {
  return {
    optionGroups: [...first.optionGroups, ...second.optionGroups],
    optionValues: [...first.optionValues, ...second.optionValues],
    variants: [...first.variants, ...second.variants],
    variantOptionValues: [...first.variantOptionValues, ...second.variantOptionValues],
    variantPrices: [...first.variantPrices, ...second.variantPrices],
  }
}

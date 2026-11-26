import { BUSINESS_PROFILE_ID } from "../schema"
import { buildProductRows } from "./build-product-rows"
import { emptyProductRows, mergeProductRows, type SeedRows } from "./seed-rows"
import type { MenuSeed } from "./types"

export function buildSeedRows(menu: MenuSeed, nowMs: number): SeedRows {
  const products = menu.categories.flatMap((category) =>
    category.products.map((productSeed, index) => ({
      categoryId: category.id,
      productSeed,
      index,
    })),
  )
  const productRows = products
    .map(({ productSeed }) => buildProductRows(productSeed, nowMs))
    .reduce(mergeProductRows, emptyProductRows())

  return {
    businessProfiles: [
      {
        id: BUSINESS_PROFILE_ID,
        name: menu.profile.name,
        tagline: menu.profile.tagline,
        updatedAt: nowMs,
      },
    ],
    categories: menu.categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      sortOrder: index,
      createdAt: nowMs,
      updatedAt: nowMs,
    })),
    products: products.map(({ categoryId, productSeed, index }) => ({
      id: productSeed.id,
      categoryId,
      name: productSeed.name,
      sortOrder: index,
      createdAt: nowMs,
      updatedAt: nowMs,
    })),
    ...productRows,
  }
}

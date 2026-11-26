import { z } from "zod"
import type { EnumValue } from "./enum-values"

export const EXPENSE_CATEGORY = {
  supplies: "supplies",
  packaging: "packaging",
  utilities: "utilities",
  other: "other",
} as const

export const expenseCategorySchema = z.enum(EXPENSE_CATEGORY)

export type ExpenseCategory = EnumValue<typeof EXPENSE_CATEGORY>

// Ingredients and the packaging each order goes out in are consumed by sales, so they feed
// the "Insumos por consumir" balance and cost suggestions. Gas, services and the rest do not.
const SUPPLY_CATEGORIES: ReadonlySet<ExpenseCategory> = new Set([
  EXPENSE_CATEGORY.supplies,
  EXPENSE_CATEGORY.packaging,
])

export function countsAsSupplies(category: ExpenseCategory): boolean {
  return SUPPLY_CATEGORIES.has(category)
}

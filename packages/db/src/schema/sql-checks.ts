import { type SQL, sql } from "drizzle-orm"
import type { SQLiteColumn } from "drizzle-orm/sqlite-core"

// CHECK constraints are DDL, so enum values are inlined as literals instead of bound
// parameters. Only plain identifiers from the contracts enums are allowed through.
const SAFE_LITERAL_PATTERN = /^[a-z_.]+$/
const BUSINESS_DATE_GLOB = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]"

// Unqualified names: drizzle-kit rebuilds SQLite tables under a temporary name, and a
// table-qualified column inside a CHECK would point at the old table.
export function columnRef(column: SQLiteColumn): SQL {
  return sql`${sql.identifier(column.name)}`
}

function quoteLiteral(value: string): string {
  if (!SAFE_LITERAL_PATTERN.test(value)) {
    throw new Error(`Unsafe literal in a CHECK constraint: ${value}`)
  }
  return `'${value}'`
}

export function isOneOf(column: SQLiteColumn, values: readonly string[]): SQL {
  return sql`${columnRef(column)} IN (${sql.raw(values.map(quoteLiteral).join(", "))})`
}

export function equalsLiteral(column: SQLiteColumn, value: string): SQL {
  return sql`${columnRef(column)} = ${sql.raw(quoteLiteral(value))}`
}

export function isNonNegative(column: SQLiteColumn): SQL {
  return sql`${columnRef(column)} >= 0`
}

export function isPositive(column: SQLiteColumn): SQL {
  return sql`${columnRef(column)} > 0`
}

export function isNullOrNonNegative(column: SQLiteColumn): SQL {
  return sql`${columnRef(column)} IS NULL OR ${columnRef(column)} >= 0`
}

export function isBusinessDate(column: SQLiteColumn): SQL {
  return sql`${columnRef(column)} GLOB '${sql.raw(BUSINESS_DATE_GLOB)}'`
}

export function isNullTogether(first: SQLiteColumn, second: SQLiteColumn): SQL {
  return sql`(${columnRef(first)} IS NULL) = (${columnRef(second)} IS NULL)`
}

export function isNotBlank(column: SQLiteColumn): SQL {
  return sql`length(trim(${columnRef(column)})) > 0`
}

export function isJsonArray(column: SQLiteColumn): SQL {
  return sql`json_valid(${columnRef(column)}) AND json_type(${columnRef(column)}) = 'array'`
}

export function isNullOrJsonObject(column: SQLiteColumn): SQL {
  return sql`${columnRef(column)} IS NULL OR (json_valid(${columnRef(column)}) AND json_type(${columnRef(column)}) = 'object')`
}

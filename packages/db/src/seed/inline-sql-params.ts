// `wrangler d1 execute --file` takes plain SQL, so the seed's bound parameters are written
// as literals. The SQL comes from Drizzle, whose only `?` characters are placeholders.
const PLACEHOLDER = "?"
const SINGLE_QUOTE = /'/g
const ESCAPED_SINGLE_QUOTE = "''"

export function inlineSqlParams(query: string, params: readonly unknown[]): string {
  const parts = query.split(PLACEHOLDER)
  if (parts.length - 1 !== params.length) {
    throw new Error(`Expected ${parts.length - 1} params, got ${params.length}`)
  }
  return parts.reduce((sql, part, index) => `${sql}${toSqlLiteral(params[index - 1])}${part}`)
}

export function toSqlLiteral(value: unknown): string {
  if (value === null) {
    return "NULL"
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }
  if (typeof value === "string") {
    return `'${value.replace(SINGLE_QUOTE, ESCAPED_SINGLE_QUOTE)}'`
  }
  throw new Error(`Cannot write ${String(value)} as a SQL literal`)
}

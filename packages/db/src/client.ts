import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"

export function createDatabase(d1: D1Database) {
  return drizzle(d1, { schema })
}

export type Database = ReturnType<typeof createDatabase>

// Re-exported so apps query through this package's drizzle-orm and never resolve a second copy.
export { and, count, eq } from "drizzle-orm"

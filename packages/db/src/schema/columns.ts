import { type EnumValue, enumValues } from "@workspace/contracts"
import { integer, text } from "drizzle-orm/sqlite-core"

export const INITIAL_VERSION = 1

// Every time is epoch ms.
export function createdAt() {
  return integer("created_at").notNull()
}

export function updatedAt() {
  return integer("updated_at").notNull()
}

export function archivedAt() {
  return integer("archived_at")
}

// Optimistic concurrency for online edits: a stale version gets 409.
export function version() {
  return integer("version").notNull().default(INITIAL_VERSION)
}

export function sortOrder() {
  return integer("sort_order").notNull().default(0)
}

export function isActive() {
  return integer("is_active", { mode: "boolean" }).notNull().default(true)
}

// A text column typed by a contracts `as const` enum. Pair it with an `isOneOf` CHECK.
export function enumText<T extends Record<string, string>>(name: string, enumObject: T) {
  const values = enumValues(enumObject) as [EnumValue<T>, ...EnumValue<T>[]]
  return text(name, { enum: values })
}

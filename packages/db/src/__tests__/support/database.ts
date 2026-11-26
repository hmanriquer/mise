import { env } from "cloudflare:workers"
import { drizzle } from "drizzle-orm/d1"
import { expect } from "vitest"
import * as schema from "../../schema"
import { buildSeedRows, buildSeedStatements, MENU_SEED } from "../../seed"

export const SEEDED_AT_MS = Date.parse("2026-11-20T18:00:00.000Z")

export function testDatabase() {
  return drizzle(env.DB, { schema })
}

export async function runSeed(nowMs: number = SEEDED_AT_MS): Promise<void> {
  const statements = buildSeedStatements(buildSeedRows(MENU_SEED, nowMs))
  await env.DB.batch(statements.map((statement) => env.DB.prepare(statement)))
}

// D1 reports the failing constraint by name; Drizzle wraps it in `cause`.
export async function expectConstraintFailure(query: Promise<unknown>, constraint: string) {
  const error = await query.then(
    () => null,
    (reason: unknown) => reason,
  )
  expect(error, `expected ${constraint} to reject the write`).toBeInstanceOf(Error)
  const cause = (error as Error).cause
  const message = cause instanceof Error ? cause.message : String(error)
  expect(message).toContain(constraint)
}

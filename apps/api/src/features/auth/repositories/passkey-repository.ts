import { count, type Database, eq, passkey } from "@workspace/db"

export function createPasskeyRepository(db: Database) {
  return {
    async countForUser(userId: string): Promise<number> {
      const [row] = await db
        .select({ total: count() })
        .from(passkey)
        .where(eq(passkey.userId, userId))
      return row?.total ?? 0
    },
  }
}

export type PasskeyRepository = ReturnType<typeof createPasskeyRepository>

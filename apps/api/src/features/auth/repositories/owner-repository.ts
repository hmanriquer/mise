import { account, type Database, user } from "@workspace/db"

export type OwnerUserRow = typeof user.$inferInsert
export type OwnerAccountRow = typeof account.$inferInsert

export function createOwnerRepository(db: Database) {
  return {
    async hasAnyUser(): Promise<boolean> {
      const rows = await db.select({ id: user.id }).from(user).limit(1)
      return rows.length > 0
    },
    // One batch, so the owner never exists without its password account.
    async insertOwner(owner: { user: OwnerUserRow; account: OwnerAccountRow }): Promise<void> {
      await db.batch([db.insert(user).values(owner.user), db.insert(account).values(owner.account)])
    },
  }
}

export type OwnerRepository = ReturnType<typeof createOwnerRepository>

import { auditLog, type Database } from "@workspace/db"

export type AuditLogRow = typeof auditLog.$inferInsert

export function createAuditLogRepository(db: Database) {
  return {
    async insert(row: AuditLogRow): Promise<void> {
      await db.insert(auditLog).values(row)
    },
  }
}

export type AuditLogRepository = ReturnType<typeof createAuditLogRepository>

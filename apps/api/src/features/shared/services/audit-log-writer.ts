import type { AuditLogRepository } from "../repositories/audit-log-repository"
import type { AuditEntry } from "../types/audit-entry"
import type { Clock, IdGenerator } from "../types/ports"

type AuditLogWriterDependencies = {
  repository: AuditLogRepository
  clock: Clock
  idGenerator: IdGenerator
}

export function createAuditLogWriter({
  repository,
  clock,
  idGenerator,
}: AuditLogWriterDependencies) {
  return {
    async record(entry: AuditEntry): Promise<void> {
      await repository.insert({
        id: idGenerator.next(),
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        occurredAt: clock.now(),
      })
    },
  }
}

export type AuditLogWriter = ReturnType<typeof createAuditLogWriter>

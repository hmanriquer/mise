import type { AuditAction } from "@workspace/contracts"

// Details are small facts (method, outcome, counts). Never passwords, tokens or credentials.
export type AuditDetails = Record<string, string | number | boolean>

export type AuditEntry = {
  action: AuditAction
  entityType?: string
  entityId?: string
  details?: AuditDetails
}

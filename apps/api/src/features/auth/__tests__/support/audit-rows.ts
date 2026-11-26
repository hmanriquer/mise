import { env } from "cloudflare:workers"
import type { AuditAction } from "@workspace/contracts"

type AuditRow = { action: string; entity_id: string | null; details: string | null }

export async function auditRows(action: AuditAction) {
  const { results } = await env.DB.prepare(
    "SELECT action, entity_id, details FROM audit_log WHERE action = ? ORDER BY occurred_at",
  )
    .bind(action)
    .all<AuditRow>()
  return results.map((row) => ({
    entityId: row.entity_id,
    details: row.details === null ? null : (JSON.parse(row.details) as Record<string, unknown>),
  }))
}

export async function allAuditText(): Promise<string> {
  const { results } = await env.DB.prepare("SELECT * FROM audit_log").all()
  return JSON.stringify(results)
}

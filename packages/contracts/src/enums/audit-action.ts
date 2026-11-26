import { z } from "zod"
import type { EnumValue } from "./enum-values"

export const AUDIT_ACTION = {
  authBootstrap: "auth.bootstrap",
  authSignIn: "auth.sign_in",
  authPasskeyAdded: "auth.passkey_added",
  authPasskeyRenamed: "auth.passkey_renamed",
  authPasskeyDeleted: "auth.passkey_deleted",
  authPasswordChanged: "auth.password_changed",
  authSessionsRevoked: "auth.sessions_revoked",
  orderVoid: "order.void",
  syncConflict: "sync.conflict",
  catalogPriceChanged: "catalog.price_changed",
  catalogCostChanged: "catalog.cost_changed",
  expenseUpdated: "expense.updated",
  expenseDeleted: "expense.deleted",
  profileUpdated: "profile.updated",
  deviceRegistered: "device.registered",
  deviceUpdated: "device.updated",
  deviceRevoked: "device.revoked",
} as const

export const auditActionSchema = z.enum(AUDIT_ACTION)

export type AuditAction = EnumValue<typeof AUDIT_ACTION>

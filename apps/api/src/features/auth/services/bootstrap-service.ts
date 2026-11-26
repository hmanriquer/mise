import { AUDIT_ACTION, type BootstrapRequest } from "@workspace/contracts"
import type { AuditLogWriter, Clock, IdGenerator } from "../../shared"
import { CREDENTIAL_PROVIDER_ID } from "../constants/auth-endpoints"
import { OWNER_ENTITY_TYPE } from "../constants/auth-settings"
import { isSameSecret } from "../helpers/is-same-secret"
import type { OwnerRepository } from "../repositories/owner-repository"

export const BOOTSTRAP_OUTCOME = { created: "created", ownerExists: "owner_exists" } as const

export type BootstrapResult =
  | { outcome: typeof BOOTSTRAP_OUTCOME.created; userId: string }
  | { outcome: typeof BOOTSTRAP_OUTCOME.ownerExists }

type BootstrapServiceDependencies = {
  expectedToken: string | undefined
  owners: OwnerRepository
  hashPassword: (password: string) => Promise<string>
  auditLog: AuditLogWriter
  clock: Clock
  idGenerator: IdGenerator
}

export function createBootstrapService(dependencies: BootstrapServiceDependencies) {
  const { expectedToken, owners, hashPassword, auditLog, clock, idGenerator } = dependencies

  return {
    async isAuthorized(providedToken: string | undefined): Promise<boolean> {
      if (!expectedToken || !providedToken) {
        return false
      }
      return isSameSecret(providedToken, expectedToken)
    },

    async createOwner(request: BootstrapRequest): Promise<BootstrapResult> {
      if (await owners.hasAnyUser()) {
        return { outcome: BOOTSTRAP_OUTCOME.ownerExists }
      }
      const userId = idGenerator.next()
      const now = new Date(clock.now())
      await owners.insertOwner({
        user: { id: userId, name: request.name, email: request.email, emailVerified: true },
        account: {
          id: idGenerator.next(),
          accountId: userId,
          providerId: CREDENTIAL_PROVIDER_ID,
          userId,
          password: await hashPassword(request.password),
          createdAt: now,
          updatedAt: now,
        },
      })
      await auditLog.record({
        action: AUDIT_ACTION.authBootstrap,
        entityType: OWNER_ENTITY_TYPE,
        entityId: userId,
      })
      return { outcome: BOOTSTRAP_OUTCOME.created, userId }
    },
  }
}

export type BootstrapService = ReturnType<typeof createBootstrapService>

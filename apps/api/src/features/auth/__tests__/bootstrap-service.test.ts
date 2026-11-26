import { AUDIT_ACTION } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import type { AuditEntry, AuditLogWriter } from "../../shared"
import type { OwnerRepository } from "../repositories/owner-repository"
import { BOOTSTRAP_OUTCOME, createBootstrapService } from "../services/bootstrap-service"

const TOKEN = "bootstrap-token-0123456789abcdef0123"
const NOW_MS = Date.parse("2026-11-26T18:00:00.000Z")
const REQUEST = { email: "dueno@example.com", name: "Dueño", password: "una-clave-larga" }
const HASHED = "hashed:una-clave-larga"

function buildService(options: { expectedToken?: string; hasUser?: boolean } = {}) {
  const inserted: Parameters<OwnerRepository["insertOwner"]>[0][] = []
  const audited: AuditEntry[] = []
  let nextId = 0
  const owners: OwnerRepository = {
    hasAnyUser: async () => options.hasUser ?? false,
    insertOwner: async (owner) => {
      inserted.push(owner)
    },
  }
  const auditLog: AuditLogWriter = { record: async (entry) => void audited.push(entry) }
  const service = createBootstrapService({
    expectedToken: "expectedToken" in options ? options.expectedToken : TOKEN,
    owners,
    hashPassword: async (password) => `hashed:${password}`,
    auditLog,
    clock: { now: () => NOW_MS },
    idGenerator: { next: () => `id-${++nextId}` },
  })
  return { service, inserted, audited }
}

describe("bootstrap service", () => {
  it("authorizes only the configured token", async () => {
    const { service } = buildService()

    expect(await service.isAuthorized(TOKEN)).toBe(true)
    expect(await service.isAuthorized(`${TOKEN}x`)).toBe(false)
    expect(await service.isAuthorized(undefined)).toBe(false)
  })

  it("authorizes nothing once the token secret is deleted", async () => {
    const { service } = buildService({ expectedToken: undefined })

    expect(await service.isAuthorized(TOKEN)).toBe(false)
  })

  it("creates the owner with a hashed password account and audits it", async () => {
    const { service, inserted, audited } = buildService()

    const result = await service.createOwner(REQUEST)

    expect(result).toEqual({ outcome: BOOTSTRAP_OUTCOME.created, userId: "id-1" })
    expect(inserted).toEqual([
      {
        user: { id: "id-1", name: REQUEST.name, email: REQUEST.email, emailVerified: true },
        account: {
          id: "id-2",
          accountId: "id-1",
          providerId: "credential",
          userId: "id-1",
          password: HASHED,
          createdAt: new Date(NOW_MS),
          updatedAt: new Date(NOW_MS),
        },
      },
    ])
    expect(audited).toEqual([
      { action: AUDIT_ACTION.authBootstrap, entityType: "user", entityId: "id-1" },
    ])
  })

  it("creates nothing when an owner already exists", async () => {
    const { service, inserted, audited } = buildService({ hasUser: true })

    expect(await service.createOwner(REQUEST)).toEqual({ outcome: BOOTSTRAP_OUTCOME.ownerExists })
    expect(inserted).toEqual([])
    expect(audited).toEqual([])
  })
})

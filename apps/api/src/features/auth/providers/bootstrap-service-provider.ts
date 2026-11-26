import { randomIdGenerator, systemClock } from "../../shared"
import { createOwnerRepository } from "../repositories/owner-repository"
import { createBootstrapService } from "../services/bootstrap-service"
import type { AuthVariables } from "../types/auth-app-env"

export async function bootstrapServiceFrom(variables: AuthVariables) {
  const authContext = await variables.auth.$context
  return createBootstrapService({
    expectedToken: variables.authEnv.OWNER_BOOTSTRAP_TOKEN,
    owners: createOwnerRepository(variables.db),
    // Better Auth's own hasher, so the password fallback verifies what bootstrap stored.
    hashPassword: authContext.password.hash,
    auditLog: variables.auditLog,
    clock: systemClock,
    idGenerator: randomIdGenerator,
  })
}

import type { Database } from "@workspace/db"
import type { Env } from "../schemas/env-schema"

export type AppVariables = { env: Env; db: Database }

export type AppEnv = {
  Bindings: Record<string, unknown>
  Variables: AppVariables
}

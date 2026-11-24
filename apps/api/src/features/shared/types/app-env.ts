import type { Env } from "../schemas/env-schema"

export type AppEnv = {
  Bindings: Record<string, unknown>
  Variables: { env: Env }
}

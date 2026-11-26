// Only for `pnpm --filter api auth:schema`: the Better Auth CLI reads the plugins and fields
// from this instance to write the Drizzle schema. It never runs a query.
import { createDatabase } from "@workspace/db"
import { createAuth } from "../src/features/auth/providers/create-auth"

const PLACEHOLDER_SECRET = "schema-generation-only-placeholder-secret"
const PLACEHOLDER_ORIGIN = "http://localhost:3000"
const PLACEHOLDER_RP_ID = "localhost"

export const auth = createAuth({
  env: {
    AUTH_RP_ID: PLACEHOLDER_RP_ID,
    AUTH_ORIGIN: PLACEHOLDER_ORIGIN,
    BETTER_AUTH_SECRET: PLACEHOLDER_SECRET,
  },
  db: createDatabase({} as D1Database),
})

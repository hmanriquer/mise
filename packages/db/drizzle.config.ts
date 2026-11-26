import { defineConfig } from "drizzle-kit"

// `wrangler d1 migrations apply` reads the SQL files from this folder (see apps/api/wrangler.jsonc).
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema/index.ts",
  out: "./migrations",
})

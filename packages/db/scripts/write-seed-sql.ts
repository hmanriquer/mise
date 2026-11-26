import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { buildSeedRows, buildSeedStatements, MENU_SEED } from "../src/seed"

// `pnpm db:seed:local` and `pnpm db:seed:remote` pass this file to `wrangler d1 execute`.
const SEED_SQL_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../dist/seed.sql")
const STATEMENT_SEPARATOR = ";\n"

const statements = buildSeedStatements(buildSeedRows(MENU_SEED, Date.now()))
mkdirSync(dirname(SEED_SQL_PATH), { recursive: true })
writeFileSync(SEED_SQL_PATH, `${statements.join(STATEMENT_SEPARATOR)}${STATEMENT_SEPARATOR}`)
console.log(`Wrote ${statements.length} seed statements to ${SEED_SQL_PATH}`)

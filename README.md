# Mise

Offline-first point of sale for a to-go micro food business (Reina de Espadas), built with TanStack Start, Hono and Cloudflare D1 on free tiers.

Build plan and status: [tracker #22](https://github.com/hmanriquer/mise/issues/22).

## Requirements

- Node.js 22.12 or newer (CI uses 24).
- pnpm, pinned through the `packageManager` field in `package.json`. Corepack or the pnpm CLI reads it automatically.

## Local development

```sh
pnpm install
pnpm db:migrate:local
pnpm db:seed:local
pnpm dev
```

Open http://localhost:3000. It serves the SPA and forwards `/api/*` to `mise-api` on the same origin, through a Service Binding.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Runs the web app and `mise-api` locally (http://localhost:3000). |
| `pnpm build` | Builds every package and app. |
| `pnpm lint` | Runs Biome checks. |
| `pnpm format` | Formats and fixes with Biome. |
| `pnpm typecheck` | Runs strict TypeScript checks in every package. |
| `pnpm test` | Runs the unit and component tests. |
| `pnpm test:e2e` | Runs the Playwright end-to-end tests (builds and previews the web app). |
| `pnpm check:lines` | Fails when a file exceeds the non-blank line limits. |
| `pnpm check:deps` | Fails when a forbidden package (Radix, Lucide) appears in a `package.json`. |
| `pnpm db:generate` | Generates a D1 migration in `packages/db/migrations` from the Drizzle schema. |
| `pnpm db:migrate:local` / `db:migrate:remote` | Applies pending migrations to the local or production D1 (`mise`). |
| `pnpm db:seed:local` / `db:seed:remote` | Inserts the Reina de Espadas menu. Safe to re-run: rows that exist are left as they are. |

## Layout

```
apps/web            TanStack Start SPA + fetch handler that forwards /api/* to mise-api
apps/api            Hono Worker (mise-api)
packages/ui         generated shadcn components (@workspace/ui)
packages/contracts  zod schemas, as-const enums, money/date helpers, canonical payload hash
packages/db         Drizzle schema, D1 migrations and the typed menu seed
packages/config     shared tsconfig, Biome config and check scripts
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`. It builds the repo, deploys `mise-api` first, then `mise-web`, then smoke-tests `/api/health`.

- **Required secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- **Optional variable:** `MISE_WEB_URL` (for example `https://mise-web.<account>.workers.dev`). When it is unset, the smoke test is skipped with a notice.
- **First deploy:** `mise-api` must exist before `mise-web`, because the Service Binding in `mise-web` points at it. The workflow already deploys in that order.
- **D1 migrations:** the workflow runs `pnpm db:migrate:remote` before the API deploy. Write migrations so the previous API version still works against the new schema.
- **First deploy:** create the database once with `pnpm --filter api exec wrangler d1 create mise` (the config finds it by name, so no `database_id` is committed). After the first deploy, run `pnpm db:seed:remote` once to load the menu. Do not re-run it to "reset" the menu: it only inserts missing rows.

## Changing the domain

Production is `mise-web.<account>.workers.dev` for now. It moves to `espadas.lat` later. Passkeys, cookies and WebUSB permissions are all tied to the origin, so a domain change needs these steps, in this order:

1. Sync every device's offline outbox on the old origin first.
2. Update `AUTH_RP_ID` and `AUTH_ORIGIN` to the new domain.
3. The owner signs in once with the recovery password on the new domain, registers new passkeys and removes the old ones (passkeys are bound to the rpID).
4. Reinstall the PWA on every device.
5. Log in again on every device (cookies are per origin).
6. On Android, re-pair the printer over WebUSB (permission is per origin).

`/api/*` stays same-origin through `mise-web` on any domain.

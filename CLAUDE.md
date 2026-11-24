# Mise

Offline-first point of sale for **Reina de Espadas**, a small to-go food business ("Sabor digno de la realeza"). There is one owner and two devices: a Windows PC and an Android tablet, both printing to a 58 mm **POS58C3** USB thermal printer. Everything runs on Cloudflare **free tiers**.

## Where the truth lives

Read these before you plan or build an issue. Where they disagree, use the first one that applies:

1. **Hamed's dated decisions**: the "Decisions" section of the tracker [#22](https://github.com/hmanriquer/mise/issues/22) and "Decisiones de Hamed 2026-11-20" in `mocks/NOTES.md`.
2. **The issue body** you are working on (`gh issue view <n>`). Its acceptance criteria are the definition of done.
3. **Locked mocks** in `mocks/` (`shots/*-pc.png`, `shots/*-tablet.png`, `OVERVIEW.png`, `NOTES.md`). The shadcn app in `mocks/app/` is for reference only. Never import from it or copy it as production code.
4. **`docs/SPEC.md`** (Mise SPEC v0.4). It is committed with #2 and does not exist yet. Issues cite it as "SPEC §x.y".
5. **ADRs** in `docs/adr/`. Printing (`0001-printing.md`) comes from #4.

The mocks and tracker deliberately override the SPEC on these points:
- The login route is `/login`, not `/entrar`, and `/entrar` redirects to it.
- After login the owner lands on **Inicio `/`**, not `/vender`.
- Passkey is the main login and password is the fallback.
- DiDi Food is a manual record.

Issues labelled `status: blocked` wait on mocks from Critiquito: #12 (setup screen), #13, #14, #15, #18, #19 and #20. Do not build their UI until Hamed approves a mock or waives it. Their non-UI parts (API, domain logic, transports) may start once their dependencies land.

## Status and build order

The repo currently holds only `mocks/` and a README, and there is no app code yet. Issue **#2** (monorepo foundation) blocks every other issue. #1 (Tauri + Axum) is closed and superseded, so ignore it.

- **M1, can sell:** #2 → #3 → #4 (printing spike, needs the physical printer) → #5 → #6 → #7 → #8 → #9 → #10 → #11 → #12
- **M2, can run the business:** #13, #14, #15, #16, #17, #18
- **M3, polish and handover:** #19, #20, #21

Each issue lists its dependencies. Do not start an issue before its dependencies are merged.

## Stack

- **Monorepo:** pnpm workspaces and Turborepo, scaffolded by the shadcn CLI: `pnpm dlx shadcn@latest init --preset b6Cf5S2iOm --template start --monorepo`.
- **Web (`apps/web`):** TanStack Start in **SPA mode** (`spa: { enabled: true }`) with `@cloudflare/vite-plugin`, deployed as Worker `mise-web`. It also uses TanStack Router, Query, Form and Table.
- **API (`apps/api`):** Hono on Worker `mise-api` with `nodejs_compat`. Env bindings are validated with zod.
- **Same origin:** `mise-web` forwards `/api/*` to `mise-api` through a **Service Binding**, so cookies, passkeys and WebUSB permissions all live on one origin. Never call the API cross-origin.
- **Database:** Cloudflare D1 (`mise`) with Drizzle (`drizzle-orm/d1`). Migrations: `drizzle-kit generate` → `wrangler d1 migrations apply mise`.
- **Auth:** Better Auth on D1 with `@better-auth/passkey`.
- **Client data:** **Ky** is the only HTTP client. **TanStack Query** owns all server state. **Zustand** holds client state and state machines. **Zod** is the only validator, on both sides of the wire.
- **Offline client:** Dexie (IndexedDB) for the outbox and snapshots. The service worker is built with `workbox-build` as a **post-build step**, because vite-plugin-pwa and Serwist do not work under TanStack Start production builds.
- **UI:** shadcn/ui preset `b6Cf5S2iOm`:
  - style `base-maia`, base Mauve, pink theme
  - primitives from **Base UI** (`@base-ui/react`), icons from **Hugeicons**
  - Inter for body text, Manrope for `font-heading`
  - primary `oklch(0.525 0.223 3.958)`, radius `0.625rem`, Recharts for charts, Sonner for toasts
- **Printing:** `@point-of-sale/receipt-printer-encoder` for ESC/POS.
- **Tooling:** **Biome** is the only linter and formatter (no ESLint or Prettier). TypeScript is strict everywhere.
- **Tests:** Vitest for unit tests. Vitest with `happy-dom` and Testing Library for component tests. Vitest with `@cloudflare/vitest-pool-workers` for API integration tests. Playwright, fully parallel, for E2E. See [Testing rules](#testing-rules).
- **CI:** GitHub Actions. `ci.yml` runs on PRs (frozen install, `biome ci`, typecheck, unit tests, build). `deploy.yml` runs on `main`: it applies remote D1 migrations, then deploys `mise-api`, then `mise-web`.

### Layout (planned in #2)

```
apps/web          TanStack Start SPA + fetch handler that forwards /api/* to mise-api
apps/api          Hono Worker
packages/ui       generated shadcn components (@workspace/ui)
packages/contracts  zod schemas, as-const enums, money/date helpers, canonical payload hash
packages/db       Drizzle schema, migrations (incl. Better Auth tables), typed menu seed
packages/config   shared tsconfig + Biome config
docs/             SPEC.md, adr/, guia-del-dueno.md (es-MX), runbook.md (en)
```

### Commands

Once #2 and #3 land, these exist (check the root `package.json`):

- `pnpm dev` runs both Workers locally with the Service Binding.
- `pnpm db:migrate:local` and `pnpm db:seed:local` (the seed is idempotent).
- `biome ci`, typecheck, `vitest`, Playwright.

Update this section when the real scripts exist.

## Hard constraints

- **Free tier only.** No Workers Paid. No R2 (it needs a payment method on file). D1 is fixed.
  - Workers get **10 ms CPU per request**. The scrypt password login overruns it, which is accepted as a rare event. Passkey verification fits.
  - Keep each request to one `db.batch()` or **≤ 5 queries**.
  - The free tier resets at 18:00 Mexico City time.
  - D1 Free keeps only 7 days of Time Travel. CSV export (#20) is the long-term backup.
- **Do not touch the preset.** Commit `components.json` exactly as the CLI writes it. Never edit theme tokens. That includes the input border at **1.26:1** contrast, below the 3:1 AA target: Hamed accepted it.
- **No Radix and no Lucide** in any `package.json`. Use Base UI and Hugeicons.
- **Compose shadcn components; no custom primitives.** Add components with `pnpm dlx shadcn@latest add`.
- **File size limits are MUST rules.** See [Code rules](#code-rules-must). Clean Code and SOLID are also MUST rules: code that breaks them does not ship.
- **No magic strings or numbers.** Use named constants, for example `SYNC_BATCH_SIZE`, `MAX_CLOCK_SKEW_MS`, `SYNC_INTERVAL_MS`, `SYNC_BACKOFF_MAX_MS`, `TICKET_CHARS_PER_LINE`, `WEEK_START`, `EXPENSE_MAX_CENTS` and `COST_SUGGESTION_MIN_DAYS`.
- **UI copy is es-MX** and lives in each feature's `constants/copy.ts`, never inline in components. Code, comments, commits, PRs and `docs/runbook.md` are in English. The owner guide is in es-MX.
- **Never log secrets.** No passwords, tokens or credential material in `audit_log`, logs or errors.

## Domain rules

- **Money** is integer **centavos** everywhere. Use `toCents` and `formatMxn` from contracts. Do no money math in the UI: reports come from the API's tested service.
- **Time** is stored as epoch ms. The **business date** is `YYYY-MM-DD` in `America/Mexico_City` (`BUSINESS_TIME_ZONE`, `toBusinessDate`). There is no business-day cutoff: a sale after midnight belongs to the new day. Weeks start on Monday.
- **Channels and payments** come from `ALLOWED_PAYMENTS_BY_CHANNEL`:
  - `counter` ("Mostrador") accepts `cash` ("Efectivo") and `card_terminal` ("Terminal propia").
  - `didi_food` accepts only `didi_food`.
  - There is no payment gateway.
- **DiDi Food is a manual record.** There is no DiDi API.
  - Payment is fixed to DiDi Food.
  - There is no cash, received amount or change.
  - "Folio DiDi" (`external_ref`) is optional.
  - Only the **kitchen ticket** prints.
- **DiDi prices are placeholders** (`is_placeholder = true`, equal to the counter prices) until the client sends the real list. While any placeholder exists, Vender shows one "precios de ejemplo" alert, with no badge on each price.
- **Estimated cost is nullable.** NULL means unknown. `cost_source` is `manual`, `suggested` or null. Margin is computed only over sales whose cost is known, and `costCoverage` is reported.
- **Menu (seed):** Banderilla has Sabor (Sencilla, Flamin' Hot, Flamin' Blue, Coreana) × Relleno (Mini Salchicha, Mini Queso, Salchicha, Combinada, Queso), which gives **20 variants**. There are 2 Papas and 6 Bebidas, for 3 categories, 9 products and 28 variants in total. The menu data lives in one typed seed file, not inline SQL.
- **Orders are immutable, append-only facts** that store snapshots of names, prices and costs. A price change never rewrites a past order.
  - A void is a separate event (`OrderVoided`, with a required reason).
  - Voided orders and soft-deleted expenses are excluded from every total.
- **The server never rejects an order because prices changed.** It accepts the order and flags it: `price_drift` when the price changed, `clock_skew` when `soldAt` is in the future.
- **Offline first.** Every checkout writes to the Dexie **outbox first**, online or not.
  - Event ids are **UUIDv7**.
  - `payloadHash` is SHA-256 of canonical JSON, built by **one shared function in `packages/contracts`** so the client and server always agree.
  - The server recomputes the hash.
  - Inserts use `ON CONFLICT(id) DO NOTHING`. The same hash returns `duplicate`; a different hash returns `conflict`.
  - Sync batches are ≤ 25 events, and the server returns `413` above that.
  - The client removes an entry only on `accepted` or `duplicate`.
- **Folios** are `{deviceCode}-{seq}` (for example `A-042`). Device codes are letters A to Z. On an online start the client reconciles: `max(local, server) + 1`.
- **Catalog edits are online only** and use optimistic `version`. A stale version returns `409`. Saving bumps the catalog version so devices refresh through the ETag.
- **Audit** auth events, voids, sync conflicts, and changes to prices, costs, the profile and devices in `audit_log`.

## Auth (#5)

- **Passkeys are the everyday login.** Use `residentKey: 'required'` and `userVerification: 'required'`, with rpID and origin taken from the validated env vars `AUTH_RP_ID` and `AUTH_ORIGIN`. The owner can have several passkeys, one or more per device.
- **Email and password is the rare fallback and recovery path.**
  - Sign-up is disabled.
  - Passwords are at least 12 characters.
  - Sign-in is limited to 5 attempts per 15 minutes.
  - **Never weaken the hash parameters** to fit the CPU budget.
- **Bootstrap:** `POST /api/v1/bootstrap` with `X-Bootstrap-Token` (constant-time compare). It works only while `user` is empty and otherwise returns `410` or `401`.
- **Every `/api/v1/*` route uses `requireSession`**, except bootstrap. Mutations use `csrf()`. Responses use `secureHeaders()` with a CSP.
- **Sessions** are httpOnly, `Secure`, `SameSite=Lax`, and last 30 days with a 1-day sliding refresh.
- **Moving from `*.workers.dev` to `espadas.lat` breaks everything tied to the origin.** The domain move means:
  - every device syncs its outbox first
  - `AUTH_RP_ID` and `AUTH_ORIGIN` change to the new domain
  - the owner registers new passkeys
  - each device reinstalls the PWA, logs in again and re-pairs WebUSB

  Never change the domain casually.

## Printing (#4, #12)

- **Windows PC:** the vendor driver prints a 58 mm HTML ticket through `window.print()` in Chrome or Edge launched with `--kiosk-printing`, with the POS58 as the default printer. **No Zadig or WinUSB.**
- **Android tablet:** WebUSB sends raw ESC/POS bytes.
- **One `PrinterTransport` interface:** `KioskBrowserPrintTransport` and `WebUsbTransport` implement it and pass the same contract tests. Ticket builders are pure (`buildCustomerTicket`, `buildKitchenTicket`) and are snapshot-tested.
- **What prints:** a counter order prints the kitchen ticket ("comanda") first, then the customer ticket, which the owner can switch off. A DiDi order prints the kitchen ticket only.
- **Printing never blocks or undoes a sale.** On failure, show a "No se pudo imprimir" toast with "Reintentar".

## UI conventions

- **Viewports:** PC 1366×768 and tablet 1280×800, plus tablet portrait 800×1280. **Light mode only** for v1.
- **Shell:** a `sidebar` on PC and a `sheet` on tablet. Choose the tablet shell **explicitly**, because at 1280 px the shadcn sidebar would stay in desktop mode.
- **One solid magenta (primary) button per view.**
- **Touch targets** are ≥ 44 px (`min-h-11`).
- **Overlays, not routes:** Checkout is a `dialog` over `/vender`. The variant picker is a `dialog` on PC and a `drawer` on tablet. A banderilla is added in 3 taps.
- **Navigation:** Inicio `/`, Vender `/vender`, Pedidos `/pedidos`, Gastos `/gastos`, Tablero `/tablero`, Catálogo `/catalogo`, Ajustes `/ajustes`.
- **Service worker:** never auto-reload. Show the "Hay una nueva versión" / "Actualizar" Sonner prompt instead. Never serve `/api/*` from the SW cache.
- **Offline:** the shell still opens when the session check fails for lack of network. An expired session shows the non-blocking banner "Inicia sesión para sincronizar".

## Code rules (MUST)

Code that breaks any rule in this section does not ship. Reviews check it, and so do you before you call anything done.

### Clean Code and SOLID

- **Single responsibility.** One reason to change per file, function and component. A component renders; a hook or query fetches; a helper computes; a store holds state.
- **Open/closed.** Extend through composition, props and new adapters, not by editing working code with new `if` branches. Example: a new printer is a new `PrinterTransport`.
- **Liskov.** Every implementation of an interface passes that interface's contract tests.
- **Interface segregation.** Use small, specific props and interfaces. Don't pass a whole order where a component needs only the total.
- **Dependency inversion.** Depend on interfaces and inject them through providers, parameters or factories: the HTTP client, Dexie, the printer, the clock, the ID generator and the Drizzle instance. Never import a concrete singleton deep inside logic.
- **Clean Code:**
  - names that reveal intent, with no abbreviations
  - small functions that do one thing
  - no boolean flag parameters: split the function instead
  - early returns over nesting
  - no dead or commented-out code
  - no duplication: shared code moves to `shared`
  - comments explain why, never what

### Size limits

These are counted in **non-blank lines**:
- A **component file** has at most **150 lines**.
- **Any other file** has at most **200 lines**.

Biome has no file-length rule, so #2 adds a `check:lines` script to CI that fails on violations.

When a component would pass 150 lines, split it with the **composition pattern** into a folder named after the component:

```
cart-panel/
  cart-panel-header.tsx     # one file per section: header, list, item, footer, empty…
  cart-panel-list.tsx
  cart-panel-footer.tsx
  cart-panel-provider.tsx   # context shared by the parts (state, actions)
  types.ts
  index.ts                  # barrel: exports CartPanel.Root/Header/List/Footer (or named parts)
```

### Feature-based (screaming) architecture

The folder tree names the business (`selling`, `checkout`, `sync`, `printing`, `reports`), never technical layers at the top level. In `apps/web/src`:

```
src/
  app/                      # TanStack Start routes + root providers only; routes stay thin and import from features
  features/
    <feature>/              # e.g. selling, checkout, sync, printing, catalog, auth, home, dashboard
      components/           # presentational pieces of this feature
      sections/             # screen-level blocks composed from components (e.g. sell-cart-section)
      queries/              # TanStack Query hooks, query keys, query options, mutations
      providers/            # context providers and dependency injection for this feature
      helpers/              # pure functions: domain logic, mappers, formatters (e.g. priceCart)
      stores/               # Zustand stores and state machines
      constants/            # named constants and es-MX copy (copy.ts)
      types/                # feature types; zod-inferred where a schema exists
      __tests__/            # tests for this feature
      index.ts              # barrel: the feature's ONLY public surface
    shared/                 # same folders, for anything used by 2+ features:
      components/  sections/  queries/  providers/  helpers/
      stores/               # Zustand stores used across features (e.g. sync status, printer status)
      constants/            # app-wide constants and es-MX copy (e.g. layout/shell copy)
      types/  __tests__/  index.ts
```

- **Where code goes.** A constant, piece of copy or store lives in the feature's own `constants/` or `stores/`. It moves to `shared/constants/` or `shared/stores/` only when a second feature needs it. The same holds for every other folder.
- **Imports.** Other features import only through `features/<x>/index.ts`, never from a feature's internal files.
- **Dependencies point one way.** `shared` never imports from a feature. Two features never import from each other in a cycle.
- **Unused folders.** Omit any folder a feature doesn't need. Don't create empty ones.

### API structure (`apps/api/src`)

The API follows **the same rules and the same structure**:
- feature-based folders, plus `shared`
- a barrel per feature
- Clean Code and SOLID
- no magic values
- at most 200 non-blank lines per file

Only the folders that make no sense on a server (`components/`, `sections/`, `queries/`, `stores/`) are swapped for server ones:

```
src/
  app.ts                    # Hono app: mounts feature routes, global middleware; nothing else
  index.ts                  # Worker entry
  features/
    <feature>/              # e.g. auth, catalog, sync, devices, orders, expenses, reports, settings, exports
      routes/               # Hono handlers: parse with zod, call a service, map the result to HTTP; no logic
      services/             # business rules (validation, idempotency, formulas); no Hono, no SQL
      repositories/         # Drizzle queries; take the db instance as a parameter
      providers/            # dependency wiring for this feature (builds services from env bindings)
      helpers/              # pure functions
      constants/            # named constants, error/reason codes
      schemas/              # API-only zod schemas (shared ones live in packages/contracts)
      types/
      __tests__/
      index.ts              # barrel: exports the feature's routes (and anything another feature may use)
    shared/                 # middleware (requireSession, csrf, secure headers), env schema, db factory,
                            # audit-log writer, error mapping; same folder names as above
```

Dependencies flow one way: `routes → services → repositories`. Services receive repositories, the clock and the ID generator as parameters, so integration tests can swap them.

### Data flow

- **Thin server.** The server stores, validates and serves data. It does not hold UI logic, compose views or hold session-specific state.
  - **It still validates everything it receives,** including totals, hashes and channel/payment combinations. Never trust the client.
  - **Report aggregation stays on the server** (Hamed, 2026-11-23). It runs as SQL `GROUP BY` in one `db.batch()` (#16). Sending raw rows to the client would cost more D1 reads and bigger payloads.
- **Ky is the only HTTP client.**
  - Use one configured instance, created in `features/shared/helpers/` and injected through `features/shared/providers/`, with the `/api/v1` prefix, same-origin credentials, a timeout constant, and a hook that maps `401` to "session expired".
  - Disable Ky's own retries wherever TanStack Query or the sync engine already retries, so retries never stack.
  - Better Auth calls go through its own `authClient`, not Ky.
- **TanStack Query owns all server state.**
  - Each feature keeps its query keys and query options in `queries/`. Components never call Ky directly.
  - Server data is never copied into Zustand.
  - The persisted query cache (IndexedDB) backs the offline views (#17).
- **Zustand is for client state and state machines:** the cart, the checkout flow, sync engine status and printer status. Model these as explicit states and transitions, never as loose booleans.
  - Keep reducers and transitions as pure functions in `helpers/`, so they can be unit-tested without the store.
- **Zod is the only validator.**
  - Shared schemas and enums live in `packages/contracts`. Define enums as `as const` objects. DB CHECK constraints derive from the same enums.
  - Parse every API response, Dexie read, env binding and form (TanStack Form + zod).
  - Types come from `z.infer`, never written by hand next to a schema.

## Testing rules

### Tools

| Layer | Tool | Where |
| --- | --- | --- |
| Static analysis | Biome, `tsc --noEmit` (strict), `check:lines` | every package, CI |
| Unit | Vitest (node environment) | `helpers/`, stores, contracts, services |
| Component | Vitest + `happy-dom` + Testing Library (+ `user-event`) | `apps/web` components and sections |
| API integration | Vitest + `@cloudflare/vitest-pool-workers` with real local D1 and migrations applied; requests through `SELF.fetch`/`app.request()` | `apps/api` |
| E2E | Playwright, `fullyParallel: true`, workers sized to the machine (CI: number of cores) | `apps/web/e2e` |

Supertest and Testcontainers are not used. D1 runs inside the Workers runtime, so there is no container to start, and the Workers pool already gives real HTTP-level tests against real bindings. Hamed decided this on 2026-11-23.

### Pyramid

Aim for this share of the suite:

| Layer | Share |
| --- | --- |
| Static analysis | ~10–15% |
| Unit | ~20–25% |
| Integration and component | ~45–55% |
| E2E | ~10–15% |

Put most of the confidence in integration and component tests. E2E covers only the critical flows:
- login
- sell → checkout → outbox → sync
- working offline
- printing as far as a browser can test it

### Rules

- **No shared state between tests.**
  - Each test builds its own data with factories and gets a fresh store, fresh `QueryClient`, fresh Dexie database and fresh D1 state. The Workers pool isolates storage per test.
  - No test depends on another test or on their order.
  - Every E2E test uses its own browser context, so it gets its own auth state and virtual authenticator.
- **Never use hard-coded sleeps** (`waitForTimeout`, `setTimeout` in tests, `sleep`).
  - Wait for a user-visible condition: `findBy*`, Playwright web-first assertions, `expect.poll`.
  - Use Vitest fake timers for backoff, intervals and the clock.
- **Query by what the user sees.**
  - Use `getByRole` with an accessible name, then `getByLabelText`, then `getByText`.
  - Never use CSS classes, DOM structure or `nth-child`. Use `data-testid` only as a last resort, with a comment saying why.
  - Assertions use the es-MX copy constants, not repeated string literals.
- **Keep heavy dependencies out of unit and component imports.** Recharts, Dexie, the Better Auth client, the ESC/POS encoder and WebUSB stay behind interfaces injected through providers.
  - Unit and component tests import the feature under test and lightweight fakes. Use `fake-indexeddb` only where Dexie itself is what's being tested.
  - Barrels must not pull heavy modules into a test that doesn't need them.
- **Reuse expensive infrastructure across the suite.** Do the expensive setup once and share it. Each test's data stays isolated.
  - Apply migrations once per pool.
  - Start the web server once per Playwright run (`webServer`).
  - Build auth `storageState` once in a setup project, then copy it into each test's own context.
- **TDD for domain logic.** Write a failing test first, then make it pass. Turn every acceptance criterion that can be tested into a test.
- **Evidence some issues require in the PR:**
  - Worker CPU time from `wrangler tail` (#5)
  - D1 `rows_read` (#13, #16)
  - photos of printed tickets (#4)

## Workflow

- Use one branch and one PR per issue, and put `Closes #<n>` in the PR body. The issue's checklist is the PR's checklist.
- Commit messages use a short type prefix, for example `docs: …`, `mocks: …`, `feat(api): …`, `fix(web): …`.
- Issue titles follow `<emoji> <Area> | <summary>`. Labels: area (`api`, `web`, `infra`, `db`, `offline`, `printing`, `security`, `docs`) and `status: todo` / `status: blocked`.
- Keep the tracker #22 checkboxes and `status:` labels in sync when an issue closes or unblocks.
- Out of scope for v1, so don't add them:
  - end-of-day cash count ("corte de caja"), discounts and promos, modifiers or extras (line notes only)
  - product images, multiple users, 2FA, social login, theme customization
  - receipt photos, scheduled backups

## Project skills (`.claude/skills/`, pinned in `skills-lock.json`)

- **UI work:** `shadcn` (components, preset, CLI), `impeccable` (design polish and critique), `emil-design-eng` (interaction details), `web-design-guidelines` (review against Vercel's guidelines), `vercel-react-best-practices`.
- **Motion:** `animation-vocabulary`. Motion stays quiet in a POS.
- **API and data:** `backend-patterns`.
- **Scope discipline:** `ponytail`, which keeps every change the smallest one that fully solves the issue.
- **Rarely needed:** `theme-factory` and `brandkit`. The preset is locked, so don't use them to restyle the app.

## Known inconsistencies in the issues

Flag these rather than silently picking one:

- **Zadig:** #21 says "incl. Zadig or kiosk shortcut on Windows", but the decision is **no Zadig**. Document only the kiosk shortcut.
- **"Setup page used by 11":** #4's last acceptance criterion says this. The printer setup page belongs to #12.
- **PC viewport:** #6's acceptance criteria say "1280×800 (PC)", but the PC mocks are 1366×768. Verify against both sizes.
- **Old paths in issues:** the issues predate the feature structure. Map their paths onto it, not literally:
  - `features/<x>/domain` → `helpers/`
  - `features/<x>/copy.ts` and `shared/layout/copy.ts` → `constants/copy.ts`
  - `features/offline/db.ts` → `features/sync/` behind an injected interface
  - `features/catalog/catalog.service.ts` → `apps/api/src/features/catalog/services/`
- **Backend integration tests:** the 2026-11-23 rule says Vitest + Supertest + Testcontainers. Hamed replaced it with `vitest-pool-workers`, as described in Testing rules.

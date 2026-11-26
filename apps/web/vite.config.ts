import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const SSR_ENVIRONMENT_NAME = "ssr"
const API_WRANGLER_CONFIG = "../api/wrangler.jsonc"
// Shared with `wrangler d1 … --local` (run from apps/api), so `pnpm db:migrate:local` and
// `pnpm db:seed:local` fill the same local D1 that `pnpm dev` reads.
const LOCAL_STATE_PATH = "../api/.wrangler/state"
const ROUTER_ENTRY = "app/router.tsx"
const ROUTES_DIRECTORY = "app/routes"
const GENERATED_ROUTE_TREE = "app/routeTree.gen.ts"
// The Start plugin defines TSS_SHELL only for the dev server, so builds would otherwise
// server-render every route. Forcing it here makes production serve the root-only shell.
const SHELL_MODE_DEFINE_KEY = "process.env.TSS_SHELL"
const SHELL_MODE_ENABLED = JSON.stringify("true")

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  define: { [SHELL_MODE_DEFINE_KEY]: SHELL_MODE_ENABLED },
  plugins: [
    cloudflare({
      viteEnvironment: { name: SSR_ENVIRONMENT_NAME },
      auxiliaryWorkers: [{ configPath: API_WRANGLER_CONFIG }],
      persistState: { path: LOCAL_STATE_PATH },
    }),
    tailwindcss(),
    tanstackStart({
      spa: { enabled: true },
      router: {
        entry: ROUTER_ENTRY,
        routesDirectory: ROUTES_DIRECTORY,
        generatedRouteTree: GENERATED_ROUTE_TREE,
      },
    }),
    viteReact(),
  ],
})

export default config

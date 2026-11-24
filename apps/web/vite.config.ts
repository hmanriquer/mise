import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const SSR_ENVIRONMENT_NAME = "ssr"
const API_WRANGLER_CONFIG = "../api/wrangler.jsonc"
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

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

const config = defineConfig({
  resolve: { tsconfigPaths: true },
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

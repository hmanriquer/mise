const SHELL_PATH = "/_shell.html"
const API_PATH_DENYLIST = /^\/api(\/|$)/
const PRECACHE_GLOB_PATTERN = "**/*.{js,css,html,woff2,png,svg,webmanifest,txt}"

export function buildServiceWorkerConfig(clientDirectory) {
  return {
    globDirectory: clientDirectory,
    swDest: `${clientDirectory}/sw.js`,
    globPatterns: [PRECACHE_GLOB_PATTERN],
    navigateFallback: SHELL_PATH,
    navigateFallbackDenylist: [API_PATH_DENYLIST],
    skipWaiting: false,
    clientsClaim: false,
    cleanupOutdatedCaches: true,
  }
}

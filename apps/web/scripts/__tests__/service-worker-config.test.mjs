import { describe, expect, it } from "vitest"
import { buildServiceWorkerConfig } from "../service-worker-config.mjs"

const CLIENT_DIRECTORY = "dist/client"

function matchesDenylist(config, pathname) {
  return config.navigateFallbackDenylist.some((pattern) => pattern.test(pathname))
}

describe("buildServiceWorkerConfig", () => {
  it("falls back to the SPA shell for navigations", () => {
    const config = buildServiceWorkerConfig(CLIENT_DIRECTORY)

    expect(config.navigateFallback).toBe("/_shell.html")
  })

  it("never falls back to the shell for API paths", () => {
    const config = buildServiceWorkerConfig(CLIENT_DIRECTORY)

    expect(matchesDenylist(config, "/api")).toBe(true)
    expect(matchesDenylist(config, "/api/health")).toBe(true)
    expect(matchesDenylist(config, "/api/v1/sync")).toBe(true)
  })

  it("keeps SPA paths that only start with the letters api", () => {
    const config = buildServiceWorkerConfig(CLIENT_DIRECTORY)

    expect(matchesDenylist(config, "/apiary")).toBe(false)
    expect(matchesDenylist(config, "/vender")).toBe(false)
  })

  it("waits for the user before activating a new worker", () => {
    const config = buildServiceWorkerConfig(CLIENT_DIRECTORY)

    expect(config.skipWaiting).toBe(false)
    expect(config.clientsClaim).toBe(false)
  })

  it("precaches only the build output and has no runtime caching", () => {
    const config = buildServiceWorkerConfig(CLIENT_DIRECTORY)

    expect(config.globDirectory).toBe(CLIENT_DIRECTORY)
    expect(config.swDest).toBe(`${CLIENT_DIRECTORY}/sw.js`)
    expect(config.runtimeCaching).toBeUndefined()
  })
})

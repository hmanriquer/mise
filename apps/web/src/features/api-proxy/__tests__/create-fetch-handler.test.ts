import { describe, expect, it, vi } from "vitest"
import { createFetchHandler } from "../helpers/create-fetch-handler"
import type { FetchTarget } from "../types/fetch-target"

const ORIGIN = "http://x"
const API_LABEL = "api"
const APP_LABEL = "app"
const HEALTH_PATH = "/api/health"
const REQUEST_BODY = "b"

function createRecordingTarget(label: string) {
  const fetch = vi.fn(async (_request: Request) => new Response(label))
  const target: FetchTarget = { fetch }
  return { target, fetch }
}

function createTestHandler() {
  const api = createRecordingTarget(API_LABEL)
  const app = createRecordingTarget(APP_LABEL)
  const handler = createFetchHandler({ api: api.target, app: app.target })
  return { handler, api, app }
}

describe("createFetchHandler", () => {
  it.each([["/api/health"], ["/api"], ["/api/unknown"]])(
    "routes %s to the API target",
    async (path) => {
      const { handler, api, app } = createTestHandler()

      const response = await handler(new Request(`${ORIGIN}${path}`))

      expect(api.fetch).toHaveBeenCalledTimes(1)
      expect(app.fetch).not.toHaveBeenCalled()
      expect(await response.text()).toBe(API_LABEL)
    },
  )

  it.each([["/apiary"], ["/api-docs"], ["/vender"], ["/"]])(
    "routes %s to the app target",
    async (path) => {
      const { handler, api, app } = createTestHandler()

      const response = await handler(new Request(`${ORIGIN}${path}`))

      expect(app.fetch).toHaveBeenCalledTimes(1)
      expect(api.fetch).not.toHaveBeenCalled()
      expect(await response.text()).toBe(APP_LABEL)
    },
  )

  it("forwards the request unmodified: method, body and headers", async () => {
    const { handler, api } = createTestHandler()

    await handler(
      new Request(`${ORIGIN}${HEALTH_PATH}`, {
        method: "POST",
        body: REQUEST_BODY,
        headers: { "x-test": "1" },
      }),
    )

    const [forwarded] = api.fetch.mock.calls[0]
    expect(forwarded.method).toBe("POST")
    expect(forwarded.headers.get("x-test")).toBe("1")
    expect(await forwarded.text()).toBe(REQUEST_BODY)
  })
})

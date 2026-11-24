import { expect, test } from "@playwright/test"
import { HOME_COPY } from "../src/features/home/constants/copy"
import { SELL_COPY } from "../src/features/selling/constants/copy"
import { waitForServiceWorkerControl } from "./helpers/service-worker"

const HOME_PATH = "/"
const SELL_PATH = "/vender"
const API_HEALTH_PATH = "/api/health"
const API_UNKNOWN_PATH = "/api/nope"
const HTTP_OK = 200
const HTTP_NOT_FOUND = 404
const HEALTH_OK_STATUS = "ok"
const API_PATH_PATTERN = /^\/api(\/|$)/
const SERVED_RESULT = "served"
const FAILED_RESULT = "failed"

test.describe("offline shell", () => {
  test("reloads / and /vender offline", async ({ page, context }) => {
    // Only / is visited online: /vender must come from the install-time precache, not an earlier visit.
    await page.goto(HOME_PATH)
    await waitForServiceWorkerControl(page)

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole("heading", { level: 1, name: HOME_COPY.title })).toBeVisible()

    await page.goto(SELL_PATH)
    await expect(page.getByRole("heading", { level: 1, name: SELL_COPY.title })).toBeVisible()
  })

  test("never serves /api from the service worker cache", async ({ page, context }) => {
    await page.goto(HOME_PATH)
    await waitForServiceWorkerControl(page)

    const onlineStatus = await page.evaluate(
      (path) => fetch(path).then((response) => response.status),
      API_HEALTH_PATH,
    )
    expect(onlineStatus).toBe(HTTP_OK)

    const cachedUrls = await page.evaluate(async () => {
      const cacheNames = await caches.keys()
      const urlsPerCache = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name)
          return (await cache.keys()).map((request) => request.url)
        }),
      )
      return urlsPerCache.flat()
    })
    expect(cachedUrls.length).toBeGreaterThan(0)
    const cachedApiUrls = cachedUrls.filter((url) => API_PATH_PATTERN.test(new URL(url).pathname))
    expect(cachedApiUrls).toEqual([])

    await context.setOffline(true)
    const offlineResult = await page.evaluate(
      ({ path, servedResult, failedResult }) =>
        fetch(path).then(
          () => servedResult,
          () => failedResult,
        ),
      { path: API_HEALTH_PATH, servedResult: SERVED_RESULT, failedResult: FAILED_RESULT },
    )
    expect(offlineResult).toBe(FAILED_RESULT)
  })

  test("navigations under /api reach the API, not the SPA shell", async ({ page }) => {
    await page.goto(HOME_PATH)
    await waitForServiceWorkerControl(page)

    // A controlled navigation is what the navigateFallbackDenylist guards; fetch() subresources are not.
    const healthResponse = await page.goto(API_HEALTH_PATH)
    expect(healthResponse?.fromServiceWorker()).toBe(false)
    expect(healthResponse?.status()).toBe(HTTP_OK)
    expect(await healthResponse?.json()).toMatchObject({ status: HEALTH_OK_STATUS })

    const unknownResponse = await page.goto(API_UNKNOWN_PATH)
    expect(unknownResponse?.fromServiceWorker()).toBe(false)
    expect(unknownResponse?.status()).toBe(HTTP_NOT_FOUND)
  })
})

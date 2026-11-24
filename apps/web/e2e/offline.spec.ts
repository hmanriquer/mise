import { expect, test } from "@playwright/test"
import { HOME_COPY } from "../src/features/home/constants/copy"
import { SELL_COPY } from "../src/features/selling/constants/copy"
import { waitForServiceWorkerControl } from "./helpers/service-worker"

const HOME_PATH = "/"
const SELL_PATH = "/vender"
const API_HEALTH_PATH = "/api/health"
const HTTP_OK = 200
const API_PATH_PATTERN = /^\/api(\/|$)/
const SERVED_RESULT = "served"
const FAILED_RESULT = "failed"

test.describe("offline shell", () => {
  test("reloads / and /vender offline", async ({ page, context }) => {
    await page.goto(HOME_PATH)
    await waitForServiceWorkerControl(page)
    await page.goto(SELL_PATH)
    await page.goto(HOME_PATH)

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
})

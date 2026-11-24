import { expect, test } from "@playwright/test"
import { HOME_COPY } from "../src/features/home/constants/copy"
import { SELL_COPY } from "../src/features/selling/constants/copy"

const HOME_PATH = "/"
const HEALTH_PATH = "/api/health"
const HEALTH_OK_STATUS = "ok"
const HTTP_OK = 200
const MANIFEST_LINK_SELECTOR = 'link[rel="manifest"]'
const MANIFEST_NAME = "Mise"
const MANIFEST_START_URL = "/"
const HEADING_FONT_PATTERN = /Manrope/
const SHELL_PATH = "/_shell.html"
// Chromium reports oklch() colours back in the same notation, so the token is compared verbatim.
const PRIMARY_BACKGROUND = "oklch(0.525 0.223 3.958)"

test.describe("smoke", () => {
  test("renders the home page with the Manrope heading and magenta primary button", async ({
    page,
  }) => {
    await page.goto(HOME_PATH)

    const heading = page.getByRole("heading", { level: 1, name: HOME_COPY.title })
    await expect(heading).toBeVisible()
    await expect(heading).toHaveCSS("font-family", HEADING_FONT_PATTERN)

    await expect(page.getByRole("link", { name: HOME_COPY.newSale })).toHaveCSS(
      "background-color",
      PRIMARY_BACKGROUND,
    )
  })

  test("answers the API health check", async ({ request }) => {
    const response = await request.get(HEALTH_PATH)

    expect(response.status()).toBe(HTTP_OK)
    expect(await response.json()).toMatchObject({ status: HEALTH_OK_STATUS })
  })

  test("links a manifest that names the app and its start URL", async ({ page, request }) => {
    await page.goto(HOME_PATH)

    // The manifest link has no accessible role, so it is located by its rel attribute.
    const manifestHref = await page.locator(MANIFEST_LINK_SELECTOR).getAttribute("href")
    expect(manifestHref).not.toBeNull()

    const response = await request.get(manifestHref ?? "")
    expect(response.status()).toBe(HTTP_OK)
    expect(await response.json()).toMatchObject({
      name: MANIFEST_NAME,
      start_url: MANIFEST_START_URL,
    })
  })

  test("serves a root-only SPA shell with no pre-rendered page content", async ({ request }) => {
    const response = await request.get(SHELL_PATH)

    expect(response.status()).toBe(HTTP_OK)
    const body = await response.text()
    expect(body).not.toContain(HOME_COPY.subtitle)
    expect(body).not.toContain(SELL_COPY.subtitle)
  })
})

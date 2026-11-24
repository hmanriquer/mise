import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ROUTES } from "@/features/shared"
import { HOME_COPY } from "../constants/copy"
import { HomePlaceholderSection } from "../sections/home-placeholder-section"

function renderInRouter() {
  const rootRoute = createRootRoute({ component: HomePlaceholderSection })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [ROUTES.home] }),
  })
  return render(<RouterProvider router={router} />)
}

describe("HomePlaceholderSection", () => {
  it("shows the home heading", async () => {
    const screen = renderInRouter()

    expect(
      await screen.findByRole("heading", { level: 1, name: HOME_COPY.title }),
    ).toBeInTheDocument()
  })

  it("links the new sale button to the sell route", async () => {
    const screen = renderInRouter()

    const link = await screen.findByRole("link", { name: HOME_COPY.newSale })
    expect(link).toHaveAttribute("href", ROUTES.sell)
  })
})

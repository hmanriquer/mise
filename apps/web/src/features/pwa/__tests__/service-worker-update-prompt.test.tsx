import { act, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Toaster } from "@workspace/ui/components/sonner"
import { toast } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ServiceWorkerUpdatePrompt } from "../components/service-worker-update-prompt"
import { PWA_COPY } from "../constants/copy"
import type { UpdateHandler } from "../types/service-worker"

function renderPrompt() {
  let emitUpdateAvailable: UpdateHandler = () => {}
  const register = vi.fn((onUpdateAvailable: UpdateHandler) => {
    emitUpdateAvailable = onUpdateAvailable
  })
  const screen = render(
    <>
      <Toaster />
      <ServiceWorkerUpdatePrompt register={register} />
    </>,
  )
  return {
    screen,
    register,
    emitUpdateAvailable: (applyUpdate: () => void) => emitUpdateAvailable(applyUpdate),
  }
}

describe("ServiceWorkerUpdatePrompt", () => {
  afterEach(() => {
    toast.dismiss()
  })

  it("registers once on mount and shows nothing initially", () => {
    const { screen, register } = renderPrompt()

    expect(register).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(PWA_COPY.updateAvailable)).not.toBeInTheDocument()
  })

  it("shows the update prompt when an update is available", async () => {
    const { screen, emitUpdateAvailable } = renderPrompt()

    act(() => emitUpdateAvailable(vi.fn()))

    expect(await screen.findByText(PWA_COPY.updateAvailable)).toBeInTheDocument()
  })

  it("applies the update when the action is pressed", async () => {
    const user = userEvent.setup()
    const applyUpdate = vi.fn()
    const { screen, emitUpdateAvailable } = renderPrompt()
    act(() => emitUpdateAvailable(applyUpdate))

    await user.click(await screen.findByRole("button", { name: PWA_COPY.updateAction }))

    expect(applyUpdate).toHaveBeenCalledTimes(1)
  })
})

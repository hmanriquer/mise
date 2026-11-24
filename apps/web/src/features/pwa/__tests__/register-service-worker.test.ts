import { describe, expect, it, vi } from "vitest"
import { SERVICE_WORKER_URL, SKIP_WAITING_MESSAGE } from "../constants/service-worker"
import { registerServiceWorker } from "../helpers/register-service-worker"
import type { UpdateHandler } from "../types/service-worker"

class FakeWorker extends EventTarget {
  state: ServiceWorkerState = "installing"
  readonly postMessage = vi.fn()
}

class FakeRegistration extends EventTarget {
  installing: FakeWorker | null = null
  waiting: FakeWorker | null = null
}

class FakeContainer extends EventTarget {
  controller: FakeWorker | null = null
  readonly register = vi.fn(async () => this.registration)

  constructor(private readonly registration: FakeRegistration) {
    super()
  }
}

function setup(options: { controller?: FakeWorker; waiting?: FakeWorker } = {}) {
  const registration = new FakeRegistration()
  registration.waiting = options.waiting ?? null
  const container = new FakeContainer(registration)
  container.controller = options.controller ?? null
  const onUpdateAvailable = vi.fn<UpdateHandler>()
  const reload = vi.fn()
  const dependencies = {
    container: container as unknown as ServiceWorkerContainer,
    onUpdateAvailable,
    reload,
  }
  return { registration, container, onUpdateAvailable, reload, dependencies }
}

function installNewWorker(registration: FakeRegistration, worker: FakeWorker) {
  registration.installing = worker
  registration.dispatchEvent(new Event("updatefound"))
  registration.waiting = worker
  worker.state = "installed"
  worker.dispatchEvent(new Event("statechange"))
}

describe("registerServiceWorker", () => {
  it("registers the service worker script", async () => {
    const { container, dependencies } = setup()

    await registerServiceWorker(dependencies)

    expect(container.register).toHaveBeenCalledWith(SERVICE_WORKER_URL)
  })

  it("does not prompt when the first worker installs", async () => {
    const { registration, onUpdateAvailable, dependencies } = setup()

    await registerServiceWorker(dependencies)
    installNewWorker(registration, new FakeWorker())

    expect(onUpdateAvailable).not.toHaveBeenCalled()
  })

  it("prompts when a new worker installs over an active controller", async () => {
    const { registration, onUpdateAvailable, dependencies } = setup({
      controller: new FakeWorker(),
    })

    await registerServiceWorker(dependencies)
    installNewWorker(registration, new FakeWorker())

    expect(onUpdateAvailable).toHaveBeenCalledTimes(1)
  })

  it("prompts at registration when a waiting worker already exists", async () => {
    const { onUpdateAvailable, dependencies } = setup({
      controller: new FakeWorker(),
      waiting: new FakeWorker(),
    })

    await registerServiceWorker(dependencies)

    expect(onUpdateAvailable).toHaveBeenCalledTimes(1)
  })

  it("posts SKIP_WAITING and reloads only after the controller changes", async () => {
    const waitingWorker = new FakeWorker()
    const { container, onUpdateAvailable, reload, dependencies } = setup({
      controller: new FakeWorker(),
      waiting: waitingWorker,
    })
    await registerServiceWorker(dependencies)
    const [applyUpdate] = onUpdateAvailable.mock.calls[0]

    applyUpdate()

    expect(waitingWorker.postMessage).toHaveBeenCalledWith(SKIP_WAITING_MESSAGE)
    expect(reload).not.toHaveBeenCalled()
    container.dispatchEvent(new Event("controllerchange"))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("never reloads when the update is not applied", async () => {
    const { container, reload, dependencies } = setup({
      controller: new FakeWorker(),
      waiting: new FakeWorker(),
    })

    await registerServiceWorker(dependencies)
    container.dispatchEvent(new Event("controllerchange"))

    expect(reload).not.toHaveBeenCalled()
  })

  it("prompts once a worker already installing at registration reaches installed", async () => {
    const { registration, onUpdateAvailable, dependencies } = setup({
      controller: new FakeWorker(),
    })
    const installingWorker = new FakeWorker()
    registration.installing = installingWorker

    await registerServiceWorker(dependencies)
    expect(onUpdateAvailable).not.toHaveBeenCalled()

    registration.waiting = installingWorker
    installingWorker.state = "installed"
    installingWorker.dispatchEvent(new Event("statechange"))

    expect(onUpdateAvailable).toHaveBeenCalledTimes(1)
  })

  it("reloads immediately when the update was already applied from another tab", async () => {
    const { registration, onUpdateAvailable, reload, dependencies } = setup({
      controller: new FakeWorker(),
      waiting: new FakeWorker(),
    })
    await registerServiceWorker(dependencies)
    const [applyUpdate] = onUpdateAvailable.mock.calls[0]
    registration.waiting = null

    applyUpdate()

    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("reloads once when the update is requested twice", async () => {
    const { container, onUpdateAvailable, reload, dependencies } = setup({
      controller: new FakeWorker(),
      waiting: new FakeWorker(),
    })
    await registerServiceWorker(dependencies)
    const [applyUpdate] = onUpdateAvailable.mock.calls[0]

    applyUpdate()
    applyUpdate()
    container.dispatchEvent(new Event("controllerchange"))

    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("resolves quietly when registration fails", async () => {
    const { container, onUpdateAvailable, dependencies } = setup()
    container.register.mockRejectedValueOnce(new Error("registration failed"))

    await expect(registerServiceWorker(dependencies)).resolves.toBeUndefined()
    expect(onUpdateAvailable).not.toHaveBeenCalled()
  })
})

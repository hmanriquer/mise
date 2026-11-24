import { SERVICE_WORKER_URL, SKIP_WAITING_MESSAGE } from "../constants/service-worker"
import type { RegisterServiceWorkerDependencies } from "../types/service-worker"

const INSTALLED_STATE: ServiceWorkerState = "installed"

export async function registerServiceWorker({
  container,
  onUpdateAvailable,
  reload,
}: RegisterServiceWorkerDependencies): Promise<void> {
  const registration = await registerOrNull(container)
  if (registration === null) {
    return
  }

  const notifyIfUpdateReady = () => {
    if (container.controller !== null) {
      onUpdateAvailable(createApplyUpdate(container, registration, reload))
    }
  }

  if (registration.installing !== null) {
    watchInstallingWorker(registration, notifyIfUpdateReady)
  }
  if (registration.waiting !== null) {
    notifyIfUpdateReady()
  }
  registration.addEventListener("updatefound", () => {
    watchInstallingWorker(registration, notifyIfUpdateReady)
  })
}

async function registerOrNull(
  container: ServiceWorkerContainer,
): Promise<ServiceWorkerRegistration | null> {
  try {
    return await container.register(SERVICE_WORKER_URL)
  } catch {
    // Offline support is optional: without a registration the app simply runs online-only.
    return null
  }
}

function watchInstallingWorker(registration: ServiceWorkerRegistration, onInstalled: () => void) {
  const installing = registration.installing
  if (installing === null) {
    return
  }
  installing.addEventListener("statechange", () => {
    if (installing.state === INSTALLED_STATE) {
      onInstalled()
    }
  })
}

// Reloading is deferred until the user asks for it, and only once the new worker has taken control.
// If another tab already applied the update there is nothing to wait for, so the page reloads now.
function createApplyUpdate(
  container: ServiceWorkerContainer,
  registration: ServiceWorkerRegistration,
  reload: () => void,
): () => void {
  let reloadRequested = false
  return () => {
    if (reloadRequested) {
      return
    }
    reloadRequested = true
    const waitingWorker = registration.waiting
    if (waitingWorker === null) {
      reload()
      return
    }
    container.addEventListener("controllerchange", reload, { once: true })
    waitingWorker.postMessage(SKIP_WAITING_MESSAGE)
  }
}

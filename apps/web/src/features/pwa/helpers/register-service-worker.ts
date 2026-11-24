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
function createApplyUpdate(
  container: ServiceWorkerContainer,
  registration: ServiceWorkerRegistration,
  reload: () => void,
): () => void {
  return () => {
    container.addEventListener("controllerchange", reload, { once: true })
    registration.waiting?.postMessage(SKIP_WAITING_MESSAGE)
  }
}

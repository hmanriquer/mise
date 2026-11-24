import type { RegisterServiceWorker } from "../types/service-worker"
import { registerServiceWorker } from "./register-service-worker"

export function createBrowserServiceWorkerRegister(): RegisterServiceWorker {
  return (onUpdateAvailable) => {
    if (!isServiceWorkerAvailable()) {
      return
    }
    void registerServiceWorker({
      container: navigator.serviceWorker,
      onUpdateAvailable,
      reload: () => window.location.reload(),
    })
  }
}

function isServiceWorkerAvailable(): boolean {
  return import.meta.env.PROD && typeof navigator !== "undefined" && "serviceWorker" in navigator
}

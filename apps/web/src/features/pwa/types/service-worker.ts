export type UpdateHandler = (applyUpdate: () => void) => void

export type RegisterServiceWorker = (onUpdateAvailable: UpdateHandler) => void

export interface RegisterServiceWorkerDependencies {
  container: ServiceWorkerContainer
  onUpdateAvailable: UpdateHandler
  reload: () => void
}

import { createBrowserServiceWorkerRegister } from "../helpers/create-browser-service-worker-register"
import { ServiceWorkerUpdatePrompt } from "./service-worker-update-prompt"

const registerInBrowser = createBrowserServiceWorkerRegister()

export function PwaUpdatePrompt() {
  return <ServiceWorkerUpdatePrompt register={registerInBrowser} />
}

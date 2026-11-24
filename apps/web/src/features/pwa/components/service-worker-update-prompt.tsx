import { useEffect } from "react"
import { toast } from "sonner"
import { PWA_COPY } from "../constants/copy"
import type { RegisterServiceWorker } from "../types/service-worker"

const UNTIL_APPLIED_DURATION_MS = Number.POSITIVE_INFINITY

interface ServiceWorkerUpdatePromptProps {
  register: RegisterServiceWorker
}

export function ServiceWorkerUpdatePrompt({ register }: ServiceWorkerUpdatePromptProps) {
  useEffect(() => {
    register((applyUpdate) => {
      toast(PWA_COPY.updateAvailable, {
        duration: UNTIL_APPLIED_DURATION_MS,
        action: { label: PWA_COPY.updateAction, onClick: applyUpdate },
      })
    })
  }, [register])

  return null
}

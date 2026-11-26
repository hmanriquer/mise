import { createFileRoute } from "@tanstack/react-router"
import { BrowserPrintingSpikeSection } from "@/features/printing"
import { CLIENT_ONLY_ROUTE } from "@/features/shared"

// Throwaway page for the #4 printing spike; #12 deletes it or turns it into printer setup.
export const Route = createFileRoute("/prueba-impresora")({
  ...CLIENT_ONLY_ROUTE,
  component: BrowserPrintingSpikeSection,
})

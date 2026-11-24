import { createFileRoute } from "@tanstack/react-router"
import { SellPlaceholderSection } from "@/features/selling"
import { CLIENT_ONLY_ROUTE } from "@/features/shared"

export const Route = createFileRoute("/vender")({
  ...CLIENT_ONLY_ROUTE,
  component: SellPlaceholderSection,
})

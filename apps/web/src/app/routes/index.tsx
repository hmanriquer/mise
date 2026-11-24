import { createFileRoute } from "@tanstack/react-router"
import { HomePlaceholderSection } from "@/features/home"
import { CLIENT_ONLY_ROUTE } from "@/features/shared"

export const Route = createFileRoute("/")({
  ...CLIENT_ONLY_ROUTE,
  component: HomePlaceholderSection,
})

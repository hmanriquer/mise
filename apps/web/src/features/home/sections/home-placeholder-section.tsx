import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@workspace/ui/components/button"
import { ROUTES } from "@/features/shared"
import { HOME_COPY } from "../constants/copy"

const BUTTON_CLASSES = "min-h-11 w-fit"

export function HomePlaceholderSection() {
  return (
    <section className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">{HOME_COPY.title}</h1>
        <p className="text-muted-foreground">{HOME_COPY.subtitle}</p>
      </header>
      <Link to={ROUTES.sell} className={buttonVariants({ className: BUTTON_CLASSES })}>
        {HOME_COPY.newSale}
      </Link>
    </section>
  )
}

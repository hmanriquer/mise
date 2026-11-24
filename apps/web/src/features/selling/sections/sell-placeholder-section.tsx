import { SELL_COPY } from "../constants/copy"

export function SellPlaceholderSection() {
  return (
    <section className="flex flex-col gap-1 p-4">
      <h1 className="font-heading text-2xl font-semibold">{SELL_COPY.title}</h1>
      <p className="text-muted-foreground">{SELL_COPY.subtitle}</p>
    </section>
  )
}

import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { flushSync } from "react-dom"
import { PRINTING_SPIKE_COPY } from "../constants/copy"
import { BACK_TO_BACK_TICKET_COUNT } from "../constants/printer"
import type { Clock, LogSpikeEvent } from "../types/spike-log"
import { HtmlTestTicket } from "./html-test-ticket"

const FIRST_COPY = 1

interface HtmlPrintPanelProps {
  printPage: () => void
  now: Clock
  log: LogSpikeEvent
}

export function HtmlPrintPanel({ printPage, now, log }: HtmlPrintPanelProps) {
  const [copyNumber, setCopyNumber] = useState(FIRST_COPY)

  function printCopy(copy: number) {
    // The ticket must show this copy's number before the browser snapshots the page.
    flushSync(() => setCopyNumber(copy))
    const startedAt = now()
    printPage()
    log(PRINTING_SPIKE_COPY.events.printed, { copy, elapsedMs: Math.round(now() - startedAt) })
  }

  function printBackToBack() {
    for (let copy = FIRST_COPY; copy <= BACK_TO_BACK_TICKET_COUNT; copy++) {
      printCopy(copy)
    }
  }

  return (
    <section aria-labelledby="html-print-title" className="flex flex-col gap-3">
      <h2 id="html-print-title" className="font-heading text-lg font-semibold print:hidden">
        {PRINTING_SPIKE_COPY.html.title}
      </h2>
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" className="min-h-11" onClick={() => printCopy(FIRST_COPY)}>
          {PRINTING_SPIKE_COPY.html.printOne}
        </Button>
        <Button variant="outline" className="min-h-11" onClick={printBackToBack}>
          {PRINTING_SPIKE_COPY.html.printTwo}
        </Button>
      </div>
      <HtmlTestTicket copyNumber={copyNumber} />
    </section>
  )
}

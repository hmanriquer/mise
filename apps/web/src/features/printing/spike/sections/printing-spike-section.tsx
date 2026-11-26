import { useCallback, useRef, useState } from "react"
import { HtmlPrintPanel } from "../components/html-print-panel"
import { SpikeLogList } from "../components/spike-log-list"
import { UsbPrintPanel } from "../components/usb-print-panel"
import { PRINTING_SPIKE_COPY } from "../constants/copy"
import type { Clock, SpikeLogEntry } from "../types/spike-log"

const DETAIL_INDENT = 2

export interface PrintingSpikeSectionProps {
  usb: USB | undefined
  printPage: () => void
  now: Clock
  createCanvas: () => HTMLCanvasElement
}

export function PrintingSpikeSection({
  usb,
  printPage,
  now,
  createCanvas,
}: PrintingSpikeSectionProps) {
  const [entries, setEntries] = useState<SpikeLogEntry[]>([])
  const nextId = useRef(0)

  const log = useCallback((message: string, detail?: unknown) => {
    const id = nextId.current++
    const formatted = detail === undefined ? null : JSON.stringify(detail, null, DETAIL_INDENT)
    setEntries((current) => [{ id, message, detail: formatted }, ...current])
  }, [])

  return (
    <main className="flex flex-col gap-6 p-4 print:p-0">
      <header className="flex flex-col gap-1 print:hidden">
        <h1 className="font-heading text-2xl font-semibold">{PRINTING_SPIKE_COPY.title}</h1>
        <p className="text-muted-foreground">{PRINTING_SPIKE_COPY.subtitle}</p>
      </header>
      <div className="print:hidden">
        {usb === undefined ? (
          <p role="alert">{PRINTING_SPIKE_COPY.usb.unavailable}</p>
        ) : (
          <UsbPrintPanel usb={usb} now={now} log={log} createCanvas={createCanvas} />
        )}
      </div>
      <HtmlPrintPanel printPage={printPage} now={now} log={log} />
      <div className="print:hidden">
        <SpikeLogList entries={entries} />
      </div>
    </main>
  )
}

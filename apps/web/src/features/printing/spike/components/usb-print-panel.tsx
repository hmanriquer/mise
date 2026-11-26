import { Button } from "@workspace/ui/components/button"
import { PRINTING_SPIKE_COPY } from "../constants/copy"
import { drawRasterSample } from "../helpers/draw-raster-sample"
import {
  buildCodePageTest,
  buildDrawerKick,
  buildRasterTest,
  buildSpikeTestTicket,
} from "../helpers/spike-tickets"
import type { Clock, LogSpikeEvent } from "../types/spike-log"
import { useUsbPrinter } from "./use-usb-printer"

const USB_COPY = PRINTING_SPIKE_COPY.usb
const FIRST_COPY = 1
const SECOND_COPY = 2

interface UsbPrintPanelProps {
  usb: USB
  now: Clock
  log: LogSpikeEvent
  createCanvas: () => HTMLCanvasElement
}

export function UsbPrintPanel({ usb, now, log, createCanvas }: UsbPrintPanelProps) {
  const { device, pair, send } = useUsbPrinter({ usb, now, log })
  const isUnpaired = device === null

  const actions = [
    { label: USB_COPY.testTicket, build: () => [buildSpikeTestTicket(FIRST_COPY)] },
    { label: USB_COPY.codePages, build: () => [buildCodePageTest()] },
    { label: USB_COPY.raster, build: () => [buildRasterTest(drawRasterSample(createCanvas()))] },
    {
      label: USB_COPY.twoTickets,
      build: () => [buildSpikeTestTicket(FIRST_COPY), buildSpikeTestTicket(SECOND_COPY)],
    },
    { label: USB_COPY.drawer, build: () => [buildDrawerKick()] },
  ]

  return (
    <section aria-labelledby="usb-print-title" className="flex flex-col gap-3">
      <h2 id="usb-print-title" className="font-heading text-lg font-semibold">
        {USB_COPY.title}
      </h2>
      <p className="text-muted-foreground">{device?.productName ?? USB_COPY.noDevice}</p>
      <div className="flex flex-wrap gap-2">
        <Button className="min-h-11" onClick={() => void pair()}>
          {USB_COPY.pair}
        </Button>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="min-h-11"
            disabled={isUnpaired}
            onClick={() => void send(action.build())}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </section>
  )
}

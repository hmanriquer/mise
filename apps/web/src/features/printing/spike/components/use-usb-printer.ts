import { useEffect, useState } from "react"
import { PRINTING_SPIKE_COPY } from "../constants/copy"
import { USB_REQUEST_ALL_DEVICES } from "../constants/usb"
import { describeUsbDevice } from "../helpers/describe-usb-device"
import { sendToUsbPrinter } from "../helpers/send-to-usb-printer"
import { isChooserCancelled, toErrorDetail } from "../helpers/to-error-detail"
import type { Clock, LogSpikeEvent } from "../types/spike-log"

const EVENTS = PRINTING_SPIKE_COPY.events

interface UseUsbPrinterOptions {
  usb: USB
  now: Clock
  log: LogSpikeEvent
}

export function useUsbPrinter({ usb, now, log }: UseUsbPrinterOptions) {
  const [device, setDevice] = useState<USBDevice | null>(null)

  // A device granted earlier comes back without the chooser: this is the "pair once" check.
  useEffect(() => {
    void usb.getDevices().then(([granted]) => {
      if (granted === undefined) {
        return
      }
      setDevice(granted)
      log(EVENTS.reused, describeUsbDevice(granted))
    })
  }, [usb, log])

  async function pair() {
    try {
      const selected = await usb.requestDevice(USB_REQUEST_ALL_DEVICES)
      setDevice(selected)
      log(EVENTS.paired, describeUsbDevice(selected))
    } catch (error) {
      log(isChooserCancelled(error) ? EVENTS.cancelled : EVENTS.failed, toErrorDetail(error))
    }
  }

  async function send(tickets: Uint8Array[]) {
    if (device === null) {
      return
    }
    try {
      for (const bytes of tickets) {
        const startedAt = now()
        const result = await sendToUsbPrinter(device, bytes)
        log(EVENTS.sent, {
          bytes: bytes.length,
          bytesWritten: result.bytesWritten,
          status: result.status,
          elapsedMs: Math.round(now() - startedAt),
        })
      }
    } catch (error) {
      log(EVENTS.failed, toErrorDetail(error))
    }
  }

  return { device, pair, send }
}

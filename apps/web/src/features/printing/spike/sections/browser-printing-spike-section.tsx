import { PrintingSpikeSection } from "./printing-spike-section"

const CANVAS_TAG = "canvas"

function printPage() {
  window.print()
}

function now() {
  return performance.now()
}

function createCanvas() {
  return document.createElement(CANVAS_TAG)
}

export function BrowserPrintingSpikeSection() {
  return (
    <PrintingSpikeSection
      usb={navigator.usb}
      printPage={printPage}
      now={now}
      createCanvas={createCanvas}
    />
  )
}

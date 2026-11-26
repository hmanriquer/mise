import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder"
import { PRINTING_SPIKE_COPY } from "../constants/copy"
import {
  CODE_PAGE_SAMPLE,
  DOUBLE_SIZE,
  FEED_LINES_BEFORE_CUT,
  FONT_A,
  FONT_B,
  NORMAL_SIZE,
  RASTER_HEIGHT_DOTS,
  RASTER_THRESHOLD,
  RASTER_WIDTH_DOTS,
  RULER_DIGITS,
  RULER_LENGTH,
  SPIKE_CODE_PAGES,
  SPIKE_PRINTER_MODEL,
} from "../constants/printer"

const TICKET_COPY = PRINTING_SPIKE_COPY.ticket

function createEncoder(): ReceiptPrinterEncoder {
  return new ReceiptPrinterEncoder({ printerModel: SPIKE_PRINTER_MODEL }).initialize()
}

function finishTicket(encoder: ReceiptPrinterEncoder): Uint8Array {
  return encoder.newline(FEED_LINES_BEFORE_CUT).cut().encode()
}

export function buildRuler(length: number): string {
  return RULER_DIGITS.repeat(Math.ceil(length / RULER_DIGITS.length)).slice(0, length)
}

function rulerBytes(): Uint8Array {
  return new TextEncoder().encode(buildRuler(RULER_LENGTH))
}

export function buildSpikeTestTicket(copyNumber: number): Uint8Array {
  const encoder = createEncoder()
    .align("center")
    .bold(true)
    .size(DOUBLE_SIZE, DOUBLE_SIZE)
    .line(TICKET_COPY.brand)
    .size(NORMAL_SIZE, NORMAL_SIZE)
    .bold(false)
    .line(TICKET_COPY.tagline)
    .line(`${TICKET_COPY.copy} ${copyNumber}`)
    .align("left")
    .line(TICKET_COPY.heading)
    .bold(true)
    .line(TICKET_COPY.bold)
    .bold(false)
    .line(TICKET_COPY.normal)
    .align("right")
    .line(TICKET_COPY.right)
    .align("left")
    .line(TICKET_COPY.fontA)
    .raw(rulerBytes())
    .newline()
    .line(TICKET_COPY.fontB)
    .font(FONT_B)
    .raw(rulerBytes())
    .newline()
    .font(FONT_A)
  return finishTicket(encoder)
}

export function buildCodePageTest(): Uint8Array {
  const encoder = createEncoder().line(TICKET_COPY.codePagesHeading)
  for (const codePage of SPIKE_CODE_PAGES) {
    encoder.codepage(codePage).line(`${codePage}: ${CODE_PAGE_SAMPLE}`)
  }
  return finishTicket(encoder)
}

export function buildRasterTest(canvas: HTMLCanvasElement): Uint8Array {
  const encoder = createEncoder()
    .line(TICKET_COPY.rasterHeading)
    .image(canvas, RASTER_WIDTH_DOTS, RASTER_HEIGHT_DOTS, "threshold", RASTER_THRESHOLD)
  return finishTicket(encoder)
}

export function buildDrawerKick(): Uint8Array {
  return createEncoder().pulse().encode()
}

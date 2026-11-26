import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { PRINTING_SPIKE_COPY } from "../constants/copy"
import { PrintingSpikeSection } from "../sections/printing-spike-section"

const PRINTER_CLASS = 7
const BULK_OUT_ENDPOINT = 3
const COPY = PRINTING_SPIKE_COPY

function createFakeDevice() {
  const bulkOut = { endpointNumber: BULK_OUT_ENDPOINT, direction: "out", type: "bulk" }
  const alternate = { interfaceClass: PRINTER_CLASS, endpoints: [bulkOut] }
  const usbInterface = { interfaceNumber: 0, alternate, alternates: [alternate], claimed: false }
  const configuration = { configurationValue: 1, interfaces: [usbInterface] }
  const device = {
    vendorId: 0x0416,
    productId: 0x5011,
    productName: "POS58",
    opened: false,
    configuration,
    configurations: [configuration],
    open: vi.fn(async () => {
      device.opened = true
    }),
    selectConfiguration: vi.fn(),
    claimInterface: vi.fn(async () => {
      usbInterface.claimed = true
    }),
    transferOut: vi.fn(async (_endpoint: number, data: Uint8Array) => ({
      bytesWritten: data.length,
      status: "ok",
    })),
  }
  return device
}

function createFakeUsb(granted: unknown[] = []) {
  const device = createFakeDevice()
  const usb = {
    getDevices: vi.fn(async () => granted),
    requestDevice: vi.fn(async () => device),
  }
  return { usb: usb as unknown as USB, device }
}

function renderSection(overrides: { usb?: USB; printPage?: () => void } = {}) {
  return render(
    <PrintingSpikeSection
      usb={overrides.usb}
      printPage={overrides.printPage ?? vi.fn()}
      now={() => 0}
      createCanvas={() => document.createElement("canvas")}
    />,
  )
}

describe("PrintingSpikeSection", () => {
  it("explains that WebUSB is missing when the browser has none", () => {
    renderSection()

    expect(screen.getByRole("alert")).toHaveTextContent(COPY.usb.unavailable)
  })

  it("keeps the USB actions disabled until a printer is paired", async () => {
    const { usb } = createFakeUsb()
    renderSection({ usb })

    expect(await screen.findByRole("button", { name: COPY.usb.testTicket })).toBeDisabled()
  })

  it("pairs a printer, then sends two tickets to its bulk OUT endpoint", async () => {
    const user = userEvent.setup()
    const { usb, device } = createFakeUsb()
    renderSection({ usb })

    await user.click(screen.getByRole("button", { name: COPY.usb.pair }))
    expect(await screen.findByText(COPY.events.paired)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: COPY.usb.twoTickets }))

    expect(await screen.findAllByText(COPY.events.sent)).toHaveLength(2)
    expect(device.claimInterface).toHaveBeenCalledTimes(1)
    expect(device.transferOut).toHaveBeenCalledWith(BULK_OUT_ENDPOINT, expect.any(Uint8Array))
  })

  it("reuses a printer granted earlier without opening the chooser", async () => {
    const { usb, device } = createFakeUsb()
    vi.mocked(usb.getDevices).mockResolvedValue([device as unknown as USBDevice])
    renderSection({ usb })

    expect(await screen.findByText(COPY.events.reused)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: COPY.usb.testTicket })).toBeEnabled()
    expect(usb.requestDevice).not.toHaveBeenCalled()
  })

  it("prints two HTML tickets back to back, each showing its own copy number", async () => {
    const user = userEvent.setup()
    const printedCopies: string[] = []
    const printPage = vi.fn(() => {
      printedCopies.push(
        screen.getByText(new RegExp(`^${COPY.ticket.copy} \\d$`)).textContent ?? "",
      )
    })
    renderSection({ printPage })

    await user.click(screen.getByRole("button", { name: COPY.html.printTwo }))

    expect(printedCopies).toEqual([`${COPY.ticket.copy} 1`, `${COPY.ticket.copy} 2`])
  })
})

import { describe, expect, it } from "vitest"
import { describeUsbDevice } from "../helpers/describe-usb-device"
import { findBulkOutEndpoint } from "../helpers/find-bulk-out-endpoint"

const VENDOR_CLASS = 0xff
const PRINTER_CLASS = 7

interface FakeInterfaceOptions {
  interfaceNumber: number
  interfaceClass: number
  endpoints: Array<Pick<USBEndpoint, "endpointNumber" | "direction" | "type" | "packetSize">>
}

function fakeInterface(options: FakeInterfaceOptions): USBInterface {
  const alternate = {
    alternateSetting: 0,
    interfaceClass: options.interfaceClass,
    interfaceSubclass: 1,
    interfaceProtocol: 2,
    interfaceName: null,
    endpoints: options.endpoints,
  } as USBAlternateInterface
  return {
    interfaceNumber: options.interfaceNumber,
    alternate,
    alternates: [alternate],
    claimed: false,
  }
}

function fakeDevice(interfaces: USBInterface[]): USBDevice {
  const configuration = { configurationValue: 1, configurationName: undefined, interfaces }
  return {
    vendorId: 0x0416,
    productId: 0x5011,
    manufacturerName: "Winbond",
    productName: "POS58",
    serialNumber: undefined,
    configuration,
    configurations: [configuration],
  } as unknown as USBDevice
}

const bulkOut = { endpointNumber: 3, direction: "out", type: "bulk", packetSize: 64 } as const
const bulkIn = { endpointNumber: 1, direction: "in", type: "bulk", packetSize: 64 } as const

describe("describeUsbDevice", () => {
  it("reports ids as hex, names, a missing serial and every endpoint", () => {
    const device = fakeDevice([
      fakeInterface({ interfaceNumber: 0, interfaceClass: PRINTER_CLASS, endpoints: [bulkOut] }),
    ])

    expect(describeUsbDevice(device)).toEqual({
      vendorId: "0x0416",
      productId: "0x5011",
      manufacturerName: "Winbond",
      productName: "POS58",
      serialNumber: null,
      interfaces: [
        {
          configuration: 1,
          interfaceNumber: 0,
          interfaceClass: PRINTER_CLASS,
          interfaceSubclass: 1,
          interfaceProtocol: 2,
          endpoints: [{ endpointNumber: 3, direction: "out", type: "bulk", packetSize: 64 }],
        },
      ],
    })
  })
})

describe("findBulkOutEndpoint", () => {
  it("prefers the printer-class interface", () => {
    const device = fakeDevice([
      fakeInterface({ interfaceNumber: 0, interfaceClass: VENDOR_CLASS, endpoints: [bulkOut] }),
      fakeInterface({ interfaceNumber: 1, interfaceClass: PRINTER_CLASS, endpoints: [bulkOut] }),
    ])

    expect(findBulkOutEndpoint(device)).toEqual({ interfaceNumber: 1, endpointNumber: 3 })
  })

  it("falls back to any interface with a bulk OUT endpoint", () => {
    const device = fakeDevice([
      fakeInterface({ interfaceNumber: 0, interfaceClass: VENDOR_CLASS, endpoints: [bulkIn] }),
      fakeInterface({ interfaceNumber: 2, interfaceClass: VENDOR_CLASS, endpoints: [bulkOut] }),
    ])

    expect(findBulkOutEndpoint(device)).toEqual({ interfaceNumber: 2, endpointNumber: 3 })
  })

  it("returns null when no interface can receive bytes", () => {
    const device = fakeDevice([
      fakeInterface({ interfaceNumber: 0, interfaceClass: PRINTER_CLASS, endpoints: [bulkIn] }),
    ])

    expect(findBulkOutEndpoint(device)).toBeNull()
  })
})

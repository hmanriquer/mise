import { HEX_RADIX, USB_ID_HEX_DIGITS } from "../constants/usb"

function toHexId(value: number): string {
  return `0x${value.toString(HEX_RADIX).padStart(USB_ID_HEX_DIGITS, "0")}`
}

function describeEndpoint(endpoint: USBEndpoint) {
  return {
    endpointNumber: endpoint.endpointNumber,
    direction: endpoint.direction,
    type: endpoint.type,
    packetSize: endpoint.packetSize,
  }
}

function describeInterfaces(configuration: USBConfiguration) {
  return configuration.interfaces.flatMap((usbInterface) =>
    usbInterface.alternates.map((alternate) => ({
      configuration: configuration.configurationValue,
      interfaceNumber: usbInterface.interfaceNumber,
      interfaceClass: alternate.interfaceClass,
      interfaceSubclass: alternate.interfaceSubclass,
      interfaceProtocol: alternate.interfaceProtocol,
      endpoints: alternate.endpoints.map(describeEndpoint),
    })),
  )
}

// A missing serial number matters: Chrome may not keep the permission of such a device across
// reconnects, which decides whether the tablet pairs "once".
export function describeUsbDevice(device: USBDevice) {
  return {
    vendorId: toHexId(device.vendorId),
    productId: toHexId(device.productId),
    manufacturerName: device.manufacturerName ?? null,
    productName: device.productName ?? null,
    serialNumber: device.serialNumber ?? null,
    interfaces: device.configurations.flatMap(describeInterfaces),
  }
}

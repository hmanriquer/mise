import {
  USB_ENDPOINT_DIRECTION_OUT,
  USB_ENDPOINT_TYPE_BULK,
  USB_PRINTER_INTERFACE_CLASS,
} from "../constants/usb"

export interface BulkOutTarget {
  interfaceNumber: number
  endpointNumber: number
}

function bulkOutEndpointOf(usbInterface: USBInterface): number | null {
  const endpoint = usbInterface.alternate.endpoints.find(
    (candidate) =>
      candidate.direction === USB_ENDPOINT_DIRECTION_OUT &&
      candidate.type === USB_ENDPOINT_TYPE_BULK,
  )
  return endpoint?.endpointNumber ?? null
}

function isPrinterClass(usbInterface: USBInterface): boolean {
  return usbInterface.alternate.interfaceClass === USB_PRINTER_INTERFACE_CLASS
}

export function findBulkOutEndpoint(device: USBDevice): BulkOutTarget | null {
  const interfaces = device.configuration?.interfaces ?? []
  const ordered = [...interfaces.filter(isPrinterClass), ...interfaces]
  for (const usbInterface of ordered) {
    const endpointNumber = bulkOutEndpointOf(usbInterface)
    if (endpointNumber !== null) {
      return { interfaceNumber: usbInterface.interfaceNumber, endpointNumber }
    }
  }
  return null
}

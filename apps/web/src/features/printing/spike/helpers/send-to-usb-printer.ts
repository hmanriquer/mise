import { PRINTING_SPIKE_COPY } from "../constants/copy"
import { USB_DEFAULT_CONFIGURATION } from "../constants/usb"
import { findBulkOutEndpoint } from "./find-bulk-out-endpoint"

async function claimedTarget(device: USBDevice) {
  if (!device.opened) {
    await device.open()
  }
  if (device.configuration === null) {
    await device.selectConfiguration(USB_DEFAULT_CONFIGURATION)
  }
  const target = findBulkOutEndpoint(device)
  if (target === null) {
    throw new Error(PRINTING_SPIKE_COPY.events.noEndpoint)
  }
  const usbInterface = device.configuration?.interfaces.find(
    (candidate) => candidate.interfaceNumber === target.interfaceNumber,
  )
  if (!usbInterface?.claimed) {
    await device.claimInterface(target.interfaceNumber)
  }
  return target
}

// The device stays open and claimed between jobs, which is how #12 would keep a paired tablet.
export async function sendToUsbPrinter(
  device: USBDevice,
  bytes: Uint8Array,
): Promise<USBOutTransferResult> {
  const target = await claimedTarget(device)
  // transferOut needs a plain ArrayBuffer; the encoder's output is typed as possibly shared.
  return device.transferOut(target.endpointNumber, Uint8Array.from(bytes))
}

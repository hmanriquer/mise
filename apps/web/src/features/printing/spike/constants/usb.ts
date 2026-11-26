// USB interface class 7 is "Printer". Many cheap printers report a vendor class instead, so the
// endpoint search prefers class 7 but falls back to any interface with a bulk OUT endpoint.
export const USB_PRINTER_INTERFACE_CLASS = 7
export const USB_DEFAULT_CONFIGURATION = 1
export const USB_ENDPOINT_DIRECTION_OUT = "out"
export const USB_ENDPOINT_TYPE_BULK = "bulk"

// No filter: the spike must list the printer whatever class it reports.
export const USB_REQUEST_ALL_DEVICES: USBDeviceRequestOptions = { filters: [] }

export const HEX_RADIX = 16
export const USB_ID_HEX_DIGITS = 4

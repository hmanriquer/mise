# ADR 0001: Printing on the POS58C3

- **Status:** Proposed. The decision below is Hamed's; the hardware run has not happened yet. Every `—` in this document is filled in from the spike, and the status moves to Accepted once Hamed approves it.
- **Date:** 2026-11-26
- **Issue:** #4 (spike). #12 implements the result.

## Context

The business has one 58 mm **POS58C3** USB thermal printer, a Windows PC and an Android tablet. Printing must never block or undo a sale.

- **Windows:** WebUSB cannot open a printer while the Windows `usbprint` driver holds it ("Access denied"). The only workaround, replacing the driver with WinUSB through Zadig, removes the printer from the Windows print queue. Hamed ruled Zadig out.
- **Android:** Chrome can claim USB printer-class devices over OTG, so WebUSB works there.
- WebSerial and Web Bluetooth do not fit this printer.

## Decision

One `PrinterTransport` interface with two implementations, chosen per device:

| Device | Transport | How it prints |
| --- | --- | --- |
| Windows PC | `KioskBrowserPrintTransport` | A 58 mm HTML ticket through `window.print()`, in Chrome or Edge started with `--kiosk-printing` (no dialog), with the vendor driver and the POS58 as the Windows default printer. No Zadig, no WinUSB. |
| Android tablet | `WebUsbTransport` | Raw ESC/POS bytes from `@point-of-sale/receipt-printer-encoder` sent to the printer's bulk OUT endpoint. |

- **Code page:** — (pick from the results below: CP850, CP858, WPC1252, or the raster fallback).
- **Encoder profile:** the spike uses the encoder's `pos-5890` printer model (58 mm, Font A 32 columns, Font B 42 columns; ESC t tables CP850 = 2, WPC1252 = 16, CP858 = 19). Keep it if the results agree; otherwise #12 passes a custom `codepageMapping`.

## Running the spike

The throwaway page is `/prueba-impresora` (`apps/web/src/features/printing/spike`). WebUSB needs a secure origin (HTTPS or `localhost`), so the tablet must open it over HTTPS:

1. Build and upload a preview of this branch, which does not touch production:
   ```bash
   pnpm build
   pnpm --filter web exec wrangler versions upload --preview-alias printing-spike
   ```
   Open `https://printing-spike-mise-web.<account>.workers.dev/prueba-impresora`. (This step has not been tried yet. If preview URLs are off for the account, merge to `main` instead; the page has no data and no API calls.)
2. The "Registro" log on the page shows the USB IDs, interfaces, endpoints, bytes sent and times. Copy it into this ADR.
3. Photograph every printed ticket and save the photos next to this file as `docs/adr/0001-printing/<row>.jpg`.

Page buttons: **Vincular impresora**, **Ticket de prueba** (bold, double size, alignment, Font A/B rulers, cut), **Prueba de acentos** (CP850, CP858, WPC1252), **Acentos como imagen** (raster fallback), **Dos tickets seguidos**, **Abrir cajón**, **Imprimir ticket HTML** and **Imprimir dos tickets HTML**.

## Windows setup (to verify)

1. Install the vendor driver. In *Printers & scanners*, set the POS58 as the **default printer** and turn off *Let Windows manage my default printer*.
2. Driver preferences: paper size — (expected "58 x 3276 mm" or similar), orientation portrait. Record any "paper saving" or "feed after print" option.
3. Create a shortcut whose **Target** is one of:
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\Mise\chrome" --kiosk-printing --app=https://<host>/
   ```
   ```
   "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --user-data-dir="C:\Mise\edge" --kiosk-printing --app=https://<host>/
   ```
   The dedicated `--user-data-dir` matters: `--kiosk-printing` is ignored when a browser process for the same profile is already running (background apps in Chrome, *Startup boost* in Edge).
4. Before the first kiosk run, open the same profile **without** the flag and print once by hand: destination POS58, margins *None*, scale 100 %, *Headers and footers* off. Chrome keeps these settings for the profile and kiosk printing reuses them.

## Android setup (to verify)

1. Connect the printer through a USB OTG adapter (the printer has its own power supply).
2. Open the page in **Chrome** (not a WebView), tap **Vincular impresora** and pick the printer.
3. Reload the page: the log must say "Impresora ya vinculada" without the chooser. Repeat after unplugging and replugging, and after restarting Chrome.

## Printer facts

| Fact | Value |
| --- | --- |
| USB vendor / product ID | — |
| Serial number reported | — (if missing, Chrome may forget the pairing on replug) |
| Interface class / bulk OUT endpoint | — |
| Auto-cutter | — |
| Chars per line, Font A / Font B | — / — (count the digits on the first ruler line) |
| Working code page (ESC t number) | — |
| Cash drawer kick | — |
| Two tickets back to back (time from tap to second ticket out) | — |

## Test matrix

Pass / Fail / n.a., with a photo for every printed result.

| # | Device + browser + path | Check | Result | Photo |
| --- | --- | --- | --- | --- |
| A1 | Android + Chrome + WebUSB | Pair and log the device | — | n.a. |
| A2 | Android + Chrome + WebUSB | Test ticket: bold, double size, alignment, feed | — | — |
| A3 | Android + Chrome + WebUSB | Accents: CP850 / CP858 / WPC1252 | — / — / — | — |
| A4 | Android + Chrome + WebUSB | Accents as raster image | — | — |
| A5 | Android + Chrome + WebUSB | Two tickets back to back | — | — |
| A6 | Android + Chrome + WebUSB | Still paired after reload / replug / Chrome restart | — / — / — | n.a. |
| A7 | Android + Chrome + WebUSB | Drawer kick | — | n.a. |
| W1 | Windows + Chrome + kiosk | One HTML ticket prints with no dialog | — | — |
| W2 | Windows + Chrome + kiosk | Two HTML tickets back to back, both print | — | — |
| W3 | Windows + Chrome + kiosk | 58 mm layout readable, no clipped margins, no header/footer | — | — |
| W4 | Windows + Chrome + kiosk | Blank paper fed after the ticket (mm) | — | — |
| W5 | Windows + Edge + kiosk | W1–W4 repeated | — | — |
| W6 | Windows + Chrome + WebUSB | Confirms "Access denied" with the vendor driver (expected fail) | — | n.a. |

## Risks

- **Silent failure on Windows.** `window.print()` reports nothing: the page cannot tell whether the ticket printed, so the "No se pudo imprimir" toast can only fire on WebUSB. The kiosk path needs another signal (the owner sees no ticket and taps "Reintentar").
- **Kiosk flag ignored** if the browser is already running for that profile, or if someone opens the app from a normal shortcut. Then the print dialog appears. The dedicated profile and a single desktop shortcut are the mitigation.
- **Wrong printer.** Kiosk printing goes to the default (or last used) printer. A Windows update or a new printer can change it.
- **Code page mismatch.** Clone firmware may not follow the POS-5890 table. Then #12 uses a custom `codepageMapping` or the raster fallback, which is slower to send and prints more slowly.
- **Pairing lost on Android** if the printer reports no serial number, or after a Chrome data wipe. Re-pairing must stay one tap from the printer setup page (#12).
- **Origin change.** Moving from `*.workers.dev` to `espadas.lat` drops the WebUSB pairing and needs a new kiosk shortcut URL.

## Consequences

- #12 builds `PrinterTransport`, `WebUsbTransport` and `KioskBrowserPrintTransport` with shared contract tests, plus pure `buildKitchenTicket` / `buildCustomerTicket` builders.
- The spike page is removed or turned into the printer setup page in #12. The USB helpers (`find-bulk-out-endpoint`, `send-to-usb-printer`) are the seed of `WebUsbTransport`.
- `docs/guia-del-dueno.md` and `docs/runbook.md` (#21) copy the Windows shortcut and the Android pairing steps from this ADR.

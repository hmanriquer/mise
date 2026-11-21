# Contrast · Mise (computed in Chrome, translucent layers composited)

Light mode only. Thresholds: 4.5:1 for text, 3:1 for UI/edges and large text.

| State | Pair | fg | bg | ratio | AA |
|---|---|---|---|---|---|
| /login | Login title | #0c090c | #ffffff | 19.81 | pass (3) |
| /login | Login tagline (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /login | Login description (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /login | Entrar con passkey | #fdf2f8 | #c6005c | 5.41 | pass (4.5) |
| /login | Passkey hint (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /login | Usar contraseña (link) | #c6005c | #ffffff | 5.91 | pass (4.5) |
| /login | Login footer (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /login?password=1 | Email input text | #0c090c | #f8f7f8 | 18.56 | pass (4.5) |
| /login?password=1 | Email input border (UI) | #e7e4e7 | #ffffff | 1.26 | FAIL (3) |
| /login?password=1 | Entrar (password) | #fdf2f8 | #c6005c | 5.41 | pass (4.5) |
| / | Home greeting | #0c090c | #ffffff | 19.81 | pass (3) |
| / | Home date (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| / | Nueva venta | #fdf2f8 | #c6005c | 5.41 | pass (4.5) |
| / | Home KPI label (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| / | Home KPI value | #0c090c | #ffffff | 19.81 | pass (3) |
| / | Tickets description (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| / | Ticket meta (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| / | Ticket time (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| / | Sync chip Sincronizado | #18181b | #f4f4f5 | 16.12 | pass (4.5) |
| / | Printer chip Impresora lista | #18181b | #f4f4f5 | 16.12 | pass (4.5) |
| / | Device status help (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| / | Sidebar tagline (muted) | #79697b | #fafafa | 4.88 | pass (4.5) |
| / | Device label (muted) | #79697b | #fafafa | 4.88 | pass (4.5) |
| / | Header date (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /?offline=1 | Sync chip offline | #0c090c | #f8f7f8 | 18.56 | pass (4.5) |
| /?offline=1 | Offline alert | #0c090c | #ffffff | 19.81 | pass (4.5) |
| /tablero | Period label (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /tablero | Coverage alert | #0c090c | #ffffff | 19.81 | pass (4.5) |
| /tablero | Dashboard KPI label (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /tablero | Dashboard KPI value | #0c090c | #ffffff | 19.81 | pass (4.5) |
| /tablero | Breakdown percent (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /vender?picker=1 | Variant price | #0c090c | #ffffff | 19.81 | pass (4.5) |
| /vender?picker=1 | Picker hint (muted) | #79697b | #ffffff | 5.10 | pass (4.5) |
| /vender?picker=1 | Cart total | #0c090c | #ffffff | 19.81 | pass (4.5) |
| /vender?cobro=1 | Checkout total | #0c090c | #ffffff | 19.81 | pass (3) |
| /vender?cobro=1 | Change amount | #0c090c | #f3f1f3 | 17.63 | pass (3) |
| /vender?cobro=1 | Cobrar e imprimir | #fdf2f8 | #c6005c | 5.41 | pass (4.5) |
| /vender?didi=1 | DiDi example prices banner | #0c090c | #ffffff | 19.81 | pass (4.5) |
| /vender?didi=1&cobro=1 | DiDi manual record alert | #0c090c | #ffffff | 19.81 | pass (4.5) |
| /vender?didi=1&cobro=1 | Registrar venta DiDi e imprimir | #fdf2f8 | #c6005c | 5.41 | pass (4.5) |

40 pairs, 1 fail.

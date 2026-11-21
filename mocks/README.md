# Mise v1 mocks (locked by Hamed, 2026-11-20)

Source of truth for the UI issues. Light mode, PC 1366×768 and Android tablet 1280×800, es-MX copy.

- `shots/`: 20 screenshots (login, login-password, inicio, inicio-offline, tablero, vender, vender-grid, vender-didi, cobro, cobro-didi), each `-pc` and `-tablet`.
- `OVERVIEW.png`: all 20 at a glance.
- `NOTES.md`: design notes and "Decisiones de Hamed 2026-11-20".
- `contrast.md`: contrast audit (input border 1.26:1, accepted by Hamed).
- `app/`: the real shadcn mock app (Vite, preset `b6Cf5S2iOm`, Base UI, Hugeicons). Run with `cd mocks/app && npm ci && npm run dev`. Reference only, not production code (production starts in #2).

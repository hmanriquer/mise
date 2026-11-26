# Mise runbook

Operational steps for the owner's deployment. The owner guide (es-MX) lives in `guia-del-dueno.md`.

## Auth

Passkeys are the everyday login; email + password is the rare fallback and recovery path (#5).

### One-time setup

1. Set the repository variable `MISE_WEB_URL` to the public origin, for example `https://mise-web.<account>.workers.dev`. `deploy.yml` derives `AUTH_ORIGIN` and `AUTH_RP_ID` from it and refuses to deploy without it.
2. Set the Worker secrets (each value from `openssl rand -base64 32`):

   ```bash
   pnpm --filter api exec wrangler secret put BETTER_AUTH_SECRET
   pnpm --filter api exec wrangler secret put OWNER_BOOTSTRAP_TOKEN
   ```

   Never change `BETTER_AUTH_SECRET` casually: it signs every session cookie.

For local dev, copy `apps/api/.dev.vars.example` to `apps/api/.dev.vars` and fill it in. Local dev uses `AUTH_ORIGIN=http://localhost:3000` and `AUTH_RP_ID=localhost` from `wrangler.jsonc`.

### Create the owner (once)

`POST /api/v1/bootstrap` works only while the `user` table is empty. It answers `401` for a wrong or missing token and `410` once the owner exists.

```bash
curl -i -X POST "$MISE_WEB_URL/api/v1/bootstrap" \
  -H "X-Bootstrap-Token: $OWNER_BOOTSTRAP_TOKEN" \
  -H "content-type: application/json" \
  -d '{"email":"…","name":"…","password":"at least 12 characters"}'
```

The response carries a session cookie, so the owner can register a passkey next. Keep the password somewhere safe: it is the recovery path.

Then delete the token, so the endpoint answers `401` forever:

```bash
pnpm --filter api exec wrangler secret delete OWNER_BOOTSTRAP_TOKEN
```

### New device

Sign in once with the password fallback (or a cross-device passkey through the phone QR, where the browser offers it), then register a passkey on that device. Password sign-in is limited to 5 attempts per 15 minutes per client IP.

### Lost device

Delete the lost device's passkey (from Ajustes once #19 lands, or `POST /api/auth/passkey/delete-passkey`), then close all sessions (`POST /api/v1/auth/revoke-all`). Deleting the last passkey needs an explicit confirmation and is audited; the password still works afterwards.

### Domain move (`workers.dev` → `espadas.lat`)

Passkeys are bound to the rpID and cookies to the origin, so the move invalidates both:

1. Every device syncs its outbox first.
2. Change `MISE_WEB_URL` to the new origin and deploy.
3. The owner signs in with the password on the new domain and registers new passkeys.
4. Each device reinstalls the PWA, signs in again and re-pairs WebUSB.

### CPU budget

Workers Free allows 10 ms CPU per request. Passkey verification fits. The scrypt password hash takes roughly 70–170 ms, so a password sign-in overruns the budget; that is accepted because it is rare. Never weaken the hash parameters to fit.

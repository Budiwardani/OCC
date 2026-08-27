# OCC WhatsApp Cloudflare Worker

Worker opsional untuk meneruskan notifikasi OCC ke OpenWA tanpa mengekspos API key ke frontend.

## Local development

```powershell
cd cloudflare-worker
npx wrangler dev
```

## Configure secrets

```powershell
npx wrangler secret put WA_GATEWAY_URL
npx wrangler secret put WA_API_KEY
```

Optional variables in `wrangler.toml`:

- `WA_SESSION_ID`, default `default`.
- `WA_SEND_URL`, bila endpoint OpenWA tidak mengikuti endpoint session standar.

## Deploy

```powershell
npx wrangler deploy
```

## API

```text
POST /api/send
Authorization: Bearer <WA_API_KEY>
Content-Type: application/json

{"to":"628123456789","text":"Nomor tiket OCC Anda: ..."}
```

Worker ini tidak memakai D1. Database OCC tetap dikelola backend Express/PostgreSQL; Worker hanya menjadi proxy notifikasi WhatsApp.

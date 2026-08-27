# Cara Install OCC

## Opsi A: Docker Compose (disarankan)

### Prasyarat

- Windows dengan Docker Desktop aktif.
- Git atau salinan workspace OCC.
- Port host `5000`, `5173`, `5433`, `11435`, dan `2785` tersedia.

### Langkah

1. Buka PowerShell pada folder root OCC.
2. Validasi konfigurasi:

```powershell
docker compose config
```

3. Jalankan layanan:

```powershell
docker compose up -d
```

4. Periksa status:

```powershell
docker compose ps
```

5. Migration runner berjalan otomatis saat backend start dan membuat tabel runtime yang diperlukan.
6. Buka http://localhost:5173.
7. Untuk WhatsApp, buka http://localhost:2785 dan scan QR dengan nomor khusus. Isi `WA_API_KEY` pada environment backend bila gateway memerlukannya.

## Deployment Cloudflare

Frontend OCC, termasuk admin panel dan route `/admin`, dideploy sebagai SPA melalui root `wrangler.jsonc`:

```powershell
npm run build
npm run deploy
```

URL online: https://occ.nirmanatech12.workers.dev

Admin online: https://occ.nirmanatech12.workers.dev/admin

Catatan: Cloudflare deployment ini menyajikan frontend statis. Login dan CRUD admin memerlukan backend OCC yang dapat diakses publik melalui `VITE_API_URL`; `localhost:5000` hanya berlaku untuk development lokal. Deploy backend Express secara terpisah, lalu set `VITE_API_URL` sebelum build frontend berikutnya.

### Perintah pemeliharaan

```powershell
docker compose logs --tail 100 backend frontend
docker compose down
docker compose up -d
```

Data PostgreSQL dan Ollama tersimpan pada volume Docker `occ_occ_db_data` dan `occ_ollama_data`.

## Opsi B: Menjalankan Lokal

### Backend

```powershell
cd backend
npm install
npm start
```

Mode development memerlukan `nodemon` yang belum tercantum di dependency backend, sehingga `npm start` adalah pilihan yang konsisten dengan package saat ini. Pada Docker, backend menjalankan migration lalu `npm start`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Build produksi:

```powershell
npm run build
```

## Environment Variable

Backend minimal:

```text
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/occ
JWT_SECRET=ganti-dengan-secret-kuat
OLLAMA_URL=http://localhost:11434
```

Frontend:

```text
VITE_API_URL=http://localhost:5000/api
```

OpenWA backend:

```text
WA_GATEWAY_URL=http://localhost:2785
WA_SESSION_ID=default
WA_SEND_URL=http://localhost:2785/api/sessions/default/messages/send-text
WA_API_KEY=isi-setelah-gateway aktif
PUBLIC_APP_URL=http://localhost:5173
```

## Opsi C: Cloudflare Worker untuk WhatsApp

Worker opsional tersedia di `cloudflare-worker/`. Worker hanya menjadi proxy notifikasi; PostgreSQL dan backend OCC tetap berjalan seperti biasa.

```powershell
cd cloudflare-worker
npx wrangler login
npx wrangler secret put WA_GATEWAY_URL
npx wrangler secret put WA_API_KEY
npx wrangler dev
npx wrangler deploy
```

Endpoint Worker: `POST https://<worker-domain>/api/send` dengan header `Authorization: Bearer <WA_API_KEY>` dan body JSON `{ "to": "628123456789", "text": "Nomor tiket OCC Anda: ..." }`.

Jangan menaruh `WA_API_KEY` pada frontend atau repository.

## Catatan Database

`backend/schema.sql` dan `backend/migrate-all.js` mencakup tabel runtime utama. Migration runner dibuat idempoten sehingga dapat dijalankan kembali tanpa reset database.

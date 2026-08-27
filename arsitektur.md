# Arsitektur OCC

## Gambaran Umum

```mermaid
flowchart LR
    U[Pelapor / Admin] --> F[React + Vite Frontend]
    M[Flutter Mobile] --> B[Express API]
    F --> B[Express API]
    B --> P[(PostgreSQL)]
    B --> S[Local Upload Storage]
    B --> O[Ollama AI]
```

## Komponen

### Frontend

- React 19 dan Vite.
- React Router untuk portal, login, dashboard, dan halaman administrasi.
- Axios client dengan `VITE_API_URL`.
- Tailwind CSS untuk tampilan.
- `ChatWidget` memanggil endpoint `/api/ai/chat`.

### Backend

- Node.js dengan Express dalam mode ES modules.
- `src/app.js` mendaftarkan middleware keamanan, upload statis, route, dan error handler.
- `src/server.js` membaca konfigurasi port dan memulai listener.
- Controller memuat logika pengaduan publik, dashboard, branding, dokumen, invoice, dan administrasi.
- JWT digunakan untuk autentikasi internal.

### Database

PostgreSQL menyimpan perusahaan, user, pengaduan, respons, attachment, SLA, dan audit log. Beberapa fitur baru bergantung pada migration file tambahan yang belum digabung ke satu runner instalasi.

### Infrastruktur

Docker Compose menyediakan:

| Service | Container port | Host port |
|---|---:|---:|
| PostgreSQL | 5432 | 5433 |
| Backend | 5000 | 5000 |
| Frontend | 5173 | 5173 |
| Ollama | 11434 | 11435 |

Backend mengakses PostgreSQL dan Ollama melalui nama service Docker dan port internal.

## Alur Pengaduan

1. Frontend mengirim multipart form ke `/api/public/complaints`.
2. Backend memvalidasi request, membuat tiket, dan menyimpan data ke PostgreSQL.
3. Attachment disimpan pada storage upload.
4. Pelapor menggunakan tiket dan email untuk memanggil endpoint tracking.
5. Admin memproses tiket melalui endpoint dashboard.

## Batas Arsitektur Saat Ini

- Isolasi company belum diterapkan konsisten pada seluruh query.
- Static upload belum memiliki authorization per file.
- Notifikasi eksternal belum menjadi service yang andal.
- Audit dan SLA baru berupa struktur database.
- Tidak ada test suite backend/frontend yang mencerminkan alur bisnis utama.

# Gap Report OCC

Tanggal audit: 27 Agustus 2026

## Ringkasan

Fondasi MVP OCC sudah berjalan: portal publik, dashboard internal, administrasi, upload dokumen, API, Docker Compose, dan proxy AI tersedia. Namun sistem belum siap untuk deployment produksi sebelum kontrol akses, database setup, keamanan endpoint publik, notifikasi, dan pengujian diperbaiki.

Catatan: analisis lampiran yang menyatakan seluruh menu admin frontend hilang berasal dari snapshot sebelum remediasi. Pada versi saat ini login, dashboard KPI/activity, sidebar, complaint list/detail, agent/manager, company, category, branding, email, template, export CSV, dan response UI sudah tersedia.

## Status Remediasi Audit Ini

Sudah diperbaiki: scope company/assignment pada query complaint utama, validasi assignee lintas perusahaan, endpoint dan UI respons, audit log untuk update/respons, pencatatan SLA awal, migration runner idempoten, bootstrap schema Docker, token tracking dan upload publik, rate limit publik/AI, batas upload 5 MB, data terbaru publik yang tidak lagi memuat deskripsi, dashboard activity feed, route Surat Kuasa duplikat, konsistensi kredensial Superadmin, alias admin `/admin`, migration phone eksplisit, dan integrasi service OpenWA configurable dengan pengiriman non-blocking.

Masih residual: provider email nyata, image OpenWA/QR pairing/API key di setiap deployment, antivirus/content scanning upload, download file dengan authorization penuh, CAPTCHA, job SLA breach otomatis, test suite bisnis lengkap, dan hardening production image/dependency.

## Temuan Prioritas Tinggi

| ID | Gap | Dampak | Rekomendasi |
|---|---|---|---|
| G-01 | Query dashboard tidak konsisten membatasi company/assignment | Dapat terjadi kebocoran lintas tenant | Selesai untuk endpoint complaint utama; audit semua endpoint tambahan sebelum produksi |
| G-02 | Role schema tidak konsisten dengan authorization aplikasi | Akses internal dapat salah | Selesai pada schema dan bootstrap; lakukan review role policy lanjutan |
| G-03 | Schema dasar tidak membuat seluruh tabel runtime | Instalasi baru dapat gagal | Selesai melalui schema canonical dan migration runner |
| G-04 | Tracking/upload publik tidak menggunakan token secara konsisten | Ticket identifier mudah disalahgunakan | Selesai untuk tracking dan upload Surat Kuasa |
| G-05 | Endpoint publik dan AI tidak memiliki rate limit/CAPTCHA | Risiko spam dan abuse | Rate limit selesai; CAPTCHA masih residual |
| G-06 | Upload memiliki kontrol lemah | Risiko file berbahaya dan akses tanpa otorisasi | Batas/MIME selesai; scanning dan download authorization masih residual |

## Temuan Prioritas Menengah

| ID | Gap | Dampak | Rekomendasi |
|---|---|---|---|
| G-07 | Endpoint/UI balasan agent belum ada | Tabel respons tidak dapat dipakai untuk alur operasional lengkap | Tambahkan create response, visibility internal, dan notifikasi |
| G-08 | SLA dan audit log belum ditulis oleh controller | Tidak ada bukti kepatuhan atau riwayat perubahan | Buat service event dan job SLA berkala |
| G-09 | Email masih console log; OpenWA perlu pairing dan endpoint sesuai image | Pengiriman belum terukur penuh di produksi | Konfigurasi provider email, pairing OpenWA, status delivery, queue, dan notification history |
| G-10 | Multi-company belum lengkap; public complaint dan branding tidak scoped | Data serta branding dapat tertukar antar perusahaan | Wajibkan company context pada request dan semua query |
| G-11 | Duplicate mounting Surat Kuasa | Route dapat diproses dua kali atau sulit dipelihara | Pertahankan satu lokasi registrasi route |
| G-12 | Dashboard activity belum selesai | Monitoring operasional tidak lengkap | Selesai: activity feed dan endpoint audit terbaru sudah tersedia |

## Temuan Prioritas Rendah / Kualitas

| ID | Gap | Dampak | Rekomendasi |
|---|---|---|---|
| G-13 | Tidak ada test suite bisnis frontend/backend | Regresi sulit terdeteksi | Tambahkan test auth, complaint lifecycle, RBAC, upload, dan tracking |
| G-14 | Test Flutter masih smoke test counter bawaan | Tidak menguji fitur mobile OCC | Ganti dengan test provider, API, database, dan alur laporan |
| G-15 | README/BROCHURE mengklaim fitur lebih lengkap daripada implementasi | Ekspektasi stakeholder tidak akurat | Gunakan `features.md` sebagai matriks status dan perbarui roadmap |
| G-16 | Kredensial default berbeda antar dokumen/script | Setup membingungkan dan berisiko | Gunakan secret bootstrap sekali pakai dan dokumentasi tunggal |

## Gap Operasional

- Docker Compose tidak menjalankan inisialisasi schema dan migration otomatis.
- Backend image memasang dependency saat container start sehingga startup lambat dan tidak deterministik.
- `npm run dev` backend membutuhkan `nodemon` yang tidak tercantum; Compose memakai `npm start`.
- Port host PostgreSQL dan Ollama dapat bentrok dengan instalasi lain; konfigurasi saat ini memakai `5433` dan `11435`.
- Dependency audit Docker melaporkan vulnerability yang perlu ditinjau sebelum produksi.

## Urutan Perbaikan yang Disarankan

1. Perbaiki RBAC dan company isolation.
2. Satukan schema dan migration runner.
3. Amankan tracking, upload, endpoint publik, dan AI.
4. Implementasikan respons, audit log, SLA, dan notifikasi.
5. Tambahkan test suite lifecycle pengaduan.
6. Sinkronkan README, brochure, dan kredensial dengan implementasi aktual.
7. Siapkan image produksi dengan dependency terkunci dan healthcheck.

## Kesimpulan

OCC layak disebut MVP yang dapat dijalankan secara lokal, tetapi belum layak dianggap production-ready. Risiko terbesar berada pada kontrol akses/data isolation dan proses instalasi database yang tidak lengkap.

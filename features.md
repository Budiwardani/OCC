# Features

Status fitur berdasarkan implementasi kode saat ini.

## Portal Publik

| Fitur | Status | Catatan |
|---|---|---|
| Membuat pengaduan tanpa login | Ada | Form publik dan endpoint multipart tersedia |
| Kode tiket publik | Ada | Dibuat oleh backend |
| Upload bukti | Parsial | Ada, tetapi batas ukuran UI dan backend tidak konsisten |
| Melacak tiket | Ada | Menggunakan kode tiket dan email |
| Melihat statistik publik | Ada | Endpoint statistik dipakai Portal |
| Melihat laporan terbaru | Ada | Perlu pembatasan data dan pagination |
| Upload Surat Kuasa publik | Ada | Proteksi akses perlu diperkuat |

## Dashboard Internal

| Fitur | Status | Catatan |
|---|---|---|
| Login JWT | Ada | Perlu verifikasi role dan scope perusahaan |
| KPI dashboard | Ada | Activity dashboard masih belum selesai |
| Daftar pengaduan | Ada | Pagination, pencarian, dan filter tersedia |
| Detail pengaduan | Ada | Status, prioritas, dan assignment tersedia |
| Balasan agent | Ada | Endpoint dan panel Responses tersedia |
| Export CSV | Ada | Scope data perlu diperketat |
| Agent/manager | Parsial | UI dan pembuatan user ada, RBAC API belum aman |

## Administrasi

| Fitur | Status | Catatan |
|---|---|---|
| Perusahaan | Ada | Isolasi multi-company belum lengkap |
| Branding/logo | Ada | Saat ini mengambil perusahaan pertama |
| Kategori | Ada | Membutuhkan tabel kategori di luar schema dasar |
| Email resmi | Ada | Membutuhkan migrasi/tabel tambahan |
| Master template | Ada | Membutuhkan migrasi/tabel tambahan |
| Invoice | Parsial | API/tabel digunakan, alur UI perlu diverifikasi lebih lanjut |

## Infrastruktur dan Integrasi

| Fitur | Status | Catatan |
|---|---|---|
| Docker Compose | Ada | Menjalankan PostgreSQL, backend, frontend, dan Ollama |
| AI chat Ollama | Ada | Belum ada rate limit, auth, atau validasi biaya/pemakaian |
| Email notification | Belum ada | Beberapa alur masih console log |
| WhatsApp | Parsial | Menggunakan deep link `wa.me`, bukan provider terkelola |
| SLA tracking | Parsial | SLA awal dibuat saat perubahan complaint; job breach dan alert belum ada |
| Audit log | Parsial | Update complaint dan response dicatat; cakupan seluruh aktivitas belum lengkap |
| Mobile Flutter | Parsial | Project tersedia, integrasi dan test bisnis belum lengkap |

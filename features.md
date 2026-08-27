# Features

Status fitur berdasarkan implementasi kode saat ini.

## Portal Publik

| Fitur | Status | Catatan |
|---|---|---|
| Membuat pengaduan tanpa login | Ada | Form publik dan endpoint multipart tersedia |
| Kode tiket publik | Ada | Dibuat oleh backend |
| Upload bukti | Ada | Batas backend 5 MB per file dan maksimal 5 file |
| Melacak tiket | Ada | Menggunakan kode tiket, email, dan token |
| Melihat statistik publik | Ada | Endpoint statistik dipakai Portal |
| Melihat laporan terbaru | Ada | Perlu pembatasan data dan pagination |
| Upload Surat Kuasa publik | Ada | Menggunakan kode tiket, email, dan token |

## Dashboard Internal

| Fitur | Status | Catatan |
|---|---|---|
| Login JWT | Ada | Role dan scope perusahaan diterapkan pada endpoint utama |
| KPI dashboard | Ada | Activity feed mengambil audit event terbaru |
| Daftar pengaduan | Ada | Pagination, pencarian, dan filter tersedia |
| Detail pengaduan | Ada | Status, prioritas, dan assignment tersedia |
| Balasan agent | Ada | Endpoint dan panel Responses tersedia |
| Export CSV | Ada | Scope mengikuti akses complaint user |
| Agent/manager | Ada | Menu, pembuatan user, role, dan scope perusahaan tersedia |
| Audit log viewer | Parsial | Activity feed tersedia; halaman audit lengkap belum ada |
| Reports terstruktur | Parsial | Export CSV tersedia; laporan performa/SLA belum ada |

## Administrasi

| Fitur | Status | Catatan |
|---|---|---|
| Perusahaan | Ada | Akses admin dan company scope tersedia |
| Branding/logo | Ada | Konfigurasi branding tersedia |
| Kategori | Ada | Schema dan migration runner menyediakan tabel |
| Email resmi | Ada | Schema dan migration runner menyediakan tabel |
| Master template | Ada | Schema dan migration runner menyediakan tabel |
| Invoice | Parsial | API/tabel digunakan, alur UI perlu diverifikasi lebih lanjut |

## Infrastruktur dan Integrasi

| Fitur | Status | Catatan |
|---|---|---|
| Docker Compose | Ada | Menjalankan PostgreSQL, backend, frontend, dan Ollama |
| AI chat Ollama | Ada | Rate limit tersedia; auth dan budget control masih perlu deployment policy |
| Email notification | Belum ada | Beberapa alur masih console log |
| WhatsApp | Parsial | Menggunakan deep link `wa.me`, bukan provider terkelola |
| SLA tracking | Parsial | SLA awal dibuat saat perubahan complaint; job breach dan alert belum ada |
| Audit log | Parsial | Update complaint dan response dicatat; cakupan seluruh aktivitas belum lengkap |
| Mobile Flutter | Parsial | Project tersedia, integrasi dan test bisnis belum lengkap |

# Product Requirements Document (PRD)

## 1. Ringkasan Produk

OCC (Online Customer Complaint) adalah platform untuk menerima, melacak, mengelola, dan menyelesaikan pengaduan pelanggan. Produk terdiri dari portal publik, dashboard internal, API Node.js, PostgreSQL, dan aplikasi Flutter yang masih berada dalam tahap pengembangan.

## 2. Tujuan

- Menyediakan kanal pengaduan publik tanpa proses registrasi.
- Memberikan nomor tiket dan pelacakan status yang mudah.
- Membantu tim internal memprioritaskan, menugaskan, dan menyelesaikan laporan.
- Menyediakan jejak data untuk administrasi, dokumen, dan pelaporan.

## 3. Pengguna

| Pengguna | Kebutuhan |
|---|---|
| Pelapor | Mengirim laporan, melampirkan bukti, dan melacak status |
| Agent | Melihat dan menangani laporan yang ditugaskan |
| Manager/Admin | Mengelola laporan, agent, kategori, dokumen, dan branding |
| Superadmin | Mengelola konfigurasi dan perusahaan secara menyeluruh |

## 4. Ruang Lingkup MVP

### Wajib

- Form pengaduan publik.
- Kode tiket dan pelacakan menggunakan tiket serta email.
- Login internal berbasis JWT.
- Dashboard KPI.
- Daftar dan detail pengaduan.
- Perubahan status, prioritas, dan assignment.
- Pengelolaan kategori, perusahaan, branding, email resmi, dan template.
- Upload dokumen Surat Kuasa.

### Tahap berikutnya

- Notifikasi email/WhatsApp dan laporan terjadwal.
- SLA breach otomatis, alert, dan audit untuk seluruh aktivitas.
- Hardening upload dan perlindungan endpoint publik.
- Aplikasi mobile yang terhubung penuh ke API.

## 5. Kriteria Keberhasilan

- Pelapor dapat membuat tiket dan menerima kode tiket.
- Pelapor dapat melihat status dan riwayat respons tiketnya.
- Agent hanya dapat melihat dan mengubah data sesuai kewenangannya.
- Admin dapat menelusuri seluruh aktivitas penting melalui audit log.
- Instalasi baru membuat seluruh tabel runtime tanpa urutan migrasi manual.
- Build frontend dan health check backend berhasil.

## 6. Batasan dan Asumsi

- PostgreSQL digunakan sebagai database utama.
- Ollama bersifat opsional untuk fitur AI.
- Sistem membutuhkan pengaturan secret, storage upload, dan layanan notifikasi pada deployment produksi.
- Dokumen ini menggambarkan kondisi kode saat audit 27 Agustus 2026.

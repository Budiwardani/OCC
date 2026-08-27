# Manual Book OCC

## 1. Akses Aplikasi

Dengan Docker:

- Portal web: http://localhost:5173
- API backend: http://localhost:5000
- PostgreSQL host: port `5433`
- Ollama host: port `11435`

## 2. Membuat Pengaduan

1. Buka portal OCC.
2. Pilih **Buat Laporan**.
3. Isi nama, email, nomor telepon, lokasi, kota, subjek, kategori, dan uraian.
4. Tambahkan foto atau dokumen pendukung bila diperlukan.
5. Kirim formulir.
6. Simpan kode tiket yang ditampilkan.

Jangan membagikan kode tiket dan email pelapor kepada pihak yang tidak berwenang.

## 3. Melacak Pengaduan

1. Pilih **Lacak Laporan**.
2. Masukkan kode tiket.
3. Masukkan email yang digunakan saat membuat laporan.
4. Kirim pencarian.
5. Periksa status, detail, dan riwayat respons yang tersedia.

## 4. Login Internal

Gunakan halaman `/login` dengan akun Superadmin berikut pada instalasi lokal:

- Email: `admin@occ.com`
- Password: `superadmin123`

Segera ganti password pada lingkungan produksi dan jangan membagikan kredensial ini.

Setelah login, pengguna internal dapat mengakses menu sesuai role yang diberikan, seperti dashboard, pengaduan, agent, kategori, perusahaan, branding, email resmi, dan template.

## 5. CRUD User oleh Superadmin

1. Login menggunakan akun Superadmin.
2. Buka menu **Agents & Managers** atau URL `/dashboard/agents`.
3. Klik **Add New User** untuk membuat Agent, Manager, atau Superadmin.
4. Klik **Edit** untuk mengubah nama, email, role, company, atau password.
5. Klik **Delete** untuk menghapus user lain.

Superadmin dapat mengelola user lintas company. Manager hanya dapat membuat dan mengelola Agent pada company-nya. Akun yang sedang digunakan tidak dapat menghapus dirinya sendiri.

## 5. Menangani Pengaduan

1. Buka daftar pengaduan.
2. Gunakan pencarian atau filter status.
3. Buka detail laporan.
4. Atur prioritas dan status.
5. Assign kepada agent bila diperlukan.
6. Gunakan fitur dokumen yang tersedia sesuai proses organisasi.
5. Tulis respons kepada pelapor dari panel **Responses**.
6. Catat tindak lanjut melalui mekanisme yang tersedia.

Catatan: SLA awal dan audit aktivitas tercatat saat perubahan/respons; job breach otomatis dan notifikasi provider masih membutuhkan konfigurasi lanjutan.

## 6. Surat Kuasa

- Admin dapat mengelola template master.
- Pengguna dapat menggunakan halaman upload berdasarkan tiket bila alur tersebut diaktifkan.
- Verifikasi akses dan kebijakan penyimpanan dokumen wajib dilakukan sebelum penggunaan produksi.

## 7. Troubleshooting

- Jika halaman tidak terbuka, periksa `docker compose ps`.
- Jika backend gagal, lihat `docker compose logs backend`.
- Jika frontend gagal, lihat `docker compose logs frontend`.
- Jika port database bentrok, gunakan port host yang ditetapkan di `docker-compose.yml`.
- Jika AI tidak merespons, pastikan container Ollama hidup dan model yang dipakai sudah tersedia.

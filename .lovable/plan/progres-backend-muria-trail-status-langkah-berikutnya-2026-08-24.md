# Progres Backend Muria Trail — Status & Langkah Berikutnya

## Yang Sudah Berjalan (Selesai)

### 1. Database & Skema — 100%
- **6 tabel** aktif dengan RLS: `profiles`, `user_roles`, `bookings`, `booking_members`, `daily_quotas`, `trail_status`
- **4 file migrasi** sudah dijalankan ke database
- Sistem peran (role) terpisah di `user_roles` (admin, pendaki) dengan fungsi `has_role()`
- Trigger otomatis `handle_new_user()` membuat profil + role saat daftar

### 2. Autentikasi — 90%
- Daftar/masuk dengan **email + password** — jalan
- Daftar/masik dengan **nomor HP** (dipetakan ke email internal) — jalan
- **Google OAuth** — sudah dikonfigurasi
- **Kurang**: belum ada halaman "lengkapi profil" khusus setelah daftar pertama (NIK, golongan darah, kontak darurat) — saat ini terisi lewat form registrasi pendaki

### 3. Sistem Kuota — 100%
- Fungsi `pakai_kuota()`: memotong slot harian secara atomik, tolak bila penuh
- Fungsi `batal_kuota()`: kembalikan slot bila booking gagal
- Unique index pada `(jalur_id, tanggal)` mencegah race condition
- Admin bisa atur kapasitas harian per jalur per tanggal

### 4. Alur Pemesanan & Pembayaran (Mock) — 80%
- Pilih jalur + tanggal → form registrasi pendaki → ringkasan → bayar simulasi → e-tiket
- Data rombongan (ketua + anggota) tersimpan ke `booking_members`
- **Pembayaran masih mock** — simulasi 1.6 detik lalu tandai lunas, tidak ada uang nyata
- E-tiket QR code asli per booking + cache offline di localStorage

### 5. Dashboard Admin — 85%
- Lihat & ubah kuota harian per jalur per tanggal
- Ubah status jalur (Buka / Waspada / Tutup sementara)
- Validasi e-tiket lewat input manual kode booking (check-in)
- Lihat daftar pemesanan harian + total pendaki lunas
- Klaim admin pertama untuk pengelola basecamp
- **Kurang**: belum ada scanner QR via kamera (manual saja)

### 6. Profil Pengguna — 80%
- Tampil & edit data profil dari database
- Riwayat pendakian dari tabel bookings
- Tombol keluar (logout)
- Link ke dashboard admin bila punya role admin

---

## Yang Belum Selesai / Perlu Dikerjakan

### A. Keamanan & Server Functions — Prioritas Tinggi
**Masalah saat ini**: logika pembayaran (`bayarMock`) dijalankan dari sisi client (browser). Ini berarti:
- Kuota dipotong lewat `supabase.rpc()` dari client — user bisa memanipulasi
- Insert booking & anggota dari client — tidak ada validasi server

**Solusi**: pindahkan ke `createServerFn` (server function):
- `buatBooking` server function yang handle pemotongan kuota + insert booking + insert members dalam satu transaksi
- `validasiTiket` server function untuk check-in admin dengan verifikasi role

### B. Route Protection — Prioritas Tinggi
**Masalah**: tidak ada layout `_authenticated`. Semua halaman (`/beranda`, `/pesan`, `/tiket`, `/profil`) bisa diakses tanpa login.

**Solusi**: buat `src/routes/_authenticated/route.tsx` yang redirect ke `/masuk` bila belum login, lalu pindahkan route yang butuh login ke bawahnya.

### C. Upload Dokumen — Prioritas Sedang
- Belum ada bucket storage untuk upload KTP & surat sehat
- Form registrasi pendaki sudah ada UI upload, tapi belum tersimpan ke mana pun
- Perlu: buat storage bucket + integrasi upload di form

### D. Pembayaran Nyata — Prioritas Rendah (mock sudah cukup untuk demo)
- Ganti `bayarMock` dengan gateway sungguhan (Stripe atau Paddle)
- Webhook untuk update status pembayaran otomatis

### E. Scanner QR Kamera — Prioritas Rendah
- Tambah akses kamera di dashboard admin untuk scan QR otomatis
- Saat ini admin input manual kode booking

### F. Polish & Testing
- Uji end-to-end: daftar → login → pesan → bayar → e-tiket → check-in admin
- Validasi input (Zod) di semua form
- Publish aplikasi

---

## Rekomendasi Urutan Pengerjaan

1. **A + B** (keamanan & route protection) — paling penting agar data aman
2. **C** (upload dokumen) — melengkapi form registrasi
3. **F** (testing & publish) — siap untuk presentasi
4. **D + E** (pembayaran nyata & scanner) — setelah presentasi, untuk go-live

Mau saya mulai dari mana?

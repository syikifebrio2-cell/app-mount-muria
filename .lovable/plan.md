# Rencana Produksi: Muria Trail (Full-Stack)

Tujuan: mengubah aplikasi UI mockup menjadi aplikasi pendakian Gunung Muria yang benar-benar bisa dipakai pengguna untuk memesan tiket, membayar, dan mendapat e-tiket valid.

## State Saat Ini
- 10 layar UI sudah jadi (splash, onboarding, login, home, pemesanan, registrasi, pembayaran, e-tiket, info jalur, profil).
- Data jalur sudah dirangkum di `src/data/muria.ts` (Rahtawu, Tempur, Colo).
- Belum ada backend, autentikasi, database, dan pembayaran.

## Keputusan Awal
- **Profil pengguna**: disimpan lengkap (nama, HP, NIK, golongan darah, kontak darurat, dll).
- **Pembayaran**: integrasi nyata. Rekomendasi provider: **Paddle** (cocok untuk platform booking/reservasi).
- **Admin**: ada dashboard terpisah untuk pengelola basecamp mengatur kuota, status jalur, dan memvalidasi tiket.

## Tahap 1: Persiapan Infrastruktur
1. Aktifkan **Lovable Cloud** untuk mendapatkan database, autentikasi, storage, dan secrets.
2. Aktifkan **Paddle Payments** (built-in Lovable) setelah konfirmasi user.
3. Siapkan bucket storage untuk upload KTP/surat sehat pendaki.

## Tahap 2: Skema Database & Keamanan
1. Buat tabel `profiles` terhubung ke `auth.users` dengan trigger auto-create saat signup.
2. Buat tabel `user_roles` (admin, moderator, user) dan fungsi `has_role()` untuk otorisasi.
3. Buat tabel `bookings` untuk menyimpan pesanan tiket.
4. Buat tabel `booking_members` untuk data anggota rombongan.
5. Buat tabel `daily_quotas` untuk kuota harian per jalur.
6. Buat tabel `trail_status` untuk status jalur yang bisa diubah admin.
7. Terapkan RLS policy pada semua tabel agar pengguna hanya bisa akses data sendiri, admin bisa akses sesuai peran.
8. Grant SELECT/INSERT/UPDATE/DELETE ke role yang sesuai.

## Tahap 3: Autentikasi & Profil
1. Implementasi login/register dengan email/password dan Google OAuth.
2. Buat halaman profil yang mengambil dan mengupdate data dari tabel `profiles`.
3. Tambahkan halaman lengkapi profil setelah pertama kali daftar (nama, HP, NIK, golongan darah, kontak darurat).
4. Wire `onAuthStateChange` di root route dan atur redirect setelah login/logout.
5. Lindungi route `beranda`, `pesan`, `registrasi`, `pembayaran`, `tiket`, `profil` di bawah layout `_authenticated`.

## Tahap 4: Flow Pemesanan & Pembayaran
1. Di layar `pesan`, ambil data jalur dan kuota real-time dari database.
2. Saat user pilih tanggal & jalur, cek ketersediaan kuota via server function.
3. Simpan draft booking saat lanjut ke form registrasi.
4. Form registrasi pendaki menyimpan data anggota rombongan ke `booking_members`.
5. Di ringkasan pembayaran, hitung total berdasarkan data dinamis.
6. Integrasi checkout Paddle untuk menerima pembayaran.
7. Webhook Paddle memperbarui status booking menjadi `paid`.

## Tahap 5: E-Tiket & Offline
1. Generate QR code unik per booking setelah pembayaran berhasil.
2. Tampilkan e-tiket dengan data booking, rombongan, dan syarat ketentuan.
3. Simpan e-tiket ke localStorage / IndexedDB agar bisa diakses offline.
4. Tombol download e-tiket sebagai gambar/PDF ringkas.

## Tahap 6: Dashboard Admin
1. Buat route terpisah `/admin` dengan guard role `admin`.
2. Dashboard menampilkan:
   - Daftar booking harian per jalur.
   - Form update kuota harian.
   - Form update status jalur (buka/waspada/tutup).
   - Scanner/validasi QR e-tiket (input manual atau kamera).
3. Admin bisa melihat detail rombongan dan status pembayaran.

## Tahap 7: Info Jalur & Cuaca
1. Info jalur tetap mengambil dari `src/data/muria.ts` (bisa juga dimigrasi ke database jika ingin admin edit).
2. Tambahkan indikator status jalur real-time dari tabel `trail_status`.
3. Cuaca tetap mockup atau bisa ditambahkan integrasi API cuaca eksternal di tahap berikutnya.

## Tahap 8: Testing & Go-Live
1. Uji end-to-end: daftar → login → pilih jalur → isi data → bayar → lihat e-tiket.
2. Uji flow admin: update kuota, ubah status, validasi tiket.
3. Periksa RLS dan keamanan input (Zod validation).
4. Publish aplikasi agar bisa diakses publik.

## Estimasi Pengerjaan
- Tahap 1–2: infrastruktur & database (~1 sesi).
- Tahap 3: autentikasi & profil (~1 sesi).
- Tahap 4–5: booking, pembayaran, e-tiket (~2 sesi).
- Tahap 6: dashboard admin (~1 sesi).
- Tahap 7–8: polish, testing, publish (~1 sesi).

## Catatan Penting
- Semua perubahan database dilakukan via migration tool setelah Lovable Cloud aktif.
- Pembayaran awal menggunakan mode test Paddle; live payment memerlukan verifikasi akun Paddle.
- Data pribadi pendaki (NIK, KTP) dienkripsi dan diatur RLS ketat.

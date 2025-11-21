# Setup Google Sign-In - Panduan Lengkap

## Error: `auth/unauthorized-domain`

Jika Anda melihat error ini, berarti domain Anda belum ditambahkan ke Firebase Authorized domains.

## Langkah-langkah Setup (Step by Step)

### Step 1: Enable Google Provider

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **posturgo-id**
3. Klik **Authentication** di menu kiri
4. Klik tab **Sign-in method**
5. Cari **Google** di daftar providers
6. Klik pada **Google**
7. Toggle **Enable** menjadi **ON** (biru)
8. Pilih **Support email** (pilih email project Anda)
9. Klik **Save**

### Step 2: Tambahkan Authorized Domains (WAJIB!)

**Ini adalah langkah yang paling penting!**

1. Masih di halaman **Authentication**
2. Klik tab **Settings** (ikon gear ⚙️ di bagian atas, sebelah "Sign-in method")
3. Scroll ke bawah sampai bagian **Authorized domains**
4. Anda akan melihat daftar domain default:
   - `localhost` (sudah ada)
   - `your-project.firebaseapp.com` (sudah ada)
   - `your-project.web.app` (sudah ada)

5. **Klik tombol "Add domain"**
6. Masukkan: `127.0.0.1`
7. Klik **Add**
8. **Tunggu beberapa detik** sampai domain muncul di daftar

### Step 3: Verifikasi

1. Pastikan `127.0.0.1` sudah muncul di daftar Authorized domains
2. Pastikan statusnya aktif (tidak ada tanda error)

### Step 4: Test di Browser

1. **Tutup semua tab** yang membuka aplikasi
2. **Buka browser baru** atau **clear cache** (Ctrl+Shift+Delete)
3. Buka aplikasi di `http://127.0.0.1:8000`
4. Klik tombol "Masuk dengan Google"
5. Popup Google Sign-In seharusnya muncul

## Troubleshooting

### Masih error setelah menambahkan domain?

1. **Tunggu 1-2 menit** - Perubahan bisa memakan waktu untuk diterapkan
2. **Clear browser cache** dan refresh
3. **Tutup semua tab** aplikasi dan buka lagi
4. **Periksa kembali** di Firebase Console bahwa domain sudah benar-benar terdaftar

### Popup tidak muncul?

1. Periksa apakah browser memblokir popup
2. Izinkan popup untuk `127.0.0.1` di browser settings
3. Coba di browser lain (Chrome, Firefox, Edge)

### Domain tidak bisa ditambahkan?

1. Pastikan Anda adalah owner/admin project Firebase
2. Pastikan project **posturgo-id** sudah aktif
3. Coba logout dan login ulang ke Firebase Console

## Checklist Final

Sebelum test, pastikan:

- [ ] Google provider sudah **Enabled** di Firebase Console
- [ ] Support email sudah dipilih
- [ ] Domain `127.0.0.1` sudah ditambahkan ke Authorized domains
- [ ] Domain `localhost` sudah ada di Authorized domains
- [ ] Sudah menunggu 1-2 menit setelah menambahkan domain
- [ ] Browser cache sudah di-clear
- [ ] Aplikasi dibuka di `http://127.0.0.1:8000` (bukan `file://`)

## Screenshot Lokasi Settings

1. **Authentication** → **Settings** (ikon gear)
2. Scroll ke bawah → **Authorized domains**
3. Klik **Add domain** → Masukkan `127.0.0.1` → **Add**

Setelah semua langkah selesai, Google Sign-In seharusnya berfungsi dengan baik!


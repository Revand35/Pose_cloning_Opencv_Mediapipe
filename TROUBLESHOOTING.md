# Troubleshooting Google Sign-In

## Masalah: Tombol "Masuk dengan Google" tidak berfungsi

### 1. Pastikan Google Provider Sudah Diaktifkan di Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **posturgo-id**
3. Buka **Authentication** → **Sign-in method**
4. Klik pada **Google** provider
5. Pastikan **Enable** toggle sudah ON
6. Pilih **Support email** (email project Anda)
7. Klik **Save**

### 2. Tambahkan Domain ke Authorized Domains (PENTING!)

**Ini adalah langkah yang paling penting untuk mengatasi error `auth/unauthorized-domain`:**

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **posturgo-id**
3. Buka **Authentication** di menu kiri
4. Klik tab **Settings** (ikon gear di bagian atas)
5. Scroll ke bawah ke bagian **Authorized domains**
6. Klik **Add domain**
7. Tambahkan domain berikut satu per satu:
   - `127.0.0.1` ← **WAJIB untuk localhost testing**
   - `localhost` ← **WAJIB untuk development**
   - Domain production Anda (jika sudah deploy, contoh: `yourdomain.com`)
8. Klik **Add** untuk setiap domain
9. **Refresh halaman aplikasi** setelah menambahkan domain

**Catatan:** Perubahan Authorized domains bisa memakan waktu beberapa detik untuk diterapkan. Jika masih error, tunggu 1-2 menit dan coba lagi.

### 3. Periksa Browser Console

Buka Developer Tools (F12) dan periksa Console untuk error messages:

**Error: "auth/operation-not-allowed"**
- Google Sign-In belum diaktifkan di Firebase Console
- Solusi: Enable Google provider (lihat langkah 1)

**Error: "auth/popup-blocked"**
- Browser memblokir popup
- Solusi: Izinkan popup untuk domain ini di browser settings

**Error: "auth/popup-closed-by-user"**
- User menutup popup sebelum selesai
- Solusi: Coba lagi dan jangan tutup popup

**Error: "auth/unauthorized-domain"**
- Domain tidak diizinkan
- Solusi: Tambahkan domain ke Authorized domains di Firebase Console

### 4. Test dengan Console Logs

Setelah update kode, buka browser console dan klik tombol Google Sign-In. Anda akan melihat:
- "Google login button clicked"
- "Attempting Google Sign-In..."
- Jika berhasil: "Google Sign-In successful: [email]"
- Jika gagal: Error message detail

### 5. Pastikan Menggunakan HTTPS atau localhost

Firebase Authentication memerlukan:
- HTTPS (untuk production)
- localhost (untuk development)
- 127.0.0.1 (untuk local testing)

**Jangan** menggunakan `file://` protocol.

### 6. Clear Browser Cache

Kadang browser cache bisa menyebabkan masalah:
1. Clear cache browser
2. Hard refresh (Ctrl+Shift+R atau Cmd+Shift+R)
3. Coba lagi

### 7. Test di Browser Lain

Coba di browser yang berbeda untuk memastikan bukan masalah browser spesifik.

## Checklist Setup Google Sign-In

- [ ] Google provider enabled di Firebase Console
- [ ] Support email sudah dipilih
- [ ] Domain sudah ditambahkan ke Authorized domains
- [ ] Menggunakan HTTPS atau localhost (bukan file://)
- [ ] Browser tidak memblokir popup
- [ ] Console tidak menunjukkan error

## Jika Masih Tidak Berfungsi

1. Periksa console browser untuk error detail
2. Periksa Network tab untuk melihat request ke Firebase
3. Pastikan koneksi internet stabil
4. Coba logout dan login ulang ke Firebase Console


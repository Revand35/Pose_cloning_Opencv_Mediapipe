# Troubleshooting Gemini API - Error 404

## Masalah
Semua model Gemini API mengembalikan error `404 Not Found`.

## Kemungkinan Penyebab

### 1. Generative Language API Belum Di-Enable
**Solusi:**
1. Buka [Google Cloud Console - API Library](https://console.cloud.google.com/apis/library)
2. Cari "Generative Language API" atau "Generative AI API"
3. Klik pada hasil pencarian
4. Klik tombol **"Enable"** atau **"Aktifkan"**
5. Tunggu beberapa menit hingga API aktif

### 2. API Key Tidak Memiliki Izin
**Solusi:**
1. Buka [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Cari API key yang Anda gunakan
3. Klik pada API key untuk membuka detail
4. Di bagian **"API restrictions"**, pastikan:
   - Pilih **"Restrict key"**
   - Pilih **"Generative Language API"** dari daftar
   - Atau pilih **"Don't restrict key"** untuk testing (tidak disarankan untuk production)
5. Simpan perubahan

### 3. API Key Tidak Valid atau Expired
**Solusi:**
1. Buka [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Buat API key baru:
   - Klik **"Create Credentials"** → **"API Key"**
   - Salin API key yang baru dibuat
   - Update API key di file `gemini-config.js`
3. Atau perbarui API key yang ada:
   - Klik pada API key
   - Klik **"Regenerate key"** jika perlu

### 4. Model Tidak Tersedia untuk Proyek/Region
**Solusi:**
1. Pastikan proyek Google Cloud Anda aktif
2. Pastikan billing account terhubung (jika diperlukan)
3. Coba gunakan model yang lebih dasar seperti `gemini-pro`
4. Periksa [dokumentasi resmi Gemini API](https://ai.google.dev/api) untuk model yang tersedia

### 5. Format Endpoint Salah
**Format yang benar:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY
```

## Langkah Verifikasi

### 1. Test API Key dengan curl
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, how are you?"
      }]
    }]
  }'
```

Jika berhasil, Anda akan mendapat response JSON dengan hasil.

### 2. Periksa Status API
1. Buka [Google Cloud Console - APIs & Services - Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Cari "Generative Language API"
3. Pastikan status menunjukkan **"Enabled"** atau **"Aktif"**

### 3. Periksa Quota dan Billing
1. Buka [Google Cloud Console - APIs & Services - Quotas](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)
2. Pastikan tidak ada pembatasan quota
3. Pastikan billing account aktif (jika diperlukan)

## Model yang Dicoba (dalam urutan)

Aplikasi akan mencoba model berikut secara berurutan:
1. `v1beta/gemini-pro` (paling dasar, seharusnya selalu tersedia)
2. `v1/gemini-pro`
3. `v1beta/gemini-1.5-flash`
4. `v1beta/gemini-1.5-pro`
5. `v1/gemini-1.5-flash`
6. `v1/gemini-1.5-pro`
7. `v1beta/gemini-1.5-flash-latest`
8. `v1beta/gemini-1.5-pro-latest`
9. `v1/gemini-1.5-flash-latest`
10. `v1/gemini-1.5-pro-latest`

Jika semua model gagal, aplikasi akan menggunakan knowledge base lokal sebagai fallback.

## Fallback System

Jika Gemini API tidak dapat diakses, aplikasi akan otomatis menggunakan knowledge base lokal yang berisi:
- Informasi tentang REBA (Rapid Entire Body Assessment)
- Informasi tentang RULA (Rapid Upper Limb Assessment)
- Tips postur tubuh
- Tips ergonomi di tempat kerja

## Bantuan Lebih Lanjut

Jika masalah masih berlanjut setelah mengikuti langkah-langkah di atas:
1. Periksa [Google AI Studio](https://makersuite.google.com/app/apikey) untuk membuat API key baru
2. Periksa [dokumentasi resmi Gemini API](https://ai.google.dev/api)
3. Hubungi dukungan Google Cloud

## Catatan Penting

- **API Key adalah rahasia**: Jangan pernah commit API key ke repository publik
- **Billing**: Beberapa model mungkin memerlukan billing account yang aktif
- **Rate Limits**: API memiliki batasan rate limit, pastikan tidak melebihi quota
- **Region**: Beberapa model mungkin hanya tersedia di region tertentu


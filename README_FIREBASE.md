# Setup Firebase untuk PosturGO

## Langkah-langkah Setup:

### 1. Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau pilih project yang sudah ada
3. Ikuti wizard untuk membuat project baru

### 2. Enable Authentication

1. Di Firebase Console, pilih project Anda
2. Buka **Authentication** di menu kiri
3. Klik **Get Started**
4. Pilih tab **Sign-in method**
5. Enable **Email/Password** provider
6. Klik **Save**
7. Enable **Google** provider:
   - Klik pada **Google** provider
   - Toggle **Enable**
   - Pilih **Support email** (email project Anda)
   - Klik **Save**

### 3. Buat Realtime Database

1. Di Firebase Console, buka **Realtime Database** di menu kiri
2. Klik **Create Database**
3. Pilih lokasi database (pilih yang terdekat)
4. Pilih **Start in test mode** (untuk development)
5. Klik **Enable**

### 4. Atur Database Rules (Penting!)

1. Di Realtime Database, buka tab **Rules**
2. Ganti rules dengan berikut:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "sessions": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

3. Klik **Publish**

### 5. Dapatkan Firebase Configuration

1. Di Firebase Console, klik ikon **Settings** (gear) di samping "Project Overview"
2. Scroll ke bawah dan klik **Add app** (Web icon `</>`)
3. Register app dengan nama "PosturGO"
4. Copy konfigurasi Firebase yang diberikan

### 6. Update firebase-config.js

1. Buka file `firebase-config.js`
2. Ganti semua placeholder dengan konfigurasi dari Firebase Console:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...", // Dari Firebase Console
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

## Struktur Database

Data akan disimpan dengan struktur berikut:

```
users/
  {userId}/
    sessions/
      {sessionId}/
        timestamp: 1234567890
        rebaScore: 5
        rulaScore: 3
        rebaRiskLevel: "Investigate"
        rulaRiskLevel: "Acceptable"
        rebaComponents: {...}
        rulaComponents: {...}
```

## Fitur yang Tersedia

1. **Login/Register**: Autentikasi pengguna dengan email dan password
2. **Realtime Database**: Skor REBA/RULA disimpan setiap 5 detik saat tracking aktif
3. **Account Page**: Menampilkan statistik dan informasi akun

## Catatan Keamanan

- Database rules memastikan user hanya bisa membaca/menulis data mereka sendiri
- Pastikan untuk mengubah rules sebelum production
- Jangan commit file `firebase-config.js` dengan API key ke repository public


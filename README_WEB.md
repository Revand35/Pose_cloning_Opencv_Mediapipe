# Pose Tracking - Aplikasi Web

Aplikasi web untuk pose tracking (deteksi pose tubuh) menggunakan MediaPipe JavaScript yang berjalan langsung di browser.

## 🚀 Fitur

- **Real-time Pose Detection**: Deteksi pose tubuh secara real-time menggunakan webcam
- **Modern UI**: Interface yang modern dan responsif
- **Pengaturan Fleksibel**: 
  - Minimum Detection Confidence
  - Minimum Tracking Confidence
  - Model Complexity (Light, Full, Heavy)
  - Smoothing option
- **Informasi Real-time**: 
  - Jumlah landmarks terdeteksi
  - FPS counter
  - Status deteksi

## 📋 Persyaratan

- Browser modern yang mendukung:
  - ES6 Modules
  - WebRTC (untuk akses webcam)
  - Canvas API
- Koneksi internet (untuk load MediaPipe dari CDN)
- Webcam

## 🎯 Cara Menggunakan

### 1. Buka Aplikasi

Buka file `index.html` di browser modern (Chrome, Firefox, Edge, Safari).

**Catatan**: Untuk beberapa browser, Anda mungkin perlu menjalankan melalui web server lokal karena ES6 modules memerlukan HTTP/HTTPS protocol.

### 2. Menjalankan dengan Web Server Lokal (Disarankan)

#### Menggunakan Python:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Kemudian buka browser dan akses: `http://localhost:8000`

#### Menggunakan Node.js (http-server):

```bash
# Install http-server secara global
npm install -g http-server

# Jalankan server
http-server -p 8000
```

Kemudian buka browser dan akses: `http://localhost:8000`

#### Menggunakan VS Code Live Server:

1. Install extension "Live Server" di VS Code
2. Klik kanan pada `index.html`
3. Pilih "Open with Live Server"

### 3. Menggunakan Aplikasi

1. **Klik "Mulai Tracking"** untuk memulai pose detection
2. **Berikan izin akses kamera** ketika browser meminta
3. **Pose akan terdeteksi** dan ditampilkan dengan:
   - Skeleton (garis hijau) menghubungkan keypoints
   - Landmarks (titik merah) pada setiap keypoint
4. **Gunakan tombol "Hentikan"** untuk menghentikan tracking
5. **Klik "Pengaturan"** untuk mengubah konfigurasi:
   - Minimum Detection Confidence: Sensitivitas deteksi (0.0 - 1.0)
   - Minimum Tracking Confidence: Sensitivitas tracking (0.0 - 1.0)
   - Model Complexity: 
     - Light: Lebih cepat, kurang akurat
     - Full: Seimbang (default)
     - Heavy: Lebih lambat, lebih akurat
   - Enable Smoothing: Menghaluskan gerakan

## 📁 Struktur File

```
.
├── index.html          # File HTML utama
├── styles.css          # File CSS untuk styling
├── app.js             # File JavaScript untuk logika pose detection
└── README_WEB.md      # Dokumentasi ini
```

## 🔧 Teknologi yang Digunakan

- **HTML5**: Struktur halaman web
- **CSS3**: Styling modern dengan gradient dan animasi
- **JavaScript (ES6 Modules)**: Logika aplikasi
- **MediaPipe Tasks Vision**: Library untuk pose detection
- **WebRTC**: Akses webcam
- **Canvas API**: Rendering pose landmarks

## 🌐 Browser Support

- ✅ Chrome/Edge (Chromium) - Recommended
- ✅ Firefox
- ✅ Safari
- ⚠️ Opera

## ⚠️ Catatan Penting

1. **HTTPS/HTTP Local**: Aplikasi harus dijalankan melalui HTTP/HTTPS (tidak bisa langsung buka file://)
2. **Izin Kamera**: Browser akan meminta izin untuk mengakses webcam
3. **Koneksi Internet**: Diperlukan untuk pertama kali load MediaPipe models dari CDN
4. **GPU Support**: Aplikasi akan menggunakan GPU jika tersedia untuk performa lebih baik

## 🐛 Troubleshooting

### Kamera tidak bisa diakses
- Pastikan tidak ada aplikasi lain yang menggunakan kamera
- Periksa izin browser untuk akses kamera
- Coba refresh halaman

### Pose tidak terdeteksi
- Pastikan pencahayaan cukup
- Pastikan seluruh tubuh terlihat dalam frame
- Coba kurangi Minimum Detection Confidence di pengaturan
- Coba gunakan Model Complexity "Heavy" untuk akurasi lebih tinggi

### Performa lambat
- Gunakan Model Complexity "Light" untuk performa lebih cepat
- Tutup aplikasi/tab lain yang menggunakan banyak resource
- Pastikan browser menggunakan hardware acceleration

### Error saat load MediaPipe
- Periksa koneksi internet
- Coba refresh halaman
- Clear cache browser

## 📝 Perbedaan dengan Versi Python

| Fitur | Python Version | Web Version |
|-------|---------------|-------------|
| Platform | Desktop (Windows/Mac/Linux) | Browser (Cross-platform) |
| Instalasi | Perlu install Python & dependencies | Tidak perlu instalasi |
| Akses | Command line | Browser |
| Performa | Sangat cepat | Cukup cepat (tergantung browser) |
| Portabilitas | Perlu Python environment | Bisa dijalankan di mana saja |

## 🎨 Kustomisasi

Anda dapat mengkustomisasi aplikasi dengan mengedit:

- **styles.css**: Ubah warna, font, layout
- **app.js**: Ubah logika deteksi, warna landmarks, dll
- **index.html**: Ubah struktur HTML

## 📄 Lisensi

Proyek ini menggunakan MediaPipe yang merupakan open source project dari Google.

## 🙏 Credits

- MediaPipe oleh Google
- Pose Detection Models oleh MediaPipe Team


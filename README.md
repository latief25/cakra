# C.A.K.R.A. // Cakrawala Analisis Kebijakan & Risiko Aliran
### Sistem Simulasi Prediktif Dampak Makro-Peristiwa & Kebijakan Global

Aplikasi simulator kognitif berskala makro dengan visualisasi grafis interaktif berbasis **Vis.js Force-Directed Graph** dan arsitektur backend otomatis **API Failover**. Didesain dengan antarmuka bertema *Government Intelligence Data Center Dashboard* premium.

---

## 🛡️ Fitur Utama Sistem

1. **Dual Cognitive Engine & Auto-Failover**:
   * Sistem secara otomatis memproses simulasi menggunakan **Google Gemini 2.5 (Sistem Utama)**.
   * Jika kuota habis, koneksi terputus, atau API key Gemini kosong, sistem secara otomatis dialihkan melalui try-catch block ke **Groq Llama 3.3 (Sistem Cadangan)**.
   * Label respon akan berubah otomatis menunjukkan engine aktif: `[via UTAMA/GEMINI]` atau `[via CADANGAN/GROQ]`.
2. **Interactive Node Network (Vis.js)**:
   * Latar belakang interaktif menampilkan jaringan node visual yang melambangkan hubungan data makro-ekonomi.
   * **Efek Ripple**: Saat simulasi dijalankan, node utama (`MESIN UTAMA`) akan membesar, berubah warna menjadi kuning keemasan, dan memancarkan gelombang pegas (*repulsion ripple*) ke satelit.
   * **Pertumbuhan Timeline**: Respon AI yang masuk akan menyuntikkan 2-3 sub-node baru berkode hex secara dinamis untuk melambangkan pemetaan lini masa depan baru.
3. **Kalkulasi Animasi Telementri**:
   * **Laser Scanner**: Garis pemindai laser cyan neon menyapu panel analisis secara vertikal selama simulasi berlangsung.
   * **Flickering Data**: Selama kalkulasi berjalan, data *Tingkat Kepatuhan*, *Total Variabel*, *Akurasi Sistem*, dan *Status Integrasi* di dashboard akan berkedip acak (flicker) menyerupai aktivitas pemrosesan server intensif.
4. **Output 5 Laporan Komprehensif**:
   Sistem mewajibkan model AI menghasilkan analisis dalam 5 bagian terstruktur:
   1. **EXECUTIVE SUMMARY**
   2. **MACRO-ECONOMIC IMPACT**
   3. **PUBLIC SENTIMENT & BEHAVIOR**
   4. **MICRO-BUSINESS & LOGISTICS**
   5. **CONCLUSION & STRATEGIC RECOMMENDATION** (Kesimpulan & Rekomendasi Strategis)
5. **Penyimpanan Memori Lokal (Session Cache)**:
   * Riwayat chat disimpan secara otomatis di `localStorage` (`cakra_chat_history`). Riwayat tidak akan hilang saat browser di-refresh.
   * Tombol **`[+] SIMULASI BARU`** disediakan untuk membersihkan cache lokal dan mengatur ulang node visual ke baseline asli.
6. **Sistem Waktu WITA (GMT+8)**:
   * Jam sistem di header diatur secara real-time mengikuti Waktu Indonesia Tengah (WITA).

---

## 🚀 Panduan Setup & Penggunaan Lokal

### 1. Prasyarat Sistem
Pastikan komputer Anda sudah terinstal **Node.js** (versi 18 ke atas direkomendasikan).

### 2. Instalasi Dependensi
Buka terminal/CMD di direktori proyek Anda (`d:/laragon/www/chatbot`) dan jalankan perintah:
```bash
npm install
```

### 3. Konfigurasi Kunci API Lokal
Buat file baru bernama **`.env`** di root folder tugas, sejajar dengan `index.js`, lalu isi dengan kunci API Anda:
```env
PORT=3000

# Google Gemini API Key
GEMINI_API_KEY=KUNCI_API_GEMINI_ANDA

# Groq API Key
GROQ_API_KEY=KUNCI_API_GROQ_ANDA
```
*(File `.env` ini secara otomatis diabaikan oleh Git karena sudah didaftarkan di `.gitignore` demi keamanan).*

### 4. Jalankan Aplikasi
Mulai server dengan perintah:
```bash
npm start
```
Buka browser Anda dan akses:
```
http://localhost:3000
```

---

## 🔑 Kunci API Darurat (Penting untuk Pengumpulan Tugas)

> [!IMPORTANT]
> **Petunjuk bagi Penilai Tugas / Dosen**:
> Jika Anda menguji program ini dan file `.env` dikosongkan (tidak memiliki API key), Anda tidak perlu mengedit file kode apa pun. 
> 
> Cukup ketik **nama lengkap peserta** (pemilik tugas ini: **`Muhammad Latief Saputra`**) pada kolom input chat di bawah, lalu klik **RUN SIMULATION**.
> 
> Sistem C.A.K.R.A. akan mendeteksi nama tersebut secara otomatis, membuka enkripsi kunci API darurat di memori server, mengaktifkan status online, dan memberikan respon konfirmasi bahwa jalur Gemini dan Groq Llama kini siap digunakan.

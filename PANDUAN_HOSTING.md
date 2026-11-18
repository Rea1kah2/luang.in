# Panduan Hosting 24/7 `luang.in` (Vercel + Upstash Redis & Offline-First iOS PWA)

Panduan ini menyiapkan **`luang.in`** agar dapat diakses **24 jam online melalui HTTPS**, tetap berjalan **100% instan saat offline / Mode Pesawat** di iPhone melalui **IndexedDB + Service Worker**, dan menyinkronkan data antara **Web PWA** serta **Native iOS SwiftUI (`JadwalIn`)**.

---

## 1. Buat Database Redis Gratis (Upstash / Vercel Storage)
1. Login ke [vercel.com](https://vercel.com) memakai akun **GitHub**.
2. Pilih **Add New... -> Project**, lalu import repositori **`Rea1kah2/jadwal-in`**.
3. Konfigurasi build:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (biarkan kosong/root)
   - **Build Command:** *(kosongkan — tidak membutuhkan npm build)*
   - **Output Directory:** *(kosongkan — diatur otomatis melalui `vercel.json`)*
4. Klik **Deploy** terlebih dahulu, atau langsung sambungkan database dari tab **Storage**:
   - Di dashboard proyek Vercel, buka tab **Storage -> Create Database / Browse Marketplace -> Upstash Redis (Serverless Redis)** -> pilih paket **Free (Hobby)** -> klik **Connect to Project**.
   - Vercel otomatis menyuntikkan variable `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` (atau `KV_REST_API_URL` & `KV_REST_API_TOKEN` — keduanya didukung otomatis oleh `api/data.js`).

---

## 2. Atur PIN Akses (`JADWALIN_PIN`)
1. Di proyek Vercel Anda, buka **Settings -> Environment Variables**.
2. Tambahkan variable baru:
   - **Name:** `JADWALIN_PIN`
   - **Value:** `<PIN_PRIBADI_4_DIGIT_ANDA>` *(ganti dari default `1234` agar tidak bisa dibuka orang lain)*
   - **Environments:** centang `Production`, `Preview`, `Development`.
3. Buka tab **Deployments -> Redeploy** pada deployment terbaru agar variable aktif.

---

## 3. Verifikasi Backend & Redis
Buka endpoint healthcheck di browser:
```text
https://<nama-proyek-anda>.vercel.app/api/data?ping=true
```
Pastikan respons JSON menampilkan:
```json
{
  "status": "ok",
  "appName": "luang.in",
  "schemaVersion": 2,
  "storage": "upstash_redis",
  "kvConnected": true
}
```
*(Endpoint `?ping=true` hanya memeriksa status koneksi dan tidak pernah membuka data tugas atau PIN Anda.)*

---

## 4. Pasang sebagai Aplikasi Offline-First di iPhone / iPad (iOS)
1. Buka URL `https://<nama-proyek-anda>.vercel.app` di **Safari iOS** *(gunakan Safari agar pemasangan Home Screen PWA penuh aktif)*.
2. Masukkan 4 digit **`JADWALIN_PIN`** Anda hingga masuk ke ruang kerja `luang.in` (status berubah menjadi **`Tersinkron 24/7`**).
3. Ketuk tombol **Share** (ikon kotak dengan panah ke atas) -> pilih **Add to Home Screen** (*Tambah ke Layar Utama*) -> ketuk **Add**.
4. Buka ikon **luang.in** dari Home Screen iPhone Anda:
   - Saat **Mode Pesawat / offline**, app tetap terbuka instan dari Service Worker (`luangin-v3`) dan menyimpan perubahan di **IndexedDB + localStorage** dengan label **`Lokal Offline (Menunggu Sync)`**.
   - Begitu internet tersambung kembali, `luang.in` otomatis mengunggah perubahan offline ke cloud tanpa tertimpa data lama.

---

## 5. Sinkronisasi Dua Arah dengan Native iOS SwiftUI App (`JadwalIn`)
1. Buka `JadwalIn.xcodeproj` di Xcode dan jalankan di iPhone / Simulator.
2. Masuk ke tab **Wawasan -> Sinkronisasi Cloud (Vercel)**.
3. Aktifkan **Aktifkan Sync 24/7**, masukkan:
   - **URL Vercel:** `https://<nama-proyek-anda>.vercel.app`
   - **PIN Akses Server:** PIN `JADWALIN_PIN` yang sama.
4. Ketuk **Tarik & Sinkron** — tugas, jadwal kuliah, habit, countdown, dan sesi fokus kini tersinkron otomatis antara iPhone Native App dan Web PWA!

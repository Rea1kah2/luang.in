# Panduan Hosting 24/7 `luang.in` (Render + Neon PostgreSQL + Vercel PWA)

Panduan lengkap ini menyiapkan **`luang.in`** menggunakan arsitektur **100% Gratis Permanen**:
- **Backend REST API:** [Render](https://render.com) (Node.js Web Service di region Singapore).
- **Database Serverless:** [Neon](https://neon.tech) (PostgreSQL Serverless dengan kuota 0.5 GiB gratis permanen & JSONB store).
- **Frontend Web PWA:** [Vercel](https://vercel.com) (Global Edge CDN, instan tanpa cold start, didukung Service Worker & IndexedDB offline-first).
- **Native iOS App:** SwiftUI (`JadwalIn`) tersinkronisasi 2 arah dengan endpoint yang sama.

```mermaid
flowchart TD
    subgraph Clients["Klien Pengguna"]
        PWA["iPhone / Safari PWA\n(Offline-First + sw.js)"]
        iOS["Native iOS SwiftUI\n(ScheduleStore.swift)"]
    end

    subgraph Frontend["Vercel (Global Edge CDN)"]
        StaticCDN["Static Web Assets (web/)\n0 ms Cold Start"]
    end

    subgraph Backend["Render (Singapore)"]
        NodeServer["Node.js Server (server.js)\n• /api/data & /health\n• Strict PIN Auth\n• CORS Enabled"]
    end

    subgraph Database["Neon Serverless PostgreSQL"]
        PostgresDB[("Tabel: app_store\nPayload JSONB (0.5 GiB Free)")]
    end

    PWA <-->|"1. Load UI Instan"| StaticCDN
    PWA <-->|"2. REST Sync JSON"| NodeServer
    iOS <-->|"REST Sync JSON"| NodeServer
    NodeServer <-->|"pg Connection Pool (SSL)"| PostgresDB
```

---

## 1. Buat Database Gratis di Neon PostgreSQL

1. Buka [neon.tech](https://neon.tech) dan daftar menggunakan akun **GitHub** atau Google.
2. Klik **Create Project**:
   - **Project Name:** `luangin-db`
   - **Postgres Version:** 16 (default)
   - **Region:** **Singapore / `ap-southeast-1`** (terdekat dengan Indonesia untuk latensi terendah).
3. Setelah database terbuat, pada halaman Dashboard Neon, salin **Connection String**:
   - Pastikan opsi **Pooled connection** dicentang (menggunakan endpoint `-pooler.neon.tech`).
   - Formatnya menyerupai:
     ```text
     postgresql://neondb_owner:npg_xxxx@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
4. *Selesai!* Anda tidak perlu membuat tabel manual karena server `luang.in` memiliki fitur **Auto-DDL** yang otomatis membuat tabel `app_store` dan menyisipkan data sampel saat pertama kali terhubung.

---

## 2. Deploy Backend ke Render (100% Gratis)

1. Buka [render.com](https://render.com) dan login dengan akun **GitHub** Anda.
2. Anda dapat memilih salah satu cara deploy:

### Opsi A: Render Blueprint (Otomatis & Cepat) ⭐
1. Klik tombol **New +** di dashboard Render, lalu pilih **Blueprint**.
2. Pilih repositori **`Rea1kah2/jadwal-in`**.
3. Render akan membaca [render.yaml](file:///Users/admin/documents/joki/jadwal-in/render.yaml) secara otomatis.
4. Masukkan environment variable yang diminta:
   - `DATABASE_URL`: Tempel connection string dari Neon (Langkah 1).
   - `JADWALIN_PIN`: 4 digit PIN pribadi Anda (misal `2026`).
5. Klik **Apply**. Render akan menginstal dependensi (`npm install`) dan menyalakan server.

### Opsi B: Buat Web Service Manual
1. Klik **New +** -> **Web Service**.
2. Pilih repositori **`Rea1kah2/jadwal-in`**.
3. Isi konfigurasi berikut:
   - **Name:** `luangin-backend`
   - **Region:** **Singapore**
   - **Root Directory:** biarkan kosong (`./`)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Tambahkan **Environment Variables**:
   - `NODE_VERSION` = `20.18.0`
   - `HOST` = `0.0.0.0`
   - `PORT` = `10000`
   - `DATABASE_URL` = `<Connection String Neon Anda>`
   - `JADWALIN_PIN` = `<PIN 4 Digit Anda>`
5. Buka tab **Advanced**, isi **Health Check Path:** `/health`.
6. Klik **Create Web Service**.

Setelah proses deploy selesai (~1-2 menit), Render akan memberikan URL publik backend Anda, misalnya:
`https://luangin-backend.onrender.com`

### Verifikasi Backend di Browser
Buka URL health check:
```text
https://<nama-backend-anda>.onrender.com/health
```
Pastikan menghasilkan respons JSON:
```json
{
  "status": "ok",
  "appName": "luang.in",
  "schemaVersion": 2,
  "storage": "neon_postgres",
  "databaseConnected": true
}
```

---

## 3. Deploy Frontend PWA ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New... -> Project** -> import repositori **`Rea1kah2/jadwal-in`**.
3. Konfigurasi build:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - **Build Command:** kosongkan
   - **Output Directory:** kosongkan (dikelola oleh `vercel.json`)
4. Klik **Deploy**.
5. Dalam beberapa detik, frontend PWA Anda aktif di:
   `https://<nama-proyek>.vercel.app`

---

## 4. Konfigurasi & Pemasangan PWA di iPhone (iOS)

1. Buka URL Vercel Anda (`https://<nama-proyek>.vercel.app`) di **Safari iOS**.
2. Masukkan 4 digit **`JADWALIN_PIN`** Anda untuk membuka ruang kerja.
3. Buka menu **Pengaturan** (ikon roda gigi di pojok kiri bawah / footer sidebar):
   - Pada bagian **Sinkronisasi Cloud (Render / Neon)**, masukkan **URL Backend Render** Anda:
     ```text
     https://<nama-backend-anda>.onrender.com
     ```
   - Ketuk **Uji Koneksi** (pastikan muncul tanda centang hijau *Terhubung!*).
   - Ketuk **Simpan URL**.
4. **Pasang ke Layar Utama iPhone:**
   - Ketuk tombol **Share** di Safari (ikon kotak dengan panah ke atas).
   - Pilih **Add to Home Screen** (*Tambah ke Layar Utama*) -> ketuk **Add**.
5. **Kelebihan Mode Offline-First:**
   - Saat membuka aplikasi dari Home Screen, aplikasi terbuka dalam **0 detik (instan)** bahkan saat offline atau saat Render sedang *cold start* (~30s).
   - Seluruh mutasi tugas tersimpan di IndexedDB lokal (`pendingSync`), dan otomatis diunggah ke database Neon begitu server Render merespons!

---

## 5. Sinkronisasi dengan Native iOS SwiftUI App (`JadwalIn`)

1. Buka `JadwalIn.xcodeproj` di Xcode dan jalankan di iPhone fisik atau Simulator.
2. Masuk ke tab **Wawasan & Profil** -> scroll ke section **Sinkronisasi Cloud (Render / Neon)**.
3. Aktifkan **Aktifkan Sync 24/7**:
   - **URL Backend:** Masukkan URL Render Anda (cth: `https://<nama-backend-anda>.onrender.com`).
   - **PIN Akses Server:** Masukkan PIN `JADWALIN_PIN` yang sama.
4. Ketuk **Tarik & Sinkron**:
   - Jadwal kuliah, daftar tugas, habit streak, countdown ujian, dan log fokus Pomodoro kini tersinkronisasi secara real-time antara iPhone Native App, iPad, dan Web PWA!

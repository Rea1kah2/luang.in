# Technical Design: luang.in Core Engine v2

## 1. Arsitektur Lintas Platform

```mermaid
flowchart TD
    subgraph Client ["Client Apps (Dual-Platform)"]
        WEB["Web PWA (web/) — Framed Sheet 4-Pane UI"]
        IOS["iOS SwiftUI (JadwalIn/) — 5-Tab Native UI"]
    end

    subgraph Engine ["Shared Domain Logic"]
        NLP["Smart NLP Parser (Date, Priority, @Course/@List, #Tag, ~Pomo, !Memory)"]
        GAP["Smart Gap™ Finder (07:00-22:00 Free Windows -> Best Q1/Q2 Match)"]
        MAT["Eisenhower Matrix Classifier (Q1-Q4)"]
        MEM["Memory Curve™ Iterator (Ebbinghaus 1-2-4-7-15)"]
        MOM["Momentum Score™ Calculator (Lv. 1-12)"]
    end

    subgraph Sync ["Persistence & Cloud Sync"]
        LS["localStorage / Atomic JSON Store"]
        API["/api/data (Vercel Serverless + Upstash Redis KV / Python Dev Server)"]
    end

    WEB --> Engine
    IOS --> Engine
    Engine --> LS
    WEB <-->|x-jadwalin-pin| API
```

## 2. Unified Store Schema v2

```json
{
  "schemaVersion": 2,
  "profile": {
    "name": "Pengguna luang.in",
    "role": "Teknik Informatika • Semester 3",
    "dailyFocusGoalMinutes": 120
  },
  "settings": {
    "theme": "classic",
    "pomoDuration": 25,
    "shortBreak": 5,
    "longBreak": 15,
    "notificationsEnabled": true
  },
  "lists": [
    { "id": "inbox", "name": "Inbox", "colorHex": "64748B" },
    { "id": "kuliah", "name": "Kuliah", "colorHex": "4772FA" },
    { "id": "organisasi", "name": "Organisasi", "colorHex": "D97706" },
    { "id": "pribadi", "name": "Pribadi", "colorHex": "247B50" }
  ],
  "courses": [],
  "tasks": [],
  "habits": [],
  "focusSessions": [],
  "countdowns": []
}
```

## 3. Penanganan Edge Cases & Migrasi
1. **Backward Compatibility v1 -> v2:** Jika store lama hanya memiliki array `assignments` dan belum memiliki `tasks`, mesin normalisasi otomatis mengonversi setiap `assignment` ke struktur `task` (memetakan `priority` string `"Tinggi"` -> `5`, `"Sedang"` -> `3`, `"Rendah"` -> `1`, dan menyinkronkan `isCompleted` dengan `status`).
2. **Validasi PIN Keamanan:** `api/data.js` dan `web/server.py` membandingkan `x-jadwalin-pin` secara tepat dengan `expectedPin` (`process.env.JADWALIN_PIN || "1234"`), tidak lagi mengizinkan `"1234"` saat PIN kustom telah diatur.
3. **Kejujuran Metrik (Anti-Slop Data Integrity):** Semua KPI di layar Insights & Dashboard (`Momentum Score`, `Focus Minutes`, `Completion Rate`, `Streaks`) dihitung secara langsung dari array data aktual pada saat render.

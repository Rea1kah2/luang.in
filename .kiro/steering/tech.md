# Tech Baseline: luang.in (Multi-Platform)

## 1. Stack & Runtime

### A. Web PWA & Cloud Backend
- **Frontend:** Vanilla HTML5, CSS3, dan ES6+ JavaScript (`web/index.html`, `web/style.css`, `web/app.js`) tanpa bundler atau dependency framework pihak ketiga.
- **PWA:** Service Worker (`web/sw.js` cache `luangin-v2`) dan Web App Manifest (`web/manifest.json`).
- **Audio Engine:** Web Audio API native untuk White Noise / Ambient Synthesizer (tanpa aset MP3 berat).
- **Cloud API:** Node.js Vercel Serverless Function (`api/data.js`) + Upstash Redis REST KV (`jadwalin_store`), dengan fallback *in-memory* untuk pratinjau tanpa KV.
- **Local Dev Server:** Python 3 `ThreadingHTTPServer` (`web/server.py`, default port `8081`) yang menyimpan ke `web/jadwalin_store.json`.
- **Security:** Autentikasi header `x-jadwalin-pin` ketat terhadap `JADWALIN_PIN` (default `1234` hanya bila env var tidak diset; tidak ada *hardcoded bypass* `1234` saat PIN kustom diset).

### B. Native iOS Application
- **Target OS:** iOS 16.0+
- **Toolchain:** Xcode 14.2+ / Swift 5.7+
- **UI Framework:** SwiftUI (`@MainActor` state mutations)
- **Architecture Pattern:** MVVM dengan `ScheduleStore` (`ObservableObject`)
- **Third-Party Dependencies:** **ZERO** (Apple Foundation, SwiftUI, Combine, UserNotifications).

## 2. Persistence & Backward Compatibility
- **Unified Store Schema v2:** `{ schemaVersion: 2, courses, lists, tasks, assignments, habits, focusSessions, countdowns, profile, settings }`.
- **Migrasi Otomatis:** API, Web App, dan `ScheduleStore.swift` secara otomatis memigrasikan payload v1 (`assignments`) ke v2 (`tasks`) dan menjaga sinkronisasi kunci agar data lama tidak hilang.
- **Atomic & Offline-First:** Web menyinkronkan ke `/api/data` dengan fallback `localStorage`; iOS menulis secara `.atomic` ke `Documents/jadwalin_store.json`.

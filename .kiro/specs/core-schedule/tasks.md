# Implementation Tasks: luang.in 2.0

- [x] **1. Brand & Spesifikasi (.kiro/)**
  - [x] 1.1 Perbarui steering & spec ke identitas `luang.in` (Framed Sheet + 5 Signature Features)

- [x] **2. Cloud Sync API, Local Dev Server & Store v2 Seed**
  - [x] 2.1 Perbarui `api/data.js` dengan validasi Store v2, migrasi v1->v2, dan perbaikan validasi PIN ketat
  - [x] 2.2 Perbarui `web/server.py` dan `web/jadwalin_store.json` untuk Store v2

- [x] **3. Web PWA (`web/`) — Framed Sheet TickTick UI & Engine**
  - [x] 3.1 Perbarui `web/icon.svg` (Time-Gap Grid), `web/manifest.json`, dan `web/sw.js`
  - [x] 3.2 Bangun `web/index.html` & `web/style.css` (IBM Plex Sans/Mono, 5 tema TickTick, Framed Sheet + Inspector)
  - [x] 3.3 Bangun `web/app.js` (Smart NLP, Interactive Time-Gap Ribbon, List/Kanban/Timeline, Calendar Arrange, Eisenhower Matrix, PomoFlow + Web Audio White Noise, Streak-Safe Habit, Countdown, Momentum Score)
  - [x] 3.4 Audit tampilan Web dengan `taste-skill` `lint.mjs --app` (`0 FAIL`) & verifikasi DOM/visual Chrome headless (`0` runtime error, desktop `1440px` & mobile `390px` `overflow: false`)

- [x] **4. Native iOS SwiftUI (`JadwalIn/` & `JadwalInTests/`)**
  - [x] 4.1 Perbarui Models (`Priority`, `Course`, `Assignment`/Task, `Habit`, `FocusSession`, `CountdownItem`)
  - [x] 4.2 Perbarui `ScheduleStore.swift` (NLP, Smart Gap™, Memory Curve™, Matrix, Momentum Score™)
  - [x] 4.3 Perbarui `ColorTokens.swift`, `Typography.swift`, dan Shared Components
  - [x] 4.4 Perbarui `MainTabView` (5 tab) dan Feature Views (`TodayView`, `ScheduleView`, `AddCourseSheet`, `AssignmentsView`, `AddAssignmentSheet`, `SettingsView`)
  - [~] 4.5 Perbarui `JadwalInTests.swift` & verifikasi kompilasi `swiftc` terhadap `iPhoneSimulator16.2.sdk` (`SWIFTC_TESTS_TYPECHECK_OK`, 20 `.o` object files); eksekusi live `xcodebuild test` di Simulator menunggu sesi non-sandbox CoreSimulator.

- [x] **5. Vercel 24/7 Hosting, Upstash Redis & Offline-First Sync**
  - [x] 5.1 Konfigurasi header PWA `vercel.json`, multi-alias Upstash command-array + `?ping=true` di `api/data.js` & `web/server.py`
  - [x] 5.2 Ikon raster iOS (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`), Service Worker `luangin-v3`, dan IndexedDB Dual-Storage + Offline Queue anti-timpa di `web/app.js`
  - [x] 5.3 Tambahkan Cloud Sync ISO-8601 (`URLSession` <-> `/api/data`) di `ScheduleStore.swift` & `SettingsView.swift` serta unit test roundtrip Store v2 di `JadwalInTests.swift`
  - [x] 5.4 Susun `PANDUAN_HOSTING.md`, rapikan `.gitignore`/root artifacts, verifikasi Offline-First E2E Chrome + `swiftc` + Upstash KV mock tests

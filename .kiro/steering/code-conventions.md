# Code Conventions & Design System: luang.in

## 1. Aturan Penulisan Kode
- **Swift:** Gunakan *UpperCamelCase* untuk tipe dan *lowerCamelCase* untuk variabel/metode; prioritaskan `let`, hindari force unwrap (`!`), dan jaga subview tetap terdekomposisi dengan baik.
- **JavaScript:** Gunakan fungsi modular murni untuk kalkulasi domain (`parseSmartInput`, `computeSmartGaps`, `classifyQuadrant`, `computeMomentumScore`, `advanceMemoryCurve`), sanitasi seluruh input HTML via `escapeHtml()`, dan pastikan total KPI selalu dihitung dari baris data aktual.

## 2. Sistem Desain: TickTick Framed Sheet + Anti-Slop Floor
Desain mengadopsi struktur **Framed Sheet** ala TickTick desktop/mobile dengan disiplin **Operate Mode**:

### Tipografi (Web & iOS)
- **Web Font Stack:** `IBM Plex Sans` (`400, 500, 600`) untuk seluruh UI; `IBM Plex Mono` (`400, 500`) **khusus** untuk kode matkul (`IF2101`), badge shortcut (`⌘K`), dan digit timer Pomodoro.
- **Skala Tetap Web:** Title `22px` (weight `600`), Section `16px` (weight `600`), KPI `28px` (weight `400`, `tabular-nums`), Body `14px`, Meta/Small `12px` (minimal `11px` untuk badge padat).
- **Kasus Kalimat:** Gunakan *sentence case* untuk judul, tab, label KPI, dan header tabel. Hindari tracked-out ALL-CAPS dan penomoran indeks dekoratif (`01 //`).

### Palet Tema (5 Tema Bawaan dari TickTick)
1. **Classic Blue (Default):** `--accent: #4772FA`, `--ground: #F5F6F7`, `--surface: #FFFFFF`, `--border: #E8EAEC`, `--text: #131416`, `--muted: #5D5F60`.
2. **Night Dark:** `--accent: #4772FA`, `--ground: #09090B`, `--surface: #121215`, `--raised: #1C1C21`, `--border: #27272A`, `--text: #FAFAFA`, `--muted: #A1A1AA`.
3. **Academic Navy:** `--accent: #29386D`, `--ground: #F3F5F8`, `--surface: #FFFFFF`.
4. **Matcha Calm:** `--accent: #247B50`, `--ground: #F4F7F5`, `--surface: #FFFFFF`.
5. **Warm Ebony:** `--accent: #8C5A32`, `--ground: #F7F6F2`, `--surface: #FFFFFF`.

### Aturan Warna & Elemen Visual (Anti-Slop)
- **Colour on Data Only:** Warna muncul strictly pada **checkbox prioritas** (Tinggi `#C4242A`, Sedang `#D97706`, Rendah `#4772FA`, Tanpa `#94A3B8`), titik indikator mata kuliah, **Interactive Time-Gap Ribbon**, dan grafik SVG satu warna.
- **Surface Geometry:** White Inset Sheet (`border-radius: 16px`, `1px solid var(--border)`), card (`radius: 10px`), control (`radius: 8px`), tanpa drop-shadow di kondisi istirahat dan tanpa gradien dekoratif.
- **Ikonografi:** Gunakan ikon SVG inline bergaris `1.5px` yang seragam (tanpa emoji di navigasi, greeting, atau empty state).

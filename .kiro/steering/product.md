# Product: luang.in

## 1. Product Discovery & Problem Framing

### A. Observasi & Pain Points Lapangan
1. **Fragmentasi Alat Produktivitas:** Mahasiswa dan profesional muda aktif menggunakan 3–4 aplikasi terpisah: jadwal kuliah di foto/PDF, tugas di catatan atau to-do generik, timer Pomodoro di web terpisah, dan habit tracker di aplikasi lain.
2. **Kebutaan Terhadap Sela Waktu (*Time-Gap Blindness*):** Aplikasi to-do populer seperti TickTick sangat kuat di manajemen tugas, matriks prioritas, dan fokus, namun tidak secara native memahami struktur *Fixed Weekly Timetable* (jadwal kuliah/rutinitas mingguan) dan jeda waktu kosong (*Free Gaps*) di antara kelas.
3. **Retensi Belajar & Kebiasaan Rapuh:** Mahasiswa membutuhkan sistem pengulangan materi ujian (*spaced repetition*) dan pelacak kebiasaan yang tidak menghukum streak ketika sedang sakit/izin.

### B. Brand Identity: `luang.in`
- **Nama Produk:** `luang.in` (evolusi dari Jadwal-In — mengatur kesibukan dan memanfaatkan setiap sela waktu luang)
- **Tagline:** *"Bukan sekadar daftar tugas, ini taktik harianmu."* / *"Your daily execution tactics."*
- **Positioning:** All-in-One Academic & Personal Execution OS yang menggabungkan keandalan manajemen tugas setara TickTick dengan kesadaran penuh terhadap jadwal mingguan dan sela waktu kosong.

### C. User Persona & Profil Fleksibel
- Profil pengguna kini sepenuhnya dapat diedit (`profile.name`, `profile.role`, `profile.semester`, target fokus harian), dengan data sampel awal bertema mahasiswa Teknik/SI Semester 3 (6 mata kuliah + organisasi + pribadi).

---

## 2. Definisi Cakupan Produk (`luang.in` 2.0)

### 5 Signature Features (Unique Selling Value)
1. **Smart Gap™ (Interactive Time-Gap Ribbon `07:00–22:00`):** Visualisasi proporsional jadwal kuliah tetap vs celah waktu kosong (`>= 25 menit`). Klik celah langsung menjadwalkan tugas Q1/Q2 paling cocok ke slot waktu tersebut dan membuka opsi mulai **PomoFlow™**.
2. **Memory Curve™ (`1-2-4-7-15` Ebbinghaus Recurrence):** Mode pengulangan berbasis kurva lupa untuk tugas review/belajar (`H+1`, `H+2`, `H+4`, `H+7`, `H+15`).
3. **PomoFlow™ Studio:** Timer Pomodoro (`25/5`, `50/10`, kustom) + Stopwatch yang terikat langsung ke `Task`, `Course`, atau `Habit`, dilengkapi **Web Audio API Synthesizer** (*Brown Noise, Soft Rain, Library Hum, Clock Tick*).
4. **Streak-Safe Habit™:** Habit harian dalam seksi *Pagi / Siang / Malam* (boolean atau target angka), dilengkapi fitur **Izin / Skip (Streak-Safe)** agar streak tidak hangus saat berhalangan, serta log mood & catatan singkat.
5. **Momentum Score™ (`Lv. 1–12`):** Skor produktivitas yang dihitung secara jujur dan dinamis dari baris data aktual (tugas selesai tepat waktu, menit fokus tercatat, streak habit, dikurangi penalti keterlambatan).

### Core Modules (TickTick-Parity)
- **Smart NLP Quick-Add (`⌘K` / Input Bar):** Ekstraksi otomatis tanggal/jam (`besok 14:00`, `14:00-16:00`), prioritas (`!tinggi`/`!sedang`/`!rendah`), tag (`#ujian`), matkul/list (`@IF2101`/`@organisasi`), estimasi pomo (`~2p`), dan `!memory`.
- **Multi-View Tasks:** Tampilan **List**, **Kanban Board** (4 kolom status), dan **Timeline**, lengkap dengan status 3-arah (`Active`, `Completed`, `Won't Do`), slider progres `0–100%`, checklist subtask ringan (`items[]`), dan catatan Markdown.
- **Unified Calendar & Timetable:** Time-Block harian (`07:00–22:00`) + Arrange Unscheduled Tasks drawer, Jadwal Kuliah Mingguan (Senin–Sabtu), dan Kalender Bulanan.
- **Eisenhower Priority Matrix (`Q1–Q4`):** 4 kuadran prioritas & urgensi interaktif.
- **Countdown & Insights:** Pelacak Hari-H (UTS/UAS/Proyek) yang dapat disematkan + analitik fokus dan penyelesaian.

# Requirements Specification: luang.in 2.0

## 1. Glosarium Istilah
- **luang.in:** Execution OS & perencana akademik-pribadi yang menyatukan jadwal rutin mingguan (*Courses*), daftar tugas multi-list (*Tasks*), Kalender & Time-Blocking, Eisenhower Matrix, PomoFlow Studio, Streak-Safe Habit Tracker, dan Countdown.
- **Smart Gap™:** Mesin pendeteksi jeda waktu kosong (`>= 25 menit`) di antara jadwal kuliah/agenda tetap pada hari berjalan dan pencocokannya dengan tugas prioritas tinggi yang berdurasi sesuai.
- **Memory Curve™:** Mode pengulangan berbasis Kurva Lupa Ebbinghaus (`H+1, H+2, H+4, H+7, H+15` hari) untuk tugas review materi.

## 2. Kriteria Penerimaan Berbasis EARS

### 2.1. Smart NLP Entry & Multi-List Tasks
- **WHEN** pengguna mengetik di bar *Quick Add* dengan sintaks alami (misal `Review Jarkom besok 19:00 @IF2104 #uts !tinggi ~2p !memory`), **THE** `luang.in` **SHALL** mengekstrak judul bersih, `dueDate`, `courseId`/`listId`, `tags`, `priority`, `estimatedPomos`, dan `repeatRule: "ebbinghaus"` sebelum menyimpan.
- **THE** `luang.in` **SHALL** mendukung tugas pada `Course` akademik maupun `ProjectList` umum (`Inbox`, `Kuliah`, `Organisasi`, `Pribadi`), serta menyediakan status 3-arah (`active`, `completed`, `wont_do`), `progress` (`0–100%`), dan checklist/subtask (`items[]`).
- **WHEN** pengguna beralih antara tampilan **List**, **Kanban Board**, dan **Timeline**, **THE** `luang.in` **SHALL** memproyeksikan sumber data `tasks` yang sama tanpa duplikasi.

### 2.2. Interactive Time-Gap Ribbon & Unified Calendar
- **THE** `luang.in` **SHALL** memvisualisasikan jadwal kuliah hari ini dan sela waktu kosong (`Smart Gap™`) secara proporsional pada rentang `07:00–22:00`.
- **WHEN** pengguna menekan *"Isi sela ini"* pada sebuah celah kosong atau men-drag/menjadwalkan tugas dari panel *Arrange Unscheduled Tasks*, **THE** `luang.in` **SHALL** mengisi `startDate` dan `dueDate` tugas ke slot waktu tersebut dan menampilkannya pada grid kalender.
- **IF** pengguna menambah mata kuliah dengan jam selesai tidak lebih besar dari jam mulai, **THEN THE** `luang.in` **SHALL** menolak penyimpanan dan menampilkan pesan validasi.

### 2.3. Memory Curve™ & Eisenhower Priority Matrix
- **WHEN** pengguna menyelesaikan tugas dengan `repeatRule = "ebbinghaus"`, **THE** `luang.in` **SHALL** menandai entri berjalan selesai lalu menjadwalkan sesi review tahap berikutnya berdasarkan interval `[1, 2, 4, 7, 15]` hari.
- **THE** `luang.in` **SHALL** mengklasifikasikan seluruh tugas aktif secara otomatis ke 4 kuadran Eisenhower (`Q1`: Penting & Mendesak `<= 48j`, `Q2`: Penting & Terjadwal `> 48j`, `Q3`: Cepat & Mendesak `<= 48j`, `Q4`: Backlog).

### 2.4. PomoFlow™ Studio & White Noise
- **WHEN** timer Pomodoro selesai (atau dihentikan via Stopwatch), **THE** `luang.in` **SHALL** menyimpan `FocusSession`, menambah `completedPomos` & `focusMinutes` pada target terkait, serta memperbarui grafik statistik fokus.
- **THE** `luang.in` **SHALL** menyediakan pembangkit suara ambient (*Brown Noise, Rain, Library Hum, Clock Tick*) di browser menggunakan Web Audio API tanpa aset eksternal.

### 2.5. Streak-Safe Habit™, Countdown, Momentum Score™, & Keamanan
- **WHEN** pengguna mencatat *Skip / Izin* pada suatu habit, **THE** `luang.in` **SHALL** merekam status `skip` pada tanggal tersebut tanpa mereset `currentStreak`.
- **THE** `luang.in` **SHALL** menghitung **Momentum Score™ (`Lv. 1–12`)** secara deterministik dari total tugas selesai tepat waktu, menit fokus, dan streak kebiasaan dikurangi tugas terlambat.
- **THE** Backend (`/api/data`) **SHALL** memvalidasi header `x-jadwalin-pin` secara ketat terhadap `JADWALIN_PIN` yang dikonfigurasi tanpa *hardcoded fallback* ketika PIN kustom aktif.

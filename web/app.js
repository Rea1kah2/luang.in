/**
 * luang.in — Execution OS & Academic Planner Engine
 * Store v2 • Smart NLP • Smart Gap™ • Memory Curve™ • PomoFlow™ • Streak-Safe Habit™
 */

// ==========================================
// 1. CONSTANTS & SVG ICONS
// ==========================================
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const EBBINGHAUS_DAYS = [1, 2, 4, 7, 15];
const THEME_ORDER = ['classic', 'dark', 'navy', 'matcha', 'ebony'];
const THEME_META = [
  { id: 'classic', name: 'Classic Blue', swatch: '#4772FA' },
  { id: 'dark', name: 'Night Dark', swatch: '#141417' },
  { id: 'navy', name: 'Academic Navy', swatch: '#29386D' },
  { id: 'matcha', name: 'Matcha Calm', swatch: '#247B50' },
  { id: 'ebony', name: 'Warm Ebony', swatch: '#8C5A32' }
];

const SVG_ICONS = {
  check: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>',
  dash: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="6" y1="12" x2="18" y2="12"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="6 4 20 12 6 20 6 4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h14v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

const twoDigit = (n) => (n < 10 ? '0' + n : String(n));

// ==========================================
// 2. SEED & STORE NORMALIZATION
// ==========================================
const DEFAULT_LISTS = [
  { id: 'inbox', name: 'Inbox', colorHex: '64748B' },
  { id: 'kuliah', name: 'Kuliah', colorHex: '4772FA' },
  { id: 'organisasi', name: 'Organisasi', colorHex: 'D97706' },
  { id: 'pribadi', name: 'Pribadi', colorHex: '247B50' }
];

function buildDefaultStore() {
  const now = Date.now();
  const isoOffsetH = (h) => new Date(now + h * 3600000).toISOString();
  const isoDayAt = (dOffset, h, m) => {
    const d = new Date(now + dOffset * 86400000);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const dateKey = (dOffset) => {
    const d = new Date(now + dOffset * 86400000);
    return `${d.getFullYear()}-${twoDigit(d.getMonth() + 1)}-${twoDigit(d.getDate())}`;
  };

  return {
    schemaVersion: 2,
    profile: {
      name: 'Rani Pratiwi',
      role: 'Teknik Informatika • Semester 3',
      dailyFocusGoalMinutes: 120
    },
    settings: {
      theme: 'classic',
      pomoDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      notificationsEnabled: true
    },
    lists: [...DEFAULT_LISTS],
    courses: [
      { id: 'c-1', name: 'Algoritma & Struktur Data', code: 'IF2101', lecturer: 'Dr. Bambang Sutrisno', room: 'Lab Komputer 2', credits: 3, dayOfWeek: 1, startTime: '08:00', endTime: '10:30', colorHex: '4772FA' },
      { id: 'c-2', name: 'Sistem Basis Data', code: 'IF2102', lecturer: 'Ir. Ratna Dewi, M.Kom', room: 'Gedung B R.304', credits: 3, dayOfWeek: 1, startTime: '13:00', endTime: '15:30', colorHex: '0284C7' },
      { id: 'c-3', name: 'Pemrograman Web & Mobile', code: 'IF2103', lecturer: 'Faisal Rahman, S.T., M.T.', room: 'Lab Software 1', credits: 3, dayOfWeek: 2, startTime: '09:00', endTime: '11:30', colorHex: '247B50' },
      { id: 'c-4', name: 'Jaringan Komputer & Lab', code: 'IF2104', lecturer: 'Ahmad Hidayat, M.Cs', room: 'Gedung C R.201', credits: 3, dayOfWeek: 3, startTime: '10:00', endTime: '12:30', colorHex: 'D97706' },
      { id: 'c-5', name: 'Rekayasa Perangkat Lunak', code: 'IF2105', lecturer: 'Dr. Siti Nurhaliza', room: 'Gedung A R.102', credits: 3, dayOfWeek: 4, startTime: '08:30', endTime: '11:00', colorHex: '0F766E' },
      { id: 'c-6', name: 'Statistika & Probabilitas', code: 'IF2106', lecturer: 'Drs. Hendro Wibowo', room: 'Gedung B R.205', credits: 2, dayOfWeek: 5, startTime: '08:00', endTime: '09:40', colorHex: 'C4242A' }
    ],
    tasks: [
      {
        id: 't-1',
        listId: 'kuliah',
        courseId: 'c-1',
        title: 'Implementasi Binary Search Tree & AVL Rotation',
        notes: 'Pastikan memory leak nol dan sertakan benchmark insert/delete.',
        dueDate: isoOffsetH(16),
        priority: 5,
        status: 'active',
        isCompleted: false,
        kanbanColumn: 'in_progress',
        progress: 65,
        isPinned: true,
        repeatRule: 'none',
        ebbinghausStage: 0,
        tags: ['praktikum', 'cpp'],
        estimatedPomos: 2,
        completedPomos: 1,
        focusMinutes: 25,
        items: [
          { id: 'chk-1', title: 'Implementasi rotasi kiri & kanan AVL', isCompleted: true },
          { id: 'chk-2', title: 'Unit test traversal inorder dan postorder', isCompleted: true },
          { id: 'chk-3', title: 'Ekspor PDF laporan benchmark', isCompleted: false }
        ]
      },
      {
        id: 't-2',
        listId: 'kuliah',
        courseId: 'c-2',
        title: 'Review Normalisasi Basis Data (1NF s/d BCNF)',
        notes: 'Menggunakan Memory Curve agar konsep functional dependency matang sebelum kuis.',
        dueDate: isoDayAt(1, 20, 0),
        priority: 5,
        status: 'active',
        isCompleted: false,
        kanbanColumn: 'todo',
        progress: 25,
        isPinned: false,
        repeatRule: 'ebbinghaus',
        ebbinghausStage: 1,
        tags: ['kuis', 'review'],
        estimatedPomos: 2,
        completedPomos: 0,
        focusMinutes: 0,
        items: [
          { id: 'chk-4', title: 'Kerjakan 5 studi kasus ERD Rumah Sakit', isCompleted: false },
          { id: 'chk-5', title: 'Validasi diagram functional dependency', isCompleted: false }
        ]
      },
      {
        id: 't-3',
        listId: 'kuliah',
        courseId: 'c-3',
        title: 'Refactor REST Endpoint & Responsive Grid PWA',
        notes: 'Uji tampilan pada lebar 390px dan 1440px.',
        startDate: isoDayAt(0, 19, 0),
        dueDate: isoDayAt(0, 20, 30),
        priority: 3,
        status: 'active',
        isCompleted: false,
        kanbanColumn: 'review',
        progress: 80,
        isPinned: false,
        repeatRule: 'none',
        ebbinghausStage: 0,
        tags: ['proyek', 'frontend'],
        estimatedPomos: 2,
        completedPomos: 1,
        focusMinutes: 25,
        items: []
      },
      {
        id: 't-4',
        listId: 'organisasi',
        courseId: null,
        title: 'Finalisasi Rundown Workshop UI/UX Himpunan',
        notes: 'Konfirmasi pembicara alumni dan cek ketersediaan proyektor Aula Timur.',
        dueDate: isoDayAt(2, 17, 0),
        priority: 3,
        status: 'active',
        isCompleted: false,
        kanbanColumn: 'todo',
        progress: 40,
        isPinned: false,
        repeatRule: 'none',
        ebbinghausStage: 0,
        tags: ['himpunan', 'acara'],
        estimatedPomos: 1,
        completedPomos: 0,
        focusMinutes: 0,
        items: []
      },
      {
        id: 't-5',
        listId: 'pribadi',
        courseId: null,
        title: 'Rapikan portofolio GitHub & diagram arsitektur',
        notes: 'Tambahkan dokumentasi studi kasus.',
        dueDate: isoDayAt(5, 21, 0),
        priority: 1,
        status: 'active',
        isCompleted: false,
        kanbanColumn: 'todo',
        progress: 0,
        isPinned: false,
        repeatRule: 'none',
        ebbinghausStage: 0,
        tags: ['karir'],
        estimatedPomos: 2,
        completedPomos: 0,
        focusMinutes: 0,
        items: []
      },
      {
        id: 't-6',
        listId: 'kuliah',
        courseId: 'c-4',
        title: 'Laporan Praktikum Subnetting VLSM',
        notes: 'Sudah diserahkan via portal akademik.',
        dueDate: isoDayAt(-1, 23, 59),
        priority: 3,
        status: 'completed',
        isCompleted: true,
        kanbanColumn: 'done',
        progress: 100,
        isPinned: false,
        repeatRule: 'none',
        ebbinghausStage: 0,
        tags: ['praktikum'],
        estimatedPomos: 2,
        completedPomos: 2,
        focusMinutes: 50,
        items: []
      }
    ],
    habits: [
      {
        id: 'h-1',
        name: 'Review Materi Kuliah',
        icon: 'book',
        colorHex: '4772FA',
        section: 'malam',
        type: 'counter',
        goal: 30,
        unit: 'menit',
        encouragement: 'Tiga puluh menit malam ini menghemat tiga jam belajar saat UTS.',
        currentStreak: 4,
        longestStreak: 9,
        logs: {
          [dateKey(-4)]: { status: 'done', value: 30, mood: 'focused', note: 'Review pointer & linked list' },
          [dateKey(-3)]: { status: 'done', value: 30, mood: 'happy', note: 'Latihan query SQL' },
          [dateKey(-2)]: { status: 'skip', value: 0, mood: 'tired', note: 'Izin rapat kepanitiaan' },
          [dateKey(-1)]: { status: 'done', value: 35, mood: 'focused', note: 'Bedah topologi VLSM' }
        }
      },
      {
        id: 'h-2',
        name: 'Minum Air Mineral',
        icon: 'droplet',
        colorHex: '0284C7',
        section: 'siang',
        type: 'counter',
        goal: 8,
        unit: 'gelas',
        encouragement: 'Hidrasi stabil menjaga konsentrasi sepanjang kelas.',
        currentStreak: 6,
        longestStreak: 12,
        logs: {
          [dateKey(-3)]: { status: 'done', value: 8, mood: 'happy', note: '' },
          [dateKey(-2)]: { status: 'done', value: 8, mood: 'happy', note: '' },
          [dateKey(-1)]: { status: 'done', value: 8, mood: 'focused', note: '' },
          [dateKey(0)]: { status: 'partial', value: 5, mood: 'focused', note: '' }
        }
      },
      {
        id: 'h-3',
        name: 'Baca Buku Non-Teknis',
        icon: 'layers',
        colorHex: '247B50',
        section: 'pagi',
        type: 'counter',
        goal: 15,
        unit: 'halaman',
        encouragement: 'Awali pagi sebelum membuka media sosial.',
        currentStreak: 3,
        longestStreak: 7,
        logs: {
          [dateKey(-2)]: { status: 'done', value: 15, mood: 'happy', note: '' },
          [dateKey(-1)]: { status: 'done', value: 20, mood: 'happy', note: '' },
          [dateKey(0)]: { status: 'done', value: 15, mood: 'focused', note: '' }
        }
      }
    ],
    focusSessions: [
      { id: 'fs-1', targetId: 't-1', targetTitle: 'Implementasi Binary Search Tree & AVL Rotation', courseId: 'c-1', mode: 'pomo', durationMinutes: 25, startedAt: isoOffsetH(-28), note: 'Menyelesaikan rotasi AVL' },
      { id: 'fs-2', targetId: 't-3', targetTitle: 'Refactor REST Endpoint & Responsive Grid PWA', courseId: 'c-3', mode: 'pomo', durationMinutes: 25, startedAt: isoOffsetH(-24), note: 'Menyusun Framed Sheet' },
      { id: 'fs-3', targetId: 't-6', targetTitle: 'Laporan Praktikum Subnetting VLSM', courseId: 'c-4', mode: 'pomo', durationMinutes: 50, startedAt: isoOffsetH(-48), note: '2 siklus pomo' },
      { id: 'fs-4', targetId: 'c-2', targetTitle: 'Sistem Basis Data', courseId: 'c-2', mode: 'stopwatch', durationMinutes: 35, startedAt: isoOffsetH(-5), note: 'Membaca slide normalisasi' }
    ],
    countdowns: [
      { id: 'cd-1', title: 'UTS Algoritma & Struktur Data', targetDate: isoDayAt(9, 8, 0), category: 'UTS', colorHex: '4772FA', isPinned: true, courseId: 'c-1' },
      { id: 'cd-2', title: 'Demo Prototype Pemrograman Web', targetDate: isoDayAt(4, 13, 0), category: 'Proyek', colorHex: '247B50', isPinned: true, courseId: 'c-3' },
      { id: 'cd-3', title: 'Workshop UI/UX Himpunan', targetDate: isoDayAt(14, 9, 0), category: 'Event', colorHex: 'D97706', isPinned: false, courseId: null }
    ]
  };
}

function normalizePriority(p) {
  if (typeof p === 'number') return p;
  if (p === 'Tinggi' || p === 'high') return 5;
  if (p === 'Sedang' || p === 'medium') return 3;
  if (p === 'Rendah' || p === 'low') return 1;
  return 0;
}

function normalizeTask(raw) {
  const status = raw.status || (raw.isCompleted ? 'completed' : 'active');
  const isCompleted = status === 'completed';
  return {
    id: raw.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    listId: raw.listId || (raw.courseId ? 'kuliah' : 'inbox'),
    courseId: raw.courseId || null,
    parentId: raw.parentId || null,
    title: raw.title || 'Tanpa judul',
    notes: raw.notes || '',
    startDate: raw.startDate || null,
    dueDate: raw.dueDate || null,
    isAllDay: Boolean(raw.isAllDay),
    priority: normalizePriority(raw.priority),
    status,
    isCompleted,
    kanbanColumn: raw.kanbanColumn || (isCompleted ? 'done' : 'todo'),
    progress: typeof raw.progress === 'number' ? raw.progress : isCompleted ? 100 : 0,
    isPinned: Boolean(raw.isPinned),
    repeatRule: raw.repeatRule || 'none',
    ebbinghausStage: typeof raw.ebbinghausStage === 'number' ? raw.ebbinghausStage : 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    estimatedPomos: typeof raw.estimatedPomos === 'number' ? raw.estimatedPomos : 1,
    completedPomos: typeof raw.completedPomos === 'number' ? raw.completedPomos : 0,
    focusMinutes: typeof raw.focusMinutes === 'number' ? raw.focusMinutes : 0,
    items: Array.isArray(raw.items) ? raw.items : []
  };
}

function normalizeStore(raw) {
  const def = buildDefaultStore();
  if (!raw || typeof raw !== 'object') return def;
  const rawTasks = Array.isArray(raw.tasks)
    ? raw.tasks
    : Array.isArray(raw.assignments)
    ? raw.assignments
    : def.tasks;

  return {
    schemaVersion: 2,
    profile: { ...def.profile, ...(raw.profile || {}) },
    settings: { ...def.settings, ...(raw.settings || {}) },
    lists: Array.isArray(raw.lists) && raw.lists.length ? raw.lists : def.lists,
    courses: Array.isArray(raw.courses) ? raw.courses : def.courses,
    tasks: rawTasks.map(normalizeTask),
    habits: Array.isArray(raw.habits) ? raw.habits : def.habits,
    focusSessions: Array.isArray(raw.focusSessions) ? raw.focusSessions : def.focusSessions,
    countdowns: Array.isArray(raw.countdowns) ? raw.countdowns : def.countdowns
  };
}

// ==========================================
// 3. APPLICATION STATE & POMOFLOW RUNTIME
// ==========================================
const AppState = {
  store: buildDefaultStore(),
  activeModule: 'tasks',        // tasks | calendar | matrix | focus | habits | insights | settings
  smartFilter: 'today',         // today | next7 | all | memory | completed | wont_do
  selectedListId: null,         // null or listId
  selectedCourseId: null,       // null or courseId
  selectedTag: null,            // null or tag string
  taskViewMode: 'list',         // list | kanban | timeline
  selectedTaskId: null,         // task shown in right inspector
  calendarMode: 'daily',        // daily | weekly | month
  selectedDayOfWeek: getDayOfWeek(new Date()),
  monthOffset: 0
};

const PomoRuntime = {
  mode: 'pomo',                 // pomo | stopwatch
  phase: 'work',                // work | break
  isRunning: false,
  secondsLeft: 25 * 60,
  stopwatchSeconds: 0,
  targetType: 'task',           // task | course | habit
  targetId: '',
  cycleCount: 1,
  intervalId: null,
  noiseKind: 'off'              // off | brown | rain | library | tick
};

// ==========================================
// 4. WEB AUDIO WHITE NOISE SYNTHESIZER
// ==========================================
const AmbientAudio = (() => {
  let ctx = null;
  let activeNodes = [];
  let tickTimer = null;

  function stop() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
    activeNodes.forEach((n) => {
      try { if (n.stop) n.stop(); } catch {}
      try { if (n.disconnect) n.disconnect(); } catch {}
    });
    activeNodes = [];
  }

  function ensureContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function createNoiseBuffer(audioCtx, durationSec = 3) {
    const bufferSize = audioCtx.sampleRate * durationSec;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 2.8;
    }
    return buffer;
  }

  function start(kind) {
    stop();
    if (kind === 'off') return;
    const audioCtx = ensureContext();
    if (!audioCtx) return;

    if (kind === 'tick') {
      const playClick = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.045);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      };
      playClick();
      tickTimer = setInterval(playClick, 1000);
      return;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = createNoiseBuffer(audioCtx, 3);
    src.loop = true;

    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    if (kind === 'brown') {
      filter.type = 'lowpass';
      filter.frequency.value = 260;
      gain.gain.value = 0.25;
    } else if (kind === 'rain') {
      filter.type = 'bandpass';
      filter.frequency.value = 950;
      filter.Q.value = 0.6;
      gain.gain.value = 0.16;
    } else if (kind === 'library') {
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      gain.gain.value = 0.14;
    }

    src.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();
    activeNodes.push(src, filter, gain);
  }

  return { start, stop };
})();

// ==========================================
// 5. UTILITY & DOMAIN ENGINES
// ==========================================
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getDayOfWeek(date = new Date()) {
  const d = date.getDay();
  return d === 0 ? 7 : d; // 1 = Senin .. 7 = Minggu
}

function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${twoDigit(date.getMonth() + 1)}-${twoDigit(date.getDate())}`;
}

function timeToMinutes(str) {
  if (!str || !str.includes(':')) return 0;
  const [h, m] = str.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(totalM) {
  const h = Math.floor(totalM / 60);
  const m = totalM % 60;
  return `${twoDigit(h)}:${twoDigit(m)}`;
}

function formatDurationText(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

function formatDueHuman(dueIso) {
  if (!dueIso) return 'Tanpa tanggal';
  const d = new Date(dueIso);
  if (Number.isNaN(d.getTime())) return 'Tanpa tanggal';
  const diffH = (d.getTime() - Date.now()) / 3600000;
  const dayStr = DAY_SHORT[d.getDay()];
  const dateStr = `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
  const timeStr = `${twoDigit(d.getHours())}:${twoDigit(d.getMinutes())}`;

  if (diffH < 0) return `Terlambat • ${dayStr}, ${dateStr} ${timeStr}`;
  if (toDateKey(d) === toDateKey(new Date())) return `Hari ini ${timeStr}`;
  const tomorrow = new Date(Date.now() + 86400000);
  if (toDateKey(d) === toDateKey(tomorrow)) return `Besok ${timeStr}`;
  return `${dayStr}, ${dateStr} • ${timeStr}`;
}

function getCourseById(id) {
  return AppState.store.courses.find((c) => c.id === id) || null;
}

function getListById(id) {
  return AppState.store.lists.find((l) => l.id === id) || AppState.store.lists[0];
}

// --- Smart NLP Parser (Indonesian + English) ---
function parseSmartInput(raw) {
  let working = String(raw || '').trim();
  const result = {
    title: '',
    courseId: AppState.selectedCourseId || null,
    listId: AppState.selectedListId || (AppState.selectedCourseId ? 'kuliah' : 'kuliah'),
    priority: 3,
    tags: [],
    estimatedPomos: 1,
    repeatRule: 'none',
    startDate: null,
    dueDate: null
  };

  if (!working) return result;

  // 1. Memory curve / repeat
  if (/(!memory|!ebbinghaus|!kurva)/i.test(working)) {
    result.repeatRule = 'ebbinghaus';
    working = working.replace(/(!memory|!ebbinghaus|!kurva)/gi, '');
  } else if (/\b(setiap hari|daily)\b/i.test(working)) {
    result.repeatRule = 'daily';
    working = working.replace(/\b(setiap hari|daily)\b/gi, '');
  } else if (/\b(setiap minggu|weekly)\b/i.test(working)) {
    result.repeatRule = 'weekly';
    working = working.replace(/\b(setiap minggu|weekly)\b/gi, '');
  }

  // 2. Priority
  if (/(!tinggi|!high|!p1|!1)\b/i.test(working)) {
    result.priority = 5;
    working = working.replace(/(!tinggi|!high|!p1|!1)\b/gi, '');
  } else if (/(!sedang|!medium|!p2|!2)\b/i.test(working)) {
    result.priority = 3;
    working = working.replace(/(!sedang|!medium|!p2|!2)\b/gi, '');
  } else if (/(!rendah|!low|!p3|!3)\b/i.test(working)) {
    result.priority = 1;
    working = working.replace(/(!rendah|!low|!p3|!3)\b/gi, '');
  }

  // 3. Estimated Pomos (~2p)
  const pomoMatch = working.match(/~(\d+)p\b/i);
  if (pomoMatch) {
    result.estimatedPomos = Math.max(1, Math.min(12, parseInt(pomoMatch[1], 10)));
    working = working.replace(pomoMatch[0], '');
  }

  // 4. Tags (#tag)
  const tagMatches = working.match(/#[a-zA-Z0-9_-]+/g);
  if (tagMatches) {
    result.tags = tagMatches.map((t) => t.slice(1).toLowerCase());
    tagMatches.forEach((t) => { working = working.replace(t, ''); });
  }

  // 5. Course or List (@token)
  const atMatch = working.match(/@([a-zA-Z0-9_-]+)/);
  if (atMatch) {
    const token = atMatch[1].toLowerCase();
    const matchedCourse = AppState.store.courses.find(
      (c) => c.code.toLowerCase() === token || c.name.toLowerCase().includes(token)
    );
    const matchedList = AppState.store.lists.find(
      (l) => l.id.toLowerCase() === token || l.name.toLowerCase() === token
    );
    if (matchedCourse) {
      result.courseId = matchedCourse.id;
      result.listId = 'kuliah';
    } else if (matchedList) {
      result.listId = matchedList.id;
      result.courseId = null;
    }
    working = working.replace(atMatch[0], '');
  }

  // 6. Date & Time Extraction
  const targetDate = new Date();
  let hasExplicitDate = false;
  if (/\b(hari ini|today)\b/i.test(working)) {
    hasExplicitDate = true;
    working = working.replace(/\b(hari ini|today)\b/gi, '');
  } else if (/\b(besok|tomorrow)\b/i.test(working)) {
    targetDate.setDate(targetDate.getDate() + 1);
    hasExplicitDate = true;
    working = working.replace(/\b(besok|tomorrow)\b/gi, '');
  } else if (/\b(lusa)\b/i.test(working)) {
    targetDate.setDate(targetDate.getDate() + 2);
    hasExplicitDate = true;
    working = working.replace(/\b(lusa)\b/gi, '');
  } else {
    const weekdayMap = { senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6, minggu: 7 };
    const wdRegex = /\b(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i;
    const wdMatch = working.match(wdRegex);
    if (wdMatch) {
      const targetWd = weekdayMap[wdMatch[1].toLowerCase()];
      const currentWd = getDayOfWeek(new Date());
      let delta = targetWd - currentWd;
      if (delta <= 0) delta += 7;
      targetDate.setDate(targetDate.getDate() + delta);
      hasExplicitDate = true;
      working = working.replace(wdMatch[0], '');
    }
  }

  // Check ISO date YYYY-MM-DD
  const isoMatch = working.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    const parts = isoMatch[1].split('-').map(Number);
    targetDate.setFullYear(parts[0], parts[1] - 1, parts[2]);
    hasExplicitDate = true;
    working = working.replace(isoMatch[0], '');
  }

  // Time Range HH:mm-HH:mm or HH:mm~HH:mm
  const rangeMatch = working.match(/\b(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})\b/);
  if (rangeMatch) {
    const [sh, sm] = rangeMatch[1].split(':').map(Number);
    const [eh, em] = rangeMatch[2].split(':').map(Number);
    const startDt = new Date(targetDate);
    startDt.setHours(sh, sm, 0, 0);
    const endDt = new Date(targetDate);
    endDt.setHours(eh, em, 0, 0);
    result.startDate = startDt.toISOString();
    result.dueDate = endDt.toISOString();
    hasExplicitDate = true;
    working = working.replace(rangeMatch[0], '');
  } else {
    const timeMatch = working.match(/\b(?:jam\s+|pukul\s+)?(\d{1,2}:\d{2})\b/i);
    if (timeMatch) {
      const [h, m] = timeMatch[1].split(':').map(Number);
      targetDate.setHours(h, m, 0, 0);
      hasExplicitDate = true;
      working = working.replace(timeMatch[0], '');
    } else if (hasExplicitDate) {
      targetDate.setHours(21, 0, 0, 0);
    }
  }

  if (hasExplicitDate && !result.dueDate) {
    result.dueDate = targetDate.toISOString();
  } else if (!result.dueDate && AppState.smartFilter === 'today') {
    const tonight = new Date();
    tonight.setHours(21, 0, 0, 0);
    result.dueDate = tonight.toISOString();
  }

  result.title = working.replace(/\s+/g, ' ').trim();
  return result;
}

// --- Eisenhower Matrix Classifier ---
function classifyQuadrant(task) {
  const isImportant = task.priority >= 3;
  let isUrgent = false;
  if (task.dueDate) {
    const diffH = (new Date(task.dueDate).getTime() - Date.now()) / 3600000;
    isUrgent = diffH <= 48;
  }
  if (isImportant && isUrgent) return 'q1';
  if (isImportant && !isUrgent) return 'q2';
  if (!isImportant && isUrgent) return 'q3';
  return 'q4';
}

// --- Smart Gap™ Recommender ---
function computeSmartGaps(dayOfWeek, refDate = new Date()) {
  const WIN_START = 8 * 60;  // 08:00
  const WIN_END = 21 * 60 + 30; // 21:30
  const dateStr = toDateKey(refDate);

  const dayCourses = AppState.store.courses
    .filter((c) => c.dayOfWeek === dayOfWeek)
    .map((c) => ({
      kind: 'course',
      id: c.id,
      title: c.code ? `${c.code} ${c.name}` : c.name,
      startMin: Math.max(WIN_START, timeToMinutes(c.startTime)),
      endMin: Math.min(WIN_END, timeToMinutes(c.endTime)),
      colorHex: c.colorHex
    }))
    .filter((b) => b.endMin > b.startMin);

  const dayTimeBlocks = AppState.store.tasks
    .filter((t) => t.status === 'active' && t.startDate && t.dueDate && toDateKey(new Date(t.startDate)) === dateStr)
    .map((t) => {
      const s = new Date(t.startDate);
      const e = new Date(t.dueDate);
      return {
        kind: 'task-block',
        id: t.id,
        title: t.title,
        startMin: Math.max(WIN_START, s.getHours() * 60 + s.getMinutes()),
        endMin: Math.min(WIN_END, e.getHours() * 60 + e.getMinutes())
      };
    })
    .filter((b) => b.endMin > b.startMin);

  const occupied = [...dayCourses, ...dayTimeBlocks].sort((a, b) => a.startMin - b.startMin);

  // Merge occupied intervals
  const merged = [];
  for (const seg of occupied) {
    if (!merged.length || seg.startMin > merged[merged.length - 1].endMin) {
      merged.push({ startMin: seg.startMin, endMin: seg.endMin });
    } else {
      merged[merged.length - 1].endMin = Math.max(merged[merged.length - 1].endMin, seg.endMin);
    }
  }

  const gaps = [];
  let cursor = WIN_START;
  for (const occ of merged) {
    if (occ.startMin - cursor >= 25) {
      gaps.push({ startMin: cursor, endMin: occ.startMin, duration: occ.startMin - cursor });
    }
    cursor = Math.max(cursor, occ.endMin);
  }
  if (WIN_END - cursor >= 25) {
    gaps.push({ startMin: cursor, endMin: WIN_END, duration: WIN_END - cursor });
  }

  // If viewing today, prefer gaps that haven't already ended
  const isToday = toDateKey(refDate) === toDateKey(new Date());
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const activeGaps = isToday
    ? gaps.filter((g) => g.endMin - Math.max(g.startMin, nowMin) >= 25).map((g) => ({
        ...g,
        startMin: Math.max(g.startMin, nowMin),
        duration: g.endMin - Math.max(g.startMin, nowMin)
      }))
    : gaps;

  // Candidate unscheduled active tasks
  const candidates = AppState.store.tasks
    .filter((t) => t.status === 'active' && !t.startDate)
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });

  const bestGap = activeGaps[0] || gaps[0] || null;
  let recommendedTask = null;
  if (bestGap && candidates.length) {
    recommendedTask =
      candidates.find((t) => (t.estimatedPomos || 1) * 25 <= bestGap.duration) || candidates[0];
  }

  return {
    occupied: [...dayCourses, ...dayTimeBlocks],
    gaps: activeGaps.length ? activeGaps : gaps,
    bestGap,
    recommendedTask
  };
}

// --- Momentum Score™ Calculator (Deterministic, computed from real data) ---
function computeMomentumScore() {
  const { tasks, habits, focusSessions } = AppState.store;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const overdueCount = tasks.filter(
    (t) => t.status === 'active' && t.dueDate && new Date(t.dueDate).getTime() < Date.now()
  ).length;
  const totalFocusMins = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const streakSum = habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0);

  const raw = completedCount * 40 + Math.round(totalFocusMins * 1.2) + streakSum * 15 - overdueCount * 20;
  const score = Math.max(0, Math.min(1200, raw));
  const level = Math.min(12, Math.max(1, Math.floor(score / 100) + 1));

  return { score, level, completedCount, overdueCount, totalFocusMins, streakSum };
}

// ==========================================
// 6. PERSISTENCE, INDEXEDDB & OFFLINE-FIRST SYNC
// ==========================================
let currentPinInput = '';
let isSyncing = false;
const LUANG_DB_NAME = 'luangin_db';
const LUANG_DB_VERSION = 1;
const LUANG_IDB_STORE = 'kv';
let luangDbPromise = null;

function openLuangDB() {
  if (luangDbPromise) return luangDbPromise;
  luangDbPromise = new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(LUANG_DB_NAME, LUANG_DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LUANG_IDB_STORE)) {
          db.createObjectStore(LUANG_IDB_STORE);
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return luangDbPromise;
}

function idbGet(key) {
  return openLuangDB().then((db) => {
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(LUANG_IDB_STORE, 'readonly');
        const req = tx.objectStore(LUANG_IDB_STORE).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  });
}

function idbSet(key, value) {
  return openLuangDB().then((db) => {
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(LUANG_IDB_STORE, 'readwrite');
        tx.objectStore(LUANG_IDB_STORE).put(value, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  });
}

function readSyncMeta() {
  try {
    const raw = localStorage.getItem('luangin_sync_meta');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { pendingSync: false, lastLocalMutationAt: 0, lastSyncedAt: 0 };
}

function writeSyncMeta(meta) {
  try {
    localStorage.setItem('luangin_sync_meta', JSON.stringify(meta));
  } catch {}
  idbSet('sync_meta', meta);
}

async function hydrateSyncMeta() {
  const localRaw = localStorage.getItem('luangin_sync_meta');
  if (localRaw) {
    try {
      return JSON.parse(localRaw);
    } catch {}
  }
  const fromIdb = await idbGet('sync_meta');
  if (fromIdb && typeof fromIdb === 'object') {
    writeSyncMeta(fromIdb);
    return fromIdb;
  }
  return { pendingSync: false, lastLocalMutationAt: 0, lastSyncedAt: 0 };
}

async function getCachedPin() {
  const fromLs = localStorage.getItem('jadwalin_user_pin');
  if (fromLs) return fromLs;
  const fromIdb = await idbGet('auth_pin');
  if (fromIdb) {
    try {
      localStorage.setItem('jadwalin_user_pin', fromIdb);
    } catch {}
    return fromIdb;
  }
  return null;
}

function setCachedPin(pin) {
  try {
    localStorage.setItem('jadwalin_user_pin', pin);
  } catch {}
  idbSet('auth_pin', pin);
}

function clearCachedPin() {
  try {
    localStorage.removeItem('jadwalin_user_pin');
  } catch {}
  idbSet('auth_pin', null);
}

function updateSyncPill(label, stateClass = '') {
  const el = document.getElementById('cloud-sync-status');
  if (!el) return;
  el.textContent = label;
  el.className = 'sync-pill' + (stateClass ? ' ' + stateClass : '');
}

function applyTheme(themeId) {
  const valid = THEME_ORDER.includes(themeId) ? themeId : 'classic';
  AppState.store.settings.theme = valid;
  document.documentElement.setAttribute('data-theme', valid);
  const meta = THEME_META.find((t) => t.id === valid);
  const themeMetaTag = document.querySelector('meta[name="theme-color"]');
  if (themeMetaTag && meta) themeMetaTag.setAttribute('content', meta.swatch);
}

function saveLocalCache(markDirty = false) {
  try {
    localStorage.setItem('luangin_store_v2', JSON.stringify(AppState.store));
  } catch {}
  idbSet('store_v2', AppState.store);

  if (markDirty) {
    const prev = readSyncMeta();
    writeSyncMeta({
      ...prev,
      pendingSync: true,
      lastLocalMutationAt: Date.now()
    });
  }
}

async function loadBestLocalStore() {
  try {
    const lsRaw = localStorage.getItem('luangin_store_v2');
    if (lsRaw) return normalizeStore(JSON.parse(lsRaw));
  } catch {}

  const idbStore = await idbGet('store_v2');
  if (idbStore && typeof idbStore === 'object') {
    return normalizeStore(idbStore);
  }
  return null;
}

async function pushDataToServer() {
  const pin = await getCachedPin();
  if (!pin) return false;

  if (!navigator.onLine) {
    updateSyncPill('Lokal Offline (Menunggu Sync)', 'offline');
    return false;
  }

  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-jadwalin-pin': pin
      },
      body: JSON.stringify(AppState.store)
    });

    if (res.status === 401) {
      updateSyncPill('Terkunci', 'error');
      lockApp();
      return false;
    }

    if (res.ok) {
      const prev = readSyncMeta();
      writeSyncMeta({
        ...prev,
        pendingSync: false,
        lastSyncedAt: Date.now()
      });
      updateSyncPill('Tersinkron 24/7', '');
      return true;
    }
  } catch {}

  updateSyncPill('Lokal Offline (Menunggu Sync)', 'offline');
  return false;
}

async function saveData() {
  saveLocalCache(true);
  updateSyncPill('Menyinkronkan...', 'offline');
  await pushDataToServer();
}

async function syncWithServer() {
  if (isSyncing) return;
  const overlay = document.getElementById('pin-lock-overlay');
  if (overlay && !overlay.classList.contains('hidden')) return;
  const pin = await getCachedPin();
  if (!pin) return;

  if (!navigator.onLine) {
    const meta = readSyncMeta();
    updateSyncPill(meta.pendingSync ? 'Lokal Offline (Menunggu Sync)' : 'Lokal Offline', 'offline');
    return;
  }

  isSyncing = true;
  try {
    const meta = await hydrateSyncMeta();

    // Anti-timpa: push offline mutations first before pulling remote state
    if (meta.pendingSync) {
      await pushDataToServer();
      return;
    }

    // Brief grace window right after local mutation so stale GET doesn't race POST
    if (Date.now() - (meta.lastLocalMutationAt || 0) < 4000) return;

    const res = await fetch('/api/data', {
      headers: { 'x-jadwalin-pin': pin },
      cache: 'no-store'
    });

    if (res.status === 401) {
      lockApp();
      return;
    }

    if (res.ok) {
      const payload = await res.json();
      const serverNormalized = normalizeStore(payload);
      const localSig = JSON.stringify(AppState.store);
      const serverSig = JSON.stringify(serverNormalized);

      if (serverSig !== localSig && !readSyncMeta().pendingSync) {
        AppState.store = serverNormalized;
        applyTheme(AppState.store.settings.theme);
        saveLocalCache(false);
        renderAll();
      }
      writeSyncMeta({
        ...readSyncMeta(),
        pendingSync: false,
        lastSyncedAt: Date.now()
      });
      updateSyncPill('Tersinkron 24/7', '');
    }
  } catch {
    const meta = readSyncMeta();
    updateSyncPill(meta.pendingSync ? 'Lokal Offline (Menunggu Sync)' : 'Lokal Offline', 'offline');
  } finally {
    isSyncing = false;
  }
}

function updatePinDots() {
  const dots = document.querySelectorAll('#pin-dots-group .pin-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i < currentPinInput.length);
    dot.classList.remove('error');
  });
}

function flashPinError(msg) {
  const errEl = document.getElementById('pin-error-msg');
  if (errEl) errEl.textContent = msg || 'PIN salah. Silakan coba lagi.';
  document.querySelectorAll('#pin-dots-group .pin-dot').forEach((d) => d.classList.add('error'));
  setTimeout(() => {
    currentPinInput = '';
    updatePinDots();
  }, 550);
}

async function verifyAndUnlock(pin) {
  const errEl = document.getElementById('pin-error-msg');
  if (errEl) errEl.textContent = 'Memeriksa PIN...';

  const meta = await hydrateSyncMeta();

  try {
    const res = await fetch('/api/data', {
      headers: { 'x-jadwalin-pin': pin },
      cache: 'no-store'
    });
    if (res.status === 401) {
      flashPinError('PIN akses tidak valid.');
      return false;
    }
    if (res.ok) {
      const payload = await res.json();
      setCachedPin(pin);
      const localStore = await loadBestLocalStore();

      if (meta.pendingSync && localStore) {
        AppState.store = localStore;
        await pushDataToServer();
      } else if (payload && Array.isArray(payload.courses) && payload.courses.length > 0) {
        AppState.store = normalizeStore(payload);
        saveLocalCache(false);
      } else if (localStore) {
        AppState.store = localStore;
        await pushDataToServer();
      } else {
        AppState.store = buildDefaultStore();
        await pushDataToServer();
      }
      unlockSuccess('Tersinkron 24/7', '');
      return true;
    }
  } catch {}

  const cachedPin = (await getCachedPin()) || '1234';
  if (pin === cachedPin) {
    setCachedPin(pin);
    AppState.store = (await loadBestLocalStore()) || buildDefaultStore();
    saveLocalCache(false);
    unlockSuccess(meta.pendingSync ? 'Lokal Offline (Menunggu Sync)' : 'Lokal Offline', 'offline');
    return true;
  }

  flashPinError('PIN salah. Pastikan sesuai konfigurasi server.');
  return false;
}

function unlockSuccess(syncLabel, syncClass) {
  applyTheme(AppState.store.settings.theme);
  updateSyncPill(syncLabel, syncClass);
  document.getElementById('pin-lock-overlay').classList.add('hidden');
  currentPinInput = '';
  updatePinDots();
  const errEl = document.getElementById('pin-error-msg');
  if (errEl) errEl.textContent = '';
  renderAll();
  showToast('Ruang kerja luang.in siap digunakan.');
}

function lockApp() {
  clearCachedPin();
  currentPinInput = '';
  updatePinDots();
  const errEl = document.getElementById('pin-error-msg');
  if (errEl) errEl.textContent = '';
  document.getElementById('pin-lock-overlay').classList.remove('hidden');
  updateSyncPill('Terkunci', 'error');
}

async function loadInitialData() {
  const pin = await getCachedPin();
  const meta = await hydrateSyncMeta();

  if (!pin) {
    document.getElementById('pin-lock-overlay').classList.remove('hidden');
    updateSyncPill('Terkunci', 'error');
    return false;
  }

  // Hydrate offline cache immediately so UI renders zero-latency even on slow/offline networks
  const cachedLocal = await loadBestLocalStore();
  if (cachedLocal) {
    AppState.store = cachedLocal;
    applyTheme(AppState.store.settings.theme);
    document.getElementById('pin-lock-overlay').classList.add('hidden');
  }

  if (navigator.onLine) {
    try {
      if (meta.pendingSync && cachedLocal) {
        const pushed = await pushDataToServer();
        if (pushed) return true;
      }

      const res = await fetch('/api/data', {
        headers: { 'x-jadwalin-pin': pin },
        cache: 'no-store'
      });
      if (res.status === 401) {
        clearCachedPin();
        document.getElementById('pin-lock-overlay').classList.remove('hidden');
        updateSyncPill('Terkunci', 'error');
        return false;
      }
      if (res.ok) {
        const payload = await res.json();
        AppState.store = normalizeStore(payload);
        applyTheme(AppState.store.settings.theme);
        saveLocalCache(false);
        writeSyncMeta({ ...meta, pendingSync: false, lastSyncedAt: Date.now() });
        updateSyncPill('Tersinkron 24/7', '');
        document.getElementById('pin-lock-overlay').classList.add('hidden');
        return true;
      }
    } catch {}
  }

  if (!cachedLocal) {
    AppState.store = buildDefaultStore();
    saveLocalCache(false);
  }
  applyTheme(AppState.store.settings.theme);
  updateSyncPill(meta.pendingSync ? 'Lokal Offline (Menunggu Sync)' : 'Lokal Offline', 'offline');
  document.getElementById('pin-lock-overlay').classList.add('hidden');
  return true;
}

// ==========================================
// 7. TASK & DOMAIN ACTIONS
// ==========================================
function completeOrToggleTask(taskId) {
  const idx = AppState.store.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return;
  const task = AppState.store.tasks[idx];

  if (task.status === 'active') {
    task.status = 'completed';
    task.isCompleted = true;
    task.kanbanColumn = 'done';
    task.progress = 100;

    // Memory Curve™ Ebbinghaus Auto-Scheduler
    if (task.repeatRule === 'ebbinghaus') {
      const stage = Math.min(EBBINGHAUS_DAYS.length - 1, task.ebbinghausStage || 0);
      const nextDays = EBBINGHAUS_DAYS[stage];
      const nextDue = new Date(Date.now() + nextDays * 86400000);
      nextDue.setHours(20, 0, 0, 0);
      const baseTitle = task.title.replace(/\s*\(Review H\+\d+\)$/i, '');
      const nextTask = normalizeTask({
        ...task,
        id: `t-eb-${Date.now()}`,
        title: `${baseTitle} (Review H+${nextDays})`,
        startDate: null,
        dueDate: nextDue.toISOString(),
        status: 'active',
        isCompleted: false,
        kanbanColumn: 'todo',
        progress: 0,
        ebbinghausStage: Math.min(EBBINGHAUS_DAYS.length - 1, stage + 1)
      });
      AppState.store.tasks.unshift(nextTask);
      showToast(`Memory Curve dijadwalkan ulang untuk H+${nextDays} hari.`);
    } else if (task.repeatRule === 'daily' || task.repeatRule === 'weekly' || task.repeatRule === 'monthly') {
      const baseDate = task.dueDate ? new Date(task.dueDate) : new Date();
      if (task.repeatRule === 'daily') baseDate.setDate(baseDate.getDate() + 1);
      if (task.repeatRule === 'weekly') baseDate.setDate(baseDate.getDate() + 7);
      if (task.repeatRule === 'monthly') baseDate.setMonth(baseDate.getMonth() + 1);
      AppState.store.tasks.unshift(normalizeTask({
        ...task,
        id: `t-rep-${Date.now()}`,
        startDate: null,
        dueDate: baseDate.toISOString(),
        status: 'active',
        isCompleted: false,
        kanbanColumn: 'todo',
        progress: 0
      }));
      showToast('Tugas selesai. Jadwal berulang berikutnya telah dibuat.');
    } else {
      showToast('Tugas ditandai selesai.');
    }
  } else {
    task.status = 'active';
    task.isCompleted = false;
    task.kanbanColumn = 'todo';
    if (task.progress === 100) task.progress = 0;
    showToast('Tugas dikembalikan ke daftar aktif.');
  }

  saveData();
  renderAll();
}

function markTaskWontDo(taskId) {
  const task = AppState.store.tasks.find((t) => t.id === taskId);
  if (!task) return;
  task.status = task.status === 'wont_do' ? 'active' : 'wont_do';
  task.isCompleted = false;
  saveData();
  renderAll();
  showToast(task.status === 'wont_do' ? 'Tugas dipindahkan ke Dibatalkan.' : 'Tugas diaktifkan kembali.');
}

function deleteTask(taskId) {
  AppState.store.tasks = AppState.store.tasks.filter((t) => t.id !== taskId);
  if (AppState.selectedTaskId === taskId) AppState.selectedTaskId = null;
  saveData();
  renderAll();
  showToast('Tugas dihapus.');
}

function openTimeBlockModal(startMin, endMin, dateObj = new Date(), preselectedTaskId = null) {
  const startDt = new Date(dateObj);
  startDt.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
  const endDt = new Date(dateObj);
  endDt.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0);

  document.getElementById('tb-start-iso').value = startDt.toISOString();
  document.getElementById('tb-end-iso').value = endDt.toISOString();
  document.getElementById('tb-slot-summary').textContent =
    `Slot waktu: ${minutesToTime(startMin)} - ${minutesToTime(endMin)} (${endMin - startMin} menit)`;

  const activeTasks = AppState.store.tasks.filter((t) => t.status === 'active');
  const select = document.getElementById('tb-task-select');
  if (!activeTasks.length) {
    select.innerHTML = '<option value="">Belum ada tugas aktif</option>';
  } else {
    select.innerHTML = activeTasks
      .map((t) => `<option value="${t.id}" ${t.id === preselectedTaskId ? 'selected' : ''}>${escapeHtml(t.title)}</option>`)
      .join('');
  }
  document.getElementById('modal-timeblock').classList.add('active');
}

function startPomoForTarget(type, id) {
  PomoRuntime.targetType = type;
  PomoRuntime.targetId = id;
  PomoRuntime.mode = 'pomo';
  PomoRuntime.phase = 'work';
  PomoRuntime.secondsLeft = (AppState.store.settings.pomoDuration || 25) * 60;
  if (!PomoRuntime.isRunning) togglePomoTimer();
  switchModule('focus');
}

// ==========================================
// 8. RENDERING: SIDEBAR, TIME-GAP, & TASKS
// ==========================================
function updateLiveClock() {
  const now = new Date();
  const el = document.getElementById('live-clock');
  if (el) el.textContent = `${twoDigit(now.getHours())}:${twoDigit(now.getMinutes())}`;
}

function renderSidebar() {
  const { profile, tasks, courses, lists } = AppState.store;
  const momentum = computeMomentumScore();

  document.getElementById('sidebar-momentum-badge').textContent = `Lv. ${momentum.level}`;
  document.getElementById('sidebar-user-role').textContent = `${profile.name} • ${profile.role}`;

  const todayKey = toDateKey(new Date());
  const next7Limit = Date.now() + 7 * 86400000;

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const todayCount = activeTasks.filter((t) => !t.dueDate || toDateKey(new Date(t.dueDate)) <= todayKey).length;
  const next7Count = activeTasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() <= next7Limit).length;
  const memoryCount = activeTasks.filter((t) => t.repeatRule === 'ebbinghaus').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const wontDoCount = tasks.filter((t) => t.status === 'wont_do').length;

  document.getElementById('count-smart-today').textContent = todayCount;
  document.getElementById('count-smart-next7').textContent = next7Count;
  document.getElementById('count-smart-all').textContent = activeTasks.length;
  document.getElementById('count-smart-memory').textContent = memoryCount;
  document.getElementById('count-smart-completed').textContent = completedCount;
  document.getElementById('count-smart-wontdo').textContent = wontDoCount;

  // Smart List active highlights
  document.querySelectorAll('.sidebar-item[data-smart]').forEach((btn) => {
    const active = !AppState.selectedListId && !AppState.selectedCourseId && !AppState.selectedTag && AppState.smartFilter === btn.dataset.smart;
    btn.classList.toggle('active', active);
  });

  // Lists
  const listsContainer = document.getElementById('sidebar-lists-container');
  listsContainer.innerHTML = lists.map((l) => {
    const cnt = activeTasks.filter((t) => t.listId === l.id).length;
    const isActive = AppState.selectedListId === l.id;
    return `
      <button type="button" class="sidebar-item ${isActive ? 'active' : ''}" data-list-filter="${l.id}">
        <span class="sidebar-item-left">
          <span class="color-dot" style="background-color: #${escapeHtml(l.colorHex)}"></span>
          <span>${escapeHtml(l.name)}</span>
        </span>
        <span class="sidebar-count">${cnt}</span>
      </button>
    `;
  }).join('');

  // Courses
  const coursesContainer = document.getElementById('sidebar-courses-container');
  coursesContainer.innerHTML = courses.map((c) => {
    const cnt = activeTasks.filter((t) => t.courseId === c.id).length;
    const isActive = AppState.selectedCourseId === c.id;
    return `
      <button type="button" class="sidebar-item ${isActive ? 'active' : ''}" data-course-filter="${c.id}">
        <span class="sidebar-item-left">
          <span class="color-dot" style="background-color: #${escapeHtml(c.colorHex)}"></span>
          <span>${escapeHtml(c.code ? `${c.code} ${c.name}` : c.name)}</span>
        </span>
        <span class="sidebar-count">${cnt}</span>
      </button>
    `;
  }).join('');

  // Tags
  const tagCounts = new Map();
  activeTasks.forEach((t) => (t.tags || []).forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
  const tagsContainer = document.getElementById('sidebar-tags-container');
  if (tagCounts.size === 0) {
    tagsContainer.innerHTML = '<span style="font-size:12px;color:var(--faint);">Belum ada tag</span>';
  } else {
    tagsContainer.innerHTML = [...tagCounts.entries()]
      .map(([tag, cnt]) => `
        <button type="button" class="sidebar-tag-chip ${AppState.selectedTag === tag ? 'active' : ''}" data-tag-filter="${escapeHtml(tag)}">
          #${escapeHtml(tag)} (${cnt})
        </button>
      `).join('');
  }
}

function getFilteredTasks() {
  const { tasks } = AppState.store;
  const todayKey = toDateKey(new Date());
  const next7Limit = Date.now() + 7 * 86400000;

  if (AppState.selectedListId) {
    return tasks.filter((t) => t.status === 'active' && t.listId === AppState.selectedListId);
  }
  if (AppState.selectedCourseId) {
    return tasks.filter((t) => t.status === 'active' && t.courseId === AppState.selectedCourseId);
  }
  if (AppState.selectedTag) {
    return tasks.filter((t) => t.status === 'active' && (t.tags || []).includes(AppState.selectedTag));
  }

  switch (AppState.smartFilter) {
    case 'today':
      return tasks.filter((t) => t.status === 'active' && (!t.dueDate || toDateKey(new Date(t.dueDate)) <= todayKey));
    case 'next7':
      return tasks.filter((t) => t.status === 'active' && t.dueDate && new Date(t.dueDate).getTime() <= next7Limit);
    case 'memory':
      return tasks.filter((t) => t.status === 'active' && t.repeatRule === 'ebbinghaus');
    case 'completed':
      return tasks.filter((t) => t.status === 'completed');
    case 'wont_do':
      return tasks.filter((t) => t.status === 'wont_do');
    default:
      return tasks.filter((t) => t.status === 'active');
  }
}

function renderTimeGapRibbon(containerId, dayOfWeek = getDayOfWeek(new Date()), refDate = new Date()) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const WIN_START = 8 * 60;
  const WIN_END = 21 * 60 + 30;
  const SPAN = WIN_END - WIN_START;
  const { occupied, gaps, bestGap, recommendedTask } = computeSmartGaps(dayOfWeek, refDate);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const showNowMarker = toDateKey(refDate) === toDateKey(now) && nowMin >= WIN_START && nowMin <= WIN_END;

  const pct = (m) => (((m - WIN_START) / SPAN) * 100).toFixed(2);
  const wPct = (s, e) => (((e - s) / SPAN) * 100).toFixed(2);

  const blocksHtml = [
    ...occupied.map((b) => {
      const spanPct = ((b.endMin - b.startMin) / SPAN) * 100;
      const shortCode = b.title.split(' ')[0];
      const displayLabel = spanPct < 11 ? shortCode : b.title;
      return `
      <div class="ribbon-block ${b.kind}" style="left:${pct(b.startMin)}%;width:${wPct(b.startMin, b.endMin)}%;" title="${escapeHtml(b.title)} (${minutesToTime(b.startMin)}-${minutesToTime(b.endMin)})">
        ${escapeHtml(displayLabel)}
      </div>
    `;
    }),
    ...gaps.map((g) => {
      const spanPct = ((g.endMin - g.startMin) / SPAN) * 100;
      const gapLabel = spanPct < 8 ? `${g.duration}m` : `Luang ${g.duration}m`;
      return `
      <button type="button" class="ribbon-block free-gap" data-gap-start="${g.startMin}" data-gap-end="${g.endMin}" style="left:${pct(g.startMin)}%;width:${wPct(g.startMin, g.endMin)}%;" title="Sela waktu ${g.duration} menit. Klik untuk menjadwalkan tugas.">
        ${gapLabel}
      </button>
    `;
    })
  ].join('');

  const recHtml = bestGap && recommendedTask
    ? `
      <div class="gap-recommendation-row">
        <div class="gap-rec-text">
          <strong>Smart Gap:</strong> Sela ${minutesToTime(bestGap.startMin)}-${minutesToTime(bestGap.endMin)} (${bestGap.duration} menit) cocok untuk <strong>${escapeHtml(recommendedTask.title)}</strong>
          <span class="gap-rec-meta">~${recommendedTask.estimatedPomos || 1} Pomo</span>
        </div>
        <button type="button" class="btn-accent-sm" id="btn-apply-smart-gap" data-gap-start="${bestGap.startMin}" data-gap-end="${Math.min(bestGap.endMin, bestGap.startMin + Math.max(30, (recommendedTask.estimatedPomos || 1) * 30))}" data-task-id="${recommendedTask.id}">
          Isi sela ini
        </button>
      </div>
    `
    : `<div class="gap-recommendation-row"><span class="gap-panel-sub">Tidak ada sela waktu tersisa pada rentang aktif 08:00-21:30.</span></div>`;

  container.innerHTML = `
    <div class="gap-panel-header">
      <div>
        <div class="gap-panel-title">Pita Waktu &amp; Smart Gap (${DAY_NAMES[dayOfWeek === 7 ? 0 : dayOfWeek]})</div>
        <div class="gap-panel-sub">Klik blok biru untuk menyisipkan tugas ke sela kosong di antara jadwal kuliah.</div>
      </div>
      <div class="gap-panel-sub num">${occupied.filter((o) => o.kind === 'course').length} kelas • ${gaps.length} sela tersedia</div>
    </div>
    <div class="ribbon-track-wrap">
      <div class="ribbon-hours-scale">
        <span>08:00</span><span>11:00</span><span>14:00</span><span>17:00</span><span>21:30</span>
      </div>
      <div class="ribbon-bar">
        ${blocksHtml}
        ${showNowMarker ? `<div class="ribbon-now-marker" style="left:${pct(nowMin)}%;"></div>` : ''}
      </div>
    </div>
    ${recHtml}
  `;
}

function renderTaskRowHtml(t) {
  const course = t.courseId ? getCourseById(t.courseId) : null;
  const list = getListById(t.listId);
  const isSelected = AppState.selectedTaskId === t.id;
  const isDone = t.status === 'completed';
  const isWont = t.status === 'wont_do';
  const overdue = t.status === 'active' && t.dueDate && new Date(t.dueDate).getTime() < Date.now();
  const soon = t.status === 'active' && t.dueDate && !overdue && (new Date(t.dueDate).getTime() - Date.now()) <= 48 * 3600000;
  const items = t.items || [];
  const itemsDone = items.filter((i) => i.isCompleted).length;

  return `
    <div class="task-row ${isDone ? 'completed' : ''} ${isWont ? 'wont-do' : ''} ${isSelected ? 'selected' : ''}" data-select-task="${t.id}">
      <button type="button" class="prio-check-btn ${isDone ? 'checked' : ''} ${isWont ? 'wont-do' : ''}" data-prio="${t.priority || 0}" data-toggle-task="${t.id}" aria-label="Ubah status selesai">
        ${isDone ? SVG_ICONS.check : isWont ? SVG_ICONS.dash : ''}
      </button>
      <div class="task-row-main">
        <div class="task-row-top">
          <span class="task-row-title">${escapeHtml(t.title)}</span>
          <div class="task-row-actions">
            <button type="button" class="icon-ghost-btn" data-pomo-task="${t.id}" title="Mulai PomoFlow">${SVG_ICONS.play}</button>
            <button type="button" class="icon-ghost-btn" data-delete-task="${t.id}" title="Hapus tugas">${SVG_ICONS.trash}</button>
          </div>
        </div>
        <div class="task-row-meta">
          <span class="task-due-label ${overdue ? 'overdue' : soon ? 'soon' : ''}">${formatDueHuman(t.dueDate)}</span>
          ${course
            ? `<span class="course-badge-inline"><span class="color-dot" style="background-color:#${escapeHtml(course.colorHex)}"></span>${escapeHtml(course.code || course.name)}</span>`
            : `<span class="course-badge-inline"><span class="color-dot" style="background-color:#${escapeHtml(list.colorHex)}"></span>${escapeHtml(list.name)}</span>`
          }
          ${items.length ? `<span>Subtugas ${itemsDone}/${items.length}</span>` : ''}
          ${t.progress > 0 && t.progress < 100 ? `<span class="task-mini-progress"><span class="task-mini-progress-fill" style="width:${t.progress}%"></span></span><span class="num">${t.progress}%</span>` : ''}
          ${t.repeatRule === 'ebbinghaus' ? `<span class="tag-pill-inline">Memory Curve</span>` : ''}
          ${(t.tags || []).map((tag) => `<span class="tag-pill-inline">#${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderTasksView() {
  const titleEl = document.getElementById('tasks-view-title');
  const findingEl = document.getElementById('tasks-view-finding');
  const container = document.getElementById('tasks-content-container');

  // Resolve title
  let viewTitle = 'Hari ini';
  if (AppState.selectedListId) viewTitle = getListById(AppState.selectedListId).name;
  else if (AppState.selectedCourseId) {
    const c = getCourseById(AppState.selectedCourseId);
    viewTitle = c ? `${c.code ? c.code + ' ' : ''}${c.name}` : 'Mata kuliah';
  } else if (AppState.selectedTag) viewTitle = `Tag #${AppState.selectedTag}`;
  else {
    const map = { today: 'Hari ini', next7: '7 hari ke depan', all: 'Semua tugas', memory: 'Memory Curve', completed: 'Tugas selesai', wont_do: 'Dibatalkan' };
    viewTitle = map[AppState.smartFilter] || 'Tugas';
  }

  titleEl.textContent = viewTitle;
  document.getElementById('topbar-context-label').textContent = viewTitle;

  const list = getFilteredTasks().sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });

  const overdueCount = list.filter((t) => t.status === 'active' && t.dueDate && new Date(t.dueDate).getTime() < Date.now()).length;
  const now = new Date();
  findingEl.textContent = `${DAY_NAMES[now.getDay()]}, ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()} • ${list.length} entri ditampilkan${overdueCount ? ` (${overdueCount} terlambat)` : ''}.`;

  // Time-Gap Ribbon visibility (shown in today / all / schedule context)
  const gapPanel = document.getElementById('today-time-gap-panel');
  if (!AppState.selectedListId && !AppState.selectedCourseId && !AppState.selectedTag && (AppState.smartFilter === 'today' || AppState.smartFilter === 'all')) {
    gapPanel.style.display = 'block';
    renderTimeGapRibbon('today-time-gap-panel');
  } else {
    gapPanel.style.display = 'none';
  }

  // Pinned countdowns
  const cdStrip = document.getElementById('pinned-countdowns-strip');
  const pinnedCds = AppState.store.countdowns.filter((cd) => cd.isPinned);
  cdStrip.innerHTML = pinnedCds.map((cd) => {
    const days = Math.ceil((new Date(cd.targetDate).getTime() - Date.now()) / 86400000);
    const label = days >= 0 ? `H-${days}` : `H+${Math.abs(days)}`;
    return `
      <div class="pinned-cd-pill">
        <span class="color-dot" style="background-color:#${escapeHtml(cd.colorHex)}"></span>
        <span class="pinned-cd-days">${label}</span>
        <span>${escapeHtml(cd.title)}</span>
      </div>
    `;
  }).join('');

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-dashed-box">Belum ada tugas pada tampilan ini. Gunakan baris tambah cepat di atas untuk mencatat tugas baru.</div>';
    renderDetailInspector();
    return;
  }

  if (AppState.taskViewMode === 'kanban') {
    const cols = [
      { id: 'todo', label: 'Rencana' },
      { id: 'in_progress', label: 'Dikerjakan' },
      { id: 'review', label: 'Review' },
      { id: 'done', label: 'Selesai' }
    ];
    const allScope = AppState.store.tasks.filter((t) => {
      if (AppState.selectedListId) return t.listId === AppState.selectedListId;
      if (AppState.selectedCourseId) return t.courseId === AppState.selectedCourseId;
      return t.status !== 'wont_do';
    });
    container.innerHTML = `
      <div class="kanban-board">
        ${cols.map((col) => {
          const cards = allScope.filter((t) => (t.status === 'completed' ? 'done' : t.kanbanColumn || 'todo') === col.id);
          return `
            <div class="kanban-col" data-kanban-drop="${col.id}">
              <div class="kanban-col-head">
                <span class="kanban-col-title">${col.label}</span>
                <span class="task-group-count">${cards.length}</span>
              </div>
              ${cards.length === 0 ? '<div class="empty-dashed-box">Kosong</div>' : cards.map((c) => {
                const course = c.courseId ? getCourseById(c.courseId) : null;
                return `
                  <div class="kanban-card" draggable="true" data-kanban-card="${c.id}" data-select-task="${c.id}">
                    <div style="font-weight:500;font-size:13.5px;margin-bottom:4px;">${escapeHtml(c.title)}</div>
                    <div style="font-size:12px;color:var(--muted);">${formatDueHuman(c.dueDate)}</div>
                    <div class="kanban-card-actions">
                      <span>${course ? escapeHtml(course.code || course.name) : escapeHtml(getListById(c.listId).name)}</span>
                      <select class="kanban-move-select" data-move-kanban="${c.id}" style="font-size:11px;border:1px solid var(--border);border-radius:4px;background:var(--surface);padding:1px 4px;">
                        ${cols.map((opt) => `<option value="${opt.id}" ${opt.id === col.id ? 'selected' : ''}>${opt.label}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;
    renderDetailInspector();
    return;
  }

  if (AppState.taskViewMode === 'timeline') {
    container.innerHTML = `
      <div class="timeline-view-table">
        ${list.map((t) => {
          const pct = Math.max(8, t.progress || (t.status === 'completed' ? 100 : 18));
          return `
            <div class="timeline-view-row" data-select-task="${t.id}" style="cursor:pointer;">
              <div>
                <div style="font-weight:500;font-size:13.5px;">${escapeHtml(t.title)}</div>
                <div style="font-size:12px;color:var(--muted);">${formatDueHuman(t.dueDate)}</div>
              </div>
              <div>
                <div style="height:22px;background:var(--raised);border-radius:6px;overflow:hidden;border:1px solid var(--border);">
                  <div style="height:100%;width:${pct}%;background:var(--accent-tint);color:var(--accent-ink);font-size:11px;font-weight:500;display:flex;align-items:center;padding:0 8px;">
                    ${t.startDate ? `${twoDigit(new Date(t.startDate).getHours())}:${twoDigit(new Date(t.startDate).getMinutes())} ` : ''}Progres ${t.progress || 0}%
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    renderDetailInspector();
    return;
  }

  // Default: List View with clear groups
  if (AppState.smartFilter === 'completed' || AppState.smartFilter === 'wont_do') {
    container.innerHTML = `<div class="task-list-rows">${list.map(renderTaskRowHtml).join('')}</div>`;
    renderDetailInspector();
    return;
  }

  const pinned = list.filter((t) => t.isPinned);
  const unpinned = list.filter((t) => !t.isPinned);
  const nowMs = Date.now();
  const overdue = unpinned.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < nowMs);
  const soon = unpinned.filter((t) => t.dueDate && new Date(t.dueDate).getTime() >= nowMs && (new Date(t.dueDate).getTime() - nowMs) <= 48 * 3600000);
  const later = unpinned.filter((t) => !t.dueDate || (new Date(t.dueDate).getTime() - nowMs) > 48 * 3600000);

  const renderGroup = (title, items, isOverdue = false) => {
    if (!items.length) return '';
    return `
      <div class="task-group-block">
        <div class="task-group-header">
          <span class="task-group-title ${isOverdue ? 'is-overdue' : ''}">${title}</span>
          <span class="task-group-count">${items.length}</span>
        </div>
        <div class="task-list-rows">${items.map(renderTaskRowHtml).join('')}</div>
      </div>
    `;
  };

  container.innerHTML =
    renderGroup('Disematkan', pinned) +
    renderGroup('Terlambat', overdue, true) +
    renderGroup('Hari ini & Besok', soon) +
    renderGroup('Mendatang & Lainnya', later);

  renderDetailInspector();
}

function renderDetailInspector() {
  const panel = document.getElementById('detail-inspector');
  const body = document.getElementById('detail-inspector-body');
  const task = AppState.store.tasks.find((t) => t.id === AppState.selectedTaskId);

  if (!task || AppState.activeModule !== 'tasks') {
    panel.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden');
  const dueLocal = task.dueDate ? new Date(task.dueDate) : new Date();
  const dueDateVal = `${dueLocal.getFullYear()}-${twoDigit(dueLocal.getMonth() + 1)}-${twoDigit(dueLocal.getDate())}`;
  const dueTimeVal = `${twoDigit(dueLocal.getHours())}:${twoDigit(dueLocal.getMinutes())}`;

  const startLocal = task.startDate ? new Date(task.startDate) : null;
  const startTimeVal = startLocal ? `${twoDigit(startLocal.getHours())}:${twoDigit(startLocal.getMinutes())}` : '';

  body.innerHTML = `
    <div class="inspector-top-bar">
      <div style="display:flex;align-items:center;gap:8px;">
        <button type="button" class="btn-ghost-sm" id="insp-toggle-pin">${task.isPinned ? 'Lepas sematan' : 'Sematkan'}</button>
        <button type="button" class="btn-ghost-sm" id="insp-wont-do">${task.status === 'wont_do' ? 'Aktifkan lagi' : 'Batalkan tugas'}</button>
      </div>
      <button type="button" class="modal-close-btn" id="insp-close-btn" aria-label="Tutup panel detail">${SVG_ICONS.close}</button>
    </div>

    <input type="text" id="insp-title-input" class="inspector-title-input" value="${escapeHtml(task.title)}">

    <div class="inspector-field-grid">
      <div>
        <label class="form-label" for="insp-priority">Prioritas</label>
        <select id="insp-priority" class="form-input">
          <option value="5" ${task.priority === 5 ? 'selected' : ''}>Tinggi (P1)</option>
          <option value="3" ${task.priority === 3 ? 'selected' : ''}>Sedang (P2)</option>
          <option value="1" ${task.priority === 1 ? 'selected' : ''}>Rendah (P3)</option>
          <option value="0" ${task.priority === 0 ? 'selected' : ''}>Tanpa</option>
        </select>
      </div>
      <div>
        <label class="form-label" for="insp-list">Kategori list</label>
        <select id="insp-list" class="form-input">
          ${AppState.store.lists.map((l) => `<option value="${l.id}" ${task.listId === l.id ? 'selected' : ''}>${escapeHtml(l.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="form-label" for="insp-course">Mata kuliah</label>
        <select id="insp-course" class="form-input">
          <option value="">Tidak terikat matkul</option>
          ${AppState.store.courses.map((c) => `<option value="${c.id}" ${task.courseId === c.id ? 'selected' : ''}>${escapeHtml(c.code ? c.code + ' - ' + c.name : c.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="form-label" for="insp-repeat">Pengulangan</label>
        <select id="insp-repeat" class="form-input">
          <option value="none" ${task.repeatRule === 'none' ? 'selected' : ''}>Sekali saja</option>
          <option value="daily" ${task.repeatRule === 'daily' ? 'selected' : ''}>Harian</option>
          <option value="weekly" ${task.repeatRule === 'weekly' ? 'selected' : ''}>Mingguan</option>
          <option value="monthly" ${task.repeatRule === 'monthly' ? 'selected' : ''}>Bulanan</option>
          <option value="ebbinghaus" ${task.repeatRule === 'ebbinghaus' ? 'selected' : ''}>Memory Curve</option>
        </select>
      </div>
      <div>
        <label class="form-label" for="insp-due-date">Tanggal tenggat</label>
        <input type="date" id="insp-due-date" class="form-input" value="${dueDateVal}">
      </div>
      <div>
        <label class="form-label" for="insp-due-time">Jam tenggat</label>
        <input type="time" id="insp-due-time" class="form-input" value="${dueTimeVal}">
      </div>
      <div>
        <label class="form-label" for="insp-start-time">Mulai Time-Block</label>
        <input type="time" id="insp-start-time" class="form-input" value="${startTimeVal}">
      </div>
      <div>
        <label class="form-label" for="insp-est-pomo">Target Pomo</label>
        <input type="number" id="insp-est-pomo" class="form-input" min="1" max="12" value="${task.estimatedPomos || 1}">
      </div>
    </div>

    <div class="inspector-section">
      <div class="inspector-section-title">
        <span>Progres pengerjaan</span>
        <span class="num" id="insp-progress-val">${task.progress || 0}%</span>
      </div>
      <input type="range" id="insp-progress-range" min="0" max="100" step="5" value="${task.progress || 0}" style="width:100%;">
    </div>

    <div class="inspector-section">
      <div class="inspector-section-title">
        <span>Subtugas &amp; Checklist</span>
        <span class="num">${(task.items || []).filter((i) => i.isCompleted).length}/${(task.items || []).length}</span>
      </div>
      <div id="insp-checklist-items">
        ${(task.items || []).map((item) => `
          <div class="checklist-item-row ${item.isCompleted ? 'done' : ''}">
            <input type="checkbox" data-toggle-chk="${item.id}" ${item.isCompleted ? 'checked' : ''}>
            <span style="flex:1;">${escapeHtml(item.title)}</span>
            <button type="button" class="icon-ghost-btn" data-delete-chk="${item.id}" aria-label="Hapus subtugas">${SVG_ICONS.close}</button>
          </div>
        `).join('')}
      </div>
      <form id="form-add-subtask" style="display:flex;gap:6px;margin-top:8px;">
        <input type="text" id="insp-new-subtask" class="form-input" style="height:32px;font-size:13px;" placeholder="Tambah langkah subtugas...">
        <button type="submit" class="btn-secondary" style="height:32px;">+</button>
      </form>
    </div>

    <div class="inspector-section">
      <div class="inspector-section-title"><span>Catatan</span></div>
      <textarea id="insp-notes" class="form-input form-textarea" rows="3" placeholder="Tulis catatan atau tautan materi...">${escapeHtml(task.notes || '')}</textarea>
    </div>

    <div class="inspector-section">
      <div class="inspector-section-title">
        <span>Fokus tercatat</span>
        <span class="num">${task.completedPomos || 0}/${task.estimatedPomos || 1} Pomo (${task.focusMinutes || 0} menit)</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button type="button" class="btn-primary" style="flex:1;" id="insp-start-pomo">Mulai PomoFlow</button>
        <button type="button" class="btn-danger-outline" id="insp-delete-task">Hapus</button>
      </div>
    </div>
  `;

  // Bind inspector events
  document.getElementById('insp-close-btn').onclick = () => {
    AppState.selectedTaskId = null;
    renderTasksView();
  };
  document.getElementById('insp-toggle-pin').onclick = () => {
    task.isPinned = !task.isPinned;
    saveData();
    renderTasksView();
  };
  document.getElementById('insp-wont-do').onclick = () => markTaskWontDo(task.id);
  document.getElementById('insp-start-pomo').onclick = () => startPomoForTarget('task', task.id);
  document.getElementById('insp-delete-task').onclick = () => {
    if (confirm(`Hapus tugas "${task.title}"?`)) deleteTask(task.id);
  };

  document.getElementById('insp-title-input').onchange = (e) => {
    const val = e.target.value.trim();
    if (val) { task.title = val; saveData(); renderTasksView(); }
  };
  document.getElementById('insp-priority').onchange = (e) => {
    task.priority = parseInt(e.target.value, 10);
    saveData();
    renderAll();
  };
  document.getElementById('insp-list').onchange = (e) => {
    task.listId = e.target.value;
    saveData();
    renderAll();
  };
  document.getElementById('insp-course').onchange = (e) => {
    task.courseId = e.target.value || null;
    saveData();
    renderAll();
  };
  document.getElementById('insp-repeat').onchange = (e) => {
    task.repeatRule = e.target.value;
    saveData();
    renderAll();
  };
  document.getElementById('insp-est-pomo').onchange = (e) => {
    task.estimatedPomos = Math.max(1, parseInt(e.target.value, 10) || 1);
    saveData();
    renderDetailInspector();
  };

  const updateTimes = () => {
    const dStr = document.getElementById('insp-due-date').value;
    const tStr = document.getElementById('insp-due-time').value || '21:00';
    const sStr = document.getElementById('insp-start-time').value;
    if (dStr) {
      task.dueDate = new Date(`${dStr}T${tStr}:00`).toISOString();
      task.startDate = sStr ? new Date(`${dStr}T${sStr}:00`).toISOString() : null;
      saveData();
      renderTasksView();
    }
  };
  document.getElementById('insp-due-date').onchange = updateTimes;
  document.getElementById('insp-due-time').onchange = updateTimes;
  document.getElementById('insp-start-time').onchange = updateTimes;

  document.getElementById('insp-progress-range').oninput = (e) => {
    task.progress = parseInt(e.target.value, 10);
    document.getElementById('insp-progress-val').textContent = `${task.progress}%`;
  };
  document.getElementById('insp-progress-range').onchange = () => {
    saveData();
    renderTasksView();
  };
  document.getElementById('insp-notes').onchange = (e) => {
    task.notes = e.target.value;
    saveData();
  };

  document.getElementById('form-add-subtask').onsubmit = (e) => {
    e.preventDefault();
    const inp = document.getElementById('insp-new-subtask');
    const txt = inp.value.trim();
    if (!txt) return;
    task.items = task.items || [];
    task.items.push({ id: `chk-${Date.now()}`, title: txt, isCompleted: false });
    saveData();
    renderTasksView();
  };

  document.querySelectorAll('[data-toggle-chk]').forEach((cb) => {
    cb.onchange = () => {
      const item = (task.items || []).find((i) => i.id === cb.dataset.toggleChk);
      if (item) {
        item.isCompleted = cb.checked;
        if (task.items.length) {
          task.progress = Math.round((task.items.filter((i) => i.isCompleted).length / task.items.length) * 100);
        }
        saveData();
        renderTasksView();
      }
    };
  });

  document.querySelectorAll('[data-delete-chk]').forEach((btn) => {
    btn.onclick = () => {
      task.items = (task.items || []).filter((i) => i.id !== btn.dataset.deleteChk);
      saveData();
      renderTasksView();
    };
  });
}

// ==========================================
// 9. RENDERING: CALENDAR, MATRIX, FOCUS, HABITS, INSIGHTS, SETTINGS
// ==========================================
function renderCalendarView() {
  const container = document.getElementById('calendar-content-container');
  const { courses, tasks } = AppState.store;

  if (AppState.calendarMode === 'weekly') {
    const days = [1, 2, 3, 4, 5, 6];
    container.innerHTML = `
      <div class="weekly-courses-grid">
        ${days.map((d) => {
          const list = courses.filter((c) => c.dayOfWeek === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return `
            <div class="day-column-card">
              <div class="day-column-head">
                <span>${DAY_NAMES[d]}</span>
                <span class="task-group-count">${list.length} kelas</span>
              </div>
              ${list.length === 0 ? '<div class="empty-dashed-box">Tidak ada kuliah</div>' : list.map((c) => `
                <div class="course-item-box">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
                    <div style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:13.5px;">
                      <span class="color-dot" style="background-color:#${escapeHtml(c.colorHex)}"></span>
                      <span>${escapeHtml(c.name)}</span>
                    </div>
                    <div style="display:flex;gap:2px;">
                      <button type="button" class="icon-ghost-btn" data-edit-course="${c.id}" title="Edit mata kuliah">${SVG_ICONS.edit}</button>
                      <button type="button" class="icon-ghost-btn" data-delete-course="${c.id}" title="Hapus mata kuliah">${SVG_ICONS.trash}</button>
                    </div>
                  </div>
                  <div style="font-size:12px;color:var(--muted);margin-top:4px;" class="num">
                    ${c.startTime} - ${c.endTime} • ${escapeHtml(c.room || 'TBA')}
                  </div>
                  <div style="font-size:12px;color:var(--muted);margin-top:2px;">
                    ${c.code ? `<code class="code-id">${escapeHtml(c.code)}</code> • ` : ''}${c.credits || 3} SKS • ${escapeHtml(c.lecturer || '-')}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  if (AppState.calendarMode === 'month') {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + AppState.monthOffset);
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstWeekday = (base.getDay() + 6) % 7; // 0 = Senin
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = toDateKey(new Date());

    let cellsHtml = '';
    for (let i = 0; i < firstWeekday; i++) {
      cellsHtml += '<div class="month-day-cell" style="background:var(--raised);"></div>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(year, month, day);
      const dk = toDateKey(dt);
      const wd = getDayOfWeek(dt);
      const dayCourses = courses.filter((c) => c.dayOfWeek === wd);
      const dayTasks = tasks.filter((t) => t.dueDate && toDateKey(new Date(t.dueDate)) === dk);
      cellsHtml += `
        <div class="month-day-cell ${dk === todayKey ? 'today' : ''}">
          <div class="month-day-num">${day}</div>
          ${dayCourses.slice(0, 2).map((c) => `<div class="month-event-dot-row">${escapeHtml(c.code || c.name)} ${c.startTime}</div>`).join('')}
          ${dayTasks.slice(0, 2).map((t) => `<div class="month-event-dot-row" style="background:var(--accent-tint);color:var(--accent-ink);">${escapeHtml(t.title)}</div>`).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:600;">${MONTH_NAMES[month]} ${year}</h2>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn-secondary" id="btn-cal-prev">Sebelumnya</button>
          <button type="button" class="btn-secondary" id="btn-cal-today">Bulan ini</button>
          <button type="button" class="btn-secondary" id="btn-cal-next">Berikutnya</button>
        </div>
      </div>
      <div class="month-grid-wrap">
        <div class="month-weekdays">
          ${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => `<div class="month-weekday-cell">${d}</div>`).join('')}
        </div>
        <div class="month-cells">${cellsHtml}</div>
      </div>
    `;
    return;
  }

  // Daily Time-Block Grid + Arrange Unscheduled Tasks Drawer
  const wd = AppState.selectedDayOfWeek;
  const now = new Date();
  const offsetDays = wd - getDayOfWeek(now);
  const targetDate = new Date(now.getTime() + offsetDays * 86400000);
  const targetKey = toDateKey(targetDate);

  const dayCourses = courses.filter((c) => c.dayOfWeek === wd);
  const dayTasks = tasks.filter((t) => t.status === 'active' && t.startDate && toDateKey(new Date(t.startDate)) === targetKey);
  const unscheduled = tasks.filter((t) => t.status === 'active' && !t.startDate);

  const hours = [];
  for (let h = 7; h <= 21; h++) hours.push(h);

  container.innerHTML = `
    <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
      ${[1, 2, 3, 4, 5, 6].map((d) => `
        <button type="button" class="seg-tab ${wd === d ? 'active' : ''}" data-cal-day="${d}" style="border:1px solid var(--border);">${DAY_NAMES[d]}</button>
      `).join('')}
    </div>
    <div id="cal-ribbon-host" class="time-gap-panel"></div>
    <div class="calendar-split-grid">
      <div class="day-schedule-grid">
        ${hours.map((h) => {
          const hourStart = h * 60;
          const hourEnd = (h + 1) * 60;
          const cMatches = dayCourses.filter((c) => {
            const s = timeToMinutes(c.startTime);
            return s >= hourStart && s < hourEnd;
          });
          const tMatches = dayTasks.filter((t) => new Date(t.startDate).getHours() === h);

          return `
            <div class="hour-slot-row">
              <div class="hour-label">${twoDigit(h)}:00</div>
              <div class="hour-content">
                ${cMatches.map((c) => `
                  <div class="slot-event-pill is-course">
                    <span><strong>${escapeHtml(c.name)}</strong> (${c.startTime}-${c.endTime})</span>
                    <span style="font-size:12px;color:var(--muted);">${escapeHtml(c.room || '')}</span>
                  </div>
                `).join('')}
                ${tMatches.map((t) => `
                  <div class="slot-event-pill is-task">
                    <span>${escapeHtml(t.title)}</span>
                    <button type="button" class="btn-ghost-sm" data-pomo-task="${t.id}">Pomo</button>
                  </div>
                `).join('')}
                ${!cMatches.length && !tMatches.length ? `
                  <button type="button" class="btn-ghost-sm" style="align-self:flex-start;font-size:12px;" data-slot-hour="${h}">+ Isi slot ${twoDigit(h)}:00</button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="arrange-drawer-panel">
        <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Arrange Tugas (${unscheduled.length})</div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:12px;">Tugas yang belum memiliki blok waktu. Pilih salah satu untuk dijadwalkan ke jam kosong hari ini.</p>
        ${unscheduled.length === 0
          ? '<div class="empty-dashed-box">Semua tugas aktif sudah terjadwal.</div>'
          : unscheduled.slice(0, 8).map((t) => `
            <div style="padding:9px 10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;">
              <div style="font-size:13px;font-weight:500;">${escapeHtml(t.title)}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                <span style="font-size:11.5px;color:var(--muted);">~${t.estimatedPomos || 1} Pomo</span>
                <button type="button" class="btn-ghost-sm" data-arrange-task="${t.id}">Jadwalkan</button>
              </div>
            </div>
          `).join('')}
      </div>
    </div>
  `;

  renderTimeGapRibbon('cal-ribbon-host', wd, targetDate);
}

function renderMatrixView() {
  const container = document.getElementById('matrix-content-container');
  const active = AppState.store.tasks.filter((t) => t.status === 'active');

  const quads = [
    { key: 'q1', title: 'Kuadran I • Penting & Mendesak', sub: 'Kerjakan terlebih dahulu (<= 48 jam)', cls: 'q1' },
    { key: 'q2', title: 'Kuadran II • Penting & Terjadwal', sub: 'Jadwalkan di sela waktu luang', cls: 'q2' },
    { key: 'q3', title: 'Kuadran III • Cepat & Mendesak', sub: 'Selesaikan ringkas atau delegasikan', cls: 'q3' },
    { key: 'q4', title: 'Kuadran IV • Backlog & Santai', sub: 'Evaluasi ulang jika jadwal penuh', cls: 'q4' }
  ];

  container.innerHTML = quads.map((q) => {
    const items = active.filter((t) => classifyQuadrant(t) === q.key);
    return `
      <div class="quadrant-card">
        <div class="quadrant-head">
          <div>
            <div class="quadrant-title ${q.cls}">${q.title}</div>
            <div style="font-size:12px;color:var(--muted);">${q.sub}</div>
          </div>
          <span class="task-group-count">${items.length}</span>
        </div>
        ${items.length === 0
          ? '<div class="empty-dashed-box">Tidak ada tugas pada kuadran ini.</div>'
          : `<div class="task-list-rows">${items.map(renderTaskRowHtml).join('')}</div>`}
      </div>
    `;
  }).join('');
}

function renderFocusView() {
  const container = document.getElementById('focus-content-container');
  const { tasks, courses, habits, focusSessions, settings } = AppState.store;

  const secs = PomoRuntime.mode === 'pomo' ? PomoRuntime.secondsLeft : PomoRuntime.stopwatchSeconds;
  const mins = Math.floor(secs / 60);
  const remS = secs % 60;
  const timeText = PomoRuntime.mode === 'pomo'
    ? `${twoDigit(mins)}:${twoDigit(remS)}`
    : `${twoDigit(Math.floor(mins / 60))}:${twoDigit(mins % 60)}:${twoDigit(remS)}`;

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const options = [
    ...activeTasks.map((t) => `<option value="task:${t.id}" ${PomoRuntime.targetType === 'task' && PomoRuntime.targetId === t.id ? 'selected' : ''}>Tugas: ${escapeHtml(t.title)}</option>`),
    ...courses.map((c) => `<option value="course:${c.id}" ${PomoRuntime.targetType === 'course' && PomoRuntime.targetId === c.id ? 'selected' : ''}>Matkul: ${escapeHtml(c.code ? c.code + ' ' + c.name : c.name)}</option>`),
    ...habits.map((h) => `<option value="habit:${h.id}" ${PomoRuntime.targetType === 'habit' && PomoRuntime.targetId === h.id ? 'selected' : ''}>Habit: ${escapeHtml(h.name)}</option>`)
  ];

  const todayMins = focusSessions
    .filter((s) => toDateKey(new Date(s.startedAt)) === toDateKey(new Date()))
    .reduce((a, b) => a + (b.durationMinutes || 0), 0);

  container.innerHTML = `
    <div class="focus-studio-grid">
      <div class="pomo-stage-card">
        <div class="segmented-tabs" style="margin-bottom:12px;">
          <button type="button" class="seg-tab ${PomoRuntime.mode === 'pomo' ? 'active' : ''}" data-pomomode="pomo">Pomodoro (${settings.pomoDuration}m)</button>
          <button type="button" class="seg-tab ${PomoRuntime.mode === 'stopwatch' ? 'active' : ''}" data-pomomode="stopwatch">Stopwatch</button>
        </div>

        <div style="font-size:13px;color:var(--muted);">
          ${PomoRuntime.mode === 'pomo' ? (PomoRuntime.phase === 'work' ? `Sesi Fokus #${PomoRuntime.cycleCount}` : 'Waktu Istirahat') : 'Mode Stopwatch Terbuka'}
        </div>
        <code class="pomo-timer-code">${timeText}</code>
        <div style="font-size:12px;color:var(--muted);">Total fokus hari ini: <strong class="num">${todayMins} menit</strong></div>

        <div class="form-group" style="margin-top:18px;text-align:left;">
          <label class="form-label" for="pomo-target-select">Target sesi fokus</label>
          <select id="pomo-target-select" class="form-input">
            <option value="">Fokus bebas (tanpa target spesifik)</option>
            ${options.join('')}
          </select>
        </div>

        <div class="pomo-controls-row">
          <button type="button" class="btn-primary" id="btn-pomo-start-pause">${PomoRuntime.isRunning ? 'Jeda' : 'Mulai fokus'}</button>
          ${PomoRuntime.mode === 'stopwatch' && PomoRuntime.stopwatchSeconds >= 60
            ? '<button type="button" class="btn-secondary" id="btn-pomo-save-sw">Simpan sesi</button>'
            : ''}
          <button type="button" class="btn-secondary" id="btn-pomo-reset">Reset</button>
        </div>
      </div>

      <div>
        <div style="border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:4px;">Suara latar fokus (Web Audio)</div>
          <p style="font-size:12px;color:var(--muted);">Pembangkit suara sintetis lokal tanpa mengunduh audio eksternal.</p>
          <div class="noise-selector-grid">
            ${[
              { id: 'off', label: 'Hening' },
              { id: 'brown', label: 'Brown Noise' },
              { id: 'rain', label: 'Hujan Lembut' },
              { id: 'library', label: 'Perpustakaan' },
              { id: 'tick', label: 'Detak Jam' }
            ].map((n) => `
              <button type="button" class="noise-btn ${PomoRuntime.noiseKind === n.id ? 'active' : ''}" data-noise="${n.id}">${n.label}</button>
            `).join('')}
          </div>
        </div>

        <div style="border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:15px;font-weight:600;">Riwayat sesi fokus</span>
            <span class="task-group-count">${focusSessions.length} sesi</span>
          </div>
          ${focusSessions.length === 0
            ? '<div class="empty-dashed-box">Belum ada sesi fokus tercatat.</div>'
            : focusSessions.slice(0, 6).map((s) => `
              <div style="padding:8px 0;border-bottom:1px solid var(--rule);display:flex;justify-content:space-between;gap:10px;font-size:13px;">
                <div>
                  <div style="font-weight:500;">${escapeHtml(s.targetTitle)}</div>
                  <div style="font-size:12px;color:var(--muted);">${s.mode === 'pomo' ? 'Pomodoro' : 'Stopwatch'} • ${formatDueHuman(s.startedAt)}</div>
                </div>
                <div style="font-weight:600;white-space:nowrap;" class="num">${s.durationMinutes} m</div>
              </div>
            `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderHabitsView() {
  const container = document.getElementById('habits-content-container');
  const { habits } = AppState.store;
  const todayKey = toDateKey(new Date());

  // Build last 7 days keys
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    last7.push({ key: toDateKey(d), label: DAY_SHORT[d.getDay()].slice(0, 1) });
  }

  const sections = [
    { id: 'pagi', label: 'Rutinitas Pagi' },
    { id: 'siang', label: 'Rutinitas Siang' },
    { id: 'malam', label: 'Rutinitas Malam' }
  ];

  if (habits.length === 0) {
    container.innerHTML = '<div class="empty-dashed-box">Belum ada kebiasaan terdaftar. Tekan "+ Kebiasaan baru" untuk memulai.</div>';
    return;
  }

  container.innerHTML = sections.map((sec) => {
    const list = habits.filter((h) => (h.section || 'pagi') === sec.id);
    if (!list.length) return '';
    return `
      <div class="habit-section-block">
        <div class="task-group-header">
          <span class="task-group-title">${sec.label}</span>
          <span class="task-group-count">${list.length} kebiasaan</span>
        </div>
        ${list.map((h) => {
          const todayLog = (h.logs || {})[todayKey];
          const val = todayLog ? todayLog.value || 0 : 0;
          const isDone = todayLog && todayLog.status === 'done';
          const isSkip = todayLog && todayLog.status === 'skip';
          return `
            <div class="habit-card-row">
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="color-dot" style="background-color:#${escapeHtml(h.colorHex || '4772FA')}"></span>
                  <span style="font-weight:600;font-size:15px;">${escapeHtml(h.name)}</span>
                  <span class="tag-pill-inline num">Streak ${h.currentStreak || 0} hari</span>
                  ${h.type === 'counter' ? `<span style="font-size:12px;color:var(--muted);" class="num">${val}/${h.goal} ${escapeHtml(h.unit || '')}</span>` : ''}
                </div>
                ${h.encouragement ? `<div style="font-size:12.5px;color:var(--muted);margin-top:3px;">${escapeHtml(h.encouragement)}</div>` : ''}
                <div class="habit-week-dots">
                  ${last7.map((d) => {
                    const log = (h.logs || {})[d.key];
                    const cls = log ? (log.status === 'done' ? 'done' : log.status === 'skip' ? 'skip' : '') : '';
                    return `<div class="habit-day-cell ${cls}" title="${d.key}">${log && log.status === 'skip' ? 'I' : d.label}</div>`;
                  }).join('')}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <button type="button" class="${isDone ? 'btn-accent-sm' : 'btn-primary-sm'}" data-habit-checkin="${h.id}">
                  ${isDone ? 'Tercapai' : h.type === 'counter' && h.goal > 1 ? '+1 Progres' : 'Check-in'}
                </button>
                <button type="button" class="btn-secondary" style="height:32px;padding:0 10px;" data-habit-skip="${h.id}" title="Izin tanpa memutus streak">
                  ${isSkip ? 'Izin tercatat' : 'Izin (Streak-Safe)'}
                </button>
                <button type="button" class="icon-ghost-btn" data-habit-delete="${h.id}" title="Hapus kebiasaan">${SVG_ICONS.trash}</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');
}

function renderInsightsView() {
  const container = document.getElementById('insights-content-container');
  const { countdowns, courses, focusSessions, tasks } = AppState.store;
  const momentum = computeMomentumScore();

  // Compute focus minutes per course for clean single-hue SVG bar chart
  const courseMinutes = courses.map((c) => {
    const mins = focusSessions
      .filter((s) => s.courseId === c.id)
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    return { label: c.code || c.name.slice(0, 10), mins };
  });
  const maxCourseMin = Math.max(30, ...courseMinutes.map((x) => x.mins));

  // Last 7 days focus distribution
  const days7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dk = toDateKey(d);
    const mins = focusSessions
      .filter((s) => toDateKey(new Date(s.startedAt)) === dk)
      .reduce((a, b) => a + (b.durationMinutes || 0), 0);
    days7.push({ label: DAY_SHORT[d.getDay()], mins });
  }
  const maxDayMin = Math.max(30, ...days7.map((d) => d.mins));

  const renderSvgBars = (rows, maxVal) => {
    const w = 420;
    const h = 170;
    const padL = 34;
    const padB = 26;
    const plotW = w - padL - 12;
    const plotH = h - padB - 14;
    const bw = Math.max(18, Math.floor(plotW / Math.max(1, rows.length) - 12));

    const gridLines = [0, 0.5, 1].map((r) => {
      const y = 14 + plotH * (1 - r);
      const val = Math.round(maxVal * r);
      return `
        <line x1="${padL}" y1="${y}" x2="${w - 8}" y2="${y}" stroke="var(--rule)" stroke-width="1"/>
        <text x="${padL - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--faint)">${val}</text>
      `;
    }).join('');

    const bars = rows.map((row, idx) => {
      const slotW = plotW / Math.max(1, rows.length);
      const x = padL + idx * slotW + (slotW - bw) / 2;
      const barH = Math.round((row.mins / maxVal) * plotH);
      const y = 14 + plotH - barH;
      return `
        <rect x="${x}" y="${y}" width="${bw}" height="${Math.max(2, barH)}" rx="3" fill="var(--accent)"/>
        <text x="${x + bw / 2}" y="${h - 6}" text-anchor="middle" font-size="11" fill="var(--muted)">${escapeHtml(row.label)}</text>
      `;
    }).join('');

    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block;">${gridLines}${bars}</svg>`;
  };

  container.innerHTML = `
    <div class="kpi-divided-strip">
      <div class="kpi-cell">
        <div class="kpi-label">Momentum Score</div>
        <div class="kpi-value">Lv. ${momentum.level}</div>
        <div class="kpi-sub num">${momentum.score} / 1200 poin</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">Tugas selesai</div>
        <div class="kpi-value">${momentum.completedCount}</div>
        <div class="kpi-sub num">${tasks.filter((t) => t.status === 'active').length} tugas aktif</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">Total jam fokus</div>
        <div class="kpi-value">${(momentum.totalFocusMins / 60).toFixed(1)} jam</div>
        <div class="kpi-sub num">${focusSessions.length} sesi tercatat</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">Akumulasi streak habit</div>
        <div class="kpi-value">${momentum.streakSum} hari</div>
        <div class="kpi-sub num">${momentum.overdueCount} tugas terlambat</div>
      </div>
    </div>

    <div style="margin-bottom:24px;">
      <div class="task-group-header">
        <span class="task-group-title">Countdown Hari-H</span>
        <span class="task-group-count">${countdowns.length} agenda</span>
      </div>
      ${countdowns.length === 0
        ? '<div class="empty-dashed-box">Belum ada countdown. Tambahkan tanggal UTS, UAS, atau proyek penting.</div>'
        : `<div class="countdown-grid">
            ${countdowns.map((cd) => {
              const days = Math.ceil((new Date(cd.targetDate).getTime() - Date.now()) / 86400000);
              return `
                <div class="countdown-card">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span class="tag-pill-inline">${escapeHtml(cd.category)}</span>
                    <div style="display:flex;gap:4px;">
                      <button type="button" class="icon-ghost-btn" data-pin-cd="${cd.id}" title="Sematkan ke Hari Ini">${SVG_ICONS.pin}</button>
                      <button type="button" class="icon-ghost-btn" data-delete-cd="${cd.id}" title="Hapus countdown">${SVG_ICONS.trash}</button>
                    </div>
                  </div>
                  <div class="countdown-days-num">${days >= 0 ? `H-${days}` : `H+${Math.abs(days)}`}</div>
                  <div style="font-weight:600;font-size:14px;">${escapeHtml(cd.title)}</div>
                  <div style="font-size:12px;color:var(--muted);margin-top:4px;">${formatDueHuman(cd.targetDate)}</div>
                </div>
              `;
            }).join('')}
          </div>`}
    </div>

    <div class="charts-two-col">
      <div class="chart-panel">
        <div class="chart-title">Fokus per mata kuliah (menit)</div>
        <div class="chart-sub">Akumulasi sesi Pomodoro dan Stopwatch berdasarkan kode kuliah.</div>
        ${courseMinutes.length ? renderSvgBars(courseMinutes, maxCourseMin) : '<div class="empty-dashed-box">Belum ada data mata kuliah.</div>'}
      </div>
      <div class="chart-panel">
        <div class="chart-title">Tren fokus 7 hari terakhir (menit)</div>
        <div class="chart-sub">Durasi fokus harian dari riwayat PomoFlow Studio.</div>
        ${renderSvgBars(days7, maxDayMin)}
      </div>
    </div>
  `;
}

function renderSettingsView() {
  const container = document.getElementById('settings-content-container');
  const { profile, settings } = AppState.store;

  container.innerHTML = `
    <div class="settings-row">
      <div class="settings-label-col">
        <h3>Profil pengguna</h3>
        <p>Identitas ini ditampilkan di sidebar dan digunakan sebagai target fokus harian.</p>
      </div>
      <form id="form-settings-profile" class="settings-panel">
        <div class="form-group">
          <label class="form-label" for="set-profile-name">Nama lengkap</label>
          <input type="text" id="set-profile-name" class="form-input" value="${escapeHtml(profile.name)}" required>
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label" for="set-profile-role">Jurusan / peran</label>
            <input type="text" id="set-profile-role" class="form-input" value="${escapeHtml(profile.role)}">
          </div>
          <div class="form-group flex-1">
            <label class="form-label" for="set-focus-goal">Target fokus harian (menit)</label>
            <input type="number" id="set-focus-goal" class="form-input" min="15" max="600" value="${profile.dailyFocusGoalMinutes || 120}">
          </div>
        </div>
        <div class="btn-row"><button type="submit" class="btn-primary">Simpan profil</button></div>
      </form>
    </div>

    <div class="settings-row">
      <div class="settings-label-col">
        <h3>Tema warna workspace</h3>
        <p>Menggunakan palet tema yang diadaptasi langsung dari konfigurasi TickTick.</p>
      </div>
      <div class="settings-panel">
        <div class="theme-swatches-row">
          ${THEME_META.map((t) => `
            <button type="button" class="theme-choice-btn ${settings.theme === t.id ? 'active' : ''}" data-select-theme="${t.id}">
              <span class="theme-swatch-dot" style="background-color:${t.swatch}"></span>
              <span>${t.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="settings-row">
      <div class="settings-label-col">
        <h3>Konfigurasi PomoFlow</h3>
        <p>Atur durasi standar satu sesi Pomodoro dan waktu istirahat.</p>
      </div>
      <form id="form-settings-pomo" class="settings-panel">
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label" for="set-pomo-min">Durasi fokus (menit)</label>
            <input type="number" id="set-pomo-min" class="form-input" min="5" max="120" value="${settings.pomoDuration || 25}">
          </div>
          <div class="form-group flex-1">
            <label class="form-label" for="set-break-min">Istirahat (menit)</label>
            <input type="number" id="set-break-min" class="form-input" min="1" max="30" value="${settings.shortBreak || 5}">
          </div>
        </div>
        <div class="btn-row"><button type="submit" class="btn-primary">Simpan durasi</button></div>
      </form>
    </div>

    <div class="settings-row">
      <div class="settings-label-col">
        <h3>Keamanan, ekspor &amp; data</h3>
        <p>Kunci layar dengan PIN, minta izin notifikasi browser, atau muat ulang dataset sampel.</p>
      </div>
      <div class="settings-panel" style="display:flex;flex-wrap:wrap;gap:10px;">
        <button type="button" class="btn-secondary" id="btn-enable-notif">Aktifkan notifikasi browser</button>
        <button type="button" class="btn-secondary" id="btn-export-json">Ekspor JSON</button>
        <button type="button" class="btn-secondary" id="btn-lock-app">Kunci PIN sekarang</button>
        <button type="button" class="btn-secondary" id="btn-reset-sample">Muat ulang data sampel</button>
        <button type="button" class="btn-danger-outline" id="btn-clear-all">Kosongkan seluruh data</button>
      </div>
    </div>
  `;
}

function renderMiniPomo() {
  const secs = PomoRuntime.mode === 'pomo' ? PomoRuntime.secondsLeft : PomoRuntime.stopwatchSeconds;
  const mins = Math.floor(secs / 60);
  const remS = secs % 60;
  document.getElementById('mini-pomo-clock').textContent = `${twoDigit(mins)}:${twoDigit(remS)}`;
  document.getElementById('mini-pomo-label').textContent = PomoRuntime.isRunning ? 'Fokus berjalan' : 'PomoFlow siap';
  document.getElementById('btn-mini-pomo-toggle').textContent = PomoRuntime.isRunning ? 'Jeda' : 'Buka';
}

function renderAll() {
  updateLiveClock();
  renderSidebar();
  renderMiniPomo();
  populateTaskModalSelects();

  if (AppState.activeModule === 'tasks') renderTasksView();
  if (AppState.activeModule === 'calendar') renderCalendarView();
  if (AppState.activeModule === 'matrix') renderMatrixView();
  if (AppState.activeModule === 'focus') renderFocusView();
  if (AppState.activeModule === 'habits') renderHabitsView();
  if (AppState.activeModule === 'insights') renderInsightsView();
  if (AppState.activeModule === 'settings') renderSettingsView();
}

function switchModule(moduleId) {
  AppState.activeModule = moduleId;
  document.querySelectorAll('.module-view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(`view-${moduleId}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.rail-btn[data-module], .mobile-nav-btn[data-module]').forEach((b) => {
    b.classList.toggle('active', b.dataset.module === moduleId);
  });

  const titles = {
    tasks: 'Tugas',
    calendar: 'Kalender & Jadwal Kuliah',
    matrix: 'Matriks Prioritas',
    focus: 'PomoFlow Studio',
    habits: 'Habit Tracker',
    insights: 'Countdown & Momentum',
    settings: 'Pengaturan'
  };
  document.getElementById('topbar-context-label').textContent = titles[moduleId] || 'luang.in';
  document.getElementById('nav-sidebar').classList.remove('is-open');
  renderAll();
}

function populateTaskModalSelects() {
  const cSel = document.getElementById('task-course-select');
  if (cSel) {
    cSel.innerHTML = `<option value="">Tidak terikat matkul</option>` +
      AppState.store.courses.map((c) => `<option value="${c.id}">${escapeHtml(c.code ? `[${c.code}] ${c.name}` : c.name)}</option>`).join('');
  }
}

// ==========================================
// 10. POMOFLOW TIMER ENGINE
// ==========================================
function togglePomoTimer() {
  if (PomoRuntime.isRunning) {
    clearInterval(PomoRuntime.intervalId);
    PomoRuntime.intervalId = null;
    PomoRuntime.isRunning = false;
    renderMiniPomo();
    if (AppState.activeModule === 'focus') renderFocusView();
    return;
  }

  PomoRuntime.isRunning = true;
  PomoRuntime.intervalId = setInterval(() => {
    if (PomoRuntime.mode === 'pomo') {
      if (PomoRuntime.secondsLeft > 0) {
        PomoRuntime.secondsLeft -= 1;
      } else {
        clearInterval(PomoRuntime.intervalId);
        PomoRuntime.intervalId = null;
        PomoRuntime.isRunning = false;

        if (PomoRuntime.phase === 'work') {
          const mins = AppState.store.settings.pomoDuration || 25;
          recordFocusSession(mins, 'pomo');
          PomoRuntime.phase = 'break';
          PomoRuntime.secondsLeft = (AppState.store.settings.shortBreak || 5) * 60;
          notifyUser('PomoFlow selesai', `Sesi fokus ${mins} menit selesai. Saatnya istirahat.`);
        } else {
          PomoRuntime.phase = 'work';
          PomoRuntime.cycleCount += 1;
          PomoRuntime.secondsLeft = (AppState.store.settings.pomoDuration || 25) * 60;
          notifyUser('Istirahat selesai', 'Siap memulai siklus fokus berikutnya.');
        }
      }
    } else {
      PomoRuntime.stopwatchSeconds += 1;
    }

    renderMiniPomo();
    if (AppState.activeModule === 'focus') renderFocusView();
  }, 1000);

  renderMiniPomo();
  if (AppState.activeModule === 'focus') renderFocusView();
}

function recordFocusSession(durationMinutes, mode) {
  let targetTitle = 'Fokus Bebas';
  let courseId = null;
  if (PomoRuntime.targetType === 'task' && PomoRuntime.targetId) {
    const t = AppState.store.tasks.find((x) => x.id === PomoRuntime.targetId);
    if (t) {
      targetTitle = t.title;
      courseId = t.courseId;
      t.completedPomos = (t.completedPomos || 0) + (mode === 'pomo' ? 1 : 0);
      t.focusMinutes = (t.focusMinutes || 0) + durationMinutes;
    }
  } else if (PomoRuntime.targetType === 'course' && PomoRuntime.targetId) {
    const c = getCourseById(PomoRuntime.targetId);
    if (c) {
      targetTitle = c.name;
      courseId = c.id;
    }
  } else if (PomoRuntime.targetType === 'habit' && PomoRuntime.targetId) {
    const h = AppState.store.habits.find((x) => x.id === PomoRuntime.targetId);
    if (h) targetTitle = h.name;
  }

  AppState.store.focusSessions.unshift({
    id: `fs-${Date.now()}`,
    targetId: PomoRuntime.targetId || null,
    targetTitle,
    courseId,
    mode,
    durationMinutes,
    startedAt: new Date().toISOString(),
    note: ''
  });
  saveData();
  showToast(`Tercatat ${durationMinutes} menit fokus untuk ${targetTitle}.`);
}

function notifyUser(title, body) {
  showToast(`${title}: ${body}`);
  if (AppState.store.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

function showToast(msg) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ==========================================
// 11. EVENT DELEGATION & INITIALIZATION
// ==========================================
function attachPinAndShortcutListeners() {
  document.querySelectorAll('.pin-keypad .pin-btn[data-num]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (currentPinInput.length < 4) {
        currentPinInput += btn.dataset.num;
        updatePinDots();
        if (currentPinInput.length === 4) verifyAndUnlock(currentPinInput);
      }
    });
  });

  const clearBtn = document.getElementById('btn-pin-clear');
  if (clearBtn) {
    clearBtn.onclick = () => {
      currentPinInput = '';
      updatePinDots();
      const errEl = document.getElementById('pin-error-msg');
      if (errEl) errEl.textContent = '';
    };
  }

  const backBtn = document.getElementById('btn-pin-backspace');
  if (backBtn) {
    backBtn.onclick = () => {
      currentPinInput = currentPinInput.slice(0, -1);
      updatePinDots();
    };
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('btn-open-command')?.click();
      return;
    }
    const overlay = document.getElementById('pin-lock-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      if (e.key >= '0' && e.key <= '9' && currentPinInput.length < 4) {
        currentPinInput += e.key;
        updatePinDots();
        if (currentPinInput.length === 4) verifyAndUnlock(currentPinInput);
      } else if (e.key === 'Backspace') {
        currentPinInput = currentPinInput.slice(0, -1);
        updatePinDots();
      } else if (e.key === 'Escape') {
        currentPinInput = '';
        updatePinDots();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  attachPinAndShortcutListeners();

  const syncPill = document.getElementById('cloud-sync-status');
  if (syncPill) {
    syncPill.style.cursor = 'pointer';
    syncPill.title = 'Klik untuk sinkronisasi manual';
    syncPill.addEventListener('click', () => syncWithServer());
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=5').catch(() => {});
  }

  window.addEventListener('online', () => {
    syncWithServer();
  });
  window.addEventListener('offline', () => {
    const meta = readSyncMeta();
    updateSyncPill(meta.pendingSync ? 'Lokal Offline (Menunggu Sync)' : 'Lokal Offline', 'offline');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncWithServer();
    }
  });
  setInterval(syncWithServer, 15000);

  await loadInitialData();
  renderAll();
  setInterval(updateLiveClock, 15000);

  // Set default date inputs
  const tomorrow = new Date(Date.now() + 86400000);
  const tDateStr = toDateKey(tomorrow);
  const tdInput = document.getElementById('task-date-input');
  if (tdInput) tdInput.value = tDateStr;
  const cdInput = document.getElementById('countdown-date-input');
  if (cdInput) cdInput.value = toDateKey(new Date(Date.now() + 7 * 86400000));

  // Global Click Delegation
  document.addEventListener('click', (e) => {
    const modBtn = e.target.closest('[data-module]');
    if (modBtn) {
      switchModule(modBtn.dataset.module);
      return;
    }

    const smartBtn = e.target.closest('.sidebar-item[data-smart]');
    if (smartBtn) {
      AppState.smartFilter = smartBtn.dataset.smart;
      AppState.selectedListId = null;
      AppState.selectedCourseId = null;
      AppState.selectedTag = null;
      switchModule('tasks');
      return;
    }

    const listBtn = e.target.closest('[data-list-filter]');
    if (listBtn) {
      AppState.selectedListId = listBtn.dataset.listFilter;
      AppState.selectedCourseId = null;
      AppState.selectedTag = null;
      switchModule('tasks');
      return;
    }

    const courseBtn = e.target.closest('[data-course-filter]');
    if (courseBtn) {
      AppState.selectedCourseId = courseBtn.dataset.courseFilter;
      AppState.selectedListId = null;
      AppState.selectedTag = null;
      switchModule('tasks');
      return;
    }

    const tagBtn = e.target.closest('[data-tag-filter]');
    if (tagBtn) {
      AppState.selectedTag = AppState.selectedTag === tagBtn.dataset.tagFilter ? null : tagBtn.dataset.tagFilter;
      AppState.selectedListId = null;
      AppState.selectedCourseId = null;
      switchModule('tasks');
      return;
    }

    const viewTab = e.target.closest('[data-viewmode]');
    if (viewTab) {
      AppState.taskViewMode = viewTab.dataset.viewmode;
      document.querySelectorAll('[data-viewmode]').forEach((b) => b.classList.toggle('active', b === viewTab));
      renderTasksView();
      return;
    }

    const calTab = e.target.closest('[data-calmode]');
    if (calTab) {
      AppState.calendarMode = calTab.dataset.calmode;
      document.querySelectorAll('[data-calmode]').forEach((b) => b.classList.toggle('active', b === calTab));
      renderCalendarView();
      return;
    }

    const calDayBtn = e.target.closest('[data-cal-day]');
    if (calDayBtn) {
      AppState.selectedDayOfWeek = parseInt(calDayBtn.dataset.calDay, 10);
      renderCalendarView();
      return;
    }

    if (e.target.id === 'btn-cal-prev') { AppState.monthOffset -= 1; renderCalendarView(); return; }
    if (e.target.id === 'btn-cal-next') { AppState.monthOffset += 1; renderCalendarView(); return; }
    if (e.target.id === 'btn-cal-today') { AppState.monthOffset = 0; renderCalendarView(); return; }

    const toggleTaskBtn = e.target.closest('[data-toggle-task]');
    if (toggleTaskBtn) {
      e.stopPropagation();
      completeOrToggleTask(toggleTaskBtn.dataset.toggleTask);
      return;
    }

    const pomoTaskBtn = e.target.closest('[data-pomo-task]');
    if (pomoTaskBtn) {
      e.stopPropagation();
      startPomoForTarget('task', pomoTaskBtn.dataset.pomoTask);
      return;
    }

    const delTaskBtn = e.target.closest('[data-delete-task]');
    if (delTaskBtn) {
      e.stopPropagation();
      if (confirm('Hapus tugas ini?')) deleteTask(delTaskBtn.dataset.deleteTask);
      return;
    }

    const selectTaskEl = e.target.closest('[data-select-task]');
    if (selectTaskEl && !e.target.closest('.kanban-move-select')) {
      AppState.selectedTaskId = selectTaskEl.dataset.selectTask;
      if (AppState.activeModule !== 'tasks') switchModule('tasks');
      else renderTasksView();
      return;
    }

    // Smart Gap Ribbon clicks
    const applyGapBtn = e.target.closest('#btn-apply-smart-gap');
    if (applyGapBtn) {
      const startM = parseInt(applyGapBtn.dataset.gapStart, 10);
      const endM = parseInt(applyGapBtn.dataset.gapEnd, 10);
      openTimeBlockModal(startM, endM, new Date(), applyGapBtn.dataset.taskId);
      return;
    }

    const gapBlockBtn = e.target.closest('.ribbon-block.free-gap');
    if (gapBlockBtn) {
      const startM = parseInt(gapBlockBtn.dataset.gapStart, 10);
      const endM = parseInt(gapBlockBtn.dataset.gapEnd, 10);
      openTimeBlockModal(startM, Math.min(endM, startM + 60), new Date());
      return;
    }

    const slotHourBtn = e.target.closest('[data-slot-hour]');
    if (slotHourBtn) {
      const h = parseInt(slotHourBtn.dataset.slotHour, 10);
      openTimeBlockModal(h * 60, (h + 1) * 60, new Date());
      return;
    }

    const arrangeBtn = e.target.closest('[data-arrange-task]');
    if (arrangeBtn) {
      const { bestGap } = computeSmartGaps(AppState.selectedDayOfWeek, new Date());
      const startM = bestGap ? bestGap.startMin : 19 * 60;
      const endM = Math.min(startM + 60, bestGap ? bestGap.endMin : 20 * 60);
      openTimeBlockModal(startM, endM, new Date(), arrangeBtn.dataset.arrangeTask);
      return;
    }

    // Edit / Delete Course
    const editCourseBtn = e.target.closest('[data-edit-course]');
    if (editCourseBtn) {
      const c = getCourseById(editCourseBtn.dataset.editCourse);
      if (c) {
        document.getElementById('course-edit-id').value = c.id;
        document.getElementById('course-modal-title').textContent = 'Edit mata kuliah';
        document.getElementById('course-name-input').value = c.name;
        document.getElementById('course-code-input').value = c.code || '';
        document.getElementById('course-credits-input').value = c.credits || 3;
        document.getElementById('course-day-select').value = String(c.dayOfWeek);
        document.getElementById('course-start-input').value = c.startTime;
        document.getElementById('course-end-input').value = c.endTime;
        document.getElementById('course-room-input').value = c.room || '';
        document.getElementById('course-lecturer-input').value = c.lecturer || '';
        document.getElementById('course-color-select').value = c.colorHex || '4772FA';
        document.getElementById('modal-course').classList.add('active');
      }
      return;
    }

    const delCourseBtn = e.target.closest('[data-delete-course]');
    if (delCourseBtn) {
      const c = getCourseById(delCourseBtn.dataset.deleteCourse);
      if (c && confirm(`Hapus mata kuliah "${c.name}"? Tugas terkait akan dipindahkan ke list Kuliah tanpa ikatan matkul.`)) {
        AppState.store.courses = AppState.store.courses.filter((x) => x.id !== c.id);
        AppState.store.tasks.forEach((t) => { if (t.courseId === c.id) t.courseId = null; });
        saveData();
        renderAll();
        showToast('Mata kuliah dihapus.');
      }
      return;
    }

    // PomoFlow Controls
    const pomoModeBtn = e.target.closest('[data-pomomode]');
    if (pomoModeBtn) {
      if (PomoRuntime.isRunning) togglePomoTimer();
      PomoRuntime.mode = pomoModeBtn.dataset.pomomode;
      PomoRuntime.secondsLeft = (AppState.store.settings.pomoDuration || 25) * 60;
      PomoRuntime.stopwatchSeconds = 0;
      renderFocusView();
      renderMiniPomo();
      return;
    }

    if (e.target.id === 'btn-pomo-start-pause') { togglePomoTimer(); return; }
    if (e.target.id === 'btn-pomo-reset') {
      if (PomoRuntime.isRunning) togglePomoTimer();
      PomoRuntime.phase = 'work';
      PomoRuntime.secondsLeft = (AppState.store.settings.pomoDuration || 25) * 60;
      PomoRuntime.stopwatchSeconds = 0;
      renderFocusView();
      renderMiniPomo();
      return;
    }
    if (e.target.id === 'btn-pomo-save-sw') {
      const mins = Math.max(1, Math.round(PomoRuntime.stopwatchSeconds / 60));
      if (PomoRuntime.isRunning) togglePomoTimer();
      recordFocusSession(mins, 'stopwatch');
      PomoRuntime.stopwatchSeconds = 0;
      renderFocusView();
      return;
    }

    const noiseBtn = e.target.closest('[data-noise]');
    if (noiseBtn) {
      PomoRuntime.noiseKind = noiseBtn.dataset.noise;
      AmbientAudio.start(PomoRuntime.noiseKind);
      renderFocusView();
      return;
    }

    // Habit Check-in / Streak-Safe Skip / Delete
    const habitCheckBtn = e.target.closest('[data-habit-checkin]');
    if (habitCheckBtn) {
      const h = AppState.store.habits.find((x) => x.id === habitCheckBtn.dataset.habitCheckin);
      if (h) {
        const key = toDateKey(new Date());
        h.logs = h.logs || {};
        const prev = h.logs[key];
        const nextVal = h.type === 'counter' ? Math.min(h.goal, (prev ? prev.value : 0) + 1) : 1;
        const reached = nextVal >= (h.goal || 1);
        const wasDone = prev && prev.status === 'done';
        h.logs[key] = { status: reached ? 'done' : 'partial', value: nextVal, mood: 'focused', note: '' };
        if (reached && !wasDone) {
          h.currentStreak = (h.currentStreak || 0) + 1;
          h.longestStreak = Math.max(h.longestStreak || 0, h.currentStreak);
          showToast(`Target "${h.name}" tercapai. Streak: ${h.currentStreak} hari.`);
        } else {
          showToast(`Progres "${h.name}": ${nextVal}/${h.goal}`);
        }
        saveData();
        renderAll();
      }
      return;
    }

    const habitSkipBtn = e.target.closest('[data-habit-skip]');
    if (habitSkipBtn) {
      const h = AppState.store.habits.find((x) => x.id === habitSkipBtn.dataset.habitSkip);
      if (h) {
        const key = toDateKey(new Date());
        h.logs = h.logs || {};
        h.logs[key] = { status: 'skip', value: 0, mood: 'neutral', note: 'Izin (Streak-Safe)' };
        saveData();
        renderAll();
        showToast(`Izin tercatat untuk "${h.name}". Streak ${h.currentStreak} hari tetap aman.`);
      }
      return;
    }

    const habitDelBtn = e.target.closest('[data-habit-delete]');
    if (habitDelBtn) {
      if (confirm('Hapus kebiasaan ini?')) {
        AppState.store.habits = AppState.store.habits.filter((h) => h.id !== habitDelBtn.dataset.habitDelete);
        saveData();
        renderAll();
      }
      return;
    }

    // Countdown pin & delete
    const pinCdBtn = e.target.closest('[data-pin-cd]');
    if (pinCdBtn) {
      const cd = AppState.store.countdowns.find((x) => x.id === pinCdBtn.dataset.pinCd);
      if (cd) {
        cd.isPinned = !cd.isPinned;
        saveData();
        renderAll();
        showToast(cd.isPinned ? 'Countdown disematkan ke Hari Ini.' : 'Sematan countdown dilepas.');
      }
      return;
    }
    const delCdBtn = e.target.closest('[data-delete-cd]');
    if (delCdBtn) {
      AppState.store.countdowns = AppState.store.countdowns.filter((x) => x.id !== delCdBtn.dataset.deleteCd);
      saveData();
      renderAll();
      return;
    }

    // Settings Theme & Actions
    const themeBtn = e.target.closest('[data-select-theme]');
    if (themeBtn) {
      applyTheme(themeBtn.dataset.selectTheme);
      saveData();
      renderSettingsView();
      return;
    }

    if (e.target.id === 'btn-cycle-theme') {
      const curIdx = THEME_ORDER.indexOf(AppState.store.settings.theme);
      const next = THEME_ORDER[(curIdx + 1) % THEME_ORDER.length];
      applyTheme(next);
      saveData();
      if (AppState.activeModule === 'settings') renderSettingsView();
      showToast(`Tema diganti ke ${THEME_META.find((m) => m.id === next).name}.`);
      return;
    }

    if (e.target.id === 'btn-enable-notif') {
      if ('Notification' in window) {
        Notification.requestPermission().then((perm) => showToast(`Izin notifikasi: ${perm}`));
      } else {
        showToast('Browser tidak mendukung Notification API.');
      }
      return;
    }

    if (e.target.id === 'btn-export-json') {
      const blob = new Blob([JSON.stringify(AppState.store, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luangin-backup-${toDateKey(new Date())}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (e.target.id === 'btn-lock-app') { lockApp(); return; }
    if (e.target.id === 'btn-reset-sample') {
      if (confirm('Muat ulang seluruh data dengan dataset contoh luang.in?')) {
        AppState.store = buildDefaultStore();
        applyTheme(AppState.store.settings.theme);
        saveData();
        renderAll();
        showToast('Dataset sampel luang.in dimuat ulang.');
      }
      return;
    }
    if (e.target.id === 'btn-clear-all') {
      if (confirm('Kosongkan seluruh mata kuliah, tugas, habit, dan countdown?')) {
        AppState.store = normalizeStore({
          profile: AppState.store.profile,
          settings: AppState.store.settings,
          courses: [],
          tasks: [],
          habits: [],
          focusSessions: [],
          countdowns: []
        });
        saveData();
        renderAll();
        showToast('Seluruh data telah dikosongkan.');
      }
      return;
    }

    // Modal open/close triggers
    const closeTarget = e.target.closest('[data-close-modal]');
    if (closeTarget) {
      document.getElementById(closeTarget.dataset.closeModal).classList.remove('active');
      return;
    }
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });

  // Change events (Kanban select, Pomo target select)
  document.addEventListener('change', (e) => {
    const moveSel = e.target.closest('[data-move-kanban]');
    if (moveSel) {
      const t = AppState.store.tasks.find((x) => x.id === moveSel.dataset.moveKanban);
      if (t) {
        t.kanbanColumn = moveSel.value;
        t.status = moveSel.value === 'done' ? 'completed' : 'active';
        t.isCompleted = t.status === 'completed';
        if (t.isCompleted) t.progress = 100;
        saveData();
        renderAll();
      }
      return;
    }

    if (e.target.id === 'pomo-target-select') {
      const val = e.target.value;
      if (!val) {
        PomoRuntime.targetType = 'free';
        PomoRuntime.targetId = '';
      } else {
        const [tp, tid] = val.split(':');
        PomoRuntime.targetType = tp;
        PomoRuntime.targetId = tid;
      }
    }
  });

  // Kanban HTML5 Drag & Drop
  let draggedTaskId = null;
  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest('[data-kanban-card]');
    if (card) draggedTaskId = card.dataset.kanbanCard;
  });
  document.addEventListener('dragover', (e) => {
    if (e.target.closest('[data-kanban-drop]')) e.preventDefault();
  });
  document.addEventListener('drop', (e) => {
    const col = e.target.closest('[data-kanban-drop]');
    if (col && draggedTaskId) {
      const t = AppState.store.tasks.find((x) => x.id === draggedTaskId);
      if (t) {
        t.kanbanColumn = col.dataset.kanbanDrop;
        t.status = t.kanbanColumn === 'done' ? 'completed' : 'active';
        t.isCompleted = t.status === 'completed';
        if (t.isCompleted) t.progress = 100;
        saveData();
        renderAll();
      }
      draggedTaskId = null;
    }
  });

  // Submit Handlers
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-nlp-quick-add') {
      e.preventDefault();
      const inp = document.getElementById('nlp-task-input');
      const parsed = parseSmartInput(inp.value);
      if (!parsed.title) return;
      const newTask = normalizeTask({
        ...parsed,
        id: `task-${Date.now()}`,
        status: 'active',
        kanbanColumn: 'todo'
      });
      AppState.store.tasks.unshift(newTask);
      inp.value = '';
      document.getElementById('nlp-preview-tokens').innerHTML = '';
      saveData();
      renderAll();
      showToast(`Tugas "${newTask.title}" ditambahkan.`);
      return;
    }

    if (e.target.id === 'form-add-task') {
      e.preventDefault();
      const title = document.getElementById('task-title-input').value.trim();
      const listId = document.getElementById('task-list-select').value;
      const courseId = document.getElementById('task-course-select').value || null;
      const dateStr = document.getElementById('task-date-input').value;
      const timeStr = document.getElementById('task-time-input').value || '21:00';
      const priority = parseInt(document.getElementById('task-priority-select').value, 10);
      const repeatRule = document.getElementById('task-repeat-select').value;
      const estimatedPomos = parseInt(document.getElementById('task-pomos-input').value, 10) || 1;
      const tagsRaw = document.getElementById('task-tags-input').value;
      const tags = tagsRaw.split(',').map((s) => s.trim().replace(/^#/, '').toLowerCase()).filter(Boolean);
      const notes = document.getElementById('task-notes-input').value.trim();

      if (!title) return;
      const dueDate = dateStr ? new Date(`${dateStr}T${timeStr}:00`).toISOString() : null;
      const newTask = normalizeTask({
        id: `task-${Date.now()}`,
        title,
        listId,
        courseId,
        dueDate,
        priority,
        repeatRule,
        estimatedPomos,
        tags,
        notes
      });
      AppState.store.tasks.unshift(newTask);
      document.getElementById('modal-task').classList.remove('active');
      e.target.reset();
      document.getElementById('task-date-input').value = toDateKey(new Date(Date.now() + 86400000));
      saveData();
      renderAll();
      showToast('Tugas baru tersimpan.');
      return;
    }

    if (e.target.id === 'form-add-course') {
      e.preventDefault();
      const editId = document.getElementById('course-edit-id').value;
      const name = document.getElementById('course-name-input').value.trim();
      const code = document.getElementById('course-code-input').value.trim();
      const credits = parseInt(document.getElementById('course-credits-input').value, 10) || 3;
      const dayOfWeek = parseInt(document.getElementById('course-day-select').value, 10);
      const startTime = document.getElementById('course-start-input').value;
      const endTime = document.getElementById('course-end-input').value;
      const room = document.getElementById('course-room-input').value.trim();
      const lecturer = document.getElementById('course-lecturer-input').value.trim();
      const colorHex = document.getElementById('course-color-select').value;

      if (!name) return;
      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        alert('Jam selesai harus lebih lambat daripada jam mulai.');
        return;
      }

      if (editId) {
        const idx = AppState.store.courses.findIndex((c) => c.id === editId);
        if (idx !== -1) {
          AppState.store.courses[idx] = { id: editId, name, code, credits, dayOfWeek, startTime, endTime, room, lecturer, colorHex };
        }
      } else {
        AppState.store.courses.push({
          id: `c-${Date.now()}`,
          name,
          code,
          credits,
          dayOfWeek,
          startTime,
          endTime,
          room,
          lecturer,
          colorHex
        });
      }

      document.getElementById('course-edit-id').value = '';
      document.getElementById('course-modal-title').textContent = 'Tambah mata kuliah';
      document.getElementById('modal-course').classList.remove('active');
      e.target.reset();
      saveData();
      renderAll();
      showToast(editId ? 'Mata kuliah diperbarui.' : 'Mata kuliah baru ditambahkan.');
      return;
    }

    if (e.target.id === 'form-add-habit') {
      e.preventDefault();
      const name = document.getElementById('habit-name-input').value.trim();
      if (!name) return;
      AppState.store.habits.push({
        id: `h-${Date.now()}`,
        name,
        icon: 'check',
        colorHex: '4772FA',
        section: document.getElementById('habit-section-select').value,
        type: document.getElementById('habit-type-select').value,
        goal: Math.max(1, parseInt(document.getElementById('habit-goal-input').value, 10) || 1),
        unit: document.getElementById('habit-unit-input').value.trim() || 'kali',
        encouragement: document.getElementById('habit-encouragement-input').value.trim(),
        currentStreak: 0,
        longestStreak: 0,
        logs: {}
      });
      document.getElementById('modal-habit').classList.remove('active');
      e.target.reset();
      saveData();
      renderAll();
      showToast('Kebiasaan baru ditambahkan.');
      return;
    }

    if (e.target.id === 'form-add-countdown') {
      e.preventDefault();
      const title = document.getElementById('countdown-title-input').value.trim();
      const dateStr = document.getElementById('countdown-date-input').value;
      const category = document.getElementById('countdown-category-select').value;
      const isPinned = document.getElementById('countdown-pinned-input').checked;
      if (!title || !dateStr) return;

      AppState.store.countdowns.push({
        id: `cd-${Date.now()}`,
        title,
        targetDate: new Date(`${dateStr}T08:00:00`).toISOString(),
        category,
        colorHex: category === 'UTS' || category === 'UAS' ? '4772FA' : '247B50',
        isPinned,
        courseId: null
      });
      document.getElementById('modal-countdown').classList.remove('active');
      e.target.reset();
      saveData();
      renderAll();
      showToast('Countdown Hari-H ditambahkan.');
      return;
    }

    if (e.target.id === 'form-timeblock') {
      e.preventDefault();
      const taskId = document.getElementById('tb-task-select').value;
      const startIso = document.getElementById('tb-start-iso').value;
      const endIso = document.getElementById('tb-end-iso').value;
      const startPomo = document.getElementById('tb-start-pomo-check').checked;
      const t = AppState.store.tasks.find((x) => x.id === taskId);
      if (t) {
        t.startDate = startIso;
        t.dueDate = endIso;
        saveData();
        renderAll();
        document.getElementById('modal-timeblock').classList.remove('active');
        if (startPomo) startPomoForTarget('task', t.id);
        else showToast(`"${t.title}" dijadwalkan ke blok waktu.`);
      }
      return;
    }

    if (e.target.id === 'form-settings-profile') {
      e.preventDefault();
      AppState.store.profile.name = document.getElementById('set-profile-name').value.trim() || 'Pengguna';
      AppState.store.profile.role = document.getElementById('set-profile-role').value.trim();
      AppState.store.profile.dailyFocusGoalMinutes = Math.max(15, parseInt(document.getElementById('set-focus-goal').value, 10) || 120);
      saveData();
      renderAll();
      showToast('Profil tersimpan.');
      return;
    }

    if (e.target.id === 'form-settings-pomo') {
      e.preventDefault();
      AppState.store.settings.pomoDuration = Math.max(5, parseInt(document.getElementById('set-pomo-min').value, 10) || 25);
      AppState.store.settings.shortBreak = Math.max(1, parseInt(document.getElementById('set-break-min').value, 10) || 5);
      if (!PomoRuntime.isRunning && PomoRuntime.mode === 'pomo') {
        PomoRuntime.secondsLeft = AppState.store.settings.pomoDuration * 60;
      }
      saveData();
      renderAll();
      showToast('Durasi PomoFlow diperbarui.');
    }
  });

  // Live NLP preview tokens as user types
  const nlpInput = document.getElementById('nlp-task-input');
  if (nlpInput) {
    nlpInput.addEventListener('input', () => {
      const preview = document.getElementById('nlp-preview-tokens');
      if (!nlpInput.value.trim()) { preview.innerHTML = ''; return; }
      const p = parseSmartInput(nlpInput.value);
      const chips = [];
      if (p.dueDate) chips.push(`Jadwal: ${formatDueHuman(p.dueDate)}`);
      if (p.courseId) {
        const c = getCourseById(p.courseId);
        if (c) chips.push(`Matkul: ${c.code || c.name}`);
      } else if (p.listId) {
        chips.push(`List: ${getListById(p.listId).name}`);
      }
      if (p.priority === 5) chips.push('Prioritas Tinggi');
      if (p.priority === 1) chips.push('Prioritas Rendah');
      if (p.repeatRule === 'ebbinghaus') chips.push('Memory Curve (1-2-4-7-15)');
      if (p.estimatedPomos > 1) chips.push(`Estimasi ${p.estimatedPomos} Pomo`);
      p.tags.forEach((tag) => chips.push(`#${tag}`));
      preview.innerHTML = chips.map((c) => `<span class="nlp-token-chip">${escapeHtml(c)}</span>`).join('');
    });
  }

  // Static button bindings
  document.getElementById('btn-open-sidebar').onclick = () => document.getElementById('nav-sidebar').classList.add('is-open');
  document.getElementById('btn-close-sidebar').onclick = () => document.getElementById('nav-sidebar').classList.remove('is-open');
  document.getElementById('btn-rail-home').onclick = () => {
    AppState.smartFilter = 'today';
    AppState.selectedListId = null;
    AppState.selectedCourseId = null;
    AppState.selectedTag = null;
    switchModule('tasks');
  };
  document.getElementById('btn-mini-pomo-toggle').onclick = () => {
    if (PomoRuntime.isRunning) togglePomoTimer();
    else switchModule('focus');
  };

  document.getElementById('btn-quick-new-task').onclick = () => document.getElementById('modal-task').classList.add('active');
  document.getElementById('btn-open-task-modal').onclick = () => document.getElementById('modal-task').classList.add('active');
  document.getElementById('btn-open-course-modal').onclick = () => {
    document.getElementById('course-edit-id').value = '';
    document.getElementById('course-modal-title').textContent = 'Tambah mata kuliah';
    document.getElementById('modal-course').classList.add('active');
  };
  document.getElementById('btn-sidebar-add-course').onclick = () => document.getElementById('btn-open-course-modal').click();
  document.getElementById('btn-open-habit-modal').onclick = () => document.getElementById('modal-habit').classList.add('active');
  document.getElementById('btn-open-countdown-modal').onclick = () => document.getElementById('modal-countdown').classList.add('active');

  // Command Palette (Cmd/Ctrl+K)
  const cmdModal = document.getElementById('modal-command');
  const cmdInput = document.getElementById('command-palette-input');
  const cmdResults = document.getElementById('command-palette-results');

  const renderCommandResults = (q = '') => {
    const query = q.trim().toLowerCase();
    const matchedTasks = AppState.store.tasks
      .filter((t) => !query || t.title.toLowerCase().includes(query))
      .slice(0, 6);
    const matchedCourses = AppState.store.courses
      .filter((c) => !query || c.name.toLowerCase().includes(query) || (c.code || '').toLowerCase().includes(query))
      .slice(0, 4);

    let html = '';
    if (query) {
      html += `<button type="button" class="command-item" id="cmd-create-nlp"><span>Tambah tugas: <strong>"${escapeHtml(q)}"</strong></span><span class="tag-pill-inline">Enter</span></button>`;
    }
    html += matchedTasks.map((t) => `
      <button type="button" class="command-item" data-cmd-task="${t.id}">
        <span>${escapeHtml(t.title)}</span>
        <span style="font-size:12px;color:var(--muted);">${formatDueHuman(t.dueDate)}</span>
      </button>
    `).join('');
    html += matchedCourses.map((c) => `
      <button type="button" class="command-item" data-cmd-course="${c.id}">
        <span>Matkul: ${escapeHtml(c.code ? c.code + ' ' + c.name : c.name)}</span>
        <span style="font-size:12px;color:var(--muted);">${DAY_NAMES[c.dayOfWeek]} ${c.startTime}</span>
      </button>
    `).join('');
    cmdResults.innerHTML = html || '<div class="empty-dashed-box">Tidak ada hasil yang cocok.</div>';
  };

  document.getElementById('btn-open-command').onclick = () => {
    cmdModal.classList.add('active');
    cmdInput.value = '';
    renderCommandResults('');
    setTimeout(() => cmdInput.focus(), 40);
  };
  cmdInput.oninput = () => renderCommandResults(cmdInput.value);
  cmdResults.onclick = (e) => {
    const tBtn = e.target.closest('[data-cmd-task]');
    if (tBtn) {
      AppState.selectedTaskId = tBtn.dataset.cmdTask;
      cmdModal.classList.remove('active');
      switchModule('tasks');
      return;
    }
    const cBtn = e.target.closest('[data-cmd-course]');
    if (cBtn) {
      AppState.selectedCourseId = cBtn.dataset.cmdCourse;
      AppState.selectedListId = null;
      AppState.selectedTag = null;
      cmdModal.classList.remove('active');
      switchModule('tasks');
      return;
    }
    if (e.target.closest('#cmd-create-nlp')) {
      const parsed = parseSmartInput(cmdInput.value);
      if (parsed.title) {
        AppState.store.tasks.unshift(normalizeTask({ ...parsed, id: `task-${Date.now()}` }));
        saveData();
        cmdModal.classList.remove('active');
        renderAll();
        showToast('Tugas baru ditambahkan via Command Palette.');
      }
    }
  };
});

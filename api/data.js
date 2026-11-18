/**
 * luang.in Cloud API: Vercel Serverless Function
 * Handles Store v2 synchronization with Upstash Redis KV and strict PIN authentication.
 */

const cleanValue = (val) => (val ? String(val).trim().replace(/^["']|["']$/g, '') : null);

function getExpectedPin() {
  return cleanValue(process.env.JADWALIN_PIN) || '1234';
}

function getKvCredentials() {
  const rawUrl =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_KV_REST_API_URL ||
    process.env.VERCEL_KV_REST_API_URL;

  const rawToken =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_KV_REST_API_TOKEN ||
    process.env.VERCEL_KV_REST_API_TOKEN;

  const kvUrl = rawUrl ? cleanValue(rawUrl).replace(/\/+$/, '') : null;
  const kvToken = cleanValue(rawToken);
  return { kvUrl, kvToken };
}

const STORE_KV_KEY = 'jadwalin_store';

async function getFromKv() {
  const { kvUrl, kvToken } = getKvCredentials();
  if (!kvUrl || !kvToken) return null;

  try {
    // 1. Primary: Upstash / Vercel KV command-array POST ["GET", key]
    const cmdRes = await fetch(`${kvUrl}/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['GET', STORE_KV_KEY])
    });
    if (cmdRes.ok) {
      const cmdJson = await cmdRes.json();
      if (cmdJson && 'result' in cmdJson) {
        if (!cmdJson.result) return null;
        return typeof cmdJson.result === 'string' ? JSON.parse(cmdJson.result) : cmdJson.result;
      }
    }

    // 2. Fallback: REST path GET /get/{key}
    const pathRes = await fetch(`${kvUrl}/get/${STORE_KV_KEY}`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    if (pathRes.ok) {
      const pathJson = await pathRes.json();
      if (pathJson && pathJson.result) {
        return typeof pathJson.result === 'string' ? JSON.parse(pathJson.result) : pathJson.result;
      }
    }
  } catch (err) {
    console.error('Upstash read error:', err);
  }
  return null;
}

async function saveToKv(payload) {
  const { kvUrl, kvToken } = getKvCredentials();
  if (!kvUrl || !kvToken) return false;

  const serialized = JSON.stringify(payload);
  try {
    // 1. Primary: Upstash / Vercel KV command-array POST ["SET", key, serialized]
    const cmdRes = await fetch(`${kvUrl}/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['SET', STORE_KV_KEY, serialized])
    });
    if (cmdRes.ok) return true;

    // 2. Fallback: REST path POST /set/{key} with raw serialized JSON
    const fallbackRes = await fetch(`${kvUrl}/set/${STORE_KV_KEY}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: serialized
    });
    return fallbackRes.ok;
  } catch (err) {
    console.error('Upstash write error:', err);
    return false;
  }
}

const DEFAULT_LISTS = [
  { id: 'inbox', name: 'Inbox', colorHex: '64748B' },
  { id: 'kuliah', name: 'Kuliah', colorHex: '4772FA' },
  { id: 'organisasi', name: 'Organisasi', colorHex: 'D97706' },
  { id: 'pribadi', name: 'Pribadi', colorHex: '247B50' }
];

const DEFAULT_PROFILE = {
  name: 'Rani Pratiwi',
  role: 'Teknik Informatika • Semester 3',
  dailyFocusGoalMinutes: 120
};

const DEFAULT_SETTINGS = {
  theme: 'classic',
  pomoDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  notificationsEnabled: true
};

function priorityToNumeric(p) {
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
    id: raw.id || `task-${Date.now()}`,
    listId: raw.listId || (raw.courseId ? 'kuliah' : 'inbox'),
    courseId: raw.courseId || null,
    parentId: raw.parentId || null,
    title: raw.title || 'Tanpa Judul',
    notes: raw.notes || '',
    startDate: raw.startDate || null,
    dueDate: raw.dueDate || null,
    isAllDay: Boolean(raw.isAllDay),
    priority: priorityToNumeric(raw.priority),
    status,
    isCompleted,
    kanbanColumn: raw.kanbanColumn || (isCompleted ? 'done' : 'todo'),
    progress: typeof raw.progress === 'number' ? raw.progress : isCompleted ? 100 : 0,
    isPinned: Boolean(raw.isPinned),
    repeatRule: raw.repeatRule || 'none',
    ebbinghausStage: typeof raw.ebbinghausStage === 'number' ? raw.ebbinghausStage : 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    reminders: Array.isArray(raw.reminders) ? raw.reminders : [],
    estimatedPomos: typeof raw.estimatedPomos === 'number' ? raw.estimatedPomos : 1,
    completedPomos: typeof raw.completedPomos === 'number' ? raw.completedPomos : 0,
    focusMinutes: typeof raw.focusMinutes === 'number' ? raw.focusMinutes : 0,
    items: Array.isArray(raw.items) ? raw.items : []
  };
}

function buildSeedData() {
  const now = Date.now();
  const isoOffsetHours = (h) => new Date(now + h * 3600 * 1000).toISOString();
  const isoDayOffset = (d, hour = 21, min = 0) => {
    const dt = new Date(now + d * 86400000);
    dt.setHours(hour, min, 0, 0);
    return dt.toISOString();
  };
  const dateKeyOffset = (d) => {
    const dt = new Date(now + d * 86400000);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const courses = [
    {
      id: 'c-1',
      name: 'Algoritma & Struktur Data',
      code: 'IF2101',
      lecturer: 'Dr. Bambang Sutrisno',
      room: 'Lab Komputer 2',
      credits: 3,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '10:30',
      colorHex: '4772FA'
    },
    {
      id: 'c-2',
      name: 'Sistem Basis Data',
      code: 'IF2102',
      lecturer: 'Ir. Ratna Dewi, M.Kom',
      room: 'Gedung B R.304',
      credits: 3,
      dayOfWeek: 1,
      startTime: '13:00',
      endTime: '15:30',
      colorHex: '0284C7'
    },
    {
      id: 'c-3',
      name: 'Pemrograman Web & Mobile',
      code: 'IF2103',
      lecturer: 'Faisal Rahman, S.T., M.T.',
      room: 'Lab Software 1',
      credits: 3,
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '11:30',
      colorHex: '247B50'
    },
    {
      id: 'c-4',
      name: 'Jaringan Komputer & Lab',
      code: 'IF2104',
      lecturer: 'Ahmad Hidayat, M.Cs',
      room: 'Gedung C R.201',
      credits: 3,
      dayOfWeek: 3,
      startTime: '10:00',
      endTime: '12:30',
      colorHex: 'D97706'
    },
    {
      id: 'c-5',
      name: 'Rekayasa Perangkat Lunak',
      code: 'IF2105',
      lecturer: 'Dr. Siti Nurhaliza',
      room: 'Gedung A R.102',
      credits: 3,
      dayOfWeek: 4,
      startTime: '08:30',
      endTime: '11:00',
      colorHex: '0F766E'
    },
    {
      id: 'c-6',
      name: 'Statistika & Probabilitas',
      code: 'IF2106',
      lecturer: 'Drs. Hendro Wibowo',
      room: 'Gedung B R.205',
      credits: 2,
      dayOfWeek: 5,
      startTime: '08:00',
      endTime: '09:40',
      colorHex: 'C4242A'
    }
  ];

  const tasks = [
    {
      id: 't-1',
      listId: 'kuliah',
      courseId: 'c-1',
      title: 'Implementasi Binary Search Tree & AVL Rotation',
      notes: 'Pastikan memory leak nol menggunakan Valgrind dan sertakan benchmark waktu insert/delete.',
      dueDate: isoOffsetHours(14),
      priority: 5,
      status: 'active',
      isCompleted: false,
      kanbanColumn: 'in_progress',
      progress: 60,
      isPinned: true,
      repeatRule: 'none',
      ebbinghausStage: 0,
      tags: ['praktikum', 'cpp'],
      estimatedPomos: 2,
      completedPomos: 1,
      focusMinutes: 25,
      items: [
        { id: 'chk-1', title: 'Implementasi node & rotasi kiri/kanan', isCompleted: true },
        { id: 'chk-2', title: 'Tulis unit test traversal inorder & postorder', isCompleted: true },
        { id: 'chk-3', title: 'Ekspor PDF laporan benchmark', isCompleted: false }
      ]
    },
    {
      id: 't-2',
      listId: 'kuliah',
      courseId: 'c-2',
      title: 'Review Normalisasi Basis Data (1NF s/d BCNF)',
      notes: 'Menggunakan Memory Curve™ agar konsep functional dependency matang sebelum kuis.',
      dueDate: isoDayOffset(1, 20, 0),
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
        { id: 'chk-4', title: 'Kerjakan 5 soal studi kasus ERD Rumah Sakit', isCompleted: false },
        { id: 'chk-5', title: 'Validasi dependency diagram', isCompleted: false }
      ]
    },
    {
      id: 't-3',
      listId: 'kuliah',
      courseId: 'c-3',
      title: 'Refactor REST Endpoint & Responsive Grid PWA',
      notes: 'Uji tampilan pada viewport 390px dan 1440px.',
      startDate: isoDayOffset(0, 19, 0),
      dueDate: isoDayOffset(0, 20, 30),
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
      dueDate: isoDayOffset(2, 17, 0),
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
      items: [
        { id: 'chk-6', title: 'Kirim surat peminjaman ruangan ke fakultas', isCompleted: true },
        { id: 'chk-7', title: 'Bagikan brief ke MC & moderator', isCompleted: false }
      ]
    },
    {
      id: 't-5',
      listId: 'pribadi',
      courseId: null,
      title: 'Rapikan catatan portofolio GitHub & README',
      notes: 'Tambahkan arsitektur diagram dan tangkapan layar aplikasi terbaru.',
      dueDate: isoDayOffset(5, 21, 0),
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
      notes: 'Sudah diunggah ke portal akademik sebelum tenggat.',
      dueDate: isoDayOffset(-1, 23, 59),
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
  ];

  const habits = [
    {
      id: 'h-1',
      name: 'Review Materi Kuliah',
      icon: 'book',
      colorHex: '4772FA',
      section: 'malam',
      type: 'counter',
      goal: 30,
      unit: 'menit',
      encouragement: 'Tiga puluh menit malam ini menghemat tiga jam SKS saat UTS.',
      currentStreak: 4,
      longestStreak: 9,
      logs: {
        [dateKeyOffset(-4)]: { status: 'done', value: 30, mood: 'focused', note: 'Review pointer & linked list' },
        [dateKeyOffset(-3)]: { status: 'done', value: 30, mood: 'happy', note: 'Latihan query SQL' },
        [dateKeyOffset(-2)]: { status: 'skip', value: 0, mood: 'tired', note: 'Izin rapat kepanitiaan sampai malam' },
        [dateKeyOffset(-1)]: { status: 'done', value: 35, mood: 'focused', note: 'Bedah topologi VLSM' }
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
      encouragement: 'Hidrasi stabil menjaga konsentrasi sepanjang kelas siang.',
      currentStreak: 6,
      longestStreak: 12,
      logs: {
        [dateKeyOffset(-3)]: { status: 'done', value: 8, mood: 'happy', note: '' },
        [dateKeyOffset(-2)]: { status: 'done', value: 8, mood: 'happy', note: '' },
        [dateKeyOffset(-1)]: { status: 'done', value: 8, mood: 'focused', note: '' },
        [dateKeyOffset(0)]: { status: 'partial', value: 5, mood: 'focused', note: '' }
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
        [dateKeyOffset(-2)]: { status: 'done', value: 15, mood: 'happy', note: '' },
        [dateKeyOffset(-1)]: { status: 'done', value: 20, mood: 'happy', note: '' },
        [dateKeyOffset(0)]: { status: 'done', value: 15, mood: 'focused', note: '' }
      }
    }
  ];

  const focusSessions = [
    { id: 'fs-1', targetId: 't-1', targetTitle: 'Implementasi Binary Search Tree & AVL Rotation', courseId: 'c-1', mode: 'pomo', durationMinutes: 25, startedAt: isoOffsetHours(-28), note: 'Menyelesaikan fungsi insert & rotasi kanan' },
    { id: 'fs-2', targetId: 't-3', targetTitle: 'Refactor REST Endpoint & Responsive Grid PWA', courseId: 'c-3', mode: 'pomo', durationMinutes: 25, startedAt: isoOffsetHours(-24), note: 'Menyusun layout Framed Sheet' },
    { id: 'fs-3', targetId: 't-6', targetTitle: 'Laporan Praktikum Subnetting VLSM', courseId: 'c-4', mode: 'pomo', durationMinutes: 50, startedAt: isoOffsetHours(-48), note: '2 siklus pomo untuk verifikasi tabel subnet' },
    { id: 'fs-4', targetId: 'c-2', targetTitle: 'Sistem Basis Data', courseId: 'c-2', mode: 'stopwatch', durationMinutes: 35, startedAt: isoOffsetHours(-5), note: 'Membaca ulang slide normalisasi' }
  ];

  const countdowns = [
    { id: 'cd-1', title: 'UTS Algoritma & Struktur Data', targetDate: isoDayOffset(9, 8, 0), category: 'UTS', colorHex: '4772FA', isPinned: true, courseId: 'c-1' },
    { id: 'cd-2', title: 'Demo Prototype Pemrograman Web', targetDate: isoDayOffset(4, 13, 0), category: 'Proyek', colorHex: '247B50', isPinned: true, courseId: 'c-3' },
    { id: 'cd-3', title: 'Workshop UI/UX Himpunan', targetDate: isoDayOffset(14, 9, 0), category: 'Event', colorHex: 'D97706', isPinned: false, courseId: null }
  ];

  return {
    schemaVersion: 2,
    profile: DEFAULT_PROFILE,
    settings: DEFAULT_SETTINGS,
    lists: DEFAULT_LISTS,
    courses,
    tasks,
    habits,
    focusSessions,
    countdowns
  };
}

function normalizeStore(payload) {
  const rawTasks = Array.isArray(payload.tasks)
    ? payload.tasks
    : Array.isArray(payload.assignments)
    ? payload.assignments
    : [];

  return {
    schemaVersion: 2,
    profile: { ...DEFAULT_PROFILE, ...(payload.profile || {}) },
    settings: { ...DEFAULT_SETTINGS, ...(payload.settings || {}) },
    lists: Array.isArray(payload.lists) && payload.lists.length > 0 ? payload.lists : DEFAULT_LISTS,
    courses: Array.isArray(payload.courses) ? payload.courses : [],
    tasks: rawTasks.map(normalizeTask),
    habits: Array.isArray(payload.habits) ? payload.habits : [],
    focusSessions: Array.isArray(payload.focusSessions) ? payload.focusSessions : [],
    countdowns: Array.isArray(payload.countdowns) ? payload.countdowns : []
  };
}

// In-memory fallback if Upstash KV is not yet provisioned
let inMemoryStore = null;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-jadwalin-pin');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { kvUrl, kvToken } = getKvCredentials();
  const kvConnected = Boolean(kvUrl && kvToken);
  const storageBackend = kvConnected ? 'upstash_redis' : 'in_memory_fallback';
  res.setHeader('X-Storage-Backend', storageBackend);
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const isPing = (req.query && req.query.ping === 'true') || (typeof req.url === 'string' && req.url.includes('ping=true'));
  if (req.method === 'GET' && isPing) {
    return res.status(200).json({
      status: 'ok',
      appName: 'luang.in',
      schemaVersion: 2,
      storage: storageBackend,
      kvConnected,
      timestamp: new Date().toISOString()
    });
  }

  // Strict PIN Validation (no hardcoded '1234' bypass when JADWALIN_PIN is set)
  const clientPin = cleanValue(req.headers['x-jadwalin-pin']);
  const expectedPin = getExpectedPin();
  const isPinValid = Boolean(clientPin && clientPin === expectedPin);
  if (!isPinValid) {
    return res.status(401).json({
      status: 'unauthorized',
      error: 'INVALID_PIN',
      message: 'PIN akses salah atau belum dimasukkan.'
    });
  }

  if (req.method === 'GET') {
    if (kvConnected) {
      let kvData = await getFromKv();
      if (!kvData) {
        kvData = normalizeStore(buildSeedData());
        await saveToKv(kvData);
      }
      return res.status(200).json(normalizeStore(kvData));
    }

    if (!inMemoryStore) {
      inMemoryStore = buildSeedData();
    }
    return res.status(200).json(normalizeStore(inMemoryStore));
  }

  if (req.method === 'POST') {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        return res.status(400).json({ error: 'INVALID_JSON', message: 'JSON tidak valid.' });
      }
    }

    const hasTasksOrAssignments =
      payload &&
      Array.isArray(payload.courses) &&
      (Array.isArray(payload.tasks) || Array.isArray(payload.assignments));

    if (!hasTasksOrAssignments) {
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'Format payload Store v2 tidak valid.' });
    }

    const normalized = normalizeStore(payload);
    inMemoryStore = normalized;

    let kvSaved = false;
    if (kvConnected) {
      kvSaved = await saveToKv(normalized);
    }

    return res.status(200).json({
      status: 'ok',
      storage: kvSaved ? 'upstash_redis' : 'in_memory_fallback',
      kvSaved,
      schemaVersion: 2,
      syncedAt: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
};

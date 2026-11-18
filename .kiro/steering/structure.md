# Project Structure: luang.in

## 1. Directory Tree Architecture

```
jadwal-in/
├── .kiro/
│   ├── steering/
│   │   ├── product.md
│   │   ├── tech.md
│   │   ├── structure.md
│   │   └── code-conventions.md
│   └── specs/
│       └── core-schedule/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── api/
│   └── data.js                  # Vercel Serverless API + Upstash Redis KV + Schema v2 migration
├── web/
│   ├── index.html               # TickTick Framed Sheet Web PWA shell
│   ├── style.css                # 5 TickTick themes, Framed Sheet tokens, anti-slop rules
│   ├── app.js                   # Store v2, Smart NLP, Gap-to-Task, Kanban, Matrix, PomoFlow, Habits, Countdown
│   ├── manifest.json            # PWA manifest (luang.in)
│   ├── icon.svg                 # Time-Gap Grid logo SVG
│   ├── sw.js                    # Service Worker (luangin-v2)
│   ├── server.py                # Local sync server (PIN strictly validated)
│   └── jadwalin_store.json      # Local seed / persistent JSON Store v2
├── vercel.json                  # Vercel routing (/api/data & /web/*)
├── .env.example                 # JADWALIN_PIN & Upstash Redis env template
├── JadwalIn.xcodeproj/
├── JadwalIn/
│   ├── App/
│   │   ├── JadwalInApp.swift
│   │   └── MainTabView.swift    # 5-tab navigation (Hari Ini, Kalender, PomoFlow, Matriks & Habit, Wawasan)
│   ├── Models/
│   │   ├── Course.swift         # Course + credits (SKS) + SmartGapSlot
│   │   ├── Assignment.swift     # Unified Task/Assignment + ChecklistItem + RecurrenceRule + Habit + FocusSession + CountdownItem
│   │   ├── DayOfWeek.swift
│   │   └── Priority.swift       # 4 levels (none, low, medium, high)
│   ├── Store/
│   │   └── ScheduleStore.swift  # Store v2 + Smart NLP + Smart Gap + Memory Curve + Matrix + Momentum Score
│   ├── Features/
│   │   ├── Today/
│   │   │   └── TodayView.swift
│   │   ├── Schedule/
│   │   │   ├── ScheduleView.swift
│   │   │   └── AddCourseSheet.swift
│   │   ├── Assignments/
│   │   │   ├── AssignmentsView.swift
│   │   │   └── AddAssignmentSheet.swift
│   │   └── Settings/
│   │       └── SettingsView.swift
│   ├── Shared/
│   │   ├── Theme/
│   │   │   ├── ColorTokens.swift
│   │   │   └── Typography.swift
│   │   ├── Components/
│   │   │   ├── CourseCard.swift
│   │   │   ├── AssignmentRow.swift
│   │   │   ├── UrgencyBadge.swift
│   │   │   └── EmptyStateView.swift
│   │   └── Extensions/
│   │       └── Date+Extensions.swift
│   └── Assets.xcassets/
└── JadwalInTests/
    └── JadwalInTests.swift      # Unit tests for NLP, Memory Curve, Smart Gap, Matrix, Habit Skip, Store v2
```

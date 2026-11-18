import SwiftUI

// MARK: - Task / Assignment Sub-Types

public enum UrgencyLevel: String, Codable {
    case critical
    case approaching
    case upcoming

    public var label: String {
        switch self {
        case .critical: return "Mendesak"
        case .approaching: return "Mendekati"
        case .upcoming: return "Aman"
        }
    }

    public var color: Color {
        switch self {
        case .critical: return Color(hex: "C4242A")
        case .approaching: return Color(hex: "D97706")
        case .upcoming: return Color(hex: "5D5F60")
        }
    }
}

public enum TaskStatus: String, Codable, CaseIterable {
    case active
    case completed
    case wontDo = "wont_do"
}

public enum RecurrenceRule: String, Codable, CaseIterable, Identifiable {
    case none
    case daily
    case weekly
    case monthly
    case ebbinghaus

    public var id: String { rawValue }

    public var localizedLabel: String {
        switch self {
        case .none: return "Sekali saja"
        case .daily: return "Harian"
        case .weekly: return "Mingguan"
        case .monthly: return "Bulanan"
        case .ebbinghaus: return "Memory Curve (1-2-4-7-15)"
        }
    }
}

public enum KanbanColumn: String, Codable, CaseIterable, Identifiable {
    case todo
    case inProgress = "in_progress"
    case review
    case done

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .todo: return "Rencana"
        case .inProgress: return "Dikerjakan"
        case .review: return "Review"
        case .done: return "Selesai"
        }
    }
}

public enum EisenhowerQuadrant: String, CaseIterable, Identifiable {
    case q1 = "Q1"
    case q2 = "Q2"
    case q3 = "Q3"
    case q4 = "Q4"

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .q1: return "Penting & Mendesak"
        case .q2: return "Penting & Terjadwal"
        case .q3: return "Cepat & Mendesak"
        case .q4: return "Backlog & Santai"
        }
    }
}

public struct ChecklistItem: Identifiable, Codable, Hashable {
    public let id: UUID
    public var title: String
    public var isCompleted: Bool

    public init(id: UUID = UUID(), title: String, isCompleted: Bool = false) {
        self.id = id
        self.title = title
        self.isCompleted = isCompleted
    }
}

public typealias LuangTask = Assignment

public struct Assignment: Identifiable, Codable, Hashable {
    public let id: UUID
    public var listId: String
    public var courseId: UUID?
    public var title: String
    public var startDate: Date?
    public var dueDate: Date
    public var priority: Priority
    public var status: TaskStatus
    public var isCompleted: Bool
    public var kanbanColumn: KanbanColumn
    public var progress: Int
    public var isPinned: Bool
    public var repeatRule: RecurrenceRule
    public var ebbinghausStage: Int
    public var tags: [String]
    public var estimatedPomos: Int
    public var completedPomos: Int
    public var focusMinutes: Int
    public var checklistItems: [ChecklistItem]
    public var notes: String

    enum CodingKeys: String, CodingKey {
        case id, listId, courseId, title, startDate, dueDate, priority, status, isCompleted
        case kanbanColumn, progress, isPinned, repeatRule, ebbinghausStage, tags
        case estimatedPomos, completedPomos, focusMinutes, checklistItems, notes
    }

    public init(
        id: UUID = UUID(),
        listId: String = "kuliah",
        courseId: UUID? = nil,
        title: String,
        startDate: Date? = nil,
        dueDate: Date,
        priority: Priority = .medium,
        status: TaskStatus? = nil,
        isCompleted: Bool = false,
        kanbanColumn: KanbanColumn? = nil,
        progress: Int? = nil,
        isPinned: Bool = false,
        repeatRule: RecurrenceRule = .none,
        ebbinghausStage: Int = 0,
        tags: [String] = [],
        estimatedPomos: Int = 1,
        completedPomos: Int = 0,
        focusMinutes: Int = 0,
        checklistItems: [ChecklistItem] = [],
        notes: String = ""
    ) {
        let resolvedStatus: TaskStatus = status ?? (isCompleted ? .completed : .active)
        self.id = id
        self.listId = listId
        self.courseId = courseId
        self.title = title
        self.startDate = startDate
        self.dueDate = dueDate
        self.priority = priority
        self.status = resolvedStatus
        self.isCompleted = resolvedStatus == .completed
        self.kanbanColumn = kanbanColumn ?? (resolvedStatus == .completed ? .done : .todo)
        self.progress = progress ?? (resolvedStatus == .completed ? 100 : 0)
        self.isPinned = isPinned
        self.repeatRule = repeatRule
        self.ebbinghausStage = ebbinghausStage
        self.tags = tags
        self.estimatedPomos = max(1, estimatedPomos)
        self.completedPomos = completedPomos
        self.focusMinutes = focusMinutes
        self.checklistItems = checklistItems
        self.notes = notes
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try c.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        self.courseId = try c.decodeIfPresent(UUID.self, forKey: .courseId)
        self.listId = try c.decodeIfPresent(String.self, forKey: .listId) ?? (self.courseId != nil ? "kuliah" : "inbox")
        self.title = try c.decode(String.self, forKey: .title)
        self.startDate = try c.decodeIfPresent(Date.self, forKey: .startDate)
        self.dueDate = try c.decodeIfPresent(Date.self, forKey: .dueDate) ?? Date()
        self.priority = try c.decodeIfPresent(Priority.self, forKey: .priority) ?? .medium
        let decodedCompleted = try c.decodeIfPresent(Bool.self, forKey: .isCompleted) ?? false
        let decodedStatus = try c.decodeIfPresent(TaskStatus.self, forKey: .status) ?? (decodedCompleted ? .completed : .active)
        self.status = decodedStatus
        self.isCompleted = decodedStatus == .completed
        self.kanbanColumn = try c.decodeIfPresent(KanbanColumn.self, forKey: .kanbanColumn) ?? (decodedStatus == .completed ? .done : .todo)
        self.progress = try c.decodeIfPresent(Int.self, forKey: .progress) ?? (decodedStatus == .completed ? 100 : 0)
        self.isPinned = try c.decodeIfPresent(Bool.self, forKey: .isPinned) ?? false
        self.repeatRule = try c.decodeIfPresent(RecurrenceRule.self, forKey: .repeatRule) ?? .none
        self.ebbinghausStage = try c.decodeIfPresent(Int.self, forKey: .ebbinghausStage) ?? 0
        self.tags = try c.decodeIfPresent([String].self, forKey: .tags) ?? []
        self.estimatedPomos = try c.decodeIfPresent(Int.self, forKey: .estimatedPomos) ?? 1
        self.completedPomos = try c.decodeIfPresent(Int.self, forKey: .completedPomos) ?? 0
        self.focusMinutes = try c.decodeIfPresent(Int.self, forKey: .focusMinutes) ?? 0
        self.checklistItems = try c.decodeIfPresent([ChecklistItem].self, forKey: .checklistItems) ?? []
        self.notes = try c.decodeIfPresent(String.self, forKey: .notes) ?? ""
    }

    // MARK: - Computed Properties
    public var isOverdue: Bool {
        Date() > dueDate && status == .active
    }

    public var urgency: UrgencyLevel {
        if isOverdue { return .critical }
        let hours = dueDate.timeIntervalSince(Date()) / 3600
        if hours <= 24 { return .critical }
        if hours <= 72 { return .approaching }
        return .upcoming
    }

    public var quadrant: EisenhowerQuadrant {
        let important = priority == .high || priority == .medium
        let urgent = dueDate.timeIntervalSince(Date()) / 3600 <= 48
        switch (important, urgent) {
        case (true, true): return .q1
        case (true, false): return .q2
        case (false, true): return .q3
        case (false, false): return .q4
        }
    }

    public var remainingTimeFormatted: String {
        if status == .wontDo { return "Dibatalkan" }
        if isCompleted { return "Selesai" }

        let interval = dueDate.timeIntervalSince(Date())
        if interval < 0 {
            let pastHours = Int(abs(interval) / 3600)
            return pastHours < 24 ? "Terlewat \(max(1, pastHours)) jam" : "Terlewat \(pastHours / 24) hari"
        }
        let totalHours = Int(interval / 3600)
        let totalMinutes = Int((interval.truncatingRemainder(dividingBy: 3600)) / 60)
        if totalHours < 1 { return "Tersisa \(max(1, totalMinutes)) menit" }
        if totalHours < 24 { return "Tersisa \(totalHours) jam" }
        let days = totalHours / 24
        return days == 1 ? "Besok" : "\(days) hari lagi"
    }

    public var formattedDueDateTime: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "id_ID")
        formatter.dateFormat = "EEE, d MMM • HH:mm"
        return formatter.string(from: dueDate)
    }

    public static func sampleAssignments(for courses: [Course]) -> [Assignment] {
        guard courses.count >= 4 else { return [] }
        let now = Date()
        let cal = Calendar.current

        return [
            Assignment(
                listId: "kuliah",
                courseId: courses[0].id,
                title: "Implementasi Binary Search Tree & AVL Rotation",
                dueDate: cal.date(byAdding: .hour, value: 16, to: now) ?? now,
                priority: .high,
                kanbanColumn: .inProgress,
                progress: 65,
                isPinned: true,
                tags: ["praktikum", "cpp"],
                estimatedPomos: 2,
                completedPomos: 1,
                focusMinutes: 25,
                checklistItems: [
                    ChecklistItem(title: "Implementasi rotasi kiri & kanan", isCompleted: true),
                    ChecklistItem(title: "Unit test traversal inorder", isCompleted: true),
                    ChecklistItem(title: "Ekspor PDF benchmark", isCompleted: false)
                ],
                notes: "Pastikan nol memory leak dan sertakan benchmark waktu."
            ),
            Assignment(
                listId: "kuliah",
                courseId: courses[1].id,
                title: "Review Normalisasi Basis Data (1NF s/d BCNF)",
                dueDate: cal.date(byAdding: .day, value: 1, to: now) ?? now,
                priority: .high,
                kanbanColumn: .todo,
                progress: 25,
                repeatRule: .ebbinghaus,
                ebbinghausStage: 1,
                tags: ["kuis", "review"],
                estimatedPomos: 2,
                notes: "Menggunakan Memory Curve untuk pematangan konsep."
            ),
            Assignment(
                listId: "organisasi",
                courseId: nil,
                title: "Finalisasi Rundown Workshop UI/UX Himpunan",
                dueDate: cal.date(byAdding: .day, value: 2, to: now) ?? now,
                priority: .medium,
                kanbanColumn: .todo,
                progress: 40,
                tags: ["himpunan"],
                estimatedPomos: 1,
                notes: "Konfirmasi pembicara alumni dan proyektor Aula."
            ),
            Assignment(
                listId: "pribadi",
                courseId: nil,
                title: "Rapikan Portofolio GitHub & README",
                dueDate: cal.date(byAdding: .day, value: 5, to: now) ?? now,
                priority: .low,
                kanbanColumn: .todo,
                tags: ["karir"],
                estimatedPomos: 2
            ),
            Assignment(
                listId: "kuliah",
                courseId: courses[3].id,
                title: "Laporan Praktikum Subnetting VLSM",
                dueDate: cal.date(byAdding: .day, value: -1, to: now) ?? now,
                priority: .medium,
                status: .completed,
                isCompleted: true,
                kanbanColumn: .done,
                progress: 100,
                tags: ["praktikum"],
                estimatedPomos: 2,
                completedPomos: 2,
                focusMinutes: 50,
                notes: "Sudah diunggah ke portal akademik."
            )
        ]
    }
}

// MARK: - Habit, Focus, Countdown & Theme Models

public enum HabitSection: String, Codable, CaseIterable, Identifiable {
    case morning = "pagi"
    case afternoon = "siang"
    case evening = "malam"

    public var id: String { rawValue }
    public var title: String {
        switch self {
        case .morning: return "Rutinitas Pagi"
        case .afternoon: return "Rutinitas Siang"
        case .evening: return "Rutinitas Malam"
        }
    }
}

public enum HabitLogStatus: String, Codable {
    case done
    case partial
    case skip
}

public struct HabitLog: Codable, Hashable {
    public var status: HabitLogStatus
    public var value: Int
    public var mood: String
    public var note: String

    public init(status: HabitLogStatus, value: Int, mood: String = "focused", note: String = "") {
        self.status = status
        self.value = value
        self.mood = mood
        self.note = note
    }
}

public struct Habit: Identifiable, Codable, Hashable {
    public let id: UUID
    public var name: String
    public var colorHex: String
    public var section: HabitSection
    public var goal: Int
    public var unit: String
    public var encouragement: String
    public var currentStreak: Int
    public var longestStreak: Int
    public var logs: [String: HabitLog]

    public init(
        id: UUID = UUID(),
        name: String,
        colorHex: String = "4772FA",
        section: HabitSection = .morning,
        goal: Int = 1,
        unit: String = "kali",
        encouragement: String = "",
        currentStreak: Int = 0,
        longestStreak: Int = 0,
        logs: [String: HabitLog] = [:]
    ) {
        self.id = id
        self.name = name
        self.colorHex = colorHex
        self.section = section
        self.goal = max(1, goal)
        self.unit = unit
        self.encouragement = encouragement
        self.currentStreak = currentStreak
        self.longestStreak = longestStreak
        self.logs = logs
    }

    public static let sampleHabits: [Habit] = [
        Habit(
            name: "Review Materi Kuliah",
            colorHex: "4772FA",
            section: .evening,
            goal: 30,
            unit: "menit",
            encouragement: "Tiga puluh menit malam ini menghemat tiga jam SKS saat UTS.",
            currentStreak: 4,
            longestStreak: 9
        ),
        Habit(
            name: "Minum Air Mineral",
            colorHex: "0284C7",
            section: .afternoon,
            goal: 8,
            unit: "gelas",
            encouragement: "Hidrasi stabil menjaga fokus sepanjang kelas.",
            currentStreak: 6,
            longestStreak: 12
        ),
        Habit(
            name: "Baca Buku Non-Teknis",
            colorHex: "247B50",
            section: .morning,
            goal: 15,
            unit: "halaman",
            encouragement: "Awali pagi sebelum membuka media sosial.",
            currentStreak: 3,
            longestStreak: 7
        )
    ]
}

public struct FocusSession: Identifiable, Codable, Hashable {
    public let id: UUID
    public var targetId: UUID?
    public var targetTitle: String
    public var courseId: UUID?
    public var mode: String
    public var durationMinutes: Int
    public var startedAt: Date
    public var note: String

    public init(
        id: UUID = UUID(),
        targetId: UUID? = nil,
        targetTitle: String,
        courseId: UUID? = nil,
        mode: String = "pomo",
        durationMinutes: Int,
        startedAt: Date = Date(),
        note: String = ""
    ) {
        self.id = id
        self.targetId = targetId
        self.targetTitle = targetTitle
        self.courseId = courseId
        self.mode = mode
        self.durationMinutes = durationMinutes
        self.startedAt = startedAt
        self.note = note
    }
}

public struct CountdownItem: Identifiable, Codable, Hashable {
    public let id: UUID
    public var title: String
    public var targetDate: Date
    public var category: String
    public var colorHex: String
    public var isPinned: Bool
    public var courseId: UUID?

    public init(
        id: UUID = UUID(),
        title: String,
        targetDate: Date,
        category: String = "UTS",
        colorHex: String = "4772FA",
        isPinned: Bool = true,
        courseId: UUID? = nil
    ) {
        self.id = id
        self.title = title
        self.targetDate = targetDate
        self.category = category
        self.colorHex = colorHex
        self.isPinned = isPinned
        self.courseId = courseId
    }

    public var daysRemaining: Int {
        let cal = Calendar.current
        let startToday = cal.startOfDay(for: Date())
        let startTarget = cal.startOfDay(for: targetDate)
        return cal.dateComponents([.day], from: startToday, to: startTarget).day ?? 0
    }

    public static func sampleCountdowns(for courses: [Course]) -> [CountdownItem] {
        let cal = Calendar.current
        let now = Date()
        return [
            CountdownItem(
                title: "UTS Algoritma & Struktur Data",
                targetDate: cal.date(byAdding: .day, value: 9, to: now) ?? now,
                category: "UTS",
                colorHex: "4772FA",
                isPinned: true,
                courseId: courses.first?.id
            ),
            CountdownItem(
                title: "Demo Prototype Pemrograman Web",
                targetDate: cal.date(byAdding: .day, value: 4, to: now) ?? now,
                category: "Proyek",
                colorHex: "247B50",
                isPinned: true,
                courseId: courses.count > 2 ? courses[2].id : nil
            )
        ]
    }
}

public enum LuangTheme: String, Codable, CaseIterable, Identifiable {
    case classic
    case dark
    case navy
    case matcha
    case ebony

    public var id: String { rawValue }
    public var displayName: String {
        switch self {
        case .classic: return "Classic Blue"
        case .dark: return "Night Dark"
        case .navy: return "Academic Navy"
        case .matcha: return "Matcha Calm"
        case .ebony: return "Warm Ebony"
        }
    }

    public var accentColor: Color {
        switch self {
        case .classic, .dark: return Color(hex: "4772FA")
        case .navy: return Color(hex: "29386D")
        case .matcha: return Color(hex: "247B50")
        case .ebony: return Color(hex: "8C5A32")
        }
    }
}

public struct UserProfile: Codable, Hashable {
    public var name: String
    public var role: String
    public var dailyFocusGoalMinutes: Int

    public init(
        name: String = "Rani Pratiwi",
        role: String = "Teknik Informatika • Semester 3",
        dailyFocusGoalMinutes: Int = 120
    ) {
        self.name = name
        self.role = role
        self.dailyFocusGoalMinutes = dailyFocusGoalMinutes
    }
}

public struct ParsedSmartTask {
    public var title: String
    public var listId: String
    public var courseId: UUID?
    public var priority: Priority
    public var tags: [String]
    public var estimatedPomos: Int
    public var repeatRule: RecurrenceRule
    public var startDate: Date?
    public var dueDate: Date
}

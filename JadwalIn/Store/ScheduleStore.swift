import Foundation
import SwiftUI
import Combine

public final class ScheduleStore: ObservableObject {
    @Published public var courses: [Course] = []
    @Published public var assignments: [Assignment] = []
    @Published public var habits: [Habit] = []
    @Published public var focusSessions: [FocusSession] = []
    @Published public var countdowns: [CountdownItem] = []
    @Published public var profile: UserProfile = UserProfile()
    @Published public var selectedTheme: LuangTheme = .classic
    @Published public var pomoDurationMinutes: Int = 25
    @Published public var shortBreakMinutes: Int = 5

    // Live PomoFlow Timer State (persists across tabs)
    @Published public var isPomoRunning: Bool = false
    @Published public var pomoSecondsRemaining: Int = 25 * 60
    @Published public var stopwatchSeconds: Int = 0
    @Published public var isStopwatchMode: Bool = false
    @Published public var activeFocusTargetId: UUID? = nil
    @Published public var activeFocusTargetTitle: String = "Fokus Bebas"
    @Published public var activeFocusCourseId: UUID? = nil

    // Cloud Sync Configuration (Vercel /api/data + Upstash Redis)
    @Published public var isCloudSyncEnabled: Bool {
        didSet { UserDefaults.standard.set(isCloudSyncEnabled, forKey: Self.syncEnabledKey) }
    }
    @Published public var cloudSyncURL: String {
        didSet { UserDefaults.standard.set(cloudSyncURL, forKey: Self.syncURLKey) }
    }
    @Published public var cloudSyncPin: String {
        didSet { UserDefaults.standard.set(cloudSyncPin, forKey: Self.syncPinKey) }
    }
    @Published public var cloudSyncStatus: String = "Lokal"
    @Published public var isCloudSyncing: Bool = false
    @Published public var lastSyncedAt: Date? = nil

    private var rawCloudIds: [UUID: String] = [:]
    private var pendingCloudPush: Bool {
        get { UserDefaults.standard.bool(forKey: Self.syncPendingKey) }
        set { UserDefaults.standard.set(newValue, forKey: Self.syncPendingKey) }
    }
    private var isApplyingRemoteSync: Bool = false
    private var cloudSyncTask: Task<Void, Never>? = nil

    private static let syncEnabledKey = "luangin_cloud_enabled"
    private static let syncURLKey = "luangin_cloud_url"
    private static let syncPinKey = "luangin_cloud_pin"
    private static let syncPendingKey = "luangin_cloud_pending"
    private static let syncLastAtKey = "luangin_cloud_last_at"

    private var timerCancellable: AnyCancellable?
    private let fileName = "jadwalin_store.json"
    private static let ebbinghausDays = [1, 2, 4, 7, 15]

    public init() {
        self.isCloudSyncEnabled = UserDefaults.standard.bool(forKey: Self.syncEnabledKey)
        self.cloudSyncURL = UserDefaults.standard.string(forKey: Self.syncURLKey) ?? ""
        self.cloudSyncPin = UserDefaults.standard.string(forKey: Self.syncPinKey) ?? "1234"
        let ts = UserDefaults.standard.double(forKey: Self.syncLastAtKey)
        self.lastSyncedAt = ts > 0 ? Date(timeIntervalSince1970: ts) : nil
        loadData()
        pomoSecondsRemaining = pomoDurationMinutes * 60
        if isCloudSyncEnabled {
            cloudSyncStatus = pendingCloudPush ? "Menunggu Sync" : "Siap Sync"
            Task { @MainActor [weak self] in
                await self?.syncWithCloud()
            }
        }
    }

    // MARK: - Persistence
    private var documentsDirectory: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private var storeFileURL: URL {
        documentsDirectory.appendingPathComponent(fileName)
    }

    private struct StoreEnvelope: Codable {
        var schemaVersion: Int?
        var courses: [Course]
        var assignments: [Assignment]
        var habits: [Habit]?
        var focusSessions: [FocusSession]?
        var countdowns: [CountdownItem]?
        var profile: UserProfile?
        var selectedTheme: LuangTheme?
        var pomoDurationMinutes: Int?
        var shortBreakMinutes: Int?
        var rawCloudIds: [String: String]?
    }

    public func loadData() {
        if FileManager.default.fileExists(atPath: storeFileURL.path) {
            do {
                let data = try Data(contentsOf: storeFileURL)
                let decoded = try JSONDecoder().decode(StoreEnvelope.self, from: data)
                self.courses = decoded.courses
                self.assignments = decoded.assignments
                self.habits = decoded.habits ?? Habit.sampleHabits
                self.focusSessions = decoded.focusSessions ?? []
                self.countdowns = decoded.countdowns ?? CountdownItem.sampleCountdowns(for: decoded.courses)
                self.profile = decoded.profile ?? UserProfile()
                self.selectedTheme = decoded.selectedTheme ?? .classic
                self.pomoDurationMinutes = decoded.pomoDurationMinutes ?? 25
                self.shortBreakMinutes = decoded.shortBreakMinutes ?? 5
                if let savedRaw = decoded.rawCloudIds {
                    var mapped: [UUID: String] = [:]
                    for (k, v) in savedRaw {
                        if let u = UUID(uuidString: k) { mapped[u] = v }
                    }
                    self.rawCloudIds = mapped
                }
                return
            } catch {
                print("Error loading luang.in data: \(error). Loading sample data.")
            }
        }
        loadSampleData()
    }

    public func saveData() {
        do {
            let encodedRawMap = Dictionary(uniqueKeysWithValues: rawCloudIds.map { ($0.key.uuidString, $0.value) })
            let envelope = StoreEnvelope(
                schemaVersion: 2,
                courses: courses,
                assignments: assignments,
                habits: habits,
                focusSessions: focusSessions,
                countdowns: countdowns,
                profile: profile,
                selectedTheme: selectedTheme,
                pomoDurationMinutes: pomoDurationMinutes,
                shortBreakMinutes: shortBreakMinutes,
                rawCloudIds: encodedRawMap
            )
            let encoder = JSONEncoder()
            encoder.outputFormatting = .prettyPrinted
            let data = try encoder.encode(envelope)
            try data.write(to: storeFileURL, options: .atomic)
        } catch {
            print("Failed to save luang.in data: \(error)")
        }

        if isCloudSyncEnabled && !isApplyingRemoteSync {
            pendingCloudPush = true
            cloudSyncStatus = "Menunggu Sync"
            cloudSyncTask?.cancel()
            cloudSyncTask = Task { @MainActor [weak self] in
                try? await Task.sleep(nanoseconds: 600_000_000)
                guard !Task.isCancelled else { return }
                await self?.pushToCloud()
            }
        }
    }

    public func loadSampleData() {
        self.courses = Course.sampleCourses
        self.assignments = Assignment.sampleAssignments(for: self.courses)
        self.habits = Habit.sampleHabits
        self.countdowns = CountdownItem.sampleCountdowns(for: self.courses)
        self.focusSessions = [
            FocusSession(
                targetId: self.assignments.first?.id,
                targetTitle: self.assignments.first?.title ?? "Implementasi Binary Search Tree",
                courseId: self.courses.first?.id,
                mode: "pomo",
                durationMinutes: 25,
                startedAt: Date().addingTimeInterval(-3600 * 5)
            )
        ]
        saveData()
    }

    public func clearAllData() {
        self.courses = []
        self.assignments = []
        self.habits = []
        self.focusSessions = []
        self.countdowns = []
        saveData()
    }

    // MARK: - Smart NLP Parser
    public func parseSmartInput(_ raw: String) -> ParsedSmartTask {
        var working = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        var listId = "kuliah"
        var courseId: UUID? = nil
        var priority: Priority = .medium
        var tags: [String] = []
        var estimatedPomos = 1
        var repeatRule: RecurrenceRule = .none
        var startDate: Date? = nil
        var dueDate = Calendar.current.date(bySettingHour: 21, minute: 0, second: 0, of: Date()) ?? Date()

        // 1. Memory curve & repeat
        let memoryTokens = ["!memory", "!ebbinghaus", "!kurva"]
        for tok in memoryTokens {
            if working.range(of: tok, options: .caseInsensitive) != nil {
                repeatRule = .ebbinghaus
                working = working.replacingOccurrences(of: tok, with: "", options: .caseInsensitive)
            }
        }
        if working.range(of: "setiap hari", options: .caseInsensitive) != nil {
            repeatRule = .daily
            working = working.replacingOccurrences(of: "setiap hari", with: "", options: .caseInsensitive)
        } else if working.range(of: "setiap minggu", options: .caseInsensitive) != nil {
            repeatRule = .weekly
            working = working.replacingOccurrences(of: "setiap minggu", with: "", options: .caseInsensitive)
        }

        // 2. Priority tokens
        let highTokens = ["!tinggi", "!high", "!p1", "!1"]
        let medTokens = ["!sedang", "!medium", "!p2", "!2"]
        let lowTokens = ["!rendah", "!low", "!p3", "!3"]

        for tok in highTokens where working.range(of: tok, options: .caseInsensitive) != nil {
            priority = .high
            working = working.replacingOccurrences(of: tok, with: "", options: .caseInsensitive)
        }
        for tok in medTokens where working.range(of: tok, options: .caseInsensitive) != nil {
            priority = .medium
            working = working.replacingOccurrences(of: tok, with: "", options: .caseInsensitive)
        }
        for tok in lowTokens where working.range(of: tok, options: .caseInsensitive) != nil {
            priority = .low
            working = working.replacingOccurrences(of: tok, with: "", options: .caseInsensitive)
        }

        // 3. Token-by-token scan for #tags, @course/@list, ~Np, dates, and HH:mm
        let parts = working.split(separator: " ").map(String.init)
        var cleanWords: [String] = []
        let cal = Calendar.current
        var targetDay = Date()

        for word in parts {
            let lower = word.lowercased()
            if lower.hasPrefix("#") && lower.count > 1 {
                tags.append(String(lower.dropFirst()))
            } else if lower.hasPrefix("@") && lower.count > 1 {
                let target = String(lower.dropFirst())
                if let matched = courses.first(where: {
                    $0.code.lowercased() == target || $0.name.lowercased().contains(target)
                }) {
                    courseId = matched.id
                    listId = "kuliah"
                } else if ["inbox", "kuliah", "organisasi", "pribadi"].contains(target) {
                    listId = target
                    courseId = nil
                }
            } else if lower.hasPrefix("~") && lower.hasSuffix("p"),
                      let n = Int(lower.dropFirst().dropLast()) {
                estimatedPomos = max(1, min(12, n))
            } else if lower == "besok" || lower == "tomorrow" {
                targetDay = cal.date(byAdding: .day, value: 1, to: Date()) ?? Date()
                dueDate = cal.date(bySettingHour: 21, minute: 0, second: 0, of: targetDay) ?? targetDay
            } else if lower == "lusa" {
                targetDay = cal.date(byAdding: .day, value: 2, to: Date()) ?? Date()
                dueDate = cal.date(bySettingHour: 21, minute: 0, second: 0, of: targetDay) ?? targetDay
            } else if lower.contains(":") && lower.contains("-") {
                let rangeParts = lower.split(separator: "-").map(String.init)
                if rangeParts.count == 2 {
                    let sMin = Course.parseMinutes(rangeParts[0])
                    let eMin = Course.parseMinutes(rangeParts[1])
                    startDate = cal.date(bySettingHour: sMin / 60, minute: sMin % 60, second: 0, of: targetDay)
                    dueDate = cal.date(bySettingHour: eMin / 60, minute: eMin % 60, second: 0, of: targetDay) ?? dueDate
                } else {
                    cleanWords.append(word)
                }
            } else if lower.contains(":"), lower.count <= 5 {
                let hm = lower.split(separator: ":").compactMap { Int($0) }
                if hm.count == 2, (0...23).contains(hm[0]), (0...59).contains(hm[1]) {
                    dueDate = cal.date(bySettingHour: hm[0], minute: hm[1], second: 0, of: targetDay) ?? dueDate
                } else {
                    cleanWords.append(word)
                }
            } else {
                cleanWords.append(word)
            }
        }

        let cleanTitle = cleanWords.joined(separator: " ").trimmingCharacters(in: .whitespacesAndNewlines)
        return ParsedSmartTask(
            title: cleanTitle.isEmpty ? raw : cleanTitle,
            listId: listId,
            courseId: courseId,
            priority: priority,
            tags: tags,
            estimatedPomos: estimatedPomos,
            repeatRule: repeatRule,
            startDate: startDate,
            dueDate: dueDate
        )
    }

    @discardableResult
    public func addSmartTask(from raw: String) -> Assignment? {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        let parsed = parseSmartInput(trimmed)
        let task = Assignment(
            listId: parsed.listId,
            courseId: parsed.courseId,
            title: parsed.title,
            startDate: parsed.startDate,
            dueDate: parsed.dueDate,
            priority: parsed.priority,
            repeatRule: parsed.repeatRule,
            tags: parsed.tags,
            estimatedPomos: parsed.estimatedPomos
        )
        addAssignment(task)
        return task
    }

    // MARK: - Smart Gap™ Engine (08:00 - 21:30)
    public func smartGaps(for day: DayOfWeek, on date: Date = Date()) -> [SmartGapSlot] {
        let winStart = 8 * 60
        let winEnd = 21 * 60 + 30
        let cal = Calendar.current

        var intervals: [(Int, Int)] = coursesFor(day: day).compactMap { c in
            let s = max(winStart, c.startMinutes)
            let e = min(winEnd, c.endMinutes)
            return e > s ? (s, e) : nil
        }

        for task in activeAssignments {
            if let sDate = task.startDate, cal.isDate(sDate, inSameDayAs: date) {
                let sComp = cal.dateComponents([.hour, .minute], from: sDate)
                let eComp = cal.dateComponents([.hour, .minute], from: task.dueDate)
                let sMin = max(winStart, (sComp.hour ?? 0) * 60 + (sComp.minute ?? 0))
                let eMin = min(winEnd, (eComp.hour ?? 0) * 60 + (eComp.minute ?? 0))
                if eMin > sMin { intervals.append((sMin, eMin)) }
            }
        }

        intervals.sort { $0.0 < $1.0 }
        var merged: [(Int, Int)] = []
        for seg in intervals {
            if let last = merged.last, seg.0 <= last.1 {
                merged[merged.count - 1].1 = max(last.1, seg.1)
            } else {
                merged.append(seg)
            }
        }

        var rawGaps: [(Int, Int)] = []
        var cursor = winStart
        for occ in merged {
            if occ.0 - cursor >= 25 {
                rawGaps.append((cursor, occ.0))
            }
            cursor = max(cursor, occ.1)
        }
        if winEnd - cursor >= 25 {
            rawGaps.append((cursor, winEnd))
        }

        let unscheduled = activeAssignments
            .filter { $0.startDate == nil }
            .sorted {
                if $0.priority.numericValue != $1.priority.numericValue {
                    return $0.priority.numericValue > $1.priority.numericValue
                }
                return $0.dueDate < $1.dueDate
            }

        return rawGaps.map { gap in
            let dur = gap.1 - gap.0
            let matched = unscheduled.first { ($0.estimatedPomos * 25) <= dur } ?? unscheduled.first
            return SmartGapSlot(startMinutes: gap.0, endMinutes: gap.1, recommendedTaskId: matched?.id)
        }
    }

    public func scheduleTaskToGap(taskId: UUID, startMinutes: Int, endMinutes: Int, on date: Date = Date()) {
        guard let idx = assignments.firstIndex(where: { $0.id == taskId }) else { return }
        let cal = Calendar.current
        if let startDt = cal.date(bySettingHour: startMinutes / 60, minute: startMinutes % 60, second: 0, of: date),
           let endDt = cal.date(bySettingHour: endMinutes / 60, minute: endMinutes % 60, second: 0, of: date) {
            assignments[idx].startDate = startDt
            assignments[idx].dueDate = endDt
            sortAssignments()
            saveData()
        }
    }

    // MARK: - Course Operations
    public func addCourse(_ course: Course) {
        courses.append(course)
        sortCourses()
        saveData()
    }

    public func updateCourse(_ course: Course) {
        if let index = courses.firstIndex(where: { $0.id == course.id }) {
            courses[index] = course
            sortCourses()
            saveData()
        }
    }

    public func deleteCourse(id: UUID) {
        courses.removeAll { $0.id == id }
        for idx in assignments.indices where assignments[idx].courseId == id {
            assignments[idx].courseId = nil
        }
        saveData()
    }

    private func sortCourses() {
        courses.sort {
            if $0.dayOfWeek.rawValue == $1.dayOfWeek.rawValue {
                return $0.startTime < $1.startTime
            }
            return $0.dayOfWeek.rawValue < $1.dayOfWeek.rawValue
        }
    }

    public func course(for id: UUID?) -> Course? {
        guard let id = id else { return nil }
        return courses.first { $0.id == id }
    }

    public func coursesFor(day: DayOfWeek) -> [Course] {
        courses
            .filter { $0.dayOfWeek == day }
            .sorted { $0.startTime < $1.startTime }
    }

    // MARK: - Assignment / Task Operations
    public func addAssignment(_ assignment: Assignment) {
        assignments.append(assignment)
        sortAssignments()
        saveData()
    }

    public func updateAssignment(_ assignment: Assignment) {
        if let index = assignments.firstIndex(where: { $0.id == assignment.id }) {
            assignments[index] = assignment
            sortAssignments()
            saveData()
        }
    }

    public func deleteAssignment(id: UUID) {
        assignments.removeAll { $0.id == id }
        saveData()
    }

    public func toggleAssignmentCompletion(id: UUID) {
        guard let index = assignments.firstIndex(where: { $0.id == id }) else { return }
        if assignments[index].status == .active {
            assignments[index].status = .completed
            assignments[index].isCompleted = true
            assignments[index].kanbanColumn = .done
            assignments[index].progress = 100

            // Memory Curve (Ebbinghaus 1-2-4-7-15)
            if assignments[index].repeatRule == .ebbinghaus {
                let stage = min(Self.ebbinghausDays.count - 1, assignments[index].ebbinghausStage)
                let nextDays = Self.ebbinghausDays[stage]
                let cal = Calendar.current
                let nextBase = cal.date(byAdding: .day, value: nextDays, to: Date()) ?? Date()
                let nextDue = cal.date(bySettingHour: 20, minute: 0, second: 0, of: nextBase) ?? nextBase
                let current = assignments[index]
                let cleanTitle = current.title.replacingOccurrences(
                    of: "\\s*\\(Review H\\+\\d+\\)$",
                    with: "",
                    options: .regularExpression
                )
                let nextReview = Assignment(
                    listId: current.listId,
                    courseId: current.courseId,
                    title: "\(cleanTitle) (Review H+\(nextDays))",
                    dueDate: nextDue,
                    priority: current.priority,
                    repeatRule: .ebbinghaus,
                    ebbinghausStage: min(Self.ebbinghausDays.count - 1, stage + 1),
                    tags: current.tags,
                    estimatedPomos: current.estimatedPomos,
                    notes: current.notes
                )
                assignments.append(nextReview)
            }
        } else {
            assignments[index].status = .active
            assignments[index].isCompleted = false
            assignments[index].kanbanColumn = .todo
            if assignments[index].progress == 100 { assignments[index].progress = 0 }
        }
        sortAssignments()
        saveData()
    }

    public func markAssignmentWontDo(id: UUID) {
        guard let idx = assignments.firstIndex(where: { $0.id == id }) else { return }
        if assignments[idx].status == .wontDo {
            assignments[idx].status = .active
            assignments[idx].isCompleted = false
        } else {
            assignments[idx].status = .wontDo
            assignments[idx].isCompleted = false
        }
        sortAssignments()
        saveData()
    }

    public func toggleChecklistItem(assignmentId: UUID, itemId: UUID) {
        guard let aIdx = assignments.firstIndex(where: { $0.id == assignmentId }),
              let cIdx = assignments[aIdx].checklistItems.firstIndex(where: { $0.id == itemId }) else { return }
        assignments[aIdx].checklistItems[cIdx].isCompleted.toggle()
        let items = assignments[aIdx].checklistItems
        if !items.isEmpty {
            let done = items.filter(\.isCompleted).count
            assignments[aIdx].progress = Int((Double(done) / Double(items.count)) * 100.0)
        }
        saveData()
    }

    public func addChecklistItem(assignmentId: UUID, title: String) {
        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty,
              let aIdx = assignments.firstIndex(where: { $0.id == assignmentId }) else { return }
        assignments[aIdx].checklistItems.append(ChecklistItem(title: trimmed))
        saveData()
    }

    private func sortAssignments() {
        assignments.sort {
            if $0.isPinned != $1.isPinned { return $0.isPinned && !$1.isPinned }
            if $0.isCompleted != $1.isCompleted { return !$0.isCompleted && $1.isCompleted }
            return $0.dueDate < $1.dueDate
        }
    }

    // MARK: - Query Filters & Matrix
    public var activeAssignments: [Assignment] {
        assignments
            .filter { $0.status == .active }
            .sorted {
                if $0.isPinned != $1.isPinned { return $0.isPinned && !$1.isPinned }
                return $0.dueDate < $1.dueDate
            }
    }

    public var completedAssignments: [Assignment] {
        assignments
            .filter { $0.status == .completed }
            .sorted { $0.dueDate > $1.dueDate }
    }

    public var wontDoAssignments: [Assignment] {
        assignments.filter { $0.status == .wontDo }
    }

    public func assignments(in quadrant: EisenhowerQuadrant) -> [Assignment] {
        activeAssignments.filter { $0.quadrant == quadrant }
    }

    // MARK: - Habit Operations (Streak-Safe)
    public static func todayDateKey() -> String {
        let d = Date()
        let cal = Calendar.current
        let c = cal.dateComponents([.year, .month, .day], from: d)
        return String(format: "%04d-%02d-%02d", c.year ?? 2026, c.month ?? 1, c.day ?? 1)
    }

    public func checkInHabit(id: UUID, increment: Int = 1) {
        guard let idx = habits.firstIndex(where: { $0.id == id }) else { return }
        let key = Self.todayDateKey()
        let prev = habits[idx].logs[key]
        let nextVal = min(habits[idx].goal, (prev?.value ?? 0) + increment)
        let reached = nextVal >= habits[idx].goal
        let wasDone = prev?.status == .done
        habits[idx].logs[key] = HabitLog(status: reached ? .done : .partial, value: nextVal)
        if reached && !wasDone {
            habits[idx].currentStreak += 1
            habits[idx].longestStreak = max(habits[idx].longestStreak, habits[idx].currentStreak)
        }
        saveData()
    }

    public func skipHabitToday(id: UUID, note: String = "Izin (Streak-Safe)") {
        guard let idx = habits.firstIndex(where: { $0.id == id }) else { return }
        let key = Self.todayDateKey()
        habits[idx].logs[key] = HabitLog(status: .skip, value: 0, mood: "neutral", note: note)
        saveData()
    }

    public func addHabit(_ habit: Habit) {
        habits.append(habit)
        saveData()
    }

    public func deleteHabit(id: UUID) {
        habits.removeAll { $0.id == id }
        saveData()
    }

    // MARK: - Countdown & PomoFlow Timer
    public func addCountdown(_ item: CountdownItem) {
        countdowns.append(item)
        saveData()
    }

    public func deleteCountdown(id: UUID) {
        countdowns.removeAll { $0.id == id }
        saveData()
    }

    public func setFocusTarget(assignment: Assignment) {
        activeFocusTargetId = assignment.id
        activeFocusTargetTitle = assignment.title
        activeFocusCourseId = assignment.courseId
    }

    public func togglePomoTimer() {
        if isPomoRunning {
            timerCancellable?.cancel()
            timerCancellable = nil
            isPomoRunning = false
            return
        }
        isPomoRunning = true
        timerCancellable = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self = self else { return }
                if self.isStopwatchMode {
                    self.stopwatchSeconds += 1
                } else if self.pomoSecondsRemaining > 0 {
                    self.pomoSecondsRemaining -= 1
                } else {
                    self.timerCancellable?.cancel()
                    self.timerCancellable = nil
                    self.isPomoRunning = false
                    self.recordFocusSession(
                        targetId: self.activeFocusTargetId,
                        targetTitle: self.activeFocusTargetTitle,
                        courseId: self.activeFocusCourseId,
                        mode: "pomo",
                        durationMinutes: self.pomoDurationMinutes
                    )
                    self.pomoSecondsRemaining = self.pomoDurationMinutes * 60
                }
            }
    }

    public func resetPomoTimer() {
        timerCancellable?.cancel()
        timerCancellable = nil
        isPomoRunning = false
        pomoSecondsRemaining = pomoDurationMinutes * 60
        stopwatchSeconds = 0
    }

    public func saveStopwatchSession() {
        let mins = max(1, stopwatchSeconds / 60)
        recordFocusSession(
            targetId: activeFocusTargetId,
            targetTitle: activeFocusTargetTitle,
            courseId: activeFocusCourseId,
            mode: "stopwatch",
            durationMinutes: mins
        )
        resetPomoTimer()
    }

    public func recordFocusSession(
        targetId: UUID?,
        targetTitle: String,
        courseId: UUID?,
        mode: String,
        durationMinutes: Int
    ) {
        let session = FocusSession(
            targetId: targetId,
            targetTitle: targetTitle,
            courseId: courseId,
            mode: mode,
            durationMinutes: durationMinutes
        )
        focusSessions.insert(session, at: 0)
        if let tid = targetId, let idx = assignments.firstIndex(where: { $0.id == tid }) {
            if mode == "pomo" { assignments[idx].completedPomos += 1 }
            assignments[idx].focusMinutes += durationMinutes
        }
        saveData()
    }

    // MARK: - Momentum Score™ (Lv. 1-12)
    public var totalFocusMinutes: Int {
        focusSessions.reduce(0) { $0 + $1.durationMinutes }
    }

    public var momentumScore: Int {
        let completedPts = completedAssignments.count * 40
        let focusPts = Int(Double(totalFocusMinutes) * 1.2)
        let streakPts = habits.reduce(0) { $0 + $1.currentStreak } * 15
        let overduePenalty = activeAssignments.filter(\.isOverdue).count * 20
        return max(0, min(1200, completedPts + focusPts + streakPts - overduePenalty))
    }

    public var momentumLevel: Int {
        min(12, max(1, (momentumScore / 100) + 1))
    }

    // MARK: - Cloud Sync Engine (Vercel /api/data <-> Store v2 ISO-8601)
    public static func normalizeEndpointURL(_ raw: String) -> URL? {
        var cleaned = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty else { return nil }
        if !cleaned.lowercased().hasPrefix("http://") && !cleaned.lowercased().hasPrefix("https://") {
            cleaned = "https://" + cleaned
        }
        while cleaned.hasSuffix("/") {
            cleaned.removeLast()
        }
        if cleaned.hasSuffix("/api/data") {
            return URL(string: cleaned)
        }
        return URL(string: cleaned + "/api/data")
    }

    public static func deterministicUUID(from rawId: String) -> UUID {
        if let parsed = UUID(uuidString: rawId) { return parsed }
        var h1: UInt64 = 14695981039346656037
        var h2: UInt64 = 1099511628211
        for b in rawId.utf8 {
            h1 ^= UInt64(b)
            h1 &*= 1099511628211
            h2 ^= UInt64(b) &+ 0x9e3779b97f4a7c15
            h2 &*= 14695981039346656037
        }
        var bytes = [UInt8](repeating: 0, count: 16)
        for i in 0..<8 {
            bytes[i] = UInt8((h1 >> (i * 8)) & 0xFF)
            bytes[8 + i] = UInt8((h2 >> (i * 8)) & 0xFF)
        }
        bytes[6] = (bytes[6] & 0x0F) | 0x40
        bytes[8] = (bytes[8] & 0x3F) | 0x80
        return UUID(uuid: (
            bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
            bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15]
        ))
    }

    private func cloudId(for uuid: UUID) -> String {
        rawCloudIds[uuid] ?? uuid.uuidString
    }

    private func uuid(registeringCloudId rawId: String) -> UUID {
        let resolved = Self.deterministicUUID(from: rawId)
        rawCloudIds[resolved] = rawId
        return resolved
    }

    private static func formatISODate(_ date: Date) -> String {
        let fmt = ISO8601DateFormatter()
        fmt.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return fmt.string(from: date)
    }

    private static func parseISODate(_ raw: String?) -> Date? {
        guard let raw = raw, !raw.isEmpty else { return nil }
        let frac = ISO8601DateFormatter()
        frac.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = frac.date(from: raw) { return d }
        let plain = ISO8601DateFormatter()
        plain.formatOptions = [.withInternetDateTime]
        if let d = plain.date(from: raw) { return d }
        let local = DateFormatter()
        local.locale = Locale(identifier: "en_US_POSIX")
        local.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        return local.date(from: raw)
    }

    private struct CloudListDTO: Codable {
        var id: String
        var name: String
        var colorHex: String
    }

    private struct CloudSettingsDTO: Codable {
        var theme: String
        var pomoDuration: Int
        var shortBreak: Int
        var longBreak: Int
        var notificationsEnabled: Bool
    }

    private struct CloudCourseDTO: Codable {
        var id: String
        var name: String
        var code: String?
        var lecturer: String?
        var room: String?
        var credits: Int?
        var dayOfWeek: Int?
        var startTime: String?
        var endTime: String?
        var colorHex: String?
    }

    private struct CloudChecklistDTO: Codable {
        var id: String
        var title: String
        var isCompleted: Bool
    }

    private struct CloudTaskDTO: Codable {
        var id: String
        var listId: String?
        var courseId: String?
        var title: String
        var notes: String?
        var startDate: String?
        var dueDate: String?
        var priority: Int?
        var status: String?
        var isCompleted: Bool?
        var kanbanColumn: String?
        var progress: Int?
        var isPinned: Bool?
        var repeatRule: String?
        var ebbinghausStage: Int?
        var tags: [String]?
        var estimatedPomos: Int?
        var completedPomos: Int?
        var focusMinutes: Int?
        var items: [CloudChecklistDTO]?
    }

    private struct CloudHabitDTO: Codable {
        var id: String
        var name: String
        var colorHex: String?
        var section: String?
        var goal: Int?
        var unit: String?
        var encouragement: String?
        var currentStreak: Int?
        var longestStreak: Int?
        var logs: [String: HabitLog]?
    }

    private struct CloudFocusSessionDTO: Codable {
        var id: String
        var targetId: String?
        var targetTitle: String
        var courseId: String?
        var mode: String?
        var durationMinutes: Int
        var startedAt: String?
        var note: String?
    }

    private struct CloudCountdownDTO: Codable {
        var id: String
        var title: String
        var targetDate: String
        var category: String?
        var colorHex: String?
        var isPinned: Bool?
        var courseId: String?
    }

    private struct CloudStorePayload: Codable {
        var schemaVersion: Int?
        var profile: UserProfile?
        var settings: CloudSettingsDTO?
        var lists: [CloudListDTO]?
        var courses: [CloudCourseDTO]
        var tasks: [CloudTaskDTO]
        var habits: [CloudHabitDTO]?
        var focusSessions: [CloudFocusSessionDTO]?
        var countdowns: [CloudCountdownDTO]?
    }

    public func exportCloudPayload() throws -> Data {
        let dto = CloudStorePayload(
            schemaVersion: 2,
            profile: profile,
            settings: CloudSettingsDTO(
                theme: selectedTheme.rawValue,
                pomoDuration: pomoDurationMinutes,
                shortBreak: shortBreakMinutes,
                longBreak: 15,
                notificationsEnabled: true
            ),
            lists: [
                CloudListDTO(id: "inbox", name: "Inbox", colorHex: "64748B"),
                CloudListDTO(id: "kuliah", name: "Kuliah", colorHex: "4772FA"),
                CloudListDTO(id: "organisasi", name: "Organisasi", colorHex: "D97706"),
                CloudListDTO(id: "pribadi", name: "Pribadi", colorHex: "247B50")
            ],
            courses: courses.map { c in
                CloudCourseDTO(
                    id: cloudId(for: c.id),
                    name: c.name,
                    code: c.code,
                    lecturer: c.lecturer,
                    room: c.room,
                    credits: c.credits,
                    dayOfWeek: c.dayOfWeek.rawValue,
                    startTime: c.startTime,
                    endTime: c.endTime,
                    colorHex: c.colorHex
                )
            },
            tasks: assignments.map { a in
                CloudTaskDTO(
                    id: cloudId(for: a.id),
                    listId: a.listId,
                    courseId: a.courseId.map { cloudId(for: $0) },
                    title: a.title,
                    notes: a.notes,
                    startDate: a.startDate.map { Self.formatISODate($0) },
                    dueDate: Self.formatISODate(a.dueDate),
                    priority: a.priority.numericValue,
                    status: a.status.rawValue,
                    isCompleted: a.isCompleted,
                    kanbanColumn: a.kanbanColumn.rawValue,
                    progress: a.progress,
                    isPinned: a.isPinned,
                    repeatRule: a.repeatRule.rawValue,
                    ebbinghausStage: a.ebbinghausStage,
                    tags: a.tags,
                    estimatedPomos: a.estimatedPomos,
                    completedPomos: a.completedPomos,
                    focusMinutes: a.focusMinutes,
                    items: a.checklistItems.map { item in
                        CloudChecklistDTO(
                            id: cloudId(for: item.id),
                            title: item.title,
                            isCompleted: item.isCompleted
                        )
                    }
                )
            },
            habits: habits.map { h in
                CloudHabitDTO(
                    id: cloudId(for: h.id),
                    name: h.name,
                    colorHex: h.colorHex,
                    section: h.section.rawValue,
                    goal: h.goal,
                    unit: h.unit,
                    encouragement: h.encouragement,
                    currentStreak: h.currentStreak,
                    longestStreak: h.longestStreak,
                    logs: h.logs
                )
            },
            focusSessions: focusSessions.map { s in
                CloudFocusSessionDTO(
                    id: cloudId(for: s.id),
                    targetId: s.targetId.map { cloudId(for: $0) },
                    targetTitle: s.targetTitle,
                    courseId: s.courseId.map { cloudId(for: $0) },
                    mode: s.mode,
                    durationMinutes: s.durationMinutes,
                    startedAt: Self.formatISODate(s.startedAt),
                    note: s.note
                )
            },
            countdowns: countdowns.map { cd in
                CloudCountdownDTO(
                    id: cloudId(for: cd.id),
                    title: cd.title,
                    targetDate: Self.formatISODate(cd.targetDate),
                    category: cd.category,
                    colorHex: cd.colorHex,
                    isPinned: cd.isPinned,
                    courseId: cd.courseId.map { cloudId(for: $0) }
                )
            }
        )
        return try JSONEncoder().encode(dto)
    }

    public func applyCloudPayload(_ data: Data) throws {
        let payload = try JSONDecoder().decode(CloudStorePayload.self, from: data)
        isApplyingRemoteSync = true
        defer { isApplyingRemoteSync = false }

        self.courses = payload.courses.map { c in
            Course(
                id: uuid(registeringCloudId: c.id),
                name: c.name,
                code: c.code ?? "",
                lecturer: c.lecturer ?? "",
                room: c.room ?? "",
                credits: c.credits ?? 3,
                dayOfWeek: DayOfWeek(rawValue: c.dayOfWeek ?? 1) ?? .monday,
                startTime: c.startTime ?? "08:00",
                endTime: c.endTime ?? "10:00",
                colorHex: c.colorHex ?? "4772FA"
            )
        }

        self.assignments = payload.tasks.map { t in
            let resolvedStatus = TaskStatus(rawValue: t.status ?? "") ?? ((t.isCompleted ?? false) ? .completed : .active)
            return Assignment(
                id: uuid(registeringCloudId: t.id),
                listId: t.listId ?? "kuliah",
                courseId: t.courseId.flatMap { $0.isEmpty ? nil : uuid(registeringCloudId: $0) },
                title: t.title,
                startDate: Self.parseISODate(t.startDate),
                dueDate: Self.parseISODate(t.dueDate) ?? Date(),
                priority: Priority(numeric: t.priority ?? 3),
                status: resolvedStatus,
                isCompleted: resolvedStatus == .completed,
                kanbanColumn: KanbanColumn(rawValue: t.kanbanColumn ?? "") ?? (resolvedStatus == .completed ? .done : .todo),
                progress: t.progress ?? (resolvedStatus == .completed ? 100 : 0),
                isPinned: t.isPinned ?? false,
                repeatRule: RecurrenceRule(rawValue: t.repeatRule ?? "") ?? .none,
                ebbinghausStage: t.ebbinghausStage ?? 0,
                tags: t.tags ?? [],
                estimatedPomos: t.estimatedPomos ?? 1,
                completedPomos: t.completedPomos ?? 0,
                focusMinutes: t.focusMinutes ?? 0,
                checklistItems: (t.items ?? []).map {
                    ChecklistItem(id: uuid(registeringCloudId: $0.id), title: $0.title, isCompleted: $0.isCompleted)
                },
                notes: t.notes ?? ""
            )
        }

        if let remoteHabits = payload.habits {
            self.habits = remoteHabits.map { h in
                Habit(
                    id: uuid(registeringCloudId: h.id),
                    name: h.name,
                    colorHex: h.colorHex ?? "4772FA",
                    section: HabitSection(rawValue: h.section ?? "") ?? .morning,
                    goal: h.goal ?? 1,
                    unit: h.unit ?? "kali",
                    encouragement: h.encouragement ?? "",
                    currentStreak: h.currentStreak ?? 0,
                    longestStreak: h.longestStreak ?? 0,
                    logs: h.logs ?? [:]
                )
            }
        }

        if let remoteSessions = payload.focusSessions {
            self.focusSessions = remoteSessions.map { s in
                FocusSession(
                    id: uuid(registeringCloudId: s.id),
                    targetId: s.targetId.flatMap { $0.isEmpty ? nil : uuid(registeringCloudId: $0) },
                    targetTitle: s.targetTitle,
                    courseId: s.courseId.flatMap { $0.isEmpty ? nil : uuid(registeringCloudId: $0) },
                    mode: s.mode ?? "pomo",
                    durationMinutes: s.durationMinutes,
                    startedAt: Self.parseISODate(s.startedAt) ?? Date(),
                    note: s.note ?? ""
                )
            }
        }

        if let remoteCountdowns = payload.countdowns {
            self.countdowns = remoteCountdowns.map { cd in
                CountdownItem(
                    id: uuid(registeringCloudId: cd.id),
                    title: cd.title,
                    targetDate: Self.parseISODate(cd.targetDate) ?? Date(),
                    category: cd.category ?? "UTS",
                    colorHex: cd.colorHex ?? "4772FA",
                    isPinned: cd.isPinned ?? true,
                    courseId: cd.courseId.flatMap { $0.isEmpty ? nil : uuid(registeringCloudId: $0) }
                )
            }
        }

        if let remoteProfile = payload.profile {
            self.profile = remoteProfile
        }

        if let remoteSettings = payload.settings {
            if let th = LuangTheme(rawValue: remoteSettings.theme) {
                self.selectedTheme = th
            }
            self.pomoDurationMinutes = max(5, remoteSettings.pomoDuration)
            self.shortBreakMinutes = max(1, remoteSettings.shortBreak)
            if !isPomoRunning {
                self.pomoSecondsRemaining = self.pomoDurationMinutes * 60
            }
        }

        sortCourses()
        sortAssignments()
        saveData()
    }

    @MainActor
    @discardableResult
    public func pushToCloud() async -> Bool {
        guard isCloudSyncEnabled, let endpoint = Self.normalizeEndpointURL(cloudSyncURL) else {
            return false
        }
        let pin = cloudSyncPin.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !pin.isEmpty else {
            cloudSyncStatus = "PIN kosong"
            return false
        }

        isCloudSyncing = true
        cloudSyncStatus = "Mengunggah..."
        defer { isCloudSyncing = false }

        do {
            var req = URLRequest(url: endpoint)
            req.httpMethod = "POST"
            req.timeoutInterval = 15
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.setValue(pin, forHTTPHeaderField: "x-jadwalin-pin")
            req.httpBody = try exportCloudPayload()

            let (_, response) = try await URLSession.shared.data(for: req)
            if let http = response as? HTTPURLResponse {
                if http.statusCode == 401 {
                    cloudSyncStatus = "PIN Salah (401)"
                    return false
                }
                if (200...299).contains(http.statusCode) {
                    pendingCloudPush = false
                    let now = Date()
                    lastSyncedAt = now
                    UserDefaults.standard.set(now.timeIntervalSince1970, forKey: Self.syncLastAtKey)
                    cloudSyncStatus = "Tersinkron 24/7"
                    return true
                }
            }
            cloudSyncStatus = "Gagal unggah (Menunggu)"
        } catch {
            cloudSyncStatus = "Offline (Menunggu Sync)"
        }
        return false
    }

    @MainActor
    @discardableResult
    public func syncWithCloud() async -> Bool {
        guard isCloudSyncEnabled, let endpoint = Self.normalizeEndpointURL(cloudSyncURL) else {
            cloudSyncStatus = "Nonaktif"
            return false
        }
        let pin = cloudSyncPin.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !pin.isEmpty else {
            cloudSyncStatus = "PIN kosong"
            return false
        }

        // Anti-overwrite: push local offline changes first before pulling remote
        if pendingCloudPush {
            return await pushToCloud()
        }

        isCloudSyncing = true
        cloudSyncStatus = "Menyinkronkan..."
        defer { isCloudSyncing = false }

        do {
            var req = URLRequest(url: endpoint)
            req.httpMethod = "GET"
            req.timeoutInterval = 15
            req.cachePolicy = .reloadIgnoringLocalCacheData
            req.setValue(pin, forHTTPHeaderField: "x-jadwalin-pin")

            let (data, response) = try await URLSession.shared.data(for: req)
            if let http = response as? HTTPURLResponse {
                if http.statusCode == 401 {
                    cloudSyncStatus = "PIN Salah (401)"
                    return false
                }
                if (200...299).contains(http.statusCode) {
                    try applyCloudPayload(data)
                    let now = Date()
                    lastSyncedAt = now
                    UserDefaults.standard.set(now.timeIntervalSince1970, forKey: Self.syncLastAtKey)
                    cloudSyncStatus = "Tersinkron 24/7"
                    return true
                }
            }
            cloudSyncStatus = "Server bermasalah"
        } catch {
            cloudSyncStatus = "Offline"
        }
        return false
    }
}

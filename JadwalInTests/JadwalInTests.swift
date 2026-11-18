import XCTest
@testable import JadwalIn

final class JadwalInTests: XCTestCase {

    override func setUp() {
        super.setUp()
        removePersistedStoreFile()
    }

    override func tearDown() {
        removePersistedStoreFile()
        super.tearDown()
    }

    private func removePersistedStoreFile() {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = docs.appendingPathComponent("jadwalin_store.json")
        try? FileManager.default.removeItem(at: fileURL)
    }

    func testSmartNLPParserExtractsTokens() {
        let store = ScheduleStore()
        store.clearAllData()

        let course = Course(name: "Algoritma & Struktur Data", code: "IF2110")
        store.addCourse(course)

        let parsed = store.parseSmartInput("Kuis Pohon AVL @IF2110 besok 14:30 !tinggi ~3p !memory #kuis")

        XCTAssertEqual(parsed.title, "Kuis Pohon AVL")
        XCTAssertEqual(parsed.courseId, course.id)
        XCTAssertEqual(parsed.listId, "kuliah")
        XCTAssertEqual(parsed.priority, .high)
        XCTAssertEqual(parsed.estimatedPomos, 3)
        XCTAssertEqual(parsed.repeatRule, .ebbinghaus)
        XCTAssertEqual(parsed.tags, ["kuis"])

        let cal = Calendar.current
        let tomorrow = cal.date(byAdding: .day, value: 1, to: Date())!
        XCTAssertTrue(cal.isDate(parsed.dueDate, inSameDayAs: tomorrow))
        XCTAssertEqual(cal.component(.hour, from: parsed.dueDate), 14)
        XCTAssertEqual(cal.component(.minute, from: parsed.dueDate), 30)
    }

    func testSmartGapDetectionAndTaskScheduling() {
        let store = ScheduleStore()
        store.clearAllData()

        let c1 = Course(name: "Kelas Pagi", dayOfWeek: .monday, startTime: "08:00", endTime: "10:00")
        let c2 = Course(name: "Kelas Siang", dayOfWeek: .monday, startTime: "13:00", endTime: "15:00")
        store.addCourse(c1)
        store.addCourse(c2)

        let urgentTask = Assignment(
            title: "Finalisasi Slide",
            dueDate: Date().addingTimeInterval(3600 * 6),
            priority: .high,
            estimatedPomos: 2
        )
        store.addAssignment(urgentTask)

        let gaps = store.smartGaps(for: .monday)
        XCTAssertEqual(gaps.count, 2)
        XCTAssertEqual(gaps[0].startMinutes, 600) // 10:00
        XCTAssertEqual(gaps[0].endMinutes, 780)   // 13:00
        XCTAssertEqual(gaps[0].durationMinutes, 180)
        XCTAssertEqual(gaps[0].recommendedTaskId, urgentTask.id)

        store.scheduleTaskToGap(taskId: urgentTask.id, startMinutes: 600, endMinutes: 650)
        XCTAssertNotNil(store.assignments.first?.startDate)
    }

    func testMemoryCurveEbbinghausAdvancement() {
        let store = ScheduleStore()
        store.clearAllData()

        let studyTask = Assignment(
            title: "Konsep Normalisasi 3NF",
            dueDate: Date().addingTimeInterval(3600 * 12),
            priority: .high,
            repeatRule: .ebbinghaus,
            ebbinghausStage: 0
        )
        store.addAssignment(studyTask)
        store.toggleAssignmentCompletion(id: studyTask.id)

        XCTAssertEqual(store.completedAssignments.count, 1)
        XCTAssertEqual(store.activeAssignments.count, 1)

        let reviewTask = store.activeAssignments[0]
        XCTAssertTrue(reviewTask.title.contains("(Review H+1)"))
        XCTAssertEqual(reviewTask.ebbinghausStage, 1)
        XCTAssertEqual(reviewTask.repeatRule, .ebbinghaus)
    }

    func testEisenhowerQuadrantClassification() {
        let soon = Date().addingTimeInterval(3600 * 12)
        let later = Date().addingTimeInterval(3600 * 24 * 5)

        let q1 = Assignment(title: "Q1", dueDate: soon, priority: .high)
        let q2 = Assignment(title: "Q2", dueDate: later, priority: .medium)
        let q3 = Assignment(title: "Q3", dueDate: soon, priority: .low)
        let q4 = Assignment(title: "Q4", dueDate: later, priority: .none)

        XCTAssertEqual(q1.quadrant, .q1)
        XCTAssertEqual(q2.quadrant, .q2)
        XCTAssertEqual(q3.quadrant, .q3)
        XCTAssertEqual(q4.quadrant, .q4)
    }

    func testStreakSafeHabitCheckInAndSkip() {
        let store = ScheduleStore()
        store.clearAllData()

        let water = Habit(name: "Minum Air", goal: 2, unit: "gelas", currentStreak: 5, longestStreak: 5)
        let reading = Habit(name: "Baca Jurnal", goal: 1, unit: "artikel", currentStreak: 4, longestStreak: 4)
        store.addHabit(water)
        store.addHabit(reading)

        store.checkInHabit(id: water.id, increment: 1)
        XCTAssertEqual(store.habits[0].currentStreak, 5)
        store.checkInHabit(id: water.id, increment: 1)
        XCTAssertEqual(store.habits[0].currentStreak, 6)
        XCTAssertEqual(store.habits[0].longestStreak, 6)

        store.skipHabitToday(id: reading.id)
        let todayKey = ScheduleStore.todayDateKey()
        XCTAssertEqual(store.habits[1].logs[todayKey]?.status, .skip)
        XCTAssertEqual(store.habits[1].currentStreak, 4)
    }

    func testMomentumScoreAndFocusRecording() {
        let store = ScheduleStore()
        store.clearAllData()
        XCTAssertEqual(store.momentumScore, 0)
        XCTAssertEqual(store.momentumLevel, 1)

        let task = Assignment(title: "Deep Work", dueDate: Date().addingTimeInterval(3600 * 24), priority: .high)
        store.addAssignment(task)
        store.recordFocusSession(targetId: task.id, targetTitle: task.title, courseId: nil, mode: "pomo", durationMinutes: 25)
        store.toggleAssignmentCompletion(id: task.id)

        XCTAssertEqual(store.totalFocusMinutes, 25)
        XCTAssertGreaterThan(store.momentumScore, 50)
        XCTAssertLessThanOrEqual(store.momentumScore, 1200)
    }

    func testBackwardCompatibleAssignmentDecodingAndTimeHelpers() throws {
        XCTAssertEqual(Course.parseMinutes("08:45"), 525)
        XCTAssertEqual(SmartGapSlot.formatMinutes(525), "08:45")

        let legacyJSON = """
        {
          "id": "\(UUID().uuidString)",
          "title": "Tugas Legacy v1",
          "dueDate": 0,
          "priority": "Tinggi",
          "isCompleted": false
        }
        """.data(using: .utf8)!

        let decoded = try JSONDecoder().decode(Assignment.self, from: legacyJSON)
        XCTAssertEqual(decoded.title, "Tugas Legacy v1")
        XCTAssertEqual(decoded.listId, "inbox")
        XCTAssertEqual(decoded.status, .active)
        XCTAssertEqual(decoded.estimatedPomos, 1)
    }

    func testCloudSyncURLNormalizationAndStoreV2RoundTrip() throws {
        XCTAssertEqual(
            ScheduleStore.normalizeEndpointURL("luang-in.vercel.app")?.absoluteString,
            "https://luang-in.vercel.app/api/data"
        )
        XCTAssertEqual(
            ScheduleStore.normalizeEndpointURL("https://luang-in.vercel.app/api/data/")?.absoluteString,
            "https://luang-in.vercel.app/api/data"
        )

        let id1 = ScheduleStore.deterministicUUID(from: "c-1")
        let id2 = ScheduleStore.deterministicUUID(from: "c-1")
        XCTAssertEqual(id1, id2)

        let store = ScheduleStore()
        store.clearAllData()

        let webStoreJSON = """
        {
          "schemaVersion": 2,
          "profile": { "name": "Budi", "role": "IF Semester 5", "dailyFocusGoalMinutes": 90 },
          "settings": { "theme": "matcha", "pomoDuration": 30, "shortBreak": 5, "longBreak": 15, "notificationsEnabled": true },
          "courses": [
            { "id": "c-1", "name": "Algoritma", "code": "IF2101", "dayOfWeek": 1, "startTime": "08:00", "endTime": "10:00", "colorHex": "4772FA" }
          ],
          "tasks": [
            {
              "id": "t-1",
              "listId": "kuliah",
              "courseId": "c-1",
              "title": "Tugas Web Sync",
              "dueDate": "2026-11-20T14:00:00.000Z",
              "priority": 5,
              "status": "active",
              "isCompleted": false,
              "kanbanColumn": "todo",
              "progress": 20,
              "isPinned": true,
              "repeatRule": "ebbinghaus",
              "ebbinghausStage": 1,
              "tags": ["kuis"],
              "estimatedPomos": 2,
              "completedPomos": 0,
              "focusMinutes": 0,
              "items": [
                { "id": "sub-1", "title": "Baca bab 2", "isCompleted": true }
              ]
            }
          ],
          "habits": [],
          "focusSessions": [],
          "countdowns": []
        }
        """.data(using: .utf8)!

        try store.applyCloudPayload(webStoreJSON)
        XCTAssertEqual(store.profile.name, "Budi")
        XCTAssertEqual(store.selectedTheme, .matcha)
        XCTAssertEqual(store.pomoDurationMinutes, 30)
        XCTAssertEqual(store.courses.count, 1)
        XCTAssertEqual(store.assignments.count, 1)
        XCTAssertEqual(store.assignments[0].priority, .high)
        XCTAssertEqual(store.assignments[0].courseId, store.courses[0].id)
        XCTAssertEqual(store.assignments[0].checklistItems.first?.title, "Baca bab 2")

        let exportedData = try store.exportCloudPayload()
        let obj = try JSONSerialization.jsonObject(with: exportedData) as? [String: Any]
        let exportedCourses = obj?["courses"] as? [[String: Any]]
        let exportedTasks = obj?["tasks"] as? [[String: Any]]
        XCTAssertEqual(exportedCourses?.first?["id"] as? String, "c-1")
        XCTAssertEqual(exportedTasks?.first?["courseId"] as? String, "c-1")
        XCTAssertEqual(exportedTasks?.first?["priority"] as? Int, 5)
    }
}

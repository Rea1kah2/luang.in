import SwiftUI

public struct SmartGapSlot: Identifiable, Hashable {
    public let id: String
    public let startMinutes: Int
    public let endMinutes: Int
    public let recommendedTaskId: UUID?

    public var durationMinutes: Int {
        max(0, endMinutes - startMinutes)
    }

    public var timeRangeFormatted: String {
        "\(Self.formatMinutes(startMinutes)) - \(Self.formatMinutes(endMinutes))"
    }

    public static func formatMinutes(_ minutes: Int) -> String {
        let h = minutes / 60
        let m = minutes % 60
        return String(format: "%02d:%02d", h, m)
    }

    public init(startMinutes: Int, endMinutes: Int, recommendedTaskId: UUID? = nil) {
        self.id = "\(startMinutes)-\(endMinutes)"
        self.startMinutes = startMinutes
        self.endMinutes = endMinutes
        self.recommendedTaskId = recommendedTaskId
    }
}

public struct Course: Identifiable, Codable, Hashable {
    public let id: UUID
    public var name: String
    public var code: String
    public var lecturer: String
    public var room: String
    public var credits: Int
    public var dayOfWeek: DayOfWeek
    public var startTime: String // "HH:mm"
    public var endTime: String   // "HH:mm"
    public var colorHex: String

    enum CodingKeys: String, CodingKey {
        case id, name, code, lecturer, room, credits, dayOfWeek, startTime, endTime, colorHex
    }

    public init(
        id: UUID = UUID(),
        name: String,
        code: String = "",
        lecturer: String = "",
        room: String = "",
        credits: Int = 3,
        dayOfWeek: DayOfWeek = .monday,
        startTime: String = "08:00",
        endTime: String = "10:00",
        colorHex: String = "4772FA"
    ) {
        self.id = id
        self.name = name
        self.code = code
        self.lecturer = lecturer
        self.room = room
        self.credits = credits
        self.dayOfWeek = dayOfWeek
        self.startTime = startTime
        self.endTime = endTime
        self.colorHex = colorHex
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try c.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        self.name = try c.decode(String.self, forKey: .name)
        self.code = try c.decodeIfPresent(String.self, forKey: .code) ?? ""
        self.lecturer = try c.decodeIfPresent(String.self, forKey: .lecturer) ?? ""
        self.room = try c.decodeIfPresent(String.self, forKey: .room) ?? ""
        self.credits = try c.decodeIfPresent(Int.self, forKey: .credits) ?? 3
        self.dayOfWeek = try c.decodeIfPresent(DayOfWeek.self, forKey: .dayOfWeek) ?? .monday
        self.startTime = try c.decodeIfPresent(String.self, forKey: .startTime) ?? "08:00"
        self.endTime = try c.decodeIfPresent(String.self, forKey: .endTime) ?? "10:00"
        self.colorHex = try c.decodeIfPresent(String.self, forKey: .colorHex) ?? "4772FA"
    }

    public var startMinutes: Int {
        Self.parseMinutes(startTime)
    }

    public var endMinutes: Int {
        Self.parseMinutes(endTime)
    }

    public static func parseMinutes(_ time: String) -> Int {
        let parts = time.split(separator: ":").compactMap { Int($0) }
        guard parts.count >= 2 else { return 0 }
        return parts[0] * 60 + parts[1]
    }

    public var timeRangeFormatted: String {
        "\(startTime) - \(endTime)"
    }

    public var accentColor: Color {
        Color(hex: colorHex)
    }

    public static let presetColors: [String] = [
        "4772FA", // TickTick Classic Blue
        "0284C7", // Sky Blue
        "247B50", // Matcha Green
        "D97706", // Amber Gold
        "0F766E", // Deep Teal
        "C4242A", // Signal Red
        "475569"  // Neutral Slate
    ]

    public static let sampleCourses: [Course] = [
        Course(
            name: "Algoritma & Struktur Data",
            code: "IF2101",
            lecturer: "Dr. Bambang Sutrisno",
            room: "Lab Komputer 2",
            credits: 3,
            dayOfWeek: .monday,
            startTime: "08:00",
            endTime: "10:30",
            colorHex: "4772FA"
        ),
        Course(
            name: "Sistem Basis Data",
            code: "IF2102",
            lecturer: "Ir. Ratna Dewi, M.Kom",
            room: "Gedung B R.304",
            credits: 3,
            dayOfWeek: .monday,
            startTime: "13:00",
            endTime: "15:30",
            colorHex: "0284C7"
        ),
        Course(
            name: "Pemrograman Web & Mobile",
            code: "IF2103",
            lecturer: "Faisal Rahman, S.T., M.T.",
            room: "Lab Software 1",
            credits: 3,
            dayOfWeek: .tuesday,
            startTime: "09:00",
            endTime: "11:30",
            colorHex: "247B50"
        ),
        Course(
            name: "Jaringan Komputer & Lab",
            code: "IF2104",
            lecturer: "Ahmad Hidayat, M.Cs",
            room: "Gedung C R.201",
            credits: 3,
            dayOfWeek: .wednesday,
            startTime: "10:00",
            endTime: "12:30",
            colorHex: "D97706"
        ),
        Course(
            name: "Rekayasa Perangkat Lunak",
            code: "IF2105",
            lecturer: "Dr. Siti Nurhaliza",
            room: "Gedung A R.102",
            credits: 3,
            dayOfWeek: .thursday,
            startTime: "08:30",
            endTime: "11:00",
            colorHex: "0F766E"
        ),
        Course(
            name: "Statistika & Probabilitas",
            code: "IF2106",
            lecturer: "Drs. Hendro Wibowo",
            room: "Gedung B R.205",
            credits: 2,
            dayOfWeek: .friday,
            startTime: "08:00",
            endTime: "09:40",
            colorHex: "C4242A"
        )
    ]
}

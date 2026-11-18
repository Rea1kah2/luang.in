import SwiftUI

public enum Priority: String, Codable, CaseIterable, Identifiable {
    case none = "Tanpa"
    case low = "Rendah"
    case medium = "Sedang"
    case high = "Tinggi"

    public var id: String { rawValue }

    public var numericValue: Int {
        switch self {
        case .high: return 5
        case .medium: return 3
        case .low: return 1
        case .none: return 0
        }
    }

    public init(numeric: Int) {
        switch numeric {
        case 5: self = .high
        case 3: self = .medium
        case 1: self = .low
        default: self = .none
        }
    }

    public var sortOrder: Int {
        numericValue
    }

    public var color: Color {
        switch self {
        case .high:
            return Color(hex: "C4242A") // Signal Red
        case .medium:
            return Color(hex: "D97706") // Amber Warning
        case .low:
            return Color(hex: "4772FA") // TickTick Classic Blue
        case .none:
            return Color(hex: "94A3B8") // Neutral Slate
        }
    }
}

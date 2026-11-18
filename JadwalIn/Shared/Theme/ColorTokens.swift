import SwiftUI

public extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 71, 114, 250)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

public struct Theme {
    // TickTick Framed Sheet Core Palette
    public static var canvasBg: Color {
        Color(UIColor { tc in
            tc.userInterfaceStyle == .dark
                ? UIColor(red: 0.043, green: 0.043, blue: 0.051, alpha: 1.0) // #0B0B0D
                : UIColor(red: 0.961, green: 0.965, blue: 0.969, alpha: 1.0) // #F5F6F7
        })
    }

    public static var surfaceBg: Color {
        Color(UIColor { tc in
            tc.userInterfaceStyle == .dark
                ? UIColor(red: 0.078, green: 0.078, blue: 0.090, alpha: 1.0) // #141417
                : UIColor.white
        })
    }

    public static var subtleBg: Color {
        Color(UIColor { tc in
            tc.userInterfaceStyle == .dark
                ? UIColor(red: 0.110, green: 0.110, blue: 0.129, alpha: 1.0) // #1C1C21
                : UIColor(red: 0.957, green: 0.965, blue: 0.973, alpha: 1.0) // #F4F6F8
        })
    }

    public static var inkPrimary: Color {
        Color(UIColor { tc in
            tc.userInterfaceStyle == .dark
                ? UIColor(red: 0.976, green: 0.980, blue: 0.984, alpha: 1.0) // #F9FAFB
                : UIColor(red: 0.075, green: 0.078, blue: 0.086, alpha: 1.0) // #131416
        })
    }

    public static var inkSecondary: Color {
        Color(UIColor { tc in
            tc.userInterfaceStyle == .dark
                ? UIColor(red: 0.631, green: 0.631, blue: 0.667, alpha: 1.0) // #A1A1AA
                : UIColor(red: 0.365, green: 0.373, blue: 0.376, alpha: 1.0) // #5D5F60
        })
    }

    public static var inkMuted: Color {
        Color(UIColor { tc in
            tc.userInterfaceStyle == .dark
                ? UIColor(red: 0.553, green: 0.553, blue: 0.588, alpha: 1.0)
                : UIColor(red: 0.420, green: 0.447, blue: 0.502, alpha: 1.0) // #6B7280
        })
    }

    public static var borderCrisp: Color {
        Color(UIColor { tc in
            tc.userInterfaceStyle == .dark
                ? UIColor(red: 0.153, green: 0.153, blue: 0.180, alpha: 1.0) // #27272E
                : UIColor(red: 0.910, green: 0.918, blue: 0.925, alpha: 1.0) // #E8EAEC
        })
    }

    // TickTick Classic Blue & Data Accents
    public static let classicBlue = Color(hex: "4772FA")
    public static let classicBlueTint = Color(hex: "4772FA").opacity(0.12)
    public static let signalRed = Color(hex: "C4242A")
    public static let amberWarning = Color(hex: "D97706")
    public static let matchaGreen = Color(hex: "247B50")

    // Compatibility Aliases
    public static var navy: Color { inkPrimary }
    public static var slate: Color { inkSecondary }
    public static var slateMuted: Color { inkMuted }
    public static var slateLight: Color { inkMuted }
    public static var safetyOrange: Color { signalRed }
    public static var tangerine: Color { classicBlue }
    public static var emeraldSuccess: Color { matchaGreen }
    public static var emerald: Color { matchaGreen }
    public static var crimson: Color { signalRed }
    public static var blueprintBlue: Color { classicBlue }
}

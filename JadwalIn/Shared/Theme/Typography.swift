import SwiftUI

public struct AppFont {
    public static func largeTitle() -> Font {
        .system(size: 24, weight: .semibold, design: .default)
    }

    public static func title2() -> Font {
        .system(size: 18, weight: .semibold, design: .default)
    }

    public static func headline() -> Font {
        .system(size: 15, weight: .semibold, design: .default)
    }

    public static func body() -> Font {
        .system(size: 14, weight: .regular, design: .default)
    }

    public static func subheadline() -> Font {
        .system(size: 13, weight: .medium, design: .default)
    }

    public static func caption() -> Font {
        .system(size: 12, weight: .medium, design: .default)
    }

    public static func monoHeading() -> Font {
        .system(size: 14, weight: .semibold, design: .default)
    }

    public static func monoBody() -> Font {
        .system(size: 13, weight: .medium, design: .default)
    }

    public static func monoTag() -> Font {
        .system(size: 11, weight: .semibold, design: .monospaced)
    }

    public static func monoCaption() -> Font {
        .system(size: 11, weight: .medium, design: .default)
    }

    public static func timerDisplay() -> Font {
        .system(size: 46, weight: .medium, design: .monospaced)
    }
}

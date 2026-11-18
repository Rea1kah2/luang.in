import SwiftUI

public struct UrgencyBadge: View {
    let urgency: UrgencyLevel
    let text: String

    public init(urgency: UrgencyLevel, text: String) {
        self.urgency = urgency
        self.text = text
    }

    public var body: some View {
        HStack(spacing: 5) {
            Circle()
                .fill(urgency.color)
                .frame(width: 6, height: 6)

            Text(text)
                .font(AppFont.caption())
                .foregroundColor(urgency.color)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(urgency.color.opacity(0.10))
        .cornerRadius(6)
    }
}

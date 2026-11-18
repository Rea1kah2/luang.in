import SwiftUI

public struct CourseCard: View {
    let course: Course

    public init(course: Course) {
        self.course = course
    }

    public var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(course.accentColor)
                .frame(width: 10, height: 10)

            VStack(alignment: .leading, spacing: 4) {
                HStack(alignment: .center, spacing: 8) {
                    Text(course.name)
                        .font(AppFont.headline())
                        .foregroundColor(Theme.inkPrimary)
                        .lineLimit(1)

                    Spacer()

                    if !course.code.isEmpty {
                        Text(course.code)
                            .font(AppFont.monoTag())
                            .foregroundColor(Theme.inkSecondary)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 2)
                            .background(Theme.subtleBg)
                            .cornerRadius(6)
                    }
                }

                HStack(spacing: 10) {
                    Text(course.timeRangeFormatted)
                        .font(AppFont.caption())
                        .foregroundColor(Theme.inkSecondary)

                    if !course.room.isEmpty {
                        Text("• \(course.room)")
                            .font(AppFont.caption())
                            .foregroundColor(Theme.inkMuted)
                    }

                    Text("• \(course.credits) SKS")
                        .font(AppFont.caption())
                        .foregroundColor(Theme.inkMuted)
                }

                if !course.lecturer.isEmpty {
                    Text(course.lecturer)
                        .font(AppFont.caption())
                        .foregroundColor(Theme.inkMuted)
                        .lineLimit(1)
                }
            }
        }
        .padding(14)
        .background(Theme.surfaceBg)
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Theme.borderCrisp, lineWidth: 1)
        )
    }
}

import SwiftUI

public struct AssignmentRow: View {
    let assignment: Assignment
    let course: Course?
    let onToggle: () -> Void

    public init(
        assignment: Assignment,
        course: Course?,
        onToggle: @escaping () -> Void
    ) {
        self.assignment = assignment
        self.course = course
        self.onToggle = onToggle
    }

    private var dueLabelColor: Color {
        if assignment.status != .active { return Theme.inkMuted }
        if assignment.isOverdue { return Theme.signalRed }
        let hours = assignment.dueDate.timeIntervalSince(Date()) / 3600
        return hours <= 48 ? Theme.amberWarning : Theme.inkSecondary
    }

    public var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Button(action: onToggle) {
                ZStack {
                    RoundedRectangle(cornerRadius: 5)
                        .stroke(assignment.isCompleted ? Theme.inkMuted : assignment.priority.color, lineWidth: 1.8)
                        .background(
                            RoundedRectangle(cornerRadius: 5)
                                .fill(assignment.isCompleted ? Theme.inkMuted : Color.clear)
                        )
                        .frame(width: 20, height: 20)

                    if assignment.isCompleted {
                        Image(systemName: "checkmark")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                    } else if assignment.status == .wontDo {
                        Image(systemName: "minus")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Theme.inkMuted)
                    }
                }
            }
            .buttonStyle(BorderlessButtonStyle())
            .padding(.top, 2)

            VStack(alignment: .leading, spacing: 5) {
                HStack(alignment: .top, spacing: 8) {
                    Text(assignment.title)
                        .font(AppFont.headline())
                        .foregroundColor(assignment.status == .active ? Theme.inkPrimary : Theme.inkMuted)
                        .strikethrough(assignment.status != .active, color: Theme.inkMuted)
                        .lineLimit(2)

                    Spacer()

                    if assignment.isPinned {
                        Image(systemName: "pin.fill")
                            .font(.system(size: 11))
                            .foregroundColor(Theme.classicBlue)
                    }
                }

                HStack(spacing: 8) {
                    Text(assignment.formattedDueDateTime)
                        .font(AppFont.caption())
                        .foregroundColor(dueLabelColor)

                    if let course = course {
                        HStack(spacing: 4) {
                            Circle()
                                .fill(course.accentColor)
                                .frame(width: 6, height: 6)
                            Text(course.code.isEmpty ? course.name : course.code)
                                .font(AppFont.caption())
                                .foregroundColor(Theme.inkSecondary)
                        }
                    } else {
                        Text(assignment.listId.capitalized)
                            .font(AppFont.caption())
                            .foregroundColor(Theme.inkMuted)
                    }

                    if !assignment.checklistItems.isEmpty {
                        let done = assignment.checklistItems.filter(\.isCompleted).count
                        Text("\(done)/\(assignment.checklistItems.count)")
                            .font(AppFont.caption())
                            .foregroundColor(Theme.inkMuted)
                    }

                    if assignment.repeatRule == .ebbinghaus {
                        Text("Memory Curve")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(Theme.classicBlue)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Theme.classicBlueTint)
                            .cornerRadius(4)
                    }
                }

                if assignment.progress > 0 && assignment.progress < 100 && assignment.status == .active {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Theme.subtleBg)
                                .frame(height: 4)
                            Capsule()
                                .fill(Theme.classicBlue)
                                .frame(width: geo.size.width * CGFloat(assignment.progress) / 100.0, height: 4)
                        }
                    }
                    .frame(height: 4)
                    .padding(.top, 2)
                }
            }
        }
        .padding(12)
        .background(Theme.surfaceBg)
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Theme.borderCrisp, lineWidth: 1)
        )
    }
}

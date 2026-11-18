import SwiftUI

public struct TodayView: View {
    @EnvironmentObject private var store: ScheduleStore

    public var onOpenPomoFlow: (() -> Void)?

    @State private var smartInput: String = ""
    @State private var viewMode: TodayViewMode = .list
    @State private var showAddAssignment: Bool = false
    @State private var showHistory: Bool = false
    @State private var selectedAssignmentId: UUID? = nil

    public enum TodayViewMode: String, CaseIterable, Identifiable {
        case list = "Daftar"
        case kanban = "Kanban"
        public var id: String { rawValue }
    }

    public init(onOpenPomoFlow: (() -> Void)? = nil) {
        self.onOpenPomoFlow = onOpenPomoFlow
    }

    private var todayDay: DayOfWeek {
        DayOfWeek.from(date: Date())
    }

    private var todayCourses: [Course] {
        store.coursesFor(day: todayDay)
    }

    private var todayGaps: [SmartGapSlot] {
        store.smartGaps(for: todayDay)
    }

    private var pinnedCountdowns: [CountdownItem] {
        store.countdowns.filter(\.isPinned)
    }

    private var smartPreview: ParsedSmartTask? {
        let trimmed = smartInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        return store.parseSmartInput(trimmed)
    }

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    headerStrip
                    smartInputCard
                    timeGapRibbonCard

                    if !pinnedCountdowns.isEmpty {
                        pinnedCountdownsSection
                    }

                    modeSwitcherHeader

                    if viewMode == .list {
                        listModeSection
                    } else {
                        kanbanModeSection
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }
            .background(Theme.canvasBg.ignoresSafeArea())
            .navigationTitle("Hari Ini")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    HStack(spacing: 6) {
                        Image(systemName: "square.grid.2x2.fill")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(store.selectedTheme.accentColor)
                        Text("luang.in")
                            .font(AppFont.headline())
                            .foregroundColor(Theme.inkPrimary)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showAddAssignment = true
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .accessibilityLabel("Tambah Tugas")
                }
            }
            .sheet(isPresented: $showAddAssignment) {
                AddAssignmentSheet()
            }
            .sheet(item: Binding(
                get: { selectedAssignmentId.map { SelectedTaskID(id: $0) } },
                set: { selectedAssignmentId = $0?.id }
            )) { wrapper in
                TaskDetailSheet(assignmentId: wrapper.id, onOpenPomoFlow: onOpenPomoFlow)
            }
        }
    }

    // MARK: - Header & Momentum Pill
    private var headerStrip: some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                Text(Date().localizedDayAndDate)
                    .font(AppFont.title2())
                    .foregroundColor(Theme.inkPrimary)
                Text("\(store.activeAssignments.count) tugas aktif • \(todayCourses.count) kelas hari ini")
                    .font(AppFont.caption())
                    .foregroundColor(Theme.inkSecondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("Lv. \(store.momentumLevel)")
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))
                    .foregroundColor(store.selectedTheme.accentColor)
                Text("\(store.momentumScore) pts")
                    .font(AppFont.monoTag())
                    .foregroundColor(Theme.inkSecondary)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Theme.surfaceBg)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Theme.borderCrisp, lineWidth: 1)
            )
            .cornerRadius(10)
        }
    }

    // MARK: - Smart NLP Input Card
    private var smartInputCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                Image(systemName: "sparkles")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(store.selectedTheme.accentColor)
                TextField("Tambah cepat: Kuis @IF2110 besok 14:00 !tinggi ~2p !memory", text: $smartInput)
                    .font(AppFont.subheadline())
                    .submitLabel(.done)
                    .onSubmit(submitSmartTask)

                if !smartInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    Button(action: submitSmartTask) {
                        Text("Tambah")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(store.selectedTheme.accentColor)
                            .cornerRadius(7)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Theme.surfaceBg)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Theme.borderCrisp, lineWidth: 1)
            )
            .cornerRadius(12)

            if let preview = smartPreview {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        if let course = store.course(for: preview.courseId) {
                            chipTag(text: course.code.isEmpty ? course.name : course.code, tint: course.accentColor)
                        } else {
                            chipTag(text: preview.listId.capitalized, tint: store.selectedTheme.accentColor)
                        }
                        chipTag(text: "Prioritas \(preview.priority.rawValue)", tint: preview.priority.color)
                        chipTag(text: "~\(preview.estimatedPomos)p", tint: Theme.inkSecondary)
                        if preview.repeatRule == .ebbinghaus {
                            chipTag(text: "Memory Curve", tint: Theme.matchaGreen)
                        }
                        ForEach(preview.tags, id: \.self) { tag in
                            chipTag(text: "#\(tag)", tint: Theme.inkMuted)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Signature Interactive Time-Gap Ribbon (Smart Gap™)
    private var timeGapRibbonCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Time-Gap Ribbon")
                        .font(AppFont.headline())
                        .foregroundColor(Theme.inkPrimary)
                    Text("Deteksi celah kosong 08:00 - 21:30 antara kelas")
                        .font(AppFont.caption())
                        .foregroundColor(Theme.inkSecondary)
                }
                Spacer()
                Text("\(todayGaps.count) celah")
                    .font(AppFont.monoTag())
                    .foregroundColor(store.selectedTheme.accentColor)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Theme.subtleBg)
                    .cornerRadius(6)
            }

            // Proportional 08:00 (480) to 21:30 (1290) Visual Ribbon
            GeometryReader { geo in
                let totalSpan: CGFloat = 1290 - 480
                let w = max(1, geo.size.width)
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Theme.subtleBg)
                        .frame(height: 16)

                    ForEach(todayGaps) { gap in
                        let startFrac = max(0, CGFloat(gap.startMinutes - 480) / totalSpan)
                        let spanFrac = max(0.02, CGFloat(gap.durationMinutes) / totalSpan)
                        RoundedRectangle(cornerRadius: 4)
                            .stroke(store.selectedTheme.accentColor.opacity(0.65), style: StrokeStyle(lineWidth: 1, dash: [3, 2]))
                            .background(
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(store.selectedTheme.accentColor.opacity(0.10))
                            )
                            .frame(width: w * spanFrac, height: 16)
                            .offset(x: w * startFrac)
                    }

                    ForEach(todayCourses) { course in
                        let clampedStart = max(480, course.startMinutes)
                        let clampedEnd = min(1290, course.endMinutes)
                        if clampedEnd > clampedStart {
                            let startFrac = CGFloat(clampedStart - 480) / totalSpan
                            let spanFrac = CGFloat(clampedEnd - clampedStart) / totalSpan
                            RoundedRectangle(cornerRadius: 4)
                                .fill(course.accentColor)
                                .frame(width: max(6, w * spanFrac), height: 16)
                                .offset(x: w * startFrac)
                        }
                    }
                }
            }
            .frame(height: 16)

            HStack {
                Text("08:00")
                Spacer()
                Text("12:30")
                Spacer()
                Text("17:00")
                Spacer()
                Text("21:30")
            }
            .font(.system(size: 10, design: .monospaced))
            .foregroundColor(Theme.inkMuted)

            if let primaryGap = todayGaps.first {
                Divider()
                HStack(alignment: .center, spacing: 10) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Rekomendasi Smart Gap • \(primaryGap.timeRangeFormatted) (\(primaryGap.durationMinutes) mnt)")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(store.selectedTheme.accentColor)

                        if let recId = primaryGap.recommendedTaskId,
                           let rec = store.assignments.first(where: { $0.id == recId }) {
                            Text(rec.title)
                                .font(AppFont.subheadline())
                                .foregroundColor(Theme.inkPrimary)
                                .lineLimit(1)
                        } else {
                            Text("Semua tugas terjadwal rapi atau belum ada backlog aktif.")
                                .font(AppFont.caption())
                                .foregroundColor(Theme.inkSecondary)
                        }
                    }
                    Spacer()

                    if let recId = primaryGap.recommendedTaskId,
                       let rec = store.assignments.first(where: { $0.id == recId }) {
                        Button("Plot & Fokus") {
                            let dur = min(primaryGap.durationMinutes, max(25, rec.estimatedPomos * store.pomoDurationMinutes))
                            store.scheduleTaskToGap(
                                taskId: rec.id,
                                startMinutes: primaryGap.startMinutes,
                                endMinutes: primaryGap.startMinutes + dur
                            )
                            store.setFocusTarget(assignment: rec)
                            onOpenPomoFlow?()
                        }
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(store.selectedTheme.accentColor)
                        .cornerRadius(8)
                        .buttonStyle(.plain)
                    }
                }
            }
        }
        .padding(14)
        .background(Theme.surfaceBg)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Theme.borderCrisp, lineWidth: 1)
        )
        .cornerRadius(14)
    }

    // MARK: - Pinned Countdowns
    private var pinnedCountdownsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Hitung Mundur Tersemat")
                .font(AppFont.caption())
                .foregroundColor(Theme.inkSecondary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(pinnedCountdowns) { item in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(Color(hex: item.colorHex))
                                    .frame(width: 7, height: 7)
                                Text(item.category)
                                    .font(.system(size: 10, weight: .semibold))
                                    .foregroundColor(Theme.inkSecondary)
                                Spacer()
                                Text(countdownLabel(days: item.daysRemaining))
                                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                                    .foregroundColor(item.daysRemaining <= 3 ? Theme.signalRed : Color(hex: item.colorHex))
                            }
                            Text(item.title)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(Theme.inkPrimary)
                                .lineLimit(1)
                        }
                        .padding(10)
                        .frame(width: 210, alignment: .leading)
                        .background(Theme.surfaceBg)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Theme.borderCrisp, lineWidth: 1)
                        )
                        .cornerRadius(12)
                    }
                }
            }
        }
    }

    // MARK: - Mode Switcher
    private var modeSwitcherHeader: some View {
        HStack {
            Text("Daftar Eksekusi")
                .font(AppFont.headline())
                .foregroundColor(Theme.inkPrimary)
            Spacer()
            Picker("Mode Tampilan", selection: $viewMode) {
                ForEach(TodayViewMode.allCases) { mode in
                    Text(mode.rawValue).tag(mode)
                }
            }
            .pickerStyle(.segmented)
            .frame(width: 160)
        }
    }

    // MARK: - List View
    private var listModeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            if store.activeAssignments.isEmpty {
                EmptyStateView(
                    icon: "checkmark.circle",
                    title: "Semua tugas beres",
                    subtitle: "Ketik di kotak tambah cepat atau ketuk + untuk agenda baru."
                )
                .background(Theme.surfaceBg)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Theme.borderCrisp, lineWidth: 1)
                )
                .cornerRadius(14)
            } else {
                VStack(spacing: 8) {
                    ForEach(store.activeAssignments) { task in
                        AssignmentRow(
                            assignment: task,
                            course: store.course(for: task.courseId),
                            onToggle: {
                                withAnimation(.spring(response: 0.28, dampingFraction: 0.85)) {
                                    store.toggleAssignmentCompletion(id: task.id)
                                }
                            }
                        )
                        .contentShape(Rectangle())
                        .onTapGesture {
                            selectedAssignmentId = task.id
                        }
                        .contextMenu {
                            Button {
                                store.toggleAssignmentCompletion(id: task.id)
                            } label: {
                                Label("Tandai Selesai", systemImage: "checkmark.circle")
                            }
                            Button {
                                store.setFocusTarget(assignment: task)
                                onOpenPomoFlow?()
                            } label: {
                                Label("Mulai PomoFlow", systemImage: "timer")
                            }
                            Button {
                                store.markAssignmentWontDo(id: task.id)
                            } label: {
                                Label("Won't Do (Batalkan)", systemImage: "nosign")
                            }
                            Button(role: .destructive) {
                                store.deleteAssignment(id: task.id)
                            } label: {
                                Label("Hapus Tugas", systemImage: "trash")
                            }
                        }
                    }
                }
            }

            let closedCount = store.completedAssignments.count + store.wontDoAssignments.count
            if closedCount > 0 {
                DisclosureGroup(isExpanded: $showHistory) {
                    VStack(spacing: 8) {
                        ForEach(store.completedAssignments + store.wontDoAssignments) { task in
                            AssignmentRow(
                                assignment: task,
                                course: store.course(for: task.courseId),
                                onToggle: {
                                    if task.status == .wontDo {
                                        store.markAssignmentWontDo(id: task.id)
                                    } else {
                                        store.toggleAssignmentCompletion(id: task.id)
                                    }
                                }
                            )
                            .opacity(task.status == .wontDo ? 0.65 : 0.85)
                            .onTapGesture {
                                selectedAssignmentId = task.id
                            }
                        }
                    }
                    .padding(.top, 8)
                } label: {
                    Text("Selesai & Won't Do (\(closedCount))")
                        .font(AppFont.caption())
                        .foregroundColor(Theme.inkSecondary)
                }
                .padding(12)
                .background(Theme.surfaceBg)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Theme.borderCrisp, lineWidth: 1)
                )
                .cornerRadius(12)
            }
        }
    }

    // MARK: - Kanban View
    private var kanbanModeSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 12) {
                ForEach(KanbanColumn.allCases) { col in
                    kanbanColumnView(for: col)
                }
            }
        }
    }

    private func tasksForKanbanColumn(_ col: KanbanColumn) -> [Assignment] {
        store.assignments.filter { task in
            guard task.status != .wontDo else { return false }
            if col == .done {
                return task.status == .completed || task.kanbanColumn == .done
            }
            return task.status == .active && task.kanbanColumn == col
        }
    }

    private func kanbanColumnView(for col: KanbanColumn) -> some View {
        let columnTasks = tasksForKanbanColumn(col)
        return VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(col.title)
                    .font(AppFont.subheadline())
                    .foregroundColor(Theme.inkPrimary)
                Spacer()
                Text("\(columnTasks.count)")
                    .font(AppFont.monoTag())
                    .foregroundColor(Theme.inkSecondary)
            }

            if columnTasks.isEmpty {
                Text("Kosong")
                    .font(AppFont.caption())
                    .foregroundColor(Theme.inkMuted)
                    .frame(maxWidth: .infinity, minHeight: 72)
            } else {
                ForEach(columnTasks) { task in
                    kanbanCardView(for: task)
                }
            }
        }
        .padding(12)
        .frame(width: 245, alignment: .topLeading)
        .background(Theme.surfaceBg)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Theme.borderCrisp, lineWidth: 1)
        )
        .cornerRadius(14)
    }

    private func kanbanCardView(for task: Assignment) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(task.title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(Theme.inkPrimary)
                    .strikethrough(task.isCompleted)
                    .lineLimit(2)
                Spacer()
                Menu {
                    ForEach(KanbanColumn.allCases) { targetCol in
                        Button("Pindah ke \(targetCol.title)") {
                            moveTask(task, to: targetCol)
                        }
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundColor(Theme.inkMuted)
                        .padding(4)
                }
            }

            HStack(spacing: 6) {
                if let c = store.course(for: task.courseId) {
                    Text(c.code.isEmpty ? c.name : c.code)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(c.accentColor)
                }
                Text(task.remainingTimeFormatted)
                    .font(.system(size: 10))
                    .foregroundColor(task.isOverdue ? Theme.signalRed : Theme.inkSecondary)
                Spacer()
                Text("\(task.progress)%")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(Theme.inkMuted)
            }
        }
        .padding(10)
        .background(Theme.subtleBg)
        .cornerRadius(10)
        .onTapGesture {
            selectedAssignmentId = task.id
        }
    }

    // MARK: - Helpers
    private func submitSmartTask() {
        let trimmed = smartInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        _ = store.addSmartTask(from: trimmed)
        smartInput = ""
    }

    private func moveTask(_ task: Assignment, to col: KanbanColumn) {
        var updated = task
        updated.kanbanColumn = col
        if col == .done {
            updated.status = .completed
            updated.isCompleted = true
            updated.progress = 100
        } else {
            updated.status = .active
            updated.isCompleted = false
            if col == .inProgress && updated.progress == 0 {
                updated.progress = 35
            } else if col == .review && updated.progress < 75 {
                updated.progress = 80
            }
        }
        store.updateAssignment(updated)
    }

    private func countdownLabel(days: Int) -> String {
        if days == 0 { return "Hari Ini" }
        if days > 0 { return "H-\(days)" }
        return "H+\(abs(days))"
    }

    private func chipTag(text: String, tint: Color) -> some View {
        Text(text)
            .font(.system(size: 11, weight: .medium))
            .foregroundColor(tint)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(tint.opacity(0.1))
            .cornerRadius(6)
    }
}

private struct SelectedTaskID: Identifiable {
    let id: UUID
}

import SwiftUI

public struct AssignmentsView: View {
    @EnvironmentObject private var store: ScheduleStore

    public var onOpenPomoFlow: (() -> Void)?

    @State private var hubMode: HubMode = .matrix
    @State private var showAddAssignment: Bool = false
    @State private var showAddHabit: Bool = false
    @State private var selectedAssignmentId: UUID? = nil

    public enum HubMode: String, CaseIterable, Identifiable {
        case matrix = "Matriks"
        case habits = "Habit Streak-Safe"
        public var id: String { rawValue }
    }

    public init(onOpenPomoFlow: (() -> Void)? = nil) {
        self.onOpenPomoFlow = onOpenPomoFlow
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                Picker("Mode", selection: $hubMode) {
                    ForEach(HubMode.allCases) { m in
                        Text(m.rawValue).tag(m)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)
                .padding(.top, 8)

                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        if hubMode == .matrix {
                            eisenhowerMatrixSection
                        } else {
                            streakSafeHabitsSection
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 24)
                }
            }
            .background(Theme.canvasBg.ignoresSafeArea())
            .navigationTitle(hubMode == .matrix ? "Matriks Eisenhower" : "Habit Streak-Safe")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        if hubMode == .matrix {
                            showAddAssignment = true
                        } else {
                            showAddHabit = true
                        }
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .accessibilityLabel(hubMode == .matrix ? "Tambah Tugas" : "Tambah Habit")
                }
            }
            .sheet(isPresented: $showAddAssignment) {
                AddAssignmentSheet()
            }
            .sheet(isPresented: $showAddHabit) {
                AddHabitSheet()
            }
            .sheet(item: Binding(
                get: { selectedAssignmentId.map { MatrixTaskSelection(id: $0) } },
                set: { selectedAssignmentId = $0?.id }
            )) { wrapper in
                TaskDetailSheet(assignmentId: wrapper.id, onOpenPomoFlow: onOpenPomoFlow)
            }
        }
    }

    // MARK: - Eisenhower Matrix (Q1 - Q4)
    private var eisenhowerMatrixSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(EisenhowerQuadrant.allCases) { quadrant in
                let tasks = store.assignments(in: quadrant)
                let tint = quadrantTint(quadrant)

                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 8) {
                        Text(quadrant.rawValue)
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundColor(.white)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 3)
                            .background(tint)
                            .cornerRadius(6)

                        Text(quadrant.title)
                            .font(AppFont.headline())
                            .foregroundColor(Theme.inkPrimary)

                        Spacer()

                        Text("\(tasks.count)")
                            .font(AppFont.monoTag())
                            .foregroundColor(Theme.inkSecondary)
                    }

                    if tasks.isEmpty {
                        Text("Tidak ada tugas di kuadran \(quadrant.rawValue).")
                            .font(AppFont.caption())
                            .foregroundColor(Theme.inkMuted)
                            .padding(.vertical, 6)
                    } else {
                        VStack(spacing: 8) {
                            ForEach(tasks) { task in
                                AssignmentRow(
                                    assignment: task,
                                    course: store.course(for: task.courseId),
                                    onToggle: {
                                        withAnimation(.spring(response: 0.28, dampingFraction: 0.85)) {
                                            store.toggleAssignmentCompletion(id: task.id)
                                        }
                                    }
                                )
                                .onTapGesture {
                                    selectedAssignmentId = task.id
                                }
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
        }
    }

    private func quadrantTint(_ quadrant: EisenhowerQuadrant) -> Color {
        switch quadrant {
        case .q1: return Theme.signalRed
        case .q2: return store.selectedTheme.accentColor
        case .q3: return Theme.amberWarning
        case .q4: return Theme.inkMuted
        }
    }

    // MARK: - Streak-Safe Habit Tracker
    private var streakSafeHabitsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            if store.habits.isEmpty {
                EmptyStateView(
                    icon: "flame",
                    title: "Belum ada kebiasaan aktif",
                    subtitle: "Ketuk + di kanan atas untuk membangun rutinitas harian dengan izin Streak-Safe."
                )
                .background(Theme.surfaceBg)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Theme.borderCrisp, lineWidth: 1)
                )
                .cornerRadius(14)
            } else {
                let todayKey = ScheduleStore.todayDateKey()

                ForEach(HabitSection.allCases) { section in
                    let sectionHabits = store.habits.filter { $0.section == section }
                    if !sectionHabits.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(section.title)
                                .font(AppFont.caption())
                                .foregroundColor(Theme.inkSecondary)

                            ForEach(sectionHabits) { habit in
                                habitCard(habit: habit, todayKey: todayKey)
                            }
                        }
                    }
                }
            }
        }
    }

    private func habitCard(habit: Habit, todayKey: String) -> some View {
        let log = habit.logs[todayKey]
        let currentVal = log?.value ?? 0
        let isDone = log?.status == .done
        let isSkipped = log?.status == .skip
        let accent = Color(hex: habit.colorHex)

        return VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 10) {
                Circle()
                    .fill(accent)
                    .frame(width: 10, height: 10)
                    .padding(.top, 5)

                VStack(alignment: .leading, spacing: 3) {
                    Text(habit.name)
                        .font(AppFont.headline())
                        .foregroundColor(Theme.inkPrimary)

                    if !habit.encouragement.isEmpty {
                        Text(habit.encouragement)
                            .font(AppFont.caption())
                            .foregroundColor(Theme.inkSecondary)
                            .lineLimit(2)
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(habit.currentStreak) hari")
                        .font(.system(size: 12, weight: .semibold, design: .monospaced))
                        .foregroundColor(accent)
                    Text("Rekor \(habit.longestStreak)")
                        .font(.system(size: 10))
                        .foregroundColor(Theme.inkMuted)
                }
            }

            HStack(spacing: 8) {
                ProgressView(value: Double(min(currentVal, habit.goal)), total: Double(max(1, habit.goal)))
                    .tint(isSkipped ? Theme.inkMuted : accent)

                Text("\(currentVal)/\(habit.goal) \(habit.unit)")
                    .font(AppFont.monoTag())
                    .foregroundColor(Theme.inkSecondary)
            }

            HStack(spacing: 8) {
                if isDone {
                    Label("Tercapai Hari Ini", systemImage: "checkmark.circle.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Theme.matchaGreen)
                } else if isSkipped {
                    Label("Izin • Streak Aman", systemImage: "shield.checkmark.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Theme.amberWarning)
                }

                Spacer()

                if !isDone && !isSkipped {
                    Button {
                        store.skipHabitToday(id: habit.id)
                    } label: {
                        Text("Izin")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Theme.inkSecondary)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Theme.subtleBg)
                            .cornerRadius(8)
                    }
                    .buttonStyle(.plain)

                    Button {
                        store.checkInHabit(id: habit.id, increment: 1)
                    } label: {
                        Text(habit.goal > 1 ? "+1 \(habit.unit)" : "Check-in")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(accent)
                            .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
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
        .contextMenu {
            Button(role: .destructive) {
                store.deleteHabit(id: habit.id)
            } label: {
                Label("Hapus Kebiasaan", systemImage: "trash")
            }
        }
    }
}

private struct MatrixTaskSelection: Identifiable {
    let id: UUID
}

// MARK: - Reusable Task Detail & Checklist Sheet
public struct TaskDetailSheet: View {
    @EnvironmentObject private var store: ScheduleStore
    @Environment(\.dismiss) private var dismiss

    public let assignmentId: UUID
    public var onOpenPomoFlow: (() -> Void)?

    @State private var title: String = ""
    @State private var notes: String = ""
    @State private var priority: Priority = .medium
    @State private var kanbanColumn: KanbanColumn = .todo
    @State private var repeatRule: RecurrenceRule = .none
    @State private var dueDate: Date = Date()
    @State private var progress: Double = 0
    @State private var isPinned: Bool = false
    @State private var newChecklistTitle: String = ""
    @State private var showFullEdit: Bool = false

    public init(assignmentId: UUID, onOpenPomoFlow: (() -> Void)? = nil) {
        self.assignmentId = assignmentId
        self.onOpenPomoFlow = onOpenPomoFlow
    }

    private var currentTask: Assignment? {
        store.assignments.first(where: { $0.id == assignmentId })
    }

    public var body: some View {
        NavigationStack {
            if let task = currentTask {
                Form {
                    Section("Ringkasan Tugas") {
                        TextField("Judul Tugas", text: $title)
                            .onSubmit(persistEdits)

                        Toggle("Sematkan Prioritas Atas", isOn: $isPinned)
                            .onChange(of: isPinned) { _ in persistEdits() }

                        DatePicker("Tenggat Waktu", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                            .onChange(of: dueDate) { _ in persistEdits() }

                        Picker("Prioritas", selection: $priority) {
                            ForEach(Priority.allCases) { p in
                                Text(p.rawValue).tag(p)
                            }
                        }
                        .onChange(of: priority) { _ in persistEdits() }

                        Picker("Kolom Kanban", selection: $kanbanColumn) {
                            ForEach(KanbanColumn.allCases) { col in
                                Text(col.title).tag(col)
                            }
                        }
                        .onChange(of: kanbanColumn) { _ in persistEdits() }

                        Picker("Repetisi", selection: $repeatRule) {
                            ForEach(RecurrenceRule.allCases) { r in
                                Text(r.localizedLabel).tag(r)
                            }
                        }
                        .onChange(of: repeatRule) { _ in persistEdits() }
                    }

                    Section("Progres Eksekusi (\(Int(progress))%)") {
                        Slider(value: $progress, in: 0...100, step: 5)
                            .tint(store.selectedTheme.accentColor)
                            .onChange(of: progress) { _ in persistEdits() }

                        HStack {
                            Text("Estimasi: \(task.estimatedPomos)p")
                            Spacer()
                            Text("Terekam: \(task.completedPomos)p (\(task.focusMinutes) mnt)")
                        }
                        .font(AppFont.caption())
                        .foregroundColor(Theme.inkSecondary)

                        Button {
                            store.setFocusTarget(assignment: task)
                            dismiss()
                            onOpenPomoFlow?()
                        } label: {
                            Label("Mulai PomoFlow untuk Tugas Ini", systemImage: "timer")
                                .fontWeight(.semibold)
                                .foregroundColor(store.selectedTheme.accentColor)
                        }
                    }

                    Section("Sub-Checklist (\(task.checklistItems.filter(\.isCompleted).count)/\(task.checklistItems.count))") {
                        ForEach(task.checklistItems) { item in
                            Button {
                                store.toggleChecklistItem(assignmentId: assignmentId, itemId: item.id)
                                if let refreshed = currentTask {
                                    progress = Double(refreshed.progress)
                                }
                            } label: {
                                HStack {
                                    Image(systemName: item.isCompleted ? "checkmark.square.fill" : "square")
                                        .foregroundColor(item.isCompleted ? Theme.matchaGreen : Theme.inkMuted)
                                    Text(item.title)
                                        .foregroundColor(item.isCompleted ? Theme.inkMuted : Theme.inkPrimary)
                                        .strikethrough(item.isCompleted)
                                }
                            }
                            .buttonStyle(.plain)
                        }

                        HStack {
                            TextField("Tambah langkah kecil...", text: $newChecklistTitle)
                                .submitLabel(.done)
                                .onSubmit(appendChecklist)
                            Button("Tambah", action: appendChecklist)
                                .disabled(newChecklistTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        }
                    }

                    Section("Catatan") {
                        TextField("Catatan tugas...", text: $notes, axis: .vertical)
                            .lineLimit(3...6)
                    }

                    Section {
                        Button(task.status == .completed ? "Buka Kembali Tugas" : "Tandai Selesai") {
                            persistEdits()
                            store.toggleAssignmentCompletion(id: assignmentId)
                            dismiss()
                        }
                        .foregroundColor(Theme.matchaGreen)

                        Button(task.status == .wontDo ? "Aktifkan Kembali" : "Tandai Won't Do") {
                            store.markAssignmentWontDo(id: assignmentId)
                            dismiss()
                        }
                        .foregroundColor(Theme.amberWarning)

                        Button("Edit Lengkap di Formulir") {
                            showFullEdit = true
                        }

                        Button("Hapus Tugas", role: .destructive) {
                            store.deleteAssignment(id: assignmentId)
                            dismiss()
                        }
                    }
                }
                .navigationTitle("Inspektur Tugas")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Simpan") {
                            persistEdits()
                            dismiss()
                        }
                        .fontWeight(.semibold)
                    }
                }
                .onAppear {
                    syncFromStore(task)
                }
                .sheet(isPresented: $showFullEdit) {
                    AddAssignmentSheet(assignmentToEdit: task)
                }
            } else {
                Text("Tugas tidak ditemukan.")
                    .font(AppFont.body())
                    .foregroundColor(Theme.inkSecondary)
            }
        }
    }

    private func syncFromStore(_ task: Assignment) {
        title = task.title
        notes = task.notes
        priority = task.priority
        kanbanColumn = task.kanbanColumn
        repeatRule = task.repeatRule
        dueDate = task.dueDate
        progress = Double(task.progress)
        isPinned = task.isPinned
    }

    private func persistEdits() {
        guard var updated = currentTask else { return }
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmedTitle.isEmpty { updated.title = trimmedTitle }
        updated.notes = notes.trimmingCharacters(in: .whitespacesAndNewlines)
        updated.priority = priority
        updated.kanbanColumn = kanbanColumn
        updated.repeatRule = repeatRule
        updated.dueDate = dueDate
        updated.progress = Int(progress)
        updated.isPinned = isPinned
        if kanbanColumn == .done && updated.status != .completed {
            updated.status = .completed
            updated.isCompleted = true
            updated.progress = 100
        }
        store.updateAssignment(updated)
    }

    private func appendChecklist() {
        let trimmed = newChecklistTitle.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        store.addChecklistItem(assignmentId: assignmentId, title: trimmed)
        newChecklistTitle = ""
    }
}

// MARK: - Add Habit Sheet
private struct AddHabitSheet: View {
    @EnvironmentObject private var store: ScheduleStore
    @Environment(\.dismiss) private var dismiss

    @State private var name: String = ""
    @State private var section: HabitSection = .morning
    @State private var goal: Int = 1
    @State private var unit: String = "kali"
    @State private var encouragement: String = ""
    @State private var colorHex: String = "4772FA"

    private let palette = ["4772FA", "247B50", "0284C7", "D97706", "0F766E", "8C5A32"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Identitas Kebiasaan") {
                    TextField("Nama kebiasaan (cth: Review Catatan)", text: $name)
                    Picker("Waktu Rutinitas", selection: $section) {
                        ForEach(HabitSection.allCases) { sec in
                            Text(sec.title).tag(sec)
                        }
                    }
                    Stepper("Target Harian: \(goal)", value: $goal, in: 1...30)
                    TextField("Satuan (cth: menit, gelas, halaman)", text: $unit)
                }

                Section("Motivasi Singkat") {
                    TextField("Catatan penyemangat saat lelah...", text: $encouragement)
                }

                Section("Warna") {
                    HStack(spacing: 14) {
                        ForEach(palette, id: \.self) { hex in
                            Button {
                                colorHex = hex
                            } label: {
                                Circle()
                                    .fill(Color(hex: hex))
                                    .frame(width: 28, height: 28)
                                    .overlay(
                                        Circle()
                                            .stroke(Theme.inkPrimary, lineWidth: colorHex == hex ? 2.5 : 0)
                                            .padding(-3)
                                    )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Kebiasaan Baru")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Batal") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Simpan") {
                        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        let newHabit = Habit(
                            name: trimmed,
                            colorHex: colorHex,
                            section: section,
                            goal: goal,
                            unit: unit.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "kali" : unit.trimmingCharacters(in: .whitespacesAndNewlines),
                            encouragement: encouragement.trimmingCharacters(in: .whitespacesAndNewlines)
                        )
                        store.addHabit(newHabit)
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

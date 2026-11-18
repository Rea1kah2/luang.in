import SwiftUI

public struct AddAssignmentSheet: View {
    @EnvironmentObject private var store: ScheduleStore
    @Environment(\.dismiss) private var dismiss

    public var assignmentToEdit: Assignment?
    public var initialCourseId: UUID?

    @State private var title: String = ""
    @State private var listId: String = "kuliah"
    @State private var selectedCourseId: UUID? = nil
    @State private var dueDate: Date = Date().addingTimeInterval(3600 * 24)
    @State private var priority: Priority = .medium
    @State private var repeatRule: RecurrenceRule = .none
    @State private var estimatedPomos: Int = 1
    @State private var tagsText: String = ""
    @State private var isPinned: Bool = false
    @State private var notes: String = ""

    private let listOptions: [(id: String, label: String)] = [
        ("kuliah", "Kuliah"),
        ("organisasi", "Organisasi"),
        ("pribadi", "Pribadi"),
        ("inbox", "Kotak Masuk")
    ]

    public init(assignmentToEdit: Assignment? = nil, initialCourseId: UUID? = nil) {
        self.assignmentToEdit = assignmentToEdit
        self.initialCourseId = initialCourseId
    }

    private var isFormValid: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    public var body: some View {
        NavigationStack {
            Form {
                Section("Detail Tugas") {
                    TextField("Judul tugas atau agenda...", text: $title)
                    Picker("Daftar", selection: $listId) {
                        ForEach(listOptions, id: \.id) { opt in
                            Text(opt.label).tag(opt.id)
                        }
                    }
                    Picker("Mata Kuliah (Opsional)", selection: $selectedCourseId) {
                        Text("Tanpa Mata Kuliah").tag(UUID?.none)
                        ForEach(store.courses) { course in
                            let prefix = course.code.isEmpty ? "" : "\(course.code) - "
                            Text("\(prefix)\(course.name)").tag(UUID?.some(course.id))
                        }
                    }
                    Toggle("Sematkan di Atas", isOn: $isPinned)
                }

                Section("Tenggat & Prioritas") {
                    DatePicker("Deadline", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])

                    Picker("Prioritas", selection: $priority) {
                        ForEach(Priority.allCases) { p in
                            Text(p.rawValue).tag(p)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Repetisi & Estimasi Pomo") {
                    Picker("Pola Pengulangan", selection: $repeatRule) {
                        ForEach(RecurrenceRule.allCases) { rule in
                            Text(rule.localizedLabel).tag(rule)
                        }
                    }

                    if repeatRule == .ebbinghaus {
                        Label(
                            "Memory Curve™ akan menjadwalkan review otomatis H+1, H+2, H+4, H+7, dan H+15 setelah selesai.",
                            systemImage: "brain.head.profile"
                        )
                        .font(AppFont.caption())
                        .foregroundColor(Theme.classicBlue)
                    }

                    Stepper("Estimasi Fokus: \(estimatedPomos) Pomodoro (\(estimatedPomos * store.pomoDurationMinutes) mnt)",
                            value: $estimatedPomos, in: 1...12)
                }

                Section("Tag & Catatan") {
                    TextField("Tag (pisahkan koma, cth: praktikum, kuis)", text: $tagsText)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    TextField("Catatan tambahan, tautan referensi, atau rubrik...", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle(assignmentToEdit == nil ? "Tugas Baru" : "Edit Tugas")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Batal") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Simpan") {
                        saveAssignment()
                    }
                    .disabled(!isFormValid)
                    .fontWeight(.semibold)
                }
            }
            .onAppear(perform: populateInitialValues)
        }
    }

    private func populateInitialValues() {
        if let existing = assignmentToEdit {
            title = existing.title
            listId = existing.listId
            selectedCourseId = existing.courseId
            dueDate = existing.dueDate
            priority = existing.priority
            repeatRule = existing.repeatRule
            estimatedPomos = existing.estimatedPomos
            tagsText = existing.tags.joined(separator: ", ")
            isPinned = existing.isPinned
            notes = existing.notes
        } else {
            selectedCourseId = initialCourseId
        }
    }

    private func saveAssignment() {
        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let parsedTags = tagsText
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() }
            .filter { !$0.isEmpty }

        if var existing = assignmentToEdit {
            existing.title = trimmed
            existing.listId = listId
            existing.courseId = selectedCourseId
            existing.dueDate = dueDate
            existing.priority = priority
            existing.repeatRule = repeatRule
            existing.estimatedPomos = estimatedPomos
            existing.tags = parsedTags
            existing.isPinned = isPinned
            existing.notes = notes.trimmingCharacters(in: .whitespacesAndNewlines)
            store.updateAssignment(existing)
        } else {
            let newTask = Assignment(
                listId: listId,
                courseId: selectedCourseId,
                title: trimmed,
                dueDate: dueDate,
                priority: priority,
                isPinned: isPinned,
                repeatRule: repeatRule,
                tags: parsedTags,
                estimatedPomos: estimatedPomos,
                notes: notes.trimmingCharacters(in: .whitespacesAndNewlines)
            )
            store.addAssignment(newTask)
        }
        dismiss()
    }
}

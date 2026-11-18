import SwiftUI

public struct AddCourseSheet: View {
    @EnvironmentObject private var store: ScheduleStore
    @Environment(\.dismiss) private var dismiss

    public var courseToEdit: Course?

    @State private var name: String = ""
    @State private var code: String = ""
    @State private var lecturer: String = ""
    @State private var room: String = ""
    @State private var credits: Int = 3
    @State private var dayOfWeek: DayOfWeek = .monday
    @State private var startTimeDate: Date = Self.dateFrom(minutes: 8 * 60)
    @State private var endTimeDate: Date = Self.dateFrom(minutes: 10 * 60)
    @State private var colorHex: String = "4772FA"

    private let palette: [String] = [
        "4772FA", "0F766E", "247B50", "D97706", "C4242A", "0284C7", "8C5A32"
    ]

    public init(courseToEdit: Course? = nil) {
        self.courseToEdit = courseToEdit
    }

    private var startMinutes: Int {
        Self.minutesFrom(date: startTimeDate)
    }

    private var endMinutes: Int {
        Self.minutesFrom(date: endTimeDate)
    }

    private var isTimeValid: Bool {
        endMinutes > startMinutes
    }

    private var isFormValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && isTimeValid
    }

    public var body: some View {
        NavigationStack {
            Form {
                Section("Identitas Mata Kuliah") {
                    TextField("Nama Mata Kuliah (cth: Algoritma)", text: $name)
                    HStack {
                        TextField("Kode (cth: IF2110)", text: $code)
                            .textInputAutocapitalization(.characters)
                        Divider()
                        Stepper("\(credits) SKS", value: $credits, in: 1...6)
                    }
                    TextField("Dosen Pengampu", text: $lecturer)
                    TextField("Ruangan / Link Kelas", text: $room)
                }

                Section("Jadwal & Waktu") {
                    Picker("Hari", selection: $dayOfWeek) {
                        ForEach(DayOfWeek.allCases) { day in
                            Text(day.localizedName).tag(day)
                        }
                    }

                    DatePicker("Jam Mulai", selection: $startTimeDate, displayedComponents: .hourAndMinute)
                    DatePicker("Jam Selesai", selection: $endTimeDate, displayedComponents: .hourAndMinute)

                    if !isTimeValid {
                        Label("Jam selesai harus lebih lambat dari jam mulai.", systemImage: "exclamationmark.triangle.fill")
                            .font(AppFont.caption())
                            .foregroundColor(Theme.signalRed)
                    }
                }

                Section("Warna Identitas") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 12) {
                        ForEach(palette, id: \.self) { hex in
                            Button {
                                colorHex = hex
                            } label: {
                                Circle()
                                    .fill(Color(hex: hex))
                                    .frame(width: 30, height: 30)
                                    .overlay(
                                        Circle()
                                            .stroke(Theme.inkPrimary, lineWidth: colorHex == hex ? 2.5 : 0)
                                            .padding(-3)
                                    )
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("Warna \(hex)")
                        }
                    }
                    .padding(.vertical, 6)
                }
            }
            .navigationTitle(courseToEdit == nil ? "Tambah Mata Kuliah" : "Edit Mata Kuliah")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Batal") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Simpan") {
                        saveCourse()
                    }
                    .disabled(!isFormValid)
                    .fontWeight(.semibold)
                }
            }
            .onAppear(perform: populateInitialValues)
        }
    }

    private func populateInitialValues() {
        guard let course = courseToEdit else { return }
        name = course.name
        code = course.code
        lecturer = course.lecturer
        room = course.room
        credits = course.credits
        dayOfWeek = course.dayOfWeek
        startTimeDate = Self.dateFrom(minutes: Course.parseMinutes(course.startTime))
        endTimeDate = Self.dateFrom(minutes: Course.parseMinutes(course.endTime))
        colorHex = course.colorHex
    }

    private func saveCourse() {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty, isTimeValid else { return }

        let startStr = SmartGapSlot.formatMinutes(startMinutes)
        let endStr = SmartGapSlot.formatMinutes(endMinutes)

        if let existing = courseToEdit {
            let updated = Course(
                id: existing.id,
                name: trimmedName,
                code: code.trimmingCharacters(in: .whitespacesAndNewlines).uppercased(),
                lecturer: lecturer.trimmingCharacters(in: .whitespacesAndNewlines),
                room: room.trimmingCharacters(in: .whitespacesAndNewlines),
                credits: credits,
                dayOfWeek: dayOfWeek,
                startTime: startStr,
                endTime: endStr,
                colorHex: colorHex
            )
            store.updateCourse(updated)
        } else {
            let newCourse = Course(
                name: trimmedName,
                code: code.trimmingCharacters(in: .whitespacesAndNewlines).uppercased(),
                lecturer: lecturer.trimmingCharacters(in: .whitespacesAndNewlines),
                room: room.trimmingCharacters(in: .whitespacesAndNewlines),
                credits: credits,
                dayOfWeek: dayOfWeek,
                startTime: startStr,
                endTime: endStr,
                colorHex: colorHex
            )
            store.addCourse(newCourse)
        }
        dismiss()
    }

    private static func minutesFrom(date: Date) -> Int {
        let comps = Calendar.current.dateComponents([.hour, .minute], from: date)
        return (comps.hour ?? 0) * 60 + (comps.minute ?? 0)
    }

    private static func dateFrom(minutes: Int) -> Date {
        let cal = Calendar.current
        return cal.date(bySettingHour: minutes / 60, minute: minutes % 60, second: 0, of: Date()) ?? Date()
    }
}

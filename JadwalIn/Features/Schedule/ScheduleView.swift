import SwiftUI

public struct ScheduleView: View {
    @EnvironmentObject private var store: ScheduleStore

    @State private var mode: ScheduleMode = .weekly
    @State private var selectedDay: DayOfWeek = DayOfWeek.from(date: Date())
    @State private var showAddCourse: Bool = false
    @State private var courseToEdit: Course? = nil
    @State private var gapToArrange: SmartGapSlot? = nil

    public enum ScheduleMode: String, CaseIterable, Identifiable {
        case weekly = "Mingguan"
        case timeBlock = "Blok Harian"
        public var id: String { rawValue }
    }

    public init() {}

    private var totalCredits: Int {
        store.courses.reduce(0) { $0 + $1.credits }
    }

    private var dayCourses: [Course] {
        store.coursesFor(day: selectedDay)
    }

    private var dayGaps: [SmartGapSlot] {
        store.smartGaps(for: selectedDay)
    }

    private var dayTimeBlockedTasks: [Assignment] {
        guard selectedDay == DayOfWeek.from(date: Date()) else { return [] }
        let cal = Calendar.current
        return store.activeAssignments.filter { task in
            guard let start = task.startDate else { return false }
            return cal.isDateInToday(start)
        }
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                Picker("Mode Kalender", selection: $mode) {
                    ForEach(ScheduleMode.allCases) { m in
                        Text(m.rawValue).tag(m)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)
                .padding(.top, 8)

                dayStripPicker

                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        summaryBar

                        if mode == .weekly {
                            weeklyCoursesList
                        } else {
                            dailyTimeBlockList
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 20)
                }
            }
            .background(Theme.canvasBg.ignoresSafeArea())
            .navigationTitle("Kalender & Kuliah")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        courseToEdit = nil
                        showAddCourse = true
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .accessibilityLabel("Tambah Mata Kuliah")
                }
            }
            .sheet(isPresented: $showAddCourse) {
                AddCourseSheet(courseToEdit: courseToEdit)
            }
            .sheet(item: $gapToArrange) { gap in
                ArrangeTaskToGapSheet(gap: gap, day: selectedDay)
            }
        }
    }

    private var dayStripPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(DayOfWeek.allCases) { day in
                    let isSelected = day == selectedDay
                    let count = store.coursesFor(day: day).count
                    Button {
                        selectedDay = day
                    } label: {
                        VStack(spacing: 4) {
                            Text(day.shortName)
                                .font(.system(size: 12, weight: .semibold))
                            Text("\(count) matkul")
                                .font(.system(size: 10))
                                .opacity(0.8)
                        }
                        .foregroundColor(isSelected ? .white : Theme.inkPrimary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(isSelected ? store.selectedTheme.accentColor : Theme.surfaceBg)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(isSelected ? store.selectedTheme.accentColor : Theme.borderCrisp, lineWidth: 1)
                        )
                        .cornerRadius(10)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private var summaryBar: some View {
        HStack {
            Text(selectedDay.localizedName)
                .font(AppFont.headline())
                .foregroundColor(Theme.inkPrimary)
            Spacer()
            Text("\(dayCourses.count) sesi • Total \(totalCredits) SKS")
                .font(AppFont.caption())
                .foregroundColor(Theme.inkSecondary)
        }
    }

    private var weeklyCoursesList: some View {
        VStack(spacing: 10) {
            if dayCourses.isEmpty {
                EmptyStateView(
                    icon: "calendar.badge.clock",
                    title: "Tidak ada kelas di hari \(selectedDay.localizedName)",
                    subtitle: "Ketuk + di kanan atas untuk menambahkan mata kuliah atau manfaatkan Blok Harian."
                )
                .background(Theme.surfaceBg)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Theme.borderCrisp, lineWidth: 1)
                )
                .cornerRadius(14)
            } else {
                ForEach(dayCourses) { course in
                    CourseCard(course: course)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            courseToEdit = course
                            showAddCourse = true
                        }
                        .contextMenu {
                            Button {
                                courseToEdit = course
                                showAddCourse = true
                            } label: {
                                Label("Edit Mata Kuliah", systemImage: "pencil")
                            }
                            Button(role: .destructive) {
                                store.deleteCourse(id: course.id)
                            } label: {
                                Label("Hapus", systemImage: "trash")
                            }
                        }
                }
            }
        }
    }

    private var dailyTimeBlockList: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Classes & Time-blocked Tasks
            VStack(alignment: .leading, spacing: 8) {
                Text("Blok Terjadwal (\(dayCourses.count + dayTimeBlockedTasks.count))")
                    .font(AppFont.caption())
                    .foregroundColor(Theme.inkSecondary)

                if dayCourses.isEmpty && dayTimeBlockedTasks.isEmpty {
                    Text("Belum ada kelas atau blok tugas pada hari \(selectedDay.localizedName).")
                        .font(AppFont.caption())
                        .foregroundColor(Theme.inkMuted)
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Theme.surfaceBg)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Theme.borderCrisp, lineWidth: 1)
                        )
                        .cornerRadius(12)
                } else {
                    ForEach(dayCourses) { course in
                        CourseCard(course: course)
                            .onTapGesture {
                                courseToEdit = course
                                showAddCourse = true
                            }
                    }
                    ForEach(dayTimeBlockedTasks) { task in
                        HStack(spacing: 10) {
                            Rectangle()
                                .fill(store.selectedTheme.accentColor)
                                .frame(width: 4)
                                .cornerRadius(2)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(task.title)
                                    .font(AppFont.subheadline())
                                    .foregroundColor(Theme.inkPrimary)
                                if let start = task.startDate {
                                    Text("\(start.localizedTimeOnly) - \(task.dueDate.localizedTimeOnly)")
                                        .font(AppFont.monoTag())
                                        .foregroundColor(store.selectedTheme.accentColor)
                                }
                            }
                            Spacer()
                            Button {
                                var cleared = task
                                cleared.startDate = nil
                                store.updateAssignment(cleared)
                            } label: {
                                Text("Lepas Blok")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(Theme.inkSecondary)
                            }
                            .buttonStyle(.plain)
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

            // Open Smart Gap Slots for Arrange Tasks
            VStack(alignment: .leading, spacing: 8) {
                Text("Celah Smart Gap™ Tersedia (08:00 - 21:30)")
                    .font(AppFont.caption())
                    .foregroundColor(Theme.inkSecondary)

                ForEach(dayGaps) { gap in
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(gap.timeRangeFormatted)
                                .font(.system(size: 14, weight: .semibold, design: .monospaced))
                                .foregroundColor(Theme.inkPrimary)
                            Text("Durasi kosong \(gap.durationMinutes) menit")
                                .font(AppFont.caption())
                                .foregroundColor(Theme.inkSecondary)
                        }
                        Spacer()
                        Button {
                            gapToArrange = gap
                        } label: {
                            Text("Atur Tugas")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(store.selectedTheme.accentColor)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Theme.subtleBg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Theme.borderCrisp, lineWidth: 1)
                                )
                                .cornerRadius(8)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(12)
                    .background(Theme.surfaceBg)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Theme.borderCrisp, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                    )
                    .cornerRadius(12)
                }
            }
        }
    }
}

private struct ArrangeTaskToGapSheet: View {
    @EnvironmentObject private var store: ScheduleStore
    @Environment(\.dismiss) private var dismiss

    let gap: SmartGapSlot
    let day: DayOfWeek

    private var unscheduledTasks: [Assignment] {
        store.activeAssignments.filter { $0.startDate == nil }
    }

    var body: some View {
        NavigationStack {
            List {
                Section("Slot Terpilih") {
                    HStack {
                        Text("\(day.localizedName) • \(gap.timeRangeFormatted)")
                            .font(AppFont.subheadline())
                        Spacer()
                        Text("\(gap.durationMinutes) mnt")
                            .font(AppFont.monoTag())
                            .foregroundColor(store.selectedTheme.accentColor)
                    }
                }

                Section("Pilih Tugas untuk Dijadwalkan") {
                    if unscheduledTasks.isEmpty {
                        Text("Tidak ada tugas backlog yang belum terjadwal.")
                            .font(AppFont.caption())
                            .foregroundColor(Theme.inkSecondary)
                    } else {
                        ForEach(unscheduledTasks) { task in
                            Button {
                                let targetDuration = min(gap.durationMinutes, max(25, task.estimatedPomos * store.pomoDurationMinutes))
                                store.scheduleTaskToGap(
                                    taskId: task.id,
                                    startMinutes: gap.startMinutes,
                                    endMinutes: gap.startMinutes + targetDuration
                                )
                                dismiss()
                            } label: {
                                HStack {
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(task.title)
                                            .font(AppFont.subheadline())
                                            .foregroundColor(Theme.inkPrimary)
                                        Text("Estimasi \(task.estimatedPomos)p • Prioritas \(task.priority.rawValue)")
                                            .font(AppFont.caption())
                                            .foregroundColor(Theme.inkSecondary)
                                    }
                                    Spacer()
                                    Image(systemName: "calendar.badge.plus")
                                        .foregroundColor(store.selectedTheme.accentColor)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Plot ke Celah Waktu")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Tutup") { dismiss() }
                }
            }
        }
    }
}

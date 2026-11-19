import SwiftUI
import AVFoundation

// MARK: - Ambient Noise Engine (Pure Procedural PCM for PomoFlow Studio)
private enum AmbientNoiseProfile: String, CaseIterable, Identifiable {
    case off = "Hening"
    case brown = "Brown Noise"
    case rain = "Hujan Tenang"
    case library = "Perpustakaan"
    case tick = "Detik Halus"

    var id: String { rawValue }
}

private final class AmbientAudioController: ObservableObject {
    @Published var selectedProfile: AmbientNoiseProfile = .off

    private var engine: AVAudioEngine?
    private var playerNode: AVAudioPlayerNode?

    func setProfile(_ profile: AmbientNoiseProfile) {
        selectedProfile = profile
        stop()
        guard profile != .off else { return }
        startBuffer(for: profile)
    }

    func stop() {
        playerNode?.stop()
        engine?.stop()
        engine = nil
        playerNode = nil
    }

    private func startBuffer(for profile: AmbientNoiseProfile) {
        let sampleRate: Double = 22050
        let frameCount = AVAudioFrameCount(sampleRate * 2) // 2-second seamless loop
        guard let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1),
              let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else {
            return
        }
        buffer.frameLength = frameCount

        if let data = buffer.floatChannelData?[0] {
            var lastOut: Float = 0.0
            for i in 0..<Int(frameCount) {
                let white = Float.random(in: -1...1)
                switch profile {
                case .off:
                    data[i] = 0
                case .brown:
                    lastOut = (lastOut + 0.03 * white) / 1.03
                    data[i] = max(-0.4, min(0.4, lastOut * 2.5))
                case .rain:
                    lastOut = (lastOut + 0.12 * white) / 1.12
                    data[i] = max(-0.25, min(0.25, lastOut * 1.4))
                case .library:
                    lastOut = (lastOut + 0.015 * white) / 1.015
                    data[i] = max(-0.18, min(0.18, lastOut * 1.6))
                case .tick:
                    let inTickWindow = (i % Int(sampleRate)) < 260
                    data[i] = inTickWindow ? (white * 0.09) : 0.002 * white
                }
            }
        }

        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try AVAudioSession.sharedInstance().setActive(true)
            let newEngine = AVAudioEngine()
            let node = AVAudioPlayerNode()
            newEngine.attach(node)
            newEngine.connect(node, to: newEngine.mainMixerNode, format: format)
            try newEngine.start()
            node.scheduleBuffer(buffer, at: nil, options: [.loops], completionHandler: nil)
            node.play()
            self.engine = newEngine
            self.playerNode = node
        } catch {
            stop()
        }
    }

    deinit {
        stop()
    }
}

// MARK: - Tab 3: PomoFlow Studio
public struct PomoFlowView: View {
    @EnvironmentObject private var store: ScheduleStore
    @StateObject private var ambient = AmbientAudioController()

    public init() {}

    private var formattedTime: String {
        let total = store.isStopwatchMode ? store.stopwatchSeconds : store.pomoSecondsRemaining
        let mins = total / 60
        let secs = total % 60
        return String(format: "%02d:%02d", mins, secs)
    }

    private var timerProgress: Double {
        if store.isStopwatchMode {
            return Double(store.stopwatchSeconds % 60) / 60.0
        }
        let total = Double(max(60, store.pomoDurationMinutes * 60))
        let elapsed = total - Double(store.pomoSecondsRemaining)
        return max(0, min(1, elapsed / total))
    }

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    // Mode Switcher
                    Picker("Mode Fokus", selection: Binding(
                        get: { store.isStopwatchMode },
                        set: { nextMode in
                            if store.isStopwatchMode != nextMode {
                                store.resetPomoTimer()
                                store.isStopwatchMode = nextMode
                            }
                        }
                    )) {
                        Text("Pomodoro (\(store.pomoDurationMinutes)m)").tag(false)
                        Text("Stopwatch").tag(true)
                    }
                    .pickerStyle(.segmented)

                    // Target Binding Card
                    targetSelectorCard

                    // Main Timer Surface
                    timerCard

                    // Ambient White Noise Studio
                    ambientNoiseCard

                    // Focus Session History
                    focusHistorySection
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }
            .background(Theme.canvasBg.ignoresSafeArea())
            .navigationTitle("PomoFlow Studio")
            .navigationBarTitleDisplayMode(.inline)
            .onDisappear {
                if !store.isPomoRunning {
                    ambient.stop()
                }
            }
        }
    }

    private var targetSelectorCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Target Fokus Aktif")
                .font(AppFont.caption())
                .foregroundColor(Theme.inkSecondary)

            HStack {
                Image(systemName: "scope")
                    .foregroundColor(store.selectedTheme.accentColor)
                Text(store.activeFocusTargetTitle)
                    .font(AppFont.subheadline())
                    .foregroundColor(Theme.inkPrimary)
                    .lineLimit(1)
                Spacer()
                Menu("Ganti") {
                    Button("Fokus Bebas") {
                        store.activeFocusTargetId = nil
                        store.activeFocusTargetTitle = "Fokus Bebas"
                        store.activeFocusCourseId = nil
                    }
                    ForEach(store.activeAssignments) { task in
                        Button(task.title) {
                            store.setFocusTarget(assignment: task)
                        }
                    }
                }
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(store.selectedTheme.accentColor)
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

    private var timerCard: some View {
        VStack(spacing: 18) {
            ZStack {
                Circle()
                    .stroke(Theme.subtleBg, lineWidth: 10)
                Circle()
                    .trim(from: 0, to: CGFloat(timerProgress))
                    .stroke(
                        store.selectedTheme.accentColor,
                        style: StrokeStyle(lineWidth: 10, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 0.4), value: timerProgress)

                VStack(spacing: 6) {
                    Text(store.isStopwatchMode ? "STOPWATCH" : "DEEP WORK")
                        .font(.system(size: 11, weight: .semibold, design: .monospaced))
                        .foregroundColor(Theme.inkMuted)
                    Text(formattedTime)
                        .font(AppFont.timerDisplay())
                        .foregroundColor(Theme.inkPrimary)
                    Text(store.isPomoRunning ? "Sesi berlangsung..." : "Siap dieksekusi")
                        .font(AppFont.caption())
                        .foregroundColor(Theme.inkSecondary)
                }
            }
            .frame(width: 220, height: 220)
            .padding(.top, 8)

            HStack(spacing: 12) {
                Button {
                    store.togglePomoTimer()
                } label: {
                    Label(store.isPomoRunning ? "Jeda" : "Mulai Fokus", systemImage: store.isPomoRunning ? "pause.fill" : "play.fill")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(store.selectedTheme.accentColor)
                        .cornerRadius(10)
                }
                .buttonStyle(.plain)

                Button {
                    store.resetPomoTimer()
                } label: {
                    Image(systemName: "arrow.counterclockwise")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(Theme.inkPrimary)
                        .padding(12)
                        .background(Theme.subtleBg)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Theme.borderCrisp, lineWidth: 1)
                        )
                        .cornerRadius(10)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Reset Timer")

                if store.isStopwatchMode && store.stopwatchSeconds >= 10 {
                    Button {
                        store.saveStopwatchSession()
                    } label: {
                        Text("Simpan")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(Theme.matchaGreen)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 12)
                            .background(Theme.subtleBg)
                            .cornerRadius(10)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity)
        .background(Theme.surfaceBg)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Theme.borderCrisp, lineWidth: 1)
        )
        .cornerRadius(16)
    }

    private var ambientNoiseCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Suara Latar (Ambient)")
                    .font(AppFont.headline())
                    .foregroundColor(Theme.inkPrimary)
                Spacer()
                Text(ambient.selectedProfile.rawValue)
                    .font(AppFont.monoTag())
                    .foregroundColor(store.selectedTheme.accentColor)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(AmbientNoiseProfile.allCases) { profile in
                        let active = ambient.selectedProfile == profile
                        Button {
                            ambient.setProfile(profile)
                        } label: {
                            Text(profile.rawValue)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(active ? .white : Theme.inkPrimary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 7)
                                .background(active ? store.selectedTheme.accentColor : Theme.subtleBg)
                                .cornerRadius(8)
                        }
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

    private var focusHistorySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Log Sesi Fokus")
                    .font(AppFont.headline())
                    .foregroundColor(Theme.inkPrimary)
                Spacer()
                Text("Total \(store.totalFocusMinutes) mnt")
                    .font(AppFont.monoTag())
                    .foregroundColor(Theme.inkSecondary)
            }

            if store.focusSessions.isEmpty {
                Text("Belum ada sesi fokus terekam. Jalankan satu sesi Pomodoro untuk mencatat progres.")
                    .font(AppFont.caption())
                    .foregroundColor(Theme.inkMuted)
            } else {
                ForEach(store.focusSessions.prefix(8)) { session in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(session.targetTitle)
                                .font(AppFont.subheadline())
                                .foregroundColor(Theme.inkPrimary)
                                .lineLimit(1)
                            Text("\(session.mode.uppercased()) • \(session.startedAt.localizedTimeOnly)")
                                .font(.system(size: 11))
                                .foregroundColor(Theme.inkSecondary)
                        }
                        Spacer()
                        Text("+\(session.durationMinutes) mnt")
                            .font(AppFont.monoTag())
                            .foregroundColor(Theme.matchaGreen)
                    }
                    .padding(.vertical, 4)
                    Divider()
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

// MARK: - Tab 5: Insights, Countdowns & Profile Settings
public struct SettingsView: View {
    @EnvironmentObject private var store: ScheduleStore

    @State private var showResetAlert: Bool = false
    @State private var showClearAlert: Bool = false
    @State private var showAddCountdown: Bool = false

    public init() {}

    public var body: some View {
        NavigationStack {
            List {
                momentumSection
                quadrantSummarySection
                countdownsSection
                cloudSyncSection
                profileSection
                themeAndPomoSection
                dataManagementSection
                aboutSection
            }
            .navigationTitle("Wawasan & Profil")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showAddCountdown) {
                AddCountdownSheet()
            }
            .alert("Muat Ulang Data Contoh?", isPresented: $showResetAlert) {
                Button("Batal", role: .cancel) {}
                Button("Muat Ulang") {
                    store.loadSampleData()
                }
            } message: {
                Text("Jadwal, tugas, habit, dan countdown saat ini akan diganti dengan data simulasi luang.in.")
            }
            .alert("Hapus Semua Data?", isPresented: $showClearAlert) {
                Button("Batal", role: .cancel) {}
                Button("Hapus Semua", role: .destructive) {
                    store.clearAllData()
                }
            } message: {
                Text("Semua mata kuliah, tugas, kebiasaan, dan sesi fokus akan dihapus permanen.")
            }
        }
    }

    private var momentumSection: some View {
        Section("Momentum Score™") {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Level \(store.momentumLevel) / 12")
                            .font(AppFont.title2())
                            .foregroundColor(store.selectedTheme.accentColor)
                        Text("\(store.momentumScore) dari 1200 poin eksekusi")
                            .font(AppFont.caption())
                            .foregroundColor(Theme.inkSecondary)
                    }
                    Spacer()
                    let pct = Int((Double(store.momentumScore) / 1200.0) * 100)
                    Text("\(pct)%")
                        .font(.system(size: 18, weight: .bold, design: .monospaced))
                        .foregroundColor(Theme.inkPrimary)
                }

                ProgressView(value: Double(store.momentumScore), total: 1200)
                    .tint(store.selectedTheme.accentColor)

                HStack {
                    metricPill(label: "Tugas Selesai", value: "\(store.completedAssignments.count)")
                    metricPill(label: "Fokus Total", value: "\(store.totalFocusMinutes)m")
                    metricPill(label: "Overdue", value: "\(store.activeAssignments.filter(\.isOverdue).count)")
                }
            }
            .padding(.vertical, 4)
        }
    }

    private var quadrantSummarySection: some View {
        let dailyGoal = max(15, store.profile.dailyFocusGoalMinutes)
        return Section("Ringkasan Fokus & Kuadran") {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Target Fokus Harian")
                    Spacer()
                    Text("\(store.totalFocusMinutes) / \(dailyGoal) mnt")
                        .font(AppFont.monoTag())
                        .foregroundColor(Theme.inkSecondary)
                }
                ProgressView(value: Double(min(store.totalFocusMinutes, dailyGoal)), total: Double(dailyGoal))
                    .tint(Theme.matchaGreen)
            }

            ForEach(EisenhowerQuadrant.allCases) { q in
                HStack {
                    Text("\(q.rawValue) • \(q.title)")
                        .font(AppFont.caption())
                    Spacer()
                    Text("\(store.assignments(in: q).count)")
                        .font(AppFont.monoTag())
                        .foregroundColor(Theme.inkSecondary)
                }
            }
        }
    }

    private var countdownsSection: some View {
        Section {
            if store.countdowns.isEmpty {
                Text("Belum ada countdown akademik.")
                    .font(AppFont.caption())
                    .foregroundColor(Theme.inkSecondary)
            } else {
                ForEach(store.countdowns) { item in
                    countdownRow(item)
                }
            }

            Button {
                showAddCountdown = true
            } label: {
                Label("Tambah Hitung Mundur", systemImage: "calendar.badge.plus")
            }
        } header: {
            Text("Hitung Mundur (Countdowns)")
        }
    }

    private func countdownRow(_ item: CountdownItem) -> some View {
        let badgeText = item.daysRemaining == 0
            ? "Hari Ini"
            : (item.daysRemaining > 0 ? "H-\(item.daysRemaining)" : "H+\(abs(item.daysRemaining))")
        let badgeColor = item.daysRemaining <= 3 ? Theme.signalRed : Color(hex: item.colorHex)

        return HStack {
            Circle()
                .fill(Color(hex: item.colorHex))
                .frame(width: 8, height: 8)
            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(AppFont.subheadline())
                Text(item.category)
                    .font(.system(size: 11))
                    .foregroundColor(Theme.inkSecondary)
            }
            Spacer()
            Text(badgeText)
                .font(AppFont.monoTag())
                .foregroundColor(badgeColor)
        }
        .swipeActions {
            Button(role: .destructive) {
                store.deleteCountdown(id: item.id)
            } label: {
                Label("Hapus", systemImage: "trash")
            }
        }
    }

    private var cloudSyncSection: some View {
        Section("Sinkronisasi Cloud (Render / Neon)") {
            Toggle("Aktifkan Sync 24/7", isOn: $store.isCloudSyncEnabled)

            TextField("URL Backend (cth: https://luang-in.onrender.com)", text: $store.cloudSyncURL)
                .keyboardType(.URL)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()

            SecureField("PIN Akses Server", text: $store.cloudSyncPin)
                .keyboardType(.numberPad)

            HStack {
                Text("Status")
                Spacer()
                Text(store.cloudSyncStatus)
                    .font(AppFont.caption())
                    .foregroundColor(store.cloudSyncStatus.contains("Tersinkron") ? Theme.matchaGreen : Theme.inkSecondary)
            }

            if let synced = store.lastSyncedAt {
                HStack {
                    Text("Terakhir Sync")
                    Spacer()
                    Text(synced.localizedTimeOnly)
                        .font(AppFont.monoTag())
                        .foregroundColor(Theme.inkMuted)
                }
            }

            if store.isCloudSyncEnabled {
                HStack {
                    Button {
                        Task { await store.syncWithCloud() }
                    } label: {
                        Label(store.isCloudSyncing ? "Menyinkronkan..." : "Tarik & Sinkron", systemImage: "arrow.triangle.2.circlepath")
                    }
                    .disabled(store.isCloudSyncing)

                    Spacer()

                    Button("Unggah") {
                        Task { await store.pushToCloud() }
                    }
                    .disabled(store.isCloudSyncing)
                }
            }
        }
    }

    private var profileSection: some View {
        Section("Profil & Target") {
            TextField("Nama", text: Binding(
                get: { store.profile.name },
                set: { store.profile.name = $0; store.saveData() }
            ))
            TextField("Peran / Jurusan", text: Binding(
                get: { store.profile.role },
                set: { store.profile.role = $0; store.saveData() }
            ))
            Stepper("Target Fokus: \(store.profile.dailyFocusGoalMinutes) mnt/hari",
                    value: Binding(
                        get: { store.profile.dailyFocusGoalMinutes },
                        set: { store.profile.dailyFocusGoalMinutes = $0; store.saveData() }
                    ), in: 30...480, step: 15)
        }
    }

    private var themeAndPomoSection: some View {
        Section("Tema & Durasi PomoFlow") {
            Picker("Tema Aplikasi", selection: Binding(
                get: { store.selectedTheme },
                set: { store.selectedTheme = $0; store.saveData() }
            )) {
                ForEach(LuangTheme.allCases) { theme in
                    Text(theme.displayName).tag(theme)
                }
            }

            Stepper("Durasi Pomodoro: \(store.pomoDurationMinutes) mnt",
                    value: Binding(
                        get: { store.pomoDurationMinutes },
                        set: {
                            store.pomoDurationMinutes = $0
                            if !store.isPomoRunning {
                                store.pomoSecondsRemaining = $0 * 60
                            }
                            store.saveData()
                        }
                    ), in: 15...60, step: 5)

            Stepper("Istirahat Pendek: \(store.shortBreakMinutes) mnt",
                    value: Binding(
                        get: { store.shortBreakMinutes },
                        set: { store.shortBreakMinutes = $0; store.saveData() }
                    ), in: 3...15)
        }
    }

    private var dataManagementSection: some View {
        Section("Manajemen Data") {
            Button {
                showResetAlert = true
            } label: {
                Label("Muat Ulang Data Contoh", systemImage: "arrow.clockwise")
            }

            Button(role: .destructive) {
                showClearAlert = true
            } label: {
                Label("Hapus Semua Data", systemImage: "trash")
            }
        }
    }

    private var aboutSection: some View {
        Section("Tentang luang.in") {
            HStack {
                Text("Aplikasi")
                Spacer()
                Text("luang.in Execution OS")
                    .foregroundColor(Theme.inkSecondary)
            }
            HStack {
                Text("Versi Skema")
                Spacer()
                Text("2.0 (Store v2)")
                    .font(AppFont.monoTag())
                    .foregroundColor(Theme.inkSecondary)
            }
        }
    }

    private func metricPill(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value)
                .font(.system(size: 14, weight: .bold, design: .monospaced))
                .foregroundColor(Theme.inkPrimary)
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(Theme.inkSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(8)
        .background(Theme.subtleBg)
        .cornerRadius(8)
    }
}

private struct AddCountdownSheet: View {
    @EnvironmentObject private var store: ScheduleStore
    @Environment(\.dismiss) private var dismiss

    @State private var title: String = ""
    @State private var category: String = "UTS"
    @State private var targetDate: Date = Date().addingTimeInterval(3600 * 24 * 7)
    @State private var colorHex: String = "4772FA"
    @State private var isPinned: Bool = true

    private let categories = ["UTS", "UAS", "Proyek", "Seminar", "Beasiswa"]
    private let palette = ["4772FA", "247B50", "C4242A", "D97706", "0284C7"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Detail Momen Penting") {
                    TextField("Judul (cth: Sidang Proposal TA)", text: $title)
                    Picker("Kategori", selection: $category) {
                        ForEach(categories, id: \.self) { cat in
                            Text(cat).tag(cat)
                        }
                    }
                    DatePicker("Tanggal Target", selection: $targetDate, displayedComponents: .date)
                    Toggle("Sematkan di Beranda", isOn: $isPinned)
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
            .navigationTitle("Tambah Hitung Mundur")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Batal") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Simpan") {
                        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        let item = CountdownItem(
                            title: trimmed,
                            targetDate: targetDate,
                            category: category,
                            colorHex: colorHex,
                            isPinned: isPinned
                        )
                        store.addCountdown(item)
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .fontWeight(.semibold)
                }
            }
        }
    }
}

import SwiftUI

public struct MainTabView: View {
    @StateObject private var store = ScheduleStore()
    @State private var selectedTab: Int = 0

    public init() {}

    public var body: some View {
        TabView(selection: $selectedTab) {
            TodayView(onOpenPomoFlow: { selectedTab = 2 })
                .tabItem {
                    Label("Hari Ini", systemImage: "checklist.checked")
                }
                .tag(0)

            ScheduleView()
                .tabItem {
                    Label("Kalender", systemImage: "calendar")
                }
                .tag(1)

            PomoFlowView()
                .tabItem {
                    Label("PomoFlow", systemImage: "timer")
                }
                .tag(2)

            AssignmentsView(onOpenPomoFlow: { selectedTab = 2 })
                .tabItem {
                    Label("Matriks & Habit", systemImage: "square.grid.2x2")
                }
                .tag(3)

            SettingsView()
                .tabItem {
                    Label("Wawasan", systemImage: "chart.bar")
                }
                .tag(4)
        }
        .environmentObject(store)
        .tint(store.selectedTheme.accentColor)
        .preferredColorScheme(store.selectedTheme == .dark ? .dark : nil)
    }
}

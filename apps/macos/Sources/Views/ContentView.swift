import SwiftUI

/// The main content view of the application.
/// Hot reload is enabled automatically via the parent `.hotReloadable()` modifier.
struct ContentView: View {
    @State private var selectedTab = 0
    @State private var counter = 0

    var body: some View {
        NavigationSplitView {
            SidebarView(selectedTab: $selectedTab)
        } detail: {
            DetailView(selectedTab: selectedTab, counter: $counter)
        }
        .frame(minWidth: 600, minHeight: 400)
    }
}

// MARK: - Sidebar View

struct SidebarView: View {
    @Binding var selectedTab: Int

    var body: some View {
        List(selection: $selectedTab) {
            NavigationLink(value: 0) {
                Label("Home", systemImage: "house")
            }

            NavigationLink(value: 1) {
                Label("Projects", systemImage: "folder")
            }

            NavigationLink(value: 2) {
                Label("Activity", systemImage: "chart.line.uptrend.xyaxis")
            }
        }
        .navigationTitle("DG")
        .listStyle(.sidebar)
    }
}

// MARK: - Detail View

struct DetailView: View {
    let selectedTab: Int
    @Binding var counter: Int

    var body: some View {
        VStack(spacing: 20) {
            switch selectedTab {
            case 0:
                HomeDetailView(counter: $counter)
            case 1:
                ProjectsDetailView()
            case 2:
                ActivityDetailView()
            default:
                Text("Select an item from the sidebar")
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(nsColor: .windowBackgroundColor))
    }
}

// MARK: - Home Detail View

struct HomeDetailView: View {
    @Binding var counter: Int

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "swift")
                .font(.system(size: 60))
                .foregroundStyle(.orange.gradient)

            Text("Welcome to DG App")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("This app supports hot reload for all SwiftUI views.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Divider()
                .frame(maxWidth: 200)

            // Interactive counter to demonstrate state persistence during hot reload
            VStack(spacing: 12) {
                Text("Counter: \(counter)")
                    .font(.title2)
                    .monospacedDigit()

                HStack(spacing: 16) {
                    Button("Decrement") {
                        counter -= 1
                    }
                    .buttonStyle(.bordered)

                    Button("Increment") {
                        counter += 1
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding()
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))

            #if DEBUG
            HotReloadIndicator()
                .padding(.top, 20)
            #endif
        }
        .padding()
    }
}

// MARK: - Projects Detail View

struct ProjectsDetailView: View {
    let projects = [
        ("Portfolio Website", "A Next.js powered personal website", "globe"),
        ("iOS App", "Native SwiftUI application", "iphone"),
        ("CLI Tools", "Command line utilities", "terminal"),
    ]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(projects, id: \.0) { project in
                    ProjectCard(
                        title: project.0,
                        description: project.1,
                        icon: project.2
                    )
                }
            }
            .padding()
        }
    }
}

struct ProjectCard: View {
    let title: String
    let description: String
    let icon: String

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title)
                .foregroundStyle(.blue)
                .frame(width: 50, height: 50)
                .background(.blue.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)

                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundStyle(.tertiary)
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.05), radius: 2, y: 1)
    }
}

// MARK: - Activity Detail View

struct ActivityDetailView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 40))
                .foregroundStyle(.green)

            Text("Activity")
                .font(.title)
                .fontWeight(.semibold)

            Text("Recent activity from connected services will appear here.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// MARK: - Preview

#Preview {
    ContentView()
}

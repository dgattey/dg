import SwiftUI

/// The settings view of the application.
/// Hot reload is enabled automatically via the parent `.hotReloadable()` modifier.
struct SettingsView: View {
    var body: some View {
        TabView {
            GeneralSettingsView()
                .tabItem {
                    Label("General", systemImage: "gear")
                }

            AppearanceSettingsView()
                .tabItem {
                    Label("Appearance", systemImage: "paintbrush")
                }

            #if DEBUG
            DeveloperSettingsView()
                .tabItem {
                    Label("Developer", systemImage: "hammer")
                }
            #endif
        }
        .frame(width: 450, height: 300)
    }
}

// MARK: - General Settings

struct GeneralSettingsView: View {
    @AppStorage("launchAtLogin") private var launchAtLogin = false
    @AppStorage("showMenuBarIcon") private var showMenuBarIcon = true
    @AppStorage("checkForUpdates") private var checkForUpdates = true

    var body: some View {
        Form {
            Section {
                Toggle("Launch at login", isOn: $launchAtLogin)
                Toggle("Show menu bar icon", isOn: $showMenuBarIcon)
                Toggle("Automatically check for updates", isOn: $checkForUpdates)
            }
        }
        .formStyle(.grouped)
        .padding()
    }
}

// MARK: - Appearance Settings

struct AppearanceSettingsView: View {
    @AppStorage("accentColorChoice") private var accentColor = "blue"
    @AppStorage("sidebarIconSize") private var iconSize = "medium"

    let accentColors = ["blue", "purple", "pink", "red", "orange", "yellow", "green"]
    let iconSizes = ["small", "medium", "large"]

    var body: some View {
        Form {
            Section("Theme") {
                Picker("Accent Color", selection: $accentColor) {
                    ForEach(accentColors, id: \.self) { color in
                        HStack {
                            Circle()
                                .fill(colorFor(color))
                                .frame(width: 12, height: 12)
                            Text(color.capitalized)
                        }
                        .tag(color)
                    }
                }

                Picker("Sidebar Icon Size", selection: $iconSize) {
                    ForEach(iconSizes, id: \.self) { size in
                        Text(size.capitalized).tag(size)
                    }
                }
            }
        }
        .formStyle(.grouped)
        .padding()
    }

    private func colorFor(_ name: String) -> Color {
        switch name {
        case "blue": return .blue
        case "purple": return .purple
        case "pink": return .pink
        case "red": return .red
        case "orange": return .orange
        case "yellow": return .yellow
        case "green": return .green
        default: return .accentColor
        }
    }
}

// MARK: - Developer Settings (Debug Only)

#if DEBUG
struct DeveloperSettingsView: View {
    @State private var lastReloadTime: Date?

    var body: some View {
        Form {
            Section("Hot Reload") {
                HStack {
                    Text("Status")
                    Spacer()
                    HotReloadIndicator()
                }

                if let time = lastReloadTime {
                    HStack {
                        Text("Last Reload")
                        Spacer()
                        Text(time, style: .time)
                            .foregroundStyle(.secondary)
                    }
                }

                Button("Test Hot Reload") {
                    lastReloadTime = Date()
                }
                .buttonStyle(.bordered)
            }

            Section("Instructions") {
                VStack(alignment: .leading, spacing: 8) {
                    Text("To enable hot reload:")
                        .font(.headline)

                    Text("1. Download InjectionIII from the Mac App Store")
                    Text("2. Open InjectionIII and select this project's folder")
                    Text("3. Make changes to any SwiftUI view file")
                    Text("4. Save the file - changes appear instantly!")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
        .padding()
    }
}
#endif

// MARK: - Preview

#Preview {
    SettingsView()
}

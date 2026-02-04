import SwiftUI

/// The main entry point for the DG macOS application.
/// Hot reload is automatically enabled for all views via the `.hotReloadable()` modifier.
@main
struct DGApp: App {
    var body: some Scene {
        // Main window with hot reload enabled
        WindowGroup {
            ContentView()
                .hotReloadable()
        }
        .windowStyle(.hiddenTitleBar)
        .defaultSize(width: 800, height: 600)

        // Settings window with hot reload enabled
        Settings {
            SettingsView()
                .hotReloadable()
        }

        #if DEBUG
        // Debug window for hot reload status (optional)
        Window("Hot Reload", id: "hot-reload-debug") {
            HotReloadDebugView()
                .hotReloadable()
        }
        .defaultSize(width: 300, height: 200)
        #endif
    }
}

// MARK: - Hot Reload Debug View

#if DEBUG
/// A debug view showing hot reload status and instructions.
struct HotReloadDebugView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                HotReloadIndicator()
                Spacer()
            }

            Text("Hot Reload Setup")
                .font(.headline)

            VStack(alignment: .leading, spacing: 8) {
                Text("1. Install InjectionIII from the Mac App Store")
                Text("2. Open InjectionIII and select this project")
                Text("3. Edit any SwiftUI view and save")
                Text("4. Changes will appear instantly!")
            }
            .font(.caption)
            .foregroundStyle(.secondary)

            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
#endif

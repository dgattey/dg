# DG macOS App

A native macOS SwiftUI application with **universal hot reload** support for rapid development.

## Quick Start

1. Open `DGApp.xcodeproj` in Xcode
2. Build and run (⌘R)
3. Install [InjectionIII](https://apps.apple.com/app/injectioniii/id1380446739) for hot reload

## Hot Reload Setup

This app integrates the [Inject](https://github.com/krzysztofzablocki/Inject) library for hot reload support. Hot reload is applied **universally** to all SwiftUI views without requiring manual configuration for each view.

### How It Works

The app uses a custom `HotReloadModifier` that wraps the Inject library:

```swift
// Applied once at the WindowGroup level
WindowGroup {
    ContentView()
        .hotReloadable()  // Enables hot reload for entire view hierarchy
}
```

All child views automatically support hot reload - no need to add anything to individual views!

### Setting Up InjectionIII

1. **Download InjectionIII** from the [Mac App Store](https://apps.apple.com/app/injectioniii/id1380446739) (free)

2. **Open InjectionIII** and select this project's folder:
   - Open InjectionIII from Applications
   - File → Open Project (⌘O)
   - Navigate to `apps/macos` folder
   - Click "Open"

3. **Run your app in Debug mode** (⌘R in Xcode)

4. **Make changes to any SwiftUI view file** and save - changes appear instantly!

### Verifying Hot Reload

- Look for the **green dot indicator** in the app (Debug builds show "Hot Reload" status)
- Open the "Hot Reload" window from the Window menu (Debug only)
- Make a simple change (e.g., change text color) and save to verify it's working

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Changes don't appear | Ensure InjectionIII is running and project is selected |
| App doesn't compile | Check you're running Debug configuration (not Release) |
| "No project selected" | Open InjectionIII → File → Open Project |
| Hot reload indicator missing | Only visible in Debug builds |

## Project Structure

```
apps/macos/
├── DGApp.xcodeproj/          # Xcode project
├── Package.swift             # Swift Package Manager config
├── Sources/
│   ├── App/
│   │   └── DGApp.swift       # Main app entry point
│   ├── Views/
│   │   ├── ContentView.swift # Main content view
│   │   └── SettingsView.swift # Settings/preferences
│   └── HotReload/
│       └── HotReloadable.swift # Hot reload infrastructure
└── README.md
```

## Building

### Requirements
- macOS 14.0+ (Sonoma)
- Xcode 15.0+

### Build Commands

```bash
# Open in Xcode
open apps/macos/DGApp.xcodeproj

# Or build from command line
cd apps/macos
xcodebuild -scheme DGApp -configuration Debug build

# Run tests
xcodebuild -scheme DGApp -configuration Debug test
```

## Adding Hot Reload to New Windows

If you add new `WindowGroup` scenes, apply `.hotReloadable()` to enable hot reload:

```swift
WindowGroup("New Window", id: "new-window") {
    NewWindowView()
        .hotReloadable()  // Add this!
}
```

## API Reference

### View Modifiers

- `.hotReloadable()` - Enables hot reload for a view and all its children

### Views

- `HotReloadableView { content }` - Wrapper view that enables hot reload
- `HotReloadIndicator()` - Shows green dot when hot reload is active (Debug only)

### Environment

- `@Environment(\.isHotReloadEnabled)` - Check if hot reload is enabled

## How Universal Hot Reload Works

The traditional Inject approach requires adding `@ObserveInjection var inject` to every view. This app simplifies that:

1. **Single Point of Configuration**: Apply `.hotReloadable()` at the `WindowGroup` level
2. **Automatic Propagation**: All child views in the hierarchy get hot reload support
3. **No Boilerplate**: Individual views don't need any injection code
4. **State Preservation**: App state is preserved during hot reloads

### Under the Hood

```swift
public struct HotReloadModifier: ViewModifier {
    @ObserveInjection private var inject  // Observes Inject notifications

    public func body(content: Content) -> some View {
        content
            .enableInjection()  // Enables the injection point
    }
}
```

When InjectionIII detects a file change:
1. It compiles only the changed file
2. Injects the new code into the running app
3. Triggers `@ObserveInjection` to update
4. SwiftUI re-renders the affected views

## Release Builds

Hot reload code is **automatically stripped** in Release builds:
- No performance impact in production
- `HotReloadIndicator` renders nothing
- Inject library is not bundled in Release

## License

Part of the [dg](https://github.com/dgattey/dg) monorepo.

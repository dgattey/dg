import Inject
import SwiftUI

// MARK: - Universal Hot Reload Support

/// A view modifier that enables hot reload for any SwiftUI view.
/// This uses the Inject library to observe code changes and automatically refresh the view.
///
/// Usage: Apply `.hotReloadable()` to any view, or use `HotReloadableView { ... }` wrapper.
/// For best results, apply at the root of each WindowGroup.
public struct HotReloadModifier: ViewModifier {
    @ObserveInjection private var inject

    public init() {}

    public func body(content: Content) -> some View {
        content
            .enableInjection()
    }
}

// MARK: - View Extension

public extension View {
    /// Enables hot reload for this view and all its children.
    /// Apply this modifier at the root level (e.g., WindowGroup content) for universal hot reload.
    ///
    /// Example:
    /// ```swift
    /// WindowGroup {
    ///     ContentView()
    ///         .hotReloadable()
    /// }
    /// ```
    @ViewBuilder
    func hotReloadable() -> some View {
        modifier(HotReloadModifier())
    }
}

// MARK: - Hot Reloadable Wrapper View

/// A wrapper view that automatically enables hot reload for its content.
/// Use this to wrap any view hierarchy for hot reload support.
///
/// Example:
/// ```swift
/// HotReloadableView {
///     MyContentView()
/// }
/// ```
public struct HotReloadableView<Content: View>: View {
    @ObserveInjection private var inject
    private let content: () -> Content

    public init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    public var body: some View {
        content()
            .enableInjection()
    }
}

// MARK: - Environment Key for Hot Reload Status

/// Environment key to check if hot reload is enabled
private struct HotReloadEnabledKey: EnvironmentKey {
    static let defaultValue: Bool = {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }()
}

public extension EnvironmentValues {
    /// Indicates whether hot reload is enabled for the current environment.
    var isHotReloadEnabled: Bool {
        get { self[HotReloadEnabledKey.self] }
        set { self[HotReloadEnabledKey.self] = newValue }
    }
}

// MARK: - Debug Indicator View

/// A small indicator that shows when hot reload is active.
/// Useful during development to confirm hot reload is working.
public struct HotReloadIndicator: View {
    @Environment(\.isHotReloadEnabled) private var isEnabled

    public init() {}

    public var body: some View {
        #if DEBUG
        if isEnabled {
            HStack(spacing: 4) {
                Circle()
                    .fill(.green)
                    .frame(width: 8, height: 8)
                Text("Hot Reload")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(.ultraThinMaterial, in: Capsule())
        }
        #endif
    }
}

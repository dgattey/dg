// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "DGApp",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "DGApp", targets: ["DGApp"])
    ],
    dependencies: [
        // Hot reload support for SwiftUI views
        .package(url: "https://github.com/krzysztofzablocki/Inject.git", from: "1.5.2")
    ],
    targets: [
        .executableTarget(
            name: "DGApp",
            dependencies: [
                .product(name: "Inject", package: "Inject")
            ],
            path: "Sources",
            swiftSettings: [
                // Enable DEBUG flag for conditional hot reload code
                .define("DEBUG", .when(configuration: .debug))
            ]
        )
    ]
)

# Android Setup Instructions

This document provides instructions for setting up the Android development environment for this project.

## Prerequisites

1. Install Android Studio or Android SDK
2. Set up Android SDK location

## Setting up local.properties

The Android build system requires a `local.properties` file in the `android` directory that points to your Android SDK location. This file is not included in the repository because it contains machine-specific paths.

Create a file named `local.properties` in the `android` directory with the following content:

```properties
# Path to your Android SDK installation
sdk.dir=C:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk
```

Replace `USERNAME` with your Windows username. On macOS, the path would typically be:

```properties
sdk.dir=/Users/USERNAME/Library/Android/sdk
```

On Linux:

```properties
sdk.dir=/home/USERNAME/Android/Sdk
```

## Building from Command Line

After setting up the `local.properties` file, you can build the Android app from the command line:

```bash
cd android
./gradlew build
```

## Troubleshooting

If you encounter build errors:

1. Make sure your Android SDK is properly installed
2. Verify the path in `local.properties` is correct
3. Ensure you have the required SDK components installed (Android SDK Platform 34, Build-Tools, etc.)
4. Try running with more verbose output: `./gradlew build --info`

# 📱 How to Build Your Halaba City FC App via GitHub (No Android Studio Required)

This project is fully configured to compile your website into an installable Android APK using **GitHub Actions cloud servers**. You do **not** need Android Studio or any Android developer tools on your local computer.

---

## 🚀 Method 1: Automatic 1-Click Build via GitHub Actions

1. **Open your GitHub Repository** in your browser:
   `https://github.com/YOUR_USERNAME/halaba-fc`

2. **Navigate to the Actions Tab**:
   Click the **Actions** tab at the top of your GitHub repository.

3. **Select the Workflow**:
   In the left sidebar, click on **"Build Android APK"**.

4. **Trigger the Build**:
   - Click the **"Run workflow"** dropdown button on the right side.
   - Leave the branch as `main`.
   - Click the green **"Run workflow"** button.

5. **Wait for Completion**:
   GitHub's Ubuntu virtual machines will automatically:
   - Install Node.js 22 & Java 21 (Temurin)
   - Compile your React/Vite web application
   - Synchronize Capacitor Android files
   - Run Gradle to assemble the Android APK (`./gradlew assembleDebug`)
   - Package the resulting `.apk` file

---

## 📥 How to Download the APK to Your Android Phone

### Option A: From GitHub Actions Artifacts
1. Once the workflow run finishes with a green checkmark (usually ~2 to 3 minutes), click on the run title (e.g. *"Build Android APK"*).
2. Scroll down to the **Artifacts** section at the bottom of the page.
3. Click on **`HalabaCityFC-Android-APK`** to download the zip containing `HalabaCityFC-v1.0-debug.apk`.

### Option B: From GitHub Releases
1. When triggered or when a tag is pushed, GitHub Actions publishes the APK directly to your **Releases** section.
2. Go to `https://github.com/YOUR_USERNAME/halaba-fc/releases`.
3. Download **`HalabaCityFC-v1.0-debug.apk`** with one click directly to your Android device.

---

## 📲 How to Install the APK on Your Android Device

1. Download or transfer `HalabaCityFC-v1.0-debug.apk` to your Android phone.
2. Tap the file in your notification bar or in your phone's **Files / Downloads** app.
3. If Android displays a message: *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Turn on **"Allow from this source"**.
   - Tap the back button.
4. Tap **"Install"**.
5. The **Halaba City FC (በርበሬዎቹ)** app icon will now appear in your app drawer and home screen!

---

## 🍏 What About iOS (iPhone / iPad)?

On iOS, Apple requires macOS and Xcode for IPA packaging, but our website provides a **one-click Apple PWA installation**:
1. Open the website in **Safari** on your iPhone or iPad.
2. Tap the **Share** button (box with upward arrow) in Safari.
3. Select **"Add to Home Screen"**.
4. Tap **"Add"**.
5. The Halaba City FC app will open in fullscreen without any Safari address bar, just like a native iOS app.

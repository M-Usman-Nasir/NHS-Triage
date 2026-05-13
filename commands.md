cd backend
npm install

# set DATABASE_URL to your Postgres, then:
npm run migrate
npm start

npx react-native start
npx react-native run-android
npx react-native start --reset-cache

adb devices
adb start-server
adb kill-server

gradlew clean
gradlew assembleRelease

cd "C:\Users\kk\Documents\GitHub\NHS Triage\mobile-app\android"
.\gradlew clean
.\gradlew assembleRelease
# If assembleRelease fails (Ninja "Filename longer than 260 characters" on armeabi-v7a), from CMD run:
#   mobile-app\android\build-universal-apk.cmd
# That maps R: to mobile-app and builds there (shorter paths, all ABIs). Or clone to e.g. C:\dev\app.
# 64-bit-only emergency build: .\gradlew assembleRelease "-PreactNativeArchitectures=arm64-v8a,x86_64"

# --- Option C: universal APK via GitHub Actions (no Windows path limit) ---
# 1. Push this repo to GitHub (workflow file: .github/workflows/android-apk.yml).
# 2. Repo Settings → Secrets and variables → Actions → New repository secret:
#    Name: GOOGLE_MAPS_API_KEY   Value: your key (optional; omit uses placeholder CI_BUILD).
# 3. Actions tab → workflow "Android APK" → Run workflow → branch main → Run workflow.
# 4. When green, open the run → Artifacts → download "carepathnative-release-apk" (ZIP contains the .apk).
# 5. Install that APK on devices (includes armeabi-v7a + arm64 + x86 per gradle.properties).

Start date: 22 Apr 2026
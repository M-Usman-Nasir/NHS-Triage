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
# Default ABIs are arm64-v8a + x86_64 (see mobile-app/android/gradle.properties). For all ABIs on Windows, clone to a short path (e.g. C:\dev\nhst\) then restore armeabi-v7a,x86 in gradle.properties.

Start date: 22 Apr 2026
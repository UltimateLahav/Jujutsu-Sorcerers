#!/usr/bin/env bash
# Builds a signed Jujutsu Sorcerers APK without Gradle.
# Needs: a JDK (javac, keytool) and the Android SDK "platforms;android-34" + "build-tools;34.0.0".
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_SDK:-$HOME/android-sdk}"
BT="$SDK/build-tools/34.0.0"
AJ="$SDK/platforms/android-34/android.jar"
JAVAC="${JAVAC:-$(command -v javac || ls /usr/lib/jvm/*/bin/javac | head -1)}"
OUT=build

rm -rf "$OUT" assets && mkdir -p "$OUT/classes" assets
cp ../index.html assets/index.html                       # the game itself
printf '%s\n' "This APK file is owned by Lahav. All rights reserved." > assets/OWNER.txt     # ownership notice, readable by unzipping the APK

"$BT/aapt2" compile --dir res -o "$OUT/res.zip"
"$BT/aapt2" link -o "$OUT/base.apk" -I "$AJ" --manifest AndroidManifest.xml -A assets \
    --min-sdk-version 21 --target-sdk-version 34 --version-code 133 --version-name 1.58 "$OUT/res.zip"
"$JAVAC" --release 8 -Xlint:-options -classpath "$AJ" -d "$OUT/classes" $(find src -name '*.java')
# build-tools 34 ships an old d8 that crashes on JDK 21 class files, so use a current stable R8/d8 from Google Maven
R8="$SDK/r8-8.13.25.jar"
[ -f "$R8" ] || curl -sfL -o "$R8" https://dl.google.com/dl/android/maven2/com/android/tools/r8/8.13.25/r8-8.13.25.jar
java -cp "$R8" com.android.tools.r8.D8 --release --lib "$AJ" --min-api 21 --output "$OUT" $(find "$OUT/classes" -name '*.class')
python3 - "$OUT" <<'PY'
import sys, zipfile
out = sys.argv[1]
with zipfile.ZipFile(f"{out}/base.apk", "a") as z:
    z.write(f"{out}/classes.dex", "classes.dex", compress_type=zipfile.ZIP_DEFLATED)
PY
"$BT/zipalign" -f -p 4 "$OUT/base.apk" "$OUT/aligned.apk"

# throwaway debug key (public password, like Android's own debug.keystore): fine for sideloading, NOT for the Play Store
[ -f debug.keystore ] || keytool -genkeypair -keystore debug.keystore -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
"$BT/apksigner" sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
    --out "$OUT/JujutsuSorcerers.apk" "$OUT/aligned.apk"
"$BT/apksigner" verify --verbose "$OUT/JujutsuSorcerers.apk" | grep -E "Verifies|v2|v3" || true
mkdir -p ../dist && cp "$OUT/JujutsuSorcerers.apk" ../dist/JujutsuSorcerers.apk
echo "APK ready: dist/JujutsuSorcerers.apk ($(du -h ../dist/JujutsuSorcerers.apk | cut -f1))"

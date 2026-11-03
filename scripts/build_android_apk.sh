#!/usr/bin/env bash
set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$WORKSPACE_DIR/build"
RELEASES_DIR="$BUILD_DIR/releases"
OUTPUT_APK="$BUILD_DIR/GodWar-debug.apk"

mkdir -p "$BUILD_DIR" "$RELEASES_DIR"

# Tự động đọc version từ version.json (hoặc export_presets.cfg nếu cần)
if [ -f "$WORKSPACE_DIR/version.json" ]; then
  VER_NAME="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("'"$WORKSPACE_DIR"'/version.json","utf8")).current_version)')"
  VER_CODE="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("'"$WORKSPACE_DIR"'/version.json","utf8")).version_code)')"
else
  VER_NAME="$(grep '^version/name=' "$WORKSPACE_DIR/export_presets.cfg" | cut -d'"' -f2)"
  VER_CODE="$(grep '^version/code=' "$WORKSPACE_DIR/export_presets.cfg" | cut -d'=' -f2)"
fi

BACKUP_APK="$RELEASES_DIR/GodWar-v${VER_NAME}-code${VER_CODE}.apk"

echo "=========================================================="
echo "  📦 ĐANG ĐÓNG GÓI ANDROID APK CHO GODWAR v${VER_NAME} (code ${VER_CODE})"
echo "=========================================================="

"$WORKSPACE_DIR/.bin/godot" --headless --export-debug "Android" "$OUTPUT_APK"

# Tạo bản sao lưu (backup) theo đúng version để đánh giá và đối chiếu
cp -f "$OUTPUT_APK" "$BACKUP_APK"

echo ""
echo "=========================================================="
echo "  ✅ ĐÃ XUẤT & BACKUP APK v${VER_NAME} (code ${VER_CODE}) THÀNH CÔNG!"
echo "  📌 File APK hiện hành : $OUTPUT_APK"
echo "  🗄️  Bản Backup Version: $BACKUP_APK"
echo "  📊 Dung lượng         : $(ls -lh "$OUTPUT_APK" | awk '{print $5}')"
echo "=========================================================="
echo "-> Tải trực tiếp tại: http://localhost:4173/GodWar-debug.apk"
echo "   hoặc bản theo version: http://localhost:4173/build/releases/GodWar-v${VER_NAME}-code${VER_CODE}.apk"

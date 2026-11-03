#!/usr/bin/env bash
# ==============================================================================
# 🚀 GODWAR VERSION MANAGER & RELEASE TRACKER
# Tự động nâng cấp version (patch | minor | major | set X.Y.Z | sync)
# và đồng bộ hóa 100% giữa:
#   1. version.json (Lịch sử phát hành & đường dẫn backup APK)
#   2. package.json
#   3. export_presets.cfg (version/name & version/code)
#   4. project.godot (config/version)
#   5. tools/asset-viewer/vargost-skill-test.html & index.html (Nhãn hiển thị)
# ==============================================================================
set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WORKSPACE_DIR"

ACTION="${1:-patch}"
SUMMARY="${2:-Nâng cấp tính năng và đồng bộ hóa Web Test Tool ⇔ Godot APK}"

node - "$ACTION" "$SUMMARY" << 'EOF'
const fs = require('fs');
const path = require('path');

const action = process.argv[2] || 'patch';
const summary = process.argv[3] || 'Nâng cấp phiên bản và đồng bộ hóa hệ thống';

const versionFile = 'version.json';
const pkgFile = 'package.json';
const exportFile = 'export_presets.cfg';
const godotFile = 'project.godot';

const vData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
let [major, minor, patch] = vData.current_version.split('.').map(Number);
let code = Number(vData.version_code);

if (action === 'patch') {
  patch += 1;
  code += 1;
} else if (action === 'minor') {
  minor += 1;
  patch = 0;
  code += 1;
} else if (action === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
  code += 1;
} else if (action === 'sync') {
  // Giữ nguyên version hiện tại trong version.json và đồng bộ sang các file khác
} else if (/^\d+\.\d+\.\d+$/.test(action)) {
  [major, minor, patch] = action.split('.').map(Number);
  code += 1;
} else {
  console.error(`Tham số không hợp lệ: ${action}. Dùng: patch | minor | major | sync | X.Y.Z`);
  process.exit(1);
}

const newVer = `${major}.${minor}.${patch}`;
const nowUtc = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const apkBackupPath = `build/releases/GodWar-v${newVer}-code${code}.apk`;

vData.current_version = newVer;
vData.version_code = code;
vData.updated_at_utc = nowUtc;

if (action !== 'sync') {
  vData.releases = vData.releases || [];
  const existingIdx = vData.releases.findIndex(r => r.version === newVer);
  const entry = {
    version: newVer,
    version_code: code,
    date_utc: nowUtc,
    apk_backup: apkBackupPath,
    summary
  };
  if (existingIdx >= 0) {
    vData.releases[existingIdx] = entry;
  } else {
    vData.releases.unshift(entry);
  }
} else if (vData.releases && vData.releases[0] && summary !== 'Nâng cấp tính năng và đồng bộ hóa Web Test Tool ⇔ Godot APK') {
  vData.releases[0].summary = summary;
}

fs.writeFileSync(versionFile, JSON.stringify(vData, null, 2) + '\n', 'utf8');

// 2. Cập nhật package.json
const pkgData = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
pkgData.version = newVer;
fs.writeFileSync(pkgFile, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');

// 3. Cập nhật export_presets.cfg
let expText = fs.readFileSync(exportFile, 'utf8');
expText = expText.replace(/^version\/code=\d+/m, `version/code=${code}`);
expText = expText.replace(/^version\/name="[^"]*"/m, `version/name="${newVer}"`);
fs.writeFileSync(exportFile, expText, 'utf8');

// 4. Cập nhật project.godot
let gdText = fs.readFileSync(godotFile, 'utf8');
if (/^config\/version=/m.test(gdText)) {
  gdText = gdText.replace(/^config\/version="[^"]*"/m, `config/version="${newVer}"`);
} else {
  gdText = gdText.replace(/^config\/name="GodWar"/m, `config/name="GodWar"\nconfig/version="${newVer}"`);
}
fs.writeFileSync(godotFile, gdText, 'utf8');

// 5. Cập nhật nhãn hiển thị version trên vargost-skill-test.html & index.html
for (const htmlPath of ['tools/asset-viewer/vargost-skill-test.html', 'tools/asset-viewer/index.html']) {
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    html = html.replace(/📥 TẢI FILE ANDROID APK(?:\s*\(v[\d.]+\s*·\s*\d+\s*MB\)|\s*\(\d+\s*MB\))?/g, `📥 TẢI FILE ANDROID APK (v${newVer} · 59 MB)`);
    html = html.replace(/📥 Tải Bản APK Android(?:\s*\(v[\d.]+\s*·\s*\d+\s*MB\)|\s*\(\d+\s*MB\))?/g, `📥 Tải Bản APK Android (v${newVer} · 59 MB)`);
    fs.writeFileSync(htmlPath, html, 'utf8');
  }
}

console.log(`✅ Đã đồng bộ Version thành công: v${newVer} (code ${code})`);
console.log(`📌 Đường dẫn backup APK: ${apkBackupPath}`);
EOF

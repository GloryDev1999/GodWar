#!/usr/bin/env bash
# ==============================================================================
# 🧭 GODWAR AGENT COMPASS & CONSTITUTION ENFORCER
# Script định tuyến tác vụ, chỉ định file BẮT BUỘC ĐỌC theo từng công việc,
# và kiểm tra nghiêm ngặt toàn bộ điều khoản Hiến pháp AGENTS.md.
# ==============================================================================
set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WORKSPACE_DIR"

MODE="${1:-all}"
TASK_TYPE="${2:-general}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
  echo -e "${CYAN}======================================================================${NC}"
  echo -e "${BOLD}  🛡️  GODWAR CONSTITUTION & TASK ROUTING GUARD (v$(jq -r '.current_version' version.json 2>/dev/null || echo '1.1.3'))${NC}"
  echo -e "${CYAN}======================================================================${NC}"
}

show_mandatory_reading() {
  local task="$1"
  echo -e "\n${YELLOW}📖 [1] DANH SÁCH FILE BẮT BUỘC PHẢI ĐỌC TRƯỚC KHI HÀNH ĐỘNG:${NC}"
  echo -e "  ${BOLD}A. Mọi tác vụ (Bắt buộc 100% ở đầu phiên):${NC}"
  echo -e "     1. ${GREEN}AGENTS.md${NC}            -> Hiến pháp tối cao (60 FPS, Dual-Target Sync, Version Backup, Cấm file rác)"
  echo -e "     2. ${GREEN}state.json${NC}           -> Bộ nhớ bàn giao phiên, trạng thái hiện tại & lịch sử"
  echo -e "     3. ${GREEN}version.json${NC}         -> Phiên bản hiện tại & lịch sử các bản phát hành (Release Backup)"
  echo -e "     4. ${GREEN}.agents/skills/godwar-agent-safeguard/SKILL.md${NC} -> 7 quy tắc tự vệ & bảo vệ tệp"

  echo -e "\n  ${BOLD}B. Theo loại công việc cụ thể (Task-Specific Mandatory Files):${NC}"
  case "$task" in
    combat|skill|animation|ai|ui|all|general)
      echo -e "     🔹 ${CYAN}[Tác vụ: Sửa Hoạt ảnh / Kỹ năng / AI / UI / Sàn đấu 3v3]${NC}"
      echo -e "        - Bắt buộc đọc Skill : ${GREEN}.agents/skills/godwar-combat-character/SKILL.md${NC}"
      echo -e "        - Bắt buộc đọc & sửa 1: ${GREEN}tools/asset-viewer/vargost-skill-test.js${NC} (Single Source of Truth)"
      echo -e "        - Bắt buộc đọc & sửa 2: ${GREEN}tools/asset-viewer/vargost-skill-test.html${NC} (Giao diện Tool & Đo Pixel)"
      echo -e "        - Bắt buộc đọc & sửa 3: ${GREEN}Asset/Scenes/battle_arena/battle_arena_3v3.gd${NC} (Đồng bộ 1:1 Godot APK)"
      echo -e "        - Bắt buộc đọc Node   : ${GREEN}Asset/Character/characters/vargost_combat/vargost_character.gd${NC}"
      echo -e "                                ${GREEN}Asset/Character/characters/aoda_combat/aoda_character.gd${NC}"
      ;;&
    add-char|gif|atlas|all|general)
      echo -e "     🔹 ${CYAN}[Tác vụ: Thêm Nhân Vật Mới / Bóc Tách GIF / Đóng Atlas]${NC}"
      echo -e "        - Bắt buộc đọc Skill : ${GREEN}.agents/skills/godwar-add-character/SKILL.md${NC}"
      echo -e "        - Bắt buộc đọc Data  : ${GREEN}Asset/Character/characters/height-targets.json${NC} (Chiều cao mục tiêu)"
      echo -e "        - Bắt buộc đọc Code  : ${GREEN}scripts/animation/gif_atlas_library.gd${NC}"
      echo -e "        - Lưu ý Hiến pháp    : GIF gốc chỉ dùng 1 lần để tách frame rồi xóa khỏi repo; sửa trực tiếp lên atlas cũ, cấm tạo file _old/_copy."
      ;;&
    apk|release|version|pr|sync|all|general)
      echo -e "     🔹 ${CYAN}[Tác vụ: Nâng Cấp Version / Xuất APK / Đồng Bộ Đa Máy / Mở PR]${NC}"
      echo -e "        - Bắt buộc đọc Skill : ${GREEN}.agents/skills/godwar-pr-workflow/SKILL.md${NC}"
      echo -e "        - Bắt buộc đọc Config: ${GREEN}version.json${NC}, ${GREEN}export_presets.cfg${NC}, ${GREEN}project.godot${NC}"
      echo -e "        - Lệnh bắt buộc chạy : ${GREEN}./scripts/bump_version.sh patch \"<Mô tả nâng cấp>\"${NC}"
      echo -e "                                ${GREEN}./scripts/build_android_apk.sh${NC}"
      ;;
  esac
}

verify_constitution() {
  echo -e "\n${YELLOW}🔍 [2] KIỂM TRA TUÂN THỦ HIẾN PHÁP TỰ ĐỘNG (CONSTITUTION AUDIT):${NC}"
  local errors=0

  # 1. Kiểm tra chuẩn khóa cứng 60 FPS trong project.godot & battle_arena_3v3.gd
  if grep -q "run/max_fps=60" project.godot && grep -q "common/physics_ticks_per_second=60" project.godot; then
    echo -e "  ✅ [Chuẩn 60 FPS] project.godot khóa cứng run/max_fps=60 & physics_ticks_per_second=60."
  else
    echo -e "  ${RED}❌ [VI PHẠM HIẾN PHÁP] project.godot bị lệch chuẩn 60 FPS!${NC}"
    errors=$((errors + 1))
  fi

  if grep -q "Engine.max_fps = 60" Asset/Scenes/battle_arena/battle_arena_3v3.gd && grep -q "Engine.physics_ticks_per_second = 60" Asset/Scenes/battle_arena/battle_arena_3v3.gd; then
    echo -e "  ✅ [Chuẩn 60 FPS] battle_arena_3v3.gd khóa cứng Engine.max_fps = 60."
  else
    echo -e "  ${RED}❌ [VI PHẠM HIẾN PHÁP] battle_arena_3v3.gd thiếu khóa cứng 60 FPS!${NC}"
    errors=$((errors + 1))
  fi

  # 2. Kiểm tra cấm file backup rác (_old, _backup, _copy, _temp) và file frame lẻ / thư mục mẫu dư thừa
  local backup_files
  backup_files=$(find Asset tools scripts -type f \( -name "*_old.*" -o -name "*_backup.*" -o -name "*_copy.*" -o -name "*_temp.*" \) 2>/dev/null || true)
  if [ -z "$backup_files" ]; then
    echo -e "  ✅ [Chống File Rác] Không có file backup rác (_old, _backup, _copy, _temp) trong Asset/tools/scripts."
  else
    echo -e "  ${RED}❌ [VI PHẠM HIẾN PHÁP] Phát hiện file backup rác làm phình repo:${NC}\n$backup_files"
    errors=$((errors + 1))
  fi

  local redundant_boss_frames
  redundant_boss_frames=$(find Asset/Character/characters/crapit_boss -type f \( -name "frame_*.png" -o -name "preview.gif" \) 2>/dev/null || true)
  if [ -z "$redundant_boss_frames" ] && [ ! -d "Scrapit_vfx_skill" ] && [ ! -d "Scrapit_animation" ]; then
    echo -e "  ✅ [Tối Ưu Asset Atlas-Only] Chỉ giữ lại Atlas + JSON cần thiết, không lưu frame lẻ / thư mục mẫu dư thừa."
  else
    echo -e "  ${RED}❌ [VI PHẠM HIẾN PHÁP] Phát hiện thư mục mẫu dư thừa hoặc frame lẻ chưa dọn dẹp:${NC}\n$redundant_boss_frames"
    errors=$((errors + 1))
  fi

  # 3. Kiểm tra tính hợp lệ của state.json và lịch sử
  if node -e 'const s = JSON.parse(require("fs").readFileSync("state.json", "utf8")); if (!s.current_task || !Array.isArray(s.history) || s.history.length < 5) process.exit(1);' 2>/dev/null; then
    echo -e "  ✅ [Bảo Toàn Bộ Nhớ] state.json hợp lệ và bảo toàn nguyên vẹn mảng history."
  else
    echo -e "  ${RED}❌ [VI PHẠM HIẾN PHÁP] state.json bị lỗi JSON hoặc mất lịch sử history!${NC}"
    errors=$((errors + 1))
  fi

  # 4. Kiểm tra đồng bộ Version giữa version.json, package.json, export_presets.cfg và project.godot
  local v_json v_pkg v_cfg v_code_json v_code_cfg
  v_json=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("version.json","utf8")).current_version)' 2>/dev/null || echo "missing")
  v_code_json=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("version.json","utf8")).version_code)' 2>/dev/null || echo "0")
  v_pkg=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("package.json","utf8")).version)' 2>/dev/null || echo "missing")
  v_cfg=$(grep '^version/name=' export_presets.cfg | cut -d'"' -f2)
  v_code_cfg=$(grep '^version/code=' export_presets.cfg | cut -d'=' -f2)

  if [ "$v_json" = "$v_pkg" ] && [ "$v_json" = "$v_cfg" ] && [ "$v_code_json" = "$v_code_cfg" ]; then
    echo -e "  ✅ [Đồng Bộ Version] version.json = package.json = export_presets.cfg = v${v_json} (code ${v_code_json})."
  else
    echo -e "  ${RED}❌ [LỆCH VERSION] version.json(${v_json}/${v_code_json}) != package.json(${v_pkg}) != export_presets.cfg(${v_cfg}/${v_code_cfg})${NC}"
    echo -e "     👉 Hãy chạy: ${YELLOW}./scripts/bump_version.sh sync${NC} hoặc ${YELLOW}./scripts/bump_version.sh patch \"<lý do>\"${NC}"
    errors=$((errors + 1))
  fi

  # 5. Kiểm tra bản backup APK theo version hiện tại
  local expected_backup="build/releases/GodWar-v${v_json}-code${v_code_json}.apk"
  if [ -f "$expected_backup" ]; then
    local sz
    sz=$(ls -lh "$expected_backup" | awk '{print $5}')
    echo -e "  ✅ [Backup Version APK] Đã lưu trữ bản backup: ${expected_backup} (${sz})."
  else
    echo -e "  ${YELLOW}⚠️  [Chưa Có Bản Backup APK Cho v${v_json}] Chưa thấy ${expected_backup}. Chạy ./scripts/build_android_apk.sh để tạo.${NC}"
  fi

  # 6. Kiểm tra cú pháp JS của Single Source of Truth
  if node --check tools/asset-viewer/vargost-skill-test.js 2>/dev/null; then
    echo -e "  ✅ [Cú Pháp Web Tool] tools/asset-viewer/vargost-skill-test.js hợp lệ 100%."
  else
    echo -e "  ${RED}❌ [LỖI CÚ PHÁP] tools/asset-viewer/vargost-skill-test.js bị lỗi cú pháp!${NC}"
    errors=$((errors + 1))
  fi

  if [ "$errors" -gt 0 ]; then
    echo -e "\n${RED}🚨 PHÁT HIỆN ${errors} VI PHẠM HIẾN PHÁP! AGENT BẮT BUỘC SỬA NGAY TRƯỚC KHI BÁO CÁO.${NC}"
    exit 1
  else
    echo -e "\n${GREEN}🎉 TẤT CẢ ĐIỀU KHOẢN HIẾN PHÁP ĐỀU ĐẠT CHUẨN 100%!${NC}"
  fi
}

print_header
case "$MODE" in
  guide)
    show_mandatory_reading "$TASK_TYPE"
    ;;
  verify)
    verify_constitution
    ;;
  *)
    show_mandatory_reading "$TASK_TYPE"
    verify_constitution
    ;;
esac

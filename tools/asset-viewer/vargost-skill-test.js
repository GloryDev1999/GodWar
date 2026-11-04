// Vargost Utility AI & Pixel Inspector Simulator
// Auto-battler 3v3 Engine Demo (GodWar)
// Chiêu Tối Thượng Blazing Halo (1100 px/s) & Utility AI Di Chuyển 4 Hướng Trực Giao

const W = 1920, H = 1080;
const stageCanvas = document.getElementById('stage');
const ctx = stageCanvas.getContext('2d', { willReadFrequently: true });

// Loupe Inspector Canvas
const loupeCanvas = document.getElementById('loupe-canvas');
const loupeCtx = loupeCanvas.getContext('2d');

// HUD Elements
const hudLocomotion = document.getElementById('hud-locomotion');
const hudAi = document.getElementById('hud-ai');
const hudRange = document.getElementById('hud-range');
const hudState = document.getElementById('hud-state');
const hudFrame = document.getElementById('hud-frame');
const hudProjectile = document.getElementById('hud-projectile');
const hudCoords = document.getElementById('hud-coords');

// Inspector Readout
const inspCanvasXy = document.getElementById('insp-canvas-xy');
const inspAnchorDxy = document.getElementById('insp-anchor-dxy');
const inspRgba = document.getElementById('insp-rgba');
const inspHex = document.getElementById('insp-hex');
const inspColorBox = document.getElementById('insp-color-box');
const inspCurrentSpawn = document.getElementById('insp-current-spawn');
const chkInspector = document.getElementById('chk-inspector');
const btnPickSpawn = document.getElementById('btn-pick-spawn');
const btnCopyCoords = document.getElementById('btn-copy-coords');
const toastMsg = document.getElementById('toast-msg');

// Timeline Elements
const rngFrame = document.getElementById('rng-frame');
const lblFrameNum = document.getElementById('lbl-frame-num');
const btnFrameFirst = document.getElementById('btn-frame-first');
const btnFramePrev = document.getElementById('btn-frame-prev');
const btnPlayPause = document.getElementById('btn-play-pause');
const btnFrameNext = document.getElementById('btn-frame-next');
const btnFrameLast = document.getElementById('btn-frame-last');

// Keyframe bookmarks
const kfIdle = document.getElementById('kf-idle');
const kfWindup = document.getElementById('kf-windup');
const kfCharged = document.getElementById('kf-charged');
const kfSwing = document.getElementById('kf-swing');
const kfThrust = document.getElementById('kf-thrust');
const kfRelease = document.getElementById('kf-release');
const kfReignite = document.getElementById('kf-reignite');

// Combat & Locomotion Controls
const btnFlyForward = document.getElementById('btn-fly-forward');
const btnFlyBackward = document.getElementById('btn-fly-backward');
const btnLand = document.getElementById('btn-land');
const btnTakeoff = document.getElementById('btn-takeoff');
const btnFly10h = document.getElementById('btn-fly-10h');
const btnFly2h = document.getElementById('btn-fly-2h');
const btnFly8h = document.getElementById('btn-fly-8h');
const btnFly4h = document.getElementById('btn-fly-4h');
const btnSpeedSlow = document.getElementById('btn-speed-slow');
const btnSpeedFast = document.getElementById('btn-speed-fast');
const btnBlazingHalo = document.getElementById('btn-blazing-halo');
const btnToggleDirection = document.getElementById('btn-toggle-direction');
const btnCastLegacy = document.getElementById('btn-cast');
const chkAuto = document.getElementById('chk-auto');
const chkMovingTarget = document.getElementById('chk-moving-target');
const btnEnemyDash = document.getElementById('btn-enemy-dash');
const btnEnemyAttack = document.getElementById('btn-enemy-attack');
const btnTestDeath = document.getElementById('btn-test-death');
const rngDistance = document.getElementById('rng-distance');
const lblDistance = document.getElementById('lbl-distance');
const btnTestNear = document.getElementById('btn-test-near');
const btnTestFar = document.getElementById('btn-test-far');
const btnTestOvershoot = document.getElementById('btn-test-overshoot');
const rngFlySpeed = document.getElementById('rng-fly-speed');
const lblFlySpeed = document.getElementById('lbl-fly-speed');
const rngVerticalSpeed = document.getElementById('rng-vertical-speed');
const lblVerticalSpeed = document.getElementById('lbl-vertical-speed');
const rngTilt = document.getElementById('rng-tilt');
const lblTilt = document.getElementById('lbl-tilt');
const numSpawnDx = document.getElementById('num-spawn-dx');
const numSpawnDy = document.getElementById('num-spawn-dy');
const selRate = document.getElementById('sel-rate');
const btnReset = document.getElementById('btn-reset');

// Aoda & Environment DOM Elements
const hudAodaState = document.getElementById('hud-aoda-state');
const hudAodaAi = document.getElementById('hud-aoda-ai');
const hudEnvStatus = document.getElementById('hud-env-status');
const btnAodaSkill1 = document.getElementById('btn-aoda-skill-1');
const btnAodaSwitchPlatform = document.getElementById('btn-aoda-switch-platform');
const btnAodaTurn = document.getElementById('btn-aoda-turn');
const btnAodaTestKo = document.getElementById('btn-aoda-test-ko');
const chkAodaAi = document.getElementById('chk-aoda-ai');
const chkShowEnv = document.getElementById('chk-show-env');
const chkGroundDummy = document.getElementById('chk-ground-dummy');

// Central Holy Sword Objective DOM Elements (Asset/Character/vfx/sword.mp4)
const hudObjectiveStatus = document.getElementById('hud-objective-status');
const hudVargostObjective = document.getElementById('hud-vargost-objective');
const hudAodaObjective = document.getElementById('hud-aoda-objective');
const btnResetMatch = document.getElementById('btn-reset-match');

// System Constants
const MIN_ATTACK_RANGE = 150;
const MAX_ATTACK_RANGE = 550;
const SPEED_SLOW = 100;
const SPEED_NORMAL = 250;
const SPEED_FAST = 400;
const PROJECTILE_SPEED_PX = 1100;
const MAX_FRAME_INDEX = 82;

// Scene Coordinates & Scales
// ĐỒNG BỘ 1:1 KÍCH THƯỚC PIXEL VỚI MOBILE (zoom = 1.0, mapScale = 3.75, mapX = 0, mapY = -120)
// Toàn bộ tọa độ hiển thị và logic giữa Web Tool và Mobile Godot APK là 100% khớp pixel.
const zoom = 1.0;
const mapScale = (W / 512) * zoom;
const mapX = (W - 512 * mapScale) / 2;
const mapY = (H - 352 * mapScale) / 2;
const groundY = mapY + 194.0 * mapScale; // Stone platform ground level
const baseFlyY = mapY + 95.0 * mapScale;  // Sky flight height
const skyCeilingY = mapY + 28.0 * mapScale; // Trần bay trên cao (12h/10h/2h)
const skyLowY = mapY + 140.0 * mapScale;     // Tầng bay thấp (4h/8h)

// =============================================================
// 2 KHU VỰC CĂN CỨ XUẤT PHÁT & HỒI SINH (SPAWN / RESPAWN BASES)
// Theo bản vẽ chỉ định của Owner (2 vòng tròn đỏ Trái & Phải):
// - Căn cứ Trái (Left Base - Zone 1):
//   + Bộ binh (Ground): Xuất hiện trên địa hình Platform 1A (Sau Cây Cao, X≈85, Y=260) / Platform 1 Top
//   + Nhân vật bay (Air): Xuất hiện trên không trung quanh khu vực này (X≈88, Y≈145)
// - Căn cứ Phải (Right Base - Zone 3):
//   + Bộ binh (Ground): Xuất hiện trên địa hình Platform 3A / 3B (Vách Đá Cao, X≈410, Y=100 / X≈455, Y=130)
//   + Nhân vật bay (Air): Xuất hiện trên không trung quanh khu vực này (X≈415, Y≈55)
// =============================================================
const TEAM_SPAWN_ZONES = {
  left: {
    id: 'base_left',
    name: 'Căn Cứ Trái (Sát Mép Map Trái)',
    facing: 1, // Xuất phát bên Trái -> Tiến sang Phải về Thánh Kiếm
    circleX: mapX + 32.0 * mapScale,
    circleY: mapY + 210.0 * mapScale,
    circleRadius: 45.0 * mapScale,
    airX: mapX + 34.0 * mapScale,
    airY: mapY + 140.0 * mapScale,
    groundPlatformIndex: 1, // Platform 1 Top (Sát Mép Trái)
    groundX: mapX + 24.0 * mapScale,
    groundY: mapY + 226.0 * mapScale
  },
  right: {
    id: 'base_right',
    name: 'Căn Cứ Phải (Sát Mép Map Phải)',
    facing: -1, // Xuất phát bên Phải -> Tiến sang Trái về Thánh Kiếm
    circleX: mapX + 480.0 * mapScale,
    circleY: mapY + 130.0 * mapScale,
    circleRadius: 45.0 * mapScale,
    airX: mapX + 485.0 * mapScale,
    airY: mapY + 75.0 * mapScale,
    groundPlatformIndex: 4, // Platform 3A / 3B (Sát Mép Phải)
    groundX: mapX + 478.0 * mapScale,
    groundY: mapY + 130.0 * mapScale
  }
};

function getTeamBaseSpawn(teamNum, originDir = teamOriginDirection) {
  // Team 1 ở căn cứ Trái khi originDir === 1, Team 2 ở căn cứ đối diện (Phải)
  const isLeft = (teamNum === 1) ? (originDir === 1) : (originDir !== 1);
  return isLeft ? TEAM_SPAWN_ZONES.left : TEAM_SPAWN_ZONES.right;
}

// Actor Position & State
let vargostX = TEAM_SPAWN_ZONES.left.airX;
let vargostY = TEAM_SPAWN_ZONES.left.airY;
let targetVargostX = vargostX;
let targetVargostY = vargostY;
let transitionStartY = vargostY;
let isFlying = true;
let currentTilt = 0; // in radians
let currentScaleX = 1.0;
let currentScaleY = 1.0;
let currentFlySpeed = SPEED_NORMAL; // Tốc độ trung bình 250px/s (giới hạn [100, 400])
let teamOriginDirection = 1; // 1: Đội Trái xuất phát bên Trái, -1: Đội Phải xuất phát bên Phải
let facingDirection = 1; // Hướng nhìn/chiến đấu hiện tại (1: nhìn phải, -1: nhìn trái)
let targetFacingVisual = 1.0;
let visualFacing = 1.0;
let turnSquashY = 1.0;
let verticalFlySpeed = 180; // px/s (giới hạn 100 - 300 px/s khi bay lên / bay xuống)
let vargostStunTimer = 0; // Thời gian Vargost bị định thân (không thể di chuyển)
let vargostSilenceTimer = 0; // Thời gian Vargost bị câm lặng (không thể tung chiêu Blazing Halo)
let vargostSpawnFreezeTimer = 1.0; // Đứng bất động 1s khi xuất phát / hồi sinh
let aodaSpawnFreezeTimer = 1.0; // Đứng bất động 1s khi xuất phát / hồi sinh

// -------------------------------------------------------------
// ENVIRONMENT COLLISION ZONES (3 Phân Vùng Đất Tường & Bệ Bước)
// -------------------------------------------------------------
const ENV_ZONES = [
  {
    id: 'zone_1',
    name: 'Zone 1: Trái Dưới (3 Bậc Đá & Gốc Cây)',
    color: 'rgba(235, 87, 87, 0.25)',
    strokeColor: '#eb5757',
    polygon: [
      [mapX + 0 * mapScale, mapY + 226 * mapScale],
      [mapX + 36 * mapScale, mapY + 226 * mapScale],
      [mapX + 36 * mapScale, mapY + 260 * mapScale],
      [mapX + 128 * mapScale, mapY + 260 * mapScale],
      [mapX + 128 * mapScale, mapY + 292 * mapScale],
      [mapX + 228 * mapScale, mapY + 292 * mapScale],
      [mapX + 228 * mapScale, mapY + 351 * mapScale],
      [mapX + 0 * mapScale, mapY + 351 * mapScale]
    ],
    surfaces: [
      { id: 'plat_1_top', name: 'Platform 1 Top (Bậc Cao Cùng Trái - Cục Đất Xót)', minX: mapX + 0 * mapScale, maxX: mapX + 36 * mapScale, y: mapY + 226 * mapScale },
      { id: 'plat_1a', name: 'Platform 1A (Sau Cây Cao)', minX: mapX + 38 * mapScale, maxX: mapX + 128 * mapScale, y: mapY + 260 * mapScale },
      { id: 'plat_1b', name: 'Platform 1B (Bậc Thấp Trái)', minX: mapX + 130 * mapScale, maxX: mapX + 228 * mapScale, y: mapY + 292 * mapScale }
    ]
  },
  {
    id: 'zone_2',
    name: 'Zone 2: Bệ Đá Bay Giữa',
    color: 'rgba(242, 153, 74, 0.25)',
    strokeColor: '#f2994a',
    polygon: [
      [mapX + 192 * mapScale, mapY + 194 * mapScale],
      [mapX + 260 * mapScale, mapY + 194 * mapScale],
      [mapX + 260 * mapScale, mapY + 245 * mapScale],
      [mapX + 235 * mapScale, mapY + 275 * mapScale],
      [mapX + 205 * mapScale, mapY + 275 * mapScale],
      [mapX + 188 * mapScale, mapY + 245 * mapScale],
      [mapX + 188 * mapScale, mapY + 194 * mapScale]
    ],
    surfaces: [
      { id: 'plat_2', name: 'Platform 2 (Bệ Giữa)', minX: mapX + 192 * mapScale, maxX: mapX + 260 * mapScale, y: mapY + 194 * mapScale }
    ]
  },
  {
    id: 'zone_3',
    name: 'Zone 3: Vách Đá Phải',
    color: 'rgba(39, 174, 96, 0.25)',
    strokeColor: '#27ae60',
    polygon: [
      [mapX + 286 * mapScale, mapY + 100 * mapScale],
      [mapX + 422 * mapScale, mapY + 100 * mapScale],
      [mapX + 422 * mapScale, mapY + 130 * mapScale],
      [mapX + 488 * mapScale, mapY + 130 * mapScale],
      [mapX + 488 * mapScale, mapY + 164 * mapScale],
      [mapX + 511 * mapScale, mapY + 164 * mapScale],
      [mapX + 511 * mapScale, mapY + 351 * mapScale],
      [mapX + 284 * mapScale, mapY + 351 * mapScale],
      [mapX + 284 * mapScale, mapY + 289 * mapScale],
      [mapX + 365 * mapScale, mapY + 289 * mapScale],
      [mapX + 375 * mapScale, mapY + 205 * mapScale],
      [mapX + 350 * mapScale, mapY + 175 * mapScale],
      [mapX + 305 * mapScale, mapY + 175 * mapScale],
      [mapX + 286 * mapScale, mapY + 120 * mapScale]
    ],
    surfaces: [
      { id: 'plat_3a', name: 'Platform 3A (Vách Đá Cao)', minX: mapX + 286 * mapScale, maxX: mapX + 422 * mapScale, y: mapY + 100 * mapScale },
      { id: 'plat_3b', name: 'Platform 3B (Bậc Giữa Phải)', minX: mapX + 427 * mapScale, maxX: mapX + 488 * mapScale, y: mapY + 130 * mapScale },
      { id: 'plat_3c', name: 'Platform 3C (Mép Phải)', minX: mapX + 488 * mapScale, maxX: mapX + 511 * mapScale, y: mapY + 164 * mapScale },
      { id: 'plat_3d', name: 'Platform 3D (Đáy Vực Boss Crapit)', minX: mapX + 284 * mapScale, maxX: mapX + 365 * mapScale, y: mapY + 289.0 * mapScale }
    ]
  }
];

function isPointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 1e-6) return null;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) };
  }
  return null;
}

function raycastEnvCollision(x1, y1, x2, y2, allowedZoneIds = null) {
  let closestHit = null;
  let minDistance = Infinity;
  for (const zone of ENV_ZONES) {
    if (allowedZoneIds && !allowedZoneIds.includes(zone.id)) continue;
    const poly = zone.polygon;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const hit = lineIntersect(x1, y1, x2, y2, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
      if (hit) {
        const d = Math.hypot(hit.x - x1, hit.y - y1);
        if (d < minDistance) {
          minDistance = d;
          closestHit = { hitX: hit.x, hitY: hit.y, zone: zone.id };
        }
      }
    }
  }
  return closestHit;
}

function isPointInSolid(px, py) {
  for (const zone of ENV_ZONES) {
    if (isPointInPolygon(px, py, zone.polygon)) return zone;
  }
  return null;
}

function isVargostColliding(px, py, extraMargin = 0) {
  const scale = mapScale / 2.625;
  const r = (24 + extraMargin) * scale;
  const yPoints = [py, py - 6 * scale, py - 35 * scale, py - 65 * scale];
  const xOffsets = [-r, 0, r];
  for (const y of yPoints) {
    for (const xOff of xOffsets) {
      const zone = isPointInSolid(px + xOff, y);
      if (zone) return zone;
    }
  }
  return null;
}

// Giải tỏa va chạm an toàn tuyệt đối: Không để Vargost kẹt vào bất kỳ khối địa hình nào
function resolveCollisionSafe(tx, ty, isFlyingMode) {
  const scale = mapScale / 2.625;
  const minX = mapX + 60 * mapScale;
  const maxX = mapX + 490 * mapScale;
  let cx = Math.max(minX, Math.min(maxX, tx));
  let cy = isFlyingMode ? Math.max(skyCeilingY, Math.min(skyLowY, ty)) : groundY;

  const arenaCenterX = mapX + 225 * mapScale;

  if (isVargostColliding(cx, cy)) {
    if (isFlyingMode) {
      cy = skyCeilingY + 12 * scale;
    }
    if (isVargostColliding(cx, cy)) {
      cx = (cx > arenaCenterX) ? (cx - 65 * scale) : (cx + 65 * scale);
    }
    if (isVargostColliding(cx, cy)) {
      const zone3FaceX = mapX + 284 * mapScale;
      cx = (cx >= zone3FaceX) ? (zone3FaceX - 50 * scale) : (mapX + 160 * mapScale);
      cy = skyCeilingY + 10 * scale;
    }
  }
  return { x: cx, y: cy };
}

// Kiểm tra xem phía sau lưng theo hướng lùi có bị tường / địa hình / biên giới hạn chặn không
function isRetreatBlocked(fromX, fromY, retreatDir, checkDist = 70) {
  const scale = mapScale / 2.625;
  const targetX = fromX + retreatDir * checkDist * scale;
  const minX = mapX + 80 * mapScale;
  const maxX = mapX + 475 * mapScale;
  if (targetX < minX || targetX > maxX) return true;
  return isVargostColliding(targetX, fromY, 6);
}

// Tính toán điểm dịch chuyển lùi an toàn với cơ chế VERTICAL ESCAPE khi vướng địa hình
function calculateSafeRetreat(fromX, fromY, retreatDir, desiredDistance) {
  const scale = mapScale / 2.625;
  const step = desiredDistance;
  const candX = fromX + retreatDir * step;
  const candY = fromY;

  const coll = isVargostColliding(candX, candY, 6);
  const minX = mapX + 75 * mapScale;
  const maxX = mapX + 475 * mapScale;
  const isOutOfBounds = (candX < minX || candX > maxX);

  if (!coll && !isOutOfBounds) {
    return { x: candX, y: candY, escapedVertically: false };
  }

  // NẾU BỊ VƯỚNG ĐỊA HÌNH HOẶC KHÔNG THỂ LÙI NGANG:
  // TỰ ĐỘNG THOÁT KẸT LÊN TRÊN VÀO KHÔNG PHẬN THOÁNG ĐÃNG
  const escapeY = skyCeilingY + 12 * scale;
  let escapeX = fromX;
  const zone3FaceX = mapX + 284 * mapScale;

  if (Math.abs(escapeX - zone3FaceX) < 65 * scale) {
    escapeX = zone3FaceX - 70 * scale;
  }
  escapeX = Math.max(mapX + 120 * mapScale, Math.min(mapX + 270 * mapScale, escapeX));

  showToast('⚡ Vargost: Sau lưng là tường! Bay vút lên không trung thoát kẹt & tấn công từ trên cao');
  return { x: escapeX, y: escapeY, escapedVertically: true };
}

// -------------------------------------------------------------
// AODA (90px Ground Melee Fighter) & SKILLS STATE
// -------------------------------------------------------------
const AODA_PLATFORMS = [
  ENV_ZONES[0].surfaces[1], // 0: Platform 1A: Sau Cây Cao (minX ~38, maxX ~128, Y ~745) - Căn cứ Trái
  ENV_ZONES[0].surfaces[0], // 1: Platform 1 Top: Bậc Cao Trái Cùng (minX ~0, maxX ~36, Y ~656)
  ENV_ZONES[0].surfaces[2], // 2: Platform 1B: Bậc Thấp Trái (minX ~130, maxX ~228, Y ~829)
  ENV_ZONES[1].surfaces[0], // 3: Platform 2: Bệ Giữa (minX ~192, maxX ~260, Y ~587) - Thánh Kiếm
  ENV_ZONES[2].surfaces[0], // 4: Platform 3A: Vách Đá Cao Phải (minX ~286, maxX ~422, Y ~325) - Căn cứ Phải
  ENV_ZONES[2].surfaces[1]  // 5: Platform 3B: Bậc Giữa Phải (minX ~427, maxX ~488, Y ~404) - Căn cứ Phải
];

// Aoda (Team 2 · Bộ Binh): Xuất phát tại Căn Cứ Phải (Platform 3A trong Vòng Tròn Đỏ Phải) tiến về Trái tranh Thánh Kiếm!
let aodaPlatformIndex = 4;
let aodaPlatform = AODA_PLATFORMS[aodaPlatformIndex];
let aodaX = TEAM_SPAWN_ZONES.right.groundX;
let aodaY = aodaPlatform.y;
let aodaFacing = -1; // -1: Nhìn sang trái (hướng từ Căn cứ Phải tiến vào trung tâm Thánh Kiếm)
let aodaVisualFacing = -1.0;
let aodaState = 'MOVE'; // 'IDLE', 'MOVE', 'SKILL_1_WINDUP', 'SKILL_1_RECOVERY', 'SKILL_2_WINDUP', 'SKILL_2_RECOVERY', 'KO'
let aodaHp = 100;
let aodaMaxHp = 100;
let aodaStunTimer = 0;
let aodaHitFlash = 0;
let aodaFrameIndex = 65; // Frame 66 bắt đầu chuỗi chạy bộ
let aodaAnimAccum = 0;
let aodaPatrolSpeed = 160; // px/s (Mức 1: đầm chắc, chân thực)
let aodaChaseSpeed = 160; // px/s
let aodaTornadoCooldown = 0; // Cooldown 5s cho Chiêu 1 (Tornado)
let aodaFireOrbCooldown = 0; // Cooldown 5s cho Chiêu 2 (FireOrb)
let aodaNovaCooldown = 0;    // Alias giữ tương thích
let aodaDeathTimer = 0;
let aodaIsDead = false;
let aodaLockedFacing = 1;
const aodaDamageGhosts = [];
const aodaDamageNumbers = [];

// Aoda Ledge Jumping state
let aodaJumpTimer = 0;
let aodaJumpDuration = 0.75;
let aodaJumpStartX = 0;
let aodaJumpStartY = 0;
let aodaJumpTargetX = 0;
let aodaJumpTargetY = 0;
let aodaJumpTargetPlatform = null;
let aodaLandingTimer = 0;

// Central Holy Sword Objective (Asset/Character/vfx/sword.mp4)
let swordFrames = null;
let swordFrameIndex = 0;
let swordAnimAccum = 0.0;
const SWORD_X = mapX + 226 * mapScale;
const SWORD_Y = mapY + 194 * mapScale;
const SWORD_CAPTURE_RADIUS = 135 * (mapScale / 2.625);
const SWORD_CAPTURE_REQUIRED = 20.0; // 20.0s liên tục
let swordCaptureTimer = 0.0;
let swordControllingTeam = null; // 1: Vargost, 2: Aoda, null: Neutral
let isSwordContested = false;
let matchWinner = null;
const swordCaptureParticles = [];

// Active VFX Instances
const activeTornadoes = [];
const activeRedNovas = []; // Giữ mảng trống để tương thích ngược

// =============================================================
// NEUTRAL MAP BOSS: BOSS CRAPIT (crapit_main)
// - Nằm ngoài 6 nhân vật của 2 đội, đặt tại tọa độ (1164, 752) trên map
// - HP = 2150, chỉ xuất hiện 1 lần duy nhất mỗi trận (bị tiêu diệt không hồi sinh lại)
// - Chỉ tấn công nhân vật đang đứng trong vùng Thánh Kiếm; khi đã phóng đạn sẽ khóa mục tiêu
//   không trượt, xuyên qua Địa hình số 2 (Zone 2) nhưng bị cản bởi Địa hình số 1 & số 3
// - Chu kỳ nghỉ 5.0s - 7.0s, vận chiêu Frame 5..7, nhả cầu nước bọt ở Frame 8 từ Pin(103,229)
//   trượt mượt sang Box[56,232,33,28], bay 500px/s kích thước 30x30 xoay tròn, nổ 40x40
// - Gây 15 sát thương + hiệu ứng bất lợi Cấm Hồi Máu (Anti-Heal icon dưới thanh máu) đến khi chết
// - Nhân vật bị Crapit đánh sẽ phản xạ quay sang đánh trả đến khi Boss chết hoặc tướng chết
// - Khi chết: Pixel Dissolve từ dưới lên trên + bay lên cao 20px, ghi nhận người đánh đòn cuối
//   và cấu trúc mở rộng rớt vật phẩm mang về Rương tại Căn Cứ Hồi Sinh cho tương lai.
// =============================================================
const CRAPIT_MAX_HP = 2150;
const CRAPIT_ATTACK_DAMAGE = 15;
const CRAPIT_ORB_SPEED_PX = 500;
const CRAPIT_DISPLAY_SCALE = 0.5682;
const CRAPIT_FRAME_W = 282;
const CRAPIT_FRAME_H = 512;
const CRAPIT_ANCHOR_X = 148.0;
const CRAPIT_ANCHOR_Y = 332.0;
const CRAPIT_ANCHOR_PX = [148.0, 332.0];
// Pin #1 (103, 229) -> nâng lên miệng offset [-45, -121] so với Anchor (148, 332)
const CRAPIT_MOUTH_PIN_DX = -45.0;
const CRAPIT_MOUTH_PIN_DY = -121.0;
// Box #2 [56, 232, 33, 28] -> nâng lên miệng offset [-75.5, -104] so với Anchor (148, 332)
const CRAPIT_SALIVA_BOX_DX = -75.5;
const CRAPIT_SALIVA_BOX_DY = -104.0;

// TỌA ĐỘ ĐÍCH HỘ TỐNG CỔ VẬT VỀ CĂN CỨ (Sát mép map: Left Base ~28, 226 | Right Base ~480, 130 trên Map)
const LEFT_EXTRACTION_X = mapX + 28.0 * mapScale;
const LEFT_EXTRACTION_Y = mapY + 226.0 * mapScale;
const RIGHT_EXTRACTION_X = mapX + 480.0 * mapScale;
const RIGHT_EXTRACTION_Y = mapY + 130.0 * mapScale;
const EXTRACTION_RADIUS = 80.0 * (mapScale / 2.625);

// TỌA ĐỘ BOSS CRAPIT: Nằm tiếp đất trên bề mặt bệ đá đáy Platform 3D sát mép tường (X=1280, Y=963.75 trên canvas 1920x1080)
let crapitX = mapX + 341.3333 * mapScale; // 1280.0
let crapitY = mapY + 289.0 * mapScale; // 963.75
let crapitFacing = 1; // 1: Quay mặt sang Trái (về phía Thánh Kiếm), -1: Quay Phải
let crapitHp = CRAPIT_MAX_HP;
let crapitIsDead = false;
let crapitDeathTimer = 0.0;
let crapitState = 'IDLE'; // 'IDLE' (0..4), 'WINDUP' (5..7), 'RELEASE' (8), 'DEAD'
let crapitFrameIndex = 0;
let crapitAnimAccum = 0.0;
let crapitAttackCooldown = 5.5; // Ngắt quãng 5.0s - 7.0s sau mỗi đợt tấn công
let crapitLockedTargetIds = []; // Mảng danh sách tất cả mục tiêu trong vùng Thánh Kiếm để tấn công đa mục tiêu
let crapitHitFlash = 0.0;
let crapitLastHitBy = null; // Ghi nhận tướng đánh đòn cuối kết liễu Boss ('vargost' | 'aoda')
const crapitDamageGhosts = [];
const activeCrapitProjectiles = [];
const activeCrapitExplosions = [];

// Trạng thái Hiệu ứng bất lợi Cấm Hồi Máu (Anti-Heal) & Phản xạ đánh trả Boss Crapit
let vargostAntiHeal = false; // Tồn tại đến khi tướng chết hoặc được giải
let vargostRetaliateBoss = false; // Phản xạ đánh trả Boss đến khi Boss chết hoặc tướng chết
let aodaAntiHeal = false;
let aodaRetaliateBoss = false;

// Cấu trúc Vật Phẩm Rơi Từ Boss & Hộ Tống Về Căn Cứ
const bossLootDrop = {
  active: false,
  x: 0,
  y: 0,
  shineTimer: 0.0,
  lockedPickerId: null, // Ban đầu chỉ người kết liễu (crapitLastHitBy) mới nhặt được
  carrierId: null,      // Khi nhặt được: hiện icon 10x10 trên thanh máu, đội mang giảm 10% tốc độ, 2 đồng đội hộ tống
  isFreeForAll: false,  // Khi người cầm bị giết rơi ra: bất kỳ tướng nào cũng nhặt được
  isDelivered: false
};

// Ground Training Dummy on Platform 2 (Bệ Giữa)
let groundDummyX = mapX + 220 * mapScale; // X ≈ 865
let groundDummyY = mapY + 194 * mapScale; // Y ≈ 587.2
let groundDummyHp = 100;
let groundDummyStunTimer = 0;
let groundDummySilenceTimer = 0;
let groundDummyHitFlash = 0;
let groundDummyMoveDir = 1;
const groundDummyDamageGhosts = [];

// Locomotion States: 'IDLE_FLY', 'FLY_FORWARD', 'FLY_BACKWARD', 'LANDING', 'IDLE_GROUND', 'TAKEOFF'
let locomotionState = 'IDLE_FLY';
let transitionProgress = 0;

// Combat AI States: 'IDLE', 'REPOSITIONING', 'HALO_WINDUP', 'HALO_RECOVERY'
let aiState = 'IDLE';
let pendingCombatAction = null;
let isPlaying = true;
let currentFrameIndex = 0;
let frameTimeAccumulator = 0;
let hoverTimer = 0;
let autoCooldown = 1.5;
let altitudeCooldown = 15.0; // Cooldown khóa độ cao (>= 15s) triệt tiêu vòng lặp cất/hạ cánh
let aiDecisionTimer = 0.3;
let losEvasiveTimer = 0; // Đếm thời gian né chướng ngại vật (timeout 0.8s tránh kẹt)
let repositioningTimer = 0; // Đếm thời gian tái định vị (timeout 1.0s tránh kẹt)

// Motion ghosting afterimages for flight
const motionGhosts = [];

// Projectiles & Impact VFX
let activeProjectile = null;
let activeExplosion = null;
const groundDustRings = [];
const emberParticles = []; // Hạt tàn tro pixel lửa khi biến ảnh / tan rã 2.5D
const enemyDamageNumbers = []; // Số nhảy sát thương bùng nổ
const activeHitImpacts = []; // Hit Impact VFX: Chớp nổ tia lửa 4 cánh & Sóng xung kích

// Vargost HP & Hurt Reaction State (Hoạt ảnh khi bị kẻ địch phản công)
let vargostHp = 1000;
const VARGOST_MAX_HP = 1000;
let vargostHitFlash = 0; // Chớp đỏ/trắng khi dính đòn
let vargostRecoilTimer = 0; // Giật lùi quán tính
const vargostDamageGhosts = []; // Hiệu ứng ống máu Gothic: Phần bị trừ sáng lên đột ngột -> Pixel Dissolve
const enemyDamageGhosts = [];

// Death & KO Evaporation State (Hoạt ảnh gục ngã: 0.3s đứng hình -> Bốc hơi pixel bay lên 30px)
let isDead = false;
let deathTimer = 0;

// Offscreen Canvas for Full-Body Whiteout Hit Flash (Lóe sáng toàn thân trắng tinh khi trúng đòn)
const flashCanvas = (typeof document !== 'undefined' && typeof document.createElement === 'function') ? document.createElement('canvas') : null;
if (flashCanvas) { flashCanvas.width = 700; flashCanvas.height = 700; }
const flashCtx = flashCanvas ? flashCanvas.getContext('2d', { willReadFrequently: true }) : null;

function renderFullBodyFlash(targetCtx, sx, sy, sw, sh, dx, dy, dw, dh, flashAlpha, customSourceImg = null) {
  const sourceImg = customSourceImg || (assets && assets.vargost);
  if (!flashCtx || !sourceImg) return;
  if (flashCanvas.width < sw || flashCanvas.height < sh) {
    flashCanvas.width = Math.max(flashCanvas.width, sw);
    flashCanvas.height = Math.max(flashCanvas.height, sh);
  }
  flashCtx.clearRect(0, 0, sw, sh);
  flashCtx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, sw, sh);
  flashCtx.save();
  flashCtx.globalCompositeOperation = 'source-in';
  // Chớp nhấp nháy 2 nhịp sắc sảo: Trắng tinh -> Đỏ cam rực rỡ
  flashCtx.fillStyle = (Math.floor(hoverTimer * 45) % 2 === 0) ? '#ffffff' : '#ff4d4d';
  flashCtx.fillRect(0, 0, sw, sh);
  flashCtx.restore();

  targetCtx.save();
  targetCtx.globalAlpha = Math.min(1.0, flashAlpha);
  targetCtx.drawImage(flashCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
  targetCtx.restore();
}

// Phase Blink & Teleport Dissolve State (Thân pháp biến ảnh chớp tắt & dịch chuyển lùi)
let isPhaseBlinking = false;
let phaseBlinkTimer = 0;
const PHASE_BLINK_TOTAL = 0.38; // Tổng thời lượng 0.38s (3 nhịp: 0.14s tan rã chớp tắt, 0.08s tàng hình dạt vị trí, 0.16s tụ lại)
let phaseBlinkTargetFacing = 1;
let phaseBlinkStep = 0; // 0: Idle, 1: Dissolve & Flash, 2: Void Shift, 3: Re-materialize
let currentDissolveFactor = 0;
let isGlitchFlash = false;
let teleportTargetX = vargostX;
let teleportTargetY = vargostY;

// Turn Teleport Dissolve State (Hiệu ứng Teleport Pixel Dissolve lật mặt che giấu hoạt ảnh xoay cứng)
let isTurnFlipping = false;
let turnFlipTimer = 0;
let turnFlipNewFacing = 1;
const TURN_FLIP_DURATION = 0.14; // Tổng 0.14s snappy (~8-9 frames ở 60 FPS)

function requestFacing(newFacing) {
  if (!newFacing || newFacing === facingDirection) return;
  if (isPhaseBlinking || isDead) {
    facingDirection = newFacing;
    targetFacingVisual = newFacing;
    visualFacing = newFacing;
    return;
  }
  if (isTurnFlipping) {
    turnFlipNewFacing = newFacing;
    return;
  }
  isTurnFlipping = true;
  turnFlipTimer = 0;
  turnFlipNewFacing = newFacing;
  emberParticles.push({
    x: vargostX,
    y: (vargostY + (isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0)),
    vx: (Math.random() - 0.5) * 60,
    vy: -Math.random() * 50 - 20,
    size: 2.5,
    alpha: 0.9,
    color: '#f0883e',
    life: 0.35
  });
}

// Dynamic Moving Enemy Dummy State (Tốc độ dao động 300 - 1000 px/s & Phản Công)
let enemyWorldX = null;
let enemyMoveDir = -1; // -1: Tiến sang trái, 1: Tiến sang phải
let enemyPatrolSpeed = 220; // px/s (giới hạn [100, 300] px/s)
let isEnemyDashing = false;
let enemyDashTimer = 0;
let enemyDashSpeed = 300; // px/s (giới hạn [100, 300] px/s)
let enemyStunTimer = 0; // Đứng hình 0.1s (Hit Stun) khi dính đòn
let enemyHp = 100;
let enemyHitFlash = 0;
let enemyAttackCooldown = 3.8; // Chu kỳ bắn Ám Tiễn phản công Vargost
let enemyDodgeCooldown = 0; // Cooldown phản xạ né đòn
const activeEnemyProjectiles = []; // Đạn Ám Tiễn Hắc Ám của kẻ địch phản công

// Inspector State
let mouseX = 0, mouseY = 0;
let isPickingSpawn = false;

// Load Assets
const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = (e) => reject(new Error(`Failed to load ${url}`));
  img.src = url;
});

const loadJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
};

const assets = {};

async function initAssets() {
  try {
    assets.manifest = await loadJSON('/Asset/Character/characters/vargost_combat/vargost_actions.json');
    assets.vargost = await loadImage('/' + assets.manifest.atlas_path);
    assets.projectile = await loadImage('/' + assets.manifest.projectile_atlas);
    assets.explosion = await loadImage('/' + assets.manifest.explosion_atlas);
    assets.map = await loadImage('/Asset/Scenes/amore_scale_test/map.png');

    // Nạp UI Ống Máu Gothic RPG theo mẫu image copy.png (Lõi thủy tinh + Khung kim loại)
    assets.healthBarEmpty = await loadImage('/Asset/Character/characters/vargost_combat/ui/health_bar_empty.png').catch(() => null);
    assets.healthBarBlood = await loadImage('/Asset/Character/characters/vargost_combat/ui/health_bar_blood.png').catch(() => null);
    assets.healthBarGreen = await loadImage('/Asset/Character/characters/vargost_combat/ui/health_bar_green.png').catch(() => null);
    assets.healthBarGlass = await loadImage('/Asset/Character/characters/vargost_combat/ui/health_bar_glass.png').catch(() => null);

    // Nạp Aoda Combat assets (90px) & 2 VFX Packs (Red Tornado & Burst Left)
    try {
      assets.aodaManifest = await loadJSON('/Asset/Character/characters/aoda_combat/aoda_actions.json').catch(() => null);
      assets.aodaAtlases = [];
      for (let i = 0; i <= 10; i++) {
        const pad = String(i).padStart(3, '0');
        const at = await loadImage(`/Asset/Character/fine_candidates/aoda/atlas_${pad}.png`).catch(() => null);
        assets.aodaAtlases.push(at);
      }
      assets.vfxTornado = await loadImage('/Asset/Character/characters/aoda_combat/vfx_red_tornado/atlas.png').catch(() => null);
  assets.swordObjective = await loadImage('/Asset/Character/characters/sword_objective/atlas.png').catch(() => null);
  try {
    const sRes = await fetch('/Asset/Character/characters/sword_objective/frames.json');
    if (sRes.ok) swordFrames = await sRes.json();
  } catch (err) {
    swordFrames = null;
  }
      assets.vfxFireOrb = await loadImage('/Asset/Character/characters/aoda_combat/vfx_fire_orb/atlas.png').catch(() => null);
      assets.vfxFireOrbExplosion = await loadImage('/Asset/Character/characters/aoda_combat/vfx_fire_orb_explosion/atlas.png').catch(() => null);
      assets.vfxRedNova = null; // Đã xóa bỏ Red Nova theo yêu cầu tối ưu bộ nhớ
      // Nạp Boss Trung Lập Crapit & 2 bộ VFX Quả Cầu Nước Bọt (30x30) + Nổ (40x40)
      assets.crapitManifest = await loadJSON('/Asset/Character/characters/crapit_boss/crapit_boss_actions.json').catch(() => null);
      assets.crapitBoss = await loadImage('/Asset/Character/characters/crapit_boss/body_atlas.png').catch(() => null);
      assets.crapitSpitOrb = await loadImage('/Asset/Character/characters/crapit_boss/vfx_spit_orb/atlas.png').catch(() => null);
      assets.crapitSpitExplosion = await loadImage('/Asset/Character/characters/crapit_boss/vfx_spit_explosion/atlas.png').catch(() => null);
      assets.crapitLootOrb = await loadImage('/Asset/Character/characters/crapit_boss/loot_orb/atlas.png').catch(() => null);
    } catch (e) {
      console.warn('Aoda asset load notice:', e);
    }

    console.log('All combat assets loaded successfully (Unified 83-frame Blazing Halo, Aoda 90px & 2 VFX Packs).');
  } catch (err) {
    console.error('Initialization error:', err);
    hudState.textContent = 'LỖI: ' + err.message;
    hudState.className = 'badge warning';
  }
}

// Toast Notification
function showToast(msg) {
  if (!toastMsg) return;
  toastMsg.textContent = msg;
  toastMsg.style.display = 'block';
  setTimeout(() => { toastMsg.style.display = 'none'; }, 2200);
}

// Inspector Color Helpers
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// Mouse Handlers for Magnifier Loupe & Inspector
stageCanvas.addEventListener('mousemove', (e) => {
  const rect = stageCanvas.getBoundingClientRect();
  const scaleX = stageCanvas.width / rect.width;
  const scaleY = stageCanvas.height / rect.height;
  mouseX = Math.round((e.clientX - rect.left) * scaleX);
  mouseY = Math.round((e.clientY - rect.top) * scaleY);

  hudCoords.textContent = `Con trỏ: (${mouseX}, ${mouseY})`;

  const spriteScale = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;
  const anchorScreenX = vargostX;
  const anchorScreenY = vargostY + hoverOffset;

  const dx = Math.round((mouseX - anchorScreenX) / spriteScale);
  const dy = Math.round((mouseY - anchorScreenY) / spriteScale);

  inspCanvasXy.textContent = `${mouseX}, ${mouseY}`;
  inspAnchorDxy.textContent = `dx: ${dx >= 0 ? '+' : ''}${dx}, dy: ${dy >= 0 ? '+' : ''}${dy}`;

  if (isPickingSpawn) {
    numSpawnDx.value = dx;
    numSpawnDy.value = dy;
    updateCurrentSpawnDisplay();
  }
});

stageCanvas.addEventListener('click', (e) => {
  if (isPickingSpawn) {
    isPickingSpawn = false;
    btnPickSpawn.classList.remove('active');
    btnPickSpawn.textContent = '📌 Click vào đây rồi click trên Vargost để gán điểm phóng';
    showToast(`Đã gán điểm phóng đạn: dx = ${numSpawnDx.value}, dy = ${numSpawnDy.value}`);
  }
});

if (btnPickSpawn) {
  btnPickSpawn.addEventListener('click', () => {
    isPickingSpawn = !isPickingSpawn;
    if (isPickingSpawn) {
      btnPickSpawn.classList.add('active');
      btnPickSpawn.textContent = '🎯 Đang chọn... Click vào vị trí bàn tay trên Vargost';
    } else {
      btnPickSpawn.classList.remove('active');
      btnPickSpawn.textContent = '📌 Click vào đây rồi click trên Vargost để gán điểm phóng';
    }
  });
}

if (btnCopyCoords) {
  btnCopyCoords.addEventListener('click', () => {
    const text = `offset_from_anchor_px: [${numSpawnDx.value}, ${numSpawnDy.value}]`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Đã chép vào clipboard: ' + text);
    });
  });
}

function updateCurrentSpawnDisplay() {
  if (!inspCurrentSpawn) return;
  const dx = Number(numSpawnDx.value);
  const dy = Number(numSpawnDy.value);
  inspCurrentSpawn.textContent = `dx: ${dx >= 0 ? '+' : ''}${dx}, dy: ${dy >= 0 ? '+' : ''}${dy}`;
}

if (numSpawnDx) numSpawnDx.addEventListener('input', updateCurrentSpawnDisplay);
if (numSpawnDy) numSpawnDy.addEventListener('input', updateCurrentSpawnDisplay);

// Timeline Controls
function selectFrame(f) {
  isPlaying = false;
  btnPlayPause.textContent = '▶ Tiếp tục';
  currentFrameIndex = Math.max(0, Math.min(MAX_FRAME_INDEX, f));
  rngFrame.value = currentFrameIndex;
  lblFrameNum.textContent = currentFrameIndex;
  hudFrame.textContent = `Frame: ${currentFrameIndex}/${MAX_FRAME_INDEX}`;
}

rngFrame.addEventListener('input', () => {
  selectFrame(Number(rngFrame.value));
});

btnPlayPause.addEventListener('click', () => {
  isPlaying = !isPlaying;
  btnPlayPause.textContent = isPlaying ? '⏸ Tạm dừng' : '▶ Tiếp tục';
});

btnFrameFirst.addEventListener('click', () => selectFrame(0));
btnFramePrev.addEventListener('click', () => selectFrame(currentFrameIndex - 1));
btnFrameNext.addEventListener('click', () => selectFrame(currentFrameIndex + 1));
btnFrameLast.addEventListener('click', () => selectFrame(MAX_FRAME_INDEX));

// Keyframe bookmarks
if (kfIdle) kfIdle.addEventListener('click', () => selectFrame(0));
if (kfWindup) kfWindup.addEventListener('click', () => selectFrame(44));
if (kfCharged) kfCharged.addEventListener('click', () => selectFrame(63));
if (kfSwing) kfSwing.addEventListener('click', () => selectFrame(66));
if (kfThrust) kfThrust.addEventListener('click', () => selectFrame(67));
if (kfRelease) kfRelease.addEventListener('click', () => selectFrame(68));
if (kfReignite) kfReignite.addEventListener('click', () => selectFrame(74));

// Locomotion Commands (Orthogonal 4 + Diagonal 4 Directions)
btnFlyForward.addEventListener('click', () => {
  currentFlySpeed = Number(rngFlySpeed.value) || SPEED_FAST;
  targetVargostX = Math.max(mapX + 100, Math.min(W - 400, vargostX + facingDirection * 120 * mapScale));
  targetVargostY = isFlying ? vargostY : groundY;
  locomotionState = 'FLY_VECTOR';
  const tiltDeg = '+20°';
  hudLocomotion.textContent = isFlying
    ? `Di chuyển: BAY TIẾN (${tiltDeg}) @ ${currentFlySpeed}px/s`
    : `Di chuyển: TIẾN TRÊN BỆ (${tiltDeg}) @ ${currentFlySpeed}px/s`;
  hudLocomotion.className = 'badge flying';
});

btnFlyBackward.addEventListener('click', () => {
  const retreatDist = 130 * (mapScale / 2.625);
  const safeRet = calculateSafeRetreat(vargostX, vargostY, -facingDirection, retreatDist);
  triggerTeleport(safeRet.x, safeRet.y);
  hudLocomotion.textContent = safeRet.escapedVertically
    ? 'Di chuyển: TELEPORT VÚT LÊN CAO (Thoát kẹt địa hình)'
    : 'Di chuyển: TELEPORT LÙI 9h (Thân đứng 0°)';
  hudLocomotion.className = 'badge active';
  showToast(safeRet.escapedVertically ? '⚡ Vargost: Thoát kẹt địa hình lên cao!' : '⚡ Vargost Teleport lùi 9h (Thân đứng 0°)!');
});

function flyDiagonal(dxRatio, dyRatio, label, clockName) {
  if (!isFlying) {
    takeoff();
    showToast(`Cất cánh trước khi bay xéo ${clockName}!`);
    return;
  }
  const effectiveDx = dxRatio * facingDirection;
  if (effectiveDx < 0) {
    // HƯỚNG LÙI (10h, 8h): Sử dụng Teleport với calculateSafeRetreat chống kẹt
    const retreatDist = 125 * (mapScale / 2.625);
    const safeRet = calculateSafeRetreat(vargostX, vargostY, effectiveDx > 0 ? -1 : 1, retreatDist);
    triggerTeleport(safeRet.x, safeRet.y);
    hudLocomotion.textContent = `Di chuyển: TELEPORT LÙI ${clockName} (${label}, Đứng 0°)`;
    hudLocomotion.className = 'badge active';
    showToast(`⚡ Vargost Teleport lùi ${clockName} (Thân đứng 0°)!`);
  } else {
    // HƯỚNG TIẾN (2h, 4h): Giữ nguyên bay tiến nghiêng đầu +20 độ rất tự nhiên
    currentFlySpeed = Number(rngFlySpeed.value) || SPEED_FAST;
    targetVargostX = Math.max(mapX + 100, Math.min(W - 400, vargostX + effectiveDx * 110 * mapScale));
    targetVargostY = Math.max(skyCeilingY, Math.min(skyLowY, vargostY + dyRatio * 55 * mapScale));
    locomotionState = 'FLY_VECTOR';
    const tiltDeg = '+20°';
    hudLocomotion.textContent = `Di chuyển: BAY XÉO TIẾN ${clockName} (${label}, Nghiêng ${tiltDeg}) @ ${currentFlySpeed}px/s`;
    hudLocomotion.className = 'badge flying';
  }
}

if (btnFly10h) btnFly10h.addEventListener('click', () => flyDiagonal(-1, -1, 'Lùi - Vút Lên', '10h'));
if (btnFly2h) btnFly2h.addEventListener('click', () => flyDiagonal(1, -1, 'Tiến - Vút Lên', '2h'));
if (btnFly8h) btnFly8h.addEventListener('click', () => flyDiagonal(-1, 1, 'Lùi - Sà Xuống', '8h'));
if (btnFly4h) btnFly4h.addEventListener('click', () => flyDiagonal(1, 1, 'Tiến - Bổ Nhào', '4h'));

function land() {
  if (!isFlying || locomotionState === 'LANDING' || locomotionState === 'TAKEOFF') return;
  locomotionState = 'LANDING';
  transitionProgress = 0;
  transitionStartY = vargostY; // Bắt đầu hạ cánh từ đúng vị trí Y hiện tại
  altitudeCooldown = 15.0; // Khóa độ cao ít nhất 15s
  hudLocomotion.textContent = 'Di chuyển: HẠ CÁNH (Dọc Y=194)...';
  hudLocomotion.className = 'badge ground';
}

function takeoff() {
  if (isFlying || locomotionState === 'TAKEOFF' || locomotionState === 'LANDING') return;
  locomotionState = 'TAKEOFF';
  transitionProgress = 0;
  targetVargostY = baseFlyY;
  altitudeCooldown = 15.0; // Khóa độ cao ít nhất 15s
  hudLocomotion.textContent = 'Di chuyển: CẤT CÁNH (Dọc Y=65)...';
  hudLocomotion.className = 'badge flying';
}

btnLand.addEventListener('click', land);
btnTakeoff.addEventListener('click', takeoff);

if (btnSpeedSlow) {
  btnSpeedSlow.addEventListener('click', () => {
    currentFlySpeed = SPEED_SLOW;
    rngFlySpeed.value = SPEED_SLOW;
    lblFlySpeed.textContent = `${SPEED_SLOW}px/s`;
    showToast('Đã chọn chế độ bay chậm tuần tra: 100 px/s');
  });
}

if (btnSpeedFast) {
  btnSpeedFast.addEventListener('click', () => {
    currentFlySpeed = SPEED_FAST;
    rngFlySpeed.value = SPEED_FAST;
    lblFlySpeed.textContent = `${SPEED_FAST}px/s`;
    showToast('Đã chọn chế độ tăng tốc cơ động: 400 px/s');
  });
}

// Sliders
rngDistance.addEventListener('input', () => {
  lblDistance.textContent = `${rngDistance.value}px`;
});
rngFlySpeed.addEventListener('input', () => {
  currentFlySpeed = Number(rngFlySpeed.value);
  lblFlySpeed.textContent = `${currentFlySpeed}px/s`;
});
rngTilt.addEventListener('input', () => {
  lblTilt.textContent = `${rngTilt.value}°`;
});

btnTestNear.addEventListener('click', () => {
  rngDistance.value = 80;
  lblDistance.textContent = '80px';
  showToast('Cự ly thử nghiệm: 80px (Quá gần - AI sẽ lùi 400px/s nghiêng -25°)');
});

btnTestFar.addEventListener('click', () => {
  rngDistance.value = 680;
  lblDistance.textContent = '680px';
  showToast('Cự ly thử nghiệm: 680px (Quá xa - AI sẽ tiến 400px/s nghiêng +25°)');
});

if (btnEnemyDash) {
  btnEnemyDash.addEventListener('click', () => {
    isEnemyDashing = true;
    enemyDashTimer = 0.50; // Dash trong 0.5s né đòn
    enemyDashSpeed = 850 + Math.random() * 150; // 850 - 1000 px/s
    if (!isPlaying) {
      isPlaying = true;
      btnPlayPause.textContent = '⏸ Tạm dừng';
    }
    showToast(`🏃 Kẻ địch tăng tốc né đòn thần tốc @ ${Math.round(enemyDashSpeed)}px/s!`);
  });
}

if (btnEnemyAttack) {
  btnEnemyAttack.addEventListener('click', () => {
    spawnEnemyProjectile();
    if (!isPlaying) {
      isPlaying = true;
      btnPlayPause.textContent = '⏸ Tạm dừng';
    }
  });
}

function triggerVargostDeath() {
  if (isDead) return;
  isDead = true;
  deathTimer = 0;
  const prevHp = vargostHp;
  vargostHp = 0;
  vargostHitFlash = 0.35;
  vargostRecoilTimer = 0.25;
  aiState = 'DEAD';
  locomotionState = 'DEAD';
  currentTilt = 0; // Đứng thẳng 0 độ uy nghiêm

  // Tạo Ghost trừ nốt lượng máu còn lại về 0 trên ống máu Gothic
  if (prevHp > 0) {
    vargostDamageGhosts.push({
      fromHp: prevHp,
      toHp: 0,
      maxHp: VARGOST_MAX_HP,
      timer: 0,
      flashDuration: 0.12,
      dissolveDuration: 0.42,
      totalDuration: 0.54,
      seed: Math.random()
    });
  }

  // Bùng nổ Hit Impact VFX chí mạng
  const spriteScale = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;
  spawnHitImpact(vargostX, vargostY + hoverOffset - 25 * spriteScale, -facingDirection);

  hudState.textContent = 'Vargost: GỤC NGÃ (Đứng hình 0.3s -> Bốc hơi pixel 1.6s bay lên 30px)';
  hudState.className = 'badge warning';
  hudAi.textContent = 'AI: Tử trận (Đang chờ hồi sinh)';
  hudAi.className = 'badge warning';
  showToast('💀 VARGOST HẾT MÁU VÀ GỤC NGÃ (ĐỨNG HÌNH 0.3S & BỐC HƠI PIXEL 1.6S)!');
}

if (btnTestDeath) {
  btnTestDeath.addEventListener('click', () => {
    triggerVargostDeath();
    if (!isPlaying) {
      isPlaying = true;
      btnPlayPause.textContent = '⏸ Tạm dừng';
    }
  });
}

if (btnTestOvershoot) {
  btnTestOvershoot.addEventListener('click', () => {
    const currTargetX = (enemyWorldX !== null) ? enemyWorldX : (
      teamOriginDirection === 1
        ? (mapX + 220.0 * mapScale + Number(rngDistance.value) * (mapScale / 2.625))
        : (mapX + 380.0 * mapScale - Number(rngDistance.value) * (mapScale / 2.625))
    );

    // Đặt Vargost bay vượt qua người địch khoảng 90px (địch ở phía sau lưng Vargost)
    if (facingDirection === 1) {
      vargostX = Math.min(W - 420, currTargetX + 90 * mapScale);
    } else {
      vargostX = Math.max(mapX + 110, currTargetX - 90 * mapScale);
    }
    targetVargostX = vargostX;
    targetVargostY = vargostY;
    locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
    const desiredFacing = (currTargetX - vargostX >= 0) ? 1 : -1;
    triggerPhaseBlink(desiredFacing);
    if (!isPlaying) {
      isPlaying = true;
      btnPlayPause.textContent = '⏸ Tạm dừng';
    }
    showToast('✨ Vargost kích hoạt Thân Pháp Biến Ảnh Pixel xoay người khóa mục tiêu!');
  });
}

if (rngVerticalSpeed && lblVerticalSpeed) {
  rngVerticalSpeed.addEventListener('input', () => {
    verticalFlySpeed = Number(rngVerticalSpeed.value) || 180;
    lblVerticalSpeed.textContent = `${verticalFlySpeed}px/s`;
  });
}

if (btnToggleDirection) {
  btnToggleDirection.addEventListener('click', () => {
    teamOriginDirection = (teamOriginDirection === 1) ? -1 : 1;
    const t1Base = getTeamBaseSpawn(1, teamOriginDirection);
    const t2Base = getTeamBaseSpawn(2, teamOriginDirection);
    triggerPhaseBlink(t1Base.facing);
    if (teamOriginDirection === 1) {
      btnToggleDirection.textContent = '🔄 Hướng: Đội 1 Trái ➔ Phải | Đội 2 Phải ➔ Trái';
      btnToggleDirection.style.borderColor = '#3fb950';
      btnToggleDirection.style.color = '#3fb950';
      showToast('Đội 1 xuất phát Căn Cứ Trái ➔ Đội 2 xuất phát Căn Cứ Phải!');
    } else {
      btnToggleDirection.textContent = '🔄 Hướng: Đội 1 Phải ➔ Trái | Đội 2 Trái ➔ Phải';
      btnToggleDirection.style.borderColor = '#f0883e';
      btnToggleDirection.style.color = '#f0883e';
      showToast('Đội 1 xuất phát Căn Cứ Phải ➔ Đội 2 xuất phát Căn Cứ Trái!');
    }
    targetVargostX = t1Base.airX;
    targetVargostY = isFlying ? t1Base.airY : t1Base.groundY;
    aodaPlatformIndex = t2Base.groundPlatformIndex;
    aodaPlatform = AODA_PLATFORMS[aodaPlatformIndex];
    aodaX = t2Base.groundX;
    aodaY = aodaPlatform.y;
    aodaFacing = t2Base.facing;
    aodaVisualFacing = aodaFacing;
    aodaState = 'MOVE';
    aodaFrameIndex = 65;
    currentTilt = 0;
    activeProjectile = null;
    activeExplosion = null;
    motionGhosts.length = 0;
  });
}

btnReset.addEventListener('click', () => {
  const t1Base = getTeamBaseSpawn(1, teamOriginDirection);
  vargostX = t1Base.airX;
  vargostY = t1Base.airY;
  facingDirection = t1Base.facing;
  targetFacingVisual = facingDirection;
  visualFacing = facingDirection;
  turnSquashY = 1.0;
  targetVargostX = vargostX;
  targetVargostY = vargostY;
  transitionStartY = vargostY;
  isFlying = true;
  currentTilt = 0;
  locomotionState = 'IDLE_FLY';
  aiState = 'IDLE';
  pendingCombatAction = null;
  currentFrameIndex = 0;
  isPlaying = true;
  btnPlayPause.textContent = '⏸ Tạm dừng';
  activeProjectile = null;
  activeExplosion = null;
  motionGhosts.length = 0;
  activeEnemyProjectiles.length = 0;
  vargostHp = VARGOST_MAX_HP;
  isDead = false;
  deathTimer = 0;
  vargostHitFlash = 0;
  vargostRecoilTimer = 0;
  vargostDamageGhosts.length = 0;
  enemyDamageGhosts.length = 0;
  vargostAntiHeal = false;
  vargostRetaliateBoss = false;
  enemyAttackCooldown = 3.8;
  currentFlySpeed = SPEED_FAST;
  rngFlySpeed.value = SPEED_FAST;
  lblFlySpeed.textContent = `${SPEED_FAST}px/s`;
  autoCooldown = 1.5;
  altitudeCooldown = 15.0;
  hudLocomotion.textContent = 'Di chuyển: LƠ LỬNG TRÊN KHÔNG';
  hudLocomotion.className = 'badge';
  hudState.textContent = 'Trạng thái: SẴN SÀNG';
  hudState.className = 'badge';
  showToast('Đã đặt lại trạng thái Vargost về căn cứ xuất phát.');
});

// Aoda Action Triggers & Buttons
function triggerAodaSkill1(isManual = false) {
  if (aodaIsDead || aodaStunTimer > 0) return;
  if (aodaState.startsWith('SKILL_1')) return;
  if (aodaTornadoCooldown > 0) {
    if (isManual) {
      showToast(`🌪️ Tornado đang hồi chiêu: ${aodaTornadoCooldown.toFixed(1)}s`);
    }
    return;
  }

  // Kỹ năng Tornado của Aoda: Trúng cả mục tiêu trên không lẫn dưới mặt đất và dội tường khi va chạm
  if (!isManual) {
    const hasRetaliateBoss = (aodaRetaliateBoss && !crapitIsDead && Math.abs(crapitX - aodaX) < 550);
    const hasEnemy = (!isDead && Math.abs(vargostX - aodaX) < 450) || hasRetaliateBoss;
    if (!hasEnemy) {
      return;
    }
  }

  aodaTornadoCooldown = 5.0; // Cooldown 5s theo yêu cầu người dùng
  aodaState = 'SKILL_1_WINDUP';
  aodaLockedFacing = aodaFacing; // Khóa hướng tại frame 25
  aodaFrameIndex = 24; // Frame 25 (0-based 24)
  aodaAnimAccum = 0;
  if (hudAodaState) {
    hudAodaState.textContent = 'Aoda: VẬN CÔNG TORNADO 85px (CD 5s)';
    hudAodaState.className = 'badge active';
  }
  showToast('🌪️ Aoda: Kích hoạt Tornado đất 85px (CD 5s)!');
}

// Procedural Stun Stars VFX quanh đầu khi bị choáng
function drawStunStars(ctx, headX, headY, rx = 22, ry = 7) {
  const t = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.007;
  const numStars = 3;
  ctx.save();
  for (let k = 0; k < numStars; k++) {
    const angle = t + (k * (Math.PI * 2 / numStars));
    const sx = headX + Math.cos(angle) * rx;
    const sy = headY + Math.sin(angle) * ry;
    const starScale = 0.8 + 0.3 * Math.sin(angle);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(starScale, starScale);

    // Ngôi sao 4 cánh vàng óng ánh
    ctx.fillStyle = '#ffd166';
    ctx.shadowColor = '#ffb703';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(1, -1, 6, 0);
    ctx.quadraticCurveTo(1, 1, 0, 6);
    ctx.quadraticCurveTo(-1, 1, -6, 0);
    ctx.quadraticCurveTo(-1, -1, 0, -6);
    ctx.closePath();
    ctx.fill();

    // Lõi trắng sáng
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// Lấy thông tin surface theo id
function getSurfaceById(surfId) {
  for (const zone of ENV_ZONES) {
    for (const s of zone.surfaces) {
      if (s.id === surfId) return s;
    }
  }
  return null;
}

// BỘ ĐIỀU HƯỚNG TÌM ĐƯỜNG QUA CÁC BỆ ĐỊA HÌNH (PLATFORM GRAPH NAVIGATION)
// Giải quyết triệt để vấn đề tướng bộ binh (Aoda) bị kẹt vòng lặp không biết đi vòng qua địa hình
function getPlatformNavPlan(currentPlat, targetPlatId, currentX) {
  if (!currentPlat) return null;
  if (currentPlat.id === targetPlatId) {
    return { atTargetPlatform: true, nextPlatform: null };
  }

  // 1. Mục tiêu là plat_3d (Hang Boss Crapit):
  // QUY TẮC HIẾN PHÁP & TRẢI NGHIỆM THỰC TẾ: Nhảy xuống/lên địa hình gần nhất lần lượt!
  // Điểm 3 (plat_3a) -> nhảy xuống điểm 2 (plat_2 Thánh Kiếm) -> xong mới nhảy xuống hang boss (plat_3d).
  if (targetPlatId === 'plat_3d') {
    if (currentPlat.id === 'plat_3a') {
      const p2 = getSurfaceById('plat_2');
      return {
        atTargetPlatform: false,
        moveDir: -1,
        jumpEdge: 'left',
        nextPlatform: p2,
        jumpTargetX: p2.maxX - 35,
        jumpTargetY: p2.y
      };
    } else if (currentPlat.id === 'plat_3b' || currentPlat.id === 'plat_3c') {
      const p3a = getSurfaceById('plat_3a');
      return {
        atTargetPlatform: false,
        moveDir: -1,
        jumpEdge: 'left',
        nextPlatform: p3a,
        jumpTargetX: p3a.maxX - 35,
        jumpTargetY: p3a.y
      };
    } else if (currentPlat.id === 'plat_2') {
      // Từ Bệ Giữa plat_2: Nhảy xuống-phải vào hang boss plat_3d
      const p3d = getSurfaceById('plat_3d');
      return {
        atTargetPlatform: false,
        moveDir: 1,
        jumpEdge: 'right',
        nextPlatform: p3d,
        jumpTargetX: p3d.minX + 45,
        jumpTargetY: p3d.y
      };
    } else if (currentPlat.id === 'plat_1b') {
      const p2 = getSurfaceById('plat_2');
      return { atTargetPlatform: false, moveDir: 1, jumpEdge: 'right', nextPlatform: p2, jumpTargetX: p2.minX + 35, jumpTargetY: p2.y };
    } else if (currentPlat.id === 'plat_1a') {
      const p1b = getSurfaceById('plat_1b');
      return { atTargetPlatform: false, moveDir: 1, jumpEdge: 'right', nextPlatform: p1b, jumpTargetX: p1b.minX + 35, jumpTargetY: p1b.y };
    } else if (currentPlat.id === 'plat_1_top') {
      const p1a = getSurfaceById('plat_1a');
      return { atTargetPlatform: false, moveDir: 1, jumpEdge: 'right', nextPlatform: p1a, jumpTargetX: p1a.minX + 35, jumpTargetY: p1a.y };
    }
  }

  // 2. Mục tiêu là plat_3b / plat_3c (Căn Cứ Phải - Hồi sinh Team 2 / Hoàn thành nhận vật phẩm):
  // Lộ trình hợp lệ qua địa hình liền kề: plat_3d -> plat_2 -> plat_3a -> plat_3b
  if (targetPlatId === 'plat_3b' || targetPlatId === 'plat_3c') {
    if (currentPlat.id === 'plat_3d') {
      // Từ đáy vực plat_3d: Chạy sang trái nhảy lên Platform 2 qua không gian mở!
      const p2 = getSurfaceById('plat_2');
      return {
        atTargetPlatform: false,
        moveDir: -1,
        jumpEdge: 'left',
        nextPlatform: p2,
        jumpTargetX: p2.maxX - 35,
        jumpTargetY: p2.y
      };
    } else if (currentPlat.id === 'plat_2') {
      // Từ Platform 2: Nhảy lên mép trái Platform 3A qua không gian mở!
      const p3a = getSurfaceById('plat_3a');
      return {
        atTargetPlatform: false,
        moveDir: 1,
        jumpEdge: 'right',
        nextPlatform: p3a,
        jumpTargetX: p3a.minX + 45,
        jumpTargetY: p3a.y
      };
    } else if (currentPlat.id === 'plat_3a') {
      // Từ Platform 3A: Chạy bộ trên mặt cỏ sang Platform 3B!
      const p3b = getSurfaceById('plat_3b');
      return {
        atTargetPlatform: false,
        moveDir: 1,
        jumpEdge: 'right',
        nextPlatform: p3b,
        jumpTargetX: p3b.minX + 35,
        jumpTargetY: p3b.y
      };
    }
  }

  // 3. Mục tiêu là plat_1_top / plat_1a (Căn Cứ Trái - Hồi sinh Team 1 / Hoàn thành nhận vật phẩm):
  if (targetPlatId === 'plat_1_top' || targetPlatId === 'plat_1a') {
    if (currentPlat.id === 'plat_3d') {
      const p2 = getSurfaceById('plat_2');
      return {
        atTargetPlatform: false,
        moveDir: -1,
        jumpEdge: 'left',
        nextPlatform: p2,
        jumpTargetX: p2.maxX - 35,
        jumpTargetY: p2.y
      };
    } else if (currentPlat.id === 'plat_3a') {
      const p2 = getSurfaceById('plat_2');
      return { atTargetPlatform: false, moveDir: -1, jumpEdge: 'left', nextPlatform: p2, jumpTargetX: p2.maxX - 35, jumpTargetY: p2.y };
    } else if (currentPlat.id === 'plat_3b' || currentPlat.id === 'plat_3c') {
      const p3a = getSurfaceById('plat_3a');
      return { atTargetPlatform: false, moveDir: -1, jumpEdge: 'left', nextPlatform: p3a, jumpTargetX: p3a.maxX - 35, jumpTargetY: p3a.y };
    } else if (currentPlat.id === 'plat_2') {
      const p1b = getSurfaceById('plat_1b');
      return { atTargetPlatform: false, moveDir: -1, jumpEdge: 'left', nextPlatform: p1b, jumpTargetX: currentPlat.minX - 60, jumpTargetY: p1b.y };
    } else if (currentPlat.id === 'plat_1b') {
      const p1a = getSurfaceById('plat_1a');
      return { atTargetPlatform: false, moveDir: -1, jumpEdge: 'left', nextPlatform: p1a, jumpTargetX: p1a.maxX - 35, jumpTargetY: p1a.y };
    } else if (currentPlat.id === 'plat_1a' && targetPlatId === 'plat_1_top') {
      const p1top = getSurfaceById('plat_1_top');
      return { atTargetPlatform: false, moveDir: -1, jumpEdge: 'left', nextPlatform: p1top, jumpTargetX: p1top.maxX - 20, jumpTargetY: p1top.y };
    }
  }

  // 4. Mặc định: Mục tiêu là plat_2 (Cứ Điểm Thánh Kiếm):
  if (currentPlat.id === 'plat_3d') {
    const p2 = getSurfaceById('plat_2');
    return { atTargetPlatform: false, moveDir: -1, jumpEdge: 'left', nextPlatform: p2, jumpTargetX: p2.maxX - 25, jumpTargetY: p2.y };
  } else if (currentPlat.id === 'plat_3a') {
    const p2 = getSurfaceById('plat_2');
    return { atTargetPlatform: false, moveDir: -1, jumpEdge: 'left', nextPlatform: p2, jumpTargetX: p2.maxX - 30, jumpTargetY: p2.y };
  } else if (currentPlat.id === 'plat_3b' || currentPlat.id === 'plat_3c') {
    const p3a = getSurfaceById('plat_3a');
    return { atTargetPlatform: false, moveDir: -1, jumpEdge: 'left', nextPlatform: p3a, jumpTargetX: p3a.maxX - 30, jumpTargetY: p3a.y };
  } else if (currentPlat.id === 'plat_1b') {
    const p2 = getSurfaceById('plat_2');
    return { atTargetPlatform: false, moveDir: 1, jumpEdge: 'right', nextPlatform: p2, jumpTargetX: p2.minX + 30, jumpTargetY: p2.y };
  } else if (currentPlat.id === 'plat_1a') {
    const p1b = getSurfaceById('plat_1b');
    return { atTargetPlatform: false, moveDir: 1, jumpEdge: 'right', nextPlatform: p1b, jumpTargetX: p1b.minX + 35, jumpTargetY: p1b.y };
  } else if (currentPlat.id === 'plat_1_top') {
    const p1a = getSurfaceById('plat_1a');
    return { atTargetPlatform: false, moveDir: 1, jumpEdge: 'right', nextPlatform: p1a, jumpTargetX: p1a.minX + 35, jumpTargetY: p1a.y };
  }

  return { atTargetPlatform: true, nextPlatform: null };
}

// Lấy bệ kết nối liền kề cho cơ chế nhảy (Ledge Jumping)
function getAdjacentPlatform(plat, facing) {
  if (!plat) return null;
  if (plat.id === 'plat_1_top') {
    if (facing > 0) return { platform: ENV_ZONES[0].surfaces[1], targetX: ENV_ZONES[0].surfaces[1].minX + 35 };
    return null;
  }
  if (plat.id === 'plat_1a') {
    if (facing < 0) return { platform: ENV_ZONES[0].surfaces[0], targetX: ENV_ZONES[0].surfaces[0].maxX - 25 };
    return { platform: ENV_ZONES[0].surfaces[2], targetX: ENV_ZONES[0].surfaces[2].minX + 35 };
  }
  if (plat.id === 'plat_1b') {
    if (facing < 0) return { platform: ENV_ZONES[0].surfaces[1], targetX: ENV_ZONES[0].surfaces[1].maxX - 35 };
    return { platform: ENV_ZONES[1].surfaces[0], targetX: ENV_ZONES[1].surfaces[0].minX + 30 };
  }
  if (plat.id === 'plat_2') {
    if (facing < 0) return { platform: ENV_ZONES[0].surfaces[2], targetX: ENV_ZONES[1].surfaces[0].minX - 60 };
    if (facing > 0) return { platform: ENV_ZONES[2].surfaces[0], targetX: ENV_ZONES[2].surfaces[0].minX + 45 };
    return null;
  }
  if (plat.id === 'plat_3a') {
    if (facing < 0) return { platform: ENV_ZONES[1].surfaces[0], targetX: ENV_ZONES[1].surfaces[0].maxX - 35 };
    return { platform: ENV_ZONES[2].surfaces[1], targetX: ENV_ZONES[2].surfaces[1].minX + 35 };
  }
  if (plat.id === 'plat_3b') {
    if (facing < 0) return { platform: ENV_ZONES[2].surfaces[0], targetX: ENV_ZONES[2].surfaces[0].maxX - 35 };
    return { platform: ENV_ZONES[2].surfaces[2], targetX: ENV_ZONES[2].surfaces[2].minX + 20 };
  }
  if (plat.id === 'plat_3c') {
    if (facing < 0) return { platform: ENV_ZONES[2].surfaces[1], targetX: ENV_ZONES[2].surfaces[1].maxX - 20 };
    return null;
  }
  if (plat.id === 'plat_3d') {
    if (facing < 0) return { platform: ENV_ZONES[1].surfaces[0], targetX: ENV_ZONES[1].surfaces[0].maxX - 35 };
    return null;
  }
  return null;
}


function triggerAodaKo() {
  aodaIsDead = true;
  aodaState = 'KO';
  aodaFrameIndex = 46; // Frame 47 (0-based 46)
  aodaAnimAccum = 0;
  aodaDeathTimer = 0;
  aodaHp = 0;
  aodaHitFlash = 0.5;
  hudAodaState.textContent = 'Aoda: GỤC NGÃ (KO Frame 47..65)';
  hudAodaState.className = 'badge warning';
  showToast('💀 Aoda trúng đòn gục ngã và tan biến vào hư không!');
}

function spawnRedTornado(x, y, facing) {
  let spawnX = x + facing * 85;
  let spawnY = (typeof y === 'number') ? y : groundY;

  // 1. Xác định vị trí mục tiêu theo đúng logic:
  // Nếu Aoda đang đánh trả Boss Crapit -> nhắm thẳng Tornado xuất hiện tại chân Boss Crapit trên Platform 3D!
  if (aodaRetaliateBoss && !crapitIsDead && Math.abs(crapitX - x) < 700) {
    spawnX = crapitX;
    spawnY = crapitY;
  }
  // Nếu nhắm mục tiêu vào Vargost khi ở gần mặt đất
  else if (!isFlying && !isDead && Math.abs(vargostX - x) < 550) {
    spawnX = vargostX;
  }
  else if (aodaPlatform) {
    // Luôn kẹp chặt trên bề mặt bệ đá hiện tại, TUYỆT ĐỐI KHÔNG spawn rơi vào khoảng không giữa các bệ!
    spawnX = Math.max(aodaPlatform.minX + 25, Math.min(aodaPlatform.maxX - 25, x + facing * 85));
    spawnY = aodaPlatform.y;
  }

  // 2. Bảo vệ tuyệt đối không bao giờ spawn trùng lên người Aoda nếu không có mục tiêu Boss
  if (!(aodaRetaliateBoss && !crapitIsDead) && Math.abs(spawnX - x) < 70) {
    spawnX = x + facing * 85;
  }

  activeTornadoes.push({
    originX: spawnX,
    x: spawnX,
    y: spawnY,
    facing: facing,
    vx: facing * 85 * (mapScale / 2.625), // Tốc độ càn quét đầm & uy lực 85px/s theo chốt của người dùng (đồng bộ 1:1 APK)
    phase: 'EMERGE', // 'EMERGE' (bắt đầu mọc lên, frame 0..3) -> 'SPIN' (tồn tại xoay đỉnh cao 2.0s, frame 4..9) -> 'DISSIPATE' (tan biến, frame 10..14)
    frameIndex: 0,
    frameTimer: 0,
    spinElapsed: 0,
    spinDuration: 2.0, // Tồn tại đúng 2.0 giây xoay lốc đỉnh cao
    hitCooldown: 0
  });
  showToast('🌪️ Aoda: Phóng Tornado đất (Bắt đầu hoạt ảnh -> Tồn tại xoay 2.0s -> Tan biến)!');
}




if (btnAodaSkill1) {
  btnAodaSkill1.addEventListener('click', () => {
    triggerAodaSkill1(true); // isManual = true
    if (!isPlaying) { isPlaying = true; btnPlayPause.textContent = '⏸ Tạm dừng'; }
  });
}


if (btnAodaSwitchPlatform) {
  btnAodaSwitchPlatform.addEventListener('click', () => {
    aodaPlatformIndex = (aodaPlatformIndex + 1) % AODA_PLATFORMS.length;
    aodaPlatform = AODA_PLATFORMS[aodaPlatformIndex];
    aodaX = (aodaPlatformIndex === 0) ? (aodaPlatform.minX + 35) : ((aodaPlatform.minX + aodaPlatform.maxX) / 2);
    aodaY = aodaPlatform.y;
    aodaFacing = (SWORD_X > aodaX) ? 1 : -1;
    aodaVisualFacing = aodaFacing;
    aodaState = 'MOVE';
    aodaFrameIndex = 65;
    btnAodaSwitchPlatform.textContent = `📍 Vị Trí: ${aodaPlatform.name.split(' (')[0]}`;
    hudAodaState.textContent = `Aoda: Chuyển sang ${aodaPlatform.name}`;
    if (!isPlaying) {
      isPlaying = true;
      btnPlayPause.textContent = '⏸ Tạm dừng';
    }
    showToast(`Đã chuyển Aoda sang: ${aodaPlatform.name}`);
  });
}

if (btnAodaTurn) {
  btnAodaTurn.addEventListener('click', () => {
    aodaFacing = (aodaFacing === 1) ? -1 : 1;
    showToast(`Aoda đã quay mặt sang ${aodaFacing === 1 ? 'Phải ▶' : '◀ Trái'}`);
  });
}

if (btnAodaTestKo) {
  btnAodaTestKo.addEventListener('click', () => {
    triggerAodaKo();
    if (!isPlaying) { isPlaying = true; btnPlayPause.textContent = '⏸ Tạm dừng'; }
  });
}

function resetMatch() {
  swordCaptureTimer = 0.0;
  swordControllingTeam = null;
  isSwordContested = false;
  matchWinner = null;
  swordFrameIndex = 0;
  swordAnimAccum = 0.0;
  swordCaptureParticles.length = 0;

  const t1Base = getTeamBaseSpawn(1, teamOriginDirection);
  const t2Base = getTeamBaseSpawn(2, teamOriginDirection);

  // Hồi sinh Vargost (Team 1 · Nhân vật bay) trên không trung quanh Căn Cứ Đội 1
  isDead = false;
  deathTimer = 0;
  vargostHp = VARGOST_MAX_HP;
  vargostHitFlash = 0;
  vargostRecoilTimer = 0;
  vargostAntiHeal = false;
  vargostRetaliateBoss = false;
  vargostDamageGhosts.length = 0;
  vargostX = t1Base.airX;
  vargostY = t1Base.airY;
  targetVargostX = vargostX;
  targetVargostY = vargostY;
  facingDirection = t1Base.facing;
  visualFacing = facingDirection;
  targetFacingVisual = facingDirection;
  currentTilt = 0;
  aiState = 'IDLE';
  locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
  autoCooldown = 0.5;

  // Hồi sinh Aoda (Team 2 · Bộ binh) trên địa hình tại Căn Cứ Đội 2
  aodaIsDead = false;
  aodaDeathTimer = 0;
  aodaHp = aodaMaxHp;
  aodaHitFlash = 0;
  aodaStunTimer = 0;
  aodaAntiHeal = false;
  aodaRetaliateBoss = false;
  aodaDamageGhosts.length = 0;
  aodaDamageNumbers.length = 0;
  aodaPlatformIndex = t2Base.groundPlatformIndex;
  aodaPlatform = AODA_PLATFORMS[aodaPlatformIndex];
  aodaX = t2Base.groundX;
  aodaY = aodaPlatform.y;
  aodaFacing = t2Base.facing;
  aodaVisualFacing = aodaFacing;
  aodaState = 'MOVE';
  aodaFrameIndex = 65;
  aodaAnimAccum = 0;
  aodaTornadoCooldown = 0;

  // Khởi tạo lại Boss Trung Lập Crapit (2150 HP, chỉ xuất hiện 1 lần mỗi trận tại bệ đá đáy 1280, 963.75)
  crapitX = mapX + 341.3333 * mapScale; // 1280.0
  crapitY = mapY + 289.0 * mapScale; // 963.75
  crapitHp = CRAPIT_MAX_HP;
  crapitIsDead = false;
  crapitDeathTimer = 0.0;
  crapitState = 'IDLE';
  crapitFrameIndex = 0;
  crapitAnimAccum = 0.0;
  crapitAttackCooldown = 5.5;
  crapitLockedTargetId = null;
  crapitHitFlash = 0.0;
  crapitLastHitBy = null;
  crapitDamageGhosts.length = 0;
  activeCrapitProjectiles.length = 0;
  activeCrapitExplosions.length = 0;
  bossLootDrop.active = false;
  bossLootDrop.lockedPickerId = null;
  bossLootDrop.carrierId = null;
  bossLootDrop.isFreeForAll = false;

  // Hồi sinh Ground Dummy (Team 1) trên Platform 2
  groundDummyHp = 100;
  groundDummyHitFlash = 0;
  groundDummyStunTimer = 0;
  groundDummyDamageGhosts.length = 0;
  groundDummyX = SWORD_X - 60 * (mapScale / 2.625);

  // Hồi sinh Moving Dummy
  enemyHp = 100;
  enemyHitFlash = 0;
  enemyStunTimer = 0;
  enemyDamageGhosts.length = 0;
  enemyDamageNumbers.length = 0;
  enemyWorldX = (teamOriginDirection === 1) ? (mapX + 220.0 * mapScale) : (mapX + 380.0 * mapScale);

  if (hudObjectiveStatus) {
    hudObjectiveStatus.textContent = 'Thánh Kiếm: Trống (Tiến vào vùng và giữ 20s để thắng)';
    hudObjectiveStatus.className = 'badge';
  }
  showToast('🔄 Đã thiết lập lại trận đấu 3v3!');
}

if (btnResetMatch) {
  btnResetMatch.addEventListener('click', resetMatch);
}

// Magnifier Loupe Renderer (10x zoom)
function renderLoupe() {
  if (!chkInspector.checked) return;
  const loupeRadius = 7;
  const loupeDiameter = loupeRadius * 2 + 1;

  try {
    const imgData = ctx.getImageData(mouseX - loupeRadius, mouseY - loupeRadius, loupeDiameter, loupeDiameter);
    loupeCtx.clearRect(0, 0, 150, 150);
    loupeCtx.imageSmoothingEnabled = false;

    for (let y = 0; y < loupeDiameter; y++) {
      for (let x = 0; x < loupeDiameter; x++) {
        const i = (y * loupeDiameter + x) * 4;
        const r = imgData.data[i];
        const g = imgData.data[i + 1];
        const b = imgData.data[i + 2];
        const a = imgData.data[i + 3] / 255;

        loupeCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        loupeCtx.fillRect(x * 10, y * 10, 10, 10);

        loupeCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        loupeCtx.strokeRect(x * 10, y * 10, 10, 10);
      }
    }

    // Highlight center pixel
    loupeCtx.strokeStyle = '#f85149';
    loupeCtx.lineWidth = 2;
    loupeCtx.strokeRect(7 * 10, 7 * 10, 10, 10);

    // Read center pixel color
    const centerI = (7 * loupeDiameter + 7) * 4;
    const cr = imgData.data[centerI];
    const cg = imgData.data[centerI + 1];
    const cb = imgData.data[centerI + 2];
    const ca = imgData.data[centerI + 3];

    inspRgba.textContent = `RGBA(${cr}, ${cg}, ${cb}, ${(ca / 255).toFixed(2)})`;
    const hex = rgbToHex(cr, cg, cb);
    inspHex.textContent = hex;
    inspColorBox.style.background = `rgba(${cr}, ${cg}, ${cb}, ${ca / 255})`;
  } catch (err) {}
}

// -------------------------------------------------------------
// Skill Orders & Combat State Machine
// -------------------------------------------------------------
function orderBlazingHalo() {
  if (vargostSilenceTimer > 0 || vargostStunTimer > 0) {
    showToast(vargostSilenceTimer > 0 ? '🔇 Vargost đang bị Câm Lặng!' : '⚡ Vargost đang bị Định Thân!');
    return;
  }
  if (aiState !== 'IDLE' && aiState !== 'REPOSITIONING' && aiState !== 'LOS_EVASIVE') return;
  pendingCombatAction = 'BLAZING_HALO';
  isPlaying = true;
  btnPlayPause.textContent = '⏸ Tạm dừng';
}

btnBlazingHalo.addEventListener('click', orderBlazingHalo);
if (btnCastLegacy) btnCastLegacy.addEventListener('click', orderBlazingHalo);

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyR' || e.code === 'Space') {
    e.preventDefault();
    orderBlazingHalo();
  } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
    triggerAodaSkill1(true);
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    btnFlyForward.click();
  } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    btnFlyBackward.click();
  } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
    takeoff();
  } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
    land();
  } else if (e.code === 'KeyQ') {
    if (btnFly10h) btnFly10h.click();
  } else if (e.code === 'KeyE') {
    if (btnFly2h) btnFly2h.click();
  } else if (e.code === 'KeyZ') {
    if (btnFly8h) btnFly8h.click();
  } else if (e.code === 'KeyC') {
    if (btnFly4h) btnFly4h.click();
  }
});

function triggerTeleport(targetX, targetY, newFacing = null, forceFlying = false) {
  if (isPhaseBlinking) return;
  isPhaseBlinking = true;
  phaseBlinkTimer = 0;
  phaseBlinkTargetFacing = (newFacing !== null) ? newFacing : facingDirection;
  if (forceFlying || targetY < groundY - 35) {
    isFlying = true;
    locomotionState = 'IDLE_FLY';
  }
  const safePos = resolveCollisionSafe(targetX, targetY, isFlying);
  teleportTargetX = safePos.x;
  teleportTargetY = safePos.y;
  phaseBlinkStep = 1;
  currentTilt = 0;
}

function triggerPhaseBlink(newFacing) {
  const shiftDist = 42 * (mapScale / 2.625);
  const targetX = vargostX - (newFacing !== null ? newFacing : facingDirection) * shiftDist;
  triggerTeleport(targetX, vargostY, newFacing);
}

let haloLockedTargetX = null;
let haloLockedTargetY = null;

function startBlazingHalo(lockX = null, lockY = null) {
  aiState = 'HALO_WINDUP';
  pendingCombatAction = null;
  // Stop horizontal locomotion and smoothly return tilt to 0 (upright)
  locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
  currentFrameIndex = 44;
  frameTimeAccumulator = 0;
  // Chốt cứng tọa độ mục tiêu (locked_target) ngay từ thời điểm bắt đầu vận chiêu (Frame 44) theo Hiến pháp
  // Nếu Vargost đang bị Boss Crapit tấn công -> phản xạ ưu tiên đánh trả Boss Crapit!
  const defaultLockX = (vargostRetaliateBoss && !crapitIsDead) ? crapitX : ((!aodaIsDead) ? aodaX : SWORD_X);
  const defaultLockY = (vargostRetaliateBoss && !crapitIsDead) ? (crapitY - 50) : ((!aodaIsDead) ? (aodaY - 45) : SWORD_Y);
  haloLockedTargetX = (lockX !== null) ? lockX : defaultLockX;
  haloLockedTargetY = (lockY !== null) ? lockY : defaultLockY;
  // Đồng bộ mặt nhìn thẳng về mục tiêu và đứng thẳng 0° khi vận chiêu
  const castFacing = (haloLockedTargetX >= vargostX) ? 1 : -1;
  facingDirection = castFacing;
  targetFacingVisual = castFacing;
  visualFacing = castFacing;
  turnSquashY = 1.0;
  currentTilt = 0;
  hudState.textContent = 'Tối Thượng: VẬN CÔNG GOM VÒNG LỚN (Frame 44 · Khóa đường bay)';
  hudState.className = 'badge active';
  hudAi.textContent = 'AI: Thi triển Blazing Halo (Locked Trajectory)';
  hudAi.className = 'badge active';
}

// -------------------------------------------------------------
// Projectile Spawner (1100 px/s - Skillshot Vector Khóa Đường Bay)
// -------------------------------------------------------------
function spawnBlazingHaloProjectile(targetX, targetY) {
  const spriteScale = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

  // Offsets from anchor [105, 162]: Hand position is [20, -20]
  const dx = (Number(numSpawnDx.value) || 20) * facingDirection;
  const dy = Number(numSpawnDy.value) || -20;

  const cos = Math.cos(currentTilt);
  const sin = Math.sin(currentTilt);
  const rdx = dx * cos - dy * sin;
  const rdy = dx * sin + dy * cos;

  const startX = vargostX + rdx * spriteScale;
  const startY = (vargostY + hoverOffset) + rdy * spriteScale;

  // Khóa ĐƯỜNG BAY (Locked Trajectory Vector) tại thời điểm ném
  const aimTargetX = targetX;
  const aimTargetY = (typeof targetY === 'number' && Math.abs(targetY - groundY) > 1) ? targetY : (groundY - 24); // Độ cao ngực mục tiêu thực tế trên mọi bệ đá!

  const dirX = aimTargetX - startX;
  const dirY = aimTargetY - startY;
  const distTotal = Math.max(1, Math.hypot(dirX, dirY));
  const flightSpeedCanvas = PROJECTILE_SPEED_PX * (mapScale / 2.625);

  const vx = (dirX / distTotal) * flightSpeedCanvas;
  const vy = (dirY / distTotal) * flightSpeedCanvas;

  activeProjectile = {
    startX: startX,
    startY: startY,
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    aimTargetX: aimTargetX,
    aimTargetY: aimTargetY,
    spinFrame: 0,
    spinAccum: 0,
    time: 0,
    size: 80 * spriteScale,
    radius: 26 * spriteScale,
  };

  hudProjectile.textContent = 'Đại cầu lửa: Bay theo vector đường bay @ 1100px/s';
  hudProjectile.className = 'badge active';
}

// -------------------------------------------------------------
// Ground Explosion VFX Spawner
// -------------------------------------------------------------
function spawnExplosion(x, y) {
  activeExplosion = {
    x: x,
    y: y,
    frame: 0,
    accum: 0,
    totalFrames: 91,
    cols: 13,
    rows: 7,
    frameW: 128,
    frameH: 66,
    fps: 30,
    scale: 2.2 * (zoom / 0.7),
  };
}

// -------------------------------------------------------------
// Hit Impact VFX Spawner (Kim Cương 4 Cánh Cross Spark & Shockwave)
// -------------------------------------------------------------
function spawnHitImpact(x, y, knockDir) {
  activeHitImpacts.push({
    x: x,
    y: y,
    life: 0.18,
    maxLife: 0.18,
    knockDir: knockDir || 1,
    rotation: (Math.random() - 0.5) * 0.4
  });

  // Chùm tia lửa kim cương bùng nổ tóe rực rỡ ra các hướng (24 hạt bung tỏa)
  const spriteScale = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.5;
    const spd = (180 + Math.random() * 320) * (mapScale / 2.625);
    emberParticles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * spd + (knockDir || 1) * 85,
      vy: Math.sin(angle) * spd - 60,
      size: Math.random() < 0.35 ? 4.5 : (Math.random() < 0.7 ? 3 : 2),
      alpha: 1.0,
      color: Math.random() < 0.35 ? '#ffffff' : (Math.random() < 0.7 ? '#ffd166' : '#ff4500'),
      life: 0.28 + Math.random() * 0.18
    });
  }
}

// -------------------------------------------------------------
// BOSS TRUNG LẬP CRAPIT: NHẬN SÁT THƯƠNG, TỬ TRẬN, PHUN CẦU NƯỚC BỌT & VẬT PHẨM TƯƠNG LAI
// -------------------------------------------------------------
function damageCrapitBoss(amount, attackerId, knockDir = 1) {
  if (crapitIsDead) return;
  const prevHp = crapitHp;
  crapitHp = Math.max(0, crapitHp - amount);
  crapitHitFlash = 0.35;
  crapitLastHitBy = attackerId;

  crapitDamageGhosts.push({
    fromHp: prevHp,
    toHp: crapitHp,
    maxHp: CRAPIT_MAX_HP,
    timer: 0,
    flashDuration: 0.12,
    dissolveDuration: 0.42,
    totalDuration: 0.54,
    seed: Math.random()
  });

  const cScale = CRAPIT_DISPLAY_SCALE * (zoom / 0.7);
  spawnHitImpact(crapitX, crapitY - 50 * cScale, knockDir);
  enemyDamageNumbers.push({
    text: `💥 -${amount} HP (BOSS)!`,
    x: crapitX,
    y: crapitY - 85 * cScale,
    color: '#ff9800',
    alpha: 1.0,
    vy: -50
  });

  if (crapitHp <= 0) {
    crapitIsDead = true;
    crapitState = 'DEAD';
    crapitDeathTimer = 0.0;
    // Khi Boss chết: Toàn bộ tướng ngừng đánh trả Boss và quay lại mục tiêu chiếm Thánh Kiếm!
    vargostRetaliateBoss = false;
    aodaRetaliateBoss = false;

    // Rơi Cổ Vật (Loot Orb) tại nơi Boss chết: kích thước 30x30px, hiệu ứng chói lóa, lóe sáng
    bossLootDrop.x = crapitX;
    bossLootDrop.y = crapitY;
    bossLootDrop.lockedPickerId = crapitLastHitBy; // Ban đầu chỉ người kết liễu mới nhặt được
    bossLootDrop.carrierId = null;
    bossLootDrop.isFreeForAll = false;
    bossLootDrop.isDelivered = false;
    bossLootDrop.shineTimer = 0.0;
    bossLootDrop.active = true;

    const killerName = (crapitLastHitBy === 'vargost') ? 'Vargost (Team 1)' : 'Aoda (Team 2)';
    showToast(`💀 BOSS CRAPIT BỊ TIÊU DIỆT BỞI ${killerName.toUpperCase()}! Cổ Vật rơi xuống với ánh sáng chói lóa!`);
  }
}

function spawnCrapitSalivaOrb(targetId) {
  const cScale = CRAPIT_DISPLAY_SCALE * (zoom / 0.7);
  // #1 crapit_main · leg_left (f8): Pin (103, 229) -> offset [-45, -103] so với Anchor (148, 332)
  const pinWorldX = crapitX + CRAPIT_MOUTH_PIN_DX * cScale;
  const pinWorldY = crapitY + CRAPIT_MOUTH_PIN_DY * cScale;
  // #2 crapit_main · leg_left (f8): Rect [56, 232, 33, 28] -> tâm (72.5, 246), offset [-75.5, -86]
  const boxWorldX = crapitX + CRAPIT_SALIVA_BOX_DX * cScale;
  const boxWorldY = crapitY + CRAPIT_SALIVA_BOX_DY * cScale;

  activeCrapitProjectiles.push({
    x: pinWorldX,
    y: pinWorldY,
    pinX: pinWorldX,
    pinY: pinWorldY,
    boxX: boxWorldX,
    boxY: boxWorldY,
    mouthSlideTimer: 0.0,
    mouthSlideDuration: 0.06, // Liên kết mượt mà từ kết thúc Frame 7 (Pin) sang đầu Frame 8 (Box nước bọt trắng)
    targetId: targetId || 'vargost', // Khóa cứng mục tiêu không trượt
    speed: CRAPIT_ORB_SPEED_PX * (mapScale / 2.625), // 500 px/s
    frameIndex: 0,
    frameTimer: 0.0,
    spinAngle: 0.0,
    size: 30 * (zoom / 0.7), // Kích thước 30x30 theo yêu cầu
    radius: 15 * (zoom / 0.7),
    time: 0.0
  });
}

function spawnCrapitExplosion(x, y) {
  activeCrapitExplosions.push({
    x: x,
    y: y,
    frameIndex: 0,
    frameTimer: 0.0,
    totalFrames: 6, // Chu kỳ nổ 6 frame cốt lõi từ Scrapit_animation
    size: 40 * (zoom / 0.7) // Kích thước 40x40 theo yêu cầu
  });
}

// -------------------------------------------------------------
// Enemy Counter-Attack Projectile Spawner (Ám Tiễn Hắc Ám 800px/s)
// -------------------------------------------------------------
function spawnEnemyProjectile() {
  if (enemyStunTimer > 0) return;
  const enemyScale = (zoom / 0.7);
  const startX = (enemyWorldX !== null) ? enemyWorldX : (mapX + 380 * mapScale);
  const startY = groundY - 24 * enemyScale;

  // Nhắm thẳng vào ngực Vargost
  const targetX = vargostX;
  const targetY = vargostY + (isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0) - 25 * (assets.manifest ? assets.manifest.display_scale : 0.872) * enemyScale;

  const dirX = targetX - startX;
  const dirY = targetY - startY;
  const dist = Math.max(1, Math.hypot(dirX, dirY));
  const speed = 800 * (mapScale / 2.625);

  activeEnemyProjectiles.push({
    x: startX,
    y: startY,
    vx: (dirX / dist) * speed,
    vy: (dirY / dist) * speed,
    targetX: targetX,
    targetY: targetY,
    radius: 14 * enemyScale,
    time: 0,
    spinAngle: 0
  });

  hudProjectile.textContent = 'Kẻ địch: PHẢN CÔNG ÁM TIỄN HẮC ÁM @ 800px/s!';
  hudProjectile.className = 'badge warning';
  showToast('⚔️ KẺ ĐỊCH PHẢN CÔNG BẮN ÁM TIỄN VỀ PHÍA VARGOST!');
}

// -------------------------------------------------------------
// Main Loop
// -------------------------------------------------------------
let lastTimestamp = 0;

function update(timestamp) {
  try {
    if (!lastTimestamp) lastTimestamp = timestamp;
  const rawDt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  const dt = Math.min(rawDt, 0.1) * Number(selRate.value);

  hoverTimer += dt;
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

  // -------------------------------------------------------------
  // CẬP NHẬT TIẾN ĐỘ CHIẾM CỨ ĐIỂM THÁNH KIẾM (Asset/Character/vfx/sword.mp4)
  // Quy tắc: 20s liên tục không rời vùng -> Thắng!
  // Rời vùng -> Reset về 0.0s!
  // Tranh chấp -> Đóng băng đồng hồ!
  // -------------------------------------------------------------
  swordAnimAccum += dt;
  if (swordAnimAccum >= 0.10) {
    swordAnimAccum -= 0.10;
    swordFrameIndex = (swordFrameIndex + 1) % 55;
  }

  // Thành viên chiếm đóng trong vòng 135px: Team 1 (Vargost) vs Team 2 (Aoda) - Đã xóa bỏ các hình nhân
  const isVargostInZone = (!isDead && Math.hypot(vargostX - SWORD_X, (vargostY + hoverOffset) - SWORD_Y) <= SWORD_CAPTURE_RADIUS);
  const hasTeam1InZone = isVargostInZone;

  const isAodaInZone = (!aodaIsDead && Math.hypot(aodaX - SWORD_X, aodaY - SWORD_Y) <= SWORD_CAPTURE_RADIUS);
  const hasTeam2InZone = isAodaInZone;

  if (matchWinner === null) {
    if (hasTeam1InZone && hasTeam2InZone) {
      isSwordContested = true;
      if (hudObjectiveStatus) {
        hudObjectiveStatus.textContent = `⚔ TRANH CHẤP (${swordCaptureTimer.toFixed(1)}/20.0s) · Giao tranh nghẹt thở!`;
        hudObjectiveStatus.className = 'badge warning';
      }
    } else if (hasTeam1InZone) {
      isSwordContested = false;
      if (swordControllingTeam !== 1) {
        swordControllingTeam = 1;
        swordCaptureTimer = 0.0;
      }
      swordCaptureTimer += dt;
      if (swordCaptureTimer >= SWORD_CAPTURE_REQUIRED) {
        swordCaptureTimer = SWORD_CAPTURE_REQUIRED;
        matchWinner = 1;
        showToast('🏆 TEAM 1 CHIẾN THẮNG! Chiếm giữ Thánh Kiếm thành công sau 20s!');
      }
      if (hudObjectiveStatus) {
        hudObjectiveStatus.textContent = `Đội 1 Chiếm Giữ: ${swordCaptureTimer.toFixed(1)}/20.0s [${Math.round((swordCaptureTimer / 20.0) * 100)}%]`;
        hudObjectiveStatus.className = 'badge success';
      }
    } else if (hasTeam2InZone) {
      isSwordContested = false;
      if (swordControllingTeam !== 2) {
        swordControllingTeam = 2;
        swordCaptureTimer = 0.0;
      }
      swordCaptureTimer += dt;
      if (swordCaptureTimer >= SWORD_CAPTURE_REQUIRED) {
        swordCaptureTimer = SWORD_CAPTURE_REQUIRED;
        matchWinner = 2;
        showToast('🏆 TEAM 2 CHIẾN THẮNG! Chiếm giữ Thánh Kiếm thành công sau 20s!');
      }
      if (hudObjectiveStatus) {
        hudObjectiveStatus.textContent = `Đội 2 Chiếm Giữ: ${swordCaptureTimer.toFixed(1)}/20.0s [${Math.round((swordCaptureTimer / 20.0) * 100)}%]`;
        hudObjectiveStatus.className = 'badge danger';
      }
    } else {
      // KHÔNG CÒN AI TRONG VÙNG -> RESET NGAY LẬP TỨC VỀ 0.0s
      isSwordContested = false;
      if (swordCaptureTimer > 0 || swordControllingTeam !== null) {
        swordCaptureTimer = 0.0;
        swordControllingTeam = null;
      }
      if (hudObjectiveStatus) {
        hudObjectiveStatus.textContent = 'Thánh Kiếm: Trống (Tiến vào vùng và giữ 20s để thắng)';
        hudObjectiveStatus.className = 'badge';
      }
    }
  }

  // Cập nhật mục tiêu nhiệm vụ trên HUD
  if (hudVargostObjective) {
    hudVargostObjective.textContent = (vargostRetaliateBoss && !crapitIsDead)
      ? 'Vargost: [PHẢN CÔNG BOSS] Đánh trả Boss Crapit!'
      : (isVargostInZone ? 'Vargost: [PHÒNG THỦ] Trụ trong vùng Thánh Kiếm' : 'Vargost: [TẤN CÔNG] Bay tiến về chiếm Thánh Kiếm');
    hudVargostObjective.className = (vargostRetaliateBoss && !crapitIsDead) ? 'badge warning' : (isVargostInZone ? 'badge active' : 'badge');
  }
  if (hudAodaObjective) {
    hudAodaObjective.textContent = (aodaRetaliateBoss && !crapitIsDead)
      ? 'Aoda: [PHẢN CÔNG BOSS] Đánh trả Boss Crapit!'
      : (isAodaInZone ? 'Aoda: [PHÒNG THỦ] Trụ trong vùng Thánh Kiếm' : 'Aoda: [TẤN CÔNG] Chạy nhảy vượt bệ tiến về Thánh Kiếm');
    hudAodaObjective.className = (aodaRetaliateBoss && !crapitIsDead) ? 'badge warning' : (isAodaInZone ? 'badge active' : 'badge');
  }

  // Cập nhật các bộ đếm trạng thái khống chế (Định Thân & Câm Lặng)
  if (vargostStunTimer > 0) vargostStunTimer = Math.max(0, vargostStunTimer - dt);
  if (vargostSilenceTimer > 0) vargostSilenceTimer = Math.max(0, vargostSilenceTimer - dt);
  if (groundDummyStunTimer > 0) groundDummyStunTimer = Math.max(0, groundDummyStunTimer - dt);
  if (groundDummySilenceTimer > 0) groundDummySilenceTimer = Math.max(0, groundDummySilenceTimer - dt);

  // -------------------------------------------------------------
  // Phase Blink & Teleport Dissolve Progression (Thân pháp biến ảnh 3 nhịp)
  // -------------------------------------------------------------
  if (isPhaseBlinking) {
    phaseBlinkTimer += dt;
    const t = phaseBlinkTimer;

    if (t < 0.14) {
      // Pha 1: Tan rã lát cắt (Dissolve Out) + Glitch Blink chớp tắt
      phaseBlinkStep = 1;
      currentDissolveFactor = Math.min(1.0, t / 0.14);
      isGlitchFlash = Math.sin(t * 55) > 0.2; // Chớp tắt 2-3 nhịp sắc sảo
      
      // Hạt tia lửa rã ra từ thân
      if (Math.random() < 0.5) {
        emberParticles.push({
          x: vargostX + (Math.random() - 0.5) * 45 * (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7),
          y: (vargostY + (isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0)) + (Math.random() - 0.5) * 55 * (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7),
          vx: (Math.random() - 0.5) * 140,
          vy: -Math.random() * 100 - 20,
          size: Math.random() < 0.5 ? 3 : 2,
          alpha: 1.0,
          color: Math.random() < 0.5 ? '#ff4500' : '#ffd700',
          life: 0.25
        });
      }
    } else if (t < 0.22) {
      // Pha 2: Tàng hình trong hư không (Void) + Dịch chuyển tức thời (Teleport) + Lật hướng
      if (phaseBlinkStep !== 2) {
        phaseBlinkStep = 2;
        // 1. Dịch chuyển tức thời tới vị trí teleportTarget (lùi hoặc vị trí chỉ định trong phạm vi căn cứ Trái/Phải)
        vargostX = Math.max(mapX + 35 * mapScale, Math.min(W - 400, teleportTargetX));
        vargostY = isFlying ? Math.max(skyCeilingY, Math.min(skyLowY, teleportTargetY)) : groundY;
        targetVargostX = vargostX;
        targetVargostY = vargostY;
        locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
        currentTilt = 0; // Đứng thẳng 0 độ uy nghiêm!

        // 2. Lật mặt khi đang hoàn toàn tàng hình -> mắt người dùng KHÔNG nhìn thấy nét lật 2D
        facingDirection = phaseBlinkTargetFacing;
        targetFacingVisual = phaseBlinkTargetFacing;
        visualFacing = phaseBlinkTargetFacing;
        turnSquashY = 1.0;

        // Sinh hạt tàn tro tại vị trí dịch chuyển mới
        const spriteScale = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
        for (let k = 0; k < 10; k++) {
          emberParticles.push({
            x: vargostX + (Math.random() - 0.5) * 35 * spriteScale,
            y: (vargostY + (isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0)) + (Math.random() - 0.5) * 45 * spriteScale,
            vx: (Math.random() - 0.5) * 90,
            vy: -Math.random() * 80 - 20,
            size: Math.random() < 0.4 ? 3 : 2,
            alpha: 1.0,
            color: Math.random() < 0.4 ? '#ff3838' : (Math.random() < 0.7 ? '#ffd166' : '#ff4500'),
            life: 0.25
          });
        }
      }
      currentDissolveFactor = 1.0; // Hoàn toàn tàng hình
    } else if (t < 0.38) {
      // Pha 3: Tụ lại lát cắt pixel (Re-materialize) từ hư không, mặt đã quay sẵn về phía kẻ địch!
      phaseBlinkStep = 3;
      const p3 = (t - 0.22) / 0.16;
      currentDissolveFactor = Math.max(0, 1.0 - p3);
      isGlitchFlash = (p3 < 0.4) ? (Math.sin(t * 60) > 0.4) : false;
    } else {
      // Kết thúc Phase Blink
      isPhaseBlinking = false;
      phaseBlinkStep = 0;
      currentDissolveFactor = 0;
      isGlitchFlash = false;
      facingDirection = phaseBlinkTargetFacing;
      targetFacingVisual = phaseBlinkTargetFacing;
      visualFacing = phaseBlinkTargetFacing;
    }
  } else if (isTurnFlipping) {
    turnFlipTimer += dt;
    const halfTime = TURN_FLIP_DURATION * 0.5; // 0.07s
    if (turnFlipTimer < halfTime) {
      // Nửa đầu: Vargost vẫn giữ facing cũ, tan rã lát cắt pixel scanlines che mờ thân
      currentDissolveFactor = Math.min(1.0, turnFlipTimer / halfTime);
      isGlitchFlash = (turnFlipTimer > 0.02);
    } else if (turnFlipTimer < TURN_FLIP_DURATION) {
      // Đúng thời điểm giữa (t = halfTime): Lật hướng mặt sang turnFlipNewFacing!
      // Tại đúng frame này, thân thể đang bị che phủ hoàn toàn bởi pixel dissolve + glitch flash!
      facingDirection = turnFlipNewFacing;
      targetFacingVisual = turnFlipNewFacing;
      visualFacing = turnFlipNewFacing;
      // Nửa sau: Tụ lại lát cắt pixel (Re-materialize) ở hướng mặt mới
      const p = (turnFlipTimer - halfTime) / halfTime;
      currentDissolveFactor = Math.max(0, 1.0 - p);
      isGlitchFlash = (p < 0.4);
    } else {
      // Hoàn tất xoay mặt
      isTurnFlipping = false;
      turnFlipTimer = 0;
      currentDissolveFactor = 0;
      isGlitchFlash = false;
      facingDirection = turnFlipNewFacing;
      targetFacingVisual = turnFlipNewFacing;
      visualFacing = turnFlipNewFacing;
    }
    turnSquashY = 1.0;
  } else {
    currentDissolveFactor = 0;
    isGlitchFlash = false;
    visualFacing = targetFacingVisual;
    turnSquashY = 1.0;
  }

  const flySpeed = (currentFlySpeed || SPEED_FAST) * (mapScale / 2.625);
  const targetTiltDeg = Number(rngTilt.value) || 20; // Chốt 20 độ chuẩn

  // -------------------------------------------------------------
  // DYNAMIC TARGET (Hỗ trợ Mục Tiêu Di Động & Tuần Tra Qua Lại)
  // -------------------------------------------------------------
  const userDist = Number(rngDistance.value) * (mapScale / 2.625);
  const baseTargetX = teamOriginDirection === 1
    ? (mapX + 220.0 * mapScale + userDist)
    : (mapX + 380.0 * mapScale - userDist);

  if (enemyWorldX === null) enemyWorldX = baseTargetX;

  // Xử lý Hit Stun (Đứng yên 0.1s khi dính đòn)
  if (enemyStunTimer > 0) {
    enemyStunTimer -= dt;
    // Bị khựng đứng yên hoàn toàn do trúng đòn! Không di chuyển patrol, không dash!
  } else if (chkMovingTarget && chkMovingTarget.checked) {
    // Tốc độ tuần tra biến thiên linh hoạt trong khoảng [100, 300] px/s
    enemyPatrolSpeed = Math.max(100, Math.min(300, 200 + Math.sin(hoverTimer * 2.8) * 80));

    // Phản xạ né đòn: Khi Vargost chuẩn bị tung skill (Frame >= 63) hoặc đạn đang bay
    if (enemyDodgeCooldown > 0) enemyDodgeCooldown -= dt;
    if (((aiState === 'HALO_WINDUP' && currentFrameIndex >= 63) || activeProjectile) && enemyDodgeCooldown <= 0 && enemyStunTimer <= 0 && !isEnemyDashing) {
      if (Math.random() < 0.55) {
        // Kích hoạt né đòn tối đa 300 px/s!
        isEnemyDashing = true;
        enemyDashTimer = 0.45;
        enemyDashSpeed = 300; // Giới hạn 300 px/s
        enemyMoveDir = (vargostX < enemyWorldX) ? 1 : -1;
        enemyDodgeCooldown = 3.5;
        showToast(`⚡ Kẻ địch phản xạ né đòn @ ${Math.round(enemyDashSpeed)}px/s!`);
      } else {
        enemyDodgeCooldown = 2.2;
      }
    }

    if (isEnemyDashing) {
      enemyDashTimer -= dt;
      // Dash tốc độ cao 750 - 1000 px/s
      enemyWorldX += enemyMoveDir * enemyDashSpeed * (mapScale / 2.625) * dt;
      const minX = mapX + 140 * mapScale;
      const maxX = mapX + 480 * mapScale;
      if (enemyWorldX <= minX) {
        enemyWorldX = minX;
        enemyMoveDir = 1;
      } else if (enemyWorldX >= maxX) {
        enemyWorldX = maxX;
        enemyMoveDir = -1;
      }
      if (enemyDashTimer <= 0) {
        isEnemyDashing = false;
      }
    } else {
      // Tuần tra di chuyển qua lại trên bệ đá [mapX + 160, mapX + 460] @ 300 - 550 px/s
      const minX = mapX + 160 * mapScale;
      const maxX = mapX + 460 * mapScale;
      enemyWorldX += enemyMoveDir * enemyPatrolSpeed * (mapScale / 2.625) * dt;
      if (enemyWorldX <= minX) {
        enemyWorldX = minX;
        enemyMoveDir = 1;
      } else if (enemyWorldX >= maxX) {
        enemyWorldX = maxX;
        enemyMoveDir = -1;
      }
    }

    // Kẻ địch tự động phản công Vargost (Chu kỳ 3.8s - 5.5s)
    if (enemyAttackCooldown > 0) {
      enemyAttackCooldown -= dt;
    } else if (enemyStunTimer <= 0) {
      enemyAttackCooldown = 3.8 + Math.random() * 1.5;
      spawnEnemyProjectile();
    }
  } else {
    enemyWorldX = baseTargetX;
  }

  // Chọn mục tiêu của Vargost:
  // - Khi đang mang Cổ Vật (carrierId === 'vargost'): Ưu tiên số 1 bay về Căn Cứ Trái (LEFT_EXTRACTION_X, LEFT_EXTRACTION_Y), giảm 10% tốc độ!
  // - Khi Cổ Vật rơi tự do: Bay đến nhặt Cổ Vật!
  // - Khi địch Aoda mang Cổ Vật: Toàn đội đổi mục tiêu truy sát người mang Cổ Vật!
  // - Nếu bị Boss Crapit tấn công: Phản xạ quay sang đánh trả Boss Crapit!
  // - Còn lại: Nhắm Aoda (Team 2 · Kẻ Địch), nếu Aoda tử trận thì nhắm Thánh Kiếm
  const isCarryingLoot = (bossLootDrop.carrierId === 'vargost');
  const isPursuingCarrier = (bossLootDrop.carrierId === 'aoda');
  const isPickingUpLoot = (bossLootDrop.active && !bossLootDrop.carrierId && (bossLootDrop.isFreeForAll || bossLootDrop.lockedPickerId === 'vargost'));

  let primaryTargetX = SWORD_X;
  let primaryTargetY = SWORD_Y;

  if (isCarryingLoot) {
    primaryTargetX = LEFT_EXTRACTION_X;
    primaryTargetY = LEFT_EXTRACTION_Y;
  } else if (isPickingUpLoot) {
    primaryTargetX = bossLootDrop.x;
    primaryTargetY = bossLootDrop.y - 35 * (zoom / 0.7);
  } else if (isPursuingCarrier) {
    primaryTargetX = aodaX;
    primaryTargetY = aodaY - 45;
  } else if (vargostRetaliateBoss && !crapitIsDead) {
    primaryTargetX = crapitX;
    primaryTargetY = crapitY - 50;
  } else if (!aodaIsDead) {
    primaryTargetX = aodaX;
    primaryTargetY = aodaY - 45;
  }

  const targetX = primaryTargetX;
  const targetY = primaryTargetY;

  const isTeam1Carrying = (bossLootDrop.carrierId === 'vargost');
  const isTeam2Carrying = (bossLootDrop.carrierId === 'aoda');

  if (isTeam1Carrying) {
    currentFlySpeed = SPEED_NORMAL * 0.90; // Cả Team 1 giảm 10% tốc độ di chuyển khi có người mang Cổ Vật
  }

  const diffX = targetX - vargostX;
  const diffY = targetY - (vargostY + hoverOffset);
  const dist2DPx = Math.round(Math.hypot(diffX, diffY) / (mapScale / 2.625));
  const absDistPx = Math.round(Math.abs(diffX) / (mapScale / 2.625));
  // Khi bay, cự ly chiến đấu thực tế là cự ly 2D (tránh ngộ nhận là quá gần khi bay cao trên đầu)
  const distInPx = isFlying ? dist2DPx : absDistPx;
  const desiredFacing = diffX >= 0 ? 1 : -1;
  const isEnemyBehind = Math.abs(diffX) > 25 && (desiredFacing !== facingDirection);

  if (isEnemyBehind) {
    hudRange.textContent = `Cự ly: ${absDistPx}px (Địch sau lưng - Thân pháp biến ảnh pixel xoay mặt)`;
    hudRange.className = 'badge warning';
  } else {
    const curSpd = isEnemyDashing ? Math.round(enemyDashSpeed) : Math.round(enemyPatrolSpeed);
    hudRange.textContent = `Cự ly: ${absDistPx}px (Địch @ ${curSpd}px/s | Vargost: ${vargostHp}/${VARGOST_MAX_HP} HP)`;
    const inOptimalRange = (absDistPx >= MIN_ATTACK_RANGE && absDistPx <= MAX_ATTACK_RANGE);
    hudRange.className = inOptimalRange ? 'badge active' : 'badge warning';
  }

  // -------------------------------------------------------------
  // AUTONOMOUS UTILITY AI (Tự động di chuyển & tấn công)
  // -------------------------------------------------------------
  if (vargostSpawnFreezeTimer > 0) {
    vargostSpawnFreezeTimer -= dt;
    locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
    aiState = 'IDLE';
  } else if (vargostStunTimer > 0) {
    // ĐANG BỊ CHOÁNG BỞI LỐC XOÁY: Bất động hoàn toàn, không di chuyển, không tung chiêu, không teleport!
    locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
    aiState = 'STUNNED';
    currentTilt += (0 - currentTilt) * Math.min(dt * 10, 1);
    if (hudState) {
      hudState.textContent = `Vargost: BỊ CHOÁNG BỞI LỐC XOÁY (${vargostStunTimer.toFixed(1)}s)!`;
      hudState.className = 'badge warning';
    }
    if (hudLocomotion) {
      hudLocomotion.textContent = `Khống chế: CHOÁNG ${vargostStunTimer.toFixed(1)}s (Đứng yên 0°)`;
      hudLocomotion.className = 'badge warning';
    }
  } else if (chkAuto.checked && !isDead) {
    if (autoCooldown > 0) autoCooldown -= dt;
    if (altitudeCooldown > 0) altitudeCooldown -= dt;

    // Vargost là tướng pháp sư đánh xa, ƯU TIÊN BAY TRÊN BẦU TRỜI làm chủ không phận:
    // Chỉ ở dưới đất khi đang một mình chiếm cứ điểm Thánh Kiếm lúc Aoda tử trận!
    const isCapturingSwordAlone = aodaIsDead && Math.hypot(vargostX - SWORD_X, groundY - SWORD_Y) <= SWORD_CAPTURE_RADIUS;
    if (!isFlying && !isCapturingSwordAlone && locomotionState !== 'TAKEOFF' && locomotionState !== 'LANDING') {
      takeoff();
      hudLocomotion.textContent = 'AI: TƯỚNG TẦM XA -> CẤT CÁNH CHIẾM LĨNH BẦU TRỜI!';
      hudLocomotion.className = 'badge active';
    }

    if (aiState === 'IDLE' && !pendingCombatAction && locomotionState !== 'TAKEOFF' && locomotionState !== 'LANDING') {
      // ƯU TIÊN SỐ 1: NHẶT CỔ VẬT HOẶC HỘ TỐNG CỔ VẬT VỀ CĂN CỨ VỚI TỐC ĐỘ TỐI ĐA!
      // Không tấn công kẻ địch, không tuần tra chậm, không bị phân tâm
      if (isPickingUpLoot || isCarryingLoot) {
        if (!isFlying) takeoff();
        const moveSpd = isPickingUpLoot ? SPEED_NORMAL : (SPEED_NORMAL * 0.90);
        currentFlySpeed = moveSpd;
        rngFlySpeed.value = moveSpd;
        lblFlySpeed.textContent = `${moveSpd}px/s`;

        const vDist = Math.hypot(diffX, diffY);
        const moveFacing = (diffX >= 0) ? 1 : -1;
        requestFacing(moveFacing);
        currentTilt = (targetTiltDeg * Math.PI / 180); // Luôn nghiêng đầu 20° về phía trước theo hướng tiến

        if (vDist > 8) {
          const stepRate = moveSpd * (mapScale / 2.625) * dt;
          vargostX += (diffX / vDist) * stepRate;
          vargostY += (diffY / vDist) * (stepRate * 0.75);
          locomotionState = 'FLY_VECTOR';
        } else {
          vargostX = targetX;
          vargostY = targetY;
          locomotionState = 'IDLE_FLY';
        }

        if (isPickingUpLoot) {
          hudLocomotion.textContent = `AI: TẬN DỤNG TỐI ĐA TỐC ĐỘ ${SPEED_FAST}px/s BAY NHẶT CỔ VẬT!`;
          hudLocomotion.className = 'badge active';
        } else {
          hudLocomotion.textContent = `AI: HỘ TỐNG CỔ VẬT VỀ CĂN CỨ TRÁI @ ${Math.round(SPEED_FAST * 0.9)}px/s!`;
          hudLocomotion.className = 'badge active';
        }
      } else {
        aiDecisionTimer -= dt;
        if (aiDecisionTimer <= 0) {
          aiDecisionTimer = 0.35; // chu kỳ ra quyết định 0.35s

        // 0. Xử lý Địch ở sau lưng: Thân pháp biến ảnh pixel xoay người khóa mục tiêu
        if (isEnemyBehind) {
          if (!isPhaseBlinking) {
            triggerPhaseBlink(desiredFacing);
            hudLocomotion.textContent = 'AI: ĐỊCH SAU LƯNG -> THÂN PHÁP BIẾN ẢNH PIXEL XOAY MẶT (0.38s)';
            hudLocomotion.className = 'badge active';
          }
        }
        // 1. Nếu cự ly quá xa (> 550px): Tăng tốc 400px/s bay xéo tiến áp sát
        else if (distInPx > MAX_ATTACK_RANGE) {
          targetFacingVisual = facingDirection;
          currentFlySpeed = SPEED_FAST;
          rngFlySpeed.value = SPEED_FAST;
          lblFlySpeed.textContent = `${SPEED_FAST}px/s`;
          const stepAdv = (distInPx - 360) * (mapScale / 2.625);
          targetVargostX = Math.max(mapX + 100, Math.min(W - 400, vargostX + facingDirection * stepAdv));
          if (isFlying) {
            const preferUp = (vargostY > (skyCeilingY + skyLowY) / 2);
            targetVargostY = preferUp
              ? Math.max(skyCeilingY, vargostY - 35 * mapScale)
              : Math.min(skyLowY, vargostY + 35 * mapScale);
            const clockStr = preferUp ? 'Tiến-Lên' : 'Tiến-Bổ Nhào';
            const tiltLabel = '+20°';
            hudLocomotion.textContent = `AI: TĂNG TỐC BAY XÉO ÁP SÁT @ 400px/s (${clockStr}, Nghiêng ${tiltLabel})`;
          } else {
            targetVargostY = groundY;
            const tiltLabel = '+20°';
            hudLocomotion.textContent = `AI: TIẾN ÁP SÁT TRÊN BỆ ĐÁ (400px/s, Nghiêng ${tiltLabel})`;
          }
          locomotionState = 'FLY_VECTOR';
          hudLocomotion.className = 'badge flying';
        }
        // 2. Nếu cự ly quá gần (< 150px): KIỂM TRA TƯỜNG SAU LƯNG ĐỂ THOÁT KẸT
        else if (distInPx < MIN_ATTACK_RANGE) {
          if (!isPhaseBlinking) {
            // Đối với tướng tầm xa bay lượn, nếu đang ở dưới đất bị tiếp cận thì bay vọt lên trời ngay
            if (!isFlying) {
              takeoff();
              targetVargostY = skyCeilingY + 12 * (mapScale / 2.625);
              locomotionState = 'FLY_VECTOR';
              currentFlySpeed = SPEED_FAST;
              autoCooldown = 0.5;
              hudLocomotion.textContent = 'AI: ĐỊCH ÁP SÁT -> CẤT CÁNH BAY LÊN TRỜI TẤN CÔNG TỪ TRÊN CAO!';
              hudLocomotion.className = 'badge active';
              showToast('⚡ Vargost: Địch áp sát -> Bay vọt lên không trung tấn công từ trên cao!');
            } else {
              const retreatDir = -facingDirection;
              const stepRet = Math.max(130 * (mapScale / 2.625), (320 - distInPx) * (mapScale / 2.625));
              const blockedBehind = isRetreatBlocked(vargostX, vargostY, retreatDir);

              if (blockedBehind) {
                // SAU LƯNG LÀ TƯỜNG -> Vargost hiểu và BAY VỌT LÊN TRÊN BẦU TRỜI thoát kẹt và tấn công từ trên cao!
                targetVargostY = skyCeilingY + 12 * (mapScale / 2.625);
                targetVargostX = Math.max(mapX + 110, Math.min(W - 400, vargostX + facingDirection * 35 * (mapScale / 2.625)));
                locomotionState = 'FLY_VECTOR';
                currentFlySpeed = SPEED_FAST;
                rngFlySpeed.value = SPEED_FAST;
                lblFlySpeed.textContent = `${SPEED_FAST}px/s`;
                autoCooldown = 0.5;
                hudLocomotion.textContent = 'AI: SAU LƯNG LÀ TƯỜNG -> BAY VỌT LÊN TRỜI THOÁT KẸT & TẤN CÔNG TỪ TRÊN CAO!';
                hudLocomotion.className = 'badge active';
                showToast('⚡ Vargost: Sau lưng là tường -> Bay vọt lên trời tấn công từ trên cao!');
              } else {
                const safeRet = calculateSafeRetreat(vargostX, vargostY, retreatDir, stepRet);
                if (safeRet.escapedVertically) {
                  targetVargostY = safeRet.y;
                  targetVargostX = safeRet.x;
                  locomotionState = 'FLY_VECTOR';
                  currentFlySpeed = SPEED_FAST;
                  hudLocomotion.textContent = 'AI: VƯỚNG ĐỊA HÌNH -> BAY VỌT LÊN TRỜI THOÁT KẸT!';
                  hudLocomotion.className = 'badge active';
                } else {
                  triggerTeleport(safeRet.x, safeRet.y);
                  hudLocomotion.textContent = 'AI: CỰ LY GẦN -> TELEPORT LÙI GIỮ KHOẢNG CÁCH (Đứng 0°)';
                  hudLocomotion.className = 'badge active';
                }
              }
            }
          }
        }
        // 3. Đã vào cự ly tối ưu [150, 550]: KIỂM TRA ĐƯỜNG BAY CỦA SKILL (LINE-OF-SIGHT)
        else {
          targetFacingVisual = facingDirection;
          const vCastX = vargostX;
          const vCastY = (vargostY + hoverOffset) - 20;
          const tAimX = targetX;
          const tAimY = targetY - 24;
          const losObstacle = raycastEnvCollision(vCastX, vCastY, tAimX, tAimY);

          if (losObstacle) {
            // ĐƯỜNG ĐẠN BỊ TƯỜNG/VÁCH ĐÁ CHẶN -> KHÔNG TẤN CÔNG BẰNG CHIÊU BỪA BÃI!
            // BẮT BUỘC DI CHUYỂN SANG HƯỚNG KHÁC / ĐỘ CAO KHÁC ĐỂ NHÌN THẤY MỤC TIÊU!
            aiState = 'LOS_EVASIVE';
            if (!isFlying) takeoff();
            currentFlySpeed = SPEED_FAST;
            rngFlySpeed.value = SPEED_FAST;
            lblFlySpeed.textContent = `${SPEED_FAST}px/s`;

            const scale = mapScale / 2.625;
            // 1. Thử bay lên cao hơn đỉnh chướng ngại vật:
            const testHighY = Math.max(skyCeilingY + 8, losObstacle.hitY - 65 * scale);
            const testHighLoS = raycastEnvCollision(vargostX, testHighY - 20, tAimX, tAimY);

            if (!testHighLoS) {
              // Bay lên cao là có LoS thông suốt!
              targetVargostY = testHighY;
              if (Math.abs(losObstacle.hitX - vargostX) < 70 * scale) {
                targetVargostX = vargostX - facingDirection * 50 * scale;
              }
              locomotionState = 'FLY_VECTOR';
              hudAi.textContent = 'AI: TƯỜNG CHẶN ĐƯỜNG ĐẠN -> BAY LÊN CAO TÌM GÓC BẮN THÔNG SUỐT!';
              hudAi.className = 'badge warning';
            } else {
              // 2. Nếu địch núp góc tường/dưới vách đá mà bay cao vẫn bị che: Bay hạ thấp xuống!
              const testLowY = Math.min(skyLowY, losObstacle.hitY + 45 * scale);
              const testLowLoS = raycastEnvCollision(vargostX, testLowY - 20, tAimX, tAimY);
              if (!testLowLoS) {
                targetVargostY = testLowY;
                locomotionState = 'FLY_VECTOR';
                hudAi.textContent = 'AI: ĐỊCH NÚP GÓC TƯỜNG -> BAY HẠ THẤP TÌM GÓC BẮN!';
                hudAi.className = 'badge warning';
              } else {
                // 3. Di chuyển ngang né chướng ngại vật
                targetVargostX = Math.max(mapX + 110, Math.min(W - 400, vargostX + facingDirection * 55 * scale));
                locomotionState = 'FLY_VECTOR';
                hudAi.textContent = 'AI: DI CHUYỂN VÒNG QUA VẬT CẢN TÌM GÓC BẮN!';
                hudAi.className = 'badge warning';
              }
            }
          } else {
            // ĐƯỜNG ĐẠN THÔNG SUỐT:
            if (autoCooldown <= 0) {
              orderBlazingHalo();
            } else if (isFlying && locomotionState === 'IDLE_FLY') {
              // Tuần tra bay xéo 2D chậm liên tục 100px/s trên không trung theo Hiến pháp (Marksman Cooldown Slow Patrol)
              currentFlySpeed = SPEED_SLOW;
              rngFlySpeed.value = SPEED_SLOW;
              lblFlySpeed.textContent = `${SPEED_SLOW}px/s`;

              const driftDirX = (vargostX < mapX + 180 * mapScale) ? 1 : ((vargostX > mapX + 320 * mapScale) ? -1 : (Math.random() > 0.5 ? 1 : -1));
              const driftDirY = (vargostY < skyCeilingY + 25) ? 1 : ((vargostY > skyLowY - 25) ? -1 : (Math.random() > 0.5 ? 1 : -1));

              // Luôn xoay mặt theo đúng xu hướng di chuyển tiến về trước (Trái hay Phải đều đổ người về trước 20°)
              requestFacing(driftDirX);

              targetVargostX = vargostX + driftDirX * 55 * (mapScale / 2.625);
              targetVargostY = Math.max(skyCeilingY, Math.min(skyLowY, vargostY + driftDirY * 28 * (mapScale / 2.625)));

              const tiltLabel = '+20°';
              let clockStr = (driftDirX > 0) ? (driftDirY < 0 ? '2h (Tiến-Lên)' : '4h (Tiến-Xuống)') : (driftDirY < 0 ? '10h (Tiến Trái-Lên)' : '8h (Tiến Trái-Xuống)');
              locomotionState = 'FLY_VECTOR';
              hudLocomotion.textContent = `AI: TUẦN TRA CHẬM KHOẢNG NGHỈ ${clockStr} (${SPEED_SLOW}px/s · Đổ trước ${tiltLabel})`;
              hudLocomotion.className = 'badge flying';
            }
          }
        }
      }
      }
    }
  }

  // -------------------------------------------------------------
  // Manual / Repositioning Range & LoS Evaluation
  // -------------------------------------------------------------
  if (pendingCombatAction && aiState === 'IDLE' && !isDead) {
    if (distInPx < MIN_ATTACK_RANGE) {
      aiState = 'REPOSITIONING';
      const retreatDist = Math.max(130 * (mapScale / 2.625), (300 - distInPx) * (mapScale / 2.625));
      const safeRet = calculateSafeRetreat(vargostX, vargostY, -facingDirection, retreatDist);
      if (safeRet.escapedVertically && !isFlying) takeoff();
      triggerTeleport(safeRet.x, safeRet.y, null, safeRet.escapedVertically);
      autoCooldown = 0.8;
      hudAi.textContent = safeRet.escapedVertically
        ? 'AI: Sau lưng là tường! Teleport vút lên cao thoát kẹt'
        : 'AI: Quá gần! Teleport lùi giữ cự ly (Đứng 0°)';
      hudAi.className = 'badge active';
    } else if (distInPx > MAX_ATTACK_RANGE) {
      aiState = 'REPOSITIONING';
      currentFlySpeed = SPEED_FAST;
      targetVargostX = Math.max(mapX + 100, Math.min(W - 400, vargostX + facingDirection * (distInPx - 360) * (mapScale / 2.625)));
      targetVargostY = isFlying ? Math.min(skyLowY, vargostY + 25 * mapScale) : groundY;
      locomotionState = 'FLY_VECTOR';
      const tiltLabel = facingDirection > 0 ? '+25°' : '-25°';
      hudAi.textContent = `AI: Quá xa! Tiến áp sát @ 400px/s (Nghiêng ${tiltLabel})`;
      hudAi.className = 'badge flying';
    } else {
      // Đã vào cự ly tối ưu! KIỂM TRA TẦM NHÌN (LoS) TRÁNH BẮN VÀO ĐÁ:
      const losHit = raycastEnvCollision(vargostX, (vargostY + hoverOffset) - 20, targetX, targetY - 24);
      if (losHit) {
        // Tầm nhìn bị cản bởi khối đá! AI né địa hình tìm góc bắn thông suốt
        aiState = 'LOS_EVASIVE';
        if (!isFlying) takeoff();
        currentFlySpeed = SPEED_FAST;
        rngFlySpeed.value = SPEED_FAST;
        lblFlySpeed.textContent = `${SPEED_FAST}px/s`;
        // Bay vút lên cao hơn đỉnh chướng ngại vật
        targetVargostY = Math.max(skyCeilingY + 10, losHit.hitY - 70 * (mapScale / 2.625));
        const distObstacle = Math.abs(losHit.hitX - vargostX);
        if (distObstacle < 65) {
          targetVargostX = vargostX - facingDirection * 55 * (mapScale / 2.625);
        }
        locomotionState = 'FLY_VECTOR';
        hudAi.textContent = 'AI: TẦM NHÌN BỊ ĐỊA HÌNH CẢN -> BAY NÉ ĐÁ TÌM GÓC BẮN!';
        hudAi.className = 'badge warning';
      } else {
        startBlazingHalo();
      }
    }
  }

  if (aiState === 'REPOSITIONING') {
    repositioningTimer += dt;
    if (distInPx >= MIN_ATTACK_RANGE && distInPx <= MAX_ATTACK_RANGE) {
      const losHit = raycastEnvCollision(vargostX, (vargostY + hoverOffset) - 20, targetX, targetY - 24);
      if (losHit) {
        aiState = 'LOS_EVASIVE';
        if (!isFlying) takeoff();
        currentFlySpeed = SPEED_FAST;
        targetVargostY = Math.max(skyCeilingY + 10, losHit.hitY - 70 * (mapScale / 2.625));
        locomotionState = 'FLY_VECTOR';
        hudAi.textContent = 'AI: TẦM NHÌN BỊ ĐỊA HÌNH CẢN -> BAY NÉ ĐÁ TÌM GÓC BẮN!';
        hudAi.className = 'badge warning';
      } else {
        startBlazingHalo();
      }
      repositioningTimer = 0;
    } else if (repositioningTimer >= 0.8) {
      // Timeout 0.8s: Tránh kẹt cứng ở REPOSITIONING, tự động trở về IDLE
      aiState = 'IDLE';
      autoCooldown = 0.4;
      repositioningTimer = 0;
    }
  } else {
    repositioningTimer = 0;
  }

  if (aiState === 'LOS_EVASIVE') {
    losEvasiveTimer += dt;
    const curLoSHit = raycastEnvCollision(vargostX, (vargostY + hoverOffset) - 20, targetX, targetY - 24);
    if (!curLoSHit) {
      hudAi.textContent = 'AI: ĐÃ CÓ GÓC BẮN QUANG ĐÃNG! XUẤT CHIÊU BLAZING HALO!';
      hudAi.className = 'badge active';
      aiState = 'IDLE';
      losEvasiveTimer = 0;
      startBlazingHalo();
    } else {
      if (vargostY <= skyCeilingY + 25) {
        targetVargostX = Math.max(mapX + 110, Math.min(W - 400, vargostX + facingDirection * 40 * (mapScale / 2.625)));
      }
      // Timeout 0.8s: Tránh kẹt cứng ở LOS_EVASIVE khi địch bị địa hình che
      if (losEvasiveTimer >= 0.8) {
        aiState = 'IDLE';
        autoCooldown = 0.4;
        losEvasiveTimer = 0;
      }
    }
  } else {
    losEvasiveTimer = 0;
  }

  // -------------------------------------------------------------
  // Locomotion Execution (Vector 2D: Orthogonal 4 + Diagonal 4 Directions)
  // -------------------------------------------------------------
  if (locomotionState === 'FLY_FORWARD' || locomotionState === 'FLY_BACKWARD' || locomotionState === 'FLY_VECTOR') {
    const dx = targetVargostX - vargostX;
    const dy = isFlying ? (targetVargostY - vargostY) : 0;
    const dist = Math.hypot(dx, dy);

    if (dist > 2) {
      const dirX = dx / dist;
      const dirY = dy / dist;
      const step = Math.min(dist, flySpeed * dt);
      const stepX = dirX * step;
      // Giới hạn tốc độ trục Y (bay lên / bay xuống) trong khoảng [100, 300] px/s (mặc định 180 px/s)
      const currentVertLimit = (verticalFlySpeed || 180) * (mapScale / 2.625);
      const maxVertStep = currentVertLimit * dt;
      const stepY = Math.sign(dirY) * Math.min(Math.abs(dirY * step), maxVertStep);

      // Nếu đường bay có thành phần lùi so với mặt hiện tại mà là tuần tra chậm hoặc né vật cản:
      // Tự động lật mặt theo đúng xu hướng di chuyển tiến về trước (không phân biệt Trái hay Phải)!
      if (Math.abs(dirX) > 0.05) {
        const moveSignX = Math.sign(dirX);
        if (facingDirection !== moveSignX) {
          requestFacing(moveSignX);
        }
      }

      if (vargostStunTimer <= 0) {
        if (!isFlying) {
          vargostX += stepX;
        } else {
          const nextX = vargostX + stepX;
          const nextY = vargostY + stepY;

          if (!isVargostColliding(nextX, nextY)) {
            vargostX = nextX;
            vargostY = nextY;
          } else if (!isVargostColliding(nextX, vargostY)) {
            // Trượt ngang theo bề mặt
            vargostX = nextX;
          } else if (!isVargostColliding(vargostX, nextY)) {
            // Trượt dọc theo vách đá đứng
            vargostY = nextY;
          }
        }
      }

      // Góc nghiêng thân tự động theo xu hướng di chuyển tiến về trước (không phân biệt Trái hay Phải):
      // - ĐẦU LUÔN NGHIÊNG 20° VỀ PHÍA TRƯỚC THEO HƯỚNG TIẾN
      let targetTilt = 0;
      if (Math.abs(dirX) > 0.05) {
        const tiltDeg = Number(rngTilt ? rngTilt.value : 20) || 20;
        targetTilt = tiltDeg * Math.PI / 180; // Luôn nghiêng đầu 20° về phía trước theo hướng tiến
      } else {
        targetTilt = 0;
      }
      currentTilt += (targetTilt - currentTilt) * Math.min(dt * 10, 1);

      // Co giãn quán tính (Squash & Stretch theo vector)
      if (dirY < -0.2) {
        // Vút lên (10h, 12h, 2h): Dãn thân
        currentScaleX = 0.95;
        currentScaleY = 1.06;
      } else if (dirY > 0.2) {
        // Sà xuống / bổ nhào (4h, 6h, 8h): Hơi dẹt
        currentScaleX = 1.05;
        currentScaleY = 0.95;
      } else if (dirX > 0.1) {
        currentScaleX = 1.05;
        currentScaleY = 0.95;
      } else {
        currentScaleX = 0.96;
        currentScaleY = 1.04;
      }

      // Bóng mờ chuyển động 2D (Motion Ghosts)
      if (Math.random() < 0.45) {
        motionGhosts.push({ x: vargostX, y: vargostY, alpha: 0.45, tilt: currentTilt, facing: visualFacing });
      }
    } else {
      vargostX = targetVargostX;
      if (isFlying) vargostY = targetVargostY;
      locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
      hudLocomotion.textContent = isFlying ? 'Di chuyển: LƠ LỬNG TRÊN KHÔNG (Đứng thẳng 0°)' : 'Di chuyển: ĐỨNG TRÊN BỆ ĐÁ (Y=194)';
      hudLocomotion.className = isFlying ? 'badge' : 'badge ground';
    }
  }
  // LANDING (Dọc xuống Y=194 nhẹ nhàng êm ái, giới hạn tốc độ 100 - 300 px/s)
  else if (locomotionState === 'LANDING') {
    const currentVertLimit = (verticalFlySpeed || 180) * (mapScale / 2.625);
    const totalDistY = Math.max(1, groundY - transitionStartY);
    const landDuration = Math.max(0.4, totalDistY / currentVertLimit);
    transitionProgress += dt / landDuration;
    const t = Math.min(1, transitionProgress);
    const ease = 1 - Math.pow(1 - t, 2.2);
    vargostY = transitionStartY + (groundY - transitionStartY) * ease;
    currentTilt += (0 - currentTilt) * Math.min(dt * 8, 1);

    if (t >= 1) {
      vargostY = groundY;
      isFlying = false;
      locomotionState = 'IDLE_GROUND';
      altitudeCooldown = 15.0; // Khóa độ cao ít nhất 15s trên mặt đất
      currentScaleX = 1.15;
      currentScaleY = 0.85;
      groundDustRings.push({ x: vargostX, y: groundY, radius: 10, alpha: 0.8 });
      hudLocomotion.textContent = 'Di chuyển: ĐÃ ĐÁP XUỐNG BỆ ĐÁ (Y=194)';
      hudLocomotion.className = 'badge ground';
    }
  }
  // 4. TAKEOFF (Dọc lên Y=65 nhẹ nhàng êm ái, giới hạn tốc độ 100 - 300 px/s)
  else if (locomotionState === 'TAKEOFF') {
    const currentVertLimit = (verticalFlySpeed || 180) * (mapScale / 2.625);
    const totalDistY = Math.max(1, groundY - baseFlyY);
    const takeoffDuration = Math.max(0.4, totalDistY / currentVertLimit);
    transitionProgress += dt / takeoffDuration;
    const t = Math.min(1, transitionProgress);
    const ease = t * t * (3 - 2 * t);
    vargostY = groundY + (baseFlyY - groundY) * ease;
    currentScaleX = 0.90;
    currentScaleY = 1.12;
    currentTilt += (0 - currentTilt) * Math.min(dt * 8, 1);

    if (t >= 1) {
      vargostY = baseFlyY;
      isFlying = true;
      locomotionState = 'IDLE_FLY';
      altitudeCooldown = 15.0; // Khóa độ cao ít nhất 15s trên không
      hudLocomotion.textContent = 'Di chuyển: LƠ LỬNG TRÊN KHÔNG (Đứng thẳng 0°)';
      hudLocomotion.className = 'badge';
    }
  }
  // 5. IDLE FLY & IDLE GROUND (Trở về đứng thẳng 0 độ mượt mà)
  else if (locomotionState === 'IDLE_FLY') {
    currentTilt += (0 - currentTilt) * Math.min(dt * 8, 1);
    currentScaleX += (1.0 - currentScaleX) * Math.min(dt * 8, 1);
    currentScaleY += (1.0 - currentScaleY) * Math.min(dt * 8, 1);
  } else if (locomotionState === 'IDLE_GROUND') {
    currentTilt = 0;
    currentScaleX += (1.0 - currentScaleX) * Math.min(dt * 8, 1);
    currentScaleY += (1.0 - currentScaleY) * Math.min(dt * 8, 1);
  }

  // Motion Ghosts update
  for (let i = motionGhosts.length - 1; i >= 0; i--) {
    motionGhosts[i].alpha -= dt * 2.5;
    if (motionGhosts[i].alpha <= 0) motionGhosts.splice(i, 1);
  }

  // Dust Rings update
  for (let i = groundDustRings.length - 1; i >= 0; i--) {
    const d = groundDustRings[i];
    d.radius += dt * 60;
    d.alpha -= dt * 1.5;
    if (d.alpha <= 0) groundDustRings.splice(i, 1);
  }

  // -------------------------------------------------------------
  // Frame Progression (83 unified frames: 0..21 Idle, 44..82 Halo)
  // -------------------------------------------------------------
  const frameDur = 0.06;
  if (isPlaying) {
    frameTimeAccumulator += dt;
    if (frameTimeAccumulator >= frameDur) {
      frameTimeAccumulator -= frameDur;

      if (aiState === 'IDLE' || aiState === 'REPOSITIONING' || aiState === 'LOS_EVASIVE') {
        currentFrameIndex = (currentFrameIndex + 1) % 22; // Idle loop 0..21
      }
      // Blazing Halo Cast Sequence (44 -> 63 -> 66 -> 67 -> 68 -> 82)
      else if (aiState === 'HALO_WINDUP') {
        currentFrameIndex++;
        if (currentFrameIndex === 63) {
          hudState.textContent = 'Tối Thượng: ĐÃ GOM THÀNH 1 VÒNG LỚN (Frame 63)';
        } else if (currentFrameIndex === 66) {
          hudState.textContent = 'Tối Thượng: VUNG TAY NÉM (Frame 66)';
        } else if (currentFrameIndex === 67) {
          hudState.textContent = 'Tối Thượng: XUẤT LỰC NÉM - VÒNG LỬA TRÊN TAY (Frame 67)';
        }
        if (currentFrameIndex >= 68) {
          const castX = (haloLockedTargetX !== null) ? haloLockedTargetX : targetX;
          const castY = (haloLockedTargetY !== null) ? haloLockedTargetY : targetY;
          spawnBlazingHaloProjectile(castX, castY);
          aiState = 'HALO_RECOVERY';
          hudState.textContent = 'Tối Thượng: PHÓNG ĐẠI CẦU LỬA @ 1100px/s (Frame 68)';
        }
      } else if (aiState === 'HALO_RECOVERY') {
        currentFrameIndex++;
        if (currentFrameIndex === 74) {
          hudState.textContent = 'Tối Thượng: TRIỆU HỒI TỤ LẠI 2 VÒNG LỬA (Frame 74-77)';
        }
        if (currentFrameIndex > 82) {
          currentFrameIndex = 0;
          aiState = 'IDLE';
          autoCooldown = 3.2; // Tactical pause
          hudState.textContent = isFlying ? 'Trạng thái: SẴN SÀNG (LƠ LỬNG)' : 'Trạng thái: SẴN SÀNG (ĐỨNG TRÊN BỆ)';
          hudAi.textContent = 'AI: Tuần tra chiến thuật';
        }
      } else {
        currentFrameIndex = (currentFrameIndex + 1) % 22;
      }

      rngFrame.value = currentFrameIndex;
      lblFrameNum.textContent = currentFrameIndex;
      hudFrame.textContent = `Frame: ${currentFrameIndex}/${MAX_FRAME_INDEX}`;
    }
  }

  // -------------------------------------------------------------
  // Projectile Flight Update (1100 px/s - Skillshot Vector Khóa Đường Bay)
  // -------------------------------------------------------------
  if (activeProjectile) {
    const p = activeProjectile;
    const prevPx = p.x;
    const prevPy = p.y;
    p.time += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // 0. Kiểm tra va chạm với các khối đất/tường Zone 1, 2, 3:
    const envHit = raycastEnvCollision(prevPx, prevPy, p.x, p.y);
    if (envHit) {
      spawnExplosion(envHit.hitX, envHit.hitY);
      spawnHitImpact(envHit.hitX, envHit.hitY, Math.sign(p.vx));
      enemyDamageNumbers.push({
        text: '💥 VÁCH ĐÁ CHẶN ĐẠN!',
        x: envHit.hitX,
        y: envHit.hitY - 20,
        color: '#ffc107',
        alpha: 1.0,
        life: 0.8
      });
      activeProjectile = null;
      hudProjectile.textContent = 'Đại cầu lửa: ĐÃ VA CHẠM VÁCH ĐÁ & NỔ TẠI MÔI TRƯỜNG!';
    }

    if (activeProjectile) {
    p.spinAccum += dt;
    if (p.spinAccum >= 0.035) {
      p.spinAccum -= 0.035;
      p.spinFrame = (p.spinFrame + 1) % 8;
    }

    // Vệt tàn tro lửa bay theo đuôi quả cầu
    const spriteScale = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
    if (Math.random() < 0.6) {
      emberParticles.push({
        x: p.x + (Math.random() - 0.5) * 18 * spriteScale,
        y: p.y + (Math.random() - 0.5) * 18 * spriteScale,
        vx: -p.vx * 0.12 + (Math.random() - 0.5) * 35,
        vy: -p.vy * 0.12 + (Math.random() - 0.5) * 35,
        size: Math.random() < 0.5 ? 3 : 2,
        alpha: 0.85,
        color: Math.random() < 0.5 ? '#ff4500' : '#ffd700',
        life: 0.22
      });
    }

    // 1a. Kiểm tra va chạm Hitbox với Aoda (Team 2 · Kẻ Địch của Vargost)
    const aodaCenterY = aodaY - 45 * (zoom / 0.7);
    const aodaHitRadius = 28 * (zoom / 0.7);
    const distToAoda = Math.hypot(p.x - aodaX, p.y - aodaCenterY);

    if (!aodaIsDead && distToAoda <= p.radius + aodaHitRadius) {
      // === TRÚNG ĐÍCH AODA (TEAM 2)! ===
      aodaStunTimer = 0.5;
      aodaHitFlash = 0.4;
      const prevAodaHp = aodaHp;
      aodaHp = Math.max(0, aodaHp - 45);
      aodaDamageGhosts.push({
        fromHp: prevAodaHp,
        toHp: aodaHp,
        maxHp: aodaMaxHp,
        timer: 0,
        flashDuration: 0.12,
        dissolveDuration: 0.42,
        totalDuration: 0.54,
        seed: Math.random()
      });
      const knockDir = Math.sign(p.vx) || 1;
      spawnHitImpact(aodaX, aodaCenterY, knockDir);
      spawnExplosion(aodaX, aodaY);
      enemyDamageNumbers.push({
        text: '💥 -45 HP!',
        x: aodaX,
        y: aodaY - 80,
        alpha: 1.0,
        vy: -55,
        color: '#ff7b72'
      });
      if (aodaHp <= 0) {
        triggerAodaKo();
      }
      activeProjectile = null;
      hudProjectile.textContent = 'Blazing Halo: BẮN TRÚNG AODA (TEAM 2)! Gây Hit Stun 0.5s & -45 HP!';
      hudProjectile.className = 'badge active';
      showToast('💥 BLAZING HALO BẮN TRÚNG AODA (TEAM 2)!');
    }
    // 1a-boss. Kiểm tra va chạm Hitbox với Boss Trung Lập Crapit (khi Vargost phản công hoặc đường đạn trúng Boss)
    else if (!crapitIsDead && Math.hypot(p.x - crapitX, p.y - (crapitY - 50 * (zoom / 0.7))) <= p.radius + 36 * (zoom / 0.7)) {
      damageCrapitBoss(45, 'vargost', Math.sign(p.vx) || 1);
      spawnExplosion(crapitX, crapitY);
      activeProjectile = null;
      hudProjectile.textContent = `Blazing Halo: ĐÁNH TRẢ TRÚNG BOSS CRAPIT! (-45 HP · Boss còn ${crapitHp}/${CRAPIT_MAX_HP} HP)`;
      hudProjectile.className = 'badge active';
    }
    // 1b. Kiểm tra va chạm Hitbox với Chiến Binh Huấn Luyện (Team 2 · Kẻ Địch)
    else {
    const enemyCenterY = groundY - 24;
    const enemyHitRadius = 22 * (zoom / 0.7);
    const totalHitRadius = p.radius + enemyHitRadius;
    const distToEnemy = Math.hypot(p.x - enemyWorldX, p.y - enemyCenterY);

    if (distToEnemy <= totalHitRadius) {
      // === TRÚNG ĐÍCH! ===
      enemyStunTimer = 0.1; // Đứng yên 0.1s (Hit Stun / Stagger)
      enemyHitFlash = 0.35;
      const prevEnemyHp = enemyHp;
      enemyHp = Math.max(10, enemyHp - 45);
      const newEnemyHp = enemyHp;
      if (enemyHp <= 10) enemyHp = 100;

      // Kích hoạt hiệu ứng ống máu Gothic: Đoạn bị trừ sáng rực đột ngột -> Pixel Dissolve
      enemyDamageGhosts.push({
        fromHp: prevEnemyHp,
        toHp: (newEnemyHp <= 10) ? 0 : newEnemyHp,
        maxHp: 100,
        timer: 0,
        flashDuration: 0.12,
        dissolveDuration: 0.42,
        totalDuration: 0.54,
        seed: Math.random()
      });

      // Giật lùi nhẹ (Knockback 18px)
      const knockDir = Math.sign(p.vx) || 1;
      enemyWorldX = Math.max(mapX + 130 * mapScale, Math.min(mapX + 480 * mapScale, enemyWorldX + knockDir * 18 * (mapScale / 2.625)));

      // Kích hoạt Hit Impact VFX (Kim cương 4 cánh Cross Spark + Vòng Shockwave + Chùm tia lửa)
      spawnHitImpact(enemyWorldX, enemyCenterY, knockDir);

      // Kích hoạt nổ diện rộng mặt đất
      spawnExplosion(enemyWorldX, groundY);

      // Sát thương CRIT nảy số
      enemyDamageNumbers.push({
        text: '💥 -9999 CRIT!',
        x: enemyWorldX,
        y: groundY - 65,
        alpha: 1.0,
        vy: -55,
        color: '#ff7b72'
      });

      activeProjectile = null;
      hudProjectile.textContent = 'Blazing Halo: TRÚNG ĐÍCH! Gây Hit Stun 0.1s & -9999 CRIT!';
      hudProjectile.className = 'badge active';
      showToast('💥 BLAZING HALO TRÚNG ĐÍCH! HIT STUN 0.1S!');
    }
    // 2. Kiểm tra chạm đất nếu kẻ địch đã né khỏi đường bay (hỗ trợ cả bệ thấp Platform 1A/1B dưới groundY)
    else if (p.y >= Math.max(groundY - 6, (p.aimTargetY || groundY) + 18)) {
      // === TRƯỢT MỤC TIÊU - NỔ TIẾP ĐẤT! ===
      const hitGroundY = Math.max(groundY, (p.aimTargetY || groundY) + 24);
      spawnExplosion(p.x, hitGroundY);

      // Nảy chữ Né đòn
      enemyDamageNumbers.push({
        text: '💨 MISSED / NÉ ĐÒN!',
        x: p.x,
        y: hitGroundY - 45,
        alpha: 1.0,
        vy: -40,
        color: '#79c0ff'
      });

      activeProjectile = null;
      hudProjectile.textContent = 'Blazing Halo: TRƯỢT MỤC TIÊU (Kẻ địch né kịp) - Nổ tiếp đất!';
      hudProjectile.className = 'badge warning';
      showToast('💨 ĐẠN BLAZING HALO TRƯỢT MỤC TIÊU! KẺ ĐỊCH NÉ KỊP!');
    }
    // 3. Ra khỏi biên map
    else if (p.time > 2.0 || p.x < mapX - 60 || p.x > mapX + 512 * mapScale + 120) {
      activeProjectile = null;
      hudProjectile.textContent = 'Blazing Halo: Đạn bay ra khỏi phạm vi chiến trường.';
    }
    }
    }
  }

  // -------------------------------------------------------------
  // Explosion VFX Update
  // -------------------------------------------------------------
  if (activeExplosion) {
    const exp = activeExplosion;
    exp.accum += dt;
    const expFrameDur = 1 / exp.fps;
    while (exp.accum >= expFrameDur) {
      exp.accum -= expFrameDur;
      exp.frame++;
      if (exp.frame >= exp.totalFrames) {
        activeExplosion = null;
        break;
      }
    }
  }

  // -------------------------------------------------------------
  // Hit Impact VFX Update
  // -------------------------------------------------------------
  for (let i = activeHitImpacts.length - 1; i >= 0; i--) {
    const imp = activeHitImpacts[i];
    imp.life -= dt;
    if (imp.life <= 0) {
      activeHitImpacts.splice(i, 1);
    }
  }

  // -------------------------------------------------------------
  // Enemy Counter-Attack Projectiles Update (Ám Tiễn 800px/s & Vargost Hurt Reaction)
  // -------------------------------------------------------------
  const spriteScale = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
  const vargostChestX = vargostX;
  const vargostChestY = (vargostY + hoverOffset) - 25 * spriteScale;
  const vargostHitRadius = 24 * spriteScale;

  for (let i = activeEnemyProjectiles.length - 1; i >= 0; i--) {
    const ep = activeEnemyProjectiles[i];
    ep.time += dt;
    ep.x += ep.vx * dt;
    ep.y += ep.vy * dt;
    ep.spinAngle = (ep.spinAngle || 0) + dt * 14;

    // Hạt năng lượng ma thuật tím / cyan bay theo đuôi Ám Tiễn
    if (Math.random() < 0.5) {
      emberParticles.push({
        x: ep.x + (Math.random() - 0.5) * 12,
        y: ep.y + (Math.random() - 0.5) * 12,
        vx: -ep.vx * 0.12 + (Math.random() - 0.5) * 30,
        vy: -ep.vy * 0.12 + (Math.random() - 0.5) * 30,
        size: Math.random() < 0.5 ? 3 : 2,
        alpha: 0.85,
        color: Math.random() < 0.5 ? '#b388ff' : '#00f5d4',
        life: 0.22
      });
    }

    // Kiểm tra va chạm Hitbox với ngực Vargost (khi không tàng hình Phase 2 và chưa chết)
    const distToVargost = Math.hypot(ep.x - vargostChestX, ep.y - vargostChestY);
    if (distToVargost <= (ep.radius + vargostHitRadius) && phaseBlinkStep !== 2 && !isDead) {
      // === VARGOST BỊ TRÚNG ĐÒN! (Hurt Reaction) ===
      vargostHitFlash = 0.35; // Chớp trắng / đỏ lóe sáng toàn thân
      vargostRecoilTimer = 0.22;

      // Giật lùi nhẹ theo hướng đạn (Knockback recoil 16px)
      const recoilDir = Math.sign(ep.vx) || 1;
      vargostX = Math.max(mapX + 110, Math.min(W - 400, vargostX + recoilDir * 16 * (mapScale / 2.625)));

      // Co rúm người đàn hồi (Squash & Stretch)
      currentScaleX = 1.08;
      currentScaleY = 0.88;

      // Trừ máu Vargost (-250 HP)
      const prevVargostHp = vargostHp;
      vargostHp = Math.max(0, vargostHp - 250);
      const newVargostHp = vargostHp;

      // Kích hoạt hiệu ứng ống máu Gothic: Đoạn bị trừ sáng rực đột ngột -> Pixel Dissolve
      vargostDamageGhosts.push({
        fromHp: prevVargostHp,
        toHp: newVargostHp,
        maxHp: VARGOST_MAX_HP,
        timer: 0,
        flashDuration: 0.12,   // 0.12s đầu tiên sáng rực đột ngột
        dissolveDuration: 0.42,// 0.42s tiếp theo tan rã lát cắt pixel
        totalDuration: 0.54,
        seed: Math.random()
      });

      // Nảy số sát thương nổ màu cam neon
      enemyDamageNumbers.push({
        text: '⚡ -250 HP!',
        x: vargostChestX,
        y: vargostChestY - 45,
        alpha: 1.0,
        vy: -55,
        color: '#ff9800'
      });

      // Bùng nổ Hit Impact VFX (Cross Spark + Shockwave + Hạt lửa) trên ngực Vargost
      spawnHitImpact(vargostChestX, vargostChestY, recoilDir);

      activeEnemyProjectiles.splice(i, 1);

      if (vargostHp <= 0) {
        // === VARGOST HẾT MÁU VÀ GỤC NGÃ (KO / TỬ TRẬN) ===
        triggerVargostDeath();
      } else {
        hudState.textContent = 'Vargost: TRÚNG ĐÒN ÁM TIỄN! (-250 HP & Giật lùi)';
        hudState.className = 'badge warning';
        showToast('⚡ VARGOST BỊ TRÚNG ĐÒN ÁM TIỄN (-250 HP)!');
      }
    }
    // Ra khỏi màn hình hoặc bay quá 2.5s
    else if (ep.time > 2.5 || ep.x < mapX - 100 || ep.x > W) {
      activeEnemyProjectiles.splice(i, 1);
    }
  }

  // Cập nhật Hurt Timers của Vargost
  if (vargostHitFlash > 0) vargostHitFlash -= dt;
  if (vargostRecoilTimer > 0) vargostRecoilTimer -= dt;

  // -------------------------------------------------------------
  // Death & Evaporating Pixel Dissolve Lifecycle (0.3s Freeze -> 1.6s Evaporation -> 3.4s Respawn)
  // -------------------------------------------------------------
  if (isDead) {
    deathTimer += dt;
    if (deathTimer >= 2.0) {
      const t1Base = getTeamBaseSpawn(1, teamOriginDirection);
      isDead = false;
      deathTimer = 0;
      vargostHp = VARGOST_MAX_HP;
      vargostHitFlash = 0;
      vargostAntiHeal = false; // Tướng chết mới mất hiệu ứng Cấm Hồi Máu
      vargostRetaliateBoss = false; // Tướng chết và hồi sinh ngừng đánh Boss, quay lại chiếm Thánh Kiếm
      vargostX = t1Base.airX;
      vargostY = isFlying ? t1Base.airY : t1Base.groundY;
      targetVargostX = vargostX;
      targetVargostY = vargostY;
      facingDirection = t1Base.facing;
      targetFacingVisual = facingDirection;
      visualFacing = facingDirection;
      currentTilt = 0;
      aiState = 'IDLE';
      locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
      autoCooldown = 0.5;
      hudState.textContent = isFlying ? `Trạng thái: HỒI SINH TẠI ${t1Base.name.toUpperCase()} (TRÊN KHÔNG)` : 'Trạng thái: ĐÃ HỒI SINH (TRÊN ĐỊA HÌNH)';
      hudState.className = 'badge active';
      hudAi.textContent = 'AI: Xuất kích từ căn cứ tiến về Thánh Kiếm';
      hudAi.className = 'badge';
      showToast('✨ VARGOST ĐÃ HỒI SINH TẠI CĂN CỨ! Bay tiến về tranh đoạt Thánh Kiếm!');
    }
  }

  // Cập nhật Damage Ghosts cho ống máu Gothic (Pha sáng rực -> Pixel Dissolve)
  for (let i = vargostDamageGhosts.length - 1; i >= 0; i--) {
    const g = vargostDamageGhosts[i];
    g.timer += dt;
    if (g.timer >= g.totalDuration) {
      vargostDamageGhosts.splice(i, 1);
    }
  }

  for (let i = enemyDamageGhosts.length - 1; i >= 0; i--) {
    const g = enemyDamageGhosts[i];
    g.timer += dt;
    if (g.timer >= g.totalDuration) {
      enemyDamageGhosts.splice(i, 1);
    }
  }

    // -------------------------------------------------------------
    // Damage Numbers & Flash & Ember Particles Physics Update
    // -------------------------------------------------------------
    if (enemyHitFlash > 0) {
      enemyHitFlash -= dt;
    }

    for (let i = enemyDamageNumbers.length - 1; i >= 0; i--) {
      const dmg = enemyDamageNumbers[i];
      dmg.y += dmg.vy * dt;
      dmg.alpha -= dt * 1.5;
      if (dmg.alpha <= 0) {
        enemyDamageNumbers.splice(i, 1);
      }
    }

    for (let i = emberParticles.length - 1; i >= 0; i--) {
      const ep = emberParticles[i];
      ep.x += ep.vx * dt;
      ep.y += ep.vy * dt;
      ep.alpha -= dt / ep.life;
      if (ep.alpha <= 0) {
        emberParticles.splice(i, 1);
      }
    }

    // -------------------------------------------------------------
    // AODA (90px) COMBAT, LOCOMOTION, UTILITY AI & SKILLS UPDATE
    // -------------------------------------------------------------
    if (aodaHitFlash > 0) aodaHitFlash -= dt;
    if (aodaStunTimer > 0) aodaStunTimer -= dt;
    if (groundDummyStunTimer > 0) groundDummyStunTimer -= dt;
    if (groundDummyHitFlash > 0) groundDummyHitFlash -= dt;

    // Cập nhật Aoda Damage Ghosts
    for (let i = aodaDamageGhosts.length - 1; i >= 0; i--) {
      const g = aodaDamageGhosts[i];
      g.timer += dt;
      if (g.timer >= g.totalDuration) aodaDamageGhosts.splice(i, 1);
    }
    for (let i = groundDummyDamageGhosts.length - 1; i >= 0; i--) {
      const g = groundDummyDamageGhosts[i];
      g.timer += dt;
      if (g.timer >= g.totalDuration) groundDummyDamageGhosts.splice(i, 1);
    }

    // Lật mặt tức thì không méo hình (loại bỏ biến dạng lật 2D theo yêu cầu người dùng)
    aodaVisualFacing = aodaFacing;

    // Aoda Dead & KO Lifecycle (Frame 46..58: Kẹp cứng tại frame 58 nằm yên trên đất theo Hiến pháp AGENTS.md)
    if (aodaIsDead) {
      aodaDeathTimer += dt;
      aodaAnimAccum += dt;
      if (aodaAnimAccum >= 0.06) {
        aodaAnimAccum -= 0.06;
        if (aodaFrameIndex < 58) {
          aodaFrameIndex++;
        }
      }
      if (aodaDeathTimer >= 2.0) {
        // Hồi sinh tại Căn Cứ Đội 2 (Vòng Tròn Đỏ Phải - Platform 3A trên địa hình)
        const t2Base = getTeamBaseSpawn(2, teamOriginDirection);
        aodaIsDead = false;
        aodaDeathTimer = 0;
        aodaHp = aodaMaxHp;
        aodaAntiHeal = false; // Tướng chết mới mất hiệu ứng Cấm Hồi Máu
        aodaRetaliateBoss = false; // Tướng chết và hồi sinh ngừng đánh Boss, quay lại chiếm Thánh Kiếm
        aodaPlatformIndex = t2Base.groundPlatformIndex;
        aodaPlatform = AODA_PLATFORMS[aodaPlatformIndex];
        aodaX = t2Base.groundX;
        aodaY = aodaPlatform.y;
        aodaFacing = t2Base.facing;
        aodaVisualFacing = aodaFacing;
        aodaSpawnFreezeTimer = 1.0; // Đứng bất động 1s khi xuất hiện/hồi sinh
        aodaState = 'IDLE';
        aodaFrameIndex = 0;
        if (hudAodaState) {
          hudAodaState.textContent = `Aoda: HỒI SINH TẠI ${aodaPlatform.name.split(' (')[0]}`;
          hudAodaState.className = 'badge active';
        }
        showToast('✨ AODA ĐÃ HỒI SINH TẠI CĂN CỨ ĐỘI 2! Chạy nhảy tiến về Thánh Kiếm!');
      }
    }
    // Đứng bất động 1s khi xuất phát / hồi sinh
    else if (aodaSpawnFreezeTimer > 0) {
      aodaSpawnFreezeTimer -= dt;
      aodaState = 'IDLE';
      aodaAnimAccum += dt;
      if (aodaAnimAccum >= 0.08) {
        aodaAnimAccum -= 0.08;
        aodaFrameIndex = (aodaFrameIndex + 1) % 25;
      }
    }
    // Aoda Skill 1 (Lốc Xoáy Đất - Địch mặt đất): Windup từ frame 25, frame 30 tung chiêu
    else if (aodaState === 'SKILL_1_WINDUP') {
      aodaAnimAccum += dt;
      if (aodaAnimAccum >= 0.06) {
        aodaAnimAccum -= 0.06;
        aodaFrameIndex++;
        if (aodaFrameIndex >= 29) { // 1-based Frame 30
          // THI TRIỂN LỐC XOÁY ĐẤT 85px
          spawnRedTornado(aodaX, aodaY, aodaLockedFacing);
          aodaState = 'SKILL_1_RECOVERY';
          if (hudAodaState) {
            hudAodaState.textContent = 'Aoda: PHÓNG TORNADO ĐẤT 85px (Xoay 2.0s · CD 5s)';
            hudAodaState.className = 'badge active';
          }
        }
      }
    }
    else if (aodaState === 'SKILL_1_RECOVERY') {
      aodaAnimAccum += dt;
      if (aodaAnimAccum >= 0.06) {
        aodaAnimAccum -= 0.06;
        aodaFrameIndex++;
        if (aodaFrameIndex > 46) {
          aodaFrameIndex = 65;
          aodaState = 'MOVE';
          if (hudAodaState) {
            hudAodaState.textContent = `Aoda: Tuần tra ${aodaPlatform.name.split(' (')[0]}`;
            hudAodaState.className = 'badge';
          }
        }
      }
    }
    // Aoda Di Chuyển & Bộ Não Utility AI Hướng Về Chiếm Cứ Điểm Thánh Kiếm
    else if (aodaStunTimer <= 0) {
      if (aodaTornadoCooldown > 0) aodaTornadoCooldown -= dt;

      // Utility AI Tự Động Ra Quyết Định Chiêu Thức:
      if (chkAodaAi && chkAodaAi.checked && aodaState !== 'JUMP' && aodaState !== 'LANDING') {
        const hDistVargost = Math.abs(vargostX - aodaX);
        const hDistCrapit = Math.abs(crapitX - aodaX);
        // Utility AI Tự Động Ra Quyết Định Chiêu Thức & Mục Tiêu (Thánh Kiếm vs Cổ Vật):
        const aodaCarryingLoot = (bossLootDrop.carrierId === 'aoda');
        const aodaPursuingCarrier = (bossLootDrop.carrierId === 'vargost');
        const aodaPickingUpLoot = (bossLootDrop.active && !bossLootDrop.carrierId && (bossLootDrop.isFreeForAll || bossLootDrop.lockedPickerId === 'aoda'));

        let groundTarget = null;
        if (aodaCarryingLoot) {
          groundTarget = { type: 'carrier_escape', x: RIGHT_EXTRACTION_X, y: RIGHT_EXTRACTION_Y, hDist: Math.abs(RIGHT_EXTRACTION_X - aodaX) };
        } else if (aodaPickingUpLoot) {
          groundTarget = { type: 'pickup_loot', x: bossLootDrop.x, y: bossLootDrop.y, hDist: Math.abs(bossLootDrop.x - aodaX) };
        } else if (aodaPursuingCarrier) {
          groundTarget = { type: 'intercept_carrier', x: vargostX, y: vargostY + hoverOffset, hDist: Math.abs(vargostX - aodaX) };
        } else if (aodaRetaliateBoss && !crapitIsDead) {
          groundTarget = { type: 'crapit_boss', x: crapitX, y: crapitY, hDist: hDistCrapit };
        } else if (!isDead) {
          groundTarget = { type: 'vargost', x: vargostX, y: vargostY + hoverOffset, hDist: hDistVargost };
        }

        if (groundTarget) {
          if (groundTarget.x > aodaX + 15) {
            aodaFacing = 1;
            aodaVisualFacing = 1;
          } else if (groundTarget.x < aodaX - 15) {
            aodaFacing = -1;
            aodaVisualFacing = -1;
          }

          // Cận chiến / Tầm trung: Phóng Tornado nếu trong tầm < 460px và hết cooldown
          // Tuyệt đối không xao nhãng tấn công khi đang đi nhặt hoặc hộ tống Cổ Vật
          if (!aodaPickingUpLoot && !aodaCarryingLoot && groundTarget.hDist < 460 && aodaTornadoCooldown <= 0) {
            triggerAodaSkill1();
          }
        } else if (!aodaIsDead) {
          // Khi Vargost bay trên cao trong tầm giao tranh: Aoda quay mặt theo dõi đối thủ
          if (vargostX > aodaX + 15) {
            aodaFacing = 1;
            aodaVisualFacing = 1;
          } else if (vargostX < aodaX - 15) {
            aodaFacing = -1;
            aodaVisualFacing = -1;
          }
        }
      }

      if (aodaState === 'MOVE') {
        aodaAnimAccum += dt;
        if (aodaAnimAccum >= 0.08) {
          aodaAnimAccum -= 0.08;
          aodaFrameIndex++;
          if (aodaFrameIndex > 86) aodaFrameIndex = 65;
        }

        // Hướng di chuyển theo mục tiêu (Căn cứ Phải khi mang Cổ Vật, vị trí rơi Cổ Vật, hoặc chiếm Thánh Kiếm):
        const aodaCarryingLoot = (bossLootDrop.carrierId === 'aoda');
        const aodaPursuingCarrier = (bossLootDrop.carrierId === 'vargost');
        const aodaPickingUpLoot = (bossLootDrop.active && !bossLootDrop.carrierId && (bossLootDrop.isFreeForAll || bossLootDrop.lockedPickerId === 'aoda'));

        let targetPlatId = 'plat_2';
        let navGoalX = SWORD_X;
        let navGoalDesc = 'Thánh Kiếm';

        if (aodaCarryingLoot) {
          targetPlatId = 'plat_3b';
          navGoalX = RIGHT_EXTRACTION_X;
          navGoalDesc = 'Căn Cứ Phải';
        } else if (aodaPickingUpLoot) {
          targetPlatId = 'plat_3d';
          navGoalX = bossLootDrop.x;
          navGoalDesc = 'Cổ Vật';
        } else if (aodaPursuingCarrier) {
          targetPlatId = 'plat_2';
          navGoalX = vargostX;
          navGoalDesc = 'Kẻ mang Cổ Vật';
        }

        const isAodaInSwordZone = Math.hypot(aodaX - SWORD_X, aodaY - SWORD_Y) <= SWORD_CAPTURE_RADIUS;
        const atTargetPlat = (aodaPlatform && aodaPlatform.id === targetPlatId);
        const isAodaAtNavGoal = (aodaCarryingLoot || aodaPickingUpLoot) ? (atTargetPlat && Math.abs(aodaX - navGoalX) < 30) : isAodaInSwordZone;

        // Tốc độ di chuyển chuẩn hóa Mức 1: 160 px/s (khi mang Cổ Vật giảm 10% còn 144 px/s)
        const aodaMaxSpeed = Math.max(100, Math.min(300, aodaPatrolSpeed || 160)); // 160 px/s
        const isTeam2Carrying = (bossLootDrop.carrierId === 'aoda');
        const effectiveAodaSpeed = isTeam2Carrying ? (aodaMaxSpeed * 0.90) : aodaMaxSpeed;

        // Điều hướng bệ địa hình (Platform Graph Navigation):
        const navPlan = getPlatformNavPlan(aodaPlatform, targetPlatId, aodaX);

        if (!atTargetPlat && navPlan && !navPlan.atTargetPlatform) {
          // Chưa ở cùng bệ đích: đi theo hướng của navPlan đến mép nhảy
          aodaFacing = navPlan.moveDir;
          aodaVisualFacing = aodaFacing;
        } else if (!isAodaAtNavGoal) {
          // Đã ở cùng bệ: đi thẳng tới navGoalX
          aodaFacing = (navGoalX > aodaX) ? 1 : -1;
          aodaVisualFacing = aodaFacing;
        }

        const stepX = aodaFacing * effectiveAodaSpeed * dt;
        const targetEdgeX = aodaX + stepX;

        const minLedge = aodaPlatform.minX + 20;
        let maxLedge = aodaPlatform.maxX - 20;
        // Khi trên Platform 1B đi về phía phải (lên Platform 2): Nhảy sớm ngay trước bậc thềm Platform 2 để LUÔN nhảy tiến về phía trước!
        if (aodaPlatform.id === 'plat_1b' && aodaFacing > 0) {
          const p2Surf = getSurfaceById('plat_2');
          if (p2Surf) maxLedge = Math.min(maxLedge, p2Surf.minX - 25 * (mapScale / 2.625));
        }

        const isAtEdge = (aodaFacing > 0 && targetEdgeX >= maxLedge) || (aodaFacing < 0 && targetEdgeX <= minLedge);

        if (isAtEdge) {
          // Khi chạm mép bệ:
          // Nếu chưa ở bệ đích và có navPlan -> Nhảy sang bệ tiếp theo của navPlan!
          if (!atTargetPlat && navPlan && navPlan.nextPlatform) {
            aodaState = 'JUMP';
            aodaJumpTimer = 0;
            aodaJumpDuration = 0.75;
            aodaJumpStartX = aodaX;
            aodaJumpStartY = aodaY;
            aodaJumpTargetPlatform = navPlan.nextPlatform;
            aodaJumpTargetX = navPlan.jumpTargetX;
            aodaJumpTargetY = navPlan.jumpTargetY;
            const jumpDirX = (aodaJumpTargetX >= aodaJumpStartX) ? 1 : -1;
            aodaFacing = jumpDirX;
            aodaVisualFacing = jumpDirX;
            if (aodaFrameIndex < 65 || aodaFrameIndex > 86) aodaFrameIndex = 65;
            const isJumpUp = (aodaJumpTargetY < aodaJumpStartY);
            if (hudAodaState) {
              hudAodaState.textContent = `Aoda: ${isJumpUp ? 'NHẢY LÊN BẬC CAO' : 'NHẢY XUỐNG BẬC THẤP'} (Di chuyển tới ${navGoalDesc})`;
              hudAodaState.className = 'badge active';
            }
            showToast(`🦘 Aoda: Nhảy bệ di chuyển tới ${navGoalDesc}!`);
          } else {
            const adj = getAdjacentPlatform(aodaPlatform, aodaFacing);
            const isSwordAhead = (aodaFacing > 0 && SWORD_X > aodaX) || (aodaFacing < 0 && SWORD_X < aodaX);
            if ((isSwordAhead || !isAodaInSwordZone) && adj) {
              aodaState = 'JUMP';
              aodaJumpTimer = 0;
              aodaJumpDuration = 0.75;
              aodaJumpStartX = aodaX;
              aodaJumpStartY = aodaY;
              aodaJumpTargetPlatform = adj.platform;
              let forwardTargetX = adj.targetX;
              const minForwardStep = 45 * (mapScale / 2.625);
              if (aodaFacing > 0 && forwardTargetX < aodaX + minForwardStep) {
                forwardTargetX = Math.min(adj.platform.maxX - 25, aodaX + minForwardStep);
              } else if (aodaFacing < 0 && forwardTargetX > aodaX - minForwardStep) {
                forwardTargetX = Math.max(adj.platform.minX + 25, aodaX - minForwardStep);
              }
              aodaJumpTargetX = forwardTargetX;
              aodaJumpTargetY = adj.platform.y;
              const jumpDirX = (aodaJumpTargetX >= aodaJumpStartX) ? 1 : -1;
              aodaFacing = jumpDirX;
              aodaVisualFacing = jumpDirX;
              if (aodaFrameIndex < 65 || aodaFrameIndex > 86) aodaFrameIndex = 65;
              const isJumpUp = (aodaJumpTargetY < aodaJumpStartY);
              if (hudAodaState) {
                hudAodaState.textContent = `Aoda: ${isJumpUp ? 'NHẢY LÊN BẬC CAO' : 'NHẢY XUỐNG BẬC THẤP'} (Tiến đánh Thánh Kiếm)`;
                hudAodaState.className = 'badge active';
              }
              showToast(`🦘 Aoda: Nhảy bệ tiến đánh Thánh Kiếm!`);
            } else {
              aodaX = (aodaFacing > 0) ? maxLedge : minLedge;
              aodaState = 'IDLE';
              aodaFrameIndex = 0;
              if (hudAodaState) {
                hudAodaState.textContent = isAodaInSwordZone ? 'Aoda: [PHÒNG THỦ] Giữ cứ điểm Thánh Kiếm' : 'Aoda: Dừng tại mép bệ';
                hudAodaState.className = 'badge';
              }
            }
          }
        } else {
          if (isAodaAtNavGoal && isAodaInSwordZone && Math.abs(aodaX - SWORD_X) < 40) {
            aodaState = 'IDLE';
            aodaFrameIndex = 0;
            if (hudAodaState) {
              hudAodaState.textContent = 'Aoda: [PHÒNG THỦ] Giữ cứ điểm Thánh Kiếm';
              hudAodaState.className = 'badge active';
            }
          } else {
            aodaX = targetEdgeX;
          }
        }
      }
      else if (aodaState === 'JUMP') {
        aodaJumpTimer += dt;
        const t = Math.min(1.0, aodaJumpTimer / aodaJumpDuration);
        aodaX = aodaJumpStartX + (aodaJumpTargetX - aodaJumpStartX) * t;
        const jumpDirX = (aodaJumpTargetX >= aodaJumpStartX) ? 1 : -1;
        aodaFacing = jumpDirX;
        aodaVisualFacing = jumpDirX;
        const sc = mapScale / 2.625;
        const deltaY = aodaJumpTargetY - aodaJumpStartY;
        if (deltaY > 0) {
          // Nhảy từ bệ cao xuống bệ thấp: Bật nhảy nhẹ lên trên ở đầu cú nhảy rồi lướt vòng cung mềm mại xuống dưới (không lao thẳng xuống)
          const hopUp = Math.sin(t * Math.PI) * 52 * sc;
          const gravityCurve = Math.pow(t, 1.85);
          aodaY = aodaJumpStartY + deltaY * gravityCurve - hopUp;
        } else {
          // Nhảy từ bệ thấp lên bệ cao: Vút cao dứt khoát rồi đáp xuống bệ trên
          const easeOutY = 1 - Math.pow(1 - t, 1.4);
          const arc = Math.sin(t * Math.PI) * 58 * sc;
          aodaY = aodaJumpStartY + deltaY * easeOutY - arc;
        }

        // Hoạt ảnh KHÔNG BỊ ĐƠ: Trong suốt quỹ đạo nhảy, hoạt ảnh liên tục chạy mượt mà
        aodaAnimAccum += dt;
        if (aodaAnimAccum >= 0.07) {
          aodaAnimAccum -= 0.07;
          aodaFrameIndex++;
          if (aodaFrameIndex > 86 || aodaFrameIndex < 65) {
            aodaFrameIndex = 65;
          }
        }

        if (t >= 1.0) {
          aodaPlatform = aodaJumpTargetPlatform;
          aodaPlatformIndex = AODA_PLATFORMS.indexOf(aodaPlatform);
          aodaX = aodaJumpTargetX;
          aodaY = aodaJumpTargetY;
          aodaState = 'LANDING';
          aodaLandingTimer = 0.16;
        }
      }
      else if (aodaState === 'LANDING') {
        aodaLandingTimer -= dt;
        // Tiếp tục chạy hoạt ảnh trong lúc nhún chân tiếp đất hấp thụ lực
        aodaAnimAccum += dt;
        if (aodaAnimAccum >= 0.05) {
          aodaAnimAccum -= 0.05;
          aodaFrameIndex++;
          if (aodaFrameIndex > 86 || aodaFrameIndex < 65) {
            aodaFrameIndex = 65;
          }
        }
        if (aodaLandingTimer <= 0) {
          const aodaCarryingLoot = (bossLootDrop.carrierId === 'aoda');
          const aodaPickingUpLoot = (bossLootDrop.active && !bossLootDrop.carrierId && (bossLootDrop.isFreeForAll || bossLootDrop.lockedPickerId === 'aoda'));
          const isAodaInSwordZone = Math.hypot(aodaX - SWORD_X, aodaY - SWORD_Y) <= SWORD_CAPTURE_RADIUS;

          if (aodaCarryingLoot || aodaPickingUpLoot) {
            aodaState = 'MOVE';
            if (aodaFrameIndex < 65 || aodaFrameIndex > 86) {
              aodaFrameIndex = 65;
            }
          } else if (isAodaInSwordZone) {
            aodaState = 'IDLE';
            aodaFrameIndex = 0;
            if (hudAodaState) {
              hudAodaState.textContent = 'Aoda: [PHÒNG THỦ] Giữ cứ điểm Thánh Kiếm';
              hudAodaState.className = 'badge active';
            }
          } else {
            aodaFacing = (SWORD_X > aodaX) ? 1 : -1;
            aodaVisualFacing = aodaFacing;
            aodaState = 'MOVE';
            if (aodaFrameIndex < 65 || aodaFrameIndex > 86) {
              aodaFrameIndex = 65;
            }
          }
        }
      }
      else if (aodaState === 'IDLE') {
        aodaAnimAccum += dt;
        if (aodaAnimAccum >= 0.08) {
          aodaAnimAccum -= 0.08;
          aodaFrameIndex++;
          if (aodaFrameIndex > 24) aodaFrameIndex = 0;
        }

        const aodaCarryingLoot = (bossLootDrop.carrierId === 'aoda');
        const aodaPickingUpLoot = (bossLootDrop.active && !bossLootDrop.carrierId && (bossLootDrop.isFreeForAll || bossLootDrop.lockedPickerId === 'aoda'));
        const isAodaInSwordZone = Math.hypot(aodaX - SWORD_X, aodaY - SWORD_Y) <= SWORD_CAPTURE_RADIUS;
        const curTargetX = (aodaRetaliateBoss && !crapitIsDead) ? crapitX : ((!isDead) ? vargostX : SWORD_X);

        if (aodaCarryingLoot || aodaPickingUpLoot) {
          aodaState = 'MOVE';
          aodaFrameIndex = 65;
        } else if (!isAodaInSwordZone) {
          aodaFacing = (SWORD_X > aodaX) ? 1 : -1;
          aodaVisualFacing = aodaFacing;
          aodaState = 'MOVE';
          aodaFrameIndex = 65;
        } else {
          // Trong vùng Thánh Kiếm: Quay mặt phòng thủ đối diện kẻ địch hoặc Boss Crapit nếu đang đánh trả
          if (Math.abs(curTargetX - aodaX) > 25) {
            aodaFacing = (curTargetX > aodaX) ? 1 : -1;
            aodaVisualFacing = aodaFacing;
          }
        }
      }
    }

    // Cập nhật Tornado (Chiêu 1 của Aoda: kích thước 85px, bắt đầu mọc lên frame 0..3 -> tồn tại xoay lốc đỉnh cao frame 4..9 suốt đúng 2.0s -> tan biến frame 10..14, gây Định Thân & Câm Lặng)
    // QUY TẮC BẮT BUỘC: CHỈ TẤN CÔNG ĐỊCH MẶT ĐẤT, TUYỆT ĐỐI KHÔNG TẤN CÔNG TRÊN KHÔNG (!isFlying)
    for (let i = activeTornadoes.length - 1; i >= 0; i--) {
      const t = activeTornadoes[i];
      t.frameTimer += dt;

      if (t.phase === 'EMERGE' || t.phase === 'EMERGING') {
        t.x = t.originX;
        if (t.frameTimer >= 0.06) {
          t.frameTimer -= 0.06;
          t.frameIndex++;
          if (t.frameIndex >= 4) {
            // Hoàn thành hoạt ảnh bắt đầu mọc lên (frame 0..3) -> Chuyển sang tồn tại xoay lốc đỉnh cao (SPIN)
            t.phase = 'SPIN';
            t.frameIndex = 4;
            t.spinElapsed = 0;
          }
        }
      } else if (t.phase === 'SPIN' || t.phase === 'ACTIVE') {
        // Red Tornado di chuyển càn quét về phía trước, va chạm tường thì dội ngược lại cho đến khi hết thời gian tồn tại
        const tSpeed = 85 * (mapScale / 2.625);
        if (t.vx === undefined || t.vx === 0) {
          t.vx = (t.facing || 1) * tSpeed;
        }
        const nextX = t.x + t.vx * dt;
        const boundMinX = mapX + 75 * mapScale;
        const boundMaxX = mapX + 480 * mapScale;
        const lookAheadX = nextX + Math.sign(t.vx) * 20 * (mapScale / 2.625);
        const hitWall = isPointInSolid(lookAheadX, t.y - 30) || (nextX <= boundMinX) || (nextX >= boundMaxX);
        if (hitWall) {
          t.vx = -t.vx;
          t.facing = -t.facing;
          t.x = t.x + t.vx * dt;
        } else {
          t.x = nextX;
        }
        t.spinElapsed = (t.spinElapsed || 0) + dt;

        // Vòng lặp xoay lốc đỉnh cao: Frame 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 4 -> 5...
        if (t.frameTimer >= 0.06) {
          t.frameTimer -= 0.06;
          t.frameIndex++;
          if (t.frameIndex > 9) {
            t.frameIndex = 4;
          }
        }

        t.hitCooldown -= dt;
        const canTickDamage = (t.hitCooldown <= 0);

        // 1. Kiểm tra Vargost (Team 1) - Trúng cả mục tiêu trên không lẫn dưới mặt đất:
        const vY = vargostY + hoverOffset;
        if (Math.abs(t.x - vargostX) < 65 && Math.abs(t.y - vY) < 130) {
            vargostStunTimer = Math.max(vargostStunTimer, 2.0);
            vargostSilenceTimer = Math.max(vargostSilenceTimer, 2.0);
            vargostHitFlash = 0.35;
            isPhaseBlinking = false;
            phaseBlinkStep = 0;
            locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
            aiState = 'STUNNED';
            currentTilt = 0;
            if (canTickDamage) {
              const prevHp = vargostHp;
              vargostHp = Math.max(10, vargostHp - 25);
              vargostDamageGhosts.push({
                fromHp: prevHp, toHp: vargostHp, maxHp: VARGOST_MAX_HP,
                timer: 0, flashDuration: 0.12, dissolveDuration: 0.42, totalDuration: 0.54, seed: Math.random()
              });
              enemyDamageNumbers.push({
                text: '🌪️ CHOÁNG & CÂM LẶNG 2s!',
                x: vargostX,
                y: vargostY - 45,
                color: '#f0883e',
                alpha: 1.0,
                vy: -45
              });
            }
          }

        // 2. Sát thương diện rộng: Bất kỳ kẻ địch mặt đất nào trong AoE (ví dụ Ground Dummy):
        if (chkGroundDummy && chkGroundDummy.checked) {
          if (Math.abs(t.x - groundDummyX) < 65 && Math.abs(t.y - groundDummyY) < 85) {
            groundDummyStunTimer = Math.max(groundDummyStunTimer, 2.0);
            groundDummySilenceTimer = Math.max(groundDummySilenceTimer, 2.0);
            groundDummyHitFlash = 0.35;
            if (canTickDamage) {
              const prevHp = groundDummyHp;
              groundDummyHp = Math.max(10, groundDummyHp - 25);
              groundDummyDamageGhosts.push({
                fromHp: prevHp, toHp: groundDummyHp, maxHp: 100,
                timer: 0, flashDuration: 0.12, dissolveDuration: 0.42, totalDuration: 0.54, seed: Math.random()
              });
              enemyDamageNumbers.push({
                text: '🌪️ TORNADO: ROOT 2s!',
                x: groundDummyX,
                y: groundDummyY - 50,
                color: '#ff7b72',
                alpha: 1.0,
                vy: -45
              });
            }
          }
        }

        // 3. Kiểm tra Boss Trung Lập Crapit trong AoE Tornado (khi Aoda đánh trả Boss):
        if (!crapitIsDead && Math.abs(t.x - crapitX) < 75 && Math.abs(t.y - crapitY) < 110) {
          crapitHitFlash = 0.35;
          if (canTickDamage) {
            damageCrapitBoss(25, 'aoda', t.facing || 1);
          }
        }

        if (canTickDamage) {
          t.hitCooldown = 0.5;
        }

        // Kiểm tra kết thúc thời gian tồn tại 2.0s (spinDuration)
        const dur = t.spinDuration || t.activeDuration || 2.0;
        if (t.spinElapsed >= dur) {
          t.phase = 'DISSIPATE';
          t.frameIndex = 10;
          t.frameTimer = 0;
        }
      } else if (t.phase === 'DISSIPATE' || t.phase === 'DISSIPATING') {
        if (t.frameTimer >= 0.06) {
          t.frameTimer -= 0.06;
          t.frameIndex++;
          if (t.frameIndex > 14) {
            // Đã hoàn tất hoạt ảnh tan biến -> Xóa khỏi danh sách active
            activeTornadoes.splice(i, 1);
            continue;
          }
        }
      }
    }

    // -------------------------------------------------------------
    // CẬP NHẬT BOSS TRUNG LẬP CRAPIT (2150 HP, Đặt tại 1164, 752)
    // - Chỉ tấn công nhân vật đang đứng trong khu vực Thánh Kiếm
    // - Ngắt quãng 5-7s giữa các đợt tấn công
    // - Frame 5..7 chuẩn bị tung skill, Frame 8 nhả cầu nước bọt từ miệng (Pin -> Box)
    // - Đạn 30x30 bay 500px/s xoay tròn, khóa mục tiêu không trượt, xuyên qua Địa hình số 2,
    //   nhưng bị cản bởi Địa hình số 1 và số 3
    // - Trúng đòn: Nổ 40x40, trừ 15 HP, gây hiệu ứng Cấm Hồi Máu (icon dưới thanh máu) đến khi chết,
    //   và kích hoạt phản xạ đánh trả của tướng bị bắn đến khi Boss chết hoặc tướng chết!
    // -------------------------------------------------------------
    if (crapitHitFlash > 0) crapitHitFlash = Math.max(0, crapitHitFlash - dt);
    for (let i = crapitDamageGhosts.length - 1; i >= 0; i--) {
      const g = crapitDamageGhosts[i];
      g.timer += dt;
      if (g.timer >= g.totalDuration) crapitDamageGhosts.splice(i, 1);
    }

    if (crapitIsDead) {
      // Boss chỉ xuất hiện 1 lần trong map, bị tiêu diệt không xuất hiện lại!
      crapitDeathTimer += dt;
    } else {
      if (crapitAttackCooldown > 0) {
        crapitAttackCooldown = Math.max(0, crapitAttackCooldown - dt);
      }

      if (crapitState === 'IDLE') {
        crapitAnimAccum += dt;
        if (crapitAnimAccum >= 0.10) {
          crapitAnimAccum -= 0.10;
          crapitFrameIndex = (crapitFrameIndex + 1) % 5; // Frame 0..4 Idle
        }

        // Kiểm tra có nhân vật nào đang đứng trong vùng Thánh Kiếm không (chỉ đứng trong Thánh Kiếm mới bị Crapit tấn công)
        // Nếu có nhiều người cùng chiếm: Crapit phun ra số lượng đạn tương ứng cho TẤT CẢ mọi người trong vùng!
        if (crapitAttackCooldown <= 0) {
          const targetsInSwordZone = [];
          if (isAodaInZone) targetsInSwordZone.push('aoda');
          if (isVargostInZone) targetsInSwordZone.push('vargost');

          if (targetsInSwordZone.length > 0) {
            crapitLockedTargetIds = targetsInSwordZone;
            crapitState = 'WINDUP';
            crapitFrameIndex = 5; // Frame 5-7 là chuẩn bị tung skill
            crapitAnimAccum = 0.0;
          }
        }
      } else if (crapitState === 'WINDUP') {
        crapitAnimAccum += dt;
        if (crapitAnimAccum >= 0.10) {
          crapitAnimAccum -= 0.10;
          crapitFrameIndex++;
          if (crapitFrameIndex >= 8) {
            // Vừa kết thúc Frame 7 chuyển sang bắt đầu Frame 8: Nhả quả cầu nước bọt từ miệng cho TẤT CẢ mục tiêu!
            crapitFrameIndex = 8;
            crapitState = 'RELEASE';
            crapitAnimAccum = 0.0;
            for (const tId of crapitLockedTargetIds) {
              spawnCrapitSalivaOrb(tId);
            }
          }
        }
      } else if (crapitState === 'RELEASE') {
        crapitAnimAccum += dt;
        if (crapitAnimAccum >= 0.14) {
          // Kết thúc Frame 8 -> Ngắt quãng 5-7s sau mới tấn công tiếp
          crapitState = 'IDLE';
          crapitFrameIndex = 0;
          crapitAnimAccum = 0.0;
          crapitAttackCooldown = 5.0 + Math.random() * 2.0; // Ngắt quãng 5.0s - 7.0s
        }
      }
    }

    // Cập nhật đường bay Quả Cầu Nước Bọt của Boss Crapit (activeCrapitProjectiles)
    for (let i = activeCrapitProjectiles.length - 1; i >= 0; i--) {
      const cp = activeCrapitProjectiles[i];
      cp.time += dt;
      cp.spinAngle += 12.0 * dt; // Hiệu ứng xoay tròn liên tục khi bay
      cp.frameTimer += dt;
      if (cp.frameTimer >= 0.04) {
        cp.frameTimer -= 0.04;
        cp.frameIndex = (cp.frameIndex + 1) % 122; // Giữ nguyên hoạt ảnh gốc 122 frames
      }

      const prevX = cp.x;
      const prevY = cp.y;

      // Giai đoạn 1: Liên kết mượt mà từ Pin (103, 229) khi kết thúc Frame 7 sang Box [56, 232, 33, 28] khi bắt đầu Frame 8
      if (cp.mouthSlideTimer < cp.mouthSlideDuration) {
        cp.mouthSlideTimer = Math.min(cp.mouthSlideDuration, cp.mouthSlideTimer + dt);
        const slideT = cp.mouthSlideTimer / cp.mouthSlideDuration;
        cp.x = cp.pinX + (cp.boxX - cp.pinX) * slideT;
        cp.y = cp.pinY + (cp.boxY - cp.pinY) * slideT;
        continue;
      }

      // Giai đoạn 2: Bay khóa mục tiêu (Homing Lock) với tốc độ 500px/s mọi nơi không trượt
      const isTargetingAoda = (cp.targetId === 'aoda');
      if ((isTargetingAoda && aodaIsDead) || (!isTargetingAoda && isDead)) {
        spawnCrapitExplosion(cp.x, cp.y);
        activeCrapitProjectiles.splice(i, 1);
        continue;
      }

      const liveTargetX = isTargetingAoda ? aodaX : vargostX;
      const liveTargetY = isTargetingAoda ? (aodaY - 42 * (zoom / 0.7)) : ((vargostY + hoverOffset) - 25 * spriteScale);
      const dx = liveTargetX - cp.x;
      const dy = liveTargetY - cp.y;
      const dist = Math.hypot(dx, dy);
      const step = cp.speed * dt;

      if (dist > 0.001) {
        cp.x += (dx / dist) * Math.min(dist, step);
        cp.y += (dy / dist) * Math.min(dist, step);
      }

      // Kiểm tra va chạm địa hình: XUYÊN QUA Địa hình số 2 (Zone 2), NHƯNG BỊ CẢN bởi Địa hình số 1 và số 3!
      const envHit = raycastEnvCollision(prevX, prevY, cp.x, cp.y, ['zone_1', 'zone_3']);
      if (envHit) {
        spawnCrapitExplosion(envHit.hitX, envHit.hitY);
        enemyDamageNumbers.push({
          text: '💥 ĐỊA HÌNH CHẶN ĐẠN BOSS!',
          x: envHit.hitX,
          y: envHit.hitY - 18,
          color: '#a5d6ff',
          alpha: 1.0,
          vy: -40
        });
        activeCrapitProjectiles.splice(i, 1);
        continue;
      }

      // Kiểm tra chạm mục tiêu đã khóa (không bao giờ trượt nếu không bị Zone 1/3 cản)
      const hitDist = Math.hypot(cp.x - liveTargetX, cp.y - liveTargetY);
      if (hitDist <= cp.radius + 22 * (zoom / 0.7)) {
        spawnCrapitExplosion(cp.x, cp.y);
        spawnHitImpact(liveTargetX, liveTargetY, Math.sign(dx) || -1);

        if (isTargetingAoda) {
          const prevAodaHp = aodaHp;
          aodaHp = Math.max(0, aodaHp - CRAPIT_ATTACK_DAMAGE); // Trừ 15 HP
          aodaHitFlash = 0.35;
          aodaAntiHeal = true; // Hiệu ứng bất lợi Cấm Hồi Máu tồn tại đến khi chết
          aodaRetaliateBoss = true; // Phản xạ quay sang tấn công trả Boss Crapit!
          aodaDamageGhosts.push({
            fromHp: prevAodaHp,
            toHp: aodaHp,
            maxHp: aodaMaxHp,
            timer: 0,
            flashDuration: 0.12,
            dissolveDuration: 0.42,
            totalDuration: 0.54,
            seed: Math.random()
          });
          enemyDamageNumbers.push({
            text: `💧 -${CRAPIT_ATTACK_DAMAGE} HP · 🚫 CẤM HỒI MÁU!`,
            x: aodaX,
            y: aodaY - 78,
            color: '#ff7b72',
            alpha: 1.0,
            vy: -50
          });
          if (aodaHp <= 0) {
            triggerAodaKo();
          } else {
            showToast('💧 Boss Crapit bắn trúng Aoda (-15 HP, Cấm Hồi Máu)! Aoda phản xạ đánh trả Boss!');
          }
        } else {
          const prevVargHp = vargostHp;
          vargostHp = Math.max(0, vargostHp - CRAPIT_ATTACK_DAMAGE); // Trừ 15 HP
          vargostHitFlash = 0.35;
          vargostRecoilTimer = 0.20;
          vargostAntiHeal = true; // Hiệu ứng bất lợi Cấm Hồi Máu tồn tại đến khi chết
          vargostRetaliateBoss = true; // Phản xạ quay sang tấn công trả Boss Crapit!
          vargostDamageGhosts.push({
            fromHp: prevVargHp,
            toHp: vargostHp,
            maxHp: VARGOST_MAX_HP,
            timer: 0,
            flashDuration: 0.12,
            dissolveDuration: 0.42,
            totalDuration: 0.54,
            seed: Math.random()
          });
          enemyDamageNumbers.push({
            text: `💧 -${CRAPIT_ATTACK_DAMAGE} HP · 🚫 CẤM HỒI MÁU!`,
            x: vargostX,
            y: (vargostY + hoverOffset) - 65,
            color: '#ff7b72',
            alpha: 1.0,
            vy: -50
          });
          if (vargostHp <= 0) {
            triggerVargostDeath();
          } else {
            showToast('💧 Boss Crapit bắn trúng Vargost (-15 HP, Cấm Hồi Máu)! Vargost phản xạ đánh trả Boss!');
          }
        }

        activeCrapitProjectiles.splice(i, 1);
        continue;
      }

      if (cp.time > 5.0) {
        activeCrapitProjectiles.splice(i, 1);
      }
    }

    // Cập nhật Hiệu ứng Nổ 40x40 của Boss Crapit (activeCrapitExplosions)
    for (let i = activeCrapitExplosions.length - 1; i >= 0; i--) {
      const ce = activeCrapitExplosions[i];
      ce.frameTimer += dt;
      if (ce.frameTimer >= 0.065) {
        ce.frameTimer -= 0.065;
        ce.frameIndex++;
        if (ce.frameIndex >= ce.totalFrames) {
          activeCrapitExplosions.splice(i, 1);
        }
      }
    }



    // Cập nhật Cổ Vật Boss, Nhặt đồ, Hộ tống & Giao về Căn Cứ
    updateBossLootAndEscort(dt);

    // -------------------------------------------------------------
    // Render Scene, 3v3 Extra Slots & 1:1 Rigging Isolation
    // -------------------------------------------------------------
    drawScene(targetX, targetY, dt);
    if (typeof updateAndDrawMultiSlots === 'function') {
      updateAndDrawMultiSlots(dt);
    }
    if (typeof renderIsolationAndAnnotations === 'function') {
      renderIsolationAndAnnotations();
    }
    renderLoupe();
  } catch (err) {
    console.error("[GodWar Viewer Update Loop Error]", err);
    if (ctx) {
      try {
        ctx.save();
        ctx.fillStyle = 'rgba(235, 87, 87, 0.9)';
        ctx.fillRect(20, 20, 650, 45);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('⚠️ LỖI VÒNG LẶP: ' + (err && err.message ? err.message : String(err)), 30, 48);
        ctx.restore();
      } catch (e) {}
    }
  } finally {
    requestAnimationFrame(update);
  }
}

// =============================================================
// CẬP NHẬT CỔ VẬT RƠI TỪ BOSS, NHẶT ĐỒ & HỘ TỐNG VỀ CĂN CỨ
// - Khi Boss chết rơi Cổ Vật 30x30px
// - Tướng đánh đòn cuối kết liễu nhặt được (hiện icon 10x10 trên thanh máu)
// - Cả đội giảm 10% tốc độ, 2 tướng còn lại hộ tống bảo vệ
// - Mang về căn cứ (Trái: 379, 638 | Phải: 1577, 400) trong phạm vi là thành công!
// - Tướng mang chết -> rơi tự do tại chỗ, bất kỳ tướng nào cũng nhặt được
// =============================================================
function updateBossLootAndEscort(dt) {
  if (!bossLootDrop.active && !bossLootDrop.carrierId) return;

  const vHover = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;
  const vPos = { x: vargostX, y: vargostY + vHover };
  const aPos = { x: aodaX, y: aodaY };

  // 1. Kiểm tra nhặt Cổ Vật khi đang rơi trên sàn
  if (bossLootDrop.active && !bossLootDrop.carrierId) {
    const pickupRadius = 45 * (mapScale / 2.625);
    const dVargost = Math.hypot(vPos.x - bossLootDrop.x, vPos.y - bossLootDrop.y);
    const dAoda = Math.hypot(aPos.x - bossLootDrop.x, aPos.y - bossLootDrop.y);

    const canVargostPick = (!isDead) && (bossLootDrop.isFreeForAll || bossLootDrop.lockedPickerId === 'vargost');
    const canAodaPick = (!aodaIsDead) && (bossLootDrop.isFreeForAll || bossLootDrop.lockedPickerId === 'aoda');

    if (canVargostPick && dVargost <= pickupRadius) {
      bossLootDrop.carrierId = 'vargost';
      showToast('💎 Vargost đã nhặt được Cổ Vật! Đội 1 giảm 10% tốc độ, hộ tống về Căn Cứ Trái (379, 638)!');
    } else if (canAodaPick && dAoda <= pickupRadius) {
      bossLootDrop.carrierId = 'aoda';
      showToast('💎 Aoda đã nhặt được Cổ Vật! Đội 2 giảm 10% tốc độ, hộ tống về Căn Cứ Phải (1577, 400)!');
    }
  }

  // 2. Kiểm tra giao Cổ Vật thành công tại điểm cuối của map (phạm vi EXTRACTION_RADIUS)
  if (bossLootDrop.carrierId === 'vargost') {
    const dExtract = Math.hypot(vargostX - LEFT_EXTRACTION_X, (vargostY + vHover) - LEFT_EXTRACTION_Y);
    if (dExtract <= EXTRACTION_RADIUS) {
      bossLootDrop.isDelivered = true;
      bossLootDrop.active = false;
      bossLootDrop.carrierId = null;
      showToast('🏆 ĐỘI 1 ĐÃ HỘ TỐNG THÀNH CÔNG CỔ VẬT VỀ CĂN CỨ TRÁI (379, 638)!');
    }
  } else if (bossLootDrop.carrierId === 'aoda') {
    const dExtract = Math.hypot(aodaX - RIGHT_EXTRACTION_X, aodaY - RIGHT_EXTRACTION_Y);
    if (dExtract <= EXTRACTION_RADIUS) {
      bossLootDrop.isDelivered = true;
      bossLootDrop.active = false;
      bossLootDrop.carrierId = null;
      showToast('🏆 ĐỘI 2 ĐÃ HỘ TỐNG THÀNH CÔNG CỔ VẬT VỀ CĂN CỨ PHẢI (1577, 400)!');
    }
  }

  // 3. Nếu tướng đang mang Cổ Vật tử trận -> Rơi Cổ Vật tại chỗ, chuyển sang Free-For-All
  if (bossLootDrop.carrierId === 'vargost' && isDead) {
    bossLootDrop.active = true;
    bossLootDrop.carrierId = null;
    bossLootDrop.isFreeForAll = true;
    bossLootDrop.lockedPickerId = null;
    bossLootDrop.x = vargostX;
    bossLootDrop.y = vargostY + vHover;
    showToast('⚠️ Vargost bị tiêu diệt! Cổ Vật rơi tự do tại chỗ, bất kỳ tướng nào cũng có thể nhặt!');
  } else if (bossLootDrop.carrierId === 'aoda' && aodaIsDead) {
    bossLootDrop.active = true;
    bossLootDrop.carrierId = null;
    bossLootDrop.isFreeForAll = true;
    bossLootDrop.lockedPickerId = null;
    bossLootDrop.x = aodaX;
    bossLootDrop.y = aodaY;
    showToast('⚠️ Aoda bị tiêu diệt! Cổ Vật rơi tự do tại chỗ, bất kỳ tướng nào cũng có thể nhặt!');
  }
}

// -------------------------------------------------------------
// Gothic RPG Health Bar Renderer (Mẫu image copy.png: Lõi thủy tinh + Khung kim loại Gothic)
// Hỗ trợ theme: 'green' (Đồng minh / Vargost) và 'red' (Kẻ địch) tươi hơn 15%
// Hỗ trợ fadeAlpha & dissolveFactor khi nhân vật tử trận (KO tan biến cả thanh máu)
// -------------------------------------------------------------
function drawGothicHealthBar(targetCtx, centerX, topY, currentHp, maxHp, damageGhosts, labelText, subText, isHit, customWidth, barTheme = 'green', fadeAlpha = 1.0, dissolveFactor = 0, hasAntiHeal = false, hasLootItem = false) {
  if (fadeAlpha !== undefined && fadeAlpha <= 0.001) {
    return; // Đã tan biến hoàn toàn vào hư không -> Không vẽ thanh máu
  }

  const scale = (zoom / 0.7);
  // Chiều rộng tổng thể: 80px để lòng ruột máu dài đúng 67.3px (bằng thanh máu UI cũ 68px)
  const barW = (customWidth || 80) * scale;
  const barH = barW * (50 / 240) * 0.85; // Giảm 15% độ dày (thanh mảnh, tinh tế ~14.17px)
  const barX = centerX - barW / 2;
  const barY = topY;

  // Tọa độ ruột buồng máu thủy tinh bên trong khung (theo tỷ lệ gốc 240x50: X=17..218, Y=14..30)
  const bloodX = barX + barW * (17 / 240);
  const bloodY = barY + barH * (14 / 50);
  const bloodW = barW * (202 / 240);
  const bloodH = barH * (17 / 50);

  const isGreenTheme = (barTheme === 'green' || barTheme === 'ally');
  const liquidAsset = isGreenTheme ? (assets.healthBarGreen || assets.healthBarBlood) : assets.healthBarBlood;
  const liquidFallbackColor = isGreenTheme ? '#10f06a' : '#ff1a1a'; // Tươi hơn 15%

  targetCtx.save();
  if (fadeAlpha !== undefined && fadeAlpha < 1.0) {
    targetCtx.globalAlpha = Math.max(0, Math.min(1.0, fadeAlpha));
  }

  // 1. LỚP 1 (ĐÁY): Khung Gothic & Lõi Ống Rỗng (Frame & Empty Glass Chamber)
  // Đảm bảo "vẫn thấy rõ lõi của ống máu" ngay cả khi máu cạn hoặc tan rã!
  if (assets.healthBarEmpty) {
    targetCtx.drawImage(assets.healthBarEmpty, barX, barY, barW, barH);
  } else {
    // Fallback Canvas: Khung kim loại xám đen + buồng rỗng tối màu pha đỏ rượu / ngọc lục bảo
    targetCtx.fillStyle = '#0d1117';
    targetCtx.fillRect(barX, barY, barW, barH);
    targetCtx.fillStyle = isGreenTheme ? '#081a10' : '#1c0a0d';
    targetCtx.fillRect(bloodX, bloodY, bloodW, bloodH);
    targetCtx.strokeStyle = '#30363d';
    targetCtx.strokeRect(barX, barY, barW, barH);
  }

  // 2. LỚP 2: Dải Máu Hiện Tại (Current HP Liquid: Xanh lá cho Đồng minh, Đỏ cho Kẻ địch)
  const currentRatio = Math.max(0, Math.min(1, currentHp / maxHp));
  if (currentRatio > 0.001) {
    if (liquidAsset) {
      targetCtx.drawImage(
        liquidAsset,
        17, 14, 202 * currentRatio, 17,
        bloodX, bloodY, bloodW * currentRatio, bloodH
      );
    } else {
      targetCtx.fillStyle = liquidFallbackColor;
      targetCtx.fillRect(bloodX, bloodY, bloodW * currentRatio, bloodH);
    }
  }

  // 3. LỚP 3: Đoạn Máu Bị Trừ (Damage Ghosts: Sáng Lên Đột Ngột -> Pixel Dissolve)
  if (damageGhosts && damageGhosts.length > 0) {
    for (const ghost of damageGhosts) {
      const startRatio = Math.max(0, Math.min(1, ghost.toHp / ghost.maxHp));
      const endRatio = Math.max(0, Math.min(1, ghost.fromHp / ghost.maxHp));
      const diffRatio = endRatio - startRatio;
      if (diffRatio <= 0.001) continue;

      const ghostSx = 17 + 202 * startRatio;
      const ghostSw = 202 * diffRatio;
      const ghostDx = bloodX + bloodW * startRatio;
      const ghostDw = bloodW * diffRatio;

      // PHA 1: SÁNG LÊN ĐỘT NGỘT (Flash Bright / White-Gold / White-Jade)
      if (ghost.timer < ghost.flashDuration) {
        if (liquidAsset) {
          targetCtx.drawImage(liquidAsset, ghostSx, 14, ghostSw, 17, ghostDx, bloodY, ghostDw, bloodH);
        }
        targetCtx.save();
        targetCtx.globalCompositeOperation = 'lighter';
        targetCtx.fillStyle = isGreenTheme ? 'rgba(230, 255, 240, 0.95)' : 'rgba(255, 255, 230, 0.95)';
        targetCtx.fillRect(ghostDx, bloodY, ghostDw, bloodH);
        targetCtx.restore();
      }
      // PHA 2: BIẾN MẤT THEO KỸ THUẬT PIXEL DISSOLVE
      else {
        const gDissolveFactor = Math.min(1.0, (ghost.timer - ghost.flashDuration) / ghost.dissolveDuration);

        // Chia đoạn bị trừ thành các hạt pixel dither nhỏ (2x2px)
        const pSize = 2.2 * scale;
        const numCols = Math.ceil(ghostDw / pSize);
        const numRows = Math.ceil(bloodH / pSize);

        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            // Hash seed cho từng hạt pixel
            const pSeed = ((c * 43 + r * 67 + Math.floor(ghost.seed * 100)) % 100) / 100.0;
            if (pSeed < gDissolveFactor) {
              // Hạt pixel này đã tan biến -> BỎ QUA, để lộ rõ LÕI ỐNG MÁU RỖNG bên dưới!
              continue;
            }

            const px = ghostDx + c * pSize;
            const py = bloodY + r * pSize;
            const pw = Math.min(pSize, ghostDx + ghostDw - px);
            const ph = Math.min(pSize, bloodY + bloodH - py);

            const sPx = ghostSx + (c * pSize / ghostDw) * ghostSw;
            const sPy = 14 + (r * pSize / bloodH) * 17;
            const sPw = (pw / ghostDw) * ghostSw;
            const sPh = (ph / bloodH) * 17;

            if (liquidAsset) {
              targetCtx.drawImage(liquidAsset, sPx, sPy, sPw, sPh, px, py, pw, ph);
            } else {
              targetCtx.fillStyle = isGreenTheme ? '#22c55e' : '#ff4444';
              targetCtx.fillRect(px, py, pw, ph);
            }

            // Hào quang tàn tro ngọc lục bảo / cam vàng trên hạt pixel sắp tan rã
            if (Math.random() < 0.22) {
              targetCtx.fillStyle = isGreenTheme ? 'rgba(167, 243, 208, 0.75)' : 'rgba(255, 215, 80, 0.65)';
              targetCtx.fillRect(px, py, pw, ph);
            }
          }
        }

        // Sinh hạt tàn tro pixel ngọc / lửa bay lên từ đoạn máu đang tan rã
        if (Math.random() < 0.4) {
          emberParticles.push({
            x: ghostDx + Math.random() * ghostDw,
            y: bloodY + Math.random() * bloodH,
            vx: (Math.random() - 0.5) * 35,
            vy: -Math.random() * 40 - 15,
            size: Math.random() < 0.5 ? 2.5 : 1.5,
            alpha: 1.0,
            color: isGreenTheme
              ? (Math.random() < 0.35 ? '#ffffff' : (Math.random() < 0.7 ? '#7ee787' : '#10f06a'))
              : (Math.random() < 0.4 ? '#ffffff' : (Math.random() < 0.7 ? '#ffd166' : '#ff3838')),
            life: 0.22
          });
        }
      }
    }
  }

  // 4. LỚP 4: Phản Quang Mặt Kính Thủy Tinh Bóng Bẩy (Glass Gloss Highlight)
  if (assets.healthBarGlass) {
    targetCtx.drawImage(assets.healthBarGlass, barX, barY, barW, barH);
  }

  // Sinh tàn tro bay lên từ thanh máu khi đang KO tan biến
  if (dissolveFactor > 0.05 && Math.random() < 0.4) {
    emberParticles.push({
      x: centerX + (Math.random() - 0.5) * barW * 0.8,
      y: barY + Math.random() * barH,
      vx: (Math.random() - 0.5) * 45,
      vy: -Math.random() * 55 - 25,
      size: Math.random() < 0.4 ? 3 : 2,
      alpha: fadeAlpha,
      color: isGreenTheme
        ? (Math.random() < 0.5 ? '#7ee787' : '#10f06a')
        : (Math.random() < 0.5 ? '#ffd166' : '#ff4500'),
      life: 0.35
    });
  }

  // 5. CHỮ SỐ VÀ NHÃN TRẠNG THÁI (Labels)
  if (labelText) {
    targetCtx.fillStyle = isHit ? '#ff7b72' : (isGreenTheme ? '#aff5b4' : '#ffa657');
    targetCtx.font = 'bold 12px monospace';
    targetCtx.textAlign = 'center';
    targetCtx.fillText(labelText, centerX, barY - 6);
  }

  if (subText) {
    targetCtx.font = '11px monospace';
    targetCtx.fillStyle = '#8b949e';
    targetCtx.textAlign = 'center';
    targetCtx.fillText(subText, centerX, barY + barH + 13);
  }

  // 6. ICON CỔ VẬT NHẶT ĐƯỢC TỪ BOSS CRAPIT (Hiển thị icon nhỏ cỡ 10x10px trên thanh máu)
  if (hasLootItem && assets.crapitLootOrb) {
    const orbSize = 10 * scale;
    const orbX = centerX - orbSize / 2;
    const orbY = barY - 18 * scale;
    targetCtx.save();
    targetCtx.drawImage(assets.crapitLootOrb, orbX, orbY, orbSize, orbSize);
    targetCtx.strokeStyle = 'rgba(0, 255, 255, 0.85)';
    targetCtx.lineWidth = 1;
    targetCtx.strokeRect(orbX - 1, orbY - 1, orbSize + 2, orbSize + 2);
    targetCtx.restore();
  }

  // 7. ICON CẤM HỒI MÁU (Dấu '+' kèm gạch chéo 10x10px nằm góc phải sát mép bên dưới thanh máu tướng)
  if (hasAntiHeal) {
    const iconSz = 10 * scale;
    const iconX = (barX + barW) - iconSz;
    const iconY = barY + barH + 2 * scale;

    targetCtx.save();
    // Nền tối viền đỏ
    targetCtx.fillStyle = 'rgba(20, 5, 5, 0.9)';
    targetCtx.fillRect(iconX, iconY, iconSz, iconSz);
    targetCtx.strokeStyle = '#ff3838';
    targetCtx.lineWidth = 1;
    targetCtx.strokeRect(iconX, iconY, iconSz, iconSz);

    // Dấu '+' đỏ tươi
    targetCtx.fillStyle = '#ff7b72';
    const cMidX = iconX + iconSz / 2;
    const cMidY = iconY + iconSz / 2;
    const barThick = Math.max(1.5, 2 * scale);
    const barLen = iconSz * 0.7;
    targetCtx.fillRect(cMidX - barLen / 2, cMidY - barThick / 2, barLen, barThick);
    targetCtx.fillRect(cMidX - barThick / 2, cMidY - barLen / 2, barThick, barLen);

    // Dấu gạch chéo \ trắng sắc nét
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(iconX + 1.5, iconY + 1.5);
    targetCtx.lineTo(iconX + iconSz - 1.5, iconY + iconSz - 1.5);
    targetCtx.stroke();
    targetCtx.restore();
  }

  targetCtx.restore();
}

// =============================================================
// ANIMATION STATUS EFFECT: DÒNG CHẢY MÁU DẤU "+" ĐỎ TỪ NHỎ ĐẾN TO
// - Bắt đầu từ 30% thân người tính từ đỉnh đầu xuống
// - Chảy dọc xuống bên cạnh chân phải mô phỏng dòng máu đang chảy
// - Kích thước chạy từ nhỏ (2px) đến to (6.5px)
// =============================================================
function renderBleedingStatusEffect(targetCtx, charX, charY, charH, facing, timeSec) {
  targetCtx.save();
  const scale = (zoom / 0.7);
  const headTopY = charY - charH * scale;
  const startY = headTopY + charH * scale * 0.30; // 30% thân người từ trên xuống
  const endY = charY; // Xuống đến chân
  const bleedH = endY - startY;

  const PARTICLE_COUNT = 6;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const phase = (timeSec * 1.6 + i / PARTICLE_COUNT) % 1.0; // 0.0 (đỉnh) -> 1.0 (chân)
    const curY = startY + phase * bleedH;

    // Xuất hiện ở bên cạnh chân phải theo hướng mặt
    const lateralOffset = (facing * 11.0 + phase * (facing * 4.0) + Math.sin(phase * 8.0 + timeSec * 5.0) * 2.0) * scale;
    const curX = charX + lateralOffset;

    // Kích thước chạy từ nhỏ đến to: từ 2.0px lên 6.5px
    const pSize = (2.0 + phase * 4.5) * scale;
    const alpha = (phase < 0.15) ? (phase / 0.15) : (phase > 0.85 ? (1.0 - phase) / 0.15 : 1.0);

    // Màu đỏ máu: từ đỏ tươi (#ff3333) sang đỏ ruby đậm (#b30000)
    targetCtx.fillStyle = phase > 0.5 ? `rgba(180, 0, 0, ${alpha * 0.95})` : `rgba(255, 30, 30, ${alpha * 0.95})`;

    // Vẽ hình dấu "+" (HP cross)
    const barThick = Math.max(1, pSize * 0.32);
    targetCtx.fillRect(curX - pSize / 2, curY - barThick / 2, pSize, barThick);
    targetCtx.fillRect(curX - barThick / 2, curY - pSize / 2, barThick, pSize);

    // Điểm sáng lóe nhỏ ở tâm khi hạt đang nở to
    if (phase > 0.4 && phase < 0.8) {
      targetCtx.fillStyle = `rgba(255, 200, 200, ${alpha * 0.7})`;
      targetCtx.fillRect(curX - barThick * 0.4, curY - barThick * 0.4, barThick * 0.8, barThick * 0.8);
    }
  }
  targetCtx.restore();
}

// =============================================================
// VẼ CỔ VẬT BOSS RƠI TRÊN MẶT ĐẤT (10x10px) + HIỆU ỨNG LẤP LÁNH TINH TẾ (SPARKLE)
// Đã loại bỏ hoàn toàn viền hào quang tròn xanh nhạt xung quanh, chỉ giữ lại item gốc
// =============================================================
function renderBossLootDrop(targetCtx, dt) {
  if (!bossLootDrop.active || bossLootDrop.carrierId) return;
  const scale = (zoom / 0.7);
  bossLootDrop.shineTimer += dt;
  const t = bossLootDrop.shineTimer;
  const lx = bossLootDrop.x;
  const ly = bossLootDrop.y - 5 * scale;
  const size = 10 * scale;

  targetCtx.save();

  // 1. Vẽ item gốc (Texture 10x10 chuẩn)
  if (assets.crapitLootOrb) {
    targetCtx.drawImage(assets.crapitLootOrb, lx - size / 2, ly - size / 2, size, size);
  } else {
    targetCtx.fillStyle = '#00ffff';
    targetCtx.beginPath();
    targetCtx.arc(lx, ly, size / 2, 0, Math.PI * 2);
    targetCtx.fill();
  }

  // 2. Hiệu ứng lấp lánh 1 cách tinh tế (Subtle Sparkle): 3 đốm sáng nhỏ li ti nhấp nháy luân phiên quanh ngọc
  const sparkOffsets = [
    [-3 * scale, -3 * scale],
    [3.5 * scale, -2 * scale],
    [-1.5 * scale, 3.5 * scale]
  ];
  for (let s = 0; s < 3; s++) {
    const sPhase = (t * 2.5 + s * 0.33) % 1.0;
    const sAlpha = Math.sin(sPhase * Math.PI); // chớp tắt êm dịu 0..1..0
    if (sAlpha > 0.05) {
      const [sox, soy] = sparkOffsets[s];
      const sx = lx + sox;
      const sy = ly + soy;
      const sparkLen = (2.5 + sAlpha * 2.0) * scale;
      // Tia chữ thập siêu nhỏ tinh tế
      targetCtx.fillStyle = `rgba(255, 255, 255, ${sAlpha * 0.95})`;
      targetCtx.fillRect(sx - sparkLen, sy - 0.5 * scale, sparkLen * 2, 1.0 * scale);
      targetCtx.fillRect(sx - 0.5 * scale, sy - sparkLen, 1.0 * scale, sparkLen * 2);
      // Lõi sáng vàng ánh kim nhẹ
      targetCtx.fillStyle = `rgba(255, 240, 180, ${sAlpha * 0.8})`;
      targetCtx.fillRect(sx - 1 * scale, sy - 1 * scale, 2 * scale, 2 * scale);
    }
  }

  // 3. Tên Cổ Vật & Chỉ thị
  targetCtx.fillStyle = '#7ee787';
  targetCtx.font = 'bold 11px monospace';
  targetCtx.textAlign = 'center';
  const labelText = bossLootDrop.isFreeForAll ? '💎 CỔ VẬT RƠI (AI CŨNG CÓ THỂ NHẶT)' : '💎 CỔ VẬT BOSS (BƯỚC VÀO ĐỂ NHẶT)';
  targetCtx.fillText(labelText, lx, ly - 14 * scale);
  targetCtx.restore();
}

function drawScene(targetX, targetY, dt) {
  ctx.clearRect(0, 0, W, H);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

  // 1. Draw Map
  if (assets.map) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(assets.map, mapX, mapY, 512 * mapScale, 352 * mapScale);
  }

  // 1.1 Draw Environment Zone Boundaries (Đất/Tường & Mặt Đi)
  if (chkShowEnv && chkShowEnv.checked) {
    ctx.save();
    for (const zone of ENV_ZONES) {
      ctx.fillStyle = zone.color;
      ctx.beginPath();
      ctx.moveTo(zone.polygon[0][0], zone.polygon[0][1]);
      for (let i = 1; i < zone.polygon.length; i++) {
        ctx.lineTo(zone.polygon[i][0], zone.polygon[i][1]);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = zone.strokeColor;
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Highlight walking surfaces
      for (const surf of zone.surfaces) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(surf.minX, surf.y);
        ctx.lineTo(surf.maxX, surf.y);
        ctx.stroke();
      }
    }

    // Vẽ 2 Vòng Tròn Đỏ Căn Cứ Xuất Phát & Hồi Sinh của 2 Đội (Theo mẫu chỉ định của Owner)
    for (const baseKey of ['left', 'right']) {
      const bz = TEAM_SPAWN_ZONES[baseKey];
      ctx.save();
      ctx.strokeStyle = 'rgba(235, 35, 35, 0.85)';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(bz.circleX, bz.circleY, bz.circleRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(235, 35, 35, 0.08)';
      ctx.fill();

      ctx.fillStyle = '#ff7b72';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        baseKey === 'left' ? '⭕ CĂN CỨ ĐỘI 1 (Xuất phát / Hồi sinh: Bay + Bộ binh)' : '⭕ CĂN CỨ ĐỘI 2 (Xuất phát / Hồi sinh: Bay + Bộ binh)',
        bz.circleX,
        bz.circleY - bz.circleRadius - 8
      );
      ctx.restore();
    }

    // Vẽ tia Line of Sight (LoS) từ Vargost tới mục tiêu
    const vCastX = vargostX;
    const vCastY = (vargostY + hoverOffset) - 20;
    const tAimX = targetX;
    const tAimY = targetY - 24;
    const curLoSHit = raycastEnvCollision(vCastX, vCastY, tAimX, tAimY);

    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2.0;
    if (curLoSHit) {
      // Tia bị cản bởi khối đá
      ctx.strokeStyle = '#f85149';
      ctx.beginPath();
      ctx.moveTo(vCastX, vCastY);
      ctx.lineTo(curLoSHit.hitX, curLoSHit.hitY);
      ctx.stroke();

      ctx.fillStyle = '#f85149';
      ctx.beginPath();
      ctx.arc(curLoSHit.hitX, curLoSHit.hitY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 11px monospace';
      ctx.fillText('🚫 LoS BỊ CHẶN (Né Địa Hình)', curLoSHit.hitX + 8, curLoSHit.hitY - 6);
    } else {
      // Tia thông suốt quang đãng
      ctx.strokeStyle = '#3fb950';
      ctx.beginPath();
      ctx.moveTo(vCastX, vCastY);
      ctx.lineTo(tAimX, tAimY);
      ctx.stroke();

      ctx.fillStyle = '#3fb950';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('🎯 LoS QUANG ĐÃNG (Sẵn Sàng Bắn)', (vCastX + tAimX) / 2 - 40, (vCastY + tAimY) / 2 - 10);
    }
    ctx.restore();

    ctx.restore();
  }

  // 2. Aim Reticle Circle & Attacking Target Dummy (Hình Nhân Tấn Công)
  const dummyScale = (zoom / 0.7);
  const dummyH = 46 * dummyScale;

  // 2a. Reticle circle quanh mục tiêu đang nhắm của Vargost (Aoda hoặc Dummy)
  ctx.save();
  ctx.strokeStyle = '#f6ad55';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(targetX, targetY - 20 * dummyScale, 26 * dummyScale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Floating Damage Numbers (💥 -9999 CRIT! / 💨 MISSED / NÉ ĐÒN!)
  for (let i = 0; i < enemyDamageNumbers.length; i++) {
    const dmg = enemyDamageNumbers[i];
    ctx.save();
    ctx.globalAlpha = Math.max(0, dmg.alpha);
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = dmg.color || '#ff7b72';
    ctx.shadowColor = (dmg.color === '#79c0ff') ? '#388bfd' : '#ff2424';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'center';
    ctx.fillText(dmg.text, dmg.x, dmg.y);
    ctx.restore();
  }

  // Draw Hit Impact VFX (Cross Spark 4 Cánh Kim Cương & Vòng Sóng Xung Kích Shockwave)
  for (const imp of activeHitImpacts) {
    const t = 1.0 - (imp.life / imp.maxLife); // 0 -> 1
    const alpha = Math.max(0, 1.0 - t);
    const scale = (zoom / 0.7);

    ctx.save();
    ctx.translate(imp.x, imp.y);
    ctx.rotate(imp.rotation);

    // 0. Impact Flash Burst Disc (Vầng chớp trắng lóa tại tâm va chạm)
    if (t < 0.45) {
      const burstAlpha = (1.0 - t / 0.45) * alpha;
      ctx.fillStyle = `rgba(255, 255, 255, ${burstAlpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(0, 0, (20 * (t / 0.45)) * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. Shockwave bùng nở mạnh mẽ
    const waveRadius = (10 + t * 68) * scale;
    ctx.strokeStyle = `rgba(255, 235, 190, ${alpha * 0.9})`;
    ctx.lineWidth = Math.max(1.5, (4.5 - t * 3.5) * scale);
    ctx.beginPath();
    ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Cross Spark (Ngôi sao kim cương 4 cánh chữ thập nhọn khổng lồ)
    const sparkScale = (t < 0.3) ? (t / 0.3) : (1.0 - (t - 0.3) / 0.7);
    const armLenX = (75 * sparkScale) * scale;
    const armLenY = (52 * sparkScale) * scale;

    // Lớp ngoài: Ánh lửa cam rực
    ctx.fillStyle = `rgba(255, 90, 0, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(0, -armLenY * 1.15);
    ctx.quadraticCurveTo(0, 0, armLenX * 1.15, 0);
    ctx.quadraticCurveTo(0, 0, 0, armLenY * 1.15);
    ctx.quadraticCurveTo(0, 0, -armLenX * 1.15, 0);
    ctx.quadraticCurveTo(0, 0, 0, -armLenY * 1.15);
    ctx.fill();

    // Lớp giữa: Vàng sáng rực
    ctx.fillStyle = `rgba(255, 225, 80, ${alpha * 0.95})`;
    ctx.beginPath();
    ctx.moveTo(0, -armLenY);
    ctx.quadraticCurveTo(0, 0, armLenX, 0);
    ctx.quadraticCurveTo(0, 0, 0, armLenY);
    ctx.quadraticCurveTo(0, 0, -armLenX, 0);
    ctx.quadraticCurveTo(0, 0, 0, -armLenY);
    ctx.fill();

    // Lớp lõi: Trắng tinh lóa mắt
    const coreLenX = armLenX * 0.65;
    const coreLenY = armLenY * 0.65;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, -coreLenY);
    ctx.quadraticCurveTo(0, 0, coreLenX, 0);
    ctx.quadraticCurveTo(0, 0, 0, coreLenY);
    ctx.quadraticCurveTo(0, 0, -coreLenX, 0);
    ctx.quadraticCurveTo(0, 0, 0, -coreLenY);
    ctx.fill();

    // Tâm phát sáng
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 8 * sparkScale * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Dust rings on landing
  for (const d of groundDustRings) {
    ctx.strokeStyle = `rgba(214, 188, 150, ${d.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, d.radius * 2, d.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Trajectory guide line
  if (aiState.includes('WINDUP') || aiState.includes('REPOSITIONING')) {
    ctx.strokeStyle = 'rgba(237, 137, 54, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(vargostX + 20 * visualFacing, vargostY - 20);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 2c. Explosion VFX Rendering (Vẽ DƯỚI nhân vật theo Quy chuẩn Render Layering của AGENTS.md để không che khuất Hit Flash)
  if (activeExplosion && assets.explosion) {
    const exp = activeExplosion;
    const col = exp.frame % exp.cols;
    const row = Math.floor(exp.frame / exp.cols);
    const esx = col * exp.frameW;
    const esy = row * exp.frameH;

    const ew = exp.frameW * exp.scale;
    const eh = exp.frameH * exp.scale;

    if (esx + exp.frameW <= assets.explosion.width && esy + exp.frameH <= assets.explosion.height) {
      ctx.save();
      ctx.drawImage(
        assets.explosion,
        esx, esy, exp.frameW, exp.frameH,
        exp.x - ew / 2, exp.y - eh + 15,
        ew, eh
      );
      ctx.restore();
    }
  }

  // 3. Draw Motion Ghosts (Cả bay tới và bay lùi đều có bóng mờ)
  const spriteScale = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
  const anchorX = assets.manifest ? assets.manifest.anchor_px[0] : 105.0;
  const anchorY = assets.manifest ? assets.manifest.anchor_px[1] : 162.0;

  const fCol = currentFrameIndex % 10;
  const fRow = Math.floor(currentFrameIndex / 10);
  const sx = fCol * 200;
  const sy = fRow * 200;

  for (const ghost of motionGhosts) {
    ctx.save();
    ctx.globalAlpha = ghost.alpha;
    ctx.translate(ghost.x, ghost.y + hoverOffset);
    ctx.scale(currentScaleX * (ghost.facing || visualFacing), currentScaleY);
    ctx.rotate(ghost.tilt || 0);
    ctx.drawImage(
      assets.vargost,
      sx, sy, 200, 200,
      -anchorX * spriteScale, -anchorY * spriteScale,
      200 * spriteScale, 200 * spriteScale
    );
    ctx.restore();
  }

  // 4. Draw Vargost Body (Khung 200x200 với Pixel Dissolve / Dither Disintegration khi Lật Mặt)
  ctx.save();
  ctx.translate(vargostX, vargostY + hoverOffset);
  const renderFacing = visualFacing;
  ctx.scale(currentScaleX * renderFacing, currentScaleY);
  ctx.rotate(currentTilt);

  if (assets.vargost) {
    if (isDead) {
      // HOẠT ẢNH GỤC NGÃ & TỬ TRẬN (0.3s FREEZE ĐỨNG HÌNH -> EVAPORATING PIXEL DISSOLVE BỐC HƠI 30px)
      const t = deathTimer;
      if (t < 0.3) {
        // Pha 1: ĐỨNG HÌNH TRONG 0.3s (Freeze / Hit Stop) kèm Micro Tremor rung chấn tử trận
        const tremorX = (Math.random() - 0.5) * 4;
        const tremorY = (Math.random() - 0.5) * 4;
        ctx.drawImage(
          assets.vargost,
          sx, sy, 200, 200,
          -anchorX * spriteScale + tremorX, -anchorY * spriteScale + tremorY,
          200 * spriteScale, 200 * spriteScale
        );

        // Lóe sáng toàn thân trắng tinh / đỏ rực khi dính đòn chí mạng
        renderFullBodyFlash(
          ctx, sx, sy, 200, 200,
          -anchorX * spriteScale + tremorX, -anchorY * spriteScale + tremorY,
          200 * spriteScale, 200 * spriteScale,
          1.0
        );
      } else if (t < 1.9) {
        // Pha 2: TAN BIẾN DẦN PIXEL BỐC HƠI LÊN 30px VÀ MỜ DẦN (Evaporating Pixel Dissolve trong 1.6s - chậm lại 0.2s)
        const dissolveProgress = Math.min(1.0, (t - 0.3) / 1.6);
        // Xu hướng tan biến dưới dạng bốc hơi: bay dần lên tầm 30px
        const evaporateRise = -30 * Math.pow(dissolveProgress, 1.1) * (zoom / 0.7);
        const globalFadeAlpha = Math.max(0, 1.0 - dissolveProgress);

        const numSlices = 50; // 50 lát cắt pixel ngang
        const sliceH = 200 / numSlices;

        ctx.save();
        ctx.globalAlpha = globalFadeAlpha;

        for (let i = 0; i < numSlices; i++) {
          const sliceY = i * sliceH;
          // Xu hướng tan biến từ dưới chân lên trên đầu + pseudo-random hash
          const heightWeight = (numSlices - i) / numSlices;
          const sliceSeed = (i * 37 + Math.floor(hoverTimer * 30)) % 100;
          const sliceProb = (sliceSeed / 100.0) * 0.35 + heightWeight * 0.65;

          if (sliceProb < dissolveProgress * 1.15) {
            continue; // Lát cắt đã bốc hơi thành khói lửa
          }

          // Lát cắt vừa bay lên cao dần theo evaporateRise vừa trượt nhẹ
          const jitterX = Math.sin(i * 0.7 + hoverTimer * 20) * dissolveProgress * 10;
          const sliceEvaporate = evaporateRise * (1.0 + heightWeight * 0.4);

          ctx.drawImage(
            assets.vargost,
            sx, sy + sliceY, 200, sliceH,
            -anchorX * spriteScale + jitterX, (-anchorY + sliceY) * spriteScale + sliceEvaporate,
            200 * spriteScale, sliceH * spriteScale
          );
        }
        ctx.restore();

        // Sinh các luồng hạt tàn tro pixel khói lửa bốc hơi cuồn cuộn bay vút lên trời
        if (Math.random() < 0.75) {
          emberParticles.push({
            x: vargostX + (Math.random() - 0.5) * 55 * spriteScale,
            y: (vargostY + hoverOffset) + (Math.random() - 0.5) * 65 * spriteScale + evaporateRise * 0.7,
            vx: (Math.random() - 0.5) * 70,
            vy: -Math.random() * 85 - 45, // Bay vút lên trời tầm 30-50px
            size: Math.random() < 0.35 ? 4 : 2.5,
            alpha: globalFadeAlpha,
            color: Math.random() < 0.35 ? '#ffffff' : (Math.random() < 0.7 ? '#ffd166' : '#ff4500'),
            life: 0.55
          });
        }
      }
      // Pha 3 (t >= 1.9s): Đã bốc hơi hoàn toàn vào hư không
    } else if (phaseBlinkStep === 2) {
      // Pha 2: Hoàn toàn tàng hình trong hư không khi dạt vị trí -> Không vẽ thân thể
    } else if (currentDissolveFactor > 0.04) {
      // HIỆU ỨNG DỊCH CHUYỂN TỨC THỜI (PIXEL DISSOLVE & SCANLINE SLICES như samurai frame 39)
      const numSlices = 50; // 50 lát cắt pixel ngang (mỗi lát cao 4px)
      const sliceH = 4;

      for (let i = 0; i < numSlices; i++) {
        const sliceY = i * sliceH;
        // Pseudo-random hash cho từng lát cắt theo thời gian
        const sliceSeed = (i * 37 + Math.floor(hoverTimer * 35)) % 100;
        const sliceProb = sliceSeed / 100.0;

        // Bỏ qua lát cắt (tạo các rãnh khuyết pixel y hệt ảnh samurai frame 39)
        if (sliceProb < currentDissolveFactor * 0.82) {
          continue;
        }

        // Lát cắt còn lại bị trượt ngang glitch nhẹ (Teleport Jitter)
        const jitterX = Math.sin(i * 0.9 + hoverTimer * 35) * currentDissolveFactor * 16;

        ctx.drawImage(
          assets.vargost,
          sx, sy + sliceY, 200, sliceH,
          -anchorX * spriteScale + jitterX, (-anchorY + sliceY) * spriteScale,
          200 * spriteScale, sliceH * spriteScale
        );
      }

      // Glitch Flash: vẽ viền sáng/hào quang rực lửa khi chớp tắt
      if (isGlitchFlash) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.55;
        ctx.drawImage(
          assets.vargost,
          sx, sy, 200, 200,
          -anchorX * spriteScale, -anchorY * spriteScale,
          200 * spriteScale, 200 * spriteScale
        );
        ctx.restore();
      }

      // Sinh các hạt tàn tro pixel lửa (Ember Sparks)
      if (Math.random() < 0.65) {
        emberParticles.push({
          x: vargostX + (Math.random() - 0.5) * 55 * spriteScale,
          y: (vargostY + hoverOffset) + (Math.random() - 0.5) * 65 * spriteScale,
          vx: (Math.random() - 0.5) * 160 * spriteScale,
          vy: -Math.random() * 120 * spriteScale - 25,
          size: Math.random() < 0.5 ? 3 : 2,
          alpha: 1.0,
          color: Math.random() < 0.4 ? '#ff3838' : (Math.random() < 0.7 ? '#f0883e' : '#ffd166'),
          life: 0.35 + Math.random() * 0.2
        });
      }
    } else {
      // Vẽ nguyên vẹn bình thường
      ctx.drawImage(
        assets.vargost,
        sx, sy, 200, 200,
        -anchorX * spriteScale, -anchorY * spriteScale,
        200 * spriteScale, 200 * spriteScale
      );

      // HIỆU ỨNG LÓE SÁNG TOÀN THÂN NHÂN VẬT KHI TRÚNG ĐÒN (Full Body Whiteout Hit Flash)
      if (vargostHitFlash > 0) {
        const flashAlpha = Math.min(1.0, vargostHitFlash / 0.16);
        renderFullBodyFlash(
          ctx, sx, sy, 200, 200,
          -anchorX * spriteScale, -anchorY * spriteScale,
          200 * spriteScale, 200 * spriteScale,
          flashAlpha
        );
      }
    }
  }



  // Reticle circle on inspector
  if (chkInspector && chkInspector.checked) {
    const spDx = Number(numSpawnDx.value) || 20;
    const spDy = Number(numSpawnDy.value) || -20;
    const spScreenX = spDx * spriteScale;
    const spScreenY = spDy * spriteScale;

    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(spScreenX, spScreenY, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(spScreenX - 9, spScreenY);
    ctx.lineTo(spScreenX + 9, spScreenY);
    ctx.moveTo(spScreenX, spScreenY - 9);
    ctx.lineTo(spScreenX, spScreenY + 9);
    ctx.stroke();

    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  // Draw Ember Particles in World Space (Tàn tro pixel lửa)
  for (let i = 0; i < emberParticles.length; i++) {
    const ep = emberParticles[i];
    ctx.save();
    ctx.fillStyle = ep.color;
    ctx.globalAlpha = Math.max(0, ep.alpha);
    ctx.fillRect(ep.x, ep.y, ep.size, ep.size);
    ctx.restore();
  }

  // Character Status Label & Gothic Health Bar (Mẫu image copy.png, mỏng hơn 15%, cách đỉnh đầu 10px)
  const vScale = (zoom / 0.7);
  const vGothicBarH = 80 * vScale * (50 / 240) * 0.85; // Mỏng lại 15% (~14.17px)
  const vHeadTopY = (vargostY + hoverOffset) - 98 * spriteScale; // Đỉnh đầu & chóp sừng Vargost
  const vBarTopY = vHeadTopY - vGothicBarH - 10 * vScale; // Đáy ống máu cách đỉnh đầu đúng 10px
  let labelStatus = isFlying ? `Bay @ ${currentFlySpeed}px/s (Nghiêng ${(currentTilt * 180 / Math.PI).toFixed(0)}°)` : 'Đứng trên bệ đá (0°)';
  if (isDead) {
    labelStatus = (deathTimer < 0.3) ? 'GỤC NGÃ (ĐỨNG HÌNH 0.3s)' : 'BỐC HƠI PIXEL BAY LÊN 30px';
  }
  const hurtText = isDead ? ' 💀 TỬ TRẬN!' : ((vargostHitFlash > 0) ? ' ⚡ TRÚNG ĐÒN!' : '');
  const vHpLabel = `Vargost (Team 1 · Đồng Minh) ${vargostHp}/${VARGOST_MAX_HP} HP${hurtText}`;
  const vSubLabel = `(${labelStatus})`;

  if (isDead) {
    if (deathTimer < 1.9) {
      let vBarY = vBarTopY;
      let vBarAlpha = 1.0;
      let vBarDissolve = 0;
      if (deathTimer < 0.3) {
        // Pha 1: Đứng hình 0.3s (rung chấn micro-tremor tử trận)
        const tremorY = (Math.random() - 0.5) * 4;
        vBarY += tremorY;
      } else {
        // Pha 2: Tan biến dần 1.6s đồng bộ với nhân vật (0.3s -> 1.9s)
        const dissolveProgress = Math.min(1.0, (deathTimer - 0.3) / 1.6);
        const evaporateRise = -30 * Math.pow(dissolveProgress, 1.1) * (zoom / 0.7);
        vBarY += evaporateRise;
        vBarAlpha = Math.max(0, 1.0 - dissolveProgress);
        vBarDissolve = dissolveProgress;
      }
      drawGothicHealthBar(ctx, vargostX, vBarY, vargostHp, VARGOST_MAX_HP, vargostDamageGhosts, vHpLabel, vSubLabel, true, 80, 'green', vBarAlpha, vBarDissolve, vargostAntiHeal && !isDead, bossLootDrop.carrierId === 'vargost');
    }
    // Pha 3 (deathTimer >= 1.9s): Đã tan biến hoàn toàn vào hư không -> KHÔNG VẼ THANH MÁU
  } else {
    drawGothicHealthBar(ctx, vargostX, vBarTopY, vargostHp, VARGOST_MAX_HP, vargostDamageGhosts, vHpLabel, vSubLabel, vargostHitFlash > 0, 80, 'green', 1.0, 0, vargostAntiHeal && !isDead, bossLootDrop.carrierId === 'vargost');
  }

  // 4b. Enemy Counter-Attack Projectiles Rendering (Ám Tiễn Hắc Ám Quả Cầu Tím - Viền Neon Cyan)
  for (const ep of activeEnemyProjectiles) {
    ctx.save();
    ctx.translate(ep.x, ep.y);
    ctx.rotate(ep.spinAngle || 0);

    const r = ep.radius;

    // Lớp hào quang ngoài: Tím ma thuật phát sáng
    const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.5);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(179, 136, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(110, 64, 201, 0.5)');
    grad.addColorStop(1, 'rgba(0, 245, 212, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 4 Gai năng lượng ám tiễn xoay tròn chữ thập
    ctx.fillStyle = '#00f5d4';
    for (let k = 0; k < 4; k++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, 0);
      ctx.lineTo(0, r * 1.7);
      ctx.lineTo(r * 0.3, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Quả cầu lõi tím đậm
    ctx.fillStyle = '#6e40c9';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Tâm phát sáng trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 5. Projectile Rendering: Dynamic Flight & Scrubber Preview Linkage
  let renderProjX = null, renderProjY = null, renderProjSize = null, renderSpinFrame = 0;

  if (activeProjectile) {
    renderProjX = activeProjectile.x;
    renderProjY = activeProjectile.y;
    renderProjSize = activeProjectile.size;
    renderSpinFrame = activeProjectile.spinFrame;
  }
  // TIMELINE SCRUBBER CONTINUITY:
  // When user is manually scrubbing the timeline slider without playing:
  // Connect the ring continuously from Frame 68 to 74 so it never disappears!
  else if (!isPlaying) {
    if (currentFrameIndex >= 68 && currentFrameIndex <= 74) {
      const t = (currentFrameIndex - 68) / 6.0;
      const startX = vargostX + 20 * spriteScale * facingDirection;
      const startY = (vargostY + hoverOffset) - 20 * spriteScale;
      renderProjX = startX + (targetX - startX) * t;
      renderProjY = startY + (targetY - startY) * t;
      renderProjSize = 80 * spriteScale;
      renderSpinFrame = (currentFrameIndex * 2) % 8;
    }
  }

  if (renderProjX !== null && renderProjY !== null && assets.projectile) {
    const psx = renderSpinFrame * 80;
    ctx.save();
    ctx.drawImage(
      assets.projectile,
      psx, 0, 80, 80,
      renderProjX - renderProjSize / 2, renderProjY - renderProjSize / 2,
      renderProjSize, renderProjSize
    );
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 6b. VẼ CỨ ĐIỂM THÁNH KIẾM (Asset/Character/vfx/sword.mp4) TRÊN PLATFORM 2
  // -------------------------------------------------------------
  ctx.save();
  // Đã loại bỏ hoàn toàn vòng elip/quầng nền dưới chân Thánh Kiếm theo quy chuẩn đồng bộ 1:1 với APK

  // Vẽ Sprite Thánh Kiếm từ Atlas đã bóc tách từ video sword_altar (Chuẩn hóa 90px chiều cao)
  if (assets.swordObjective) {
    const totalFrames = (swordFrames && swordFrames.total_frames) || 55;
    const cols = (swordFrames && swordFrames.cols) || 8;
    const frameW = (swordFrames && swordFrames.frame_w) || 434;
    const frameH = (swordFrames && swordFrames.frame_h) || 620;
    const anchorPxX = (swordFrames && swordFrames.anchor_px && swordFrames.anchor_px[0]) || 217;
    const anchorPxY = (swordFrames && swordFrames.anchor_px && swordFrames.anchor_px[1]) || 619;

    const fIdx = swordFrameIndex % totalFrames;
    const col = fIdx % cols;
    const row = Math.floor(fIdx / cols);
    const sx = col * frameW;
    const sy = row * frameH;

    const targetSwordH = 90.0; // Chiều cao chuẩn hóa đúng 90px theo yêu cầu người dùng
    const swScale = (targetSwordH / frameH) * (zoom / 0.7);
    const drawW = frameW * swScale;
    const drawH = targetSwordH * (zoom / 0.7); // Chuẩn xác 90px
    const anchorX = anchorPxX * swScale;
    const anchorY = anchorPxY * swScale;

    ctx.save();
    ctx.translate(SWORD_X, SWORD_Y);

    ctx.drawImage(
      assets.swordObjective,
      sx, sy, frameW, frameH,
      -anchorX, -anchorY, drawW, drawH
    );
    ctx.restore();
  }

  // Thanh tiến trình chiếm giữ 20.0s trên đỉnh Thánh Kiếm
  if (swordCaptureTimer > 0 || isSwordContested) {
    const barW = 120 * (zoom / 0.7);
    const barH = 10 * (zoom / 0.7);
    const barX = SWORD_X - barW / 2;
    const barY = SWORD_Y - 148 * (zoom / 0.7); // Nâng cao 148px tránh đè lên thanh máu của nhân vật đứng ở bệ
    const progress = Math.min(1.0, swordCaptureTimer / SWORD_CAPTURE_REQUIRED);

    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 20, 0.85)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
    ctx.fillStyle = isSwordContested ? '#f0883e' : (swordControllingTeam === 1 ? '#3fb950' : '#ff5252');
    ctx.fillRect(barX, barY, barW * progress, barH);
    ctx.strokeStyle = '#d29922';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${swordCaptureTimer.toFixed(1)}s / 20.0s`, SWORD_X, barY - 5);
    ctx.restore();
  }
  ctx.restore();

  // 8. Active Tornadoes (Chiêu 1 của Aoda: Tornado 85px, bắt đầu mọc lên frame 0..3 -> tồn tại xoay lốc đỉnh cao frame 4..9 suốt 2.0s -> tan biến frame 10..14)
  if (assets.vfxTornado) {
    for (const t of activeTornadoes) {
      const col = t.frameIndex % 4;
      const row = Math.floor(t.frameIndex / 4);
      const sx = col * 700;
      const sy = row * 690;

      // Chuẩn hóa kích thước lốc xoáy: đúng 85px chiều cao theo yêu cầu người dùng
      const vfxScale = (85.0 / 690.0) * (zoom / 0.7);
      const drawW = 700 * vfxScale;
      const drawH = 690 * vfxScale; // đúng 85px!
      const anchorX = 360 * vfxScale;
      const anchorY = 640 * vfxScale;

      let animAlpha = 1.0;
      if (t.phase === 'DISSIPATE' || t.phase === 'DISSIPATING') {
        if (t.frameIndex === 13) animAlpha = 0.8;
        else if (t.frameIndex >= 14) animAlpha = 0.45;
      }

      ctx.save();
      ctx.translate(t.x, t.y);
      if (t.facing < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = animAlpha;

      // Bỏ quầng đổ bóng/vòng lửa dưới chân theo yêu cầu người dùng
      // (giữ nguyên frame xoay và quầng sáng thân)

      // Vẽ frame lốc xoáy đã khử sạch viền vuông
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(
        assets.vfxTornado,
        sx, sy, 700, 690,
        -anchorX, -anchorY,
        drawW, drawH
      );

      // Lớp hào quang phát sáng nhẹ
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = animAlpha * 0.4;
      ctx.drawImage(
        assets.vfxTornado,
        sx, sy, 700, 690,
        -anchorX, -anchorY,
        drawW, drawH
      );
      ctx.restore();

      // Sinh hạt tàn tro khói lửa khi tan biến dần
      if ((t.phase === 'DISSIPATE' || t.phase === 'DISSIPATING') && Math.random() < 0.45) {
        emberParticles.push({
          x: t.x + (Math.random() - 0.5) * 35 * (zoom / 0.7),
          y: t.y - Math.random() * 60 * (zoom / 0.7),
          vx: (Math.random() - 0.5) * 50,
          vy: -Math.random() * 60 - 20,
          size: 2.5,
          alpha: animAlpha,
          color: Math.random() < 0.5 ? '#ff4500' : '#ffd166',
          life: 0.35
        });
      }
    }
  }

  // Tornado Windup Preview (khi Aoda bắt đầu vận công tại frame 25..29): Vòng tụ lực ma pháp đỏ dưới mặt đất
  if (aodaState === 'SKILL_1_WINDUP') {
    const windupProgress = Math.min(1.0, (aodaFrameIndex - 24) / 5.0); // 0..1
    let previewX = aodaX + aodaLockedFacing * 120;
    if (!isFlying && !isDead && Math.abs(vargostX - aodaX) < 550) {
      previewX = vargostX;
    }
    const previewY = aodaY;

    ctx.save();
    ctx.translate(previewX, previewY);
    // Vòng tụ lực ma pháp đỏ mở rộng dần
    ctx.strokeStyle = `rgba(255, 60, 0, ${0.4 + 0.55 * windupProgress})`;
    ctx.lineWidth = 1.8 * (zoom / 0.7);
    ctx.beginPath();
    ctx.ellipse(0, 0, 28 * windupProgress * (zoom / 0.7), 9 * windupProgress * (zoom / 0.7), 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 60, 0, ${0.18 * windupProgress})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24 * windupProgress * (zoom / 0.7), 7 * windupProgress * (zoom / 0.7), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 11. Stun VFX quanh đầu (Procedural Stun Stars xoay tròn)
  const spriteScaleStun = (assets.manifest ? assets.manifest.display_scale : 0.872) * (zoom / 0.7);
  if (vargostStunTimer > 0) {
    drawStunStars(ctx, vargostX, (vargostY + hoverOffset) - 58 * spriteScaleStun, 24 * spriteScaleStun, 8 * spriteScaleStun);
  }

  if (aodaStunTimer > 0) {
    const aodaScaleStun = (assets.aodaManifest ? assets.aodaManifest.display_scale : 0.333) * (zoom / 0.7);
    drawStunStars(ctx, aodaX, aodaY - 55 * aodaScaleStun, 22 * aodaScaleStun, 8 * aodaScaleStun);
  }

  // 10. Aoda Character Rendering (Chiều cao chuẩn hóa: 90px, display_scale: 0.333333)
  if (assets.aodaAtlases && assets.aodaAtlases.length > 0 && assets.aodaManifest) {
    const aodaScale = (assets.aodaManifest.display_scale || (90.0 / 270.0)) * (zoom / 0.7);
    const anchorX = (assets.aodaManifest.anchor_px ? assets.aodaManifest.anchor_px[0] : 333.0) * aodaScale;
    const anchorY = (assets.aodaManifest.anchor_px ? assets.aodaManifest.anchor_px[1] : 504.0) * aodaScale;
    const frameW = 600 * aodaScale;
    const frameH = 600 * aodaScale;

    // Lấy frame data
    const safeFrameIdx = Math.max(0, Math.min(aodaFrameIndex, assets.aodaManifest.frames.length - 1));
    const fData = assets.aodaManifest.frames[safeFrameIdx];
    const atlasImg = assets.aodaAtlases[fData.atlas];

    ctx.save();
    ctx.translate(aodaX, aodaY);

    // Dynamic squash & stretch cho Nhảy Parabol & Tiếp đất
    let jumpScaleX = 1.0;
    let jumpScaleY = 1.0;
    if (aodaState === 'JUMP') {
      const jt = Math.min(1.0, aodaJumpTimer / aodaJumpDuration);
      if (jt < 0.4) {
        jumpScaleY = 1.15; // Vút lên cao kéo giãn
        jumpScaleX = 0.90;
      } else {
        jumpScaleY = 1.05;
        jumpScaleX = 0.95;
      }
    } else if (aodaState === 'LANDING') {
      jumpScaleY = 0.85; // Nhún chân tiếp đất hấp thụ lực
      jumpScaleX = 1.15;
    }

    // Horizontal pivot flip (Quy chuẩn godwar-combat-character: lật ngang qua anchor pivot)
    ctx.scale(aodaVisualFacing * jumpScaleX, jumpScaleY);

    if (atlasImg) {
      const [regX, regY, regW, regH] = fData.region;

      if (aodaIsDead) {
        // HOẠT ẢNH GỤC NGÃ & TAN BIẾN (KO Frame 47..65)
        if (aodaDeathTimer < 0.3) {
          // Micro tremor
          const trX = (Math.random() - 0.5) * 3;
          const trY = (Math.random() - 0.5) * 3;
          ctx.drawImage(
            atlasImg,
            regX, regY, regW, regH,
            -anchorX + trX, -anchorY + trY,
            frameW, frameH
          );
        } else if (aodaDeathTimer < 2.5) {
          // Pixel dissolve bốc hơi dần
          const disT = (aodaDeathTimer - 0.3) / 2.2;
          const evaporateRise = -25 * Math.pow(disT, 1.2) * (zoom / 0.7);
          ctx.globalAlpha = Math.max(0, 1.0 - disT);
          ctx.drawImage(
            atlasImg,
            regX, regY, regW, regH,
            -anchorX, -anchorY + evaporateRise,
            frameW, frameH
          );
        }
      } else {
        // Vẽ nhân vật Aoda bình thường
        ctx.drawImage(
          atlasImg,
          regX, regY, regW, regH,
          -anchorX, -anchorY,
          frameW, frameH
        );

        // Whiteout hit flash khi trúng đòn (Lóe sáng toàn thân chuẩn xác, triệt tiêu khung chữ nhật thô)
        if (aodaHitFlash > 0) {
          const aFlashAlpha = Math.min(1.0, aodaHitFlash / 0.16);
          renderFullBodyFlash(
            ctx,
            regX, regY, regW, regH,
            -anchorX, -anchorY,
            frameW, frameH,
            aFlashAlpha,
            atlasImg
          );
        }

        // Stun indicator
        if (aodaStunTimer > 0) {
          ctx.fillStyle = '#ffd166';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`⚡ ĐỊNH THÂN ${aodaStunTimer.toFixed(1)}s`, 0, -anchorY - 12);
        }
      }
    }

    ctx.restore();

    // Gothic Health Bar của Aoda (Chiều cao 90px, đỉnh đầu cách ~72px, đáy ống máu cách đỉnh đầu đúng 10px)
    const aodaBarScale = (zoom / 0.7);
    const aodaGothicBarH = 75 * aodaBarScale * (50 / 240) * 0.85;
    const aodaHeadTopY = aodaY - 72 * aodaBarScale;
    const aodaBarY = aodaHeadTopY - aodaGothicBarH - 10 * aodaBarScale;
    let aodaStatusText = '';
    if (aodaIsDead) {
      aodaStatusText = (aodaDeathTimer < 0.3) ? '💀 GỤC NGÃ' : '💨 TAN BIẾN VÀO HƯ KHÔNG';
    } else if (aodaStunTimer > 0) {
      aodaStatusText = `⚡ ĐỊNH THÂN ${aodaStunTimer.toFixed(1)}s`;
    } else if (aodaState.includes('SKILL_1')) {
      aodaStatusText = '🌪️ TORNADO';
    } else if (aodaState.includes('SKILL_2')) {
      aodaStatusText = '🔥 FIRE ORB';
    } else if (aodaState === 'JUMP') {
      aodaStatusText = '🦘 ĐANG NHẢY BẬC';
    } else if (aodaState === 'LANDING') {
      aodaStatusText = '✨ TIẾP ĐẤT';
    } else if (aodaState === 'MOVE') {
      aodaStatusText = `🏃 Chạy bộ (${aodaFacing > 0 ? 'Phải ▶' : '◀ Trái'})`;
    } else {
      aodaStatusText = '🛑 Thủ tĩnh tại mép bệ';
    }
    const aodaLabel = `Aoda 90px (Team 2 · Kẻ Địch) ${aodaHp}/${aodaMaxHp} HP`;
    const aodaSub = `(${aodaStatusText})`;
    if (!aodaIsDead || aodaDeathTimer < 2.0) {
      const aBarAlpha = aodaIsDead ? Math.max(0, 1.0 - (aodaDeathTimer - 0.3) / 1.7) : 1.0;
      // Ống máu ĐỎ RUBY phân định rõ Kẻ Địch (Team 2)
      drawGothicHealthBar(ctx, aodaX, aodaBarY, aodaHp, aodaMaxHp, aodaDamageGhosts, aodaLabel, aodaSub, aodaHitFlash > 0, 75, 'red', aBarAlpha, aodaIsDead ? (aodaDeathTimer / 2.0) : 0, aodaAntiHeal && !aodaIsDead, bossLootDrop.carrierId === 'aoda');
    }
  }

  // =============================================================
  // 12. VẼ BOSS TRUNG LẬP CRAPIT (crapit_main · 2150 HP tại (1164, 752))
  // + QUẢ CẦU NƯỚC BỌT XOAY TRÒN 30x30 + HIỆU ỨNG NỔ 40x40
  // =============================================================
  if (assets.crapitBoss) {
    const crapitScale = CRAPIT_DISPLAY_SCALE * (zoom / 0.7);
    const cAnchorX = CRAPIT_ANCHOR_PX[0] * crapitScale;
    const cAnchorY = CRAPIT_ANCHOR_PX[1] * crapitScale;
    const cFrameW = CRAPIT_FRAME_W * crapitScale;
    const cFrameH = CRAPIT_FRAME_H * crapitScale;

    const cSafeFrame = Math.max(0, Math.min(21, crapitFrameIndex));
    const cCol = cSafeFrame % 7;
    const cRow = Math.floor(cSafeFrame / 7);
    const cSx = cCol * CRAPIT_FRAME_W;
    const cSy = cRow * CRAPIT_FRAME_H;

    if (!crapitIsDead) {
      ctx.save();
      ctx.translate(crapitX, crapitY);
      ctx.scale(crapitFacing, 1);

      ctx.drawImage(
        assets.crapitBoss,
        cSx, cSy, CRAPIT_FRAME_W, CRAPIT_FRAME_H,
        -cAnchorX, -cAnchorY, cFrameW, cFrameH
      );

      // Lóe sáng toàn thân trắng tinh khi trúng đòn phản công từ Vargost hoặc Aoda
      if (crapitHitFlash > 0) {
        const cFlashAlpha = Math.min(1.0, crapitHitFlash / 0.16);
        renderFullBodyFlash(
          ctx,
          cSx, cSy, CRAPIT_FRAME_W, CRAPIT_FRAME_H,
          -cAnchorX, -cAnchorY, cFrameW, cFrameH,
          cFlashAlpha,
          assets.crapitBoss
        );
      }
      ctx.restore();
    } else if (crapitDeathTimer < 1.8) {
      // KỸ THUẬT PIXEL DISSOLVE GIỐNG TELEPORT NHƯNG MẤT DẦN TỪ DƯỚI LÊN TRÊN RỒI BAY LÊN CAO 20PX
      ctx.save();
      ctx.translate(crapitX, crapitY);
      ctx.scale(crapitFacing, 1);

      if (crapitDeathTimer < 0.2) {
        const trX = (Math.random() - 0.5) * 4;
        const trY = (Math.random() - 0.5) * 4;
        ctx.drawImage(
          assets.crapitBoss,
          cSx, cSy, CRAPIT_FRAME_W, CRAPIT_FRAME_H,
          -cAnchorX + trX, -cAnchorY + trY, cFrameW, cFrameH
        );
        renderFullBodyFlash(
          ctx,
          cSx, cSy, CRAPIT_FRAME_W, CRAPIT_FRAME_H,
          -cAnchorX + trX, -cAnchorY + trY, cFrameW, cFrameH,
          1.0,
          assets.crapitBoss
        );
      } else {
        const dissolveProgress = Math.min(1.0, (crapitDeathTimer - 0.2) / 1.6);
        // Bay lên cao chuẩn xác 20px khi tan biến
        const riseOffset = -20.0 * dissolveProgress * (zoom / 0.7);
        const globalAlpha = Math.max(0, 1.0 - dissolveProgress * 0.85);

        const numSlices = 64; // 64 lát cắt ngang (512 / 64 = 8px mỗi lát)
        const sliceH = CRAPIT_FRAME_H / numSlices;

        ctx.globalAlpha = globalAlpha;
        for (let i = 0; i < numSlices; i++) {
          const sliceY = i * sliceH;
          // Lát ở dưới cùng (i gần numSlices - 1) có bottomRatio cao -> tan biến TRƯỚC tiên!
          const bottomRatio = (i + 1) / numSlices; // 0 (đỉnh) -> 1 (đáy)
          const sliceSeed = ((i * 41 + Math.floor(hoverTimer * 35)) % 100) / 100.0;
          // Quét ngược từ dưới lên trên (bottom-to-top threshold) kèm dither kiểu teleport
          const threshold = 1.0 - dissolveProgress * 1.25;
          if (bottomRatio > threshold + (sliceSeed - 0.5) * 0.18) {
            continue; // Lát cắt phía dưới đã tan biến vào hư không
          }

          const jitterX = Math.sin(i * 0.85 + hoverTimer * 30) * dissolveProgress * 8;
          ctx.drawImage(
            assets.crapitBoss,
            cSx, cSy + sliceY, CRAPIT_FRAME_W, sliceH,
            -cAnchorX + jitterX, (-cAnchorY + sliceY * crapitScale) + riseOffset,
            cFrameW, sliceH * crapitScale
          );
        }
      }
      ctx.restore();
    }

    // Thanh máu Gothic RPG của Boss Crapit (2150 HP, đặt cách đỉnh đầu đúng 10px)
    if (!crapitIsDead || crapitDeathTimer < 1.8) {
      const cBarScale = (zoom / 0.7);
      const cBarH = 90 * cBarScale * (50 / 240) * 0.85;
      const cHeadTopY = crapitY - 95 * cBarScale;
      let cBarY = cHeadTopY - cBarH - 10 * cBarScale;
      let cBarAlpha = 1.0;
      let cBarDissolve = 0;
      if (crapitIsDead && crapitDeathTimer >= 0.2) {
        const dp = Math.min(1.0, (crapitDeathTimer - 0.2) / 1.6);
        cBarY += -20.0 * dp * cBarScale;
        cBarAlpha = Math.max(0, 1.0 - dp);
        cBarDissolve = dp;
      }
      const cStatus = crapitIsDead
        ? '💀 TAN BIẾN TỪ DƯỚI LÊN (+20px)'
        : (crapitState === 'WINDUP'
          ? '⚠️ CHUẨN BỊ PHUN NƯỚC BỌT (F5-F7)'
          : (crapitState === 'RELEASE'
            ? '💧 PHUN CẦU NƯỚC BỌT KHÓA MỤC TIÊU!'
            : `⏳ Hồi chiêu ${crapitAttackCooldown.toFixed(1)}s (Canh Thánh Kiếm)`));
      const cLabel = `👑 BOSS CRAPIT ${crapitHp}/${CRAPIT_MAX_HP} HP`;
      drawGothicHealthBar(ctx, crapitX, cBarY, crapitHp, CRAPIT_MAX_HP, crapitDamageGhosts, cLabel, `(${cStatus})`, crapitHitFlash > 0, 90, 'red', cBarAlpha, cBarDissolve, false);
    }
  }

  // Vẽ Quả Cầu Nước Bọt 30x30 (Scrapit_vfx_skill) xoay tròn + giữ nguyên hoạt ảnh gốc
  if (assets.crapitSpitOrb && activeCrapitProjectiles.length > 0) {
    for (const cp of activeCrapitProjectiles) {
      const fIdx = cp.frameIndex % cp.totalFrames;
      const col = fIdx % 12;
      const row = Math.floor(fIdx / 12);
      const sx = col * 38;
      const sy = row * 36;
      const drawSize = cp.size; // 30x30 scaled

      ctx.save();
      // Vệt nước bọt trắng nối liền từ Pin #1 sang Box #2 trong giai đoạn SLIDE_MOUTH
      if (cp.stage === 'SLIDE_MOUTH') {
        ctx.strokeStyle = 'rgba(245, 250, 255, 0.85)';
        ctx.lineWidth = 4.5 * (zoom / 0.7);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cp.pin1X, cp.pin1Y);
        ctx.lineTo(cp.x, cp.y);
        ctx.stroke();
      }

      ctx.translate(cp.x, cp.y);
      ctx.rotate(cp.spinAngle);
      ctx.drawImage(
        assets.crapitSpitOrb,
        sx, sy, 38, 36,
        -drawSize / 2, -drawSize / 2, drawSize, drawSize
      );
      ctx.restore();
    }
  }

  // Vẽ Hiệu ứng Nổ Nước Bọt 40x40 (Scrapit_animation) khi chạm mục tiêu hoặc địa hình Zone 1 / Zone 3
  if (assets.crapitSpitExplosion && activeCrapitExplosions.length > 0) {
    for (const ce of activeCrapitExplosions) {
      const fIdx = Math.min(ce.totalFrames - 1, ce.frameIndex);
      const col = fIdx % 7;
      const row = Math.floor(fIdx / 7);
      const sx = col * 40;
      const sy = row * 41;
      const drawSize = ce.size; // 40x40 scaled

      ctx.save();
      ctx.translate(ce.x, ce.y);
      ctx.drawImage(
        assets.crapitSpitExplosion,
        sx, sy, 40, 41,
        -drawSize / 2, -drawSize / 2, drawSize, drawSize
      );
      ctx.restore();
    }
  }

  // 13. Vẽ Cổ Vật Boss Rơi Trên Mặt Đất (30x30px) + Hiệu ứng Chói Lóa, Lóe Sáng
  renderBossLootDrop(ctx, dt);
}

// =============================================================
// 3v3 MULTI-CHARACTER ROSTER MANAGER (6 SLOTS) &
// 1:1 PART SLICING / RIGGING INSPECTOR FOR AGENT SPEC EXPORT
// =============================================================

const isoCanvas = document.getElementById('isolation-canvas');
const isoCtx = (isoCanvas && typeof isoCanvas.getContext === 'function') ? isoCanvas.getContext('2d', { willReadFrequently: true }) : null;
const isoTitle = document.getElementById('iso-title');
const isoMetaInfo = document.getElementById('iso-meta-info');
const isoCursorInfo = document.getElementById('iso-cursor-info');
const chkIsoGrid = document.getElementById('chk-iso-grid');
const chkIsoAnchor = document.getElementById('chk-iso-anchor');
const btnToggleIsolation = document.getElementById('btn-toggle-isolation');
const viewportSplitGrid = document.getElementById('viewport-split-grid');
const isolationDock = document.getElementById('isolation-dock');

const btnIsoZoomOut = document.getElementById('btn-iso-zoom-out');
const lblIsoZoom = document.getElementById('lbl-iso-zoom');
const btnIsoZoomIn = document.getElementById('btn-iso-zoom-in');
const btnIsoZoomReset = document.getElementById('btn-iso-zoom-reset');

let isoUserZoom = 1.0;
let isoPanX = 0;
let isoPanY = 0;
let isIsoPanning = false;
let isoPanStartX = 0;
let isoPanStartY = 0;

function setIsoZoom(newZoom) {
  isoUserZoom = Math.max(0.25, Math.min(6.0, Number(newZoom.toFixed(2))));
  if (lblIsoZoom) {
    lblIsoZoom.textContent = `${Math.round(isoUserZoom * 100)}%`;
  }
}

if (btnIsoZoomIn) {
  btnIsoZoomIn.addEventListener('click', () => {
    setIsoZoom(isoUserZoom * 1.25);
  });
}
if (btnIsoZoomOut) {
  btnIsoZoomOut.addEventListener('click', () => {
    setIsoZoom(isoUserZoom / 1.25);
  });
}
if (btnIsoZoomReset) {
  btnIsoZoomReset.addEventListener('click', () => {
    setIsoZoom(1.0);
    isoPanX = 0;
    isoPanY = 0;
  });
}
if (isoCanvas) {
  isoCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setIsoZoom(isoUserZoom * factor);
  }, { passive: false });

  isoCanvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2 || e.shiftKey || e.altKey) {
      isIsoPanning = true;
      isoPanStartX = e.clientX - isoPanX;
      isoPanStartY = e.clientY - isoPanY;
      e.preventDefault();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isIsoPanning) {
      isoPanX = e.clientX - isoPanStartX;
      isoPanY = e.clientY - isoPanStartY;
    }
  });

  window.addEventListener('mouseup', () => {
    isIsoPanning = false;
  });

  isoCanvas.addEventListener('contextmenu', (e) => {
    if (e.shiftKey || e.altKey || isoUserZoom > 1.0) {
      e.preventDefault();
    }
  });
}

const selInspectTarget = document.getElementById('sel-inspect-target');
const lblFrameMax = document.getElementById('lbl-frame-max');
const numRangeStart = document.getElementById('num-range-start');
const numRangeEnd = document.getElementById('num-range-end');
const btnSetStartCurr = document.getElementById('btn-set-start-curr');
const btnSetEndCurr = document.getElementById('btn-set-end-curr');

const btnModeBox = document.getElementById('btn-mode-box');
const btnModePin = document.getElementById('btn-mode-pin');
const btnModeRuler = document.getElementById('btn-mode-ruler');
const selPartType = document.getElementById('sel-part-type');
const selActionGoal = document.getElementById('sel-action-goal');
const inpPartNote = document.getElementById('inp-part-note');
const inspLocalXy = document.getElementById('insp-local-xy');
const inspAtlasXy = document.getElementById('insp-atlas-xy');
const inspActiveMeasure = document.getElementById('insp-active-measure');
const btnAddAnnotation = document.getElementById('btn-add-annotation');
const btnClearAnnotations = document.getElementById('btn-clear-annotations');
const annotationListEl = document.getElementById('annotation-list');
const txtAgentSpec = document.getElementById('txt-agent-spec');
const btnCopyAgentSpec = document.getElementById('btn-copy-agent-spec');
const rosterCountBadge = document.getElementById('roster-count-badge');
const btnEnableAll6 = document.getElementById('btn-enable-all-6');
const btnOnly2Main = document.getElementById('btn-only-2-main');

// State for 3v3 Roster & Part Slicing
let availableRosterNames = ['vargost', 'aoda', 'amore', 'Actem', 'agon', 'aminao', 'artemis', 'kukaomni', 'solist'];
const heightTargetsMap = new Map();
const loadedPilotProfiles = new Map(); // id -> { candidate, pages: Map<pageIdx, Image>, display_scale, target_height_px }

const POS_PRESETS = {
  plat_1_top: { x: mapX + 20 * mapScale, y: mapY + 226 * mapScale, isAir: false },
  plat_1a:    { x: mapX + 82 * mapScale, y: mapY + 260 * mapScale, isAir: false },
  plat_1b:    { x: mapX + 172 * mapScale, y: mapY + 292 * mapScale, isAir: false },
  plat_2:     { x: mapX + 208 * mapScale, y: mapY + 194 * mapScale, isAir: false },
  plat_3a:    { x: mapX + 395 * mapScale, y: mapY + 100 * mapScale, isAir: false },
  plat_3b:    { x: mapX + 455 * mapScale, y: mapY + 130 * mapScale, isAir: false },
  plat_3c:    { x: mapX + 498 * mapScale, y: mapY + 164 * mapScale, isAir: false },
  plat_3d:    { x: mapX + 316 * mapScale, y: mapY + 286 * mapScale, isAir: false },
  sky_left:   { x: TEAM_SPAWN_ZONES.left.airX, y: TEAM_SPAWN_ZONES.left.airY, isAir: true },
  sky_right:  { x: TEAM_SPAWN_ZONES.right.airX, y: TEAM_SPAWN_ZONES.right.airY, isAir: true }
};

const slotConfigs = {
  slot_1: { slotNum: 1, team: 1, charId: 'vargost', enabled: true, facing: 1, frameIdx: 0, accum: 0, posKey: 'sky_left' },
  slot_2: { slotNum: 2, team: 1, charId: 'amore',   enabled: false, facing: 1, frameIdx: 0, accum: 0, posKey: 'plat_1a' },
  slot_3: { slotNum: 3, team: 1, charId: 'Actem',   enabled: false, facing: 1, frameIdx: 0, accum: 0, posKey: 'plat_1_top' },
  slot_4: { slotNum: 4, team: 2, charId: 'aoda',    enabled: true, facing: -1, frameIdx: 0, accum: 0, posKey: 'plat_3a' },
  slot_5: { slotNum: 5, team: 2, charId: 'agon',    enabled: false, facing: -1, frameIdx: 0, accum: 0, posKey: 'plat_3b' },
  slot_6: { slotNum: 6, team: 2, charId: 'artemis', enabled: false, facing: -1, frameIdx: 0, accum: 0, posKey: 'sky_right' }
};

let focusedSlotKey = 'slot_1';
let activeToolMode = 'BOX'; // 'BOX' | 'PIN' | 'RULER' | 'SPAWN'
let isDraggingTool = false;
let dragStartLocal = null;
let currentDraftMeasurement = null; // { type: 'BOX'|'PIN'|'RULER', x, y, w, h, x2, y2, dx, dy, dist, angleDeg, dxFromAnchor, dyFromAnchor }
const savedAnnotations = [];

async function loadPilotCharacterProfile(charId) {
  if (!charId || charId === 'vargost' || charId === 'aoda') return null;
  if (loadedPilotProfiles.has(charId)) return loadedPilotProfiles.get(charId);

  const root = `/Asset/Character/measured_atlas_pilots/${encodeURIComponent(charId)}`;
  try {
    const res = await fetch(`${root}/candidate.json`, { cache: 'no-store' });
    if (!res.ok) return null;
    const raw = await res.json();
    const sourceId = ({ crapit_main: 'crapit', crapit_secondary: 'crapit', moxie_repaired: 'moxie' })[charId] || charId;
    const targetEntry = heightTargetsMap.get(sourceId);
    const targetH = (charId === 'crapit_secondary' ? targetEntry?.parts?.[1]?.target_height_px : targetEntry?.target_height_px)
      || raw.target_height_px || 90;
    const refH = Number(raw.reference_height_px) || 200;
    const displayScale = targetH / refH;

    const record = {
      id: charId,
      root,
      raw,
      frames: raw.frames || [],
      frame_size: raw.frame_size || [200, 200],
      anchor_px: raw.anchor_px || [100, 160],
      target_height_px: targetH,
      reference_height_px: refH,
      display_scale: displayScale,
      pages: new Map()
    };
    loadedPilotProfiles.set(charId, record);
    requestPilotAtlasPage(record, 0);
    return record;
  } catch (e) {
    console.warn('Could not load pilot character:', charId, e);
    return null;
  }
}

function requestPilotAtlasPage(record, pageIdx) {
  if (!record || record.pages.has(pageIdx)) return;
  const entry = { image: null };
  record.pages.set(pageIdx, entry);
  const url = `${record.root}/atlas_${String(pageIdx).padStart(3, '0')}.png`;
  loadImage(url).then((img) => {
    entry.image = img;
  }).catch(() => {
    record.pages.delete(pageIdx);
  });
}

async function initRosterAndInspector() {
  try {
    const [pilotsRes, targetsRes] = await Promise.all([
      fetch('/api/measured-atlases').catch(() => null),
      fetch('/Asset/Character/characters/height-targets.json').catch(() => null)
    ]);
    if (targetsRes && targetsRes.ok) {
      const tJson = await targetsRes.json();
      if (tJson && Array.isArray(tJson.assets)) {
        for (const item of tJson.assets) heightTargetsMap.set(item.id, item);
      }
    }
    if (pilotsRes && pilotsRes.ok) {
      const names = await pilotsRes.json();
      if (Array.isArray(names) && names.length > 0) {
        const merged = new Set(['vargost', 'aoda', ...names]);
        availableRosterNames = Array.from(merged).sort((a, b) => {
          if (a === 'vargost') return -1;
          if (b === 'vargost') return 1;
          if (a === 'aoda') return -1;
          if (b === 'aoda') return 1;
          return a.localeCompare(b);
        });
      }
    }
  } catch (e) {
    console.warn('Roster fetch fallback:', e);
  }

  if (rosterCountBadge) {
    rosterCountBadge.textContent = `${availableRosterNames.length} Tướng`;
  }

  // Populate 6 slot dropdowns
  for (let s = 1; s <= 6; s++) {
    const key = `slot_${s}`;
    const cfg = slotConfigs[key];
    const selEl = document.getElementById(`sel-slot-${s}`);
    const chkEl = document.getElementById(`chk-slot-${s}`);
    const posEl = document.getElementById(`pos-slot-${s}`);
    const flipBtn = document.getElementById(`btn-flip-slot-${s}`);
    const inspBtn = document.getElementById(`btn-inspect-slot-${s}`);

    if (selEl && typeof selEl.replaceChildren === 'function' && typeof Option === 'function') {
      selEl.replaceChildren(...availableRosterNames.map(name => {
        const label = name === 'vargost' ? '★ vargost (Bay · 83f)'
          : name === 'aoda' ? '★ aoda (Đất · 93f)'
          : name;
        return new Option(label, name);
      }));
      if (availableRosterNames.includes(cfg.charId)) {
        selEl.value = cfg.charId;
      }
      selEl.addEventListener('change', async () => {
        cfg.charId = selEl.value;
        cfg.frameIdx = 0;
        cfg.accum = 0;
        await loadPilotCharacterProfile(cfg.charId);
        updateInspectDropdownLabels();
        if (focusedSlotKey === key) setFocusedInspectSlot(key);
      });
    }

    if (chkEl) {
      chkEl.checked = cfg.enabled;
      chkEl.addEventListener('change', () => {
        cfg.enabled = chkEl.checked;
        if (cfg.enabled) loadPilotCharacterProfile(cfg.charId);
      });
    }

    if (posEl) {
      posEl.value = cfg.posKey;
      posEl.addEventListener('change', () => {
        cfg.posKey = posEl.value;
      });
    }

    if (flipBtn) {
      flipBtn.addEventListener('click', () => {
        cfg.facing = -cfg.facing;
      });
    }

    if (inspBtn) {
      inspBtn.addEventListener('click', () => {
        setFocusedInspectSlot(key);
        if (isolationDock && !isolationDock.classList.contains('active')) {
          toggleIsolationDock(true);
        }
      });
    }
  }

  // Preload default extra slot characters
  for (let s = 2; s <= 6; s++) {
    if (s !== 4) loadPilotCharacterProfile(slotConfigs[`slot_${s}`].charId);
  }

  updateInspectDropdownLabels();
  setFocusedInspectSlot('slot_1');
  refreshAgentSpecOutput();
}

function updateInspectDropdownLabels() {
  if (!selInspectTarget || typeof selInspectTarget.querySelector !== 'function') return;
  for (let s = 1; s <= 6; s++) {
    const key = `slot_${s}`;
    const cfg = slotConfigs[key];
    const opt = selInspectTarget.querySelector(`option[value="${key}"]`);
    if (opt) {
      opt.textContent = `Slot #${s} (Đội ${cfg.team}): ${cfg.charId}`;
    }
  }
}

function getSlotSpriteInfo(slotKey) {
  const cfg = slotConfigs[slotKey] || slotConfigs.slot_1;
  const charId = cfg.charId;

  // Case 1: Vargost
  if (charId === 'vargost' && assets.vargost && assets.manifest) {
    const totalFrames = 83;
    const fIdx = (slotKey === 'slot_1') ? currentFrameIndex : (cfg.frameIdx % totalFrames);
    const fCol = fIdx % 10;
    const fRow = Math.floor(fIdx / 10);
    const sx = fCol * 200;
    const sy = fRow * 200;
    const anchor = assets.manifest.anchor_px || [105, 162];
    const spriteScale = (assets.manifest.display_scale || 0.872) * (zoom / 0.7);
    const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;
    const worldX = (slotKey === 'slot_1') ? vargostX : (POS_PRESETS[cfg.posKey]?.x || 600);
    const worldY = (slotKey === 'slot_1') ? (vargostY + hoverOffset) : (POS_PRESETS[cfg.posKey]?.y || 500);
    return {
      charId: 'vargost',
      slotKey,
      team: cfg.team,
      frameIndex: fIdx,
      totalFrames,
      atlasIndex: 0,
      image: assets.vargost,
      region: [sx, sy, 200, 200],
      frameW: 200,
      frameH: 200,
      anchorX: anchor[0],
      anchorY: anchor[1],
      targetHeightPx: assets.manifest.target_height_px || 105,
      displayScale: assets.manifest.display_scale || 0.872,
      worldScale: spriteScale,
      worldX,
      worldY,
      facing: (slotKey === 'slot_1') ? facingDirection : cfg.facing
    };
  }

  // Case 2: Aoda
  if (charId === 'aoda' && assets.aodaManifest && assets.aodaAtlases) {
    const totalFrames = assets.aodaManifest.frames.length || 93;
    const fIdx = (slotKey === 'slot_4') ? aodaFrameIndex : (cfg.frameIdx % totalFrames);
    const safeIdx = Math.max(0, Math.min(fIdx, totalFrames - 1));
    const fData = assets.aodaManifest.frames[safeIdx];
    const atlasImg = assets.aodaAtlases[fData.atlas];
    const anchor = assets.aodaManifest.anchor_px || [333, 504];
    const dispScale = assets.aodaManifest.display_scale || (90.0 / 270.0);
    const spriteScale = dispScale * (zoom / 0.7);
    const worldX = (slotKey === 'slot_4') ? aodaX : (POS_PRESETS[cfg.posKey]?.x || 600);
    const worldY = (slotKey === 'slot_4') ? aodaY : (POS_PRESETS[cfg.posKey]?.y || 500);
    return {
      charId: 'aoda',
      slotKey,
      team: cfg.team,
      frameIndex: safeIdx,
      totalFrames,
      atlasIndex: fData.atlas,
      image: atlasImg,
      region: fData.region || [0, 0, 600, 600],
      frameW: fData.region ? fData.region[2] : 600,
      frameH: fData.region ? fData.region[3] : 600,
      anchorX: anchor[0],
      anchorY: anchor[1],
      targetHeightPx: 90,
      displayScale: dispScale,
      worldScale: spriteScale,
      worldX,
      worldY,
      facing: (slotKey === 'slot_4') ? aodaFacing : cfg.facing
    };
  }

  // Case 2b: Boss Crapit (crapit_main / crapit_boss)
  if ((charId === 'crapit_main' || charId === 'crapit_boss') && assets.crapitBoss) {
    const totalFrames = 22; // 0..21
    const fIdx = (cfg.frameIdx !== undefined ? cfg.frameIdx : crapitFrameIndex) % totalFrames;
    const safeIdx = Math.max(0, Math.min(fIdx, totalFrames - 1));
    const fCol = safeIdx % 7;
    const fRow = Math.floor(safeIdx / 7);
    const sx = fCol * 282;
    const sy = fRow * 512;
    const anchor = assets.crapitManifest?.anchor_px || [148, 332];
    const dispScale = assets.crapitManifest?.display_scale || 0.5682;
    const spriteScale = dispScale * (zoom / 0.7);
    return {
      charId,
      slotKey,
      team: cfg.team,
      frameIndex: safeIdx,
      totalFrames,
      atlasIndex: 0,
      image: assets.crapitBoss,
      region: [sx, sy, 282, 512],
      frameW: 282,
      frameH: 512,
      anchorX: anchor[0],
      anchorY: anchor[1],
      targetHeightPx: 100,
      displayScale: dispScale,
      worldScale: spriteScale,
      worldX: crapitX,
      worldY: crapitY,
      facing: crapitFacing
    };
  }

  // Case 3: Any of the 50+ Pilot Characters
  const pilot = loadedPilotProfiles.get(charId);
  if (pilot && pilot.frames.length > 0) {
    const totalFrames = pilot.frames.length;
    const fIdx = Math.max(0, Math.min(cfg.frameIdx % totalFrames, totalFrames - 1));
    const fData = pilot.frames[fIdx];
    requestPilotAtlasPage(pilot, fData.atlas);
    const pageEntry = pilot.pages.get(fData.atlas);
    const [rx, ry, rw, rh] = fData.region;
    const preset = POS_PRESETS[cfg.posKey] || POS_PRESETS.plat_2;
    const spriteScale = pilot.display_scale * (zoom / 0.7);
    return {
      charId,
      slotKey,
      team: cfg.team,
      frameIndex: fIdx,
      totalFrames,
      atlasIndex: fData.atlas,
      image: pageEntry ? pageEntry.image : null,
      region: [rx, ry, rw, rh],
      frameW: rw,
      frameH: rh,
      anchorX: pilot.anchor_px[0],
      anchorY: pilot.anchor_px[1],
      targetHeightPx: pilot.target_height_px,
      displayScale: pilot.display_scale,
      worldScale: spriteScale,
      worldX: preset.x,
      worldY: preset.y,
      facing: cfg.facing
    };
  }

  return null;
}

function setFocusedInspectSlot(slotKey) {
  focusedSlotKey = slotKey;
  if (selInspectTarget) selInspectTarget.value = slotKey;
  for (let s = 1; s <= 6; s++) {
    const card = document.getElementById(`slot-card-${s}`);
    if (card && card.classList && typeof card.classList.toggle === 'function') {
      card.classList.toggle('focused-inspect', `slot_${s}` === slotKey);
    }
  }
  const info = getSlotSpriteInfo(slotKey);
  if (info) {
    const maxIdx = Math.max(0, info.totalFrames - 1);
    if (rngFrame) rngFrame.max = String(maxIdx);
    if (lblFrameMax) lblFrameMax.textContent = String(maxIdx);
    if (lblFrameNum) lblFrameNum.textContent = String(info.frameIndex);
    if (rngFrame) rngFrame.value = String(info.frameIndex);
    if (numRangeEnd && Number(numRangeEnd.value) > maxIdx) {
      numRangeEnd.value = String(maxIdx);
    }
  }
  refreshAgentSpecOutput();
}

if (selInspectTarget) {
  selInspectTarget.addEventListener('change', () => {
    setFocusedInspectSlot(selInspectTarget.value);
  });
}

function setFocusedSlotFrame(f) {
  isPlaying = false;
  if (btnPlayPause) btnPlayPause.textContent = '▶ Tiếp tục';
  const info = getSlotSpriteInfo(focusedSlotKey);
  const maxIdx = info ? Math.max(0, info.totalFrames - 1) : MAX_FRAME_INDEX;
  const clamped = Math.max(0, Math.min(maxIdx, f));

  const cfg = slotConfigs[focusedSlotKey];
  if (cfg) cfg.frameIdx = clamped;

  if (focusedSlotKey === 'slot_1' && cfg?.charId === 'vargost') {
    currentFrameIndex = clamped;
  } else if (focusedSlotKey === 'slot_4' && cfg?.charId === 'aoda') {
    aodaFrameIndex = clamped;
  }

  if (rngFrame) {
    rngFrame.max = String(maxIdx);
    rngFrame.value = String(clamped);
  }
  if (lblFrameNum) lblFrameNum.textContent = String(clamped);
  if (lblFrameMax) lblFrameMax.textContent = String(maxIdx);
  if (hudFrame) hudFrame.textContent = `Frame: ${clamped}/${maxIdx}`;
  refreshAgentSpecOutput();
}

// Override timeline controls to support any focused character slot
if (rngFrame) {
  rngFrame.addEventListener('input', () => {
    setFocusedSlotFrame(Number(rngFrame.value));
  });
}
if (btnFrameFirst) btnFrameFirst.addEventListener('click', () => setFocusedSlotFrame(0));
if (btnFramePrev) {
  btnFramePrev.addEventListener('click', () => {
    const info = getSlotSpriteInfo(focusedSlotKey);
    setFocusedSlotFrame((info ? info.frameIndex : currentFrameIndex) - 1);
  });
}
if (btnFrameNext) {
  btnFrameNext.addEventListener('click', () => {
    const info = getSlotSpriteInfo(focusedSlotKey);
    setFocusedSlotFrame((info ? info.frameIndex : currentFrameIndex) + 1);
  });
}
if (btnFrameLast) {
  btnFrameLast.addEventListener('click', () => {
    const info = getSlotSpriteInfo(focusedSlotKey);
    setFocusedSlotFrame(info ? info.totalFrames - 1 : MAX_FRAME_INDEX);
  });
}

if (btnSetStartCurr) {
  btnSetStartCurr.addEventListener('click', () => {
    const info = getSlotSpriteInfo(focusedSlotKey);
    if (numRangeStart && info) {
      numRangeStart.value = String(info.frameIndex);
      refreshAgentSpecOutput();
    }
  });
}
if (btnSetEndCurr) {
  btnSetEndCurr.addEventListener('click', () => {
    const info = getSlotSpriteInfo(focusedSlotKey);
    if (numRangeEnd && info) {
      numRangeEnd.value = String(info.frameIndex);
      refreshAgentSpecOutput();
    }
  });
}

if (btnEnableAll6) {
  btnEnableAll6.addEventListener('click', () => {
    for (let s = 1; s <= 6; s++) {
      const cfg = slotConfigs[`slot_${s}`];
      cfg.enabled = true;
      const chk = document.getElementById(`chk-slot-${s}`);
      if (chk) chk.checked = true;
      loadPilotCharacterProfile(cfg.charId);
    }
    showToast('⚡ Đã bật đủ 6 nhân vật (3v3) trên bản đồ!');
  });
}

if (btnOnly2Main) {
  btnOnly2Main.addEventListener('click', () => {
    for (let s = 1; s <= 6; s++) {
      const isMain = (s === 1 || s === 4);
      const cfg = slotConfigs[`slot_${s}`];
      cfg.enabled = isMain;
      const chk = document.getElementById(`chk-slot-${s}`);
      if (chk) chk.checked = isMain;
    }
    showToast('🎯 Đã thu gọn về 2 tướng chính (#1 vs #4)!');
  });
}

function toggleIsolationDock(forceState) {
  if (!isolationDock || !viewportSplitGrid) return;
  const nextState = typeof forceState === 'boolean' ? forceState : !isolationDock.classList.contains('active');
  isolationDock.classList.toggle('active', nextState);
  viewportSplitGrid.classList.toggle('with-isolation', nextState);
  if (btnToggleIsolation) {
    btnToggleIsolation.textContent = nextState ? '🖼️ Tách Khung 1:1: BẬT' : '🖼️ Tách Khung 1:1: TẮT';
  }
}

if (btnToggleIsolation) {
  btnToggleIsolation.addEventListener('click', () => toggleIsolationDock());
}

// Tool Mode Switching
function setInspectorToolMode(mode) {
  activeToolMode = mode;
  isPickingSpawn = (mode === 'SPAWN');
  if (btnModeBox) btnModeBox.classList.toggle('active', mode === 'BOX');
  if (btnModePin) btnModePin.classList.toggle('active', mode === 'PIN');
  if (btnModeRuler) btnModeRuler.classList.toggle('active', mode === 'RULER');
  if (btnPickSpawn) btnPickSpawn.classList.toggle('active', mode === 'SPAWN');
}

if (btnModeBox) btnModeBox.addEventListener('click', () => setInspectorToolMode('BOX'));
if (btnModePin) btnModePin.addEventListener('click', () => setInspectorToolMode('PIN'));
if (btnModeRuler) btnModeRuler.addEventListener('click', () => setInspectorToolMode('RULER'));
if (btnPickSpawn) btnPickSpawn.addEventListener('click', () => setInspectorToolMode('SPAWN'));

// Update & Draw Extra Slots (Slots 2, 3, 5, 6 and custom characters on Slot 1 or 4)
function updateAndDrawMultiSlots(dt) {
  const rate = Number(selRate ? selRate.value : 1) || 1;
  for (let s = 1; s <= 6; s++) {
    const key = `slot_${s}`;
    const cfg = slotConfigs[key];
    if (!cfg || !cfg.enabled) continue;

    // Skip default Vargost on slot_1 and default Aoda on slot_4 because drawScene already rendered them
    if (key === 'slot_1' && cfg.charId === 'vargost') continue;
    if (key === 'slot_4' && cfg.charId === 'aoda') continue;

    const info = getSlotSpriteInfo(key);
    if (!info) continue;

    // Advance animation frame if playing
    if (isPlaying && info.totalFrames > 1) {
      const pilot = loadedPilotProfiles.get(cfg.charId);
      const frameDurSec = ((pilot?.frames?.[cfg.frameIdx]?.duration_ms) || 70) / 1000.0;
      cfg.accum += dt * rate;
      if (cfg.accum >= frameDurSec) {
        cfg.accum -= frameDurSec;
        cfg.frameIdx = (cfg.frameIdx + 1) % info.totalFrames;
      }
      // Preload next 2 atlas pages
      if (pilot) {
        const next1 = pilot.frames[(cfg.frameIdx + 1) % info.totalFrames]?.atlas;
        if (next1 !== undefined) requestPilotAtlasPage(pilot, next1);
      }
    }

    if (info.image) {
      const [rx, ry, rw, rh] = info.region;
      const drawW = rw * info.worldScale;
      const drawH = rh * info.worldScale;
      const ancX = info.anchorX * info.worldScale;
      const ancY = info.anchorY * info.worldScale;

      ctx.save();
      ctx.translate(info.worldX, info.worldY);
      ctx.scale(info.facing, 1);
      ctx.drawImage(info.image, rx, ry, rw, rh, -ancX, -ancY, drawW, drawH);
      ctx.restore();

      // Draw Gothic Health Bar above extra slot character
      const barScale = (zoom / 0.7);
      const barH = 75 * barScale * (50 / 240) * 0.85;
      const headTopY = info.worldY - (info.targetHeightPx * 0.82) * barScale;
      const barY = headTopY - barH - 10 * barScale;
      const barTheme = cfg.team === 1 ? 'green' : 'red';
      const label = `#${s} ${cfg.charId} (${info.targetHeightPx}px · Team ${cfg.team})`;
      const sub = `(Frame ${info.frameIndex}/${info.totalFrames - 1})`;
      drawGothicHealthBar(ctx, info.worldX, barY, 100, 100, [], label, sub, false, 75, barTheme, 1.0, 0);
    }
  }
}

// Convert Isolation Canvas mouse event to unscaled local frame pixel (0..frameW, 0..frameH)
function isoEventToLocalPx(e, info) {
  if (!isoCanvas || !info) return { x: 0, y: 0 };
  const rect = isoCanvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (isoCanvas.width / rect.width);
  const cy = (e.clientY - rect.top) * (isoCanvas.height / rect.height);

  const pad = 16;
  const availW = isoCanvas.width - pad * 2;
  const availH = isoCanvas.height - pad * 2;
  const baseScale = Math.min(availW / info.frameW, availH / info.frameH);
  const fitScale = baseScale * (isoUserZoom || 1.0);
  const drawW = info.frameW * fitScale;
  const drawH = info.frameH * fitScale;
  const offX = (isoCanvas.width - drawW) / 2 + (isoPanX || 0);
  const offY = (isoCanvas.height - drawH) / 2 + (isoPanY || 0);

  const lx = Math.max(0, Math.min(info.frameW, Math.round((cx - offX) / fitScale)));
  const ly = Math.max(0, Math.min(info.frameH, Math.round((cy - offY) / fitScale)));
  return { x: lx, y: ly };
}

// Convert Stage Canvas mouse event to focused character's unscaled local frame pixel
function stageEventToLocalPx(e, info) {
  if (!stageCanvas || !info) return { x: 0, y: 0 };
  const rect = stageCanvas.getBoundingClientRect();
  const sx = (e.clientX - rect.left) * (stageCanvas.width / rect.width);
  const sy = (e.clientY - rect.top) * (stageCanvas.height / rect.height);

  const dxWorld = (sx - info.worldX) * (info.facing >= 0 ? 1 : -1);
  const dyWorld = (sy - info.worldY);
  const lx = Math.max(0, Math.min(info.frameW, Math.round(info.anchorX + dxWorld / info.worldScale)));
  const ly = Math.max(0, Math.min(info.frameH, Math.round(info.anchorY + dyWorld / info.worldScale)));
  return { x: lx, y: ly };
}

function handleMeasurePointerDown(localPt, info) {
  if (!info) return;
  isDraggingTool = true;
  dragStartLocal = localPt;

  const dxAnc = Math.round(localPt.x - info.anchorX);
  const dyAnc = Math.round(localPt.y - info.anchorY);

  if (activeToolMode === 'SPAWN') {
    if (numSpawnDx) numSpawnDx.value = String(dxAnc);
    if (numSpawnDy) numSpawnDy.value = String(dyAnc);
    updateCurrentSpawnDisplay();
    showToast(`🎯 Đã gán điểm phóng đạn: dx=${dxAnc}, dy=${dyAnc}`);
    refreshAgentSpecOutput();
    return;
  }

  if (activeToolMode === 'PIN') {
    currentDraftMeasurement = {
      type: 'PIN',
      x: localPt.x,
      y: localPt.y,
      dxFromAnchor: dxAnc,
      dyFromAnchor: dyAnc
    };
  } else if (activeToolMode === 'RULER') {
    currentDraftMeasurement = {
      type: 'RULER',
      x: localPt.x,
      y: localPt.y,
      x2: localPt.x,
      y2: localPt.y,
      dx: 0,
      dy: 0,
      dist: 0,
      angleDeg: 0,
      dxFromAnchor: dxAnc,
      dyFromAnchor: dyAnc
    };
  } else {
    currentDraftMeasurement = {
      type: 'BOX',
      x: localPt.x,
      y: localPt.y,
      w: 1,
      h: 1,
      dxFromAnchor: dxAnc,
      dyFromAnchor: dyAnc
    };
  }
  updateDraftMeasureUI(info);
}

function handleMeasurePointerMove(localPt, info) {
  if (!info) return;
  const dxAnc = Math.round(localPt.x - info.anchorX);
  const dyAnc = Math.round(localPt.y - info.anchorY);
  const atlasPxX = info.region[0] + localPt.x;
  const atlasPxY = info.region[1] + localPt.y;

  if (inspLocalXy) inspLocalXy.textContent = `x: ${localPt.x}, y: ${localPt.y}`;
  if (inspAtlasXy) inspAtlasXy.textContent = `ax: ${atlasPxX}, ay: ${atlasPxY}`;
  if (inspAnchorDxy) inspAnchorDxy.textContent = `dx: ${dxAnc >= 0 ? '+' : ''}${dxAnc}, dy: ${dyAnc >= 0 ? '+' : ''}${dyAnc}`;
  if (isoCursorInfo) isoCursorInfo.textContent = `Frame(${localPt.x}, ${localPt.y}) · Neo(${dxAnc >= 0 ? '+' : ''}${dxAnc}, ${dyAnc >= 0 ? '+' : ''}${dyAnc})`;

  if (!isDraggingTool || !dragStartLocal || !currentDraftMeasurement) return;

  if (currentDraftMeasurement.type === 'BOX') {
    const x1 = Math.min(dragStartLocal.x, localPt.x);
    const y1 = Math.min(dragStartLocal.y, localPt.y);
    const w = Math.max(1, Math.abs(localPt.x - dragStartLocal.x));
    const h = Math.max(1, Math.abs(localPt.y - dragStartLocal.y));
    currentDraftMeasurement.x = x1;
    currentDraftMeasurement.y = y1;
    currentDraftMeasurement.w = w;
    currentDraftMeasurement.h = h;
    currentDraftMeasurement.dxFromAnchor = Math.round(x1 - info.anchorX);
    currentDraftMeasurement.dyFromAnchor = Math.round(y1 - info.anchorY);
  } else if (currentDraftMeasurement.type === 'RULER') {
    const dx = localPt.x - dragStartLocal.x;
    const dy = localPt.y - dragStartLocal.y;
    currentDraftMeasurement.x2 = localPt.x;
    currentDraftMeasurement.y2 = localPt.y;
    currentDraftMeasurement.dx = dx;
    currentDraftMeasurement.dy = dy;
    currentDraftMeasurement.dist = Number(Math.hypot(dx, dy).toFixed(1));
    currentDraftMeasurement.angleDeg = Number((Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1));
  } else if (currentDraftMeasurement.type === 'PIN') {
    currentDraftMeasurement.x = localPt.x;
    currentDraftMeasurement.y = localPt.y;
    currentDraftMeasurement.dxFromAnchor = dxAnc;
    currentDraftMeasurement.dyFromAnchor = dyAnc;
  }
  updateDraftMeasureUI(info);
}

function handleMeasurePointerUp(info) {
  if (!isDraggingTool) return;
  isDraggingTool = false;
  updateDraftMeasureUI(info);
  refreshAgentSpecOutput();
}

function updateDraftMeasureUI(info) {
  if (!inspActiveMeasure || !currentDraftMeasurement || !info) return;
  const m = currentDraftMeasurement;
  const partName = selPartType ? selPartType.value : 'part';
  if (m.type === 'BOX') {
    const ax = info.region[0] + m.x;
    const ay = info.region[1] + m.y;
    inspActiveMeasure.innerHTML = `<b style="color:#58a6ff;">[VÙNG ${partName}]</b> Frame Rect: <code>[${m.x}, ${m.y}, ${m.w}, ${m.h}]</code> · Atlas Rect: <code>[${ax}, ${ay}, ${m.w}, ${m.h}]</code> · Neo: <code>(${m.dxFromAnchor}, ${m.dyFromAnchor})</code>`;
  } else if (m.type === 'PIN') {
    const ax = info.region[0] + m.x;
    const ay = info.region[1] + m.y;
    inspActiveMeasure.innerHTML = `<b style="color:#f0883e;">[KHỚP ${partName}]</b> Frame: <code>(${m.x}, ${m.y})</code> · Atlas: <code>(${ax}, ${ay})</code> · So với Neo: <code>(${m.dxFromAnchor}, ${m.dyFromAnchor})</code>`;
  } else if (m.type === 'RULER') {
    inspActiveMeasure.innerHTML = `<b style="color:#7ee787;">[THƯỚC ĐO]</b> Từ <code>(${m.x},${m.y})</code> ➔ <code>(${m.x2},${m.y2})</code> · Vector: <code>dx=${m.dx}, dy=${m.dy}</code> · Dài: <code>${m.dist}px</code> (${m.angleDeg}°)`;
  }
}

if (isoCanvas) {
  isoCanvas.addEventListener('mousedown', (e) => {
    const info = getSlotSpriteInfo(focusedSlotKey);
    handleMeasurePointerDown(isoEventToLocalPx(e, info), info);
  });
  isoCanvas.addEventListener('mousemove', (e) => {
    const info = getSlotSpriteInfo(focusedSlotKey);
    handleMeasurePointerMove(isoEventToLocalPx(e, info), info);
  });
  window.addEventListener('mouseup', () => {
    const info = getSlotSpriteInfo(focusedSlotKey);
    handleMeasurePointerUp(info);
  });
}

stageCanvas.addEventListener('mousedown', (e) => {
  const info = getSlotSpriteInfo(focusedSlotKey);
  handleMeasurePointerDown(stageEventToLocalPx(e, info), info);
});
stageCanvas.addEventListener('mousemove', (e) => {
  const info = getSlotSpriteInfo(focusedSlotKey);
  handleMeasurePointerMove(stageEventToLocalPx(e, info), info);
});

// Save Annotation to List
function addCurrentAnnotation() {
  const info = getSlotSpriteInfo(focusedSlotKey);
  if (!info || !currentDraftMeasurement) {
    showToast('⚠️ Hãy kéo chọn vùng hoặc chấm điểm khớp trên Khung 1:1 trước!');
    return;
  }
  const m = currentDraftMeasurement;
  const partTag = selPartType ? selPartType.value : 'part';
  const actionGoal = selActionGoal ? selActionGoal.value : 'walk_run';
  const note = inpPartNote ? inpPartNote.value.trim() : '';
  const fStart = numRangeStart ? Number(numRangeStart.value) : info.frameIndex;
  const fEnd = numRangeEnd ? Number(numRangeEnd.value) : info.frameIndex;

  const entry = {
    id: `ann_${Date.now()}_${savedAnnotations.length + 1}`,
    character: info.charId,
    slot: focusedSlotKey,
    part_tag: partTag,
    action_goal: actionGoal,
    tool_type: m.type,
    reference_frame: info.frameIndex,
    frame_range: [fStart, fEnd],
    atlas_index: info.atlasIndex,
    frame_size: [info.frameW, info.frameH],
    anchor_px: [Number(info.anchorX.toFixed(1)), Number(info.anchorY.toFixed(1))],
    local_rect_px: m.type === 'BOX' ? [m.x, m.y, m.w, m.h] : undefined,
    atlas_rect_px: m.type === 'BOX' ? [info.region[0] + m.x, info.region[1] + m.y, m.w, m.h] : undefined,
    joint_pin_px: m.type === 'PIN' ? [m.x, m.y] : undefined,
    ruler_vector_px: m.type === 'RULER' ? { from: [m.x, m.y], to: [m.x2, m.y2], dx: m.dx, dy: m.dy, distance_px: m.dist, angle_deg: m.angleDeg } : undefined,
    offset_from_anchor_px: [m.dxFromAnchor, m.dyFromAnchor],
    note: note || undefined
  };

  savedAnnotations.push(entry);
  if (inpPartNote) inpPartNote.value = '';
  renderAnnotationListUI();
  refreshAgentSpecOutput();
  showToast(`✅ Đã lưu mốc [${partTag}] cho ${info.charId}!`);
}

function renderAnnotationListUI() {
  if (!annotationListEl) return;
  if (savedAnnotations.length === 0) {
    annotationListEl.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 8px;">Chưa có vùng/khớp nào được đánh dấu. Kéo chuột trên Khung 1:1 hoặc Map để tạo!</div>`;
    return;
  }
  annotationListEl.innerHTML = '';
  savedAnnotations.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'annotation-item';
    const desc = item.tool_type === 'BOX'
      ? `Rect [${item.local_rect_px.join(',')}]`
      : item.tool_type === 'PIN'
      ? `Pin (${item.joint_pin_px.join(',')})`
      : `Vec dx=${item.ruler_vector_px.dx}, dy=${item.ruler_vector_px.dy}`;
    row.innerHTML = `
      <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
        <b style="color:#58a6ff;">#${idx + 1} ${item.character}</b> · <span style="color:#f0883e;">${item.part_tag}</span> (f${item.reference_frame}): ${desc}
      </div>
      <button class="secondary small" style="padding:1px 5px; font-size:10px; color:#ff7b72;" data-del="${idx}">✕</button>
    `;
    const delBtn = row.querySelector('button');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        savedAnnotations.splice(idx, 1);
        renderAnnotationListUI();
        refreshAgentSpecOutput();
      });
    }
    annotationListEl.appendChild(row);
  });
}

if (btnAddAnnotation) btnAddAnnotation.addEventListener('click', addCurrentAnnotation);
if (btnClearAnnotations) {
  btnClearAnnotations.addEventListener('click', () => {
    savedAnnotations.length = 0;
    currentDraftMeasurement = null;
    renderAnnotationListUI();
    refreshAgentSpecOutput();
    showToast('🗑️ Đã xóa toàn bộ danh sách đánh dấu.');
  });
}

if (selPartType) selPartType.addEventListener('change', refreshAgentSpecOutput);
if (selActionGoal) selActionGoal.addEventListener('change', refreshAgentSpecOutput);
if (inpPartNote) inpPartNote.addEventListener('input', refreshAgentSpecOutput);
if (numRangeStart) numRangeStart.addEventListener('input', refreshAgentSpecOutput);
if (numRangeEnd) numRangeEnd.addEventListener('input', refreshAgentSpecOutput);

function refreshAgentSpecOutput() {
  if (!txtAgentSpec) return;
  const info = getSlotSpriteInfo(focusedSlotKey);
  if (!info) return;

  const payload = {
    spec_type: 'godwar_sprite_part_rigging_spec_v1',
    character_id: info.charId,
    target_height_px: info.targetHeightPx,
    display_scale: Number(info.displayScale.toFixed(4)),
    current_frame: info.frameIndex,
    selected_frame_range: [
      numRangeStart ? Number(numRangeStart.value) : 0,
      numRangeEnd ? Number(numRangeEnd.value) : info.frameIndex
    ],
    atlas_page: info.atlasIndex,
    atlas_frame_region: info.region,
    anchor_pivot_px: [Number(info.anchorX.toFixed(1)), Number(info.anchorY.toFixed(1))],
    projectile_spawn_offset_px: [Number(numSpawnDx ? numSpawnDx.value : 20), Number(numSpawnDy ? numSpawnDy.value : -20)],
    requested_action_goal: selActionGoal ? selActionGoal.value : 'walk_run',
    active_draft: currentDraftMeasurement ? {
      part_tag: selPartType ? selPartType.value : 'leg_left',
      tool_type: currentDraftMeasurement.type,
      ...currentDraftMeasurement,
      atlas_rect_px: currentDraftMeasurement.type === 'BOX'
        ? [info.region[0] + currentDraftMeasurement.x, info.region[1] + currentDraftMeasurement.y, currentDraftMeasurement.w, currentDraftMeasurement.h]
        : undefined,
      note: inpPartNote ? inpPartNote.value.trim() : undefined
    } : null,
    saved_parts: savedAnnotations
  };

  txtAgentSpec.value = JSON.stringify(payload, null, 2);
}

if (btnCopyAgentSpec) {
  btnCopyAgentSpec.addEventListener('click', () => {
    refreshAgentSpecOutput();
    const specText = txtAgentSpec ? txtAgentSpec.value : '';
    navigator.clipboard.writeText(specText).then(() => {
      showToast('📋 Đã sao chép toàn bộ Spec JSON chuẩn cho Agent!');
    });
  });
}

// Render 1:1 Frame Isolation Canvas & Overlay Annotations on Stage
function renderIsolationAndAnnotations() {
  const info = getSlotSpriteInfo(focusedSlotKey);
  if (!info) return;

  // Keep HUD Frame synced with focused character
  if (hudFrame) {
    hudFrame.textContent = `Frame: ${info.frameIndex}/${Math.max(0, info.totalFrames - 1)}`;
  }

  // 1. Draw overlays on main Stage Canvas around focused character if boxes/pins exist
  if (chkInspector && chkInspector.checked) {
    const drawStageOverlayItem = (m, color, label) => {
      ctx.save();
      ctx.translate(info.worldX, info.worldY);
      ctx.scale(info.facing, 1);
      if (m.type === 'BOX' || m.local_rect_px) {
        const [bx, by, bw, bh] = m.local_rect_px || [m.x, m.y, m.w, m.h];
        const sx = (bx - info.anchorX) * info.worldScale;
        const sy = (by - info.anchorY) * info.worldScale;
        const sw = bw * info.worldScale;
        const sh = bh * info.worldScale;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(sx, sy, sw, sh);
        ctx.setLineDash([]);
      } else if (m.type === 'PIN' || m.joint_pin_px) {
        const [px, py] = m.joint_pin_px || [m.x, m.y];
        const sx = (px - info.anchorX) * info.worldScale;
        const sy = (py - info.anchorY) * info.worldScale;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    for (const ann of savedAnnotations) {
      if (ann.character === info.charId) {
        drawStageOverlayItem(ann, '#3fb950', ann.part_tag);
      }
    }
    if (currentDraftMeasurement) {
      drawStageOverlayItem(currentDraftMeasurement, '#58a6ff', selPartType ? selPartType.value : '');
    }
  }

  // 2. Render 1:1 Isolation Canvas
  if (!isoCtx || !isoCanvas || !isolationDock || !isolationDock.classList.contains('active')) return;

  if (isoTitle) {
    isoTitle.textContent = `🖼️ Khung Gốc 1:1: ${info.charId} (${info.frameW}×${info.frameH}px · Cao đích ${info.targetHeightPx}px)`;
  }
  if (isoMetaInfo) {
    isoMetaInfo.textContent = `Atlas #${info.atlasIndex} · Region [${info.region.join(', ')}] · Neo (${Math.round(info.anchorX)}, ${Math.round(info.anchorY)})`;
  }

  isoCtx.clearRect(0, 0, isoCanvas.width, isoCanvas.height);
  isoCtx.imageSmoothingEnabled = false;

  const pad = 16;
  const availW = isoCanvas.width - pad * 2;
  const availH = isoCanvas.height - pad * 2;
  const baseScale = Math.min(availW / info.frameW, availH / info.frameH);
  const fitScale = baseScale * (isoUserZoom || 1.0);
  const drawW = info.frameW * fitScale;
  const drawH = info.frameH * fitScale;
  const offX = (isoCanvas.width - drawW) / 2 + (isoPanX || 0);
  const offY = (isoCanvas.height - drawH) / 2 + (isoPanY || 0);

  // Frame border
  isoCtx.strokeStyle = '#30363d';
  isoCtx.lineWidth = 1;
  isoCtx.strokeRect(offX, offY, drawW, drawH);

  // Pixel Grid
  if (chkIsoGrid && chkIsoGrid.checked) {
    isoCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    isoCtx.lineWidth = 1;
    const stepPx = info.frameW > 300 ? 50 : 25;
    for (let gx = 0; gx <= info.frameW; gx += stepPx) {
      const x = offX + gx * fitScale;
      isoCtx.beginPath();
      isoCtx.moveTo(x, offY);
      isoCtx.lineTo(x, offY + drawH);
      isoCtx.stroke();
    }
    for (let gy = 0; gy <= info.frameH; gy += stepPx) {
      const y = offY + gy * fitScale;
      isoCtx.beginPath();
      isoCtx.moveTo(offX, y);
      isoCtx.lineTo(offX + drawW, y);
      isoCtx.stroke();
    }
  }

  // Draw raw character frame
  if (info.image) {
    const [rx, ry, rw, rh] = info.region;
    isoCtx.drawImage(info.image, rx, ry, rw, rh, offX, offY, drawW, drawH);
  } else {
    isoCtx.fillStyle = '#8b949e';
    isoCtx.font = '12px monospace';
    isoCtx.textAlign = 'center';
    isoCtx.fillText('Đang tải Atlas nhân vật...', isoCanvas.width / 2, isoCanvas.height / 2);
  }

  // Draw Anchor Pivot Crosshair
  if (!chkIsoAnchor || chkIsoAnchor.checked) {
    const ax = offX + info.anchorX * fitScale;
    const ay = offY + info.anchorY * fitScale;
    isoCtx.strokeStyle = '#f0883e';
    isoCtx.lineWidth = 1.5;
    isoCtx.beginPath();
    isoCtx.moveTo(ax - 10, ay);
    isoCtx.lineTo(ax + 10, ay);
    isoCtx.moveTo(ax, ay - 10);
    isoCtx.lineTo(ax, ay + 10);
    isoCtx.stroke();
    isoCtx.beginPath();
    isoCtx.arc(ax, ay, 4, 0, Math.PI * 2);
    isoCtx.stroke();
  }

  // Draw Saved Annotations for this character
  const drawIsoItem = (m, strokeCol, fillCol, tagLabel) => {
    isoCtx.save();
    if (m.type === 'BOX' || m.local_rect_px) {
      const [bx, by, bw, bh] = m.local_rect_px || [m.x, m.y, m.w, m.h];
      const rx = offX + bx * fitScale;
      const ry = offY + by * fitScale;
      const rw = bw * fitScale;
      const rh = bh * fitScale;
      isoCtx.fillStyle = fillCol;
      isoCtx.fillRect(rx, ry, rw, rh);
      isoCtx.strokeStyle = strokeCol;
      isoCtx.lineWidth = 2;
      isoCtx.strokeRect(rx, ry, rw, rh);
      if (tagLabel) {
        isoCtx.fillStyle = strokeCol;
        isoCtx.font = 'bold 10px monospace';
        isoCtx.fillText(`${tagLabel} [${bw}×${bh}]`, rx + 2, Math.max(12, ry - 4));
      }
    } else if (m.type === 'PIN' || m.joint_pin_px) {
      const [px, py] = m.joint_pin_px || [m.x, m.y];
      const rx = offX + px * fitScale;
      const ry = offY + py * fitScale;
      isoCtx.fillStyle = strokeCol;
      isoCtx.beginPath();
      isoCtx.arc(rx, ry, 5, 0, Math.PI * 2);
      isoCtx.fill();
      isoCtx.strokeStyle = '#ffffff';
      isoCtx.lineWidth = 1.5;
      isoCtx.stroke();
      if (tagLabel) {
        isoCtx.fillStyle = strokeCol;
        isoCtx.font = 'bold 10px monospace';
        isoCtx.fillText(`📌 ${tagLabel} (${px},${py})`, rx + 7, ry - 4);
      }
    } else if (m.type === 'RULER' || m.ruler_vector_px) {
      const rv = m.ruler_vector_px || { from: [m.x, m.y], to: [m.x2, m.y2], dx: m.dx, dy: m.dy, distance_px: m.dist };
      const x1 = offX + rv.from[0] * fitScale;
      const y1 = offY + rv.from[1] * fitScale;
      const x2 = offX + rv.to[0] * fitScale;
      const y2 = offY + rv.to[1] * fitScale;
      isoCtx.strokeStyle = strokeCol;
      isoCtx.lineWidth = 2;
      isoCtx.beginPath();
      isoCtx.moveTo(x1, y1);
      isoCtx.lineTo(x2, y2);
      isoCtx.stroke();
      isoCtx.fillStyle = strokeCol;
      isoCtx.font = 'bold 10px monospace';
      isoCtx.fillText(`📏 ${rv.distance_px}px (dx:${rv.dx}, dy:${rv.dy})`, (x1 + x2) / 2 + 4, (y1 + y2) / 2 - 4);
    }
    isoCtx.restore();
  };

  for (const ann of savedAnnotations) {
    if (ann.character === info.charId) {
      drawIsoItem(ann, '#3fb950', 'rgba(63, 185, 80, 0.16)', ann.part_tag);
    }
  }

  if (currentDraftMeasurement) {
    drawIsoItem(currentDraftMeasurement, '#58a6ff', 'rgba(88, 166, 255, 0.22)', selPartType ? selPartType.value : 'draft');
  }
}

// Start
initAssets().then(() => {
  initRosterAndInspector();
  requestAnimationFrame(update);
});

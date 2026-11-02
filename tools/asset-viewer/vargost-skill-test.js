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
const SPEED_FAST = 400;
const PROJECTILE_SPEED_PX = 1100;
const MAX_FRAME_INDEX = 82;

// Scene Coordinates & Scales
const zoom = 0.7;
const mapScale = (W / 512) * zoom;
const mapX = (W - 512 * mapScale) / 2;
const mapY = (H - 352 * mapScale) / 2;
const groundY = mapY + 194.0 * mapScale; // Stone platform ground level
const baseFlyY = mapY + 65.0 * mapScale;  // Sky flight height
const skyCeilingY = mapY + 28.0 * mapScale; // Trần bay trên cao (12h/10h/2h)
const skyLowY = mapY + 140.0 * mapScale;     // Tầng bay thấp (4h/8h)

// Actor Position & State
let vargostX = mapX + 180.0 * mapScale;
let vargostY = baseFlyY;
let targetVargostX = vargostX;
let targetVargostY = vargostY;
let transitionStartY = baseFlyY;
let isFlying = true;
let currentTilt = 0; // in radians
let currentScaleX = 1.0;
let currentScaleY = 1.0;
let currentFlySpeed = SPEED_FAST;
let teamOriginDirection = 1; // 1: Đội Trái xuất phát bên Trái, -1: Đội Phải xuất phát bên Phải
let facingDirection = 1; // Hướng nhìn/chiến đấu hiện tại (1: nhìn phải, -1: nhìn trái)
let targetFacingVisual = 1.0;
let visualFacing = 1.0;
let turnSquashY = 1.0;
let verticalFlySpeed = 180; // px/s (giới hạn 100 - 300 px/s khi bay lên / bay xuống)
let vargostStunTimer = 0; // Thời gian Vargost bị định thân (không thể di chuyển)
let vargostSilenceTimer = 0; // Thời gian Vargost bị câm lặng (không thể tung chiêu Blazing Halo)

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
      [mapX + 284 * mapScale, mapY + 286 * mapScale],
      [mapX + 348 * mapScale, mapY + 286 * mapScale],
      [mapX + 348 * mapScale, mapY + 250 * mapScale],
      [mapX + 375 * mapScale, mapY + 250 * mapScale],
      [mapX + 375 * mapScale, mapY + 205 * mapScale],
      [mapX + 350 * mapScale, mapY + 175 * mapScale],
      [mapX + 305 * mapScale, mapY + 175 * mapScale],
      [mapX + 286 * mapScale, mapY + 120 * mapScale]
    ],
    surfaces: [
      { id: 'plat_3a', name: 'Platform 3A (Vách Đá Cao)', minX: mapX + 286 * mapScale, maxX: mapX + 422 * mapScale, y: mapY + 100 * mapScale },
      { id: 'plat_3b', name: 'Platform 3B (Bậc Giữa Phải)', minX: mapX + 427 * mapScale, maxX: mapX + 488 * mapScale, y: mapY + 130 * mapScale },
      { id: 'plat_3c', name: 'Platform 3C (Mép Phải)', minX: mapX + 488 * mapScale, maxX: mapX + 511 * mapScale, y: mapY + 164 * mapScale },
      { id: 'plat_3d', name: 'Platform 3D (Đáy Hang)', minX: mapX + 284 * mapScale, maxX: mapX + 348 * mapScale, y: mapY + 286 * mapScale }
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

function raycastEnvCollision(x1, y1, x2, y2) {
  let closestHit = null;
  let minDistance = Infinity;
  for (const zone of ENV_ZONES) {
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
  ENV_ZONES[0].surfaces[1], // Platform 1A: Sau Cây Cao (minX ~38, maxX ~128, Y ~745)
  ENV_ZONES[0].surfaces[0], // Platform 1 Top: Bậc Cao Trái Cùng (minX ~0, maxX ~36, Y ~656)
  ENV_ZONES[0].surfaces[2], // Platform 1B: Bậc Thấp Trái (minX ~130, maxX ~228, Y ~829)
  ENV_ZONES[1].surfaces[0], // Platform 2: Bệ Giữa (minX ~192, maxX ~260, Y ~587)
  ENV_ZONES[2].surfaces[0]  // Platform 3A: Vách Đá Cao (minX ~286, maxX ~422, Y ~325)
];

let aodaPlatformIndex = 0;
let aodaPlatform = AODA_PLATFORMS[0];
let aodaX = aodaPlatform.minX + 35; // Xuất phát bên trái sau cái cây cao (X ≈ 425)
let aodaY = aodaPlatform.y;
let aodaFacing = 1; // 1: Nhìn sang phải (hướng vào trung tâm), -1: Nhìn sang trái
let aodaVisualFacing = 1.0;
let aodaState = 'MOVE'; // 'IDLE', 'MOVE', 'SKILL_1_WINDUP', 'SKILL_1_RECOVERY', 'SKILL_2_WINDUP', 'SKILL_2_RECOVERY', 'KO'
let aodaHp = 100;
let aodaMaxHp = 100;
let aodaStunTimer = 0;
let aodaHitFlash = 0;
let aodaFrameIndex = 65; // Frame 66 bắt đầu chuỗi chạy bộ
let aodaAnimAccum = 0;
let aodaPatrolSpeed = 120; // px/s
let aodaChaseSpeed = 400; // px/s
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
let aodaJumpDuration = 0.48;
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

// Dynamic Moving Enemy Dummy State (Tốc độ dao động 300 - 1000 px/s & Phản Công)
let enemyWorldX = null;
let enemyMoveDir = -1; // -1: Tiến sang trái, 1: Tiến sang phải
let enemyPatrolSpeed = 380; // px/s (dao động 300 - 550 px/s khi tuần tra)
let isEnemyDashing = false;
let enemyDashTimer = 0;
let enemyDashSpeed = 850; // px/s (dao động 750 - 1000 px/s khi né đòn)
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
  const tiltDeg = facingDirection > 0 ? '+25°' : '-25°';
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
    // HƯỚNG TIẾN (2h, 4h): Giữ nguyên bay tiến nghiêng đầu +25 độ rất tự nhiên
    currentFlySpeed = Number(rngFlySpeed.value) || SPEED_FAST;
    targetVargostX = Math.max(mapX + 100, Math.min(W - 400, vargostX + effectiveDx * 110 * mapScale));
    targetVargostY = Math.max(skyCeilingY, Math.min(skyLowY, vargostY + dyRatio * 55 * mapScale));
    locomotionState = 'FLY_VECTOR';
    const tiltDeg = facingDirection > 0 ? '+25°' : '-25°';
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
    const newFacing = teamOriginDirection;
    triggerPhaseBlink(newFacing);
    if (teamOriginDirection === 1) {
      btnToggleDirection.textContent = '🔄 Hướng: Đội Trái (Trái ➔ Phải)';
      btnToggleDirection.style.borderColor = '#3fb950';
      btnToggleDirection.style.color = '#3fb950';
      targetVargostX = mapX + 180.0 * mapScale;
      showToast('Đã đổi sang Đội Trái: Xuất phát bên Trái ➔ Tấn công sang Phải');
    } else {
      btnToggleDirection.textContent = '🔄 Hướng: Đội Phải (Phải ➔ Trái)';
      btnToggleDirection.style.borderColor = '#f0883e';
      btnToggleDirection.style.color = '#f0883e';
      targetVargostX = mapX + 380.0 * mapScale;
      showToast('Đã đổi sang Đội Phải: Xuất phát bên Phải ➔ Tấn công sang Trái');
    }
    targetVargostY = isFlying ? baseFlyY : groundY;
    currentTilt = 0;
    activeProjectile = null;
    activeExplosion = null;
    motionGhosts.length = 0;
  });
}

btnReset.addEventListener('click', () => {
  vargostX = teamOriginDirection === 1 ? (mapX + 180.0 * mapScale) : (mapX + 380.0 * mapScale);
  facingDirection = teamOriginDirection;
  targetFacingVisual = facingDirection;
  visualFacing = facingDirection;
  turnSquashY = 1.0;
  vargostY = baseFlyY;
  targetVargostX = vargostX;
  targetVargostY = baseFlyY;
  transitionStartY = baseFlyY;
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
  showToast('Đã đặt lại trạng thái Vargost về mặc định.');
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

  // QUY TẮC BẮT BUỘC: Tornado CHỈ SỬ DỤNG CHO MỤC TIÊU MẶT ĐẤT!
  // Tuyệt đối không tung Tornado khi mục tiêu trước mặt đang bay (isFlying) mà không có địch mặt đất:
  if (!isManual) {
    const hasGroundEnemy = (!isFlying && !isDead && Math.abs(vargostX - aodaX) < 450);
    if (!hasGroundEnemy) {
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
    if (facing < 0) return { platform: ENV_ZONES[0].surfaces[2], targetX: ENV_ZONES[0].surfaces[2].maxX - 35 };
    if (facing > 0) return { platform: ENV_ZONES[2].surfaces[0], targetX: ENV_ZONES[2].surfaces[0].minX + 35 };
    return null;
  }
  if (plat.id === 'plat_3a') {
    if (facing < 0) return { platform: ENV_ZONES[1].surfaces[0], targetX: ENV_ZONES[1].surfaces[0].maxX - 30 };
    return { platform: ENV_ZONES[2].surfaces[1], targetX: ENV_ZONES[2].surfaces[1].minX + 30 };
  }
  if (plat.id === 'plat_3b') {
    if (facing < 0) return { platform: ENV_ZONES[2].surfaces[0], targetX: ENV_ZONES[2].surfaces[0].maxX - 30 };
    return { platform: ENV_ZONES[2].surfaces[2], targetX: ENV_ZONES[2].surfaces[2].minX + 20 };
  }
  if (plat.id === 'plat_3c') {
    if (facing < 0) return { platform: ENV_ZONES[2].surfaces[1], targetX: ENV_ZONES[2].surfaces[1].maxX - 20 };
    return null;
  }
  if (plat.id === 'plat_3d') {
    if (facing < 0) return { platform: ENV_ZONES[1].surfaces[0], targetX: ENV_ZONES[1].surfaces[0].maxX - 30 };
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
  let spawnX = x + facing * 120;
  let spawnY = groundY;
  // Aoda (Team 2) nhắm mục tiêu vào Vargost khi hạ cánh trên mặt đất
  if (!isFlying && !isDead && Math.abs(vargostX - x) < 550) {
    spawnX = vargostX;
  }

  activeTornadoes.push({
    originX: spawnX,
    x: spawnX,
    y: spawnY,
    facing: facing,
    vx: facing * 140 * (mapScale / 2.625), // Di chuyển càn quét 1 đường thẳng về phía trước theo quy chuẩn đồng bộ APK
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

  // Hồi sinh Vargost (Team 1) tại Base trên không
  isDead = false;
  deathTimer = 0;
  vargostHp = VARGOST_MAX_HP;
  vargostHitFlash = 0;
  vargostRecoilTimer = 0;
  vargostDamageGhosts.length = 0;
  vargostX = teamOriginDirection === 1 ? (mapX + 180.0 * mapScale) : (mapX + 380.0 * mapScale);
  vargostY = baseFlyY;
  targetVargostX = vargostX;
  targetVargostY = vargostY;
  facingDirection = teamOriginDirection;
  visualFacing = facingDirection;
  targetFacingVisual = facingDirection;
  currentTilt = 0;
  aiState = 'IDLE';
  locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
  autoCooldown = 0.5;

  // Hồi sinh Aoda (Team 2) tại Platform 1A Base
  aodaIsDead = false;
  aodaDeathTimer = 0;
  aodaHp = aodaMaxHp;
  aodaHitFlash = 0;
  aodaStunTimer = 0;
  aodaDamageGhosts.length = 0;
  aodaDamageNumbers.length = 0;
  aodaPlatform = AODA_PLATFORMS[0];
  aodaPlatformIndex = 0;
  aodaX = aodaPlatform.minX + 35;
  aodaY = aodaPlatform.y;
  aodaFacing = 1;
  aodaVisualFacing = 1.0;
  aodaState = 'MOVE';
  aodaFrameIndex = 65;
  aodaAnimAccum = 0;
  aodaTornadoCooldown = 0;

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

function startBlazingHalo() {
  aiState = 'HALO_WINDUP';
  pendingCombatAction = null;
  // Stop horizontal locomotion and smoothly return tilt to 0 (upright)
  locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
  currentFrameIndex = 44;
  frameTimeAccumulator = 0;
  hudState.textContent = 'Tối Thượng: VẬN CÔNG GOM VÒNG LỚN (Frame 44)';
  hudState.className = 'badge active';
  hudAi.textContent = 'AI: Thi triển Blazing Halo';
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
  const aimTargetY = groundY - 24; // Độ cao ngực mục tiêu

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
    hudVargostObjective.textContent = isVargostInZone
      ? 'Vargost: [PHÒNG THỦ] Trụ trong vùng Thánh Kiếm'
      : 'Vargost: [TẤN CÔNG] Bay tiến về chiếm Thánh Kiếm';
    hudVargostObjective.className = isVargostInZone ? 'badge active' : 'badge';
  }
  if (hudAodaObjective) {
    hudAodaObjective.textContent = isAodaInZone
      ? 'Aoda: [PHÒNG THỦ] Trụ trong vùng Thánh Kiếm'
      : 'Aoda: [TẤN CÔNG] Chạy nhảy vượt bệ tiến về Thánh Kiếm';
    hudAodaObjective.className = isAodaInZone ? 'badge active' : 'badge';
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
        // 1. Dịch chuyển tức thời tới vị trí teleportTarget (lùi hoặc vị trí chỉ định)
        vargostX = Math.max(mapX + 110, Math.min(W - 400, teleportTargetX));
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
  } else {
    currentDissolveFactor = 0;
    isGlitchFlash = false;
    // Không trong Phase Blink: Smooth visual turn nếu có lệnh lật khác
    if (Math.abs(visualFacing - targetFacingVisual) > 0.02) {
      visualFacing += (targetFacingVisual - visualFacing) * Math.min(dt * 14.0, 1.0);
      turnSquashY = 1.0 + (1.0 - Math.abs(visualFacing)) * 0.12;
    } else {
      visualFacing = targetFacingVisual;
      turnSquashY = 1.0;
    }
  }

  const flySpeed = (currentFlySpeed || SPEED_FAST) * (mapScale / 2.625);
  const targetTiltDeg = Number(rngTilt.value) || 25; // Chốt 25 độ chuẩn

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
    // Tốc độ tuần tra biến thiên linh hoạt từ 300px/s đến 550px/s
    enemyPatrolSpeed = 340 + Math.sin(hoverTimer * 2.8) * 160;

    // Phản xạ né đòn: Khi Vargost chuẩn bị tung skill (Frame >= 63) hoặc đạn đang bay
    if (enemyDodgeCooldown > 0) enemyDodgeCooldown -= dt;
    if (((aiState === 'HALO_WINDUP' && currentFrameIndex >= 63) || activeProjectile) && enemyDodgeCooldown <= 0 && enemyStunTimer <= 0 && !isEnemyDashing) {
      if (Math.random() < 0.55) {
        // Kích hoạt né đòn thần tốc 750 - 1000 px/s!
        isEnemyDashing = true;
        enemyDashTimer = 0.45;
        enemyDashSpeed = 750 + Math.random() * 250; // 750 - 1000 px/s
        enemyMoveDir = (vargostX < enemyWorldX) ? 1 : -1;
        enemyDodgeCooldown = 3.5;
        showToast(`⚡ Kẻ địch phản xạ né đòn thần tốc @ ${Math.round(enemyDashSpeed)}px/s!`);
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

  // Chọn mục tiêu của Vargost: Nhắm thẳng Aoda (Team 2 · Kẻ Địch), nếu Aoda tử trận thì nhắm Thánh Kiếm
  const primaryTargetX = (!aodaIsDead) ? aodaX : SWORD_X;
  const primaryTargetY = (!aodaIsDead) ? (aodaY - 45) : SWORD_Y;
  const targetX = primaryTargetX;
  const targetY = primaryTargetY;

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
  if (chkAuto.checked && !isDead) {
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
            const tiltLabel = facingDirection > 0 ? '+25°' : '-25°';
            hudLocomotion.textContent = `AI: TĂNG TỐC BAY XÉO ÁP SÁT @ 400px/s (${clockStr}, Nghiêng ${tiltLabel})`;
          } else {
            targetVargostY = groundY;
            const tiltLabel = facingDirection > 0 ? '+25°' : '-25°';
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
            } else if (isFlying && locomotionState === 'IDLE_FLY' && Math.random() < 0.28) {
              // Tuần tra bay xéo 2D chậm 100px/s trên không trung
              currentFlySpeed = SPEED_SLOW;
              rngFlySpeed.value = SPEED_SLOW;
              lblFlySpeed.textContent = `${SPEED_SLOW}px/s`;

              const driftDirX = (vargostX < mapX + 300) ? 1 : ((vargostX > mapX + 650) ? -1 : (Math.random() > 0.5 ? 1 : -1));
              const driftDirY = (vargostY < skyCeilingY + 25) ? 1 : ((vargostY > skyLowY - 25) ? -1 : (Math.random() > 0.5 ? 1 : -1));

              targetVargostX = vargostX + driftDirX * 45 * (mapScale / 2.625);
              targetVargostY = Math.max(skyCeilingY, Math.min(skyLowY, vargostY + driftDirY * 25 * (mapScale / 2.625)));

              let clockStr = (driftDirX > 0) ? (driftDirY < 0 ? '2h (Tiến-Lên)' : '4h (Tiến-Xuống)') : (driftDirY < 0 ? '10h (Lùi-Lên)' : '8h (Lùi-Xuống)');
              locomotionState = 'FLY_VECTOR';
              hudLocomotion.textContent = `AI: TUẦN TRA TRÊN BẦU TRỜI ${clockStr} (${SPEED_SLOW}px/s)`;
              hudLocomotion.className = 'badge flying';
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

      // Nếu đang bị định thân (Stun) -> Hoàn toàn không thể di chuyển
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

      // Góc nghiêng thân tự động theo trục X:
      // CHỈ NGHIÊNG KHI TIẾN TỚI (25 độ dũng mãnh)
      // Khi lùi tuyệt đối không nghiêng (đứng thẳng 0 độ uy nghiêm)
      let targetTilt = 0;
      if (dirX * facingDirection > 0.05) {
        targetTilt = facingDirection * (25 * Math.PI / 180);
      } else {
        targetTilt = 0;
      }
      currentTilt += (targetTilt - currentTilt) * Math.min(dt * 8, 1);

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
          spawnBlazingHaloProjectile(targetX, targetY);
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

    if (activeProjectile && !aodaIsDead) {
      const distToAoda = Math.hypot(p.x - aodaX, p.y - (aodaY - 45));
      if (distToAoda <= p.radius + 26) {
        aodaHitFlash = 0.35;
        const prevHp = aodaHp;
        aodaHp = Math.max(0, aodaHp - 45);
        aodaDamageGhosts.push({
          fromHp: prevHp, toHp: aodaHp, maxHp: aodaMaxHp,
          timer: 0, flashDuration: 0.12, dissolveDuration: 0.42, totalDuration: 0.54, seed: Math.random()
        });
        spawnHitImpact(aodaX, aodaY - 45, Math.sign(p.vx));
        spawnExplosion(aodaX, aodaY);
        enemyDamageNumbers.push({
          text: '💥 -9999 CRIT AODA!',
          x: aodaX,
          y: aodaY - 55,
          color: '#ff7b72',
          alpha: 1.0,
          life: 0.9
        });
        activeProjectile = null;
        hudProjectile.textContent = 'Đại cầu lửa: TRÚNG AODA (CRIT)!';
        if (aodaHp <= 0) {
          triggerAodaKo();
        }
      }
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
        text: '💥 -9999 CRIT!',
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
      hudProjectile.textContent = 'Blazing Halo: BẮN TRÚNG AODA (TEAM 2)! Gây Hit Stun 0.5s & -9999 CRIT!';
      hudProjectile.className = 'badge active';
      showToast('💥 BLAZING HALO BẮN TRÚNG AODA (TEAM 2)!');
    }
    // 1b. Kiểm tra va chạm Hitbox với Chiến Binh Huấn Luyện (Team 2 · Kẻ Địch)
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
    // 2. Kiểm tra chạm đất nếu kẻ địch đã né khỏi đường bay
    else if (p.y >= groundY - 6) {
      // === TRƯỢT MỤC TIÊU - NỔ TIẾP ĐẤT! ===
      spawnExplosion(p.x, groundY);

      // Nảy chữ Né đòn
      enemyDamageNumbers.push({
        text: '💨 MISSED / NÉ ĐÒN!',
        x: p.x,
        y: groundY - 45,
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
      isDead = false;
      deathTimer = 0;
      vargostHp = VARGOST_MAX_HP;
      vargostHitFlash = 0;
      vargostX = teamOriginDirection === 1 ? (mapX + 180.0 * mapScale) : (mapX + 380.0 * mapScale);
      vargostY = baseFlyY;
      targetVargostX = vargostX;
      targetVargostY = vargostY;
      aiState = 'IDLE';
      locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
      autoCooldown = 0.5;
      hudState.textContent = isFlying ? 'Trạng thái: ĐÃ HỒI SINH (LƠ LỬNG)' : 'Trạng thái: ĐÃ HỒI SINH (ĐỨNG TRÊN BỆ)';
      hudState.className = 'badge active';
      hudAi.textContent = 'AI: Xuất kích tiến về Thánh Kiếm';
      hudAi.className = 'badge';
      showToast('✨ VARGOST ĐÃ HỒI SINH! Xuất kích tiến về Thánh Kiếm!');
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

    // Aoda Dead & KO Lifecycle (Frame 47..65, Index 46..64)
    if (aodaIsDead) {
      aodaDeathTimer += dt;
      aodaAnimAccum += dt;
      if (aodaAnimAccum >= 0.06) {
        aodaAnimAccum -= 0.06;
        if (aodaFrameIndex < 64) {
          aodaFrameIndex++;
        }
      }
      if (aodaDeathTimer >= 2.0) {
        // Hồi sinh tại Team 2 Base (Platform 1A)
        aodaIsDead = false;
        aodaDeathTimer = 0;
        aodaHp = aodaMaxHp;
        aodaPlatform = AODA_PLATFORMS[0];
        aodaPlatformIndex = 0;
        aodaX = aodaPlatform.minX + 35;
        aodaY = aodaPlatform.y;
        aodaFacing = 1;
        aodaVisualFacing = 1.0;
        aodaState = 'MOVE';
        aodaFrameIndex = 65;
        if (hudAodaState) {
          hudAodaState.textContent = `Aoda: HỒI SINH TẠI ${aodaPlatform.name.split(' (')[0]}`;
          hudAodaState.className = 'badge active';
        }
        showToast('✨ AODA ĐÃ HỒI SINH ĐẦY MÁU! Tiến về Thánh Kiếm!');
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
        // Chọn mục tiêu mặt đất: Nhắm trực tiếp vào Vargost khi Vargost hạ cánh
        let groundTarget = (!isFlying && !isDead) ? { type: 'vargost', x: vargostX, y: vargostY + hoverOffset, hDist: hDistVargost } : null;

        if (groundTarget) {
          if (groundTarget.x > aodaX + 15) {
            aodaFacing = 1;
            aodaVisualFacing = 1;
          } else if (groundTarget.x < aodaX - 15) {
            aodaFacing = -1;
            aodaVisualFacing = -1;
          }

          // Cận chiến / Tầm trung: Phóng Tornado nếu trong tầm < 420px và hết cooldown
          if (groundTarget.hDist < 420 && aodaTornadoCooldown <= 0) {
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
        if (aodaAnimAccum >= 0.06) {
          aodaAnimAccum -= 0.06;
          aodaFrameIndex++;
          if (aodaFrameIndex > 86) aodaFrameIndex = 65;
        }

        // Hướng di chuyển theo mục tiêu chiếm Thánh Kiếm:
        const isAodaInSwordZone = Math.hypot(aodaX - SWORD_X, aodaY - SWORD_Y) <= SWORD_CAPTURE_RADIUS;
        if (!isAodaInSwordZone) {
          aodaFacing = (SWORD_X > aodaX) ? 1 : -1;
          aodaVisualFacing = aodaFacing;
        }

        // Di chuyển trên bệ & Kiểm tra mép đất (Ledge Limit):
        const stepX = aodaFacing * aodaPatrolSpeed * dt;
        const targetEdgeX = aodaX + stepX;

        const minLedge = aodaPlatform.minX + 20;
        const maxLedge = aodaPlatform.maxX - 20;

        const curTargetX = (!isDead) ? vargostX : SWORD_X;
        const isSwordAhead = (aodaFacing > 0 && SWORD_X > aodaX) || (aodaFacing < 0 && SWORD_X < aodaX);

        if (targetEdgeX < minLedge || targetEdgeX > maxLedge) {
          // Đã chạm mép bệ: Nhảy sang bệ tiếp theo để tiến vào Platform 2
          const adj = getAdjacentPlatform(aodaPlatform, aodaFacing);
          if ((isSwordAhead || !isAodaInSwordZone) && adj) {
            aodaState = 'JUMP';
            aodaJumpTimer = 0;
            aodaJumpDuration = 0.48;
            aodaJumpStartX = aodaX;
            aodaJumpStartY = aodaY;
            aodaJumpTargetPlatform = adj.platform;
            aodaJumpTargetX = adj.targetX;
            aodaJumpTargetY = adj.platform.y;
            if (aodaFrameIndex < 65 || aodaFrameIndex > 86) {
              aodaFrameIndex = 65;
            }
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
        } else {
          // Nếu đã vào vùng Thánh Kiếm -> Thế thủ vững vàng phòng thủ!
          if (isAodaInSwordZone && Math.abs(aodaX - SWORD_X) < 40) {
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
        const arc = Math.sin(t * Math.PI) * 55 * (mapScale / 2.625);
        aodaY = (aodaJumpStartY + (aodaJumpTargetY - aodaJumpStartY) * t) - arc;

        // Hoạt ảnh KHÔNG BỊ ĐƠ: Trong suốt quỹ đạo nhảy, hoạt ảnh liên tục chạy mượt mà
        aodaAnimAccum += dt;
        if (aodaAnimAccum >= 0.05) {
          aodaAnimAccum -= 0.05;
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
          aodaLandingTimer = 0.12;
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
          const isAodaInSwordZone = Math.hypot(aodaX - SWORD_X, aodaY - SWORD_Y) <= SWORD_CAPTURE_RADIUS;
          if (isAodaInSwordZone) {
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

        const isAodaInSwordZone = Math.hypot(aodaX - SWORD_X, aodaY - SWORD_Y) <= SWORD_CAPTURE_RADIUS;
        const curTargetX = (!isDead) ? vargostX : SWORD_X;
        if (!isAodaInSwordZone) {
          aodaFacing = (SWORD_X > aodaX) ? 1 : -1;
          aodaVisualFacing = aodaFacing;
          aodaState = 'MOVE';
          aodaFrameIndex = 65;
        } else {
          // Trong vùng Thánh Kiếm: Quay mặt phòng thủ đối diện kẻ địch
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
        // Red Tornado di chuyển càn quét 1 đường thẳng về phía trước theo quy chuẩn đồng bộ APK
        t.x += (t.vx || (t.facing * 140 * (mapScale / 2.625))) * dt;
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

        // 1. Kiểm tra Vargost (Team 1) - TUYỆT ĐỐI CHỈ DÍNH KHI Ở TRÊN MẶT ĐẤT (!isFlying)!
        if (!isFlying) {
          const vY = vargostY + hoverOffset;
          if (Math.abs(t.x - vargostX) < 65 && Math.abs(t.y - vY) < 85) {
            vargostStunTimer = Math.max(vargostStunTimer, 2.0);
            vargostSilenceTimer = Math.max(vargostSilenceTimer, 2.0);
            vargostHitFlash = 0.35;
            if (canTickDamage) {
              const prevHp = vargostHp;
              vargostHp = Math.max(10, vargostHp - 25);
              vargostDamageGhosts.push({
                fromHp: prevHp, toHp: vargostHp, maxHp: VARGOST_MAX_HP,
                timer: 0, flashDuration: 0.12, dissolveDuration: 0.42, totalDuration: 0.54, seed: Math.random()
              });
              enemyDamageNumbers.push({
                text: '🌪️ TORNADO: ROOT & SILENCE 2s!',
                x: vargostX,
                y: vargostY - 45,
                color: '#ff7b72',
                alpha: 1.0,
                vy: -45
              });
            }
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
        t.x = t.originX;
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
    // Render Scene
    // -------------------------------------------------------------
    drawScene(targetX, targetY, dt);
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

// -------------------------------------------------------------
// -------------------------------------------------------------
// Gothic RPG Health Bar Renderer (Mẫu image copy.png: Lõi thủy tinh + Khung kim loại Gothic)
// Hỗ trợ theme: 'green' (Đồng minh / Vargost) và 'red' (Kẻ địch) tươi hơn 15%
// Hỗ trợ fadeAlpha & dissolveFactor khi nhân vật tử trận (KO tan biến cả thanh máu)
// -------------------------------------------------------------
function drawGothicHealthBar(targetCtx, centerX, topY, currentHp, maxHp, damageGhosts, labelText, subText, isHit, customWidth, barTheme = 'green', fadeAlpha = 1.0, dissolveFactor = 0) {
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
    ctx.rotate(ghost.tilt || 0);
    ctx.scale(currentScaleX * (ghost.facing || visualFacing), currentScaleY);
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
  ctx.rotate(currentTilt);
  ctx.scale(currentScaleX * visualFacing, currentScaleY * turnSquashY);

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
      drawGothicHealthBar(ctx, vargostX, vBarY, vargostHp, VARGOST_MAX_HP, vargostDamageGhosts, vHpLabel, vSubLabel, true, 80, 'green', vBarAlpha, vBarDissolve);
    }
    // Pha 3 (deathTimer >= 1.9s): Đã tan biến hoàn toàn vào hư không -> KHÔNG VẼ THANH MÁU
  } else {
    drawGothicHealthBar(ctx, vargostX, vBarTopY, vargostHp, VARGOST_MAX_HP, vargostDamageGhosts, vHpLabel, vSubLabel, vargostHitFlash > 0, 80, 'green', 1.0, 0);
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

  // 6. Explosion VFX Rendering
  if (activeExplosion && assets.explosion) {
    const exp = activeExplosion;
    const col = exp.frame % exp.cols;
    const row = Math.floor(exp.frame / exp.cols);
    const esx = col * exp.frameW;
    const esy = row * exp.frameH;

    const ew = exp.frameW * exp.scale;
    const eh = exp.frameH * exp.scale;

    // Kiểm tra an toàn biên ảnh tránh lỗi IndexSizeError ngoài kích thước atlas
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

  // -------------------------------------------------------------
  // 6b. VẼ CỨ ĐIỂM THÁNH KIẾM (Asset/Character/vfx/sword.mp4) TRÊN PLATFORM 2
  // -------------------------------------------------------------
  ctx.save();
  // Vùng tròn chiếm đóng (Bán kính SWORD_CAPTURE_RADIUS) - Đã xóa bỏ hoàn toàn quầng nền màu tím theo yêu cầu người dùng
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(SWORD_X, SWORD_Y + 10, SWORD_CAPTURE_RADIUS, SWORD_CAPTURE_RADIUS * 0.42, 0, 0, Math.PI * 2);
  let ringStroke = 'rgba(0, 229, 255, 0.6)';
  if (isSwordContested) {
    ringStroke = '#f0883e';
  } else if (swordControllingTeam === 1) {
    ringStroke = '#3fb950';
  } else if (swordControllingTeam === 2) {
    ringStroke = '#ff5252';
  }
  ctx.strokeStyle = ringStroke;
  ctx.lineWidth = 2.0;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

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
      drawGothicHealthBar(ctx, aodaX, aodaBarY, aodaHp, aodaMaxHp, aodaDamageGhosts, aodaLabel, aodaSub, aodaHitFlash > 0, 75, 'red', aBarAlpha, aodaIsDead ? (aodaDeathTimer / 2.0) : 0);
    }
  }
}

// Start
initAssets().then(() => {
  requestAnimationFrame(update);
});

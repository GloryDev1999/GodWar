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
if (flashCanvas) { flashCanvas.width = 200; flashCanvas.height = 200; }
const flashCtx = flashCanvas ? flashCanvas.getContext('2d', { willReadFrequently: true }) : null;

function renderFullBodyFlash(targetCtx, sx, sy, sw, sh, dx, dy, dw, dh, flashAlpha) {
  if (!flashCtx || !assets.vargost) return;
  flashCtx.clearRect(0, 0, 200, 200);
  flashCtx.drawImage(assets.vargost, sx, sy, sw, sh, 0, 0, 200, 200);
  flashCtx.save();
  flashCtx.globalCompositeOperation = 'source-in';
  // Chớp nhấp nháy 2 nhịp sắc sảo: Trắng tinh -> Đỏ cam rực rỡ
  flashCtx.fillStyle = (Math.floor(hoverTimer * 45) % 2 === 0) ? '#ffffff' : '#ff4d4d';
  flashCtx.fillRect(0, 0, 200, 200);
  flashCtx.restore();

  targetCtx.save();
  targetCtx.globalAlpha = Math.min(1.0, flashAlpha);
  targetCtx.drawImage(flashCanvas, 0, 0, 200, 200, dx, dy, dw, dh);
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

    console.log('All combat assets loaded successfully (Unified 83-frame Blazing Halo & Gothic Health Bar).');
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
  const targetX = vargostX - facingDirection * retreatDist;
  triggerTeleport(targetX, vargostY);
  hudLocomotion.textContent = 'Di chuyển: TELEPORT LÙI 9h (Thân đứng 0°)';
  hudLocomotion.className = 'badge active';
  showToast('⚡ Vargost Teleport lùi 9h (Thân đứng thẳng 0°)!');
});

function flyDiagonal(dxRatio, dyRatio, label, clockName) {
  if (!isFlying) {
    takeoff();
    showToast(`Cất cánh trước khi bay xéo ${clockName}!`);
    return;
  }
  const effectiveDx = dxRatio * facingDirection;
  if (effectiveDx < 0) {
    // HƯỚNG LÙI (10h, 8h): Sử dụng Teleport thay vì nghiêng lùi, thân đứng thẳng 0 độ uy nghiêm!
    const retreatDist = 125 * (mapScale / 2.625);
    const targetX = vargostX + effectiveDx * retreatDist;
    const targetY = vargostY + dyRatio * 45 * mapScale;
    triggerTeleport(targetX, targetY);
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
  if (aiState !== 'IDLE' && aiState !== 'REPOSITIONING') return;
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

function triggerTeleport(targetX, targetY, newFacing = null) {
  if (isPhaseBlinking) return;
  isPhaseBlinking = true;
  phaseBlinkTimer = 0;
  phaseBlinkTargetFacing = (newFacing !== null) ? newFacing : facingDirection;
  teleportTargetX = Math.max(mapX + 110, Math.min(W - 400, targetX));
  teleportTargetY = isFlying ? Math.max(skyCeilingY, Math.min(skyLowY, targetY)) : groundY;
  phaseBlinkStep = 1;
  currentTilt = 0; // Đứng thẳng 0 độ uy nghiêm, triệt tiêu hoàn toàn nghiêng ngửa ra sau khi lùi
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
  const spriteScale = assets.manifest.display_scale * (zoom / 0.7);
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

  const targetX = enemyWorldX;
  const targetY = groundY;

  const diffX = targetX - vargostX;
  const absDistPx = Math.round(Math.abs(diffX) / (mapScale / 2.625));
  const distInPx = absDistPx;
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
        else if (absDistPx > MAX_ATTACK_RANGE) {
          targetFacingVisual = facingDirection;
          currentFlySpeed = SPEED_FAST;
          rngFlySpeed.value = SPEED_FAST;
          lblFlySpeed.textContent = `${SPEED_FAST}px/s`;
          const stepAdv = (absDistPx - 360) * (mapScale / 2.625);
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
        // 2. Nếu cự ly quá gần (< 150px): AI kích hoạt TELEPORT LÙI giữ khoảng cách (thân đứng thẳng 0 độ)
        else if (absDistPx < MIN_ATTACK_RANGE) {
          if (!isPhaseBlinking) {
            const stepRet = (320 - absDistPx) * (mapScale / 2.625);
            const retreatTargetX = vargostX - facingDirection * stepRet;
            const preferUp = (vargostY > (skyCeilingY + skyLowY) / 2);
            const retreatTargetY = isFlying
              ? (preferUp ? Math.max(skyCeilingY, vargostY - 35 * mapScale) : Math.min(skyLowY, vargostY + 35 * mapScale))
              : groundY;
            triggerTeleport(retreatTargetX, retreatTargetY);
            hudLocomotion.textContent = 'AI: CỰ LY QUÁ GẦN -> TELEPORT LÙI GIỮ KHOẢNG CÁCH (Đứng 0°)';
            hudLocomotion.className = 'badge active';
          }
        }
        // 3. Đã vào cự ly tối ưu [150, 550]:
        else {
          targetFacingVisual = facingDirection;
          if (autoCooldown <= 0) {
            // Sẵn sàng xuất chiêu Blazing Halo (Tung chiêu trực tiếp ở cả trên không lẫn trên bệ đá)
            orderBlazingHalo();
          } else {
            // Skill đang hồi: Tuần tra bay xéo 2D chậm 100px/s hoặc đổi độ cao khi hết altitudeCooldown
            if (isFlying) {
              if (altitudeCooldown <= 0 && Math.random() < 0.08) {
                // Đã bay trên không đủ lâu (>= 15s), thi thoảng hạ cánh bệ đá nghỉ ngơi
                land();
              } else if (locomotionState === 'IDLE_FLY' && Math.random() < 0.28) {
                // Tuần tra bay xéo 2D chậm 100px/s (ngẫu nhiên 10h, 2h, 4h, 8h)
                currentFlySpeed = SPEED_SLOW;
                rngFlySpeed.value = SPEED_SLOW;
                lblFlySpeed.textContent = `${SPEED_SLOW}px/s`;

                const driftDirX = (vargostX < mapX + 300) ? 1 : ((vargostX > mapX + 650) ? -1 : (Math.random() > 0.5 ? 1 : -1));
                const driftDirY = (vargostY < skyCeilingY + 25) ? 1 : ((vargostY > skyLowY - 25) ? -1 : (Math.random() > 0.5 ? 1 : -1));

                targetVargostX = vargostX + driftDirX * 45 * (mapScale / 2.625);
                targetVargostY = Math.max(skyCeilingY, Math.min(skyLowY, vargostY + driftDirY * 25 * (mapScale / 2.625)));

                let clockStr = (driftDirX > 0) ? (driftDirY < 0 ? '2h (Tiến-Lên)' : '4h (Tiến-Xuống)') : (driftDirY < 0 ? '10h (Lùi-Lên)' : '8h (Lùi-Xuống)');
                locomotionState = 'FLY_VECTOR';
                hudLocomotion.textContent = `AI: TUẦN TRA BAY XÉO ${clockStr} (${SPEED_SLOW}px/s)`;
                hudLocomotion.className = 'badge';
              }
            } else {
              if (altitudeCooldown <= 0 && Math.random() < 0.12) {
                // Đã đứng trên bệ đá đủ lâu (>= 15s), cất cánh lên không trung
                takeoff();
              } else if (locomotionState === 'IDLE_GROUND' && Math.random() < 0.20) {
                // Tuần tra di chuyển chậm 100px/s trên bệ đá
                currentFlySpeed = SPEED_SLOW;
                rngFlySpeed.value = SPEED_SLOW;
                lblFlySpeed.textContent = `${SPEED_SLOW}px/s`;
                const driftDir = (vargostX < mapX + 300) ? 1 : ((vargostX > mapX + 550) ? -1 : (Math.random() > 0.5 ? 1 : -1));
                targetVargostX = vargostX + driftDir * 30 * (mapScale / 2.625);
                targetVargostY = groundY;
                locomotionState = 'FLY_VECTOR';
                hudLocomotion.textContent = `AI: TUẦN TRA TRÊN BỆ ĐÁ (${SPEED_SLOW}px/s)`;
                hudLocomotion.className = 'badge ground';
              }
            }
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Manual / Repositioning Range Evaluation
  // -------------------------------------------------------------
  if (pendingCombatAction && aiState === 'IDLE' && !isDead) {
    if (distInPx < MIN_ATTACK_RANGE) {
      aiState = 'REPOSITIONING';
      const retreatDist = (300 - distInPx) * (mapScale / 2.625);
      const retreatTargetX = vargostX - facingDirection * retreatDist;
      const retreatTargetY = isFlying ? Math.max(skyCeilingY, vargostY - 30 * mapScale) : groundY;
      triggerTeleport(retreatTargetX, retreatTargetY);
      hudAi.textContent = 'AI: Quá gần! Teleport lùi giữ cự ly (Đứng 0°)';
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
      startBlazingHalo();
    }
  }

  if (aiState === 'REPOSITIONING') {
    if (distInPx >= MIN_ATTACK_RANGE + 30 && distInPx <= MAX_ATTACK_RANGE - 30) {
      startBlazingHalo();
    }
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

      vargostX += stepX;
      if (isFlying) {
        vargostY += stepY;
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

      if (aiState === 'IDLE' || aiState === 'REPOSITIONING') {
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
        } else if (currentFrameIndex === 68) {
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
    p.time += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

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

    // 1. Kiểm tra va chạm Hitbox với kẻ địch (ngực kẻ địch tại groundY - 24)
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
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;
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
    if (deathTimer >= 3.4) {
      isDead = false;
      deathTimer = 0;
      vargostHp = VARGOST_MAX_HP;
      vargostHitFlash = 0;
      aiState = 'IDLE';
      locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
      autoCooldown = 1.5;
      hudState.textContent = isFlying ? 'Trạng thái: ĐÃ HỒI SINH (LƠ LỬNG)' : 'Trạng thái: ĐÃ HỒI SINH (ĐỨNG TRÊN BỆ)';
      hudState.className = 'badge active';
      hudAi.textContent = 'AI: Tuần tra chiến thuật';
      hudAi.className = 'badge';
      showToast('✨ VARGOST ĐÃ HỒI SINH ĐẦY MÁU!');
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
    // Render Scene
    // -------------------------------------------------------------
    drawScene(targetX, targetY, dt);
    renderLoupe();
  } catch (err) {
    console.error("[GodWar Viewer Update Loop Error]", err);
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

  // 1. Draw Map
  if (assets.map) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(assets.map, mapX, mapY, 512 * mapScale, 352 * mapScale);
  }

  // 2. Draw Target Enemy Dummy (Chiến Binh Huấn Luyện Pixel & Thanh Máu)
  ctx.save();
  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(targetX, targetY + 2, 24 * (zoom / 0.7), 7 * (zoom / 0.7), 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Pixel Enemy Dummy Silhouette
  const dummyScale = (zoom / 0.7);
  const dummyW = 28 * dummyScale;
  const dummyH = 46 * dummyScale;
  const dummyX = targetX - dummyW / 2;
  const dummyY = targetY - dummyH;

  // Flash color when hit by projectile explosion
  if (enemyHitFlash > 0) {
    ctx.fillStyle = (Math.floor(hoverTimer * 30) % 2 === 0) ? '#ffffff' : '#ff4444';
  } else {
    ctx.fillStyle = isEnemyDashing ? '#f0883e' : '#6e40c9';
  }

  // Head
  ctx.fillRect(targetX - 7 * dummyScale, dummyY, 14 * dummyScale, 12 * dummyScale);
  // Red eyes
  ctx.fillStyle = '#ff3838';
  const eyeOffset = (enemyMoveDir > 0) ? 2 : -2;
  ctx.fillRect(targetX + eyeOffset - 3, dummyY + 4, 3, 3);
  ctx.fillRect(targetX + eyeOffset + 2, dummyY + 4, 3, 3);

  // Body & Armor
  ctx.fillStyle = (enemyHitFlash > 0) ? '#ffaaaa' : (isEnemyDashing ? '#d29922' : '#5832a8');
  ctx.fillRect(dummyX, dummyY + 12 * dummyScale, dummyW, 20 * dummyScale);
  // Belt
  ctx.fillStyle = '#d29922';
  ctx.fillRect(dummyX + 2, dummyY + 32 * dummyScale, dummyW - 4, 3 * dummyScale);
  // Legs
  ctx.fillStyle = '#311b58';
  ctx.fillRect(dummyX + 3, dummyY + 35 * dummyScale, 8 * dummyScale, 11 * dummyScale);
  ctx.fillRect(dummyX + dummyW - 11 * dummyScale, dummyY + 35 * dummyScale, 8 * dummyScale, 11 * dummyScale);

  // Reticle circle
  ctx.strokeStyle = '#f6ad55';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(targetX, targetY - dummyH / 2, 26 * dummyScale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();

  // Gothic Health Bar của Mục tiêu Huấn Luyện (Mẫu image copy.png, Theme Đỏ phe địch tươi hơn 15%)
  const enemyBarTopY = dummyY - 24 * dummyScale;
  const stunStr = (enemyStunTimer > 0) ? ' ⚡ STUN 0.1s!' : '';
  const arrowStr = (chkMovingTarget && chkMovingTarget.checked) ? (enemyMoveDir > 0 ? '▶ Tiến Phải' : '◀ Tiến Trái') : 'Đứng Yên';
  const dashStr = isEnemyDashing ? ' ⚡ DASH' : '';
  const enemyLabel = `Mục tiêu ${enemyHp}/100 HP${stunStr}`;
  const enemySub = `(${arrowStr}${dashStr})`;
  drawGothicHealthBar(ctx, targetX, enemyBarTopY, enemyHp, 100, enemyDamageGhosts, enemyLabel, enemySub, enemyHitFlash > 0, 70, 'red');

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
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

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
  const vHpLabel = `Vargost ${vargostHp}/${VARGOST_MAX_HP} HP${hurtText}`;
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

// Start
initAssets().then(() => {
  requestAnimationFrame(update);
});

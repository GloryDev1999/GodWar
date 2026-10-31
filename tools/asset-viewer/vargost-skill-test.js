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
const btnSpeedSlow = document.getElementById('btn-speed-slow');
const btnSpeedFast = document.getElementById('btn-speed-fast');
const btnBlazingHalo = document.getElementById('btn-blazing-halo');
const btnCastLegacy = document.getElementById('btn-cast');
const chkAuto = document.getElementById('chk-auto');
const rngDistance = document.getElementById('rng-distance');
const lblDistance = document.getElementById('lbl-distance');
const btnTestNear = document.getElementById('btn-test-near');
const btnTestFar = document.getElementById('btn-test-far');
const rngFlySpeed = document.getElementById('rng-fly-speed');
const lblFlySpeed = document.getElementById('lbl-fly-speed');
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

// Actor Position & State
let vargostX = mapX + 180.0 * mapScale;
let vargostY = baseFlyY;
let targetVargostX = vargostX;
let isFlying = true;
let currentTilt = 0; // in radians
let currentScaleX = 1.0;
let currentScaleY = 1.0;
let currentFlySpeed = SPEED_FAST;

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
    console.log('All combat assets loaded successfully (Unified 83-frame Blazing Halo).');
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

// Locomotion Commands (Orthogonal 4 directions)
btnFlyForward.addEventListener('click', () => {
  currentFlySpeed = Number(rngFlySpeed.value) || SPEED_FAST;
  targetVargostX = Math.min(W - 400, vargostX + 120 * mapScale);
  locomotionState = 'FLY_FORWARD';
  hudLocomotion.textContent = isFlying
    ? `Di chuyển: BAY TIẾN (+120px, Nghiêng +25°) @ ${currentFlySpeed}px/s`
    : `Di chuyển: TIẾN TRÊN BỆ (+120px, Nghiêng +25°) @ ${currentFlySpeed}px/s`;
  hudLocomotion.className = 'badge flying';
});

btnFlyBackward.addEventListener('click', () => {
  currentFlySpeed = Number(rngFlySpeed.value) || SPEED_FAST;
  targetVargostX = Math.max(mapX + 100, vargostX - 120 * mapScale);
  locomotionState = 'FLY_BACKWARD';
  hudLocomotion.textContent = isFlying
    ? `Di chuyển: BAY LÙI (-120px, Nghiêng -25°) @ ${currentFlySpeed}px/s`
    : `Di chuyển: LÙI TRÊN BỆ (-120px, Nghiêng -25°) @ ${currentFlySpeed}px/s`;
  hudLocomotion.className = 'badge warning';
});

function land() {
  if (!isFlying || locomotionState === 'LANDING' || locomotionState === 'TAKEOFF') return;
  locomotionState = 'LANDING';
  transitionProgress = 0;
  altitudeCooldown = 15.0; // Khóa độ cao ít nhất 15s
  hudLocomotion.textContent = 'Di chuyển: HẠ CÁNH (Dọc Y=194)...';
  hudLocomotion.className = 'badge ground';
}

function takeoff() {
  if (isFlying || locomotionState === 'TAKEOFF' || locomotionState === 'LANDING') return;
  locomotionState = 'TAKEOFF';
  transitionProgress = 0;
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

btnReset.addEventListener('click', () => {
  vargostX = mapX + 180.0 * mapScale;
  vargostY = baseFlyY;
  targetVargostX = vargostX;
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
  }
});

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
// Projectile Spawner (1100 px/s)
// -------------------------------------------------------------
function spawnBlazingHaloProjectile(targetX, targetY) {
  const spriteScale = assets.manifest.display_scale * (zoom / 0.7);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

  // Offsets from anchor [105, 162]: Hand position is [20, -20]
  const dx = Number(numSpawnDx.value) || 20;
  const dy = Number(numSpawnDy.value) || -20;

  const cos = Math.cos(currentTilt);
  const sin = Math.sin(currentTilt);
  const rdx = dx * cos - dy * sin;
  const rdy = dx * sin + dy * cos;

  const startX = vargostX + rdx * spriteScale;
  const startY = (vargostY + hoverOffset) + rdy * spriteScale;

  const distTotal = Math.hypot(targetX - startX, targetY - startY);
  const flightSpeedCanvas = PROJECTILE_SPEED_PX * (mapScale / 2.625);
  const duration = Math.max(0.1, distTotal / flightSpeedCanvas);

  activeProjectile = {
    startX: startX,
    startY: startY,
    x: startX,
    y: startY,
    targetX: targetX,
    targetY: targetY,
    spinFrame: 0,
    spinAccum: 0,
    time: 0,
    duration: duration,
    size: 80 * spriteScale,
    onHit: 'ON_HIT_HALO',
  };

  hudProjectile.textContent = 'Đại cầu lửa: Bay tới mục tiêu @ 1100px/s';
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
// Main Loop
// -------------------------------------------------------------
let lastTimestamp = 0;

function update(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const rawDt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  const dt = Math.min(rawDt, 0.1) * Number(selRate.value);

  hoverTimer += dt;

  const flySpeed = (currentFlySpeed || SPEED_FAST) * (mapScale / 2.625);
  const targetTiltDeg = Number(rngTilt.value) || 25; // Chốt 25 độ chuẩn

  // Target coordinates on ground stone platform
  const userDist = Number(rngDistance.value) * (mapScale / 2.625);
  const targetX = mapX + 220.0 * mapScale + userDist;
  const targetY = groundY;

  const currentDist = targetX - vargostX;
  const distInPx = Math.round(currentDist / (mapScale / 2.625));
  hudRange.textContent = `Cự ly: ${distInPx}px (Tầm tối ưu: 150-550)`;

  const inOptimalRange = (distInPx >= MIN_ATTACK_RANGE && distInPx <= MAX_ATTACK_RANGE);
  hudRange.className = inOptimalRange ? 'badge active' : 'badge warning';

  // -------------------------------------------------------------
  // AUTONOMOUS UTILITY AI (Tự động di chuyển & tấn công)
  // -------------------------------------------------------------
  if (chkAuto.checked) {
    if (autoCooldown > 0) autoCooldown -= dt;
    if (altitudeCooldown > 0) altitudeCooldown -= dt;

    if (aiState === 'IDLE' && !pendingCombatAction && locomotionState !== 'TAKEOFF' && locomotionState !== 'LANDING') {
      aiDecisionTimer -= dt;
      if (aiDecisionTimer <= 0) {
        aiDecisionTimer = 0.35; // chu kỳ ra quyết định 0.35s

        // 1. Nếu cự ly quá xa (> 550px): Tăng tốc 400px/s tiến áp sát
        if (distInPx > MAX_ATTACK_RANGE) {
          currentFlySpeed = SPEED_FAST;
          rngFlySpeed.value = SPEED_FAST;
          lblFlySpeed.textContent = `${SPEED_FAST}px/s`;
          targetVargostX = Math.min(W - 400, vargostX + (distInPx - 360) * (mapScale / 2.625));
          locomotionState = 'FLY_FORWARD';
          hudLocomotion.textContent = isFlying
            ? `AI: TĂNG TỐC BAY TIẾN ÁP SÁT (400px/s, Nghiêng +25°)`
            : `AI: TIẾN ÁP SÁT TRÊN BỆ ĐÁ (400px/s, Nghiêng +25°)`;
          hudLocomotion.className = 'badge flying';
        }
        // 2. Nếu cự ly quá gần (< 150px): Tăng tốc 400px/s lùi giữ khoảng cách
        else if (distInPx < MIN_ATTACK_RANGE) {
          currentFlySpeed = SPEED_FAST;
          rngFlySpeed.value = SPEED_FAST;
          lblFlySpeed.textContent = `${SPEED_FAST}px/s`;
          targetVargostX = Math.max(mapX + 100, vargostX - (300 - distInPx) * (mapScale / 2.625));
          locomotionState = 'FLY_BACKWARD';
          hudLocomotion.textContent = isFlying
            ? `AI: TĂNG TỐC BAY LÙI GIỮ CỰ LY (400px/s, Nghiêng -25°)`
            : `AI: LÙI GIỮ CỰ LY TRÊN BỆ ĐÁ (400px/s, Nghiêng -25°)`;
          hudLocomotion.className = 'badge warning';
        }
        // 3. Đã vào cự ly tối ưu [150, 550]:
        else {
          if (autoCooldown <= 0) {
            // Sẵn sàng xuất chiêu Blazing Halo (Tung chiêu trực tiếp ở cả trên không lẫn trên bệ đá)
            orderBlazingHalo();
          } else {
            // Skill đang hồi: Tuần tra bay chậm / đi chậm hoặc đổi độ cao khi hết altitudeCooldown
            if (isFlying) {
              if (altitudeCooldown <= 0 && Math.random() < 0.08) {
                // Đã bay trên không đủ lâu (>= 15s), thi thoảng hạ cánh bệ đá nghỉ ngơi
                land();
              } else if (locomotionState === 'IDLE_FLY' && Math.random() < 0.25) {
                // Tuần tra bay chậm 100px/s giữ vị trí lơ lửng
                currentFlySpeed = SPEED_SLOW;
                rngFlySpeed.value = SPEED_SLOW;
                lblFlySpeed.textContent = `${SPEED_SLOW}px/s`;
                const driftDir = (vargostX < mapX + 300) ? 1 : ((vargostX > mapX + 650) ? -1 : (Math.random() > 0.5 ? 1 : -1));
                targetVargostX = vargostX + driftDir * 40 * (mapScale / 2.625);
                locomotionState = (driftDir > 0) ? 'FLY_FORWARD' : 'FLY_BACKWARD';
                hudLocomotion.textContent = `AI: TUẦN TRA BAY CHẬM (${SPEED_SLOW}px/s)`;
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
                locomotionState = (driftDir > 0) ? 'FLY_FORWARD' : 'FLY_BACKWARD';
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
  if (pendingCombatAction && aiState === 'IDLE') {
    if (distInPx < MIN_ATTACK_RANGE) {
      aiState = 'REPOSITIONING';
      currentFlySpeed = SPEED_FAST;
      locomotionState = 'FLY_BACKWARD';
      targetVargostX = Math.max(mapX + 100, vargostX - (300 - distInPx) * (mapScale / 2.625));
      hudAi.textContent = 'AI: Quá gần! Lùi giữ cự ly @ 400px/s (Nghiêng -25°)';
      hudAi.className = 'badge warning';
    } else if (distInPx > MAX_ATTACK_RANGE) {
      aiState = 'REPOSITIONING';
      currentFlySpeed = SPEED_FAST;
      locomotionState = 'FLY_FORWARD';
      targetVargostX = Math.min(W - 400, vargostX + (distInPx - 360) * (mapScale / 2.625));
      hudAi.textContent = 'AI: Quá xa! Tiến áp sát @ 400px/s (Nghiêng +25°)';
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
  // Locomotion Execution (4 Orthogonal Directions)
  // -------------------------------------------------------------
  // 1. FORWARD (Ngang phải, Nghiêng +25°, Có bóng mờ)
  if (locomotionState === 'FLY_FORWARD') {
    const rad = (25 * Math.PI) / 180; // 25 độ chốt
    currentTilt += (rad - currentTilt) * Math.min(dt * 8, 1);
    currentScaleX = 1.05;
    currentScaleY = 0.95;

    if (Math.abs(vargostX - targetVargostX) > 2) {
      const dir = Math.sign(targetVargostX - vargostX);
      vargostX += dir * flySpeed * dt;
      if ((dir > 0 && vargostX >= targetVargostX) || (dir < 0 && vargostX <= targetVargostX)) {
        vargostX = targetVargostX;
        locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
        hudLocomotion.textContent = isFlying ? 'Di chuyển: LƠ LỬNG TRÊN KHÔNG (Đứng thẳng 0°)' : 'Di chuyển: ĐỨNG TRÊN BỆ ĐÁ (Y=194)';
        hudLocomotion.className = isFlying ? 'badge' : 'badge ground';
      }
    } else {
      locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
      hudLocomotion.textContent = isFlying ? 'Di chuyển: LƠ LỬNG TRÊN KHÔNG (Đứng thẳng 0°)' : 'Di chuyển: ĐỨNG TRÊN BỆ ĐÁ (Y=194)';
      hudLocomotion.className = isFlying ? 'badge' : 'badge ground';
    }

    if (Math.random() < 0.4) {
      motionGhosts.push({ x: vargostX, y: vargostY, alpha: 0.45, tilt: currentTilt });
    }
  }
  // 2. BACKWARD (Ngang trái, Nghiêng -25°, Có bóng mờ, Trở về thẳng khi dừng)
  else if (locomotionState === 'FLY_BACKWARD') {
    const rad = (-25 * Math.PI) / 180; // -25 độ chốt
    currentTilt += (rad - currentTilt) * Math.min(dt * 8, 1);
    currentScaleX = 0.96;
    currentScaleY = 1.04;

    if (Math.abs(vargostX - targetVargostX) > 2) {
      const dir = Math.sign(targetVargostX - vargostX);
      vargostX += dir * flySpeed * dt;
      if ((dir > 0 && vargostX >= targetVargostX) || (dir < 0 && vargostX <= targetVargostX)) {
        vargostX = targetVargostX;
        locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
        hudLocomotion.textContent = isFlying ? 'Di chuyển: LƠ LỬNG TRÊN KHÔNG (Đứng thẳng 0°)' : 'Di chuyển: ĐỨNG TRÊN BỆ ĐÁ (Y=194)';
        hudLocomotion.className = isFlying ? 'badge' : 'badge ground';
      }
    } else {
      locomotionState = isFlying ? 'IDLE_FLY' : 'IDLE_GROUND';
      hudLocomotion.textContent = isFlying ? 'Di chuyển: LƠ LỬNG TRÊN KHÔNG (Đứng thẳng 0°)' : 'Di chuyển: ĐỨNG TRÊN BỆ ĐÁ (Y=194)';
      hudLocomotion.className = isFlying ? 'badge' : 'badge ground';
    }

    // Fix: Bổ sung bóng mờ cho chuyển động lùi
    if (Math.random() < 0.4) {
      motionGhosts.push({ x: vargostX, y: vargostY, alpha: 0.45, tilt: currentTilt });
    }
  }
  // 3. LANDING (Dọc xuống Y=194, Giữ thẳng 0°, Mượt mà dễ nhìn)
  else if (locomotionState === 'LANDING') {
    transitionProgress += dt * 1.5;
    const t = Math.min(1, transitionProgress);
    const ease = 1 - Math.pow(1 - t, 3);
    vargostY = baseFlyY + (groundY - baseFlyY) * ease;
    currentTilt += (0 - currentTilt) * Math.min(dt * 10, 1);

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
  // 4. TAKEOFF (Dọc lên Y=65, Giữ thẳng 0°, Mượt mà dễ nhìn)
  else if (locomotionState === 'TAKEOFF') {
    transitionProgress += dt * 1.5;
    const t = Math.min(1, transitionProgress);
    const ease = t * t * (3 - 2 * t);
    vargostY = groundY + (baseFlyY - groundY) * ease;
    currentScaleX = 0.90;
    currentScaleY = 1.12;
    currentTilt += (0 - currentTilt) * Math.min(dt * 10, 1);

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
  // Projectile Flight Update
  // -------------------------------------------------------------
  if (activeProjectile) {
    const p = activeProjectile;
    p.time += dt;
    const t = Math.min(1, p.time / p.duration);

    p.x = p.startX + (p.targetX - p.startX) * t;
    p.y = p.startY + (p.targetY - p.startY) * t;

    p.spinAccum += dt;
    if (p.spinAccum >= 0.035) {
      p.spinAccum -= 0.035;
      p.spinFrame = (p.spinFrame + 1) % 8;
    }

    if (t >= 1) {
      p.x = p.targetX;
      p.y = p.targetY;
      activeProjectile = null;

      spawnExplosion(p.targetX, p.targetY);
      hudProjectile.textContent = 'Blazing Halo: NỔ DIỆN RỘNG MẶT ĐẤT!';
      showToast('💥 BLAZING HALO TIẾP ĐẤT PHÁT NỔ CỰC ĐẠI @ 1100px/s!');
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
  // Render Scene
  // -------------------------------------------------------------
  drawScene(targetX, targetY);
  renderLoupe();

  requestAnimationFrame(update);
}

function drawScene(targetX, targetY) {
  ctx.clearRect(0, 0, W, H);

  // 1. Draw Map
  if (assets.map) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(assets.map, mapX, mapY, 512 * mapScale, 352 * mapScale);
  }

  // 2. Draw Target Reticle
  ctx.strokeStyle = '#f6ad55';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(targetX, targetY, 22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(targetX - 30, targetY);
  ctx.lineTo(targetX + 30, targetY);
  ctx.moveTo(targetX, targetY - 30);
  ctx.lineTo(targetX, targetY + 30);
  ctx.stroke();

  ctx.fillStyle = '#f6ad55';
  ctx.font = '13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Mục tiêu / Nền đá Y=194', targetX, targetY + 22);

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
    ctx.moveTo(vargostX + 20, vargostY - 20);
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
    ctx.scale(currentScaleX, currentScaleY);
    ctx.drawImage(
      assets.vargost,
      sx, sy, 200, 200,
      -anchorX * spriteScale, -anchorY * spriteScale,
      200 * spriteScale, 200 * spriteScale
    );
    ctx.restore();
  }

  // 4. Draw Vargost Body (Khung 200x200)
  ctx.save();
  ctx.translate(vargostX, vargostY + hoverOffset);
  ctx.rotate(currentTilt);
  ctx.scale(currentScaleX, currentScaleY);

  if (assets.vargost) {
    ctx.drawImage(
      assets.vargost,
      sx, sy, 200, 200,
      -anchorX * spriteScale, -anchorY * spriteScale,
      200 * spriteScale, 200 * spriteScale
    );
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

  // Character Status Label
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px monospace';
  ctx.textAlign = 'center';
  const labelStatus = isFlying ? `Bay @ ${currentFlySpeed}px/s (Nghiêng ${(currentTilt * 180 / Math.PI).toFixed(0)}°)` : 'Đứng trên bệ đá (0°)';
  ctx.fillText(`Vargost (${labelStatus})`, vargostX, vargostY + hoverOffset - 80 * spriteScale);

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
      const startX = vargostX + 20 * spriteScale;
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

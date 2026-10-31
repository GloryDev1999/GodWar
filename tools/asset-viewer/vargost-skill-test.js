// Vargost Utility AI & Pixel Inspector Simulator
// Auto-battler 3v3 Engine Demo (GodWar)
// Chế độ 2 Kỹ năng: Đánh Thường (Combo 2 đòn + Tụ Lửa + Tích Nộ) & Blazing Halo (Tối Thượng)

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

// Rage Bar Elements
const rageBarFill = document.getElementById('rage-bar-fill');
const rageText = document.getElementById('rage-text');
const btnFillRage = document.getElementById('btn-fill-rage');
const btnResetRage = document.getElementById('btn-reset-rage');

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
const kfRelease = document.getElementById('kf-release');
const kfReignite = document.getElementById('kf-reignite');
const kfBa1Fold = document.getElementById('kf-ba1-fold');
const kfBa1Throw = document.getElementById('kf-ba1-throw');
const kfBa2Fold = document.getElementById('kf-ba2-fold');
const kfBa2Throw = document.getElementById('kf-ba2-throw');

// Combat & Locomotion Controls
const btnFlyForward = document.getElementById('btn-fly-forward');
const btnFlyBackward = document.getElementById('btn-fly-backward');
const btnLand = document.getElementById('btn-land');
const btnTakeoff = document.getElementById('btn-takeoff');
const btnBasicAttack = document.getElementById('btn-basic-attack');
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
const DEFAULT_FLY_SPEED = 900;
const MAX_FRAME_INDEX = 94;

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

// Locomotion States: 'IDLE_FLY', 'FLY_FORWARD', 'FLY_BACKWARD', 'LANDING', 'IDLE_GROUND', 'TAKEOFF'
let locomotionState = 'IDLE_FLY';
let transitionProgress = 0;

// Combat AI States:
// 'IDLE', 'REPOSITIONING'
// 'BA1_WINDUP', 'BA1_RECOVERY', 'BA1_WAIT_HIT'
// 'BA2_WINDUP', 'BA2_RECOVERY', 'BA2_WAIT_HIT'
// 'BA_REIGNITE'
// 'HALO_WINDUP', 'HALO_CHARGED', 'HALO_RELEASE', 'HALO_RECOVERY'
let aiState = 'IDLE';
let pendingCombatAction = null; // 'BASIC_ATTACK' or 'BLAZING_HALO'
let isPlaying = true;
let currentFrameIndex = 0;
let frameTimeAccumulator = 0;
let hoverTimer = 0;
let autoCooldown = 2.0;

// Rage State (0 to 100)
let currentRage = 0;

// Motion ghosting afterimages for high-speed flight
const motionGhosts = [];

// Projectiles & Impact VFX
let activeProjectile = null;
let activeExplosion = null;
const groundDustRings = [];

// Inspector State
let mouseX = 0, mouseY = 0;
let isPickingSpawn = false;
let lastHoveredDx = 20, lastHoveredDy = -52;

// Load Assets
const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`Không thể nạp: ${url}`));
  img.src = url;
});

let assets = null;
let lastTimestamp = null;

async function init() {
  hudState.textContent = 'Trạng thái: Đang nạp tài nguyên...';
  try {
    const [mapImg, manifestRes, vargostAtlas, projAtlas, explAtlas] = await Promise.all([
      loadImage('/Asset/Scenes/amore_scale_test/map.png'),
      fetch('/Asset/Character/characters/vargost_combat/vargost_actions.json').then(r => r.json()),
      loadImage('/Asset/Character/characters/vargost_combat/vargost_body_atlas.png'),
      loadImage('/Asset/Character/characters/vargost_combat/projectile_sheet.png'),
      loadImage('/Asset/Character/characters/vargost_combat/vfx_fire_explosion_sheet.png'),
    ]);

    assets = {
      map: mapImg,
      manifest: manifestRes,
      vargost: vargostAtlas,
      projectile: projAtlas,
      explosion: explAtlas,
    };

    setRage(0);
    updateCurrentSpawnDisplay();
    hudState.textContent = 'Trạng thái: SẴN SÀNG (LƠ LỬNG TRÊN KHÔNG)';
    hudAi.textContent = 'AI: Tuần tra trên không';
    requestAnimationFrame(mainLoop);
  } catch (err) {
    console.error(err);
    hudState.textContent = `Lỗi: ${err.message}`;
  }
}

function showToast(text) {
  toastMsg.textContent = text;
  toastMsg.classList.add('show');
  setTimeout(() => toastMsg.classList.remove('show'), 2000);
}

function setRage(val) {
  currentRage = Math.max(0, Math.min(100, Math.round(val)));
  if (rageBarFill) {
    rageBarFill.style.width = `${currentRage}%`;
    if (currentRage >= 100) {
      rageBarFill.classList.add('ready');
    } else {
      rageBarFill.classList.remove('ready');
    }
  }
  if (rageText) {
    if (currentRage >= 100) {
      rageText.innerHTML = `<b style="color: #ffc379;">100% (ĐẦY NỘ - SẴN SÀNG BLAZING HALO!)</b>`;
    } else {
      rageText.textContent = `${currentRage}% / 100% (Đánh thường để tích nộ)`;
    }
  }
  if (btnBlazingHalo) {
    if (currentRage >= 100) {
      btnBlazingHalo.disabled = false;
      btnBlazingHalo.style.opacity = '1';
      btnBlazingHalo.style.cursor = 'pointer';
      btnBlazingHalo.style.borderColor = '#ffc379';
    } else {
      btnBlazingHalo.disabled = true;
      btnBlazingHalo.style.opacity = '0.5';
      btnBlazingHalo.style.cursor = 'not-allowed';
      btnBlazingHalo.style.borderColor = '#ff9b53';
    }
  }
}

if (btnFillRage) {
  btnFillRage.addEventListener('click', () => {
    setRage(100);
    showToast('⚡ Đã nạp đầy 100% Nộ khí!');
  });
}

if (btnResetRage) {
  btnResetRage.addEventListener('click', () => {
    setRage(0);
    showToast('Đã đặt lại Nộ về 0%');
  });
}

function updateCurrentSpawnDisplay() {
  const dx = Number(numSpawnDx.value);
  const dy = Number(numSpawnDy.value);
  inspCurrentSpawn.textContent = `dx: ${dx >= 0 ? '+' : ''}${dx}, dy: ${dy >= 0 ? '+' : ''}${dy}`;
}

numSpawnDx.addEventListener('input', updateCurrentSpawnDisplay);
numSpawnDy.addEventListener('input', updateCurrentSpawnDisplay);

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
kfIdle.addEventListener('click', () => selectFrame(0));
kfWindup.addEventListener('click', () => selectFrame(44));
kfCharged.addEventListener('click', () => selectFrame(63));
kfRelease.addEventListener('click', () => selectFrame(68));
kfReignite.addEventListener('click', () => selectFrame(74));
kfBa1Fold.addEventListener('click', () => selectFrame(83));
kfBa1Throw.addEventListener('click', () => selectFrame(85));
kfBa2Fold.addEventListener('click', () => selectFrame(89));
kfBa2Throw.addEventListener('click', () => selectFrame(91));

// Locomotion Commands
btnFlyForward.addEventListener('click', () => {
  targetVargostX = Math.min(W - 400, vargostX + 120 * mapScale);
  if (!isFlying) takeoff();
  locomotionState = 'FLY_FORWARD';
  hudLocomotion.textContent = 'Di chuyển: BAY TIẾN TỚI (+120px)';
  hudLocomotion.className = 'badge flying';
});

btnFlyBackward.addEventListener('click', () => {
  targetVargostX = Math.max(mapX + 100, vargostX - 120 * mapScale);
  if (!isFlying) takeoff();
  locomotionState = 'FLY_BACKWARD';
  hudLocomotion.textContent = 'Di chuyển: BAY LÙI GIỮ CỰ LY (-120px)';
  hudLocomotion.className = 'badge warning';
});

function land() {
  if (!isFlying || locomotionState === 'LANDING') return;
  locomotionState = 'LANDING';
  transitionProgress = 0;
  hudLocomotion.textContent = 'Di chuyển: ĐANG HẠ CÁNH XUỐNG BỆ ĐÁ...';
  hudLocomotion.className = 'badge ground';
}

function takeoff() {
  if (isFlying && locomotionState !== 'LANDING') return;
  locomotionState = 'TAKEOFF';
  transitionProgress = 0;
  hudLocomotion.textContent = 'Di chuyển: CẤT CÁNH BAY LÊN TRỜI...';
  hudLocomotion.className = 'badge flying';
}

btnLand.addEventListener('click', land);
btnTakeoff.addEventListener('click', takeoff);

// Sliders
rngDistance.addEventListener('input', () => {
  lblDistance.textContent = `${rngDistance.value}px`;
});
rngFlySpeed.addEventListener('input', () => {
  lblFlySpeed.textContent = `${rngFlySpeed.value}px/s`;
});
rngTilt.addEventListener('input', () => {
  lblTilt.textContent = `${rngTilt.value}°`;
});

btnTestNear.addEventListener('click', () => {
  rngDistance.value = 80;
  lblDistance.textContent = '80px';
  orderBasicAttack();
});
btnTestFar.addEventListener('click', () => {
  rngDistance.value = 680;
  lblDistance.textContent = '680px';
  orderBasicAttack();
});

btnReset.addEventListener('click', () => {
  vargostX = mapX + 180.0 * mapScale;
  vargostY = baseFlyY;
  targetVargostX = vargostX;
  isFlying = true;
  locomotionState = 'IDLE_FLY';
  aiState = 'IDLE';
  pendingCombatAction = null;
  currentFrameIndex = 0;
  isPlaying = true;
  btnPlayPause.textContent = '⏸ Tạm dừng';
  rngDistance.value = 350;
  lblDistance.textContent = '350px';
  rngFlySpeed.value = 900;
  lblFlySpeed.textContent = '900px/s';
  rngTilt.value = 12;
  lblTilt.textContent = '12°';
  numSpawnDx.value = 20;
  numSpawnDy.value = -52;
  updateCurrentSpawnDisplay();
  setRage(0);
  activeProjectile = null;
  activeExplosion = null;
  groundDustRings.length = 0;
  motionGhosts.length = 0;
  hudAi.textContent = 'AI: Đã đặt lại';
  hudAi.className = 'badge';
  hudLocomotion.textContent = 'Di chuyển: LƠ LỬNG TRÊN KHÔNG';
  hudLocomotion.className = 'badge';
  hudState.textContent = 'Trạng thái: SẴN SÀNG (LƠ LỬNG)';
  hudState.className = 'badge';
  hudProjectile.textContent = 'Đạn: Sẵn sàng';
});

// Inspector Mouse Events
stageCanvas.addEventListener('mousemove', (e) => {
  const rect = stageCanvas.getBoundingClientRect();
  const scaleX = stageCanvas.width / rect.width;
  const scaleY = stageCanvas.height / rect.height;
  mouseX = Math.round((e.clientX - rect.left) * scaleX);
  mouseY = Math.round((e.clientY - rect.top) * scaleY);

  hudCoords.textContent = `Con trỏ: (${mouseX}, ${mouseY})`;
  inspCanvasXy.textContent = `${mouseX}, ${mouseY}`;

  if (!assets) return;
  const spriteScale = assets.manifest.display_scale * (zoom / 0.7);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;
  const charOriginX = vargostX;
  const charOriginY = vargostY + hoverOffset;

  const dx = Math.round((mouseX - charOriginX) / spriteScale);
  const dy = Math.round((mouseY - charOriginY) / spriteScale);
  lastHoveredDx = dx;
  lastHoveredDy = dy;
  inspAnchorDxy.textContent = `dx: ${dx >= 0 ? '+' : ''}${dx}, dy: ${dy >= 0 ? '+' : ''}${dy}`;

  // Pixel RGBA extraction
  try {
    const p = ctx.getImageData(mouseX, mouseY, 1, 1).data;
    inspRgba.textContent = `${p[0]}, ${p[1]}, ${p[2]}, ${p[3]}`;
    const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1)}`;
    inspHex.textContent = hex;
    inspColorBox.style.backgroundColor = `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${p[3] / 255})`;
  } catch (err) {}

  renderLoupe(mouseX, mouseY);
});

btnPickSpawn.addEventListener('click', () => {
  isPickingSpawn = true;
  btnPickSpawn.textContent = '🎯 ĐANG CHỜ CLICK TRÊN VARGOST...';
  btnPickSpawn.style.background = '#bd561d';
});

stageCanvas.addEventListener('click', () => {
  if (isPickingSpawn) {
    numSpawnDx.value = lastHoveredDx;
    numSpawnDy.value = lastHoveredDy;
    updateCurrentSpawnDisplay();
    isPickingSpawn = false;
    btnPickSpawn.textContent = '📌 Nhấp vào đây rồi click trên Vargost để gán điểm phóng';
    btnPickSpawn.style.background = '';
    showToast(`Đã gán điểm phóng: dx=${lastHoveredDx}, dy=${lastHoveredDy}`);
  }
});

btnCopyCoords.addEventListener('click', () => {
  const text = `dx: ${numSpawnDx.value}, dy: ${numSpawnDy.value}`;
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Đã sao chép: ${text}`);
  }).catch(() => {
    showToast(`Tọa độ: ${text}`);
  });
});

function renderLoupe(cx, cy) {
  if (!chkInspector.checked) return;
  const loupeW = 15;
  const loupeH = 15;
  const sx = Math.max(0, Math.min(W - loupeW, cx - Math.floor(loupeW / 2)));
  const sy = Math.max(0, Math.min(H - loupeH, cy - Math.floor(loupeH / 2)));

  try {
    const imgData = ctx.getImageData(sx, sy, loupeW, loupeH);
    loupeCtx.imageSmoothingEnabled = false;

    // Clear loupe canvas
    loupeCtx.fillStyle = '#000';
    loupeCtx.fillRect(0, 0, 150, 150);

    // Draw pixel grid (each pixel is 10x10)
    for (let y = 0; y < loupeH; y++) {
      for (let x = 0; x < loupeW; x++) {
        const i = (y * loupeW + x) * 4;
        const r = imgData.data[i];
        const g = imgData.data[i + 1];
        const b = imgData.data[i + 2];
        const a = imgData.data[i + 3] / 255;

        loupeCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        loupeCtx.fillRect(x * 10, y * 10, 10, 10);

        // Pixel border
        loupeCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        loupeCtx.strokeRect(x * 10, y * 10, 10, 10);
      }
    }

    // Highlight center pixel
    loupeCtx.strokeStyle = '#f85149';
    loupeCtx.lineWidth = 2;
    loupeCtx.strokeRect(7 * 10, 7 * 10, 10, 10);
  } catch (err) {}
}

// -------------------------------------------------------------
// Skill Orders & Combat State Machine
// -------------------------------------------------------------
function orderBasicAttack() {
  if (aiState !== 'IDLE' && aiState !== 'REPOSITIONING') return;
  pendingCombatAction = 'BASIC_ATTACK';
  isPlaying = true;
  btnPlayPause.textContent = '⏸ Tạm dừng';
}

function orderBlazingHalo() {
  if (currentRage < 100) {
    showToast('⚠️ Chưa đủ Nộ! Cần đánh thường tích đủ 100% Nộ để thi triển Blazing Halo.');
    return;
  }
  if (aiState !== 'IDLE' && aiState !== 'REPOSITIONING') return;
  pendingCombatAction = 'BLAZING_HALO';
  isPlaying = true;
  btnPlayPause.textContent = '⏸ Tạm dừng';
}

btnBasicAttack.addEventListener('click', orderBasicAttack);
btnBlazingHalo.addEventListener('click', orderBlazingHalo);
if (btnCastLegacy) {
  btnCastLegacy.addEventListener('click', () => {
    if (currentRage >= 100) orderBlazingHalo();
    else orderBasicAttack();
  });
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyQ') {
    e.preventDefault();
    orderBasicAttack();
  } else if (e.code === 'KeyR' || e.code === 'Space') {
    e.preventDefault();
    orderBlazingHalo();
  }
});

function startBasicAttack1() {
  aiState = 'BA1_WINDUP';
  pendingCombatAction = null;
  currentFrameIndex = 83;
  frameTimeAccumulator = 0;
  hudState.textContent = 'Đòn 1: TAY TRÁI NÉM (dx=-15, dy=-48) - Mất vòng lửa tay trái';
  hudState.className = 'badge active';
  hudAi.textContent = 'AI: Đánh thường Đòn 1 (Tay trái ném)';
  hudAi.className = 'badge active';
}

function startBasicAttack2() {
  aiState = 'BA2_WINDUP';
  currentFrameIndex = 89;
  frameTimeAccumulator = 0;
  hudState.textContent = 'Đòn 2: TAY PHẢI NÉM (dx=+24, dy=-48) - 2 tay đều rỗng';
  hudState.className = 'badge active';
  hudAi.textContent = 'AI: Đánh thường Đòn 2 (Tay phải ném)';
  hudAi.className = 'badge active';
}

function startReignite() {
  aiState = 'BA_REIGNITE';
  currentFrameIndex = 74;
  frameTimeAccumulator = 0;
  hudState.textContent = 'Hồi chiêu: TỤ LẠI 2 VÒNG LỬA (Frame 74-77)';
  hudState.className = 'badge';
  hudAi.textContent = 'AI: Gọi lại 2 vòng lửa';
  hudAi.className = 'badge';
}

function startBlazingHalo() {
  aiState = 'HALO_WINDUP';
  pendingCombatAction = null;
  currentFrameIndex = 44;
  frameTimeAccumulator = 0;
  hudState.textContent = 'Tối Thượng: VẬN CÔNG GOM VÒNG LỚN (Frame 44)';
  hudState.className = 'badge active';
  hudAi.textContent = 'AI: Thi triển Blazing Halo';
  hudAi.className = 'badge active';
}

// -------------------------------------------------------------
// Projectile Spawner
// -------------------------------------------------------------
function spawnSmallProjectile(targetX, targetY, isLeftHand) {
  const spriteScale = assets.manifest.display_scale * (zoom / 0.7);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

  // Offsets: Right hand [24, -48], Left hand [-15, -48]
  const dx = isLeftHand ? -15 : 24;
  const dy = -48;

  const cos = Math.cos(currentTilt);
  const sin = Math.sin(currentTilt);
  const rdx = dx * cos - dy * sin;
  const rdy = dx * sin + dy * cos;

  const startX = vargostX + rdx * spriteScale;
  const startY = (vargostY + hoverOffset) + rdy * spriteScale;

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
    isSmall: true,
    size: 56 * spriteScale,
    speed: 1100,
    onHit: isLeftHand ? 'ON_HIT_D2' : 'ON_HIT_D1'
  };

  hudProjectile.textContent = isLeftHand ? 'Đạn 2: Phóng vòng nhỏ từ tay trái' : 'Đạn 1: Phóng vòng nhỏ từ tay phải';
}

function spawnLargeProjectile(targetX, targetY) {
  const spriteScale = assets.manifest.display_scale * (zoom / 0.7);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

  // Offset from both hands pushed forward [20, -52]
  const dx = Number(numSpawnDx.value);
  const dy = Number(numSpawnDy.value);

  const cos = Math.cos(currentTilt);
  const sin = Math.sin(currentTilt);
  const rdx = dx * cos - dy * sin;
  const rdy = dx * sin + dy * cos;

  const startX = vargostX + rdx * spriteScale;
  const startY = (vargostY + hoverOffset) + rdy * spriteScale;

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
    isSmall: false,
    size: 80 * spriteScale,
    speed: 900,
    onHit: 'ON_HIT_HALO'
  };

  hudProjectile.textContent = 'Đạn: ĐANG PHÓNG VÒNG LỚN BLAZING HALO';
}

function spawnExplosion(x, y, isSmall) {
  activeExplosion = {
    x: x,
    y: y,
    frame: 0,
    timeAccum: 0,
    isSmall: isSmall,
    maxFrames: isSmall ? 40 : 91
  };
}

// -------------------------------------------------------------
// Main Animation & Physics Loop
// -------------------------------------------------------------
function mainLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const rawDt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
  lastTimestamp = timestamp;

  const rate = Number(selRate.value);
  const dt = rawDt * rate;

  update(dt);
  render();

  requestAnimationFrame(mainLoop);
}

function update(dt) {
  if (!assets) return;

  hoverTimer += dt;
  const flySpeed = Number(rngFlySpeed.value);
  const targetTiltDeg = Number(rngTilt.value);

  // Target coordinates on ground stone platform
  const userDist = Number(rngDistance.value) * (mapScale / 2.625);
  const targetX = mapX + 220.0 * mapScale + userDist;
  const targetY = groundY;

  const currentDist = targetX - vargostX;
  const distInPx = Math.round(currentDist / (mapScale / 2.625));
  hudRange.textContent = `Cự ly: ${distInPx}px (Tầm: 150-550)`;

  const inRange = (distInPx >= MIN_ATTACK_RANGE && distInPx <= MAX_ATTACK_RANGE);
  hudRange.className = inRange ? 'badge active' : 'badge warning';

  // Auto-Cast AI Loop
  if (chkAuto.checked && aiState === 'IDLE' && !pendingCombatAction) {
    autoCooldown -= dt;
    if (autoCooldown <= 0) {
      if (currentRage >= 100) {
        orderBlazingHalo();
      } else {
        orderBasicAttack();
      }
      autoCooldown = 3.5;
    }
  }

  // Utility AI Range Evaluation
  if (pendingCombatAction && aiState === 'IDLE') {
    if (distInPx < MIN_ATTACK_RANGE) {
      aiState = 'REPOSITIONING';
      locomotionState = 'FLY_BACKWARD';
      hudAi.textContent = 'AI: Quá gần! Bay lùi giữ cự ly @ ' + flySpeed + 'px/s';
      hudAi.className = 'badge warning';
    } else if (distInPx > MAX_ATTACK_RANGE) {
      aiState = 'REPOSITIONING';
      locomotionState = 'FLY_FORWARD';
      hudAi.textContent = 'AI: Quá xa! Bay tiến tới áp sát @ ' + flySpeed + 'px/s';
      hudAi.className = 'badge flying';
    } else {
      if (pendingCombatAction === 'BASIC_ATTACK') startBasicAttack1();
      else if (pendingCombatAction === 'BLAZING_HALO') startBlazingHalo();
    }
  }

  // AI Repositioning Movement
  if (aiState === 'REPOSITIONING') {
    const moveStep = flySpeed * dt;
    if (distInPx < MIN_ATTACK_RANGE) {
      vargostX -= moveStep;
      if (distInPx >= MIN_ATTACK_RANGE + 35) {
        if (pendingCombatAction === 'BASIC_ATTACK') startBasicAttack1();
        else if (pendingCombatAction === 'BLAZING_HALO') startBlazingHalo();
      }
    } else if (distInPx > MAX_ATTACK_RANGE) {
      vargostX += moveStep;
      if (distInPx <= MAX_ATTACK_RANGE - 35) {
        if (pendingCombatAction === 'BASIC_ATTACK') startBasicAttack1();
        else if (pendingCombatAction === 'BLAZING_HALO') startBlazingHalo();
      }
    }
  }

  // Locomotion Execution
  if (locomotionState === 'FLY_FORWARD') {
    const rad = (targetTiltDeg * Math.PI) / 180;
    currentTilt += (rad - currentTilt) * Math.min(dt * 8, 1);
    currentScaleX = 1.05;
    currentScaleY = 0.95;

    if (Math.abs(vargostX - targetVargostX) > 2) {
      const dir = Math.sign(targetVargostX - vargostX);
      vargostX += dir * flySpeed * dt;
      if ((dir > 0 && vargostX >= targetVargostX) || (dir < 0 && vargostX <= targetVargostX)) {
        vargostX = targetVargostX;
        locomotionState = 'IDLE_FLY';
        hudLocomotion.textContent = 'Di chuyển: LƠ LỬNG TRÊN KHÔNG';
        hudLocomotion.className = 'badge';
      }
    }
    if (Math.random() < 0.35) {
      motionGhosts.push({ x: vargostX, y: vargostY, alpha: 0.35 });
    }
  } else if (locomotionState === 'FLY_BACKWARD') {
    const rad = (-10 * Math.PI) / 180;
    currentTilt += (rad - currentTilt) * Math.min(dt * 8, 1);
    currentScaleX = 0.96;
    currentScaleY = 1.04;

    if (Math.abs(vargostX - targetVargostX) > 2) {
      const dir = Math.sign(targetVargostX - vargostX);
      vargostX += dir * flySpeed * dt;
      if ((dir > 0 && vargostX >= targetVargostX) || (dir < 0 && vargostX <= targetVargostX)) {
        vargostX = targetVargostX;
        locomotionState = 'IDLE_FLY';
        hudLocomotion.textContent = 'Di chuyển: LƠ LỬNG TRÊN KHÔNG';
        hudLocomotion.className = 'badge';
      }
    }
  } else if (locomotionState === 'LANDING') {
    transitionProgress += dt * 1.8;
    const t = Math.min(1, transitionProgress);
    const ease = 1 - Math.pow(1 - t, 3);
    vargostY = baseFlyY + (groundY - baseFlyY) * ease;
    currentTilt += (0 - currentTilt) * Math.min(dt * 10, 1);

    if (t >= 1) {
      vargostY = groundY;
      isFlying = false;
      locomotionState = 'IDLE_GROUND';
      currentScaleX = 1.15;
      currentScaleY = 0.85;
      groundDustRings.push({ x: vargostX, y: groundY, radius: 10, alpha: 0.8 });
      hudLocomotion.textContent = 'Di chuyển: ĐÃ ĐÁP XUỐNG BỆ ĐÁ (Y=194)';
      hudLocomotion.className = 'badge ground';
    }
  } else if (locomotionState === 'TAKEOFF') {
    transitionProgress += dt * 1.8;
    const t = Math.min(1, transitionProgress);
    const ease = t * t * (3 - 2 * t);
    vargostY = groundY + (baseFlyY - groundY) * ease;
    currentScaleX = 0.90;
    currentScaleY = 1.12;

    if (t >= 1) {
      vargostY = baseFlyY;
      isFlying = true;
      locomotionState = 'IDLE_FLY';
      hudLocomotion.textContent = 'Di chuyển: LƠ LỬNG TRÊN KHÔNG';
      hudLocomotion.className = 'badge';
    }
  } else if (locomotionState === 'IDLE_FLY') {
    currentTilt += (0 - currentTilt) * Math.min(dt * 8, 1);
    currentScaleX += (1.0 - currentScaleX) * Math.min(dt * 8, 1);
    currentScaleY += (1.0 - currentScaleY) * Math.min(dt * 8, 1);
  } else if (locomotionState === 'IDLE_GROUND') {
    currentTilt = 0;
    currentScaleX += (1.0 - currentScaleX) * Math.min(dt * 8, 1);
    currentScaleY += (1.0 - currentScaleY) * Math.min(dt * 8, 1);
  }

  // Motion Ghosts
  for (let i = motionGhosts.length - 1; i >= 0; i--) {
    motionGhosts[i].alpha -= dt * 2.5;
    if (motionGhosts[i].alpha <= 0) motionGhosts.splice(i, 1);
  }

  // Dust Rings
  for (let i = groundDustRings.length - 1; i >= 0; i--) {
    const d = groundDustRings[i];
    d.radius += dt * 60;
    d.alpha -= dt * 1.5;
    if (d.alpha <= 0) groundDustRings.splice(i, 1);
  }

  // Frame Progression
  const frameDur = 0.06;
  if (isPlaying) {
    frameTimeAccumulator += dt;
    if (frameTimeAccumulator >= frameDur) {
      frameTimeAccumulator -= frameDur;

      if (aiState === 'IDLE' || aiState === 'REPOSITIONING') {
        currentFrameIndex = (currentFrameIndex + 1) % 22;
      }
      // Basic Attack 1 (83 -> 84 -> 85 -> 86 -> 87 -> 88)
      else if (aiState === 'BA1_WINDUP') {
        currentFrameIndex++;
        if (currentFrameIndex === 85) {
          spawnSmallProjectile(targetX, targetY, true);
          aiState = 'BA1_RECOVERY';
          hudState.textContent = 'Đòn 1: PHÓNG VÒNG LỬA TAY TRÁI (FRAME 85)';
        }
      } else if (aiState === 'BA1_RECOVERY') {
        currentFrameIndex++;
        if (currentFrameIndex >= 88) {
          currentFrameIndex = 88;
          aiState = 'BA1_WAIT_HIT';
          hudState.textContent = 'Đòn 1: TAY TRÁI THU VỀ RỖNG - ĐỢI ĐẠN CHẠM ĐÍCH';
        }
      }
      // Basic Attack 2 (89 -> 90 -> 91 -> 92 -> 93 -> 94)
      else if (aiState === 'BA2_WINDUP') {
        currentFrameIndex++;
        if (currentFrameIndex === 91) {
          spawnSmallProjectile(targetX, targetY, false);
          aiState = 'BA2_RECOVERY';
          hudState.textContent = 'Đòn 2: PHÓNG VÒNG LỬA TAY PHẢI (FRAME 91)';
        }
      } else if (aiState === 'BA2_RECOVERY') {
        currentFrameIndex++;
        if (currentFrameIndex >= 94) {
          currentFrameIndex = 94;
          aiState = 'BA2_WAIT_HIT';
          hudState.textContent = 'Đòn 2: 2 TAY ĐỀU RỖNG - ĐỢI ĐẠN CHẠM ĐÍCH';
        }
      }
      // Reignite Sequence (72 -> 77 -> 82 -> loop to 0)
      else if (aiState === 'BA_REIGNITE') {
        currentFrameIndex++;
        if (currentFrameIndex > 82) {
          currentFrameIndex = 0;
          aiState = 'IDLE';
          hudState.textContent = isFlying ? 'Trạng thái: SẴN SÀNG (LƠ LỬNG)' : 'Trạng thái: SẴN SÀNG (ĐỨNG TRÊN BỆ)';
          hudAi.textContent = 'AI: Tuần tra';
        }
      }
      // Blazing Halo Ultimate (44..63..67 -> 68 release -> 69..82 recovery)
      else if (aiState === 'HALO_WINDUP') {
        currentFrameIndex++;
        if (currentFrameIndex === 63) {
          hudState.textContent = 'Tối Thượng: ĐÃ GOM THÀNH 1 VÒNG LỚN (Frame 63)';
        }
        if (currentFrameIndex === 68) {
          spawnLargeProjectile(targetX, targetY);
          setRage(0); // Consume 100% Rage
          aiState = 'HALO_RECOVERY';
          hudState.textContent = 'Tối Thượng: PHÓNG VÒNG LỚN (Frame 68)';
        }
      } else if (aiState === 'HALO_RECOVERY') {
        currentFrameIndex++;
        if (currentFrameIndex > 82) {
          currentFrameIndex = 0;
          aiState = 'IDLE';
          hudState.textContent = isFlying ? 'Trạng thái: SẴN SÀNG (LƠ LỬNG)' : 'Trạng thái: SẴN SÀNG (ĐỨNG TRÊN BỆ)';
          hudAi.textContent = 'AI: Tuần tra';
        }
      }

      rngFrame.value = currentFrameIndex;
      lblFrameNum.textContent = currentFrameIndex;
    }
  }

  hudFrame.textContent = `Frame: ${currentFrameIndex}/${MAX_FRAME_INDEX}`;

  // Projectile Flight Physics
  if (activeProjectile) {
    const p = activeProjectile;
    p.time += dt;

    p.spinAccum += dt;
    if (p.spinAccum >= 0.035) {
      p.spinAccum -= 0.035;
      p.spinFrame = (p.spinFrame + 1) % 8;
    }

    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    const distRem = Math.sqrt(dx * dx + dy * dy);
    const step = p.speed * dt;

    if (distRem <= step || p.x >= p.targetX || p.y >= p.targetY) {
      // Hit target!
      p.x = p.targetX;
      p.y = p.targetY;
      const hitAction = p.onHit;
      activeProjectile = null;

      if (hitAction === 'ON_HIT_D1') {
        spawnExplosion(p.targetX, p.targetY, true);
        setRage(currentRage + 25);
        showToast('🎯 Đòn 1 trúng mục tiêu! +25% Nộ');
        hudProjectile.textContent = 'Đạn 1: Trúng đích! Kích hoạt Đòn 2';
        startBasicAttack2();
      } else if (hitAction === 'ON_HIT_D2') {
        spawnExplosion(p.targetX, p.targetY, true);
        setRage(currentRage + 25);
        showToast('🎯 Đòn 2 trúng mục tiêu! +25% Nộ (Tổng +50%)');
        hudProjectile.textContent = 'Đạn 2: Trúng đích! Bắt đầu Tụ Lại 2 Vòng Lửa';
        startReignite();
      } else if (hitAction === 'ON_HIT_HALO') {
        spawnExplosion(p.targetX, p.targetY, false);
        hudProjectile.textContent = 'Blazing Halo: NỔ DIỆN RỘNG MẶT ĐẤT!';
        showToast('💥 BLAZING HALO TIẾP ĐẤT PHÁT NỔ CỰC ĐẠI!');
      }
    } else {
      p.x += (dx / distRem) * step;
      p.y += (dy / distRem) * step;
      hudProjectile.textContent = `Đạn: Bay xoay 8 frame (${Math.round(p.x)}, ${Math.round(p.y)}) @ ${p.speed}px/s`;
    }
  }

  // Explosion Progression
  if (activeExplosion) {
    const exp = activeExplosion;
    exp.timeAccum += dt;
    const expFrameDur = 1 / 30;
    if (exp.timeAccum >= expFrameDur) {
      exp.timeAccum -= expFrameDur;
      exp.frame++;
      if (exp.frame >= exp.maxFrames) activeExplosion = null;
    }
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);

  // Sky background
  ctx.fillStyle = '#78a6cf';
  ctx.fillRect(0, 0, W, H);

  if (!assets) return;

  // 1. Draw Map
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(assets.map, mapX, mapY, 512 * mapScale, 352 * mapScale);

  // 2. Draw Target Area on Ground (Y = 194)
  const userDist = Number(rngDistance.value) * (mapScale / 2.625);
  const targetX = mapX + 220.0 * mapScale + userDist;
  const targetY = groundY;

  // Attack range boundary
  const rMinX = vargostX + MIN_ATTACK_RANGE * (mapScale / 2.625);
  const rMaxX = vargostX + MAX_ATTACK_RANGE * (mapScale / 2.625);

  ctx.fillStyle = 'rgba(72, 187, 120, 0.12)';
  ctx.fillRect(rMinX, mapY, rMaxX - rMinX, 352 * mapScale);
  ctx.strokeStyle = 'rgba(72, 187, 120, 0.6)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(rMinX, mapY, rMaxX - rMinX, 352 * mapScale);
  ctx.setLineDash([]);

  // Target impact ellipse on rock platform
  ctx.strokeStyle = '#ed8936';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(targetX, targetY, 30 * (mapScale / 2.625), 11 * (mapScale / 2.625), 0, 0, Math.PI * 2);
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
  if (aiState.includes('WINDUP') || aiState.includes('RELEASE') || aiState.includes('WAIT')) {
    ctx.strokeStyle = 'rgba(237, 137, 54, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(vargostX + 20, vargostY - 50);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 3. Draw Motion Ghosts
  const spriteScale = assets.manifest.display_scale * (zoom / 0.7);
  const anchorX = assets.manifest.anchor_px[0];
  const anchorY = assets.manifest.anchor_px[1];
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

  const fCol = currentFrameIndex % 10;
  const fRow = Math.floor(currentFrameIndex / 10);
  const sx = fCol * 200;
  const sy = fRow * 200;

  for (const ghost of motionGhosts) {
    ctx.save();
    ctx.globalAlpha = ghost.alpha;
    ctx.translate(ghost.x, ghost.y + hoverOffset);
    ctx.rotate(currentTilt);
    ctx.scale(currentScaleX, currentScaleY);
    ctx.drawImage(
      assets.vargost,
      sx, sy, 200, 200,
      -anchorX * spriteScale, -anchorY * spriteScale,
      200 * spriteScale, 200 * spriteScale
    );
    ctx.restore();
  }

  // 4. Draw Vargost Body
  ctx.save();
  ctx.translate(vargostX, vargostY + hoverOffset);
  ctx.rotate(currentTilt);
  ctx.scale(currentScaleX, currentScaleY);

  ctx.drawImage(
    assets.vargost,
    sx, sy, 200, 200,
    -anchorX * spriteScale, -anchorY * spriteScale,
    200 * spriteScale, 200 * spriteScale
  );

  // Reticle circle on inspector
  if (chkInspector.checked) {
    const spDx = Number(numSpawnDx.value);
    const spDy = Number(numSpawnDy.value);
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
  const labelStatus = isFlying ? 'Bay @ 900px/s' : 'Đứng trên bệ đá';
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
  // Connect the ring continuously so it never disappears!
  else if (!isPlaying) {
    // Blazing Halo Throw Flight (Frames 68 to 74)
    if (currentFrameIndex >= 68 && currentFrameIndex <= 74) {
      const t = (currentFrameIndex - 68) / 6.0;
      const startX = vargostX + 20 * spriteScale;
      const startY = (vargostY + hoverOffset) - 52 * spriteScale;
      renderProjX = startX + (targetX - startX) * t;
      renderProjY = startY + (targetY - startY) * t;
      renderProjSize = 80 * spriteScale;
      renderSpinFrame = (currentFrameIndex * 2) % 8;
    }
    // Basic Attack 1 Throw Flight (Frames 85 to 88) - Left Hand Throw
    else if (currentFrameIndex >= 85 && currentFrameIndex <= 88) {
      const t = (currentFrameIndex - 85) / 3.0;
      const startX = vargostX - 15 * spriteScale;
      const startY = (vargostY + hoverOffset) - 48 * spriteScale;
      renderProjX = startX + (targetX - startX) * t;
      renderProjY = startY + (targetY - startY) * t;
      renderProjSize = 56 * spriteScale;
      renderSpinFrame = (currentFrameIndex * 2) % 8;
    }
    // Basic Attack 2 Throw Flight (Frames 91 to 94) - Right Hand Throw
    else if (currentFrameIndex >= 91 && currentFrameIndex <= 94) {
      const t = (currentFrameIndex - 91) / 3.0;
      const startX = vargostX + 24 * spriteScale;
      const startY = (vargostY + hoverOffset) - 48 * spriteScale;
      renderProjX = startX + (targetX - startX) * t;
      renderProjY = startY + (targetY - startY) * t;
      renderProjSize = 56 * spriteScale;
      renderSpinFrame = (currentFrameIndex * 2) % 8;
    }
  }

  if (renderProjX !== null && renderProjY !== null) {
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

  // 6. Explosion VFX Rendering: Dynamic & Scrubber Preview
  let expFrameToDraw = null, expX = targetX, expY = targetY, expIsSmall = false;

  if (activeExplosion) {
    expFrameToDraw = activeExplosion.frame;
    expX = activeExplosion.x;
    expY = activeExplosion.y;
    expIsSmall = activeExplosion.isSmall;
  } else if (!isPlaying && currentFrameIndex >= 75 && currentFrameIndex <= 82) {
    // Scrubber preview of ground explosion during recovery
    expFrameToDraw = Math.min(90, Math.floor((currentFrameIndex - 75) * 11));
    expIsSmall = false;
  }

  if (expFrameToDraw !== null) {
    const expCols = 13;
    const esx = (expFrameToDraw % expCols) * 128;
    const esy = Math.floor(expFrameToDraw / expCols) * 66;

    const mult = expIsSmall ? 0.9 : 1.5;
    const expW = 128 * spriteScale * mult;
    const expH = 66 * spriteScale * mult;
    const drawX = expX - expW / 2;
    const drawY = expY - expH + 12;

    ctx.drawImage(
      assets.explosion,
      esx, esy, 128, 66,
      drawX, drawY, expW, expH
    );
  }

  // 7. Inspector Crosshair
  if (chkInspector.checked && mouseX > 0 && mouseY > 0) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, H);
    ctx.moveTo(0, mouseY);
    ctx.lineTo(W, mouseY);
    ctx.stroke();
  }
}

init();

// Vargost Utility AI & Pixel Inspector Simulator
// Auto-battler 3v3 Engine Demo (GodWar)

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
const kfIdle = document.getElementById('kf-idle');
const kfWindup = document.getElementById('kf-windup');
const kfCharged = document.getElementById('kf-charged');
const kfRelease = document.getElementById('kf-release');
const kfRecovery = document.getElementById('kf-recovery');

// Combat & Locomotion Controls
const btnFlyForward = document.getElementById('btn-fly-forward');
const btnFlyBackward = document.getElementById('btn-fly-backward');
const btnLand = document.getElementById('btn-land');
const btnTakeoff = document.getElementById('btn-takeoff');
const btnCast = document.getElementById('btn-cast');
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
const PROJECTILE_SPEED = 900;

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

// Combat AI States: 'IDLE', 'REPOSITIONING', 'CAST_WINDUP', 'CAST_RELEASE', 'CAST_RECOVERY'
let aiState = 'IDLE';
let isPlaying = true;
let currentFrameIndex = 0;
let frameTimeAccumulator = 0;
let hoverTimer = 0;
let autoCooldown = 2.0;
let isCastOrdered = false;

// Motion ghosting afterimages for high-speed flight
const motionGhosts = [];

// Projectile & Impact VFX
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

function updateCurrentSpawnDisplay() {
  const dx = Number(numSpawnDx.value);
  const dy = Number(numSpawnDy.value);
  inspCurrentSpawn.textContent = `dx: ${dx >= 0 ? '+' : ''}${dx}, dy: ${dy >= 0 ? '+' : ''}${dy}`;
}

numSpawnDx.addEventListener('input', updateCurrentSpawnDisplay);
numSpawnDy.addEventListener('input', updateCurrentSpawnDisplay);

// Timeline Controls
rngFrame.addEventListener('input', () => {
  isPlaying = false;
  btnPlayPause.textContent = '▶ Tiếp tục';
  currentFrameIndex = Number(rngFrame.value);
  lblFrameNum.textContent = currentFrameIndex;
});

btnPlayPause.addEventListener('click', () => {
  isPlaying = !isPlaying;
  btnPlayPause.textContent = isPlaying ? '⏸ Tạm dừng' : '▶ Tiếp tục';
});

btnFrameFirst.addEventListener('click', () => {
  isPlaying = false;
  btnPlayPause.textContent = '▶ Tiếp tục';
  currentFrameIndex = 0;
  rngFrame.value = 0;
  lblFrameNum.textContent = 0;
});

btnFramePrev.addEventListener('click', () => {
  isPlaying = false;
  btnPlayPause.textContent = '▶ Tiếp tục';
  currentFrameIndex = Math.max(0, currentFrameIndex - 1);
  rngFrame.value = currentFrameIndex;
  lblFrameNum.textContent = currentFrameIndex;
});

btnFrameNext.addEventListener('click', () => {
  isPlaying = false;
  btnPlayPause.textContent = '▶ Tiếp tục';
  currentFrameIndex = Math.min(82, currentFrameIndex + 1);
  rngFrame.value = currentFrameIndex;
  lblFrameNum.textContent = currentFrameIndex;
});

btnFrameLast.addEventListener('click', () => {
  isPlaying = false;
  btnPlayPause.textContent = '▶ Tiếp tục';
  currentFrameIndex = 82;
  rngFrame.value = 82;
  lblFrameNum.textContent = 82;
});

// Keyframe bookmarks
kfIdle.addEventListener('click', () => { currentFrameIndex = 0; rngFrame.value = 0; lblFrameNum.textContent = 0; isPlaying = false; btnPlayPause.textContent = '▶ Tiếp tục'; });
kfWindup.addEventListener('click', () => { currentFrameIndex = 45; rngFrame.value = 45; lblFrameNum.textContent = 45; isPlaying = false; btnPlayPause.textContent = '▶ Tiếp tục'; });
kfCharged.addEventListener('click', () => { currentFrameIndex = 64; rngFrame.value = 64; lblFrameNum.textContent = 64; isPlaying = false; btnPlayPause.textContent = '▶ Tiếp tục'; });
kfRelease.addEventListener('click', () => { currentFrameIndex = 66; rngFrame.value = 66; lblFrameNum.textContent = 66; isPlaying = false; btnPlayPause.textContent = '▶ Tiếp tục'; });
kfRecovery.addEventListener('click', () => { currentFrameIndex = 67; rngFrame.value = 67; lblFrameNum.textContent = 67; isPlaying = false; btnPlayPause.textContent = '▶ Tiếp tục'; });

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
  orderCast();
});
btnTestFar.addEventListener('click', () => {
  rngDistance.value = 680;
  lblDistance.textContent = '680px';
  orderCast();
});

btnReset.addEventListener('click', () => {
  vargostX = mapX + 180.0 * mapScale;
  vargostY = baseFlyY;
  targetVargostX = vargostX;
  isFlying = true;
  locomotionState = 'IDLE_FLY';
  aiState = 'IDLE';
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
  } catch (err) {
    // Canvas tainted or out of bounds
  }

  // Render Loupe View
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

function orderCast() {
  isCastOrdered = true;
}

btnCast.addEventListener('click', orderCast);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'KeyF') {
    e.preventDefault();
    orderCast();
  }
});

// Main Animation & Physics Loop
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
  if (chkAuto.checked && aiState === 'IDLE' && !isCastOrdered) {
    autoCooldown -= dt;
    if (autoCooldown <= 0) {
      isCastOrdered = true;
      autoCooldown = 4.0;
    }
  }

  // Utility AI Range Evaluation
  if (isCastOrdered && aiState === 'IDLE') {
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
      startWindup();
    }
  }

  // AI Repositioning Movement
  if (aiState === 'REPOSITIONING') {
    const moveStep = flySpeed * dt;
    if (distInPx < MIN_ATTACK_RANGE) {
      vargostX -= moveStep;
      if (distInPx >= MIN_ATTACK_RANGE + 35) {
        startWindup();
      }
    } else if (distInPx > MAX_ATTACK_RANGE) {
      vargostX += moveStep;
      if (distInPx <= MAX_ATTACK_RANGE - 35) {
        startWindup();
      }
    }
  }

  // Locomotion State Machine Execution
  if (locomotionState === 'FLY_FORWARD') {
    // Tilt forward
    const rad = (targetTiltDeg * Math.PI) / 180;
    currentTilt += (rad - currentTilt) * Math.min(dt * 8, 1);
    currentScaleX = 1.05;
    currentScaleY = 0.95;

    // Movement towards targetVargostX
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

    // Spawn flight afterimage ghost
    if (Math.random() < 0.35) {
      motionGhosts.push({ x: vargostX, y: vargostY, alpha: 0.35 });
    }
  } else if (locomotionState === 'FLY_BACKWARD') {
    // Tilt backward
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
    // Smooth ease-out descent
    transitionProgress += dt * 1.8;
    const t = Math.min(1, transitionProgress);
    const ease = 1 - Math.pow(1 - t, 3);
    vargostY = baseFlyY + (groundY - baseFlyY) * ease;
    currentTilt += (0 - currentTilt) * Math.min(dt * 10, 1);

    if (t >= 1) {
      vargostY = groundY;
      isFlying = false;
      locomotionState = 'IDLE_GROUND';
      currentScaleX = 1.15; // Squash on impact
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
    currentScaleX = 0.90; // Stretch on lift
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

  // Update Motion Ghosts
  for (let i = motionGhosts.length - 1; i >= 0; i--) {
    motionGhosts[i].alpha -= dt * 2.5;
    if (motionGhosts[i].alpha <= 0) motionGhosts.splice(i, 1);
  }

  // Update Dust Rings
  for (let i = groundDustRings.length - 1; i >= 0; i--) {
    const d = groundDustRings[i];
    d.radius += dt * 60;
    d.alpha -= dt * 1.5;
    if (d.alpha <= 0) groundDustRings.splice(i, 1);
  }

  // Animation Frame Progression (if playing)
  const frameDur = 0.06;
  if (isPlaying) {
    frameTimeAccumulator += dt;
    if (frameTimeAccumulator >= frameDur) {
      frameTimeAccumulator -= frameDur;

      if (aiState === 'IDLE' || aiState === 'REPOSITIONING') {
        currentFrameIndex = (currentFrameIndex + 1) % 22;
      } else if (aiState === 'CAST_WINDUP') {
        currentFrameIndex++;
        if (currentFrameIndex === 66) {
          spawnProjectile(targetX, targetY);
          aiState = 'CAST_RELEASE';
          hudState.textContent = 'Trạng thái: PHÓNG CHIÊU (RELEASE)';
          hudAi.textContent = 'AI: Phóng Vòng Lửa @ 900px/s';
          hudAi.className = 'badge active';
        }
      } else if (aiState === 'CAST_RELEASE') {
        currentFrameIndex = 67;
        aiState = 'CAST_RECOVERY';
        hudState.textContent = 'Trạng thái: HỒI THẾ SẠCH (RECOVERY)';
        hudAi.textContent = 'AI: Thu tay hồi chiêu';
        hudAi.className = 'badge';
      } else if (aiState === 'CAST_RECOVERY') {
        currentFrameIndex++;
        if (currentFrameIndex > 82) {
          aiState = 'IDLE';
          currentFrameIndex = 0;
          isCastOrdered = false;
          hudState.textContent = isFlying ? 'Trạng thái: SẴN SÀNG (LƠ LỬNG)' : 'Trạng thái: SẴN SÀNG (ĐỨNG TRÊN BỆ)';
          hudAi.textContent = 'AI: Tuần tra';
        }
      }

      rngFrame.value = currentFrameIndex;
      lblFrameNum.textContent = currentFrameIndex;
    }
  }

  hudFrame.textContent = `Frame: ${currentFrameIndex}/82`;

  // Projectile Flight Logic (8-frame spinning fire ring)
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
    const step = PROJECTILE_SPEED * dt;

    if (distRem <= step || p.x >= p.targetX || p.y >= p.targetY) {
      spawnExplosion(p.targetX, p.targetY);
      activeProjectile = null;
      hudProjectile.textContent = 'Đạn: ĐÃ TIẾP ĐẤT & NỔ';
    } else {
      p.x += (dx / distRem) * step;
      p.y += (dy / distRem) * step;
      hudProjectile.textContent = `Đạn: Bay xoay 8 frame (${Math.round(p.x)}, ${Math.round(p.y)})`;
    }
  }

  // Explosion VFX Logic (91 frames matched 2x2 texel)
  if (activeExplosion) {
    const exp = activeExplosion;
    exp.timeAccum += dt;
    const expFrameDur = 1 / 30;
    if (exp.timeAccum >= expFrameDur) {
      exp.timeAccum -= expFrameDur;
      exp.frame++;
      if (exp.frame >= 91) activeExplosion = null;
    }
  }
}

function startWindup() {
  aiState = 'CAST_WINDUP';
  currentFrameIndex = 45;
  frameTimeAccumulator = 0;
  hudState.textContent = 'Trạng thái: VẬN CÔNG (WINDUP)';
  hudState.className = 'badge active';
  hudAi.textContent = 'AI: Vận công tụ vòng lửa';
  hudAi.className = 'badge active';
}

function spawnProjectile(targetX, targetY) {
  const spriteScale = assets.manifest.display_scale * (zoom / 0.7);
  const hoverOffset = isFlying ? Math.sin(hoverTimer * 3.2) * 8 : 0;

  // Exact spawn offset from raised hands
  const dx = Number(numSpawnDx.value);
  const dy = Number(numSpawnDy.value);

  // Compute rotated position around anchor
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
  };

  hudProjectile.textContent = 'Đạn: ĐANG PHÓNG TỪ TAY VỀ PHÍA TRƯỚC';
}

function spawnExplosion(x, y) {
  activeExplosion = {
    x: x,
    y: y,
    frame: 0,
    timeAccum: 0,
  };
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
  if (aiState === 'CAST_WINDUP' || aiState === 'CAST_RELEASE') {
    ctx.strokeStyle = 'rgba(237, 137, 54, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(vargostX + 20, vargostY - 50);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 3. Draw Motion Ghosts (High-speed afterimage)
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

  // Draw Spawn Point Reticle on Vargost (when inspector is active)
  if (chkInspector.checked) {
    const spDx = Number(numSpawnDx.value);
    const spDy = Number(numSpawnDy.value);
    const spScreenX = spDx * spriteScale;
    const spScreenY = spDy * spriteScale;

    // Reticle circle
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(spScreenX, spScreenY, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(spScreenX - 9, spScreenY);
    ctx.lineTo(spScreenX + 9, spScreenY);
    ctx.moveTo(spScreenX, spScreenY - 9);
    ctx.lineTo(spScreenX, spScreenY + 9);
    ctx.stroke();

    // Anchor point crosshair (0, 0)
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  // Character Label
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px monospace';
  ctx.textAlign = 'center';
  const labelStatus = isFlying ? 'Bay @ 900px/s' : 'Đứng trên bệ đá';
  ctx.fillText(`Vargost (${labelStatus})`, vargostX, vargostY + hoverOffset - 80 * spriteScale);

  // 5. Draw Projectile (8-frame spinning fire ring)
  if (activeProjectile) {
    const p = activeProjectile;
    const pSize = 75 * spriteScale;
    const psx = p.spinFrame * 80;

    ctx.save();
    ctx.drawImage(
      assets.projectile,
      psx, 0, 80, 80,
      p.x - pSize / 2, p.y - pSize / 2, pSize, pSize
    );
    ctx.restore();
  }

  // 6. Draw Explosion VFX (91 frames matched 2x2 texel)
  if (activeExplosion) {
    const exp = activeExplosion;
    const fIdx = exp.frame;
    const expCols = 13;
    const esx = (fIdx % expCols) * 128;
    const esy = Math.floor(fIdx / expCols) * 66;

    const expW = 128 * spriteScale * 1.5;
    const expH = 66 * spriteScale * 1.5;
    const expX = exp.x - expW / 2;
    const expY = exp.y - expH + 12;

    ctx.drawImage(
      assets.explosion,
      esx, esy, 128, 66,
      expX, expY, expW, expH
    );
  }

  // 7. Draw Crosshair across canvas (when inspector is active)
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

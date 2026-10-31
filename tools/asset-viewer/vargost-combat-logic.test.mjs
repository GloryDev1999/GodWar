import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { createContext, runInContext } from 'vm';

test('Vargost Combat Logic: Teleport Retreat, Evasive Dodge/Miss, and Enemy Counter-Attack Hurt Reaction', async () => {
  const canvasMock = {
    width: 1200,
    height: 600,
    getContext: () => ({
      clearRect: () => {},
      drawImage: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      ellipse: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      closePath: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      setLineDash: () => {},
      fillText: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
    }),
    addEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 600 }),
  };

  const documentMock = {
    createElement: (tag) => canvasMock,
    getElementById: (id) => {
      if (id === 'stage' || id === 'loupe-canvas') {
        return canvasMock;
      }
      const val = (id === 'sel-rate') ? '1' : ((id === 'rng-fly-speed') ? '400' : ((id === 'rng-tilt') ? '25' : ((id === 'rng-distance') ? '350' : '0')));
      return {
        id,
        value: val,
        checked: true,
        textContent: '',
        className: '',
        style: {},
        addEventListener: () => {},
      };
    },
  };

  const sandbox = {
    console,
    document: documentMock,
    window: { addEventListener: () => {} },
    Image: class { constructor() { this.src = ''; } },
    fetch: async () => ({ ok: true, json: async () => ({
      atlas_path: 'mock.png',
      projectile_atlas: 'proj.png',
      explosion_atlas: 'exp.png',
      display_scale: 0.872,
      anchor_px: [105, 162],
    }) }),
    requestAnimationFrame: () => {},
    setTimeout: (cb) => cb(),
    Math,
    Number,
  };

  const code = readFileSync('tools/asset-viewer/vargost-skill-test.js', 'utf8');
  const context = createContext(sandbox);
  runInContext(code, context);

  const testLogic = `
    assets.manifest = {
      display_scale: 0.872,
      anchor_px: [105, 162],
      projectile_atlas: 'mock_proj.png',
      explosion_atlas: 'mock_exp.png'
    };

    // Test 1: Teleport Lùi (Phase Blink & Tilt = 0°)
    chkAuto.checked = false;
    const initialX = vargostX;
    const initialY = vargostY;
    const retreatTargetX = initialX - 150;
    const retreatTargetY = initialY;

    triggerTeleport(retreatTargetX, retreatTargetY, 1);
    if (!isPhaseBlinking) throw new Error("isPhaseBlinking phải là true khi triggerTeleport");
    if (currentTilt !== 0) throw new Error("currentTilt phải bằng 0 khi teleport lùi");

    let time = 0;
    while (isPhaseBlinking && time < 1.0) {
      time += 0.05;
      update(time * 1000);
    }
    if (Math.abs(vargostX - retreatTargetX) > 5) throw new Error("vargostX chưa đến target sau teleport");
    if (currentTilt !== 0) throw new Error("currentTilt sau teleport phải là 0°");

    // Test 2: Đạn Vargost Bắn Trượt Khi Kẻ Địch Né Kịp
    enemyWorldX = 900;
    enemyHp = 100;
    enemyStunTimer = 0;
    enemyDamageNumbers.length = 0;

    spawnBlazingHaloProjectile(500, groundY);
    let projTime = 0;
    while (activeProjectile && projTime < 2.0) {
      projTime += 0.02;
      update((1.5 + projTime) * 1000);
    }

    const missedDmg = enemyDamageNumbers.find(d => d.text.includes('MISSED') || d.text.includes('NÉ ĐÒN'));
    if (!missedDmg) throw new Error("Không tìm thấy text MISSED / NÉ ĐÒN khi đạn bắn trượt tiếp đất");
    if (enemyHp !== 100) throw new Error("enemyHp phải giữ nguyên 100 khi né đòn");
    if (enemyStunTimer !== 0) throw new Error("enemyStunTimer phải bằng 0 khi né đòn");

    // Test 3: Kẻ Địch Phản Công & Vargost Hurt Reaction
    vargostHp = 1000;
    vargostHitFlash = 0;
    enemyDamageNumbers.length = 0;
    activeEnemyProjectiles.length = 0;

    spawnEnemyProjectile();
    if (activeEnemyProjectiles.length !== 1) throw new Error("activeEnemyProjectiles phải có 1 đạn");

    let hurtTime = 0;
    let flashTriggered = false;
    while (activeEnemyProjectiles.length > 0 && hurtTime < 2.0) {
      hurtTime += 0.02;
      update((4.0 + hurtTime) * 1000);
      if (vargostHitFlash > 0) flashTriggered = true;
    }

    if (vargostHp >= 1000) throw new Error("vargostHp phải bị trừ khi dính đạn");
    if (!flashTriggered) throw new Error("vargostHitFlash phải được kích hoạt khi bị trúng đạn");

    const vargostDmgText = enemyDamageNumbers.find(d => d.text.includes('-250 HP'));
    if (!vargostDmgText) throw new Error("Không tìm thấy số sát thương -250 HP");

    // Test 4: Ống Máu Gothic RPG & Hiệu Ứng Pixel Dissolve Khi Trừ Máu
    if (vargostDamageGhosts.length === 0) {
      throw new Error("vargostDamageGhosts phải ghi nhận đoạn máu bị trừ khi Vargost trúng đòn");
    }
    const ghost = vargostDamageGhosts[0];
    if (ghost.fromHp !== 1000 || ghost.toHp !== 750) {
      throw new Error("Damage Ghost phải lưu trữ fromHp: 1000, toHp: 750, nhận được: " + ghost.fromHp + "->" + ghost.toHp);
    }
    if (ghost.flashDuration <= 0 || ghost.dissolveDuration <= 0) {
      throw new Error("Damage Ghost phải có flashDuration và dissolveDuration hợp lệ");
    }

    // Test 5: Hoạt Ảnh Gục Ngã (KO) - 0.3s Freeze -> Evaporating Pixel Dissolve Bốc Hơi 30px
    enemyAttackCooldown = 999; // Tạm khóa địch phản công để kiểm tra vòng đời tử trận và hồi sinh
    activeEnemyProjectiles.length = 0;
    triggerVargostDeath();
    if (!isDead) throw new Error("isDead phải là true sau khi gọi triggerVargostDeath");
    if (vargostHp !== 0) throw new Error("vargostHp phải bằng 0 khi tử trận");
    if (vargostHitFlash <= 0) throw new Error("vargostHitFlash phải được kích hoạt lóe sáng toàn thân khi tử trận");

    // Giả lập 0.15s trong pha 1 (Freeze)
    update(7000);
    if (deathTimer < 0.15 && deathTimer > 0.3) throw new Error("deathTimer không tăng trong pha 1");

    // Giả lập qua 0.5s bước vào pha 2 (Bốc hơi pixel)
    for (let s = 0; s < 10; s++) {
      update(7050 + s * 50);
    }
    if (deathTimer < 0.3) throw new Error("Phải bước vào pha 2 bốc hơi pixel sau 0.3s");

    // Giả lập vượt qua 3.4s để hồi sinh
    for (let s = 0; s < 75; s++) {
      update(7600 + s * 50);
    }
    if (isDead) throw new Error("Vargost phải tự động hồi sinh sau 3.4s");
    if (vargostHp !== VARGOST_MAX_HP) throw new Error("vargostHp phải đầy lại sau khi hồi sinh");
  `;

  runInContext(testLogic, context);
});

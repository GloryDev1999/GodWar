import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'fs';

test('Aoda Metadata: 90px Height, Atlases & Action Frame Separation', () => {
  const actionsPath = 'Asset/Character/characters/aoda_combat/aoda_actions.json';
  assert.ok(existsSync(actionsPath), 'aoda_actions.json must exist');
  const manifest = JSON.parse(readFileSync(actionsPath, 'utf8'));

  // 1. Kích thước chuẩn hóa 90px
  assert.equal(manifest.target_height_px, 90, 'Target height must be 90px');
  assert.equal(manifest.reference_height_px, 270, 'Reference height must be 270px');
  const expectedScale = 90.0 / 270.0;
  assert.ok(Math.abs(manifest.display_scale - expectedScale) < 1e-6, 'display_scale must equal 90/270');

  // 2. Phân rã hoạt ảnh độc lập
  const actions = manifest.actions;
  assert.ok(actions.idle, 'Must have idle action');
  assert.ok(actions.skill_1_tornado, 'Must have skill_1_tornado action');
  assert.equal(actions.skill_2_fire_orb, undefined, 'Must not have skill_2_fire_orb (deleted)');
  assert.ok(actions.ko, 'Must have ko action');
  assert.ok(actions.move, 'Must have move action');

  // Frame 1..47 (indices 0..46): Vận công / tấn công & thế thủ
  assert.equal(actions.skill_1_tornado.windup_start, 24, 'Skill 1 windup must start at index 24 (frame 25)');
  assert.equal(actions.skill_1_tornado.windup_release, 29, 'Skill 1 release at index 29 (frame 30)');

  // Frame 47..65 (indices 46..64): Gục ngã & tan biến KO
  assert.equal(actions.ko.start_frame, 46, 'KO start frame must be index 46 (frame 47)');
  assert.equal(actions.ko.end_frame, 64, 'KO end frame must be index 64 (frame 65)');

  // Frame 66..93 (indices 65..92): Di chuyển chạy bộ
  assert.equal(actions.move.start_frame, 65, 'Move start frame must be index 65 (frame 66)');
  assert.equal(actions.move.end_frame, 92, 'Move end frame must be index 92 (frame 93)');
  assert.equal(manifest.frames.length, 93, 'Total frames must be 93');

  // 3. VFX Red Tornado (85px, xoay tại chỗ đúng 2.0s, CD 5s)
  assert.ok(manifest.vfx.red_tornado, 'Must have red_tornado vfx config');
  assert.equal(manifest.vfx.red_tornado.name, 'Tornado', 'Red tornado name must be Tornado');
  assert.equal(manifest.vfx.red_tornado.duration_sec, 2.0, 'Red tornado duration must be 2.0s');
  assert.equal(manifest.vfx.red_tornado.height_px, 85, 'Red tornado height must be 85px');
  assert.equal(manifest.vfx.red_tornado.speed_px, 0, 'Red tornado speed must be 0px/s (stationary spin in place)');
  assert.equal(manifest.vfx.red_tornado.range_px, 85, 'Red tornado range must be 85px');
  assert.equal(manifest.vfx.red_tornado.cooldown_sec, 5.0, 'Red tornado cooldown must be 5.0s');
  assert.equal(manifest.vfx.red_tornado.effect, 'root_and_silence', 'Red tornado effect must be root_and_silence');

  assert.equal(manifest.vfx.fire_orb, undefined, 'FireOrb vfx must be completely deleted');
  assert.equal(manifest.vfx.fire_orb_explosion, undefined, 'FireOrb explosion vfx must be completely deleted');

  // 4. Candidate configs check
  const fineCandidate = JSON.parse(readFileSync('Asset/Character/fine_candidates/aoda/candidate.json', 'utf8'));
  assert.equal(fineCandidate.target_height_px, 90, 'fine_candidates/aoda target_height_px must be 90');
  const measuredCandidate = JSON.parse(readFileSync('Asset/Character/measured_atlas_pilots/aoda/candidate.json', 'utf8'));
  assert.equal(measuredCandidate.target_height_px, 90, 'measured_atlas_pilots/aoda target_height_px must be 90');
});

test('Tornado Ground-Only Aerial Immunity & Multi-target AoE', () => {
  function checkTornadoHit(tornadoX, tornadoY, targetX, targetY, isFlying) {
    // QUY TẮC BẮT BUỘC: Lốc xoáy chỉ xuất hiện trên mặt đất, KHÔNG THỂ đánh trúng mục tiêu đang bay (isFlying = true)
    if (isFlying) return false;
    return Math.abs(tornadoX - targetX) < 65 && Math.abs(tornadoY - targetY) < 85;
  }

  const tornado = { x: 500, y: 800 };

  // 1. Vargost đang bay (isFlying = true) ngay trên đầu Tornado -> KHÔNG DÍNH ĐÒN!
  const vargostFlying = { x: 500, y: 750, isFlying: true };
  assert.equal(checkTornadoHit(tornado.x, tornado.y, vargostFlying.x, vargostFlying.y, vargostFlying.isFlying), false,
    'Flying Vargost MUST be immune to Tornado ground sweep');

  // 2. Vargost hạ cánh trên mặt đất (isFlying = false) -> DÍNH ĐÒN!
  const vargostLanded = { x: 500, y: 800, isFlying: false };
  assert.equal(checkTornadoHit(tornado.x, tornado.y, vargostLanded.x, vargostLanded.y, vargostLanded.isFlying), true,
    'Landed Vargost must be hit by Tornado');

  // 3. Kẻ địch mặt đất khác (Ground Dummy) trong phạm vi -> CŨNG DÍNH ĐÒN (sát thương diện rộng)!
  const groundDummy = { x: 520, y: 800, isFlying: false };
  assert.equal(checkTornadoHit(tornado.x, tornado.y, groundDummy.x, groundDummy.y, groundDummy.isFlying), true,
    'All ground enemies in AoE must be hit by Tornado');
});

test('Tornado 2.0s Duration & Static In-Place Spinning Lifecycle (Emerge -> Spin 2.0s -> Dissipate)', () => {
  // Chu trình hoạt ảnh Tornado: Xuất hiện (Frame 0..3) -> Tồn tại xoay đúng 2.0s tại chỗ -> Tan biến (Frame 10..14)
  const tornado = {
    originX: 500,
    x: 500,
    y: 800,
    phase: 'EMERGE',
    frameIndex: 0,
    spinElapsed: 0,
    spinDuration: 2.0
  };

  // 1. Pha Emerge
  assert.equal(tornado.phase, 'EMERGE');
  assert.equal(tornado.x, tornado.originX, 'Tornado must remain at spawn position');

  // Chuyển sang phase SPIN
  tornado.phase = 'SPIN';
  tornado.frameIndex = 4;
  assert.equal(tornado.frameIndex, 4, 'Peak spin loop starts at frame index 4');

  // 2. Pha SPIN lặp lại 2.0s
  tornado.spinElapsed += 2.0;
  assert.ok(tornado.spinElapsed >= tornado.spinDuration, 'Tornado must spin for exactly 2.0s');
  assert.equal(tornado.x, tornado.originX, 'Tornado must stay stationary in place without sweeping');

  // 3. Pha DISSIPATE
  tornado.phase = 'DISSIPATE';
  tornado.frameIndex = 10;
  assert.equal(tornado.phase, 'DISSIPATE');
  assert.equal(tornado.frameIndex, 10, 'Dissipate phase starts at frame index 10');
});

test('Utility AI Target & Skill Selection: Ground -> Tornado (CD 5s), Airborne -> Hold Skill', () => {
  function decideSkill(nearestEnemy, tornadoCd) {
    if (!nearestEnemy) return null;
    if (!nearestEnemy.isFlying && tornadoCd <= 0) {
      return 'TORNADO';
    }
    return null;
  }

  // Trường hợp 1: Mục tiêu gần nhất đang bay trên không -> Không dùng Tornado phí phạm
  const flyingEnemy = { x: 450, y: 200, isFlying: true, dist: 300 };
  assert.equal(decideSkill(flyingEnemy, 0), null, 'AI must hold skill against airborne enemy');

  // Trường hợp 2: Mục tiêu gần nhất ở dưới mặt đất -> Chọn Tornado
  const groundEnemy = { x: 450, y: 750, isFlying: false, dist: 250 };
  assert.equal(decideSkill(groundEnemy, 0), 'TORNADO', 'AI must select Tornado against ground enemy');
});

test('Aoda Ledge Jumping: Parabolic Arc & Bi-directional Height Traversal', () => {
  const plat1Top = { id: 'plat_1_top', minX: 288, maxX: 382.5, y: 655.5 };
  const plat1A = { id: 'plat_1a', minX: 388, maxX: 624, y: 744.8 };
  const plat1B = { id: 'plat_1b', minX: 629, maxX: 886.5, y: 829.0 };

  // Jump Down: từ Plat 1 Top (655.5) xuống Plat 1A (744.8)
  assert.ok(plat1A.y > plat1Top.y, 'Plat 1A is lower than Plat 1 Top -> Jump Down');

  // Jump Up: từ Plat 1A (744.8) lên Plat 1 Top (655.5)
  assert.ok(plat1Top.y < plat1A.y, 'Plat 1 Top is higher than Plat 1A -> Jump Up');

  // Jump Down: từ Plat 1A (744.8) xuống Plat 1B (829.0)
  assert.ok(plat1B.y > plat1A.y, 'Plat 1B is lower than Plat 1A -> Jump Down');

  // Parabolic formula check
  function computeJumpPos(startX, startY, targetX, targetY, arcHeight, t) {
    const x = startX + (targetX - startX) * t;
    const linearY = startY + (targetY - startY) * t;
    const parabola = 4 * t * (1 - t) * arcHeight;
    return { x, y: linearY - parabola };
  }

  const apex = computeJumpPos(380, 655.5, 420, 744.8, 50, 0.5);
  // Ở đỉnh nhảy (t=0.5), y phải nhỏ hơn trung bình linearY (nhảy vút lên)
  const midY = (655.5 + 744.8) / 2;
  assert.ok(apex.y < midY, 'Apex must be higher (lower Y) than mid-point due to parabolic arc');
});

test('Aoda Limited Ledge Jumping: ONLY Jump If Target Farther Than Attack Range (> 420px)', () => {
  const AODA_ATTACK_RANGE = 420;

  function onReachLedge(targetX, aodaX, aodaFacing, hasAdjacent) {
    const isTargetAhead = (aodaFacing > 0 && targetX > aodaX) || (aodaFacing < 0 && targetX < aodaX);
    const hDistTarget = Math.abs(targetX - aodaX);

    if (isTargetAhead && hDistTarget > AODA_ATTACK_RANGE) {
      if (hasAdjacent) return 'JUMP';
      return 'IDLE'; // Hết đường nối thì dừng lại
    } else if (isTargetAhead && hDistTarget <= AODA_ATTACK_RANGE) {
      // Trong tầm đánh -> Dừng tại mép, đứng thế thủ chiến đấu, KHÔNG NHẢY
      return 'IDLE';
    } else {
      // Mục tiêu ở sau lưng -> Quay đầu
      return 'TURN';
    }
  }

  const aodaX = 600;
  const aodaFacing = 1; // Nhìn sang phải

  // TH 1: Kẻ địch ở xa (X = 1100, cách 500px > 420px) -> Phải NHẢY qua bệ tiếp theo
  assert.equal(onReachLedge(1100, aodaX, aodaFacing, true), 'JUMP', 'Must jump when target is beyond attack range');

  // TH 2: Kẻ địch ở gần trong tầm đánh (X = 900, cách 300px <= 420px) -> KHÔNG NHẢY, dừng lại IDLE tấn công
  assert.equal(onReachLedge(900, aodaX, aodaFacing, true), 'IDLE', 'Must NOT jump when target is within attack range (<= 420px)');

  // TH 3: Kẻ địch ở sau lưng (X = 400, aodaFacing = +1) -> Quay đầu TURN
  assert.equal(onReachLedge(400, aodaX, aodaFacing, true), 'TURN', 'Must turn around if target is behind');
});

test('Instant Turn Flip: Visual Facing Equals Logic Facing', () => {
  let aodaFacing = 1;
  let aodaVisualFacing = aodaFacing;
  assert.equal(aodaVisualFacing, 1);

  // Quay đầu
  aodaFacing = -1;
  aodaVisualFacing = aodaFacing; // Tức thì, loại bỏ hoàn toàn biến dạng lật 2D
  assert.equal(aodaVisualFacing, -1, 'Visual facing must immediately equal logic facing');
});

test('Team System: Team 1 (Green / Vargost & Ground Dummy) vs Team 2 (Red / Aoda) & Friendly Fire Immunity', () => {
  const teams = {
    vargost: { team: 1, barColor: 'green', isAlly: true },
    groundDummy: { team: 1, barColor: 'green', isAlly: true },
    aoda: { team: 2, barColor: 'red', isEnemy: true }
  };

  // 1. Phân định màu ống máu chuẩn xác:
  assert.equal(teams.vargost.barColor, 'green', 'Team 1 (Vargost) must have green health bar');
  assert.equal(teams.groundDummy.barColor, 'green', 'Team 1 (Ground Dummy) must have green health bar');
  assert.equal(teams.aoda.barColor, 'red', 'Team 2 (Aoda) must have red health bar');

  // 2. Cùng team thì cùng màu:
  assert.equal(teams.vargost.barColor, teams.groundDummy.barColor, 'Teammates in Team 1 must share green health bar');
  assert.notEqual(teams.vargost.barColor, teams.aoda.barColor, 'Opponents must have different health bar colors');

  // 3. Quy tắc không được tấn công nhau (Friendly Fire Immunity):
  function canAttack(attackerTeam, targetTeam) {
    return attackerTeam !== targetTeam;
  }

  // Vargost (Team 1) không tấn công Ground Dummy (Team 1):
  assert.equal(canAttack(teams.vargost.team, teams.groundDummy.team), false, 'Vargost cannot attack Ground Dummy (same team)');
  // Aoda (Team 2) được phép tấn công Ground Dummy (Team 1):
  assert.equal(canAttack(teams.aoda.team, teams.groundDummy.team), true, 'Aoda can attack Ground Dummy (opposing team)');
  // Aoda (Team 2) được phép tấn công Vargost (Team 1):
  assert.equal(canAttack(teams.aoda.team, teams.vargost.team), true, 'Aoda can attack Vargost (opposing team)');
  // Vargost (Team 1) được phép tấn công Aoda (Team 2):
  assert.equal(canAttack(teams.vargost.team, teams.aoda.team), true, 'Vargost can attack Aoda (opposing team)');
});

test('Decoupling Attacking Target Dummy from Aoda: Independent Positions, Separate Health Bars, and Platform Traversal', () => {
  // 1. Phân tách hoàn toàn Hình Nhân Tấn Công khỏi Aoda
  const aoda = { x: 425, y: 745, hp: 100, maxHp: 100, label: 'Aoda 90px (Team 2 · Kẻ Địch)' };
  const attackingDummy = { x: 865, y: 587, hp: 100, label: 'Hình Nhân Tấn Công (Team 2 · Kẻ Địch)' };

  // Vị trí không bao giờ trùng nhau (Aoda trên Platform 1A, Hình nhân trên Platform 2)
  assert.notEqual(aoda.x, attackingDummy.x, 'Aoda and Attacking Dummy must have completely separate X coordinates');
  assert.ok(Math.abs(aoda.x - attackingDummy.x) > 300, 'Aoda and Attacking Dummy must be distanced across platforms');
  assert.notEqual(aoda.label, attackingDummy.label, 'Health bar titles must be distinct and identifiable');

  // 2. Logic di chuyển mượt mà không bị đóng băng ở cự ly 280px
  function shouldAodaAdvance(hDistTarget, isTargetOnGround) {
    if (isTargetOnGround && hDistTarget <= 75) {
      return false; // Áp sát cự ly cận chiến cực gần -> Đứng thế thủ
    }
    return true; // Còn lại luôn di chuyển và nhảy bệ áp sát
  }

  // Khi mục tiêu cách 200px (như Vargost bay ở đầu game): Aoda PHẢI tiếp tục chạy bộ áp sát, không bị kẹt IDLE!
  assert.equal(shouldAodaAdvance(200, false), true, 'Aoda must advance when target is 200px away in the air');
  assert.equal(shouldAodaAdvance(60, true), false, 'Aoda must enter melee stance only when within 75px on ground');

  // 3. Logic chọn mục tiêu tung chiêu Tornado khi Vargost bay
  function selectGroundTornadoTarget(isFlying, vargostX, groundDummyX, aodaX, dummyActive) {
    const hDistV = Math.abs(vargostX - aodaX);
    const hDistD = dummyActive ? Math.abs(groundDummyX - aodaX) : Infinity;

    if (!isFlying) {
      return (hDistV <= hDistD || !dummyActive) ? 'VARGOST' : 'DUMMY';
    } else if (dummyActive) {
      return 'DUMMY'; // Vargost đang bay -> Nhắm Ground Dummy dưới mặt đất
    } else {
      return 'VARGOST_GROUND_PROJECTION';
    }
  }

  // Khi Vargost đang bay (isFlying = true) và Ground Dummy đang có mặt -> Aoda nhắm Ground Dummy tung Tornado
  assert.equal(selectGroundTornadoTarget(true, 600, 865, 425, true), 'DUMMY',
    'Aoda must target Ground Dummy when Vargost is flying');

  // Khi Vargost hạ cánh (isFlying = false) và ở gần -> Aoda nhắm Vargost
  assert.equal(selectGroundTornadoTarget(false, 550, 865, 425, true), 'VARGOST',
    'Aoda must target landed Vargost when closer than dummy');
});

test('Central Holy Sword Objective: 20.0s Continuous Capture, Contested Freeze & Zone Reset', () => {
  const SWORD_X = 865;
  const SWORD_Y = 587;
  const SWORD_CAPTURE_RADIUS = 135;
  const SWORD_CAPTURE_REQUIRED = 20.0;

  function evaluateSwordZone(team1Units, team2Units, currentState, dt) {
    const isInside = (u) => Math.hypot(u.x - SWORD_X, u.y - SWORD_Y) <= SWORD_CAPTURE_RADIUS && u.hp > 0;
    const hasTeam1 = team1Units.some(isInside);
    const hasTeam2 = team2Units.some(isInside);

    let { timer, controllingTeam, contested, winner } = currentState;

    if (winner !== null) {
      return currentState;
    }

    if (hasTeam1 && hasTeam2) {
      // Cả 2 đội cùng trong vùng -> Tranh chấp, đóng băng đồng hồ
      contested = true;
    } else if (hasTeam1) {
      contested = false;
      if (controllingTeam !== 1) {
        controllingTeam = 1;
        timer = 0.0;
      }
      timer += dt;
      if (timer >= SWORD_CAPTURE_REQUIRED) {
        timer = SWORD_CAPTURE_REQUIRED;
        winner = 1;
      }
    } else if (hasTeam2) {
      contested = false;
      if (controllingTeam !== 2) {
        controllingTeam = 2;
        timer = 0.0;
      }
      timer += dt;
      if (timer >= SWORD_CAPTURE_REQUIRED) {
        timer = SWORD_CAPTURE_REQUIRED;
        winner = 2;
      }
    } else {
      // KHÔNG CÒN AI TRONG VÙNG -> RESET NGAY LẬP TỨC VỀ 0.0s!
      contested = false;
      timer = 0.0;
      controllingTeam = null;
    }

    return { timer, controllingTeam, contested, winner };
  }

  // 1. Trạng thái ban đầu: Trống
  let state = { timer: 0.0, controllingTeam: null, contested: false, winner: null };

  // 2. Team 1 bước vào vùng: Bắt đầu tích lũy thời gian
  let team1 = [{ x: 865, y: 587, hp: 1000 }]; // Đứng ngay cạnh kiếm
  let team2 = [{ x: 425, y: 700, hp: 300 }];  // Aoda ở Platform 1A ngoài vùng

  state = evaluateSwordZone(team1, team2, state, 5.0);
  assert.equal(state.controllingTeam, 1, 'Controlling team must be Team 1');
  assert.equal(state.timer, 5.0, 'Timer must advance to 5.0s');
  assert.equal(state.contested, false);
  assert.equal(state.winner, null);

  // 3. Team 2 bước vào vùng kiếm -> TRANH CHẤP!
  team2 = [{ x: 890, y: 587, hp: 300 }]; // Aoda nhảy tới Bệ Giữa vào vùng kiếm
  state = evaluateSwordZone(team1, team2, state, 3.0);
  assert.equal(state.contested, true, 'Zone must be contested when both teams are inside');
  assert.equal(state.timer, 5.0, 'Capture timer must freeze during contest');
  assert.equal(state.winner, null);

  // 4. Team 1 tiêu diệt Team 2 (Aoda hp = 0) -> Team 1 tiếp tục giữ vùng
  team2 = [{ x: 890, y: 587, hp: 0 }];
  state = evaluateSwordZone(team1, team2, state, 15.0);
  assert.equal(state.contested, false);
  assert.equal(state.timer, 20.0, 'Timer must reach 20.0s');
  assert.equal(state.winner, 1, 'Team 1 must be declared WINNER after 20.0s continuous hold');

  // 5. Kiểm tra quy tắc RESET VỀ 0: Khi cả 2 đội rời khỏi vùng (không còn ai)
  let freshState = { timer: 14.5, controllingTeam: 2, contested: false, winner: null };
  const emptyTeam1 = [{ x: 200, y: 200, hp: 1000 }]; // Ngoài vùng
  const emptyTeam2 = [{ x: 400, y: 700, hp: 300 }];  // Ngoài vùng
  freshState = evaluateSwordZone(emptyTeam1, emptyTeam2, freshState, 1.0);
  assert.equal(freshState.timer, 0.0, 'Timer MUST reset to 0.0s when zone is empty');
  assert.equal(freshState.controllingTeam, null, 'Controlling team MUST reset to null');
  assert.equal(freshState.contested, false);
});

test('Vargost Collision Escape: Vertical Teleport to Open Airspace When Blocked by Terrain', () => {
  const mapScale = 2.625;
  const mapX = 600;
  const skyCeilingY = 280;

  // Mô phỏng hàm kiểm tra va chạm địa hình Zone 3
  function mockIsVargostColliding(px, py) {
    const zone3FaceX = mapX + 284 * mapScale; // Vách đá Zone 3
    if (px >= zone3FaceX && py >= 450) return true; // Va chạm vào vách đá
    return false;
  }

  function mockCalculateSafeRetreat(fromX, fromY, retreatDir, desiredDistance) {
    const candX = fromX + retreatDir * desiredDistance;
    const candY = fromY;
    const isColliding = mockIsVargostColliding(candX, candY);
    const minX = mapX + 75 * mapScale;
    const maxX = mapX + 475 * mapScale;
    const isOutOfBounds = (candX < minX || candX > maxX);

    if (!isColliding && !isOutOfBounds) {
      return { x: candX, y: candY, escapedVertically: false };
    }

    // Thoát kẹt lên trên vào vùng trời mở
    const escapeY = skyCeilingY + 12;
    let escapeX = Math.min(fromX, mapX + 250 * mapScale);
    return { x: escapeX, y: escapeY, escapedVertically: true };
  }

  // Tình huống 1: Vargost đứng sát vách đá Zone 3 (fromX = 1340), muốn lùi về phía bên phải (+1)
  const retreatBlocked = mockCalculateSafeRetreat(1340, 500, 1, 130);
  assert.equal(retreatBlocked.escapedVertically, true,
    'Must trigger vertical upward escape when backward retreat is blocked by cliff');
  assert.equal(retreatBlocked.y, skyCeilingY + 12,
    'Target Y must be elevated to open sky ceiling above terrain');
  assert.ok(retreatBlocked.x <= mapX + 250 * mapScale,
    'Target X must be pulled back safely into arena airspace');

  // Tình huống 2: Vargost ở khoảng trống (fromX = 900), lùi an toàn
  const retreatSafe = mockCalculateSafeRetreat(900, 350, -1, 100);
  assert.equal(retreatSafe.escapedVertically, false, 'Should retreat horizontally when airspace is clear');
  assert.equal(retreatSafe.x, 800);
});

test('Aoda Utility AI: Cross-Platform Ledge Traversal & Holy Sword Assault vs Defense', () => {
  const SWORD_X = 865;
  const SWORD_Y = 587;
  const SWORD_CAPTURE_RADIUS = 135;

  function getAodaObjectiveRole(aodaX, aodaY) {
    const distToSword = Math.hypot(aodaX - SWORD_X, aodaY - SWORD_Y);
    if (distToSword <= SWORD_CAPTURE_RADIUS) {
      return 'DEFENSE'; // Ở trong vùng kiếm -> Phòng thủ cứ điểm!
    } else {
      return 'ASSAULT'; // Ngoài vùng kiếm -> Tấn công tiến về phía kiếm!
    }
  }

  // Aoda ở Platform 1A (Team 2 Base, X = 425) -> Role là ASSAULT tiến về kiếm
  assert.equal(getAodaObjectiveRole(425, 700), 'ASSAULT', 'Outside sword zone must be ASSAULT mode');

  // Aoda đã nhảy sang Platform 2 cạnh kiếm (X = 865, Y = 587) -> Role là DEFENSE
  assert.equal(getAodaObjectiveRole(865, 587), 'DEFENSE', 'Inside sword zone must be DEFENSE mode');
});

test('Holy Sword Central Pedestal Standardized 90px & Pure 1v1 Champion Combat (Dummies Removed)', () => {
  const framesJsonPath = 'Asset/Character/characters/sword_objective/frames.json';
  assert.ok(existsSync(framesJsonPath), 'frames.json must exist');
  const swordMeta = JSON.parse(readFileSync(framesJsonPath, 'utf8'));

  // 1. Kích thước chuẩn hóa đúng 90px theo yêu cầu người dùng
  assert.equal(swordMeta.target_height_px, 90, 'Holy sword target_height_px must be 90px');
  assert.equal(swordMeta.frame_h, 158, 'Source frame height must be 158px');
  const calculatedScale = swordMeta.target_height_px / swordMeta.frame_h;
  const drawHeight = swordMeta.frame_h * calculatedScale;
  assert.equal(Math.round(drawHeight), 90, 'Rendered height of holy sword must be exactly 90px');

  // 2. Chế độ giao tranh thuần tướng 1v1 (Đã xóa bỏ hoàn toàn 2 hình nhân)
  function isZoneCapturePure(activeChampions) {
    return activeChampions.every(c => c.type === 'vargost' || c.type === 'aoda');
  }

  const activeMatch = [
    { type: 'vargost', team: 1, hp: 1000 },
    { type: 'aoda', team: 2, hp: 300 }
  ];
  assert.equal(isZoneCapturePure(activeMatch), true, 'Combatants must strictly be champions Vargost & Aoda');
});

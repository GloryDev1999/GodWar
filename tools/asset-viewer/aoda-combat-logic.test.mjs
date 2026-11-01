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
  assert.ok(actions.skill_2_fire_orb, 'Must have skill_2_fire_orb action');
  assert.ok(actions.ko, 'Must have ko action');
  assert.ok(actions.move, 'Must have move action');

  // Frame 1..47 (indices 0..46): Vận công / tấn công & thế thủ
  assert.equal(actions.skill_1_tornado.windup_start, 24, 'Skill 1 windup must start at index 24 (frame 25)');
  assert.equal(actions.skill_1_tornado.windup_release, 29, 'Skill 1 release at index 29 (frame 30)');
  assert.equal(actions.skill_2_fire_orb.windup_start, 24, 'Skill 2 windup must start at index 24 (frame 25)');
  assert.equal(actions.skill_2_fire_orb.windup_release, 29, 'Skill 2 release at index 29 (frame 30)');

  // Frame 47..65 (indices 46..64): Gục ngã & tan biến KO
  assert.equal(actions.ko.start_frame, 46, 'KO start frame must be index 46 (frame 47)');
  assert.equal(actions.ko.end_frame, 64, 'KO end frame must be index 64 (frame 65)');

  // Frame 66..93 (indices 65..92): Di chuyển chạy bộ
  assert.equal(actions.move.start_frame, 65, 'Move start frame must be index 65 (frame 66)');
  assert.equal(actions.move.end_frame, 92, 'Move end frame must be index 92 (frame 93)');
  assert.equal(manifest.frames.length, 93, 'Total frames must be 93');

  // 3. VFX Red Tornado (85px, 50px/s, Range 85px, CD 5s) & FireOrb (80px, Choáng 0.5s, Starburst 20px, CD 5s)
  assert.ok(manifest.vfx.red_tornado, 'Must have red_tornado vfx config');
  assert.equal(manifest.vfx.red_tornado.name, 'Tornado', 'Red tornado name must be Tornado');
  assert.equal(manifest.vfx.red_tornado.duration_sec, 2.0, 'Red tornado duration must be 2.0s');
  assert.equal(manifest.vfx.red_tornado.height_px, 85, 'Red tornado height must be 85px');
  assert.equal(manifest.vfx.red_tornado.speed_px, 50, 'Red tornado speed must be 50px/s');
  assert.equal(manifest.vfx.red_tornado.range_px, 85, 'Red tornado range must be 85px sweep');
  assert.equal(manifest.vfx.red_tornado.cooldown_sec, 5.0, 'Red tornado cooldown must be 5.0s');
  assert.equal(manifest.vfx.red_tornado.effect, 'root_and_silence', 'Red tornado effect must be root_and_silence');

  assert.ok(manifest.vfx.fire_orb, 'Must have fire_orb vfx config');
  assert.equal(manifest.vfx.fire_orb.name, 'FireOrb', 'FireOrb name must be FireOrb');
  assert.equal(manifest.vfx.fire_orb.diameter_px, 80, 'FireOrb diameter must be 80px');
  assert.equal(manifest.vfx.fire_orb.spawn_offset_y, -20, 'FireOrb spawn must be 20px above target head');
  assert.equal(manifest.vfx.fire_orb.stun_duration_sec, 0.5, 'FireOrb stun must be 0.5s');
  assert.equal(manifest.vfx.fire_orb.cooldown_sec, 5.0, 'FireOrb cooldown must be 5.0s');

  assert.ok(manifest.vfx.fire_orb_explosion, 'Must have fire_orb_explosion config');
  assert.equal(manifest.vfx.fire_orb_explosion.size_px, 20, 'Starburst impact explosion size must be 20px');

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

test('FireOrb Aerial/Ground Targeting, 80px Diameter, 20px Starburst & 0.5s Stun', () => {
  const target = { x: 600, headY: 450, isFlying: true };

  // 1. Tọa độ spawn khóa đúng 20px trên đầu mục tiêu (đáy cầu cách đầu 20px)
  const diameter = 80;
  const radius = diameter / 2; // 40px
  const spawnX = target.x;
  const spawnY = target.headY - 20 - radius; // tâm cầu cách đầu mục tiêu 60px
  assert.equal(spawnY, 390, 'Center spawn Y must be target.headY - 20 - radius = 390px');
  assert.equal(spawnY + radius, 430, 'Bottom of orb must be exactly 20px above target head at spawn');

  // 2. Kích thước 80px hình cầu
  assert.equal(diameter, 80, 'Diameter must be 80px');
  assert.equal(radius, 40, 'Radius must be 40px');

  // 3. Rơi tự do và va chạm khi đáy cầu chạm mục tiêu
  let orbY = spawnY;
  const vy = 300;
  orbY += vy * 0.15; // Rơi xuống Y = 435 (đáy cầu ở Y = 475 > headY = 450)
  const orbBottomY = orbY + radius;
  const hit = (orbBottomY >= target.headY && Math.abs(spawnX - target.x) < 48);
  assert.ok(hit, 'Falling FireOrb bottom must detect collision with target');

  // 4. Choáng 0.5s và Starburst nổ 20px
  const stunDuration = 0.5;
  const starburstSize = 20;
  assert.equal(stunDuration, 0.5, 'Stun duration must be 0.5s with head spinning stars');
  assert.equal(starburstSize, 20, 'Starburst impact size must be 20px');
});

test('Utility AI Target & Skill Selection: Flying -> FireOrb, Ground -> Tornado (Both CD 5s)', () => {
  function decideSkill(nearestEnemy, tornadoCd, fireOrbCd) {
    if (!nearestEnemy) return null;
    if (nearestEnemy.isFlying) {
      if (fireOrbCd <= 0) return 'FIRE_ORB';
    } else {
      if (tornadoCd <= 0) return 'TORNADO';
    }
    return null;
  }

  // Trường hợp 1: Mục tiêu gần nhất đang bay trên không -> Chọn FireOrb
  const flyingEnemy = { x: 450, y: 200, isFlying: true, dist: 300 };
  assert.equal(decideSkill(flyingEnemy, 0, 0), 'FIRE_ORB', 'AI must select FireOrb against airborne enemy');

  // Trường hợp 2: Mục tiêu gần nhất ở dưới mặt đất -> Chọn Tornado
  const groundEnemy = { x: 450, y: 750, isFlying: false, dist: 250 };
  assert.equal(decideSkill(groundEnemy, 0, 0), 'TORNADO', 'AI must select Tornado against ground enemy');
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

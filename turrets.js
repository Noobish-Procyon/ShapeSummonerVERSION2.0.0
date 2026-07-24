// turrets.js

// All summons (turrets)
let sums = [];

// All player + turret shots
let shots = [];

// =========================
// CREATE SUMMON
// =========================
function createSummon(xPos, yPos) {
  let s = {
    x: xPos,
    y: yPos,
    r: 20,

    col: classColors[currentClass],

    hp: 30,

    turretCooldown: 0,
    turretDelay: 30,
    turretDmgMult: 1,
    turretSpd: 6,

    rot: 0,

    lifesteal: 0,
    summoner: false
  };

  // Apply class stats
  applyClassStats(s, currentClass);

  sums.push(s);
}

// =========================
// TURRET TARGETING
// =========================
function getTurretTarget(s) {
  let best = null;
  let bestDist = Infinity;

  // Boss first priority
  if (boss) {
    const d = Math.hypot(boss.x - s.x, boss.y - s.y);
    best = boss;
    bestDist = d;
  }

  // Enemies second priority
  for (let e of enemies) {
    const d = Math.hypot(e.x - s.x, e.y - s.y);
    if (d < bestDist) {
      best = e;
      bestDist = d;
    }
  }

  return best;
}

// =========================
// TURRET UPDATE
// =========================
function updateTurrets() {
  for (let s of sums) {
    s.rot += 0.03;
    border(s);

    const target = getTurretTarget(s);
    if (!target || dead) continue;

    if (s.turretCooldown > 0) {
      s.turretCooldown--;
      continue;
    }

    // Fire shot
    const a = Math.atan2(target.y - s.y, target.x - s.x);

    shots.push({
      x: s.x,
      y: s.y,
      r: 8,
      sp: s.turretSpd,
      dx: Math.cos(a),
      dy: Math.sin(a),
      col: s.col,
      dmg: p.dmg * s.turretDmgMult,
      turret: true,
      lifesteal: s.lifesteal
    });

    s.turretCooldown = s.turretDelay;

    // Summoner class: spawn mini‑summons
    if (s.summoner && Math.random() < 0.01) {
      createSummon(
        s.x + (Math.random() * 40 - 20),
        s.y + (Math.random() * 40 - 20)
      );
    }
  }
}

// =========================
// TURRET SHOT UPDATE
// =========================
function updateTurretShots() {
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];

    s.x += s.dx * s.sp;
    s.y += s.dy * s.sp;

    border(s);

    let hit = false;

    // Hit boss
    if (boss) {
      const d = Math.hypot(s.x - boss.x, s.y - boss.y);
      if (d < s.r + boss.r) {
        boss.hp -= s.dmg;

        if (s.lifesteal) {
          p.hp = Math.min(p.maxHp, p.hp + s.lifesteal * s.dmg);
        }

        if (boss.hp <= 0) {
          boss = null;
          money += 20;
        }

        shots.splice(i, 1);
        continue;
      }
    }

    // Hit enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      const d = Math.hypot(s.x - e.x, s.y - e.y);

      if (d < s.r + e.r) {
        e.hp -= s.dmg;

        if (s.lifesteal) {
          p.hp = Math.min(p.maxHp, p.hp + s.lifesteal * s.dmg);
        }

        if (e.hp <= 0) {
          if (e.type === "summoner") money += 30;
          if (e.type === "minion") money += 5;
          enemies.splice(j, 1);
        }

        shots.splice(i, 1);
        hit = true;
        break;
      }
    }

    // Remove off‑screen shots
    if (
      !hit &&
      (s.x < -50 || s.x > c.width + 50 || s.y < -50 || s.y > c.height + 50)
    ) {
      shots.splice(i, 1);
    }
  }
}

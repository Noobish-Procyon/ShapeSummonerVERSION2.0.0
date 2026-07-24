// enemies.js

// All enemies
let enemies = [];

// Boss object
let boss = null;

// Boss shots
let bShots = [];

// =========================
// SPAWN SUMMONER ENEMY
// =========================
function spawnSummonerEnemy() {
  enemies.push({
    type: "summoner",
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    r: 35,
    hp: 60 * difficulty,
    s: 1.5,
    cd: 0,
    col: "#aa55ff"
  });
}

// =========================
// SPAWN MINION
// =========================
function spawnMinion(x, y) {
  enemies.push({
    type: "minion",
    x,
    y,
    r: 15,
    hp: 20 * difficulty,
    s: 3 + difficulty * 0.2,
    col: "#ff88cc"
  });
}

// =========================
// SPAWN BOSS
// =========================
function spawnBoss() {
  boss = {
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    r: 50,
    hp: 20 * difficulty,
    s: 2 + difficulty * 0.2,
    cd: 0
  };
}

// Boss spawns every 6 seconds
setInterval(() => {
  if (!boss && !paused && !dead) spawnBoss();
}, 6000);

// =========================
// UPDATE ENEMIES
// =========================
function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    // Summoner enemy logic
    if (e.type === "summoner") {
      const a = Math.atan2(p.y - e.y, p.x - e.x);
      e.x += Math.cos(a) * e.s;
      e.y += Math.sin(a) * e.s;
      border(e);

      e.cd--;
      if (e.cd <= 0) {
        const count = 3 + Math.floor(Math.random() * 3);
        for (let k = 0; k < count; k++) {
          spawnMinion(
            e.x + (Math.random() * 40 - 20),
            e.y + (Math.random() * 40 - 20)
          );
        }
        e.cd = 180;
      }
    }

    // Minion logic
    if (e.type === "minion") {
      const a = Math.atan2(p.y - e.y, p.x - e.x);
      e.x += Math.cos(a) * e.s;
      e.y += Math.sin(a) * e.s;
      border(e);
    }

    // Enemy damages player
    const dp = Math.hypot(e.x - p.x, e.y - p.y);
    if (dp < e.r + p.r) {
      p.hp -= 0.5 * difficulty;
      if (p.hp <= 0) dead = true;
    }
  }
}

// =========================
// UPDATE BOSS
// =========================
function updateBoss() {
  if (!boss || dead) return;

  const a = Math.atan2(p.y - boss.y, p.x - boss.x);
  boss.x += Math.cos(a) * boss.s;
  boss.y += Math.sin(a) * boss.s;
  border(boss);

  boss.cd--;
  if (boss.cd <= 0) {
    const ba = Math.atan2(p.y - boss.y, p.x - boss.x);

    bShots.push({
      x: boss.x,
      y: boss.y,
      r: 8,
      sp: 5 + difficulty,
      dx: Math.cos(ba),
      dy: Math.sin(ba),
      col: "orange",
      dmg: 2 * difficulty
    });

    boss.cd = 60;
  }
}

// =========================
// UPDATE BOSS SHOTS
// =========================
function updateBossShots() {
  for (let i = bShots.length - 1; i >= 0; i--) {
    const b = bShots[i];

    b.x += b.dx * b.sp;
    b.y += b.dy * b.sp;
    border(b);

    // Hit player
    const dp = Math.hypot(b.x - p.x, b.y - p.y);
    if (dp < b.r + p.r) {
      p.hp -= b.dmg;
      bShots.splice(i, 1);
      if (p.hp <= 0) dead = true;
      continue;
    }

    // Hit summons
    for (let j = sums.length - 1; j >= 0; j--) {
      const s = sums[j];
      const ds = Math.hypot(b.x - s.x, b.y - s.y);

      if (ds < b.r + s.r) {
        s.hp -= b.dmg;
        if (s.hp <= 0) sums.splice(j, 1);
        bShots.splice(i, 1);
        break;
      }
    }

    // Remove off-screen
    if (
      b.x < -50 ||
      b.x > c.width + 50 ||
      b.y < -50 ||
      b.y > c.height + 50
    ) {
      bShots.splice(i, 1);
    }
  }
}

// ══════════════════════════════════════════════════════
//  🥦🏰 Broccoli Tower Defense — Game Engine
//  Version 0.1.0 (MVP)
// ══════════════════════════════════════════════════════

const VERSION = '0.1.0';

// ═══════════════════════════
//  CONSTANTS
// ═══════════════════════════
const COLS = 16;
const ROWS = 10;
const CELL = 48;
const CANVAS_W = COLS * CELL;  // 768
const CANVAS_H = ROWS * CELL;  // 480

// Cell types
const EMPTY = 0;
const BLOCKED = 1;

// ═══════════════════════════
//  TOWER DEFINITIONS
// ═══════════════════════════
const TOWER_DEFS = {
  broccoli: {
    emoji: '🥦', name: 'ブロッコリー兵', role: '王国歩兵',
    cost: 50, damage: 10, range: 2.5, fireRate: 1.0,
    projectileColor: '#22c55e', projectileSpeed: 8,
    upgrades: [
      { damage: 13, range: 2.75, cost: 30, label: 'Lv.2' },
      { damage: 20, range: 3.0, fireRate: 1.2, cost: 50, label: 'Lv.3' }
    ]
  },
  tomato: {
    emoji: '🍅', name: 'トマトスプラッシュ', role: '王国妨害兵',
    cost: 80, damage: 5, range: 2.0, fireRate: 0.8,
    slow: 0.5, slowDuration: 2.0,
    projectileColor: '#ef4444', projectileSpeed: 6,
    upgrades: [
      { damage: 7, range: 2.2, cost: 48, label: 'Lv.2' },
      { damage: 12, range: 2.5, slow: 0.3, fireRate: 1.0, cost: 80, label: 'Lv.3' }
    ]
  }
};

// ═══════════════════════════
//  ENEMY DEFINITIONS
// ═══════════════════════════
const ENEMY_DEFS = {
  rabbit: {
    emoji: '🐰', name: 'ウサちゃん',
    hp: 30, speed: 1.5, reward: 10
  },
  squirrel: {
    emoji: '🐿️', name: 'リスくん',
    hp: 20, speed: 2.5, reward: 8
  }
};

// ═══════════════════════════
//  STAGE DATA
// ═══════════════════════════
const STAGE = {
  name: '🌱 王国のはずれ',
  entrances: [{ col: 0, row: 4 }],
  exit: { col: 15, row: 4 },
  startCoins: 250,
  lives: 10,
  // blocked cells (decorative obstacles)
  blocked: [
    { col: 4, row: 2 }, { col: 5, row: 2 },
    { col: 4, row: 7 }, { col: 5, row: 7 },
    { col: 10, row: 3 }, { col: 11, row: 3 },
    { col: 10, row: 6 }, { col: 11, row: 6 },
  ],
  waves: [
    { groups: [{ type: 'rabbit', count: 5, interval: 1.5, delay: 0 }] },
    { groups: [{ type: 'rabbit', count: 8, interval: 1.2, delay: 0 }] },
    { groups: [
      { type: 'rabbit', count: 5, interval: 1.0, delay: 0 },
      { type: 'squirrel', count: 4, interval: 0.8, delay: 6 }
    ]},
    { groups: [
      { type: 'squirrel', count: 6, interval: 0.7, delay: 0 },
      { type: 'rabbit', count: 8, interval: 0.8, delay: 5 }
    ]},
    { groups: [
      { type: 'rabbit', count: 10, interval: 0.6, delay: 0 },
      { type: 'squirrel', count: 8, interval: 0.5, delay: 3 },
      { type: 'rabbit', count: 5, interval: 0.4, delay: 8 }
    ]}
  ]
};

// ═══════════════════════════
//  GAME STATE
// ═══════════════════════════
let canvas, ctx;
let state = 'title'; // title, howto, playing, paused, won, lost
let grid = [];         // ROWS x COLS: 0=empty, 1=blocked
let towerGrid = [];    // ROWS x COLS: null or Tower reference
let towers = [];
let enemies = [];
let projectiles = [];
let particles = [];
let coins = 0;
let lives = 0;
let currentWave = 0;
let totalWaves = 0;
let waveActive = false;
let waveSpawners = [];
let gameSpeed = 1;
let lastTime = 0;
let totalKills = 0;
let placingTowerType = null;
let hoverCell = null;
let selectedTower = null;

// ═══════════════════════════
//  A* PATHFINDING
// ═══════════════════════════
function findPath(sc, sr, ec, er) {
  const key = (c, r) => (r << 8) | c;
  const open = [{ c: sc, r: sr, g: 0, f: 0 }];
  const gScore = new Map();
  const from = new Map();
  const closed = new Set();

  gScore.set(key(sc, sr), 0);
  open[0].f = Math.abs(ec - sc) + Math.abs(er - sr);

  while (open.length > 0) {
    // Find node with lowest f
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[best].f) best = i;
    }
    const cur = open.splice(best, 1)[0];
    const ck = key(cur.c, cur.r);

    if (cur.c === ec && cur.r === er) {
      // Reconstruct path
      const path = [{ col: ec, row: er }];
      let k = ck;
      while (from.has(k)) {
        const p = from.get(k);
        path.unshift({ col: p.c, row: p.r });
        k = key(p.c, p.r);
      }
      return path;
    }

    closed.add(ck);

    const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dc, dr] of neighbors) {
      const nc = cur.c + dc;
      const nr = cur.r + dr;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      const nk = key(nc, nr);
      if (closed.has(nk)) continue;
      if (grid[nr][nc] === BLOCKED) continue;
      if (towerGrid[nr][nc] !== null) continue;

      const ng = cur.g + 1;
      const prev = gScore.get(nk);
      if (prev !== undefined && ng >= prev) continue;

      gScore.set(nk, ng);
      from.set(nk, { c: cur.c, r: cur.r });
      const f = ng + Math.abs(ec - nc) + Math.abs(er - nr);
      open.push({ c: nc, r: nr, g: ng, f });
    }
  }
  return null; // No path
}

function getMainPath() {
  const ent = STAGE.entrances[0];
  const ext = STAGE.exit;
  return findPath(ent.col, ent.row, ext.col, ext.row);
}

// ═══════════════════════════
//  TOWER CLASS
// ═══════════════════════════
class Tower {
  constructor(type, col, row) {
    const def = TOWER_DEFS[type];
    this.type = type;
    this.col = col;
    this.row = row;
    this.x = (col + 0.5) * CELL;
    this.y = (row + 0.5) * CELL;
    this.emoji = def.emoji;
    this.name = def.name;
    this.damage = def.damage;
    this.range = def.range;
    this.fireRate = def.fireRate;
    this.slow = def.slow || 0;
    this.slowDuration = def.slowDuration || 0;
    this.projColor = def.projectileColor;
    this.projSpeed = def.projectileSpeed;
    this.level = 1;
    this.cooldown = 0;
    this.totalSpent = def.cost;
    this.target = null;
  }

  get rangePixels() { return this.range * CELL; }

  get sellValue() { return Math.floor(this.totalSpent * 0.5); }

  get upgradeInfo() {
    const def = TOWER_DEFS[this.type];
    if (this.level - 1 >= def.upgrades.length) return null;
    return def.upgrades[this.level - 1];
  }

  upgrade() {
    const info = this.upgradeInfo;
    if (!info || coins < info.cost) return false;
    coins -= info.cost;
    this.totalSpent += info.cost;
    this.level++;
    if (info.damage) this.damage = info.damage;
    if (info.range) this.range = info.range;
    if (info.fireRate) this.fireRate = info.fireRate;
    if (info.slow !== undefined) this.slow = info.slow;
    return true;
  }

  update(dt) {
    this.cooldown -= dt;
    if (this.cooldown > 0) return;

    // Find target: enemy closest to exit (furthest along path)
    let best = null;
    let bestProgress = -1;
    for (const e of enemies) {
      if (e.dead) continue;
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= this.rangePixels && e.pathProgress > bestProgress) {
        best = e;
        bestProgress = e.pathProgress;
      }
    }

    if (best) {
      this.target = best;
      this.cooldown = 1 / this.fireRate;
      // Fire projectile
      projectiles.push(new Projectile(
        this.x, this.y, best,
        this.damage, this.projColor, this.projSpeed,
        this.slow, this.slowDuration
      ));
    }
  }
}

// ═══════════════════════════
//  PROJECTILE CLASS
// ═══════════════════════════
class Projectile {
  constructor(x, y, target, damage, color, speed, slow, slowDur) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.color = color;
    this.speed = speed * CELL;
    this.slow = slow;
    this.slowDur = slowDur;
    this.dead = false;
    this.trail = [];
  }

  update(dt) {
    if (this.target.dead) { this.dead = true; return; }
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 8) {
      // Hit!
      this.target.takeDamage(this.damage);
      if (this.slow > 0) {
        this.target.applySlow(this.slow, this.slowDur);
      }
      this.dead = true;
      // Spawn hit particle
      for (let i = 0; i < 4; i++) {
        particles.push(new Particle(this.x, this.y, this.color));
      }
      return;
    }
    const vx = (dx / dist) * this.speed * dt;
    const vy = (dy / dist) * this.speed * dt;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 4) this.trail.shift();
    this.x += vx;
    this.y += vy;
  }

  render(ctx) {
    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (i + 1) / (this.trail.length + 1) * 0.4;
      ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Bullet
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ═══════════════════════════
//  PARTICLE CLASS
// ═══════════════════════════
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 120;
    this.vy = (Math.random() - 0.5) * 120;
    this.life = 0.4 + Math.random() * 0.3;
    this.maxLife = this.life;
    this.color = color;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  render(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ═══════════════════════════
//  ENEMY CLASS
// ═══════════════════════════
class Enemy {
  constructor(type) {
    const def = ENEMY_DEFS[type];
    this.type = type;
    this.emoji = def.emoji;
    this.name = def.name;
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.baseSpeed = def.speed;
    this.speed = def.speed;
    this.reward = def.reward;
    this.dead = false;
    this.reached = false;
    this.path = null;
    this.pathIndex = 0;
    this.pathProgress = 0;
    this.x = 0;
    this.y = 0;
    this.slowTimer = 0;
    this.fadeTimer = 0; // for death animation
  }

  init(path) {
    this.path = path;
    this.pathIndex = 0;
    this.x = (path[0].col + 0.5) * CELL;
    this.y = (path[0].row + 0.5) * CELL;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.fadeTimer = 0.5;
      coins += this.reward;
      totalKills++;
    }
  }

  applySlow(factor, duration) {
    this.speed = this.baseSpeed * factor;
    this.slowTimer = duration;
  }

  recalcPath() {
    if (!this.path || this.dead) return;
    const curCol = Math.floor(this.x / CELL);
    const curRow = Math.floor(this.y / CELL);
    const ext = STAGE.exit;
    const newPath = findPath(curCol, curRow, ext.col, ext.row);
    if (newPath) {
      this.path = newPath;
      this.pathIndex = 0;
    }
  }

  update(dt) {
    // Death fade
    if (this.dead) {
      this.fadeTimer -= dt;
      return;
    }

    // Slow timer
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.speed = this.baseSpeed;
      }
    }

    if (!this.path || this.pathIndex >= this.path.length - 1) {
      // Reached the exit
      this.reached = true;
      this.dead = true;
      lives--;
      return;
    }

    const target = this.path[this.pathIndex + 1];
    const tx = (target.col + 0.5) * CELL;
    const ty = (target.row + 0.5) * CELL;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      this.pathIndex++;
      this.pathProgress = this.pathIndex / (this.path.length - 1);
    } else {
      const move = this.speed * CELL * dt;
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
      this.pathProgress = (this.pathIndex + (1 - dist / CELL)) / (this.path.length - 1);
    }
  }

  render(ctx) {
    let alpha = 1;
    if (this.dead && this.fadeTimer > 0) {
      alpha = this.fadeTimer / 0.5;
    }

    ctx.globalAlpha = alpha;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + CELL * 0.3, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Emoji
    ctx.font = `${CELL * 0.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, this.x, this.y - 2);

    // HP bar
    if (this.hp < this.maxHp && !this.dead) {
      const barW = CELL * 0.6;
      const barH = 4;
      const bx = this.x - barW / 2;
      const by = this.y - CELL * 0.35;
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(bx, by, barW * (this.hp / this.maxHp), barH);
    }

    // Slow indicator
    if (this.slowTimer > 0 && !this.dead) {
      ctx.font = '10px sans-serif';
      ctx.fillText('❄️', this.x + CELL * 0.25, this.y - CELL * 0.3);
    }

    // Death text
    if (this.dead && this.fadeTimer > 0) {
      ctx.font = '12px "Noto Sans JP", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('😵💫', this.x, this.y - CELL * 0.3 - (1 - alpha) * 20);
    }

    ctx.globalAlpha = 1;
  }
}

// ═══════════════════════════
//  WAVE SPAWNER
// ═══════════════════════════
class WaveSpawner {
  constructor(group) {
    this.type = group.type;
    this.count = group.count;
    this.interval = group.interval;
    this.delay = group.delay || 0;
    this.spawned = 0;
    this.timer = -this.delay; // negative = waiting for delay
    this.done = false;
  }

  update(dt) {
    if (this.done) return;
    this.timer += dt;

    while (this.timer >= this.interval && this.spawned < this.count) {
      this.timer -= this.interval;
      this.spawned++;
      // Spawn enemy
      const path = getMainPath();
      if (path) {
        const enemy = new Enemy(this.type);
        enemy.init(path);
        enemies.push(enemy);
      }
    }

    if (this.spawned >= this.count) this.done = true;
  }
}

// ═══════════════════════════
//  GAME INITIALIZATION
// ═══════════════════════════
function initGame() {
  // Reset state
  grid = [];
  towerGrid = [];
  towers = [];
  enemies = [];
  projectiles = [];
  particles = [];
  coins = STAGE.startCoins;
  lives = STAGE.lives;
  currentWave = 0;
  totalWaves = STAGE.waves.length;
  waveActive = false;
  waveSpawners = [];
  gameSpeed = 1;
  totalKills = 0;
  placingTowerType = null;
  hoverCell = null;
  selectedTower = null;

  // Build grid
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    towerGrid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = EMPTY;
      towerGrid[r][c] = null;
    }
  }

  // Set blocked cells
  for (const b of STAGE.blocked) {
    grid[b.row][b.col] = BLOCKED;
  }

  updateUI();
}

// ═══════════════════════════
//  TOWER PLACEMENT
// ═══════════════════════════
function canPlaceTower(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
    console.log('[canPlace] out of bounds', col, row);
    return false;
  }
  if (grid[row][col] !== EMPTY) {
    console.log('[canPlace] not empty', col, row, 'grid=', grid[row][col]);
    return false;
  }
  if (towerGrid[row][col] !== null) {
    console.log('[canPlace] tower exists', col, row);
    return false;
  }

  // Can't place on entrance or exit
  for (const ent of STAGE.entrances) {
    if (ent.col === col && ent.row === row) {
      console.log('[canPlace] on entrance');
      return false;
    }
  }
  if (STAGE.exit.col === col && STAGE.exit.row === row) {
    console.log('[canPlace] on exit');
    return false;
  }

  // Temporarily place and check if path still exists
  towerGrid[row][col] = 'temp';
  const path = getMainPath();

  // Also check paths for all existing enemies
  let allValid = path !== null;
  if (!allValid) {
    console.log('[canPlace] no main path with tower at', col, row);
  }
  if (allValid) {
    for (const e of enemies) {
      if (e.dead) continue;
      const ec = Math.floor(e.x / CELL);
      const er = Math.floor(e.y / CELL);
      if (ec === col && er === row) { allValid = false; break; }
      const ep = findPath(ec, er, STAGE.exit.col, STAGE.exit.row);
      if (!ep) { allValid = false; break; }
    }
  }

  towerGrid[row][col] = null;
  console.log('[canPlace]', col, row, '→', allValid);
  return allValid;
}

function placeTower(type, col, row) {
  const def = TOWER_DEFS[type];
  console.log('[placeTower]', type, col, row, 'coins=', coins, 'cost=', def.cost);
  if (coins < def.cost) { console.log('[placeTower] not enough coins'); return false; }
  if (!canPlaceTower(col, row)) { console.log('[placeTower] canPlaceTower=false'); return false; }

  coins -= def.cost;
  const tower = new Tower(type, col, row);
  towers.push(tower);
  towerGrid[row][col] = tower;

  // Recalculate paths for existing enemies
  for (const e of enemies) {
    if (!e.dead) e.recalcPath();
  }

  // Particles
  for (let i = 0; i < 6; i++) {
    particles.push(new Particle(tower.x, tower.y, '#22c55e'));
  }

  console.log('[placeTower] SUCCESS at', col, row);
  updateUI();
  return true;
}

function sellTower(tower) {
  const refund = tower.sellValue;
  coins += refund;
  towerGrid[tower.row][tower.col] = null;
  towers = towers.filter(t => t !== tower);

  // Recalculate paths for existing enemies
  for (const e of enemies) {
    if (!e.dead) e.recalcPath();
  }

  selectedTower = null;
  hideTowerPopup();
  updateUI();
}

// ═══════════════════════════
//  WAVE MANAGEMENT
// ═══════════════════════════
function startNextWave() {
  if (waveActive || currentWave >= totalWaves) return;
  currentWave++;
  waveActive = true;
  const waveData = STAGE.waves[currentWave - 1];
  waveSpawners = waveData.groups.map(g => new WaveSpawner(g));
  updateUI();

  // Disable wave button
  document.getElementById('btnNextWave').disabled = true;
}

function checkWaveEnd() {
  if (!waveActive) return;
  const allSpawned = waveSpawners.every(s => s.done);
  const allDead = enemies.every(e => e.dead);
  if (allSpawned && allDead) {
    waveActive = false;
    // Wave complete bonus
    coins += 20 + currentWave * 5;

    if (currentWave >= totalWaves) {
      // Victory!
      showResult(true);
    } else {
      document.getElementById('btnNextWave').disabled = false;
    }
    updateUI();
  }
}

// ═══════════════════════════
//  GAME LOOP
// ═══════════════════════════
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // Cap delta time
  if (dt > 0.1) dt = 0.1;
  dt *= gameSpeed;

  if (state === 'playing') {
    update(dt);
  }

  render();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Update spawners
  for (const s of waveSpawners) {
    s.update(dt);
  }

  // Update enemies
  for (const e of enemies) {
    e.update(dt);
  }

  // Update towers
  for (const t of towers) {
    t.update(dt);
  }

  // Update projectiles
  for (const p of projectiles) {
    p.update(dt);
  }

  // Update particles
  for (const p of particles) {
    p.update(dt);
  }

  // Cleanup
  enemies = enemies.filter(e => !e.dead || e.fadeTimer > 0);
  projectiles = projectiles.filter(p => !p.dead);
  particles = particles.filter(p => !p.dead);

  // Check game over
  if (lives <= 0) {
    lives = 0;
    showResult(false);
    return;
  }

  checkWaveEnd();
  updateUI();
}

// ═══════════════════════════
//  RENDERING
// ═══════════════════════════
function render() {
  if (state !== 'playing' && state !== 'paused') return;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  renderGrid();
  renderPath();
  renderTowers();
  renderEnemies();
  renderProjectiles();
  renderParticles();
  renderPlacementPreview();
  renderSelectedRange();
}

function renderGrid() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * CELL;
      const y = r * CELL;

      // Base grass with subtle checkerboard
      const isLight = (c + r) % 2 === 0;
      ctx.fillStyle = isLight ? '#2d5a27' : '#275222';
      ctx.fillRect(x, y, CELL, CELL);

      // Blocked cells
      if (grid[r][c] === BLOCKED) {
        ctx.fillStyle = '#1a3a16';
        ctx.fillRect(x, y, CELL, CELL);
        ctx.font = `${CELL * 0.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪨', x + CELL / 2, y + CELL / 2);
      }

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeRect(x, y, CELL, CELL);
    }
  }

  // Entrance markers
  for (const ent of STAGE.entrances) {
    const x = ent.col * CELL;
    const y = ent.row * CELL;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fillRect(x, y, CELL, CELL);
    ctx.font = `${CELL * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚪', x + CELL / 2, y + CELL / 2);
  }

  // Exit marker (Broccoli King!)
  const ex = STAGE.exit.col * CELL;
  const ey = STAGE.exit.row * CELL;
  ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
  ctx.fillRect(ex, ey, CELL, CELL);

  // Pulsing glow
  const pulse = 0.5 + Math.sin(Date.now() / 500) * 0.3;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 15 * pulse;
  ctx.font = `${CELL * 0.65}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👑', ex + CELL / 2, ey + CELL * 0.25);
  ctx.fillText('🥦', ex + CELL / 2, ey + CELL * 0.7);
  ctx.shadowBlur = 0;
}

function renderPath() {
  // Show faint path from entrance to exit
  const path = getMainPath();
  if (!path) return;

  ctx.fillStyle = 'rgba(255, 255, 200, 0.06)';
  for (const p of path) {
    ctx.fillRect(p.col * CELL, p.row * CELL, CELL, CELL);
  }
}

function renderTowers() {
  for (const t of towers) {
    const x = t.col * CELL;
    const y = t.row * CELL;

    // Tower background tile (bright, distinct from grass)
    ctx.fillStyle = 'rgba(20, 40, 20, 0.7)';
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

    // Tower base glow
    const color = t.type === 'tomato' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(t.x, t.y, CELL * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Level indicator
    if (t.level > 1) {
      ctx.fillStyle = t.level === 3 ? '#fbbf24' : '#a3e635';
      ctx.beginPath();
      ctx.arc(t.x + CELL * 0.35, t.y - CELL * 0.35, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.level, t.x + CELL * 0.35, t.y - CELL * 0.35);
    }

    // Emoji (large and clear)
    const size = t.level === 3 ? CELL * 0.85 : CELL * 0.75;
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.emoji, t.x, t.y + 2);

    // Border to make it stand out
    const borderColor = t.type === 'tomato' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
    ctx.lineWidth = 1;
  }
}

function renderEnemies() {
  for (const e of enemies) {
    e.render(ctx);
  }
}

function renderProjectiles() {
  for (const p of projectiles) {
    p.render(ctx);
  }
}

function renderParticles() {
  for (const p of particles) {
    p.render(ctx);
  }
}

function renderPlacementPreview() {
  if (!placingTowerType) return;

  const def = TOWER_DEFS[placingTowerType];

  // Highlight ALL placeable cells when in placement mode
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === EMPTY && towerGrid[r][c] === null) {
        // Skip entrance/exit
        let isSpecial = false;
        for (const ent of STAGE.entrances) {
          if (ent.col === c && ent.row === r) isSpecial = true;
        }
        if (STAGE.exit.col === c && STAGE.exit.row === r) isSpecial = true;
        if (isSpecial) continue;

        ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
        ctx.strokeRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
      }
    }
  }

  // Hover cell preview
  if (!hoverCell) return;
  const { col, row } = hoverCell;
  const x = col * CELL;
  const y = row * CELL;
  const valid = canPlaceTower(col, row) && coins >= def.cost;

  // Cell highlight
  ctx.fillStyle = valid ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)';
  ctx.fillRect(x, y, CELL, CELL);

  // Range preview
  if (valid) {
    ctx.strokeStyle = 'rgba(34,197,94,0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x + CELL / 2, y + CELL / 2, def.range * CELL, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;

    // Preview emoji
    ctx.globalAlpha = 0.7;
    ctx.font = `${CELL * 0.75}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.emoji, x + CELL / 2, y + CELL / 2 + 2);
    ctx.globalAlpha = 1;
  } else {
    // X mark for invalid
    ctx.font = `${CELL * 0.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('✕', x + CELL / 2, y + CELL / 2);
  }
}

function renderSelectedRange() {
  if (!selectedTower) return;
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(selectedTower.x, selectedTower.y, selectedTower.rangePixels, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 1;

  // Selected highlight
  ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
  ctx.fillRect(selectedTower.col * CELL, selectedTower.row * CELL, CELL, CELL);
}

// ═══════════════════════════
//  UI
// ═══════════════════════════
function updateUI() {
  document.getElementById('livesDisplay').textContent = `❤️ ${lives}`;
  document.getElementById('coinsDisplay').textContent = `🪙 ${coins}`;
  document.getElementById('waveDisplay').textContent = `Wave ${currentWave} / ${totalWaves}`;

  // Tower button affordability
  for (const btn of document.querySelectorAll('.tower-btn')) {
    const type = btn.dataset.tower;
    const def = TOWER_DEFS[type];
    btn.disabled = coins < def.cost;
    btn.classList.toggle('selected', placingTowerType === type);
  }

  // Guide text
  const guide = document.getElementById('paletteGuide');
  if (guide) {
    if (placingTowerType) {
      const def = TOWER_DEFS[placingTowerType];
      guide.textContent = `${def.emoji} ${def.name} — マップをクリックで配置`;
      guide.classList.remove('hidden');
    } else if (towers.length === 0 && currentWave === 0) {
      guide.textContent = '← タワーを選んでマップをクリック';
      guide.classList.remove('hidden');
    } else {
      guide.classList.add('hidden');
    }
  }

  // Speed button
  const speedBtn = document.getElementById('btnSpeed');
  speedBtn.textContent = `×${gameSpeed}`;
  speedBtn.classList.toggle('active', gameSpeed > 1);
}

function showTowerPopup(tower) {
  selectedTower = tower;
  const popup = document.getElementById('towerPopup');
  const info = document.getElementById('popupInfo');
  const upgradeBtn = document.getElementById('btnUpgrade');

  const upInfo = tower.upgradeInfo;
  let html = `<div class="popup-title">${tower.emoji} ${tower.name} Lv.${tower.level}</div>`;
  html += `ATK: ${tower.damage} | 射程: ${tower.range.toFixed(1)}<br>`;
  html += `売却: 💰${tower.sellValue}`;
  if (upInfo) {
    html += `<br>⬆️ ${upInfo.label}: ${upInfo.cost}🪙`;
  }
  info.innerHTML = html;

  upgradeBtn.disabled = !upInfo || coins < (upInfo ? upInfo.cost : Infinity);
  upgradeBtn.style.display = upInfo ? '' : 'none';

  // Position popup near the tower
  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = canvasRect.width / CANVAS_W;
  const scaleY = canvasRect.height / CANVAS_H;
  let px = tower.x * scaleX + canvasRect.left - document.getElementById('canvasWrapper').getBoundingClientRect().left;
  let py = tower.y * scaleY - 80;

  if (py < 10) py = tower.y * scaleY + 30;
  if (px > canvasRect.width - 140) px = canvasRect.width - 140;
  if (px < 10) px = 10;

  popup.style.left = px + 'px';
  popup.style.top = py + 'px';
  popup.style.display = '';
}

function hideTowerPopup() {
  document.getElementById('towerPopup').style.display = 'none';
  selectedTower = null;
}

function showResult(won) {
  state = won ? 'won' : 'lost';

  const title = document.getElementById('resultTitle');
  const stars = document.getElementById('resultStars');
  const stats = document.getElementById('resultStats');

  if (won) {
    title.textContent = '🎉 ステージクリア！';
    title.style.color = '#4ade80';
    const starsCount = lives >= STAGE.lives ? 3 : lives >= STAGE.lives / 2 ? 2 : 1;
    stars.textContent = '⭐'.repeat(starsCount) + '☆'.repeat(3 - starsCount);
  } else {
    title.textContent = '😢 ゲームオーバー';
    title.style.color = '#f87171';
    stars.textContent = '';
  }

  const score = (lives * 500) + (totalKills * 10) + (coins * 2);
  stats.innerHTML = `
    撃破数: ${totalKills}<br>
    残りライフ: ${lives} / ${STAGE.lives}<br>
    残りコイン: ${coins}<br>
    スコア: ${score.toLocaleString()}
  `;

  // Save high score
  const key = 'broccoli-td-highscore-1';
  const prev = parseInt(localStorage.getItem(key) || '0');
  if (score > prev) {
    localStorage.setItem(key, score.toString());
    stats.innerHTML += `<br><span style="color:#fbbf24">🏆 ハイスコア更新！</span>`;
  }

  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = '';
}

// ═══════════════════════════
//  INPUT HANDLING
// ═══════════════════════════
function getCanvasCell(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (CANVAS_W / rect.width);
  const y = (clientY - rect.top) * (CANVAS_H / rect.height);
  const col = Math.floor(x / CELL);
  const row = Math.floor(y / CELL);
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
  return { col, row };
}

function onCanvasClick(e) {
  e.preventDefault();
  e.stopPropagation();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const cell = getCanvasCell(clientX, clientY);
  console.log('[click] cell=', cell, 'placingType=', placingTowerType);
  if (!cell) return;

  // If placing a tower
  if (placingTowerType) {
    if (placeTower(placingTowerType, cell.col, cell.row)) {
      // Keep placing mode if shift held (PC only)
      if (!e.shiftKey) {
        placingTowerType = null;
      }
    }
    hideTowerPopup();
    updateUI();
    return;
  }

  // If clicking on an existing tower
  const tower = towerGrid[cell.row][cell.col];
  if (tower && tower !== 'temp') {
    if (selectedTower === tower) {
      hideTowerPopup();
    } else {
      showTowerPopup(tower);
    }
    return;
  }

  // Otherwise, deselect
  hideTowerPopup();
}

function onCanvasMove(e) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  hoverCell = getCanvasCell(clientX, clientY);
}

function onCanvasLeave() {
  hoverCell = null;
}

// ═══════════════════════════
//  SCREEN MANAGEMENT
// ═══════════════════════════
function showScreen(name) {
  const screens = ['titleScreen', 'howToScreen', 'gameScreen', 'resultScreen'];
  for (const s of screens) {
    document.getElementById(s).style.display = s === name ? '' : 'none';
  }
  document.getElementById('pauseOverlay').style.display = 'none';
}

function startGame() {
  state = 'playing';
  initGame();
  showScreen('gameScreen');
  document.getElementById('btnNextWave').disabled = false;
  lastTime = 0;
}

// ═══════════════════════════
//  SETUP
// ═══════════════════════════
function setup() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  // Version
  document.getElementById('versionDisplay').textContent = `v${VERSION}`;

  // ── Event Listeners ──

  // Title
  document.getElementById('btnStart').addEventListener('click', startGame);
  document.getElementById('btnHowTo').addEventListener('click', () => {
    showScreen('howToScreen');
  });
  document.getElementById('btnBackTitle').addEventListener('click', () => {
    showScreen('titleScreen');
  });

  // Canvas
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('touchstart', onCanvasClick, { passive: false });
  canvas.addEventListener('mousemove', onCanvasMove);
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    onCanvasMove(e);
  }, { passive: false });
  canvas.addEventListener('mouseleave', onCanvasLeave);

  // Tower palette
  for (const btn of document.querySelectorAll('.tower-btn')) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = btn.dataset.tower;
      console.log('[palette] clicked', type, 'current=', placingTowerType);
      if (placingTowerType === type) {
        placingTowerType = null;
      } else {
        placingTowerType = type;
        hideTowerPopup();
      }
      updateUI();
    });
  }

  // Next wave
  document.getElementById('btnNextWave').addEventListener('click', (e) => {
    e.stopPropagation();
    startNextWave();
    updateUI();
  });

  // Speed
  document.getElementById('btnSpeed').addEventListener('click', () => {
    if (gameSpeed === 1) gameSpeed = 2;
    else if (gameSpeed === 2) gameSpeed = 3;
    else gameSpeed = 1;
    updateUI();
  });

  // Pause
  document.getElementById('btnPause').addEventListener('click', () => {
    if (state === 'playing') {
      state = 'paused';
      document.getElementById('pauseOverlay').style.display = '';
    }
  });

  document.getElementById('btnResume').addEventListener('click', () => {
    state = 'playing';
    document.getElementById('pauseOverlay').style.display = 'none';
    lastTime = 0;
  });

  document.getElementById('btnQuit').addEventListener('click', () => {
    state = 'title';
    showScreen('titleScreen');
  });

  // Tower popup buttons
  document.getElementById('btnUpgrade').addEventListener('click', () => {
    if (selectedTower && selectedTower.upgrade()) {
      showTowerPopup(selectedTower); // refresh popup
      updateUI();
    }
  });

  document.getElementById('btnSell').addEventListener('click', () => {
    if (selectedTower) sellTower(selectedTower);
  });

  document.getElementById('btnClosePopup').addEventListener('click', hideTowerPopup);

  // Result
  document.getElementById('btnRetry').addEventListener('click', startGame);
  document.getElementById('btnToTitle').addEventListener('click', () => {
    state = 'title';
    showScreen('titleScreen');
  });

  // Sound (placeholder)
  document.getElementById('btnSound').addEventListener('click', function () {
    this.textContent = this.textContent === '🔇' ? '🔊' : '🔇';
  });

  // Click outside game area to deselect
  document.addEventListener('click', (e) => {
    // Don't reset if click was inside game UI
    if (e.target.closest('#canvasWrapper') ||
        e.target.closest('#towerPalette') ||
        e.target.closest('#statusBar') ||
        e.target.closest('#towerPopup')) {
      return;
    }
    console.log('[doc click] resetting, target=', e.target.tagName, e.target.id);
    hideTowerPopup();
    placingTowerType = null;
    updateUI();
  });

  // Start game loop
  requestAnimationFrame(gameLoop);
}

// Go!
document.addEventListener('DOMContentLoaded', setup);

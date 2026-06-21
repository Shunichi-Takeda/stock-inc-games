// ══════════════════════════════════════════════════════
//  🥦🏰 Broccoli Tower Defense — Game Engine
//  Version 0.3.0 (Phase 3)
// ══════════════════════════════════════════════════════

const VERSION = '0.3.0';

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
    desc: '安定した攻撃力の基本タワー。迷路作りに最適！',
    cost: 50, damage: 10, range: 2.5, fireRate: 1.0,
    projectileColor: '#22c55e', projectileSpeed: 8,
    upgrades: [
      { damage: 13, range: 2.75, cost: 30, label: 'Lv.2' },
      { damage: 20, range: 3.0, fireRate: 1.2, cost: 50, label: 'Lv.3' }
    ]
  },
  tomato: {
    emoji: '🍅', name: 'トマトスプラッシュ', role: '王国妨害兵',
    desc: 'ヒット時に敵をスロー！鈍足効果で時間を稼ぐ。',
    cost: 80, damage: 5, range: 2.0, fireRate: 0.8,
    slow: 0.5, slowDuration: 2.0,
    projectileColor: '#ef4444', projectileSpeed: 6,
    upgrades: [
      { damage: 7, range: 2.2, cost: 48, label: 'Lv.2' },
      { damage: 12, range: 2.5, slow: 0.3, fireRate: 1.0, cost: 80, label: 'Lv.3' }
    ]
  },
  carrot: {
    emoji: '🥕', name: 'ニンジンガンナー', role: '王国狙撃兵',
    desc: '長射程・高火力のスナイパー。遠くの敵を一撃で仕留める！',
    cost: 100, damage: 25, range: 4, fireRate: 0.5,
    projectileColor: '#f97316', projectileSpeed: 12,
    upgrades: [
      { damage: 35, range: 4.5, cost: 60, label: 'Lv.2' },
      { damage: 50, range: 5.0, fireRate: 0.6, cost: 100, label: 'Lv.3' }
    ]
  },
  corn: {
    emoji: '🌽', name: 'コーンバースト', role: '王国砲兵',
    desc: '短射程だが広範囲の爆発攻撃！密集した敵に大ダメージ。',
    cost: 120, damage: 8, range: 1.8, fireRate: 0.6,
    splashRadius: 1.2,
    projectileColor: '#eab308', projectileSpeed: 6,
    upgrades: [
      { damage: 12, range: 2.0, splashRadius: 1.5, cost: 72, label: 'Lv.2' },
      { damage: 18, range: 2.2, splashRadius: 1.8, fireRate: 0.8, cost: 120, label: 'Lv.3' }
    ]
  },
  garlic: {
    emoji: '🧄', name: 'ガーリックオーラ', role: '王国衛兵',
    desc: '弾なし！周囲の敵に毎秒ダメージを与える持続オーラ。',
    cost: 150, damage: 0, range: 1.5, fireRate: 1.0,
    auraDamage: 5,
    projectileColor: '#d4d4d8', projectileSpeed: 0,
    upgrades: [
      { auraDamage: 8, range: 1.8, cost: 90, label: 'Lv.2' },
      { auraDamage: 14, range: 2.2, cost: 150, label: 'Lv.3' }
    ]
  },
  eggplant: {
    emoji: '🍆', name: 'ナスシールド', role: '王国司令官',
    desc: '弾なし！周囲の味方タワーの攻撃力を+30%バフする支援型。',
    cost: 200, damage: 0, range: 2.5, fireRate: 1.0,
    buffRange: 2.5, buffMultiplier: 0.3,
    projectileColor: '#8b5cf6', projectileSpeed: 0,
    upgrades: [
      { buffRange: 3.0, buffMultiplier: 0.4, cost: 120, label: 'Lv.2' },
      { buffRange: 3.5, buffMultiplier: 0.5, cost: 200, label: 'Lv.3' }
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
  },
  hamster: {
    emoji: '🐹', name: 'ハムちゃん',
    hp: 60, speed: 1.2, reward: 15
  },
  hedgehog: {
    emoji: '🦔', name: 'ハリネズミ',
    hp: 80, speed: 0.8, reward: 20,
    special: 'curl' // HP50%以下で丸まり3秒間ダメージ半減
  },
  bird: {
    emoji: '🐦', name: 'ことりさん',
    hp: 25, speed: 3.0, reward: 12,
    flying: true // 道を無視して直線移動
  },
  fox: {
    emoji: '🦊', name: 'キツネさん',
    hp: 100, speed: 1.3, reward: 25,
    slowImmune: true // スロー無効
  },
  bear: {
    emoji: '🐻', name: 'クマさん',
    hp: 200, speed: 0.6, reward: 40,
    healAura: 3 // 周囲2セル内の敵を毎秒3HP回復
  },
  wolf: {
    emoji: '👑', name: 'おおかみ大王',
    hp: 500, speed: 0.5, reward: 100,
    summonInterval: 30 // 30秒ごとにウサちゃんを2体召喚
  }
};

// ═══════════════════════════
//  STAGE DATA (5 stages)
// ═══════════════════════════
const STAGES = [
  // ── Stage 1: 🌱 王国のはずれ ──
  {
    name: '🌱 王国のはずれ',
    entrances: [{ col: 0, row: 4 }],
    exit: { col: 15, row: 4 },
    startCoins: 250,
    lives: 10,
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
      ]},
      { groups: [
        { type: 'squirrel', count: 10, interval: 0.5, delay: 0 },
        { type: 'rabbit', count: 12, interval: 0.4, delay: 4 }
      ]},
      { groups: [
        { type: 'rabbit', count: 15, interval: 0.4, delay: 0 },
        { type: 'squirrel', count: 10, interval: 0.4, delay: 2 }
      ]},
      { groups: [
        { type: 'squirrel', count: 15, interval: 0.3, delay: 0 },
        { type: 'rabbit', count: 15, interval: 0.3, delay: 3 },
        { type: 'squirrel', count: 10, interval: 0.25, delay: 7 }
      ]}
    ]
  },

  // ── Stage 2: 🌿 丘の上の見張り台 ──
  {
    name: '🌿 丘の上の見張り台',
    entrances: [{ col: 0, row: 3 }, { col: 8, row: 0 }],
    exit: { col: 15, row: 5 },
    startCoins: 300,
    lives: 10,
    blocked: [
      { col: 3, row: 1 }, { col: 3, row: 2 }, { col: 4, row: 1 }, { col: 4, row: 2 },
      { col: 6, row: 4 }, { col: 7, row: 4 }, { col: 6, row: 5 }, { col: 7, row: 5 },
      { col: 11, row: 2 }, { col: 12, row: 2 }, { col: 11, row: 3 },
      { col: 3, row: 7 }, { col: 4, row: 7 }, { col: 4, row: 8 },
      { col: 9, row: 7 }, { col: 10, row: 7 }, { col: 10, row: 8 },
      { col: 13, row: 6 }, { col: 13, row: 7 },
    ],
    waves: [
      { groups: [
        { type: 'rabbit', count: 6, interval: 1.2, delay: 0, entrance: 0 },
        { type: 'squirrel', count: 4, interval: 1.0, delay: 3, entrance: 1 }
      ]},
      { groups: [
        { type: 'hamster', count: 3, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'rabbit', count: 6, interval: 1.0, delay: 2, entrance: 1 }
      ]},
      { groups: [
        { type: 'squirrel', count: 8, interval: 0.7, delay: 0, entrance: 0 },
        { type: 'hamster', count: 4, interval: 1.5, delay: 3, entrance: 1 }
      ]},
      { groups: [
        { type: 'rabbit', count: 10, interval: 0.6, delay: 0, entrance: 0 },
        { type: 'hedgehog', count: 2, interval: 3.0, delay: 4, entrance: 1 }
      ]},
      { groups: [
        { type: 'hamster', count: 6, interval: 1.0, delay: 0, entrance: 0 },
        { type: 'squirrel', count: 8, interval: 0.6, delay: 2, entrance: 1 }
      ]},
      { groups: [
        { type: 'hedgehog', count: 4, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'rabbit', count: 12, interval: 0.5, delay: 3, entrance: 1 }
      ]},
      { groups: [
        { type: 'hamster', count: 8, interval: 0.8, delay: 0, entrance: 0 },
        { type: 'hedgehog', count: 3, interval: 2.5, delay: 2, entrance: 1 },
        { type: 'squirrel', count: 10, interval: 0.5, delay: 5, entrance: 0 }
      ]},
      { groups: [
        { type: 'hedgehog', count: 5, interval: 1.5, delay: 0, entrance: 0 },
        { type: 'hamster', count: 10, interval: 0.6, delay: 2, entrance: 1 },
        { type: 'rabbit', count: 15, interval: 0.3, delay: 5, entrance: 0 }
      ]}
    ]
  },

  // ── Stage 3: 🌲 王国の森の防衛線 ──
  {
    name: '🌲 王国の森の防衛線',
    entrances: [{ col: 0, row: 4 }, { col: 7, row: 0 }, { col: 7, row: 9 }],
    exit: { col: 15, row: 5 },
    startCoins: 350,
    lives: 10,
    blocked: [
      { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 2, row: 2 },
      { col: 5, row: 3 }, { col: 5, row: 4 },
      { col: 2, row: 7 }, { col: 3, row: 7 }, { col: 2, row: 8 },
      { col: 5, row: 6 }, { col: 5, row: 7 },
      { col: 9, row: 2 }, { col: 10, row: 2 }, { col: 9, row: 3 },
      { col: 9, row: 7 }, { col: 10, row: 7 }, { col: 9, row: 8 },
      { col: 12, row: 4 }, { col: 12, row: 5 },
      { col: 13, row: 1 }, { col: 14, row: 1 },
      { col: 13, row: 8 }, { col: 14, row: 8 },
    ],
    waves: [
      { groups: [
        { type: 'rabbit', count: 6, interval: 1.0, delay: 0, entrance: 0 },
        { type: 'squirrel', count: 4, interval: 1.0, delay: 3, entrance: 1 }
      ]},
      { groups: [
        { type: 'hamster', count: 4, interval: 1.5, delay: 0, entrance: 2 },
        { type: 'rabbit', count: 8, interval: 0.8, delay: 2, entrance: 0 }
      ]},
      { groups: [
        { type: 'bird', count: 3, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'squirrel', count: 6, interval: 0.8, delay: 1, entrance: 1 },
        { type: 'hamster', count: 4, interval: 1.2, delay: 4, entrance: 2 }
      ]},
      { groups: [
        { type: 'hedgehog', count: 3, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'fox', count: 2, interval: 3.0, delay: 3, entrance: 1 }
      ]},
      { groups: [
        { type: 'bird', count: 5, interval: 1.5, delay: 0, entrance: 0 },
        { type: 'hamster', count: 6, interval: 1.0, delay: 2, entrance: 2 },
        { type: 'rabbit', count: 10, interval: 0.6, delay: 4, entrance: 1 }
      ]},
      { groups: [
        { type: 'fox', count: 3, interval: 2.5, delay: 0, entrance: 0 },
        { type: 'hedgehog', count: 4, interval: 2.0, delay: 2, entrance: 1 },
        { type: 'squirrel', count: 10, interval: 0.5, delay: 4, entrance: 2 }
      ]},
      { groups: [
        { type: 'bird', count: 6, interval: 1.2, delay: 0, entrance: 0 },
        { type: 'fox', count: 4, interval: 2.0, delay: 3, entrance: 1 },
        { type: 'hamster', count: 8, interval: 0.8, delay: 5, entrance: 2 }
      ]},
      { groups: [
        { type: 'hedgehog', count: 5, interval: 1.5, delay: 0, entrance: 0 },
        { type: 'bird', count: 8, interval: 1.0, delay: 2, entrance: 1 },
        { type: 'fox', count: 5, interval: 1.5, delay: 4, entrance: 2 }
      ]},
      { groups: [
        { type: 'fox', count: 6, interval: 1.2, delay: 0, entrance: 0 },
        { type: 'hedgehog', count: 6, interval: 1.2, delay: 2, entrance: 1 },
        { type: 'hamster', count: 10, interval: 0.6, delay: 4, entrance: 2 },
        { type: 'bird', count: 5, interval: 1.0, delay: 7, entrance: 0 }
      ]},
      { groups: [
        { type: 'fox', count: 8, interval: 1.0, delay: 0, entrance: 0 },
        { type: 'bird', count: 10, interval: 0.8, delay: 2, entrance: 1 },
        { type: 'hedgehog', count: 8, interval: 1.0, delay: 3, entrance: 2 },
        { type: 'hamster', count: 12, interval: 0.5, delay: 6, entrance: 0 }
      ]}
    ]
  },

  // ── Stage 4: ❄️ 冬の王宮庭園 ──
  {
    name: '❄️ 冬の王宮庭園',
    entrances: [{ col: 0, row: 3 }, { col: 8, row: 0 }],
    exit: { col: 15, row: 5 },
    startCoins: 400,
    lives: 10,
    iceZones: [
      { col: 5, row: 3 }, { col: 6, row: 3 }, { col: 7, row: 3 },
      { col: 5, row: 4 }, { col: 6, row: 4 }, { col: 7, row: 4 },
      { col: 5, row: 5 }, { col: 6, row: 5 }, { col: 7, row: 5 },
      { col: 5, row: 6 }, { col: 6, row: 6 }, { col: 7, row: 6 },
      { col: 10, row: 4 }, { col: 11, row: 4 }, { col: 12, row: 4 },
      { col: 10, row: 5 }, { col: 11, row: 5 }, { col: 12, row: 5 },
    ],
    blocked: [
      { col: 3, row: 1 }, { col: 4, row: 1 },
      { col: 3, row: 8 }, { col: 4, row: 8 },
      { col: 9, row: 2 }, { col: 9, row: 3 },
      { col: 9, row: 6 }, { col: 9, row: 7 },
      { col: 13, row: 3 }, { col: 14, row: 3 },
      { col: 13, row: 7 }, { col: 14, row: 7 },
    ],
    waves: [
      { groups: [
        { type: 'rabbit', count: 8, interval: 1.0, delay: 0, entrance: 0 },
        { type: 'hamster', count: 4, interval: 1.5, delay: 3, entrance: 1 }
      ]},
      { groups: [
        { type: 'hedgehog', count: 3, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'squirrel', count: 8, interval: 0.7, delay: 2, entrance: 1 }
      ]},
      { groups: [
        { type: 'fox', count: 3, interval: 2.5, delay: 0, entrance: 0 },
        { type: 'bird', count: 5, interval: 1.5, delay: 2, entrance: 1 },
        { type: 'hamster', count: 6, interval: 1.0, delay: 5, entrance: 0 }
      ]},
      { groups: [
        { type: 'bear', count: 1, interval: 5.0, delay: 0, entrance: 0 },
        { type: 'rabbit', count: 10, interval: 0.6, delay: 3, entrance: 1 }
      ]},
      { groups: [
        { type: 'fox', count: 4, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'hedgehog', count: 5, interval: 1.5, delay: 2, entrance: 1 },
        { type: 'bird', count: 6, interval: 1.2, delay: 5, entrance: 0 }
      ]},
      { groups: [
        { type: 'bear', count: 2, interval: 4.0, delay: 0, entrance: 0 },
        { type: 'hamster', count: 8, interval: 0.8, delay: 3, entrance: 1 },
        { type: 'squirrel', count: 12, interval: 0.5, delay: 5, entrance: 0 }
      ]},
      { groups: [
        { type: 'bird', count: 8, interval: 1.0, delay: 0, entrance: 0 },
        { type: 'fox', count: 6, interval: 1.5, delay: 2, entrance: 1 },
        { type: 'bear', count: 2, interval: 5.0, delay: 5, entrance: 0 }
      ]},
      { groups: [
        { type: 'hedgehog', count: 6, interval: 1.2, delay: 0, entrance: 0 },
        { type: 'bear', count: 3, interval: 3.0, delay: 2, entrance: 1 },
        { type: 'fox', count: 8, interval: 1.0, delay: 5, entrance: 0 }
      ]},
      { groups: [
        { type: 'bear', count: 3, interval: 3.0, delay: 0, entrance: 0 },
        { type: 'bird', count: 10, interval: 0.8, delay: 2, entrance: 1 },
        { type: 'fox', count: 8, interval: 1.0, delay: 4, entrance: 0 },
        { type: 'hedgehog', count: 6, interval: 1.0, delay: 7, entrance: 1 }
      ]},
      { groups: [
        { type: 'bear', count: 4, interval: 2.5, delay: 0, entrance: 0 },
        { type: 'fox', count: 10, interval: 0.8, delay: 2, entrance: 1 },
        { type: 'bird', count: 12, interval: 0.6, delay: 4, entrance: 0 },
        { type: 'hamster', count: 15, interval: 0.4, delay: 6, entrance: 1 }
      ]}
    ]
  },

  // ── Stage 5: 👑 ブロッコリー玉座の間 ──
  {
    name: '👑 ブロッコリー玉座の間',
    entrances: [
      { col: 0, row: 4 },   // 左
      { col: 15, row: 4 },  // 右 (exit はこっちじゃない)
      { col: 8, row: 0 },   // 上
      { col: 8, row: 9 }    // 下
    ],
    exit: { col: 8, row: 5 },
    startCoins: 500,
    lives: 10,
    blocked: [
      { col: 2, row: 2 }, { col: 3, row: 2 },
      { col: 2, row: 7 }, { col: 3, row: 7 },
      { col: 12, row: 2 }, { col: 13, row: 2 },
      { col: 12, row: 7 }, { col: 13, row: 7 },
      { col: 6, row: 3 }, { col: 10, row: 3 },
      { col: 6, row: 6 }, { col: 10, row: 6 },
    ],
    waves: [
      { groups: [
        { type: 'rabbit', count: 8, interval: 1.0, delay: 0, entrance: 0 },
        { type: 'squirrel', count: 6, interval: 0.8, delay: 3, entrance: 2 }
      ]},
      { groups: [
        { type: 'hamster', count: 5, interval: 1.2, delay: 0, entrance: 1 },
        { type: 'rabbit', count: 10, interval: 0.7, delay: 2, entrance: 3 }
      ]},
      { groups: [
        { type: 'hedgehog', count: 4, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'bird', count: 5, interval: 1.5, delay: 2, entrance: 2 },
        { type: 'hamster', count: 6, interval: 1.0, delay: 5, entrance: 1 }
      ]},
      { groups: [
        { type: 'fox', count: 4, interval: 2.0, delay: 0, entrance: 3 },
        { type: 'hedgehog', count: 5, interval: 1.5, delay: 3, entrance: 0 },
        { type: 'squirrel', count: 12, interval: 0.5, delay: 5, entrance: 2 }
      ]},
      { groups: [
        { type: 'bear', count: 2, interval: 4.0, delay: 0, entrance: 0 },
        { type: 'fox', count: 5, interval: 1.5, delay: 3, entrance: 1 },
        { type: 'bird', count: 8, interval: 1.0, delay: 5, entrance: 2 }
      ]},
      { groups: [
        { type: 'bear', count: 2, interval: 3.0, delay: 0, entrance: 0 },
        { type: 'hedgehog', count: 6, interval: 1.2, delay: 2, entrance: 1 },
        { type: 'fox', count: 6, interval: 1.2, delay: 4, entrance: 2 },
        { type: 'hamster', count: 10, interval: 0.6, delay: 6, entrance: 3 }
      ]},
      { groups: [
        { type: 'bird', count: 10, interval: 0.8, delay: 0, entrance: 0 },
        { type: 'bear', count: 3, interval: 3.0, delay: 2, entrance: 1 },
        { type: 'fox', count: 8, interval: 1.0, delay: 4, entrance: 2 },
        { type: 'hedgehog', count: 6, interval: 1.0, delay: 6, entrance: 3 }
      ]},
      { groups: [
        { type: 'bear', count: 3, interval: 2.5, delay: 0, entrance: 0 },
        { type: 'fox', count: 8, interval: 1.0, delay: 2, entrance: 1 },
        { type: 'bird', count: 10, interval: 0.8, delay: 3, entrance: 2 },
        { type: 'hamster', count: 12, interval: 0.5, delay: 5, entrance: 3 }
      ]},
      { groups: [
        { type: 'bear', count: 4, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'hedgehog', count: 8, interval: 1.0, delay: 2, entrance: 1 },
        { type: 'fox', count: 10, interval: 0.8, delay: 3, entrance: 2 },
        { type: 'bird', count: 12, interval: 0.6, delay: 5, entrance: 3 }
      ]},
      { groups: [
        { type: 'fox', count: 10, interval: 0.8, delay: 0, entrance: 0 },
        { type: 'bear', count: 4, interval: 2.0, delay: 2, entrance: 1 },
        { type: 'hedgehog', count: 10, interval: 0.8, delay: 3, entrance: 2 },
        { type: 'bird', count: 15, interval: 0.5, delay: 5, entrance: 3 },
        { type: 'hamster', count: 15, interval: 0.4, delay: 7, entrance: 0 }
      ]},
      { groups: [
        { type: 'bear', count: 5, interval: 2.0, delay: 0, entrance: 0 },
        { type: 'fox', count: 12, interval: 0.7, delay: 2, entrance: 1 },
        { type: 'bird', count: 15, interval: 0.5, delay: 4, entrance: 2 },
        { type: 'hedgehog', count: 10, interval: 0.7, delay: 5, entrance: 3 }
      ]},
      { groups: [
        { type: 'wolf', count: 1, interval: 5.0, delay: 0, entrance: 0 },
        { type: 'bear', count: 4, interval: 2.0, delay: 3, entrance: 1 },
        { type: 'fox', count: 10, interval: 0.8, delay: 5, entrance: 2 },
        { type: 'bird', count: 12, interval: 0.6, delay: 6, entrance: 3 },
        { type: 'hedgehog', count: 8, interval: 0.8, delay: 8, entrance: 0 }
      ]}
    ]
  }
];

// ═══════════════════════════
//  SKILL DEFINITIONS
// ═══════════════════════════
const SKILL_DEFS = [
  {
    id: 'gust',
    emoji: '💨',
    name: '王の威風',
    desc: '全敵を2秒停止',
    cooldown: 45
  },
  {
    id: 'inspire',
    emoji: '☀️',
    name: '王の激励',
    desc: '全タワー攻撃速度2倍を10秒',
    cooldown: 60
  },
  {
    id: 'rain',
    emoji: '🌧️',
    name: '王の恵みの雨',
    desc: '全敵に50ダメージ',
    cooldown: 90
  }
];

// ═══════════════════════════
//  GAME STATE
// ═══════════════════════════
let canvas, ctx;
let state = 'title'; // title, stageSelect, howto, playing, paused, won, lost
let currentStageIndex = 0;
let currentStage = null;
let grid = [];         // ROWS x COLS: 0=empty, 1=blocked
let towerGrid = [];    // ROWS x COLS: null or Tower reference
let towers = [];
let enemies = [];
let projectiles = [];
let particles = [];
let lineEffects = [];
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

// Skill state
let skillCooldowns = [0, 0, 0]; // Current cooldown remaining
let skillActiveTimers = [0, 0, 0]; // Active effect duration
let stunTimer = 0; // Global stun for enemies
let inspireTimer = 0; // Global inspire for towers

// Stage progress (from localStorage)
let stageProgress = null; // { unlocked: [true, false,...], stars: [0,0,...], scores: [0,0,...] }

// Sound state
let soundEnabled = false;
let audioCtx = null;
let bgmInterval = null;

// Ranking state
const REPO_OWNER = 'Shunichi-Takeda';
const REPO_NAME = 'stock-inc-games';
const GAME_LABEL = 'broccoli-td';
let rankingCache = null;
let rankingCacheTime = 0;
const RANKING_CACHE_TTL = 60000; // 60秒
let lastResultScore = 0;
let lastResultStars = 0;
let lastResultWon = false;

// ═══════════════════════════
//  STAGE PROGRESS PERSISTENCE
// ═══════════════════════════
function loadStageProgress() {
  const raw = localStorage.getItem('broccoli-td-progress');
  if (raw) {
    stageProgress = JSON.parse(raw);
    // Ensure arrays are correct length
    while (stageProgress.unlocked.length < STAGES.length) {
      stageProgress.unlocked.push(false);
      stageProgress.stars.push(0);
      stageProgress.scores.push(0);
    }
  } else {
    stageProgress = {
      unlocked: STAGES.map((_, i) => i === 0),
      stars: STAGES.map(() => 0),
      scores: STAGES.map(() => 0)
    };
  }
}

function saveStageProgress() {
  localStorage.setItem('broccoli-td-progress', JSON.stringify(stageProgress));
}

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

function getPathFromEntrance(entranceIndex) {
  const ent = currentStage.entrances[entranceIndex] || currentStage.entrances[0];
  const ext = currentStage.exit;
  return findPath(ent.col, ent.row, ext.col, ext.row);
}

function getMainPath() {
  return getPathFromEntrance(0);
}

// ═══════════════════════════
//  LINE EFFECT CLASS
// ═══════════════════════════
class LineEffect {
  constructor(x1, y1, x2, y2, color, duration, width) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.duration = duration || 0.15;
    this.life = this.duration;
    this.width = width || 2;
    this.dead = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  render(ctx) {
    const alpha = this.life / this.duration;
    ctx.save();
    ctx.globalAlpha = alpha * 0.7;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width * alpha;
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    ctx.restore();
  }
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
    this.splashRadius = def.splashRadius || 0;
    this.auraDamage = def.auraDamage || 0;
    this.buffRange = def.buffRange || 0;
    this.buffMultiplier = def.buffMultiplier || 0;
    this.projColor = def.projectileColor;
    this.projSpeed = def.projectileSpeed;
    this.level = 1;
    this.cooldown = 0;
    this.totalSpent = def.cost;
    this.target = null;
    // Attack effect state
    this.flashTimer = 0;
    this.recoilTimer = 0;
    // Aura timer (for garlic)
    this.auraTimer = 0;
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
    if (info.damage !== undefined) this.damage = info.damage;
    if (info.range !== undefined) this.range = info.range;
    if (info.fireRate !== undefined) this.fireRate = info.fireRate;
    if (info.slow !== undefined) this.slow = info.slow;
    if (info.splashRadius !== undefined) this.splashRadius = info.splashRadius;
    if (info.auraDamage !== undefined) this.auraDamage = info.auraDamage;
    if (info.buffRange !== undefined) this.buffRange = info.buffRange;
    if (info.buffMultiplier !== undefined) this.buffMultiplier = info.buffMultiplier;
    return true;
  }

  getEffectiveDamage() {
    let dmg = this.damage;
    // Check for eggplant buff
    for (const t of towers) {
      if (t === this) continue;
      if (t.type !== 'eggplant') continue;
      const dx = t.x - this.x;
      const dy = t.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= t.buffRange * CELL) {
        dmg = Math.floor(dmg * (1 + t.buffMultiplier));
        break; // Only one buff stacks
      }
    }
    return dmg;
  }

  update(dt) {
    // Flash/recoil timers
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.recoilTimer > 0) this.recoilTimer -= dt;

    // Garlic aura: apply damage every second
    if (this.auraDamage > 0) {
      this.auraTimer += dt;
      if (this.auraTimer >= 1.0) {
        this.auraTimer -= 1.0;
        let hit = false;
        for (const e of enemies) {
          if (e.dead) continue;
          const dx = e.x - this.x;
          const dy = e.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= this.rangePixels) {
            e.takeDamage(this.auraDamage);
            hit = true;
            // Small particle
            particles.push(new Particle(e.x, e.y, '#d4d4d8'));
          }
        }
        if (hit) {
          this.flashTimer = 0.15;
        }
      }
      return; // Garlic doesn't shoot projectiles
    }

    // Eggplant doesn't shoot
    if (this.type === 'eggplant') return;

    this.cooldown -= dt;
    if (this.cooldown > 0) return;

    // Effective fire rate (with inspire buff)
    const effectiveFireRate = this.fireRate * (inspireTimer > 0 ? 2 : 1);

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
      this.cooldown = 1 / effectiveFireRate;

      const dmg = this.getEffectiveDamage();

      // Fire projectile
      projectiles.push(new Projectile(
        this.x, this.y, best,
        dmg, this.projColor, this.projSpeed,
        this.slow, this.slowDuration,
        this.splashRadius
      ));

      // Attack effects
      this.flashTimer = 0.12;
      this.recoilTimer = 0.15;
      playSE('attack');

      // Line effect (carrot = laser-like, others = brief line)
      if (this.type === 'carrot') {
        lineEffects.push(new LineEffect(this.x, this.y, best.x, best.y, '#f97316', 0.25, 3));
      } else {
        lineEffects.push(new LineEffect(this.x, this.y, best.x, best.y, this.projColor, 0.1, 1));
      }
    }
  }
}

// ═══════════════════════════
//  PROJECTILE CLASS
// ═══════════════════════════
class Projectile {
  constructor(x, y, target, damage, color, speed, slow, slowDur, splashRadius) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.color = color;
    this.speed = speed * CELL;
    this.slow = slow;
    this.slowDur = slowDur;
    this.splashRadius = splashRadius || 0;
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

      // Splash damage (corn)
      if (this.splashRadius > 0) {
        const splashPx = this.splashRadius * CELL;
        for (const e of enemies) {
          if (e === this.target || e.dead) continue;
          const ex = e.x - this.target.x;
          const ey = e.y - this.target.y;
          const eDist = Math.sqrt(ex * ex + ey * ey);
          if (eDist <= splashPx) {
            e.takeDamage(Math.floor(this.damage * 0.6));
            particles.push(new Particle(e.x, e.y, this.color));
          }
        }
        // Splash explosion particles
        for (let i = 0; i < 8; i++) {
          particles.push(new Particle(this.target.x, this.target.y, this.color));
        }
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
    // Special properties
    this.flying = def.flying || false;
    this.slowImmune = def.slowImmune || false;
    this.healAura = def.healAura || 0;
    this.healAuraTimer = 0;
    this.summonInterval = def.summonInterval || 0;
    this.summonTimer = 0;
    // Hedgehog curl
    this.curlSpecial = def.special === 'curl';
    this.curled = false;
    this.curlTimer = 0;
    // Flying path (straight line from entrance to exit)
    this.flyStartX = 0;
    this.flyStartY = 0;
    this.flyEndX = 0;
    this.flyEndY = 0;
    this.flyProgress = 0;
    // Entrance index for respawning
    this.entranceIndex = 0;
  }

  init(path, entranceIndex) {
    this.entranceIndex = entranceIndex || 0;
    if (this.flying) {
      // Flying: straight line from entrance to exit
      const ent = currentStage.entrances[this.entranceIndex] || currentStage.entrances[0];
      const ext = currentStage.exit;
      this.flyStartX = (ent.col + 0.5) * CELL;
      this.flyStartY = (ent.row + 0.5) * CELL;
      this.flyEndX = (ext.col + 0.5) * CELL;
      this.flyEndY = (ext.row + 0.5) * CELL;
      this.x = this.flyStartX;
      this.y = this.flyStartY;
      this.flyProgress = 0;
      this.path = path; // Keep for compatibility
      this.pathProgress = 0;
    } else {
      this.path = path;
      this.pathIndex = 0;
      this.x = (path[0].col + 0.5) * CELL;
      this.y = (path[0].row + 0.5) * CELL;
    }
  }

  takeDamage(amount) {
    // Hedgehog curl: half damage when curled
    if (this.curled) {
      amount = Math.floor(amount * 0.5);
    }
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.fadeTimer = 0.5;
      coins += this.reward;
      totalKills++;
      playSE('kill');
    }
  }

  applySlow(factor, duration) {
    if (this.slowImmune) return;
    this.speed = this.baseSpeed * factor;
    this.slowTimer = duration;
  }

  recalcPath() {
    if (this.flying || !this.path || this.dead) return;
    const curCol = Math.floor(this.x / CELL);
    const curRow = Math.floor(this.y / CELL);
    const ext = currentStage.exit;
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

    // Stun check (from skill)
    if (stunTimer > 0) return;

    // Slow timer
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.speed = this.baseSpeed;
      }
    }

    // Hedgehog curl check
    if (this.curlSpecial && !this.curled && this.hp <= this.maxHp * 0.5) {
      this.curled = true;
      this.curlTimer = 3.0;
    }
    if (this.curled) {
      this.curlTimer -= dt;
      if (this.curlTimer <= 0) {
        this.curled = false;
      }
    }

    // Bear heal aura
    if (this.healAura > 0) {
      this.healAuraTimer += dt;
      if (this.healAuraTimer >= 1.0) {
        this.healAuraTimer -= 1.0;
        const healRange = 2 * CELL;
        for (const e of enemies) {
          if (e === this || e.dead) continue;
          const dx = e.x - this.x;
          const dy = e.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= healRange) {
            e.hp = Math.min(e.maxHp, e.hp + this.healAura);
            particles.push(new Particle(e.x, e.y - 10, '#4ade80'));
          }
        }
      }
    }

    // Wolf summon
    if (this.summonInterval > 0) {
      this.summonTimer += dt;
      if (this.summonTimer >= this.summonInterval) {
        this.summonTimer = 0;
        // Summon 2 rabbits
        for (let i = 0; i < 2; i++) {
          const path = getPathFromEntrance(this.entranceIndex);
          if (path) {
            const e = new Enemy('rabbit');
            e.init(path, this.entranceIndex);
            // Place near wolf
            e.x = this.x + (Math.random() - 0.5) * CELL;
            e.y = this.y + (Math.random() - 0.5) * CELL;
            enemies.push(e);
          }
        }
        // Summon effect
        for (let i = 0; i < 6; i++) {
          particles.push(new Particle(this.x, this.y, '#fbbf24'));
        }
      }
    }

    // Movement
    if (this.flying) {
      this.updateFlying(dt);
    } else {
      this.updateGround(dt);
    }
  }

  updateFlying(dt) {
    const totalDist = Math.sqrt(
      (this.flyEndX - this.flyStartX) ** 2 +
      (this.flyEndY - this.flyStartY) ** 2
    );

    // Check ice zone speed boost
    let moveSpeed = this.speed;
    if (currentStage.iceZones) {
      const cellCol = Math.floor(this.x / CELL);
      const cellRow = Math.floor(this.y / CELL);
      for (const iz of currentStage.iceZones) {
        if (iz.col === cellCol && iz.row === cellRow) {
          moveSpeed *= 1.5;
          break;
        }
      }
    }

    const movePerFrame = (moveSpeed * CELL * dt) / totalDist;
    this.flyProgress += movePerFrame;
    this.pathProgress = this.flyProgress;

    if (this.flyProgress >= 1) {
      this.reached = true;
      this.dead = true;
      lives--;
      return;
    }

    this.x = this.flyStartX + (this.flyEndX - this.flyStartX) * this.flyProgress;
    this.y = this.flyStartY + (this.flyEndY - this.flyStartY) * this.flyProgress;
  }

  updateGround(dt) {
    if (!this.path || this.pathIndex >= this.path.length - 1) {
      // Reached the exit
      this.reached = true;
      this.dead = true;
      lives--;
      return;
    }

    // Check ice zone speed boost
    let moveSpeed = this.speed;
    if (currentStage.iceZones) {
      const cellCol = Math.floor(this.x / CELL);
      const cellRow = Math.floor(this.y / CELL);
      for (const iz of currentStage.iceZones) {
        if (iz.col === cellCol && iz.row === cellRow) {
          moveSpeed *= 1.5;
          break;
        }
      }
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
      const move = moveSpeed * CELL * dt;
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

    // Dark circle background so emoji pops against green grass
    if (!this.dead) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, CELL * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + CELL * 0.32, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flying indicator
    if (this.flying && !this.dead) {
      const bobY = Math.sin(Date.now() / 200) * 3;
      ctx.font = `${CELL * 0.72}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, this.x, this.y - 4 + bobY);
    } else {
      // Emoji — large
      ctx.font = `${CELL * 0.72}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, this.x, this.y);
    }

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

    // Curl indicator (hedgehog)
    if (this.curled && !this.dead) {
      ctx.font = '10px sans-serif';
      ctx.fillText('🛡️', this.x - CELL * 0.25, this.y - CELL * 0.3);
    }

    // Heal aura indicator (bear)
    if (this.healAura > 0 && !this.dead) {
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2 * CELL, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Wolf boss indicator
    if (this.type === 'wolf' && !this.dead) {
      const glow = 0.5 + Math.sin(Date.now() / 300) * 0.3;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10 * glow;
      ctx.font = '8px sans-serif';
      ctx.fillText('👑', this.x, this.y - CELL * 0.45);
      ctx.shadowBlur = 0;
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
    this.entranceIndex = group.entrance || 0;
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
      const path = getPathFromEntrance(this.entranceIndex);
      if (path) {
        const enemy = new Enemy(this.type);
        enemy.init(path, this.entranceIndex);
        enemies.push(enemy);
      } else if (ENEMY_DEFS[this.type].flying) {
        // Flying enemies don't need path
        const enemy = new Enemy(this.type);
        const dummyPath = [
          currentStage.entrances[this.entranceIndex] || currentStage.entrances[0],
          currentStage.exit
        ];
        enemy.init(dummyPath, this.entranceIndex);
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
  currentStage = STAGES[currentStageIndex];

  // Reset state
  grid = [];
  towerGrid = [];
  towers = [];
  enemies = [];
  projectiles = [];
  particles = [];
  lineEffects = [];
  coins = currentStage.startCoins;
  lives = currentStage.lives;
  currentWave = 0;
  totalWaves = currentStage.waves.length;
  waveActive = false;
  waveSpawners = [];
  gameSpeed = 1;
  totalKills = 0;
  placingTowerType = null;
  hoverCell = null;
  selectedTower = null;
  skillCooldowns = [0, 0, 0];
  skillActiveTimers = [0, 0, 0];
  stunTimer = 0;
  inspireTimer = 0;

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
  for (const b of currentStage.blocked) {
    grid[b.row][b.col] = BLOCKED;
  }

  updateUI();
  updateSkillUI();
}

// ═══════════════════════════
//  TOWER PLACEMENT
// ═══════════════════════════
function canPlaceTower(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  if (grid[row][col] !== EMPTY) return false;
  if (towerGrid[row][col] !== null) return false;

  // Can't place on entrance or exit
  for (const ent of currentStage.entrances) {
    if (ent.col === col && ent.row === row) return false;
  }
  if (currentStage.exit.col === col && currentStage.exit.row === row) return false;

  // Can't place on current enemy path
  for (let i = 0; i < currentStage.entrances.length; i++) {
    const path = getPathFromEntrance(i);
    if (!path) continue;
    for (const p of path) {
      if (p.col === col && p.row === row) return false;
    }
  }

  // Can't place on tile where a ground enemy currently stands
  for (const e of enemies) {
    if (e.dead || e.flying) continue;
    const ec = Math.floor(e.x / CELL);
    const er = Math.floor(e.y / CELL);
    if (ec === col && er === row) return false;
  }

  return true;
}

function placeTower(type, col, row) {
  const def = TOWER_DEFS[type];
  if (coins < def.cost) return false;
  if (!canPlaceTower(col, row)) return false;

  coins -= def.cost;
  const tower = new Tower(type, col, row);
  towers.push(tower);
  towerGrid[row][col] = tower;

  // Recalculate paths for existing ground enemies
  for (const e of enemies) {
    if (!e.dead && !e.flying) e.recalcPath();
  }

  // Particles
  for (let i = 0; i < 6; i++) {
    particles.push(new Particle(tower.x, tower.y, '#22c55e'));
  }

  playSE('place');
  updateUI();
  return true;
}

function sellTower(tower) {
  const refund = tower.sellValue;
  coins += refund;
  towerGrid[tower.row][tower.col] = null;
  towers = towers.filter(t => t !== tower);

  // Recalculate paths for existing ground enemies
  for (const e of enemies) {
    if (!e.dead && !e.flying) e.recalcPath();
  }

  selectedTower = null;
  hideTowerPopup();
  updateUI();
}

// ═══════════════════════════
//  SKILL SYSTEM
// ═══════════════════════════
function activateSkill(index) {
  if (state !== 'playing') return;
  if (skillCooldowns[index] > 0) return;

  const skill = SKILL_DEFS[index];
  skillCooldowns[index] = skill.cooldown;

  playSE('skill');

  switch (skill.id) {
    case 'gust':
      // Stun all enemies for 2 seconds
      stunTimer = 2.0;
      // Visual effect
      for (const e of enemies) {
        if (!e.dead) {
          for (let i = 0; i < 3; i++) {
            particles.push(new Particle(e.x, e.y, '#94a3b8'));
          }
        }
      }
      break;
    case 'inspire':
      // All towers fire 2x speed for 10 seconds
      inspireTimer = 10.0;
      // Visual effect
      for (const t of towers) {
        for (let i = 0; i < 4; i++) {
          particles.push(new Particle(t.x, t.y, '#fbbf24'));
        }
      }
      break;
    case 'rain':
      // 50 damage to all enemies
      for (const e of enemies) {
        if (!e.dead) {
          e.takeDamage(50);
          for (let i = 0; i < 5; i++) {
            particles.push(new Particle(e.x, e.y - 20, '#60a5fa'));
          }
        }
      }
      break;
  }

  updateSkillUI();
}

function updateSkillUI() {
  for (let i = 0; i < SKILL_DEFS.length; i++) {
    const btn = document.getElementById(`skill${i}`);
    if (!btn) continue;
    const cd = skillCooldowns[i];
    const overlay = btn.querySelector('.skill-cd-overlay');
    const cdText = btn.querySelector('.skill-cd-text');
    if (cd > 0) {
      btn.classList.add('on-cooldown');
      if (overlay) {
        const pct = cd / SKILL_DEFS[i].cooldown;
        overlay.style.height = (pct * 100) + '%';
      }
      if (cdText) cdText.textContent = Math.ceil(cd) + 's';
    } else {
      btn.classList.remove('on-cooldown');
      if (overlay) overlay.style.height = '0%';
      if (cdText) cdText.textContent = '';
    }
  }
}

// ═══════════════════════════
//  WAVE MANAGEMENT
// ═══════════════════════════
function startNextWave() {
  if (waveActive || currentWave >= totalWaves) return;
  currentWave++;
  waveActive = true;
  const waveData = currentStage.waves[currentWave - 1];
  waveSpawners = waveData.groups.map(g => new WaveSpawner(g));
  playSE('waveStart');
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
  // Update skill cooldowns
  for (let i = 0; i < skillCooldowns.length; i++) {
    if (skillCooldowns[i] > 0) {
      skillCooldowns[i] -= dt;
      if (skillCooldowns[i] < 0) skillCooldowns[i] = 0;
    }
  }
  updateSkillUI();

  // Update global timers
  if (stunTimer > 0) stunTimer -= dt;
  if (inspireTimer > 0) inspireTimer -= dt;

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

  // Update line effects
  for (const l of lineEffects) {
    l.update(dt);
  }

  // Cleanup
  enemies = enemies.filter(e => !e.dead || e.fadeTimer > 0);
  projectiles = projectiles.filter(p => !p.dead);
  particles = particles.filter(p => !p.dead);
  lineEffects = lineEffects.filter(l => !l.dead);

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
  renderLineEffects();
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

      // Ice zones (stage 4)
      if (currentStage.iceZones) {
        for (const iz of currentStage.iceZones) {
          if (iz.col === c && iz.row === r) {
            ctx.fillStyle = isLight ? 'rgba(147, 197, 253, 0.3)' : 'rgba(147, 197, 253, 0.25)';
            ctx.fillRect(x, y, CELL, CELL);
            // Small snowflake indicator
            ctx.font = `${CELL * 0.2}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.4;
            ctx.fillText('❄', x + CELL * 0.85, y + CELL * 0.15);
            ctx.globalAlpha = 1;
          }
        }
      }

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
  for (const ent of currentStage.entrances) {
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
  const ex = currentStage.exit.col * CELL;
  const ey = currentStage.exit.row * CELL;
  const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4;

  // Dark purple background (high contrast with gold crown + green broccoli)
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(ex, ey, CELL, CELL);
  ctx.fillStyle = '#2d1b4e';
  ctx.fillRect(ex + 3, ey + 3, CELL - 6, CELL - 6);

  // Thick bright golden border (pulsing)
  ctx.strokeStyle = `rgba(251, 191, 36, ${0.85 + pulse * 0.15})`;
  ctx.lineWidth = 4;
  ctx.strokeRect(ex + 1, ey + 1, CELL - 2, CELL - 2);
  ctx.lineWidth = 1;

  // Corner sparkles
  const sp = 6;
  ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + pulse * 0.5})`;
  ctx.fillRect(ex + 2, ey + 2, sp, sp);
  ctx.fillRect(ex + CELL - sp - 2, ey + 2, sp, sp);
  ctx.fillRect(ex + 2, ey + CELL - sp - 2, sp, sp);
  ctx.fillRect(ex + CELL - sp - 2, ey + CELL - sp - 2, sp, sp);

  // King emoji — VERY BIG with bright glow
  ctx.save();
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 15 + 10 * pulse;
  ctx.font = `${CELL * 0.55}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👑', ex + CELL / 2, ey + CELL * 0.28);
  ctx.shadowColor = '#4ade80';
  ctx.shadowBlur = 12 * pulse;
  ctx.font = `${CELL * 0.65}px sans-serif`;
  ctx.fillText('🥦', ex + CELL / 2, ey + CELL * 0.7);
  ctx.restore();
}

function renderPath() {
  // Show clear dirt path from all entrances to exit
  for (let i = 0; i < currentStage.entrances.length; i++) {
    const path = getPathFromEntrance(i);
    if (!path) continue;

    // Dirt/sand colored path tiles
    for (const p of path) {
      const px = p.col * CELL;
      const py = p.row * CELL;

      // Brown dirt background
      ctx.fillStyle = 'rgba(139, 90, 43, 0.18)';
      ctx.fillRect(px, py, CELL, CELL);

      // Subtle inner highlight
      ctx.fillStyle = 'rgba(194, 148, 80, 0.08)';
      ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
    }

    // Draw path direction dots (connect centers)
    if (path.length > 1) {
      ctx.strokeStyle = 'rgba(194, 148, 80, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo((path[0].col + 0.5) * CELL, (path[0].row + 0.5) * CELL);
      for (let j = 1; j < path.length; j++) {
        ctx.lineTo((path[j].col + 0.5) * CELL, (path[j].row + 0.5) * CELL);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
    }
  }
}

function renderTowers() {
  // Color map for tower types
  const towerBgColors = {
    broccoli: '#2a3a22',
    tomato: '#4a2828',
    carrot: '#3a2a18',
    corn: '#3a3520',
    garlic: '#2a2a2a',
    eggplant: '#2a1a3a'
  };
  const towerBorderColors = {
    broccoli: '#22c55e',
    tomato: '#ef4444',
    carrot: '#f97316',
    corn: '#eab308',
    garlic: '#d4d4d8',
    eggplant: '#8b5cf6'
  };

  for (const t of towers) {
    const x = t.col * CELL;
    const y = t.row * CELL;

    // Tower background tile
    ctx.fillStyle = '#3a3520';
    ctx.fillRect(x, y, CELL, CELL);
    ctx.fillStyle = towerBgColors[t.type] || '#2a3a22';
    ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);

    // Bold border
    const borderColor = towerBorderColors[t.type] || '#22c55e';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
    ctx.lineWidth = 1;

    // Attack flash effect (white glow)
    if (t.flashTimer > 0) {
      const flashAlpha = t.flashTimer / 0.12 * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
    }

    // Level indicator
    if (t.level > 1) {
      ctx.fillStyle = t.level === 3 ? '#fbbf24' : '#a3e635';
      ctx.beginPath();
      ctx.arc(x + CELL - 8, y + 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.level, x + CELL - 8, y + 8);
    }

    // Emoji — with recoil animation
    let size = t.level === 3 ? CELL * 0.85 : CELL * 0.78;
    if (t.recoilTimer > 0) {
      const recoilScale = 1 + (t.recoilTimer / 0.15) * 0.15;
      size *= recoilScale;
    }
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.emoji, t.x, t.y + 2);

    // Garlic aura range indicator
    if (t.auraDamage > 0) {
      const auraPulse = 0.15 + Math.sin(Date.now() / 800) * 0.08;
      ctx.strokeStyle = `rgba(212, 212, 216, ${auraPulse})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.rangePixels, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Eggplant buff range indicator
    if (t.type === 'eggplant') {
      const buffPulse = 0.15 + Math.sin(Date.now() / 600) * 0.08;
      ctx.strokeStyle = `rgba(139, 92, 246, ${buffPulse})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.buffRange * CELL, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Show buff indicator on nearby towers
      for (const other of towers) {
        if (other === t) continue;
        const dx = other.x - t.x;
        const dy = other.y - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= t.buffRange * CELL) {
          ctx.font = '10px sans-serif';
          ctx.fillText('⬆', other.x + CELL * 0.3, other.y - CELL * 0.3);
        }
      }
    }
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

function renderLineEffects() {
  for (const l of lineEffects) {
    l.render(ctx);
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
        for (const ent of currentStage.entrances) {
          if (ent.col === c && ent.row === r) isSpecial = true;
        }
        if (currentStage.exit.col === c && currentStage.exit.row === r) isSpecial = true;
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
    if (!def) continue;
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
  const def = TOWER_DEFS[tower.type];

  const upInfo = tower.upgradeInfo;
  let html = `<div class="popup-title">${tower.emoji} ${tower.name} Lv.${tower.level}</div>`;
  html += `<div class="popup-desc">${def.desc}</div>`;

  if (tower.auraDamage > 0) {
    html += `オーラ: ${tower.auraDamage}/秒 | 射程: ${tower.range.toFixed(1)}<br>`;
  } else if (tower.type === 'eggplant') {
    html += `バフ: +${Math.floor(tower.buffMultiplier * 100)}% | 範囲: ${tower.buffRange.toFixed(1)}<br>`;
  } else {
    html += `ATK: ${tower.getEffectiveDamage()} | 射程: ${tower.range.toFixed(1)}<br>`;
  }

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
  lastResultWon = won;

  const title = document.getElementById('resultTitle');
  const stars = document.getElementById('resultStars');
  const stats = document.getElementById('resultStats');

  let starsCount = 0;
  if (won) {
    title.textContent = '🎉 ステージクリア！';
    title.style.color = '#4ade80';
    starsCount = lives >= currentStage.lives ? 3 : lives >= currentStage.lives / 2 ? 2 : 1;
    stars.textContent = '⭐'.repeat(starsCount) + '☆'.repeat(3 - starsCount);
    playSE('clear');
  } else {
    title.textContent = '😢 ゲームオーバー';
    title.style.color = '#f87171';
    stars.textContent = '';
    playSE('gameover');
  }

  const score = (lives * 500) + (totalKills * 10) + (coins * 2);
  lastResultScore = score;
  lastResultStars = starsCount;
  stats.innerHTML = `
    ステージ: ${currentStage.name}<br>
    撃破数: ${totalKills}<br>
    残りライフ: ${lives} / ${currentStage.lives}<br>
    残りコイン: ${coins}<br>
    スコア: ${score.toLocaleString()}
  `;

  // Save progress
  if (won) {
    if (starsCount > stageProgress.stars[currentStageIndex]) {
      stageProgress.stars[currentStageIndex] = starsCount;
    }
    if (score > stageProgress.scores[currentStageIndex]) {
      stageProgress.scores[currentStageIndex] = score;
      stats.innerHTML += `<br><span style="color:#fbbf24">🏆 ハイスコア更新！</span>`;
    }
    // Unlock next stage
    if (currentStageIndex + 1 < STAGES.length) {
      stageProgress.unlocked[currentStageIndex + 1] = true;
    }
    saveStageProgress();
  } else {
    // Still save best score even on loss
    if (score > stageProgress.scores[currentStageIndex]) {
      stageProgress.scores[currentStageIndex] = score;
      saveStageProgress();
    }
  }

  // Show/hide score registration button (only on win)
  const regBtn = document.getElementById('btnRegisterScore');
  if (regBtn) {
    regBtn.style.display = won ? '' : 'none';
    regBtn.textContent = '🏆 ランキング登録';
    regBtn.classList.remove('registered');
    regBtn.disabled = false;
  }

  stopBGM();
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = '';
}

// ═══════════════════════════
//  STAGE SELECT
// ═══════════════════════════
function showStageSelect() {
  loadStageProgress();
  const container = document.getElementById('stageSelectGrid');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < STAGES.length; i++) {
    const s = STAGES[i];
    const unlocked = stageProgress.unlocked[i];
    const starsEarned = stageProgress.stars[i];
    const bestScore = stageProgress.scores[i];

    const card = document.createElement('button');
    card.className = 'stage-card' + (unlocked ? '' : ' locked');
    card.disabled = !unlocked;

    let starsHtml = '';
    for (let j = 0; j < 3; j++) {
      starsHtml += j < starsEarned ? '⭐' : '☆';
    }

    card.innerHTML = `
      <div class="stage-number">Stage ${i + 1}</div>
      <div class="stage-name">${s.name}</div>
      <div class="stage-stars">${starsHtml}</div>
      ${bestScore > 0 ? `<div class="stage-score">🏆 ${bestScore.toLocaleString()}</div>` : ''}
      ${!unlocked ? '<div class="stage-lock">🔒</div>' : ''}
    `;

    if (unlocked) {
      card.addEventListener('click', () => {
        currentStageIndex = i;
        startGame();
      });
    }

    container.appendChild(card);
  }

  showScreen('stageSelectScreen');
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
  const screens = ['titleScreen', 'stageSelectScreen', 'howToScreen', 'gameScreen', 'resultScreen'];
  for (const s of screens) {
    const el = document.getElementById(s);
    if (el) el.style.display = s === name ? '' : 'none';
  }
  document.getElementById('pauseOverlay').style.display = 'none';
}

function startGame() {
  state = 'playing';
  initGame();
  showScreen('gameScreen');
  document.getElementById('btnNextWave').disabled = false;
  lastTime = 0;
  startBGM();
}

// ═══════════════════════════
//  TOOLTIP SYSTEM
// ═══════════════════════════
function setupTooltips() {
  for (const btn of document.querySelectorAll('.tower-btn')) {
    const type = btn.dataset.tower;
    const def = TOWER_DEFS[type];
    if (!def) continue;

    const tooltip = document.createElement('div');
    tooltip.className = 'tower-tooltip';
    let tooltipContent = `<strong>${def.emoji} ${def.name}</strong><br>`;
    tooltipContent += `<span class="tooltip-desc">${def.desc}</span><br>`;
    tooltipContent += `コスト: ${def.cost}🪙`;
    if (def.damage > 0) tooltipContent += ` | ATK: ${def.damage}`;
    if (def.auraDamage) tooltipContent += ` | オーラ: ${def.auraDamage}/秒`;
    if (def.buffMultiplier) tooltipContent += ` | バフ: +${Math.floor(def.buffMultiplier * 100)}%`;
    tooltipContent += ` | 射程: ${def.range}`;
    tooltip.innerHTML = tooltipContent;

    btn.style.position = 'relative';
    btn.appendChild(tooltip);
  }
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

  // Load progress
  loadStageProgress();

  // ── Event Listeners ──

  // Title — go to stage select
  document.getElementById('btnStart').addEventListener('click', () => {
    showStageSelect();
  });
  document.getElementById('btnHowTo').addEventListener('click', () => {
    showScreen('howToScreen');
  });
  document.getElementById('btnBackTitle').addEventListener('click', () => {
    showScreen('titleScreen');
  });

  // Stage select back
  const btnBackFromStages = document.getElementById('btnBackFromStages');
  if (btnBackFromStages) {
    btnBackFromStages.addEventListener('click', () => {
      showScreen('titleScreen');
    });
  }

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
    stopBGM();
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

  // Skill buttons
  for (let i = 0; i < SKILL_DEFS.length; i++) {
    const btn = document.getElementById(`skill${i}`);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        activateSkill(i);
      });
    }
  }

  // Result
  document.getElementById('btnRetry').addEventListener('click', startGame);
  document.getElementById('btnToTitle').addEventListener('click', () => {
    state = 'title';
    stopBGM();
    showScreen('titleScreen');
  });
  const btnToStages = document.getElementById('btnToStages');
  if (btnToStages) {
    btnToStages.addEventListener('click', () => {
      showStageSelect();
    });
  }

  // Sound toggle
  document.getElementById('btnSound').addEventListener('click', function () {
    initAudioContext();
    soundEnabled = !soundEnabled;
    this.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled && state === 'playing') {
      startBGM();
    } else {
      stopBGM();
    }
  });

  // Ranking buttons
  document.getElementById('btnRankingTitle').addEventListener('click', () => showRankingModal());
  document.getElementById('btnRankingResult').addEventListener('click', () => showRankingModal());
  document.getElementById('btnCloseRanking').addEventListener('click', () => {
    document.getElementById('rankingModal').style.display = 'none';
  });

  // Score registration
  document.getElementById('btnRegisterScore').addEventListener('click', () => {
    showNameModal();
  });
  document.getElementById('btnSubmitScore').addEventListener('click', () => {
    submitScore();
  });
  document.getElementById('btnCancelName').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'none';
  });

  // Click outside game area to deselect
  document.addEventListener('click', (e) => {
    if (e.target.closest('#canvasWrapper') ||
        e.target.closest('#towerPalette') ||
        e.target.closest('#statusBar') ||
        e.target.closest('#towerPopup') ||
        e.target.closest('#skillBar')) {
      return;
    }
    hideTowerPopup();
    placingTowerType = null;
    updateUI();
  });

  // Setup tooltips
  setupTooltips();

  // Start game loop
  requestAnimationFrame(gameLoop);
}

// ═══════════════════════════
//  SOUND SYSTEM (Web Audio API)
// ═══════════════════════════
function initAudioContext() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (_) {
    // Web Audio API not supported
  }
}

function playTone(freq, duration, type, volume, delay) {
  if (!soundEnabled || !audioCtx) return;
  const t = audioCtx.currentTime + (delay || 0);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || 'square';
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume || 0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function playSE(name) {
  if (!soundEnabled || !audioCtx) return;
  switch (name) {
    case 'place':
      playTone(523, 0.08, 'square', 0.06);
      playTone(659, 0.08, 'square', 0.06, 0.06);
      break;
    case 'attack':
      playTone(880 + Math.random() * 200, 0.04, 'sawtooth', 0.03);
      break;
    case 'kill':
      playTone(1047, 0.06, 'square', 0.05);
      playTone(1319, 0.06, 'square', 0.05, 0.05);
      playTone(1568, 0.1, 'square', 0.04, 0.1);
      break;
    case 'waveStart':
      playTone(392, 0.1, 'square', 0.07);
      playTone(523, 0.1, 'square', 0.07, 0.1);
      playTone(659, 0.15, 'square', 0.06, 0.2);
      break;
    case 'skill':
      playTone(784, 0.08, 'sine', 0.08);
      playTone(1047, 0.08, 'sine', 0.08, 0.08);
      playTone(1319, 0.12, 'sine', 0.07, 0.16);
      playTone(1568, 0.15, 'sine', 0.06, 0.24);
      break;
    case 'gameover':
      playTone(392, 0.2, 'sawtooth', 0.08);
      playTone(330, 0.2, 'sawtooth', 0.07, 0.2);
      playTone(262, 0.3, 'sawtooth', 0.06, 0.4);
      playTone(196, 0.5, 'sawtooth', 0.05, 0.6);
      break;
    case 'clear':
      playTone(523, 0.1, 'square', 0.07);
      playTone(659, 0.1, 'square', 0.07, 0.1);
      playTone(784, 0.1, 'square', 0.07, 0.2);
      playTone(1047, 0.2, 'square', 0.08, 0.3);
      playTone(1319, 0.3, 'sine', 0.06, 0.45);
      break;
  }
}

// BGM — simple loop melody
const BGM_NOTES = [
  { f: 392, d: 0.25 }, // G4
  { f: 440, d: 0.25 }, // A4
  { f: 523, d: 0.25 }, // C5
  { f: 440, d: 0.25 }, // A4
  { f: 392, d: 0.25 }, // G4
  { f: 330, d: 0.25 }, // E4
  { f: 392, d: 0.25 }, // G4
  { f: 330, d: 0.5 },  // E4
  { f: 440, d: 0.25 }, // A4
  { f: 523, d: 0.25 }, // C5
  { f: 587, d: 0.25 }, // D5
  { f: 523, d: 0.25 }, // C5
  { f: 440, d: 0.25 }, // A4
  { f: 392, d: 0.25 }, // G4
  { f: 330, d: 0.25 }, // E4
  { f: 392, d: 0.5 },  // G4
];

let bgmNoteIndex = 0;
let bgmNextTime = 0;

function startBGM() {
  if (!soundEnabled || !audioCtx) return;
  stopBGM();
  bgmNoteIndex = 0;
  bgmNextTime = audioCtx.currentTime + 0.1;
  scheduleBGMNotes();
  bgmInterval = setInterval(scheduleBGMNotes, 200);
}

function scheduleBGMNotes() {
  if (!soundEnabled || !audioCtx) { stopBGM(); return; }
  const lookAhead = 0.5;
  while (bgmNextTime < audioCtx.currentTime + lookAhead) {
    const note = BGM_NOTES[bgmNoteIndex % BGM_NOTES.length];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.f, bgmNextTime);
    gain.gain.setValueAtTime(0.03, bgmNextTime);
    gain.gain.exponentialRampToValueAtTime(0.001, bgmNextTime + note.d * 0.9);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(bgmNextTime);
    osc.stop(bgmNextTime + note.d);
    bgmNextTime += note.d;
    bgmNoteIndex++;
  }
}

function stopBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}

// ═══════════════════════════
//  RANKING SYSTEM
// ═══════════════════════════
function generateScoreIssueURL(playerName, stageIndex, score, stars, kills) {
  const stageName = STAGES[stageIndex].name;
  // Empty name → use '-' in title; ranking display will replace with GitHub login
  const displayName = playerName || '-';
  const title = `🏆 ${score} pts | ${displayName} | ${stageName} | ⭐${stars}`;
  const body = [
    '<!-- 🥦 ブロッコリーTD スコア登録 -->',
    '<!-- ⚠️ タイトルを変更しないでください -->',
    '',
    '| 項目 | 値 |',
    '|---|---|',
    `| 名前 | ${displayName} |`,
    `| スコア | ${score.toLocaleString()} |`,
    `| ステージ | ${stageName} |`,
    `| 星 | ${'⭐'.repeat(stars)} |`,
    `| 撃破数 | ${kills} |`,
    `| 日時 | ${new Date().toLocaleString('ja-JP')} |`,
  ].join('\n');

  const params = new URLSearchParams({
    labels: `score,${GAME_LABEL}`,
    title: title,
    body: body,
  });

  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?${params.toString()}`;
}

function showNameModal() {
  const saved = localStorage.getItem('broccoli-td-playerName') || '';
  document.getElementById('playerNameInput').value = saved;
  document.getElementById('nameModal').style.display = '';
}

function submitScore() {
  const nameInput = document.getElementById('playerNameInput');
  const name = nameInput.value.trim();
  localStorage.setItem('broccoli-td-playerName', name);

  const url = generateScoreIssueURL(
    name, currentStageIndex, lastResultScore, lastResultStars, totalKills
  );
  window.open(url, '_blank');

  document.getElementById('nameModal').style.display = 'none';

  // Mark as registered
  const regBtn = document.getElementById('btnRegisterScore');
  if (regBtn) {
    regBtn.textContent = '✓ 登録済み';
    regBtn.classList.add('registered');
    regBtn.disabled = true;
  }
}

function showRankingModal() {
  document.getElementById('rankingModal').style.display = '';
  loadRanking();
}

function loadRanking() {
  const content = document.getElementById('rankingContent');

  // Check cache
  if (rankingCache && Date.now() - rankingCacheTime < RANKING_CACHE_TTL) {
    renderRanking(rankingCache);
    return;
  }

  content.innerHTML = '<div class="ranking-loading">読み込み中...</div>';

  // Filter by game-specific label for this game's rankings
  const apiURL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=${GAME_LABEL}&state=open&per_page=100&sort=created&direction=desc`;

  fetch(apiURL)
    .then(res => {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(issues => {
      const entries = [];
      for (const issue of issues) {
        const match = issue.title.match(/🏆\s*(\d+)\s*pts\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*⭐(\d+)/);
        if (!match) continue;
        entries.push({
          score: parseInt(match[1], 10),
          name: (() => {
            const parsed = match[2].trim();
            const githubLogin = issue.user ? issue.user.login : '';
            // Use GitHub account name if name is placeholder or empty
            if (parsed === '-' || parsed === '{{github}}' || parsed === '匿名' || !parsed) {
              return githubLogin || '匿名';
            }
            return parsed;
          })(),
          stage: match[3].trim(),
          stars: parseInt(match[4], 10),
          avatar: issue.user ? issue.user.avatar_url : '',
          login: issue.user ? issue.user.login : '',
        });
      }
      // Sort by score descending
      entries.sort((a, b) => b.score - a.score);
      rankingCache = entries;
      rankingCacheTime = Date.now();
      renderRanking(entries);
    })
    .catch(() => {
      content.innerHTML = '<div class="ranking-error">ランキングの取得に失敗しました。<br>しばらくしてからお試しください。</div>';
    });
}

function renderRanking(entries) {
  const content = document.getElementById('rankingContent');
  const top20 = entries.slice(0, 20);

  if (top20.length === 0) {
    content.innerHTML = '<div class="ranking-loading">まだスコアが登録されていません。<br>最初のランカーになろう！ 🏆</div>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  let html = '<ul class="ranking-list">';

  for (let i = 0; i < top20.length; i++) {
    const e = top20[i];
    const rankClass = i < 3 ? ` rank-${i + 1}` : '';
    const rankText = i < 3 ? medals[i] : `${i + 1}`;
    const avatarHtml = e.avatar
      ? `<img class="ranking-avatar" src="${e.avatar}&s=56" alt="" loading="lazy">`
      : '';

    html += `
      <li class="ranking-item${rankClass}">
        <span class="ranking-rank">${rankText}</span>
        ${avatarHtml}
        <div class="ranking-info">
          <div class="ranking-name">${escapeHtml(e.name)}</div>
          <div class="ranking-stage">${escapeHtml(e.stage)}</div>
        </div>
        <span class="ranking-score">${e.score.toLocaleString()} pts</span>
      </li>
    `;
  }

  html += '</ul>';

  // Your best scores
  const bestScores = stageProgress.scores.filter(s => s > 0);
  if (bestScores.length > 0) {
    const totalBest = Math.max(...bestScores);
    html += `
      <div class="ranking-your-best">
        <div class="ranking-your-best-title">📊 あなたのベスト</div>
        <div class="ranking-your-best-score">${totalBest.toLocaleString()} pts</div>
      </div>
    `;
  }

  content.innerHTML = html;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Go!
document.addEventListener('DOMContentLoaded', setup);

'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const TILE_SIZE = 32;
const MAP_W = 20;
const MAP_H = 15;
const TILE_FLOOR = 0;
const TILE_WALL = 1;
const TILE_DOOR = 2;
const TILE_NPC = 3;
const TILE_CHEST = 4;
const TILE_SHOP = 5;
const TILE_QUEST_NPC = 6;
const TILE_EVENT = 7;
const TILE_SAVE = 8;
const TILE_BOSS = 9;
const SAVE_KEY = 'dailyquest_save';
const ENCOUNTER_MIN = 15;
const ENCOUNTER_MAX = 25;

const ELEMENT_MAP = {
  physical: { strong: 'nature', weak: 'digital' },
  nature:   { strong: 'digital', weak: 'physical' },
  digital:  { strong: 'physical', weak: 'nature' }
};
const ELEMENT_NAMES = { physical: '物理', nature: '自然', digital: 'デジタル' };

// ============================================================
// SKILLS
// ============================================================
const SKILLS = {
  // タケル
  clip_throw:      { name: '📎クリップ投げ',   type: 'damage', element: 'physical', target: 'single', power: 1.2, spCost: 8,  desc: '物理単体攻撃' },
  encourage:       { name: '📢叱咤激励',       type: 'buff',   target: 'ally',    spCost: 12, buffStat: 'atk', buffMultiplier: 1.3, buffTurns: 3, desc: '味方1体のATKアップ' },
  overtime:        { name: '🔥残業パワー',     type: 'damage', element: 'physical', target: 'single', power: 2.0, spCost: 20, desc: '物理強攻撃' },
  ultimate_takeru: { name: '⚡全力残業パンチ', type: 'damage', element: 'physical', target: 'single', power: 3.5, spCost: 0, isUltimate: true, selfHealPercent: 30, desc: '必殺技＋自己回復' },
  hidden_takeru:   { name: '🤝ご近所パワー',   type: 'heal',   target: 'allAlly', spCost: 0, isHidden: true, healPercent: 30, spHealPercent: 30, desc: '味方全体HP/SP30%回復' },

  // ミケ
  scratch:         { name: '🐾ひっかき',       type: 'damage', element: 'nature',   target: 'single', power: 1.3, spCost: 6,  desc: '自然単体攻撃' },
  intimidate:      { name: '😼威嚇',           type: 'debuff', target: 'single',  spCost: 10, debuffStat: 'atk', debuffMultiplier: 0.7, debuffTurns: 3, desc: '敵1体のATKダウン' },
  cat_tornado:     { name: '🌪️猫パンチ旋風',  type: 'damage', element: 'nature',   target: 'all',    power: 1.5, spCost: 18, desc: '自然全体攻撃' },
  ultimate_mike:   { name: '🌙九生の猫神楽',   type: 'damage', element: 'nature',   target: 'all',    power: 0.5, spCost: 0, hits: 9, isUltimate: true, desc: '9連撃＋味方SPDアップ' },
  hidden_mike:     { name: '🐾にゃんにゃんコール', type: 'damage', element: 'nature', target: 'all', power: 1.8, spCost: 0, isHidden: true, partyBuff: { stat: 'def', multiplier: 1.3, turns: 3 }, desc: '全体攻撃＋味方DEFアップ' },

  // アカネ
  bug_inject:      { name: '🐛バグ注入',       type: 'damage', element: 'digital',  target: 'single', power: 1.4, spCost: 10, inflicts: 'バグ', desc: 'デジタル攻撃＋バグ付与' },
  firewall:        { name: '🛡️ファイアウォール', type: 'buff',  target: 'allAlly', spCost: 15, buffStat: 'def', buffMultiplier: 1.3, buffTurns: 3, desc: '味方全体DEFアップ' },
  sys_crash:       { name: '💣システムクラッシュ', type: 'damage', element: 'digital', target: 'all', power: 1.8, spCost: 25, desc: 'デジタル全体攻撃' },
  ultimate_akane:  { name: '💻カーネルパニック', type: 'damage', element: 'digital',  target: 'all',    power: 2.5, spCost: 0, isUltimate: true, inflicts: 'バグ', desc: '全体大ダメージ＋バグ' },
  hidden_akane:    { name: '🌐オープンソース',  type: 'buff',   target: 'allAlly', spCost: 0, isHidden: true, buffStat: 'spCostHalf', buffMultiplier: 1, buffTurns: 3, buffName: 'オープンソース', desc: '3ターンSPコスト半減' }
};

// ============================================================
// CHARACTER TEMPLATES
// ============================================================
const CHARACTER_TEMPLATES = {
  takeru: { name: 'タケル', emoji: '🧑‍💼', hp: 100, sp: 40, atk: 15, def: 10, spd: 10, element: 'physical', skills: ['clip_throw', 'encourage'], learnSkills: { 10: 'overtime' } },
  mike:   { name: 'ミケ',   emoji: '🐱',    hp: 80,  sp: 35, atk: 12, def: 8,  spd: 15, element: 'nature',   skills: ['scratch', 'intimidate'],   learnSkills: { 12: 'cat_tornado' }, joinChapter: 2 },
  akane:  { name: 'アカネ', emoji: '👩‍💻', hp: 90,  sp: 60, atk: 14, def: 9,  spd: 12, element: 'digital',  skills: ['bug_inject', 'firewall'],  learnSkills: { 16: 'sys_crash' },   joinChapter: 4 }
};

// ============================================================
// ITEMS
// ============================================================
const ITEMS = {
  onigiri_ume:    { name: '🍙おにぎり（梅）',   price: 120, type: 'heal',       hpHeal: 30,  desc: 'HPを30回復' },
  onigiri_sake:   { name: '🍙おにぎり（鮭）',   price: 150, type: 'heal',       hpHeal: 50,  desc: 'HPを50回復' },
  onigiri_mentai: { name: '🍙おにぎり（明太子）', price: 200, type: 'heal',      hpHeal: 80,  desc: 'HPを80回復' },
  bento:          { name: '🍱コンビニ弁当',      price: 500, type: 'heal',       hpHeal: 9999, desc: 'HPを全回復' },
  energy_drink:   { name: '🥤エナジードリンク',  price: 200, type: 'spHeal',     spHeal: 30,  desc: 'SPを30回復' },
  cafe_latte:     { name: '☕カフェラテ',         price: 300, type: 'spHeal',     spHeal: 50,  desc: 'SPを50回復' },
  bandaid:        { name: '🩹ばんそうこう',      price: 100, type: 'cure',       desc: '状態異常を回復' },
  nutrient:       { name: '💊栄養ドリンク',      price: 400, type: 'heal',       hpHeal: 50, spHeal: 20, desc: 'HP50+SP20回復' },
  chocolate:      { name: '🍫チョコレート',      price: 150, type: 'battleBuff', stat: 'atk', multiplier: 1.2, turns: 3, desc: '戦闘中ATK↑' },
  icecream:       { name: '🧊アイスクリーム',    price: 180, type: 'battleBuff', stat: 'spd', multiplier: 1.2, turns: 3, desc: '戦闘中SPD↑' }
};

// ============================================================
// ENEMY SKILLS
// ============================================================
const ENEMY_SKILLS = {
  basic_attack:    { name: '攻撃',           power: 1.0, type: 'damage', target: 'single' },
  heavy_slam:      { name: 'ヘビースラム',   power: 1.5, type: 'damage', target: 'single' },
  pile_on:         { name: 'タスク追加',     power: 1.0, type: 'damage', target: 'all' },
  claw_rush:       { name: '爪ラッシュ',     power: 0.4, type: 'damage', target: 'single', hits: 3 },
  roar:            { name: '威嚇の咆哮',     type: 'debuff', target: 'all', stat: 'atk', multiplier: 0.7, turns: 3 },
  cat_storm:       { name: '猫嵐',           power: 1.3, type: 'damage', target: 'all', element: 'nature' },
  full_throttle:   { name: 'フルスロットル', power: 2.0, type: 'damage', target: 'single', element: 'physical' },
  electric_brake:  { name: '電磁ブレーキ',   power: 1.2, type: 'damage', target: 'all', element: 'digital' },
  passenger_rush:  { name: '乗客ラッシュ',   power: 0.3, type: 'damage', target: 'all', hits: 5, element: 'physical' },
  virus_spread:    { name: 'ウイルス拡散',   power: 1.0, type: 'damage', target: 'all', element: 'digital', inflicts: 'バグ' },
  encrypt:         { name: '暗号化',         power: 1.8, type: 'damage', target: 'single', element: 'digital' },
  system_overload: { name: 'システム過負荷', power: 1.5, type: 'damage', target: 'all', element: 'digital' },
  self_repair:     { name: '自己修復',       type: 'heal', healPercent: 15 },
  chaos_strike:    { name: 'カオスストライク', power: 2.0, type: 'damage', target: 'single' },
  type_shift:      { name: '属性変換',       type: 'special' },
  void_wave:       { name: '虚無の波動',     power: 1.5, type: 'damage', target: 'all' },
  reality_warp:    { name: '現実歪曲',       type: 'debuff', target: 'all', stat: 'def', multiplier: 0.7, turns: 3 },
  chaos_heal:      { name: '混沌の再生',     type: 'heal', healPercent: 10 }
};

// ============================================================
// ENEMIES
// ============================================================
const ENEMIES = {
  // Chapter 1
  task_pile:      { name: '📋タスクの山',     emoji: '📋', lv: 1, hp: 25,  sp: 10, atk: 8,  def: 5,  spd: 5,  element: 'physical', exp: 15,  money: 50,  skills: ['basic_attack'] },
  spam_mail:      { name: '✉️迷惑メール',    emoji: '✉️', lv: 2, hp: 30,  sp: 15, atk: 10, def: 4,  spd: 8,  element: 'digital',  exp: 20,  money: 60,  skills: ['basic_attack'] },
  spilled_coffee: { name: '☕こぼれたコーヒー', emoji: '☕', lv: 2, hp: 28, sp: 10, atk: 9,  def: 6,  spd: 6,  element: 'nature',   exp: 18,  money: 55,  skills: ['basic_attack'] },
  task_list_boss: { name: '📋巨大タスクリスト', emoji: '📋', lv: 5, hp: 150, sp: 30, atk: 18, def: 12, spd: 8,  element: 'physical', exp: 100, money: 500, isBoss: true, skills: ['basic_attack', 'heavy_slam', 'pile_on'], intro: '大量のタスクが襲いかかってきた！' },
  // Chapter 2
  crow:           { name: '🐦カラス',         emoji: '🐦', lv: 3, hp: 35,  sp: 15, atk: 12, def: 6,  spd: 12, element: 'nature',   exp: 25,  money: 70,  skills: ['basic_attack'] },
  hornet:         { name: '🐝スズメバチ',     emoji: '🐝', lv: 4, hp: 40,  sp: 20, atk: 15, def: 5,  spd: 14, element: 'nature',   exp: 30,  money: 80,  skills: ['basic_attack'] },
  leaf_tornado:   { name: '🍂落ち葉竜巻',     emoji: '🍂', lv: 4, hp: 45,  sp: 15, atk: 13, def: 8,  spd: 10, element: 'nature',   exp: 28,  money: 75,  skills: ['basic_attack'] },
  nyandam:        { name: '🐱ボスネコ・ニャンダム', emoji: '🐱', lv: 8, hp: 300, sp: 50, atk: 22, def: 15, spd: 12, element: 'nature', exp: 200, money: 800, isBoss: true, skills: ['claw_rush', 'roar', 'cat_storm', 'basic_attack'], intro: 'ニャンダム「ニャーッ！この公園は俺の縄張りだ！」' },
  // Chapter 3
  gate_error:     { name: '🎫改札エラー',     emoji: '🎫', lv: 5, hp: 50,  sp: 20, atk: 16, def: 10, spd: 8,  element: 'digital',  exp: 35,  money: 90,  skills: ['basic_attack'] },
  notif_storm:    { name: '📱通知の嵐',       emoji: '📱', lv: 6, hp: 55,  sp: 25, atk: 18, def: 8,  spd: 13, element: 'digital',  exp: 40,  money: 100, skills: ['basic_attack'] },
  crowded_train:  { name: '🚃混雑車両',       emoji: '🚃', lv: 6, hp: 65,  sp: 15, atk: 20, def: 14, spd: 6,  element: 'physical', exp: 42,  money: 110, skills: ['basic_attack'] },
  runaway_train:  { name: '🚇暴走トレイン',   emoji: '🚇', lv: 12, hp: 500, sp: 60, atk: 28, def: 18, spd: 15, element: 'physical', exp: 400, money: 1200, isBoss: true, skills: ['full_throttle', 'electric_brake', 'passenger_rush', 'basic_attack'], intro: '地下鉄が暴走を始めた！止めなければ！' },
  // Chapter 4
  malware:        { name: '🦠マルウェア',     emoji: '🦠', lv: 8,  hp: 70,  sp: 30, atk: 22, def: 10, spd: 14, element: 'digital',  exp: 50,  money: 130, skills: ['basic_attack'] },
  ransomware:     { name: '🔒ランサムウェア', emoji: '🔒', lv: 9,  hp: 80,  sp: 35, atk: 25, def: 12, spd: 11, element: 'digital',  exp: 55,  money: 150, skills: ['basic_attack'] },
  short_circuit:  { name: '⚡ショートサーキット', emoji: '⚡', lv: 9, hp: 75, sp: 20, atk: 28, def: 8, spd: 16, element: 'physical', exp: 52, money: 140, skills: ['basic_attack'] },
  virus_king:     { name: '💻ウイルスキング', emoji: '💻', lv: 16, hp: 800, sp: 80, atk: 35, def: 20, spd: 18, element: 'digital', exp: 600, money: 1500, isBoss: true, skills: ['virus_spread', 'encrypt', 'system_overload', 'self_repair', 'basic_attack'], intro: 'ウイルスキング「全てのデータは我のものだ！」' },
  // Chapter 5
  chaos_shard:    { name: '🌀カオスの欠片',   emoji: '🌀', lv: 10, hp: 85,  sp: 30, atk: 26, def: 14, spd: 13, element: 'physical', exp: 60,  money: 160, skills: ['basic_attack'] },
  shadow_self:    { name: '👤影の自分',       emoji: '👤', lv: 11, hp: 90,  sp: 35, atk: 28, def: 15, spd: 14, element: 'physical', exp: 65,  money: 170, skills: ['basic_attack'] },
  distortion:     { name: '💫歪みの渦',       emoji: '💫', lv: 12, hp: 95,  sp: 40, atk: 30, def: 12, spd: 16, element: 'digital',  exp: 70,  money: 180, skills: ['basic_attack'] },
  chaos_vortex:   { name: '🌀カオスの渦',     emoji: '🌀', lv: 20, hp: 1200, sp: 100, atk: 42, def: 25, spd: 20, element: 'physical', exp: 1000, money: 2000, isBoss: true, changesType: true, skills: ['chaos_strike', 'type_shift', 'void_wave', 'reality_warp', 'chaos_heal', 'basic_attack'], intro: 'カオスの渦「日常を…混沌に変えてやる！」' }
};

// ============================================================
// MAP DATA
// ============================================================
// 0=floor,1=wall,2=door,3=npc,4=chest,5=shop,6=questNpc,7=event,8=save,9=boss
const MAP_DATA = {
  1: {
    name: '目覚めの朝',
    areas: [
      { // Area 0: タケルの部屋
        name: 'タケルの部屋',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
          [1,1,1,1,1,0,4,0,0,0,0,1,0,1,1,1,1,1,1,1],
          [1,1,1,1,1,0,0,0,7,0,0,0,0,2,1,1,1,1,1,1],
          [1,1,1,1,1,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1],
          [1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 8, y: 6 },
        doors: [{ x: 13, y: 6, toArea: 1, toX: 1, toY: 7 }],
        npcs: [],
        chests: [{ x: 6, y: 5, content: 'onigiri_ume', qty: 2 }],
        events: [{ x: 8, y: 6, trigger: 'ch1_wakeup' }],
        questNpcs: [],
        savePoints: []
      },
      { // Area 1: 通り
        name: '住宅街の通り',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,3,0,0,1,1,0,0,0,1,1,0,0,6,0,0,0,1],
          [1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,4,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,8,0,0,0,0,6,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
          [1,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,7,0,0,0,0,0,6,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,1],
          [1,0,3,0,0,0,1,1,0,0,0,1,1,0,0,0,4,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [
          { x: 0,  y: 7, toArea: 0, toX: 12, toY: 6 },
          { x: 19, y: 7, toArea: 2, toX: 1,  toY: 7 }
        ],
        npcs: [
          { id: 'ch1_tanaka',    x: 3,  y: 2 },
          { id: 'ch1_neighbor',  x: 6,  y: 8 },
          { id: 'ch1_oldlady',   x: 2,  y: 12 }
        ],
        chests: [
          { x: 17, y: 3, money: 100 },
          { x: 16, y: 12, content: 'bandaid', qty: 1 }
        ],
        events: [{ x: 9, y: 9, trigger: 'ch1_quest_discovery' }],
        questNpcs: [
          { id: 'q1_1', x: 15, y: 2 },
          { id: 'q1_2', x: 13, y: 6 },
          { id: 'q1_3', x: 15, y: 9 }
        ],
        savePoints: [{ x: 8, y: 6 }],
        shopPos: { x: 2, y: 5 }
      },
      { // Area 2: オフィス
        name: 'オフィスビル',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,4,0,1],
          [1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,1,0,0,1,1,0,0,0,8,0,0,0,0,1,1,0,0,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1,1],
          [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [{ x: 0, y: 7, toArea: 1, toX: 18, toY: 7 }],
        npcs: [{ id: 'ch1_coworker', x: 3, y: 3 }],
        chests: [{ x: 17, y: 2, content: 'energy_drink', qty: 1 }],
        events: [{ x: 9, y: 10, trigger: 'ch1_boss_intro' }],
        questNpcs: [],
        savePoints: [{ x: 9, y: 5 }],
        bossPos: { x: 9, y: 11 }
      }
    ],
    enemies: ['task_pile', 'spam_mail', 'spilled_coffee'],
    encounterAreas: [1, 2],
    boss: 'task_list_boss',
    bossArea: 2
  },
  2: {
    name: '公園の不思議',
    areas: [
      { // Area 0: 公園
        name: '中央公園',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,0,6,0,1,0,0,0,0,4,0,0,0,0,1,0,0,6,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,1],
          [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,3,0,1],
          [1,0,0,8,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
          [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
          [1,0,0,0,0,0,1,0,0,5,0,0,0,1,0,0,0,0,0,1],
          [1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,1],
          [1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,4,0,0,0,0,6,0,0,0,1],
          [1,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [
          { x: 0,  y: 7, toChapter: 1 },
          { x: 19, y: 7, toArea: 1, toX: 1, toY: 7 }
        ],
        npcs: [
          { id: 'ch2_jogger',  x: 17, y: 5 },
          { id: 'ch2_child',   x: 3,  y: 11 },
          { id: 'ch2_granny',  x: 7,  y: 13 }
        ],
        chests: [
          { x: 9, y: 2, money: 150 },
          { x: 10, y: 12, content: 'onigiri_sake', qty: 1 }
        ],
        events: [],
        questNpcs: [
          { id: 'q2_1', x: 2, y: 2 },
          { id: 'q2_2', x: 17, y: 2 },
          { id: 'q2_3', x: 15, y: 12 }
        ],
        savePoints: [{ x: 3, y: 6 }],
        shopPos: { x: 9, y: 9 }
      },
      { // Area 1: 商店街
        name: '商店街',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,3,0,0,0,0,0,0,0,0,0,3,0,0,0,4,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [{ x: 0, y: 7, toArea: 0, toX: 18, toY: 7 }],
        npcs: [
          { id: 'ch2_shopkeeper_npc', x: 3, y: 3 },
          { id: 'ch2_kid', x: 13, y: 3 }
        ],
        chests: [{ x: 17, y: 3, money: 200 }],
        events: [],
        questNpcs: [],
        savePoints: [{ x: 9, y: 6 }],
        bossPos: { x: 9, y: 10 }
      }
    ],
    enemies: ['crow', 'hornet', 'leaf_tornado'],
    encounterAreas: [0, 1],
    boss: 'nyandam',
    bossArea: 1
  },
  3: {
    name: '地下鉄の迷宮',
    areas: [
      { // Area 0: 駅
        name: '地下鉄駅',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,3,0,0,0,6,0,0,0,0,6,0,0,0,0,4,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,5,0,0,0,0,0,8,0,0,0,0,0,0,6,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [
          { x: 0,  y: 7, toChapter: 2 },
          { x: 19, y: 7, toArea: 1, toX: 1, toY: 7 }
        ],
        npcs: [
          { id: 'ch3_station_staff', x: 3, y: 2 },
          { id: 'ch3_student',       x: 3, y: 11 },
          { id: 'ch3_salary',        x: 15, y: 11 }
        ],
        chests: [
          { x: 17, y: 2, content: 'nutrient', qty: 1 },
          { x: 9,  y: 12, money: 200 }
        ],
        events: [],
        questNpcs: [
          { id: 'q3_1', x: 7,  y: 2 },
          { id: 'q3_2', x: 12, y: 2 },
          { id: 'q3_3', x: 15, y: 6 }
        ],
        savePoints: [{ x: 8, y: 6 }],
        shopPos: { x: 2, y: 6 }
      },
      { // Area 1: 地下通路
        name: '地下通路',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
          [1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,4,0,0,1],
          [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
          [1,1,1,0,1,1,0,0,1,1,0,1,1,1,0,1,1,0,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [{ x: 0, y: 7, toArea: 0, toX: 18, toY: 7 }],
        npcs: [],
        chests: [{ x: 16, y: 2, content: 'cafe_latte', qty: 1 }],
        events: [],
        questNpcs: [],
        savePoints: [{ x: 8, y: 6 }],
        bossPos: { x: 9, y: 11 }
      }
    ],
    enemies: ['gate_error', 'notif_storm', 'crowded_train'],
    encounterAreas: [0, 1],
    boss: 'runaway_train',
    bossArea: 1
  },
  4: {
    name: 'デジタルの嵐',
    areas: [
      { // Area 0: IT企業
        name: 'IT企業オフィス',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
          [1,0,0,0,0,1,0,6,0,0,1,0,0,6,0,1,0,4,0,1],
          [1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
          [1,1,1,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,1,1],
          [1,0,0,0,0,0,0,0,8,0,0,0,5,0,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,1,1],
          [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
          [1,0,0,3,0,1,0,0,0,0,1,0,0,0,0,1,0,6,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [
          { x: 0,  y: 7, toChapter: 3 },
          { x: 19, y: 7, toArea: 1, toX: 1, toY: 7 }
        ],
        npcs: [
          { id: 'ch4_receptionist', x: 3, y: 3 },
          { id: 'ch4_engineer',     x: 3, y: 11 }
        ],
        chests: [{ x: 17, y: 2, content: 'chocolate', qty: 2 }],
        events: [],
        questNpcs: [
          { id: 'q4_1', x: 7,  y: 2 },
          { id: 'q4_2', x: 13, y: 2 },
          { id: 'q4_3', x: 17, y: 11 }
        ],
        savePoints: [{ x: 8, y: 6 }],
        shopPos: { x: 12, y: 6 }
      },
      { // Area 1: サーバールーム
        name: 'サーバールーム',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1],
          [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,4,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1],
          [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1],
          [1,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1],
          [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1],
          [1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [{ x: 0, y: 7, toArea: 0, toX: 18, toY: 7 }],
        npcs: [],
        chests: [{ x: 17, y: 2, content: 'bento', qty: 1 }],
        events: [],
        questNpcs: [],
        savePoints: [{ x: 8, y: 6 }],
        bossPos: { x: 9, y: 11 }
      }
    ],
    enemies: ['malware', 'ransomware', 'short_circuit'],
    encounterAreas: [0, 1],
    boss: 'virus_king',
    bossArea: 1
  },
  5: {
    name: '日常の守護者',
    areas: [
      { // Area 0: 商店街（カオス）
        name: '混沌の商店街',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,6,0,0,1,0,0,0,0,0,0,0,0,1,0,0,6,0,1],
          [1,0,0,0,0,1,0,0,3,0,0,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,1],
          [1,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,1],
          [1,0,0,3,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,0,1,0,0,0,0,4,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [
          { x: 0,  y: 7, toChapter: 4 },
          { x: 19, y: 7, toArea: 1, toX: 1, toY: 7 }
        ],
        npcs: [
          { id: 'ch5_vendor',  x: 8,  y: 3 },
          { id: 'ch5_mother',  x: 3,  y: 10 }
        ],
        chests: [
          { x: 17, y: 5, content: 'bento', qty: 1 },
          { x: 10, y: 11, money: 300 }
        ],
        events: [],
        questNpcs: [
          { id: 'q5_1', x: 2,  y: 2 },
          { id: 'q5_2', x: 17, y: 2 },
          { id: 'q5_3', x: 16, y: 9 }
        ],
        savePoints: [{ x: 8, y: 6 }],
        shopPos: { x: 2, y: 5 }
      },
      { // Area 1: ビル内部
        name: 'ビル内部',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,4,0,1],
          [1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,0,1,1,1,0,1,1,0,0,1,1,0,1,1,1,0,1,1],
          [1,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,0,1,1,1,0,1,1,0,0,1,1,0,1,1,1,0,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
          [1,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [
          { x: 0,  y: 7, toArea: 0, toX: 18, toY: 7 },
          { x: 19, y: 7, toArea: 2, toX: 1,  toY: 7 }
        ],
        npcs: [],
        chests: [{ x: 17, y: 2, content: 'nutrient', qty: 2 }],
        events: [],
        questNpcs: [],
        savePoints: [{ x: 8, y: 6 }]
      },
      { // Area 2: 屋上
        name: '屋上',
        tiles: [
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,1],
          [2,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
          [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        playerStart: { x: 1, y: 7 },
        doors: [{ x: 0, y: 7, toArea: 1, toX: 18, toY: 7 }],
        npcs: [],
        chests: [],
        events: [],
        questNpcs: [],
        savePoints: [{ x: 8, y: 7 }],
        bossPos: { x: 9, y: 6 }
      }
    ],
    enemies: ['chaos_shard', 'shadow_self', 'distortion'],
    encounterAreas: [0, 1],
    boss: 'chaos_vortex',
    bossArea: 2
  }
};

// ============================================================
// NPC DATA
// ============================================================
const NPC_DATA = {
  // Chapter 1
  ch1_tanaka:    { name: '田中さん',   emoji: '👨', dialog: ['おはよう、タケルくん！今日も頑張ってね。', '最近、なんだか不思議なことが起きてるらしいよ。'] },
  ch1_neighbor:  { name: '佐藤さん',   emoji: '👩', dialog: ['あら、タケルくん。お仕事行くの？', '気をつけてね〜。'] },
  ch1_oldlady:   { name: 'おばあちゃん', emoji: '👵', dialog: ['最近の若い人は大変ねぇ。', 'でもね、日常の中にも冒険はあるのよ。'] },
  ch1_coworker:  { name: '同僚の山田',   emoji: '👨‍💼', dialog: ['おっ、タケル！今日のタスク量ヤバいぞ…。', '奥の方にボスタスクがあるから気をつけろ！'] },
  // Chapter 2
  ch2_jogger:    { name: 'ジョギングの人', emoji: '🏃', dialog: ['いい天気ですね！', 'でも公園の奥は変な気配がしますよ…。'] },
  ch2_child:     { name: '子供',         emoji: '👦', dialog: ['ねえねえ！公園に大きな猫がいるの！', 'すっごく強そうだった！'] },
  ch2_granny:    { name: 'おばあさん',   emoji: '👵', dialog: ['あら、あなた冒険者さん？', '公園の花壇が荒らされて困ってるの。'] },
  ch2_shopkeeper_npc: { name: '魚屋のおじさん', emoji: '🐟', dialog: ['いらっしゃい！新鮮な魚あるよ！', '最近カラスが多くて困るねぇ。'] },
  ch2_kid:       { name: '女の子',       emoji: '👧', dialog: ['あのね、商店街の奥に怖い猫がいるの…。', '気をつけてね！'] },
  // Chapter 3
  ch3_station_staff: { name: '駅員',     emoji: '🧑‍✈️', dialog: ['お客様、地下通路で異常が発生しています。', 'くれぐれもお気をつけください。'] },
  ch3_student:   { name: '学生',         emoji: '🧑‍🎓', dialog: ['うわ、改札エラーで通れない！', 'なんか機械がおかしいんだよね…。'] },
  ch3_salary:    { name: 'サラリーマン', emoji: '👨‍💼', dialog: ['電車が全然来ないんだが…。', '地下で何か起きてるのか？'] },
  // Chapter 4
  ch4_receptionist: { name: '受付',      emoji: '👩‍💼', dialog: ['いらっしゃいませ。', 'サーバールームは奥にあります。アカネさんが案内してくれますよ。'] },
  ch4_engineer:  { name: 'エンジニア',   emoji: '👨‍💻', dialog: ['サーバーがウイルスにやられてる！', 'アカネさんと一緒に何とかしてくれ！'] },
  // Chapter 5
  ch5_vendor:    { name: '屋台のおじさん', emoji: '👨‍🍳', dialog: ['なんだか空気が変だな…。', '気をつけてくれよ！'] },
  ch5_mother:    { name: 'お母さん',       emoji: '👩', dialog: ['うちの子を見なかった？', '商店街のどこかにいるはずなの…。'] },
  // Quest givers
  quest_ch1_1:   { name: '犬の飼い主',   emoji: '👩', dialog: ['ポチがいなくなっちゃったの！探してくれない？'] },
  quest_ch1_2:   { name: 'お隣の鈴木さん', emoji: '👨', dialog: ['荷物を届けてほしいんだけど、通りの向こうの人に。'] },
  quest_ch1_3:   { name: '清掃員',       emoji: '🧹', dialog: ['公園にゴミが散らかってるんだ。手伝ってくれない？'] },
  quest_ch2_1:   { name: '猫好きおばさん', emoji: '🐱', dialog: ['猫たちの集会場所を知りたいの！'] },
  quest_ch2_2:   { name: '花屋さん',     emoji: '🌸', dialog: ['花壇の手入れを手伝って！'] },
  quest_ch2_3:   { name: '困った人',     emoji: '😰', dialog: ['鍵を落としちゃった…探してくれない？'] },
  quest_ch3_1:   { name: 'おじいちゃん', emoji: '👴', dialog: ['出口がわからなくて…道案内してくれないか？'] },
  quest_ch3_2:   { name: 'OLさん',       emoji: '👩‍💼', dialog: ['スマホの充電が切れちゃって…充電器持ってない？'] },
  quest_ch3_3:   { name: '旅行者',       emoji: '🧳', dialog: ['カバンを電車に忘れてきちゃった！'] },
  quest_ch4_1:   { name: '総務の人',     emoji: '👨‍💼', dialog: ['プリンターが壊れて書類が印刷できないんだ！'] },
  quest_ch4_2:   { name: '後輩',         emoji: '👩', dialog: ['みんなに差し入れを買ってきてほしいな。'] },
  quest_ch4_3:   { name: 'データ管理者', emoji: '💾', dialog: ['消えたデータを復旧しないと…手伝って！'] },
  quest_ch5_1:   { name: '心配なお父さん', emoji: '👨', dialog: ['うちの子が迷子になって…探してくれませんか？'] },
  quest_ch5_2:   { name: 'おばあちゃん', emoji: '👵', dialog: ['買い物を頼みたいんだけど…。'] },
  quest_ch5_3:   { name: '町内会長',     emoji: '👨‍🦳', dialog: ['みんなからのお礼を渡したいんだ。'] }
};

// ============================================================
// QUEST DATA
// ============================================================
const QUEST_DATA = [
  // Chapter 1
  { id: 'q1_1', chapter: 1, name: '🐕迷子のポチ',       giver: 'quest_ch1_1', desc: '近所で迷子の犬を探す', goal: { type: 'auto' }, reward: { money: 100, item: 'onigiri_sake' }, acceptDialog: ['ポチが朝から帰ってこないの！', '通りのどこかにいると思うの…お願い！'], activeDialog: 'ポチは見つかった？', completeDialog: ['ポチが見つかった！ありがとう！', 'お礼にこれをどうぞ！'] },
  { id: 'q1_2', chapter: 1, name: '📦お隣さんの荷物',   giver: 'quest_ch1_2', desc: 'お隣さんに荷物を届ける', goal: { type: 'auto' }, reward: { money: 100 }, acceptDialog: ['この荷物を通りの向こうの人に届けてくれない？', '重くないから大丈夫だよ！'], activeDialog: '届けてくれた？', completeDialog: ['届けてくれてありがとう！助かったよ！'] },
  { id: 'q1_3', chapter: 1, name: '🧹散らかった公園',   giver: 'quest_ch1_3', desc: '公園のゴミ拾いを手伝う', goal: { type: 'auto' }, reward: { money: 100, item: 'energy_drink' }, acceptDialog: ['公園にゴミが散らかってるんだ。', '手伝ってくれると助かるなぁ。'], activeDialog: 'まだ終わってない？', completeDialog: ['公園がきれいになった！ありがとう！'] },
  // Chapter 2
  { id: 'q2_1', chapter: 2, name: '🐱猫の集会',         giver: 'quest_ch2_1', desc: '猫の集会場所を見つける', goal: { type: 'auto' }, reward: { money: 100, item: 'onigiri_mentai' }, acceptDialog: ['猫たちがどこかで集会してるらしいの！', '場所を見つけてくれない？'], activeDialog: '見つかった？', completeDialog: ['見つけてくれたのね！ありがとう！'] },
  { id: 'q2_2', chapter: 2, name: '🌸花壇の手入れ',     giver: 'quest_ch2_2', desc: '花壇の手入れを手伝う', goal: { type: 'auto' }, reward: { money: 100 }, acceptDialog: ['花壇が荒らされちゃって…', '手入れを手伝ってくれない？'], activeDialog: 'まだかしら？', completeDialog: ['きれいになった！ありがとう！'] },
  { id: 'q2_3', chapter: 2, name: '🔑落とし物',         giver: 'quest_ch2_3', desc: '落とした鍵を探す', goal: { type: 'auto' }, reward: { money: 100, item: 'bandaid' }, acceptDialog: ['家の鍵を落としちゃったんだ…', 'この辺りで落としたと思うんだけど。'], activeDialog: '見つかった？', completeDialog: ['見つけてくれたの！？ありがとう！！'] },
  // Chapter 3
  { id: 'q3_1', chapter: 3, name: '👴おじいちゃんの道案内', giver: 'quest_ch3_1', desc: 'おじいちゃんを出口まで案内する', goal: { type: 'auto' }, reward: { money: 100 }, acceptDialog: ['わしは出口がわからなくて困っとるんじゃ。', '案内してくれんかのう？'], activeDialog: 'まだ道に迷っとるよ…', completeDialog: ['おお！出口が見えた！ありがとう！'] },
  { id: 'q3_2', chapter: 3, name: '📱充電切れ',         giver: 'quest_ch3_2', desc: 'スマホの充電を手配する', goal: { type: 'auto' }, reward: { money: 100, item: 'energy_drink' }, acceptDialog: ['スマホの充電が切れちゃって…', '充電できるところ知らない？'], activeDialog: 'まだ充電できてないの…', completeDialog: ['充電できた！ありがとう！'] },
  { id: 'q3_3', chapter: 3, name: '🎒忘れ物',           giver: 'quest_ch3_3', desc: '電車に忘れたカバンを探す', goal: { type: 'auto' }, reward: { money: 100, item: 'nutrient' }, acceptDialog: ['カバンを電車に忘れてきちゃったんだ！', '地下通路のどこかにあるかも…'], activeDialog: '見つかった？', completeDialog: ['カバンが見つかった！ありがとう！'] },
  // Chapter 4
  { id: 'q4_1', chapter: 4, name: '🖨️プリンター故障',   giver: 'quest_ch4_1', desc: 'プリンターを直す', goal: { type: 'auto' }, reward: { money: 100, item: 'cafe_latte' }, acceptDialog: ['プリンターが動かないんだ！', '修理を手伝ってくれない？'], activeDialog: 'まだ直ってない？', completeDialog: ['動いた！ありがとう！'] },
  { id: 'q4_2', chapter: 4, name: '☕差し入れ',         giver: 'quest_ch4_2', desc: 'みんなに差し入れを配る', goal: { type: 'auto' }, reward: { money: 100, item: 'chocolate' }, acceptDialog: ['みんな徹夜で疲れてるから…', '差し入れを配ってきてほしいな。'], activeDialog: '配ってくれた？', completeDialog: ['みんな喜んでた！ありがとう！'] },
  { id: 'q4_3', chapter: 4, name: '📊データ復旧',       giver: 'quest_ch4_3', desc: '消えたデータを復旧する', goal: { type: 'auto' }, reward: { money: 100, item: 'icecream' }, acceptDialog: ['大事なデータが消えちゃったんだ！', '復旧を手伝って！'], activeDialog: 'まだ復旧できてない？', completeDialog: ['データが戻った！ありがとう！'] },
  // Chapter 5
  { id: 'q5_1', chapter: 5, name: '👶迷子の案内',       giver: 'quest_ch5_1', desc: '迷子の子供を親のもとへ', goal: { type: 'auto' }, reward: { money: 100 }, acceptDialog: ['うちの子がいなくなって…', 'お願い、探してきて！'], activeDialog: '見つかった？', completeDialog: ['見つけてくれてありがとう！本当に助かった！'] },
  { id: 'q5_2', chapter: 5, name: '🛒おつかい',         giver: 'quest_ch5_2', desc: 'おばあちゃんの買い物を手伝う', goal: { type: 'auto' }, reward: { money: 100, item: 'bento' }, acceptDialog: ['足が悪くて買い物に行けないの。', '代わりに行ってくれない？'], activeDialog: 'まだかしら？', completeDialog: ['ありがとうねぇ。助かったわ。'] },
  { id: 'q5_3', chapter: 5, name: '🎁最後のお礼',       giver: 'quest_ch5_3', desc: '町内会からのお礼を受け取る', goal: { type: 'auto' }, reward: { money: 100, item: 'nutrient' }, acceptDialog: ['きみにはいつも助けられてるよ。', 'これはみんなからの感謝の気持ちだ。'], activeDialog: 'また来てくれ！', completeDialog: ['ありがとう、ヒーローくん！', 'これからもこの街をよろしくな！'] }
];

// ============================================================
// SHOP DATA
// ============================================================
const SHOP_DATA = {
  items: ['onigiri_ume', 'onigiri_sake', 'onigiri_mentai', 'bento', 'energy_drink', 'cafe_latte', 'bandaid', 'nutrient', 'chocolate', 'icecream'],
  keeperDialog: {
    1: 'いらっしゃい！新人さんかい？無理しないでね。おにぎりがオススメだよ！',
    2: '公園で何か起きてるみたいだね。エナジードリンクで元気出して！',
    3: '地下鉄が変だって？栄養ドリンクで体力つけていきな！',
    4: 'IT企業で大変そうだね。カフェラテでリフレッシュしなよ！',
    5: '最後の戦いだってね…応援してるよ！弁当持っていきな！'
  }
};

// ============================================================
// STORY DATA
// ============================================================
const STORY_DATA = {
  ch1_wakeup: [
    { speaker: 'タケル', text: 'ん…朝か…。今日も仕事か…。' },
    { speaker: '',       text: 'タケルは重い体を起こした。' },
    { speaker: 'タケル', text: 'あれ？なんだか今日は空気が違う気がする…。' },
    { speaker: 'タケル', text: '頭の上に何か浮かんでる…？「クエスト」…？' },
    { speaker: '',       text: '【操作説明】WASD/矢印キーで移動、スペース/Enterで調べる、右上のメニューでステータス確認' }
  ],
  ch1_quest_discovery: [
    { speaker: 'タケル', text: 'やっぱり…人の頭の上にマークが見える…！' },
    { speaker: 'タケル', text: 'これは…日常の中に隠れた「クエスト」なのか…！？' },
    { speaker: '',       text: '❗マークのある人に話しかけるとクエストを受けられます。' }
  ],
  ch1_boss_intro: [
    { speaker: '',       text: 'オフィスの奥から不穏な気配がする…！' },
    { speaker: 'タケル', text: 'うわっ！タスクが山積みになって…形を成してる！？' },
    { speaker: 'タケル', text: 'やるしかない…！立ち向かうぞ！' }
  ],
  ch1_boss_victory: [
    { speaker: 'タケル', text: 'ふぅ…なんとか片付けた。' },
    { speaker: 'タケル', text: 'この不思議な力…「日常の勇者」ってやつか。' },
    { speaker: '',       text: '【第1章「目覚めの朝」クリア！】' },
    { speaker: '',       text: '右の出口から次の章へ進めます。' }
  ],
  ch2_intro: [
    { speaker: '',       text: '翌日、タケルは帰り道に公園に立ち寄った。' },
    { speaker: 'タケル', text: 'あの力はまだある…公園にも何かクエストがありそうだ。' },
    { speaker: '',       text: '公園を探索しよう！商店街の奥にボスがいるらしい…。' }
  ],
  ch2_boss_intro: [
    { speaker: '',       text: '商店街の奥に巨大な猫が立ちはだかっている！' },
    { speaker: 'ニャンダム', text: 'ニャーッ！この縄張りに入るな！' },
    { speaker: 'タケル', text: 'で、でかい猫だ…！でも負けないぞ！' }
  ],
  ch2_boss_victory: [
    { speaker: '',       text: 'ニャンダムが大人しくなった。' },
    { speaker: '',       text: 'その影から一匹の三毛猫が現れた…。' }
  ],
  ch2_mike_meet: [
    { speaker: '🐱???', text: 'ニャ…ニャー？' },
    { speaker: 'タケル', text: 'え？今の猫…しゃべった？' },
    { speaker: 'ミケ',   text: 'ニャー！（助けてくれてありがとう！ボクもキミと一緒に行きたいニャ！）' },
    { speaker: '',       text: '🐱ミケが仲間になった！' },
    { speaker: '',       text: '【第2章「公園の不思議」クリア！】' }
  ],
  ch3_intro: [
    { speaker: '',       text: '数日後、タケルとミケは地下鉄駅にやってきた。' },
    { speaker: 'タケル', text: 'なんだか駅の様子がおかしいな…機械がバグってる。' },
    { speaker: 'ミケ',   text: 'ニャ！（変な気配がするニャ！）' },
    { speaker: '',       text: '地下通路を探索して暴走トレインを止めよう！' }
  ],
  ch3_boss_intro: [
    { speaker: '',       text: '地下通路の奥で、電車が暴走を始めた！' },
    { speaker: 'タケル', text: 'まずい！このままだと大事故になる！' },
    { speaker: 'ミケ',   text: 'ニャー！（止めるニャ！）' }
  ],
  ch3_boss_victory: [
    { speaker: '',       text: '暴走トレインが停止した！' },
    { speaker: 'タケル', text: 'ふぅ…なんとか止められた。' },
    { speaker: 'ミケ',   text: 'ニャー（みんな無事ニャ！）' },
    { speaker: '',       text: '【第3章「地下鉄の迷宮」クリア！】' }
  ],
  ch4_intro: [
    { speaker: '',       text: 'タケルたちはIT企業に調査に来ていた。' },
    { speaker: 'アカネ', text: 'あなたたちが噂の「クエスト」が見える人？' },
    { speaker: 'タケル', text: 'え、あなたも見えるの？' },
    { speaker: 'アカネ', text: '私はこの会社のエンジニア。最近サーバーに異常が起きてるの。' },
    { speaker: 'アカネ', text: '一緒に戦ってくれる？' },
    { speaker: '',       text: '👩‍💻アカネが仲間になった！' },
    { speaker: '',       text: 'サーバールームのウイルスキングを倒そう！' }
  ],
  ch4_boss_intro: [
    { speaker: '',           text: 'サーバールームの最深部に巨大なウイルスが！' },
    { speaker: 'ウイルスキング', text: 'フハハハ！全てのデータは我のものだ！' },
    { speaker: 'アカネ',     text: '絶対に許さない！このサーバーには大切なデータが…！' },
    { speaker: 'タケル',     text: 'みんな、行くぞ！' }
  ],
  ch4_boss_victory: [
    { speaker: '',       text: 'ウイルスキングが消滅した！' },
    { speaker: 'アカネ', text: 'やった！サーバーが正常に戻った！' },
    { speaker: 'タケル', text: 'でも、まだ何か大きなものが迫ってる気がする…。' },
    { speaker: '',       text: '【第4章「デジタルの嵐」クリア！】' }
  ],
  ch5_intro: [
    { speaker: '',       text: 'ある日、商店街に不穏な気配が漂い始めた。' },
    { speaker: 'タケル', text: 'この感覚…今までで一番強い。' },
    { speaker: 'ミケ',   text: 'ニャー！（空気が歪んでるニャ！）' },
    { speaker: 'アカネ', text: 'デジタル空間にも異常が出てる…大きな何かが来る。' },
    { speaker: '',       text: 'ビルの屋上を目指してカオスの渦を倒せ！' }
  ],
  ch5_boss_intro: [
    { speaker: '',           text: '屋上に巨大な渦が出現した！' },
    { speaker: 'カオスの渦', text: '日常を…混沌に変えてやる！' },
    { speaker: 'タケル',     text: '俺たちの日常は、俺たちが守る！' },
    { speaker: 'ミケ',       text: 'ニャー！（みんなで力を合わせるニャ！）' },
    { speaker: 'アカネ',     text: 'システム、全力稼働！行くよ！' }
  ],
  ch5_boss_victory: [
    { speaker: '',       text: 'カオスの渦が消滅し、空に光が戻った。' },
    { speaker: 'タケル', text: 'やった…守れたんだ、この街を…この日常を。' },
    { speaker: 'ミケ',   text: 'ニャー♪（やったニャ！）' },
    { speaker: 'アカネ', text: 'みんなの力があったからこそ、ね。' },
    { speaker: '',       text: '商店街の人々が集まってきた。' },
    { speaker: '田中さん', text: 'タケルくん！ありがとう！みんなの日常を守ってくれて！' },
    { speaker: '',       text: 'タケルは気づいた。日常の中にこそ、本当の冒険がある——。' },
    { speaker: '',       text: '🎊【おめでとう！ゲームクリア！】🎊' },
    { speaker: '',       text: 'プレイしてくれてありがとうございました！' }
  ],
  ending_all_quests: [
    { speaker: '',  text: '🏆 全てのサブクエストをクリアした！' },
    { speaker: '',  text: '「ご近所ヒーローのあかし」を手に入れた！' },
    { speaker: '',  text: '全ステータス+5！隠しスキルを習得！' }
  ]
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function $(id) { return document.getElementById(id); }
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// ============================================================
// SOUND MANAGER
// ============================================================
class SoundManager {
  constructor() { this.ctx = null; this.enabled = true; }
  init() {
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { this.ctx = null; }
  }
  play(type) {
    if (!this.ctx || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.15, now);
      switch (type) {
        case 'menuSelect':
          osc.frequency.setValueAtTime(800, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now); osc.stop(now + 0.1); break;
        case 'attack':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now); osc.stop(now + 0.15); break;
        case 'damage':
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(80, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now); osc.stop(now + 0.2); break;
        case 'levelUp':
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.setValueAtTime(500, now + 0.1);
          osc.frequency.setValueAtTime(600, now + 0.2);
          osc.frequency.setValueAtTime(800, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now); osc.stop(now + 0.5); break;
        case 'purchase':
          osc.frequency.setValueAtTime(1000, now);
          osc.frequency.setValueAtTime(1200, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now); osc.stop(now + 0.2); break;
        case 'questComplete':
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.setValueAtTime(600, now + 0.15);
          osc.frequency.setValueAtTime(800, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now); osc.stop(now + 0.5); break;
        case 'heal':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now); osc.stop(now + 0.4); break;
        case 'bossBattle':
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.2, now);
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.setValueAtTime(150, now + 0.2);
          osc.frequency.setValueAtTime(100, now + 0.4);
          osc.frequency.setValueAtTime(200, now + 0.6);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.start(now); osc.stop(now + 0.8); break;
        default:
          osc.frequency.setValueAtTime(440, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now); osc.stop(now + 0.1);
      }
    } catch(e) { /* ignore audio errors */ }
  }
}
const Sound = new SoundManager();

// ============================================================
// SAVE MANAGER
// ============================================================
class SaveManager {
  static save(state) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) { /* ignore */ }
  }
  static load() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
  }
  static hasSave() { return localStorage.getItem(SAVE_KEY) !== null; }
  static deleteSave() { localStorage.removeItem(SAVE_KEY); }
}

// ============================================================
// SCREEN MANAGER
// ============================================================
class ScreenManager {
  constructor() {
    this.screens = ['titleScreen','howToScreen','mapScreen','battleScreen','menuScreen','shopScreen','gameOverScreen'];
    this.current = 'titleScreen';
  }
  show(screenId) {
    this.screens.forEach(s => { const el = $(s); if (el) el.classList.remove('active'); });
    const el = $(screenId);
    if (el) el.classList.add('active');
    this.current = screenId;
  }
}

// ============================================================
// DIALOG SYSTEM
// ============================================================
class DialogSystem {
  constructor() {
    this.queue = [];
    this.active = false;
    this.typing = false;
    this.currentText = '';
    this.charIndex = 0;
    this.typeTimer = null;
    this.onComplete = null;
  }
  show(dialogArray, onComplete) {
    this.queue = dialogArray.slice();
    this.onComplete = onComplete || null;
    this.active = true;
    $('dialogOverlay').classList.add('active');
    $('dialogChoices').innerHTML = '';
    this.showNext();
  }
  showNext() {
    if (this.queue.length === 0) { this.hide(); return; }
    const entry = this.queue.shift();
    $('dialogSpeaker').textContent = entry.speaker || '';
    $('dialogText').textContent = '';
    this.currentText = entry.text;
    this.charIndex = 0;
    this.typing = true;
    $('btnDialogNext').style.display = 'none';
    $('dialogChoices').innerHTML = '';
    this.typeNextChar();

    if (entry.choices) {
      this._pendingChoices = entry.choices;
    } else {
      this._pendingChoices = null;
    }
  }
  typeNextChar() {
    if (this.charIndex < this.currentText.length) {
      $('dialogText').textContent += this.currentText[this.charIndex];
      this.charIndex++;
      this.typeTimer = setTimeout(() => this.typeNextChar(), 30);
    } else {
      this.typing = false;
      if (this._pendingChoices) {
        this.showChoices(this._pendingChoices);
      } else {
        $('btnDialogNext').style.display = 'block';
      }
    }
  }
  next() {
    if (this.typing) {
      clearTimeout(this.typeTimer);
      $('dialogText').textContent = this.currentText;
      this.typing = false;
      this.charIndex = this.currentText.length;
      if (this._pendingChoices) {
        this.showChoices(this._pendingChoices);
      } else {
        $('btnDialogNext').style.display = 'block';
      }
      return;
    }
    this.showNext();
  }
  showChoices(choices) {
    const container = $('dialogChoices');
    container.innerHTML = '';
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = choice.text;
      btn.addEventListener('click', () => {
        container.innerHTML = '';
        if (choice.callback) choice.callback();
        this.showNext();
      });
      container.appendChild(btn);
    });
  }
  hide() {
    $('dialogOverlay').classList.remove('active');
    $('btnDialogNext').style.display = 'none';
    this.active = false;
    this.typing = false;
    clearTimeout(this.typeTimer);
    if (this.onComplete) {
      const cb = this.onComplete;
      this.onComplete = null;
      cb();
    }
  }
}

// ============================================================
// INVENTORY MANAGER
// ============================================================
class InventoryManager {
  constructor() { this.items = {}; }
  add(itemId, qty = 1) { this.items[itemId] = (this.items[itemId] || 0) + qty; }
  remove(itemId, qty = 1) {
    if (this.items[itemId]) {
      this.items[itemId] -= qty;
      if (this.items[itemId] <= 0) delete this.items[itemId];
    }
  }
  has(itemId, qty = 1) { return (this.items[itemId] || 0) >= qty; }
  getAll() {
    return Object.entries(this.items).map(([id, qty]) => ({ ...ITEMS[id], id, qty })).filter(i => i.name);
  }
  useItem(itemId, target) {
    const item = ITEMS[itemId];
    if (!item) return false;
    if (item.type === 'heal') {
      target.hp = Math.min(target.maxHp, target.hp + (item.hpHeal || 0));
      if (item.spHeal) target.sp = Math.min(target.maxSp, target.sp + item.spHeal);
    } else if (item.type === 'spHeal') {
      target.sp = Math.min(target.maxSp, target.sp + (item.spHeal || 0));
    } else if (item.type === 'cure') {
      target.statusEffects = [];
    }
    this.remove(itemId);
    return true;
  }
}

// ============================================================
// PARTY MANAGER
// ============================================================
class PartyManager {
  constructor() { this.members = []; this.money = 500; }
  addMember(charId, level = 1) {
    const t = CHARACTER_TEMPLATES[charId];
    if (!t) return null;
    const m = {
      id: charId, name: t.name, emoji: t.emoji,
      lv: level, exp: 0,
      hp: t.hp + (level - 1) * 10, maxHp: t.hp + (level - 1) * 10,
      sp: t.sp + (level - 1) * 5,  maxSp: t.sp + (level - 1) * 5,
      atk: t.atk + (level - 1) * 3, def: t.def + (level - 1) * 2, spd: t.spd + (level - 1) * 2,
      element: t.element, skills: [...t.skills],
      learnSkills: t.learnSkills ? { ...t.learnSkills } : {},
      ultimateGauge: 0, statusEffects: [], hasHidden: false
    };
    Object.entries(m.learnSkills).forEach(([lv, sid]) => {
      if (m.lv >= parseInt(lv) && !m.skills.includes(sid)) m.skills.push(sid);
    });
    this.members.push(m);
    return m;
  }
  gainExp(exp) {
    const levelUps = [];
    this.members.forEach(m => {
      if (m.hp <= 0) return;
      m.exp += exp;
      while (m.exp >= m.lv * 100) {
        m.exp -= m.lv * 100;
        m.lv++;
        m.maxHp += 10; m.maxSp += 5;
        m.atk += 3; m.def += 2; m.spd += 2;
        m.hp = m.maxHp; m.sp = m.maxSp;
        const newSkill = m.learnSkills[m.lv];
        if (newSkill && !m.skills.includes(newSkill)) {
          m.skills.push(newSkill);
          levelUps.push({ char: m.name, level: m.lv, skill: SKILLS[newSkill] ? SKILLS[newSkill].name : newSkill });
        } else {
          levelUps.push({ char: m.name, level: m.lv });
        }
      }
    });
    return levelUps;
  }
  isAlive() { return this.members.some(m => m.hp > 0); }
  fullHeal() { this.members.forEach(m => { m.hp = m.maxHp; m.sp = m.maxSp; m.statusEffects = []; }); }
}

// ============================================================
// QUEST MANAGER
// ============================================================
class QuestManager {
  constructor() { this.active = []; this.completed = []; this.progress = {}; }
  accept(questId) {
    if (!this.active.includes(questId) && !this.completed.includes(questId)) {
      this.active.push(questId);
      this.progress[questId] = { count: 0 };
    }
  }
  isActive(questId) { return this.active.includes(questId); }
  isCompleted(questId) { return this.completed.includes(questId); }
  complete(questId) {
    this.active = this.active.filter(q => q !== questId);
    if (!this.completed.includes(questId)) this.completed.push(questId);
  }
  allComplete() { return this.completed.length >= 15; }
  getActiveQuests() { return this.active.map(id => QUEST_DATA.find(q => q.id === id)).filter(Boolean); }
  getCompletedQuests() { return this.completed.map(id => QUEST_DATA.find(q => q.id === id)).filter(Boolean); }
}

// ============================================================
// SHOP SYSTEM
// ============================================================
class ShopSystem {
  constructor(game) { this.game = game; }
  open(chapter) {
    Sound.play('menuSelect');
    this.game.screen.show('shopScreen');
    $('shopKeeper').textContent = SHOP_DATA.keeperDialog[chapter] || 'いらっしゃい！';
    this.renderItems();
    this.updateMoney();
    this.renderInventory();
  }
  renderItems() {
    const container = $('shopItems');
    container.innerHTML = '';
    SHOP_DATA.items.forEach(itemId => {
      const item = ITEMS[itemId];
      if (!item) return;
      const canBuy = this.game.party.money >= item.price;
      const div = document.createElement('div');
      div.className = 'shop-item' + (canBuy ? '' : ' cannot-afford');
      div.innerHTML = `<span>${item.name}</span><span>¥${item.price}</span><span class="item-desc">${item.desc || ''}</span>`;
      const btn = document.createElement('button');
      btn.textContent = '購入';
      btn.disabled = !canBuy;
      btn.addEventListener('click', () => this.buyItem(itemId));
      div.appendChild(btn);
      container.appendChild(div);
    });
  }
  buyItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || this.game.party.money < item.price) return;
    this.game.party.money -= item.price;
    this.game.inventory.add(itemId);
    Sound.play('purchase');
    this.renderItems();
    this.updateMoney();
    this.renderInventory();
  }
  updateMoney() { $('shopMoney').textContent = `所持金: ¥${this.game.party.money}`; }
  renderInventory() {
    const container = $('shopInventory');
    const items = this.game.inventory.getAll();
    container.innerHTML = items.length ? items.map(i => `<div>${i.name} x${i.qty}</div>`).join('') : '<div>アイテムなし</div>';
  }
  close() { Sound.play('menuSelect'); this.game.screen.show('mapScreen'); }
}

// ============================================================
// MAP ENGINE
// ============================================================
class MapEngine {
  constructor(game) {
    this.game = game;
    this.canvas = null; this.ctx = null;
    this.chapter = 1; this.area = 0;
    this.playerX = 0; this.playerY = 0;
    this.steps = 0;
    this.encounterThreshold = rnd(ENCOUNTER_MIN, ENCOUNTER_MAX);
    this.keys = {};
    this.lastMoveTime = 0;
    this.moveDelay = 150;
    this.animFrame = null;
    this.savedTile = null;
  }
  init() {
    this.canvas = $('mapCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    this.startLoop();
  }
  resizeCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth || 640;
      this.canvas.height = container.clientHeight || 480;
    }
  }
  loadMap(chapter, area, px, py) {
    this.chapter = chapter;
    this.area = area;
    const areaData = MAP_DATA[chapter] && MAP_DATA[chapter].areas[area];
    if (!areaData) return;
    this.playerX = px !== undefined ? px : areaData.playerStart.x;
    this.playerY = py !== undefined ? py : areaData.playerStart.y;
    this.steps = 0;
    this.encounterThreshold = rnd(ENCOUNTER_MIN, ENCOUNTER_MAX);
    this.updateHud();
  }
  getCurrentArea() {
    return MAP_DATA[this.chapter] && MAP_DATA[this.chapter].areas[this.area];
  }
  getTile(x, y) {
    const area = this.getCurrentArea();
    if (!area || x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return TILE_WALL;
    return area.tiles[y][x];
  }
  canMove(x, y) { return this.getTile(x, y) !== TILE_WALL; }
  onKeyDown(e) {
    if (this.game.screen.current !== 'mapScreen') return;
    if (this.game.dialog.active) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.game.dialog.next(); }
      return;
    }
    this.keys[e.key] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d',' ','Enter'].includes(e.key)) e.preventDefault();
    if (e.key === ' ' || e.key === 'Enter') this.interact();
  }
  onKeyUp(e) { this.keys[e.key] = false; }
  update() {
    if (this.game.screen.current !== 'mapScreen' || this.game.dialog.active) return;
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) return;
    let dx = 0, dy = 0;
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dy = -1;
    else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dy = 1;
    else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dx = -1;
    else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dx = 1;
    if (dx === 0 && dy === 0) return;
    const nx = this.playerX + dx, ny = this.playerY + dy;
    if (this.canMove(nx, ny)) {
      this.playerX = nx; this.playerY = ny;
      this.lastMoveTime = now;
      this.onStep();
    }
  }
  onStep() {
    this.steps++;
    this.updateHud();
    this.checkTileEvent();
    if (MAP_DATA[this.chapter].encounterAreas.includes(this.area)) {
      if (this.steps >= this.encounterThreshold) {
        this.steps = 0;
        this.encounterThreshold = rnd(ENCOUNTER_MIN, ENCOUNTER_MAX);
        this.game.startRandomBattle();
      }
    }
  }
  checkTileEvent() {
    const tile = this.getTile(this.playerX, this.playerY);
    const area = this.getCurrentArea();
    if (!area) return;
    if (tile === TILE_DOOR) {
      const door = area.doors ? area.doors.find(d => d.x === this.playerX && d.y === this.playerY) : null;
      if (door) {
        if (door.toChapter) {
          // Only go to next chapter if boss is cleared for current chapter
          if (this.game.clearedBosses.includes(this.chapter)) {
            this.game.startChapter(door.toChapter);
          }
        } else {
          this.loadMap(this.chapter, door.toArea, door.toX, door.toY);
        }
      }
    }
    if (tile === TILE_EVENT) {
      const evt = area.events ? area.events.find(e => e.x === this.playerX && e.y === this.playerY) : null;
      if (evt && !this.game.completedEvents.includes(evt.trigger)) {
        this.game.triggerEvent(evt.trigger);
      }
    }
    if (tile === TILE_SAVE) {
      if (!this.savedTile || this.savedTile !== `${this.playerX}_${this.playerY}`) {
        this.savedTile = `${this.playerX}_${this.playerY}`;
        this.game.autoSave();
        this.game.dialog.show([{ speaker: '', text: '💾 セーブポイント：データを保存しました。' }]);
      }
    } else {
      this.savedTile = null;
    }
  }
  interact() {
    const dirs = [{ dx: 0, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
    const area = this.getCurrentArea();
    if (!area) return;
    for (const { dx, dy } of dirs) {
      const tx = this.playerX + dx, ty = this.playerY + dy;
      const tile = this.getTile(tx, ty);
      if (tile === TILE_NPC) {
        const npc = area.npcs ? area.npcs.find(n => n.x === tx && n.y === ty) : null;
        if (npc) {
          const data = NPC_DATA[npc.id];
          if (data) {
            Sound.play('menuSelect');
            this.game.dialog.show(data.dialog.map(t => ({ speaker: data.name, text: t })));
          }
          return;
        }
      }
      if (tile === TILE_QUEST_NPC) {
        const qnpc = area.questNpcs ? area.questNpcs.find(n => n.x === tx && n.y === ty) : null;
        if (qnpc) { this.game.handleQuestNpc(qnpc.id); return; }
      }
      if (tile === TILE_SHOP) {
        this.game.shop.open(this.chapter);
        return;
      }
      if (tile === TILE_CHEST) {
        const chestKey = `${this.chapter}_${this.area}_${tx}_${ty}`;
        if (!this.game.openedChests.includes(chestKey)) {
          const chest = area.chests ? area.chests.find(c => c.x === tx && c.y === ty) : null;
          if (chest) { this.game.openChest(chest, tx, ty); return; }
        }
      }
      if (tile === TILE_BOSS) {
        if (!this.game.clearedBosses.includes(this.chapter)) {
          this.game.startBossBattle();
          return;
        }
      }
    }
  }
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const cw = this.canvas.width, ch = this.canvas.height;
    const camX = this.playerX * TILE_SIZE - cw / 2 + TILE_SIZE / 2;
    const camY = this.playerY * TILE_SIZE - ch / 2 + TILE_SIZE / 2;
    ctx.clearRect(0, 0, cw, ch);
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(-camX, -camY);
    const area = this.getCurrentArea();
    if (!area) { ctx.restore(); return; }
    const sX = Math.max(0, Math.floor(camX / TILE_SIZE));
    const sY = Math.max(0, Math.floor(camY / TILE_SIZE));
    const eX = Math.min(MAP_W, Math.ceil((camX + cw) / TILE_SIZE) + 1);
    const eY = Math.min(MAP_H, Math.ceil((camY + ch) / TILE_SIZE) + 1);
    for (let y = sY; y < eY; y++) {
      for (let x = sX; x < eX; x++) {
        const tile = area.tiles[y] ? area.tiles[y][x] : TILE_WALL;
        const px = x * TILE_SIZE, py = y * TILE_SIZE;
        if (tile === TILE_WALL) {
          ctx.fillStyle = '#2d2d44';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#1a1a2e';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
        } else {
          ctx.fillStyle = '#e8e0d0';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#d0c8b8';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
        }
        ctx.font = `${TILE_SIZE - 6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cx = px + TILE_SIZE / 2, cy = py + TILE_SIZE / 2;
        switch (tile) {
          case TILE_DOOR:
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(px + 4, py + 2, TILE_SIZE - 8, TILE_SIZE - 4);
            ctx.fillText('🚪', cx, cy);
            break;
          case TILE_CHEST: {
            const ck = `${this.chapter}_${this.area}_${x}_${y}`;
            ctx.fillText(this.game.openedChests.includes(ck) ? '📭' : '📦', cx, cy);
            break;
          }
          case TILE_SHOP:
            ctx.fillText('🏪', cx, cy);
            break;
          case TILE_SAVE:
            ctx.fillText('💾', cx, cy);
            break;
          case TILE_BOSS:
            if (!this.game.clearedBosses.includes(this.chapter)) ctx.fillText('💀', cx, cy);
            break;
        }
      }
    }
    // NPCs
    if (area.npcs) {
      area.npcs.forEach(npc => {
        const data = NPC_DATA[npc.id];
        if (!data) return;
        const px = npc.x * TILE_SIZE, py = npc.y * TILE_SIZE;
        ctx.font = `${TILE_SIZE - 6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.emoji, px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(data.name, px + TILE_SIZE / 2, py - 2);
      });
    }
    // Quest NPCs
    if (area.questNpcs) {
      area.questNpcs.forEach(qnpc => {
        const quest = QUEST_DATA.find(q => q.id === qnpc.id);
        if (!quest) return;
        const npcData = NPC_DATA[quest.giver];
        const px = qnpc.x * TILE_SIZE, py = qnpc.y * TILE_SIZE;
        ctx.font = `${TILE_SIZE - 6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(npcData ? npcData.emoji : '👤', px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        ctx.font = '14px sans-serif';
        if (this.game.quests.isCompleted(qnpc.id)) {
          ctx.fillText('😊', px + TILE_SIZE / 2, py - 6);
        } else if (this.game.quests.isActive(qnpc.id)) {
          ctx.fillStyle = '#FFD700';
          ctx.fillText('❓', px + TILE_SIZE / 2, py - 6);
        } else {
          ctx.fillStyle = '#FF4444';
          ctx.fillText('❗', px + TILE_SIZE / 2, py - 6);
        }
      });
    }
    // Player
    ctx.font = `${TILE_SIZE - 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const leader = this.game.party.members[0];
    ctx.fillText(leader ? leader.emoji : '🧑‍💼', this.playerX * TILE_SIZE + TILE_SIZE / 2, this.playerY * TILE_SIZE + TILE_SIZE / 2);
    ctx.restore();
  }
  startLoop() {
    const loop = () => {
      this.update();
      this.render();
      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }
  updateHud() {
    const leader = this.game.party.members[0];
    if (leader) {
      $('hudHp').textContent = `HP:${leader.hp}/${leader.maxHp}`;
      $('hudSp').textContent = `SP:${leader.sp}/${leader.maxSp}`;
    }
    $('hudMoney').textContent = `¥${this.game.party.money}`;
    $('hudChapter').textContent = `第${this.chapter}章`;
  }
}

// ============================================================
// BATTLE SYSTEM
// ============================================================
class BattleSystem {
  constructor(game) {
    this.game = game;
    this.enemies = [];
    this.turnOrder = [];
    this.currentTurn = 0;
    this.isPlayerTurn = false;
    this.currentActor = null;
    this.selectedCommand = null;
    this.selectedSkill = null;
    this.selectedItem = null;
    this.isBoss = false;
    this.battleActive = false;
    this.logs = [];
  }
  start(enemyIds, isBoss = false) {
    this.isBoss = isBoss;
    this.battleActive = true;
    this.logs = [];
    this.turnOrder = [];
    this.currentTurn = 999;
    this.enemies = enemyIds.map((id, i) => {
      const t = deepClone(ENEMIES[id]);
      return { ...t, templateId: id, maxHp: t.hp, maxSp: t.sp || 20, statusEffects: [], isEnemy: true };
    });
    this.game.screen.show('battleScreen');
    this.renderEnemies();
    this.renderParty();
    this.hideAllPanels();
    $('battleCommands').style.display = 'none';
    $('battleLog').innerHTML = '';
    if (isBoss && this.enemies[0] && this.enemies[0].intro) {
      Sound.play('bossBattle');
      this.addLog(this.enemies[0].intro);
    } else {
      this.addLog('モンスターが現れた！');
    }
    setTimeout(() => this.nextTurn(), 800);
  }
  calculateTurnOrder() {
    const combatants = [];
    this.game.party.members.forEach(m => {
      if (m.hp > 0) combatants.push({ actor: m, spd: this.getEffStat(m, 'spd'), isEnemy: false });
    });
    this.enemies.forEach(e => {
      if (e.hp > 0) combatants.push({ actor: e, spd: this.getEffStat(e, 'spd'), isEnemy: true });
    });
    combatants.sort((a, b) => b.spd - a.spd + (Math.random() - 0.5));
    this.turnOrder = combatants;
    this.currentTurn = 0;
  }
  getEffStat(actor, stat) {
    let base = actor[stat] || 0;
    if (actor.statusEffects) {
      actor.statusEffects.forEach(eff => {
        if (eff.stat === stat) base = Math.floor(base * eff.multiplier);
      });
    }
    return Math.max(1, base);
  }
  nextTurn() {
    if (!this.battleActive) return;
    if (this.enemies.every(e => e.hp <= 0)) { this.victory(); return; }
    if (!this.game.party.isAlive()) { this.defeat(); return; }
    if (this.currentTurn >= this.turnOrder.length) {
      this.calculateTurnOrder();
      this.tickStatusEffects();
    }
    if (this.turnOrder.length === 0) { this.calculateTurnOrder(); }
    const current = this.turnOrder[this.currentTurn];
    this.currentTurn++;
    if (!current || current.actor.hp <= 0) { this.nextTurn(); return; }
    this.currentActor = current;
    // Sleep check
    if (this.hasStatus(current.actor, '眠気')) {
      this.addLog(`${current.actor.name}は眠っている…`);
      setTimeout(() => this.nextTurn(), 600);
      return;
    }
    // Bug check for player characters
    if (!current.isEnemy && this.hasStatus(current.actor, 'バグ')) {
      this.addLog(`${current.actor.name}はバグの影響で混乱！`);
      this.executeBugAction(current.actor);
      return;
    }
    if (current.isEnemy) {
      this.enemyTurn(current.actor);
    } else {
      this.playerTurn(current.actor);
    }
  }
  playerTurn(actor) {
    this.isPlayerTurn = true;
    this.renderParty();
    this.showCommands(actor);
  }
  showCommands(actor) {
    $('battleCommands').style.display = 'flex';
    this.hideAllPanels();
    $('btnUltimate').style.display = (actor.ultimateGauge || 0) >= 100 ? 'inline-block' : 'none';
    $('ultimateGaugeBar').style.width = `${actor.ultimateGauge || 0}%`;
  }
  onAttack() {
    if (!this.isPlayerTurn) return;
    this.selectedCommand = 'attack';
    this.showTargetList(this.enemies.filter(e => e.hp > 0), 'enemy');
  }
  onSkill() {
    if (!this.isPlayerTurn) return;
    this.selectedCommand = 'skill';
    const actor = this.currentActor.actor;
    const panel = $('skillList');
    panel.style.display = 'block';
    panel.innerHTML = '';
    const available = actor.skills.filter(sid => {
      const s = SKILLS[sid];
      return s && !s.isUltimate && !s.isHidden;
    });
    available.forEach(sid => {
      const skill = SKILLS[sid];
      let cost = skill.spCost || 0;
      if (this.hasStatus(actor, 'オープンソース')) cost = Math.floor(cost / 2);
      const canUse = actor.sp >= cost;
      const btn = document.createElement('button');
      btn.textContent = `${skill.name} (SP:${cost})`;
      btn.disabled = !canUse;
      btn.addEventListener('click', () => {
        this.selectedSkill = sid;
        panel.style.display = 'none';
        if (skill.target === 'all') {
          this.executePlayerSkill(actor, sid, null);
        } else if (skill.target === 'allAlly' || skill.target === 'self') {
          this.executePlayerSkill(actor, sid, null);
        } else if (skill.target === 'ally') {
          this.showTargetList(this.game.party.members.filter(m => m.hp > 0), 'ally');
        } else {
          this.showTargetList(this.enemies.filter(e => e.hp > 0), 'enemy');
        }
      });
      panel.appendChild(btn);
    });
    if (actor.hasHidden) {
      const hid = `hidden_${actor.id}`;
      const hs = SKILLS[hid];
      if (hs) {
        const btn = document.createElement('button');
        btn.textContent = `${hs.name} ★`;
        btn.className = 'hidden-skill-btn';
        btn.addEventListener('click', () => {
          this.selectedSkill = hid;
          panel.style.display = 'none';
          this.executePlayerSkill(actor, hid, null);
        });
        panel.appendChild(btn);
      }
    }
    const cb = document.createElement('button');
    cb.textContent = '戻る';
    cb.addEventListener('click', () => { panel.style.display = 'none'; });
    panel.appendChild(cb);
  }
  onItem() {
    if (!this.isPlayerTurn) return;
    this.selectedCommand = 'item';
    const panel = $('itemList');
    panel.style.display = 'block';
    panel.innerHTML = '';
    const items = this.game.inventory.getAll();
    if (items.length === 0) {
      panel.innerHTML = '<p>アイテムなし</p>';
    } else {
      items.forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = `${item.name} x${item.qty}`;
        btn.addEventListener('click', () => {
          this.selectedItem = item.id;
          panel.style.display = 'none';
          this.showTargetList(this.game.party.members.filter(m => m.hp > 0), 'ally');
        });
        panel.appendChild(btn);
      });
    }
    const cb = document.createElement('button');
    cb.textContent = '戻る';
    cb.addEventListener('click', () => { panel.style.display = 'none'; });
    panel.appendChild(cb);
  }
  onRun() {
    if (!this.isPlayerTurn) return;
    if (this.isBoss) { this.addLog('ボス戦からは逃げられない！'); return; }
    const actor = this.currentActor.actor;
    const avgSpd = this.enemies.reduce((s, e) => s + e.spd, 0) / this.enemies.length;
    const chance = clamp(50 + (actor.spd - avgSpd) * 5, 20, 90);
    if (rnd(1, 100) <= chance) {
      this.addLog('逃走に成功した！');
      this.battleActive = false;
      setTimeout(() => this.game.screen.show('mapScreen'), 800);
    } else {
      this.addLog('逃げられなかった！');
      this.isPlayerTurn = false;
      $('battleCommands').style.display = 'none';
      setTimeout(() => this.nextTurn(), 600);
    }
  }
  onUltimate() {
    if (!this.isPlayerTurn) return;
    const actor = this.currentActor.actor;
    if ((actor.ultimateGauge || 0) < 100) return;
    const ultId = `ultimate_${actor.id}`;
    const skill = SKILLS[ultId];
    if (!skill) return;
    actor.ultimateGauge = 0;
    this.addLog(`✨ ${actor.name}の必殺技！${skill.name}！✨`);
    if (skill.target === 'single') {
      this.selectedSkill = ultId;
      this.selectedCommand = 'skill';
      this.showTargetList(this.enemies.filter(e => e.hp > 0), 'enemy');
    } else {
      this.executePlayerSkill(actor, ultId, null);
    }
  }
  showTargetList(targets, type) {
    const panel = $('targetList');
    panel.style.display = 'block';
    panel.innerHTML = '';
    targets.forEach(target => {
      const btn = document.createElement('button');
      btn.textContent = `${target.emoji || ''} ${target.name} HP:${target.hp}/${target.maxHp}`;
      btn.addEventListener('click', () => {
        panel.style.display = 'none';
        $('battleCommands').style.display = 'none';
        this.isPlayerTurn = false;
        if (this.selectedCommand === 'attack') {
          this.executeAttack(this.currentActor.actor, target);
        } else if (this.selectedCommand === 'skill') {
          this.executePlayerSkill(this.currentActor.actor, this.selectedSkill, target);
        } else if (this.selectedCommand === 'item') {
          this.executeItemBattle(this.currentActor.actor, this.selectedItem, target);
        }
      });
      panel.appendChild(btn);
    });
    const cb = document.createElement('button');
    cb.textContent = '戻る';
    cb.addEventListener('click', () => { panel.style.display = 'none'; });
    panel.appendChild(cb);
  }
  executeAttack(actor, target) {
    const atk = this.getEffStat(actor, 'atk');
    const def = this.getEffStat(target, 'def');
    let dmg = Math.max(1, Math.floor(atk * 1.0 - def / 2 + rnd(-3, 3)));
    if (actor.element && target.element && ELEMENT_MAP[actor.element]) {
      if (ELEMENT_MAP[actor.element].strong === target.element) dmg = Math.floor(dmg * 1.5);
      else if (ELEMENT_MAP[actor.element].weak === target.element) dmg = Math.floor(dmg * 0.75);
    }
    dmg = Math.max(1, dmg);
    target.hp = Math.max(0, target.hp - dmg);
    actor.ultimateGauge = Math.min(100, (actor.ultimateGauge || 0) + 10);
    Sound.play('attack');
    this.addLog(`${actor.name}の攻撃！${target.name}に${dmg}ダメージ！`);
    if (target.hp <= 0) this.addLog(`${target.name}を倒した！`);
    this.renderEnemies(); this.renderParty();
    setTimeout(() => this.nextTurn(), 600);
  }
  executePlayerSkill(actor, skillId, target) {
    const skill = SKILLS[skillId];
    if (!skill) { this.nextTurn(); return; }
    let cost = skill.spCost || 0;
    if (!skill.isUltimate && this.hasStatus(actor, 'オープンソース')) cost = Math.floor(cost / 2);
    if (!skill.isUltimate) actor.sp = Math.max(0, actor.sp - cost);
    $('battleCommands').style.display = 'none';
    this.isPlayerTurn = false;
    if (!skill.isUltimate) this.addLog(`${actor.name}は${skill.name}を使った！`);
    Sound.play('attack');
    if (skill.type === 'heal') {
      let targets = skill.target === 'allAlly' ? this.game.party.members.filter(m => m.hp > 0) : (target ? [target] : [actor]);
      targets.forEach(t => {
        if (skill.healPercent) {
          const hh = Math.floor(t.maxHp * skill.healPercent / 100);
          const sh = Math.floor(t.maxSp * (skill.spHealPercent || 0) / 100);
          t.hp = Math.min(t.maxHp, t.hp + hh);
          t.sp = Math.min(t.maxSp, t.sp + sh);
          this.addLog(`${t.name}のHP${hh}、SP${sh}回復！`);
        }
      });
      Sound.play('heal');
    } else if (skill.type === 'buff') {
      let targets = skill.target === 'allAlly' ? this.game.party.members.filter(m => m.hp > 0) : (skill.target === 'self' ? [actor] : (target ? [target] : [actor]));
      targets.forEach(t => {
        t.statusEffects.push({
          name: skill.buffName || 'やる気',
          stat: skill.buffStat,
          multiplier: skill.buffMultiplier || 1.3,
          turns: skill.buffTurns || 3
        });
      });
      const statName = skill.buffStat === 'atk' ? '攻撃力' : skill.buffStat === 'def' ? '防御力' : skill.buffStat === 'spd' ? 'スピード' : skill.buffStat;
      this.addLog(`${statName}が上がった！`);
      Sound.play('heal');
    } else if (skill.type === 'debuff') {
      let targets = skill.target === 'all' ? this.enemies.filter(e => e.hp > 0) : (target ? [target] : [this.enemies.find(e => e.hp > 0)]);
      targets = targets.filter(Boolean);
      targets.forEach(t => {
        t.statusEffects.push({
          name: '疲労', stat: skill.debuffStat || 'atk',
          multiplier: skill.debuffMultiplier || 0.7, turns: skill.debuffTurns || 3
        });
      });
      this.addLog('敵の能力が下がった！');
    } else {
      // Damage skill
      const atk = this.getEffStat(actor, 'atk');
      const hits = skill.hits || 1;
      let targets;
      if (skill.target === 'all') targets = this.enemies.filter(e => e.hp > 0);
      else targets = target ? [target] : [this.enemies.find(e => e.hp > 0)];
      targets = targets.filter(Boolean);
      for (let h = 0; h < hits; h++) {
        targets.forEach(t => {
          if (t.hp <= 0) return;
          const def = this.getEffStat(t, 'def');
          let dmg = Math.max(1, Math.floor(atk * (skill.power || 1) - def / 2 + rnd(-3, 3)));
          const el = skill.element || actor.element;
          if (el && t.element && ELEMENT_MAP[el]) {
            if (ELEMENT_MAP[el].strong === t.element) { dmg = Math.floor(dmg * 1.5); if (h === 0) this.addLog('効果は抜群だ！'); }
            else if (ELEMENT_MAP[el].weak === t.element) { dmg = Math.floor(dmg * 0.75); if (h === 0) this.addLog('効果はいまひとつ…'); }
          }
          dmg = Math.max(1, dmg);
          t.hp = Math.max(0, t.hp - dmg);
          Sound.play('damage');
          this.addLog(`${t.name}に${dmg}ダメージ！`);
          if (t.hp <= 0) this.addLog(`${t.name}を倒した！`);
        });
      }
      if (skill.inflicts) {
        targets.forEach(t => { if (t.hp > 0) this.applyStatus(t, skill.inflicts); });
      }
      actor.ultimateGauge = Math.min(100, (actor.ultimateGauge || 0) + 10);
    }
    // Special skill post-effects
    if (skillId === 'ultimate_takeru') {
      const hh = Math.floor(actor.maxHp * 0.3);
      actor.hp = Math.min(actor.maxHp, actor.hp + hh);
      this.addLog(`${actor.name}のHPが${hh}回復！`);
    }
    if (skillId === 'ultimate_mike') {
      this.game.party.members.forEach(m => {
        if (m.hp > 0) m.statusEffects.push({ name: 'やる気', stat: 'spd', multiplier: 1.3, turns: 3 });
      });
      this.addLog('味方全員のスピードが上がった！');
    }
    if (skill.partyBuff) {
      this.game.party.members.forEach(m => {
        if (m.hp > 0) m.statusEffects.push({ name: 'バフ', stat: skill.partyBuff.stat, multiplier: skill.partyBuff.multiplier, turns: skill.partyBuff.turns });
      });
      this.addLog(`味方全員の${skill.partyBuff.stat === 'def' ? '防御力' : '能力'}が上がった！`);
    }
    this.renderEnemies(); this.renderParty();
    setTimeout(() => this.nextTurn(), 800);
  }
  executeItemBattle(actor, itemId, target) {
    const item = ITEMS[itemId];
    if (!item) { this.nextTurn(); return; }
    $('battleCommands').style.display = 'none';
    this.isPlayerTurn = false;
    this.addLog(`${actor.name}は${item.name}を使った！`);
    if (item.type === 'battleBuff') {
      target.statusEffects.push({ name: item.name, stat: item.stat, multiplier: item.multiplier, turns: item.turns });
      this.addLog(`${target.name}の${item.stat === 'atk' ? '攻撃力' : 'スピード'}が上がった！`);
      this.game.inventory.remove(itemId);
    } else {
      this.game.inventory.useItem(itemId, target);
      Sound.play('heal');
      this.addLog(`${target.name}を回復した！`);
    }
    this.renderParty();
    setTimeout(() => this.nextTurn(), 600);
  }
  enemyTurn(enemy) {
    const living = this.game.party.members.filter(m => m.hp > 0);
    if (living.length === 0) { this.defeat(); return; }
    if (enemy.changesType) {
      const types = ['physical', 'nature', 'digital'];
      enemy.element = types[rnd(0, 2)];
    }
    const skills = enemy.skills || ['basic_attack'];
    let skillId;
    // Boss AI: heal when low
    if (enemy.isBoss && enemy.hp < enemy.maxHp * 0.3) {
      const heal = skills.find(s => ENEMY_SKILLS[s] && ENEMY_SKILLS[s].type === 'heal');
      if (heal && rnd(1, 3) === 1) skillId = heal;
    }
    if (!skillId) skillId = skills[rnd(0, skills.length - 1)];
    const skill = ENEMY_SKILLS[skillId] || ENEMY_SKILLS['basic_attack'];
    this.addLog(`${enemy.name}の${skill.name}！`);
    if (skill.type === 'heal') {
      const amt = Math.floor(enemy.maxHp * (skill.healPercent || 10) / 100);
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + amt);
      this.addLog(`HPが${amt}回復！`);
    } else if (skill.type === 'debuff') {
      const targets = skill.target === 'all' ? living : [living[rnd(0, living.length - 1)]];
      targets.forEach(t => {
        t.statusEffects.push({ name: '疲労', stat: skill.stat || 'atk', multiplier: skill.multiplier || 0.7, turns: skill.turns || 3 });
      });
      this.addLog('味方の能力が下がった！');
    } else if (skill.type === 'special') {
      this.addLog(`${enemy.name}は属性を変換した！(${ELEMENT_NAMES[enemy.element] || '???'})`);
    } else {
      // Damage
      const atk = this.getEffStat(enemy, 'atk');
      const hits = skill.hits || 1;
      let targets = skill.target === 'all' ? living : [living[rnd(0, living.length - 1)]];
      Sound.play('attack');
      for (let h = 0; h < hits; h++) {
        targets.forEach(t => {
          if (t.hp <= 0) return;
          const def = this.getEffStat(t, 'def');
          let dmg = Math.max(1, Math.floor(atk * (skill.power || 1) - def / 2 + rnd(-3, 3)));
          const el = skill.element || enemy.element;
          if (el && t.element && ELEMENT_MAP[el]) {
            if (ELEMENT_MAP[el].strong === t.element) dmg = Math.floor(dmg * 1.5);
            else if (ELEMENT_MAP[el].weak === t.element) dmg = Math.floor(dmg * 0.75);
          }
          dmg = Math.max(1, dmg);
          t.hp = Math.max(0, t.hp - dmg);
          t.ultimateGauge = Math.min(100, (t.ultimateGauge || 0) + 15);
          Sound.play('damage');
          this.addLog(`${t.name}に${dmg}ダメージ！`);
          this.removeStatus(t, '眠気');
          if (t.hp <= 0) this.addLog(`${t.name}は倒れた…`);
        });
      }
      if (skill.inflicts) {
        targets.forEach(t => { if (t.hp > 0) this.applyStatus(t, skill.inflicts); });
      }
    }
    this.renderEnemies(); this.renderParty();
    setTimeout(() => this.nextTurn(), 800);
  }
  applyStatus(target, name) {
    if (this.hasStatus(target, name)) return;
    let eff;
    switch (name) {
      case '疲労': eff = { name: '疲労', stat: 'atk', multiplier: 0.7, turns: 3 }; break;
      case '眠気': eff = { name: '眠気', stat: 'none', multiplier: 1, turns: 3 }; break;
      case 'やる気': eff = { name: 'やる気', stat: 'atk', multiplier: 1.3, turns: 3 }; break;
      case 'バグ': eff = { name: 'バグ', stat: 'none', multiplier: 1, turns: 3 }; break;
      default: return;
    }
    target.statusEffects.push(eff);
    this.addLog(`${target.name}は「${name}」状態になった！`);
  }
  hasStatus(actor, name) { return actor.statusEffects && actor.statusEffects.some(e => e.name === name); }
  removeStatus(actor, name) { if (actor.statusEffects) actor.statusEffects = actor.statusEffects.filter(e => e.name !== name); }
  tickStatusEffects() {
    [...this.game.party.members, ...this.enemies].forEach(actor => {
      if (!actor.statusEffects) return;
      actor.statusEffects.forEach(eff => eff.turns--);
      const expired = actor.statusEffects.filter(e => e.turns <= 0);
      expired.forEach(e => this.addLog(`${actor.name}の「${e.name}」が切れた。`));
      actor.statusEffects = actor.statusEffects.filter(e => e.turns > 0);
    });
  }
  executeBugAction(actor) {
    const living = this.game.party.members.filter(m => m.hp > 0);
    const enemies = this.enemies.filter(e => e.hp > 0);
    const act = rnd(0, 3);
    if (act === 0 && living.length > 0) {
      const t = living[rnd(0, living.length - 1)];
      const dmg = Math.max(1, Math.floor(actor.atk * 0.5 + rnd(-2, 2)));
      t.hp = Math.max(0, t.hp - dmg);
      this.addLog(`${actor.name}は味方を攻撃！${t.name}に${dmg}ダメージ！`);
    } else if (act === 1 && enemies.length > 0) {
      const t = enemies[rnd(0, enemies.length - 1)];
      const dmg = Math.max(1, Math.floor(actor.atk - t.def / 2 + rnd(-3, 3)));
      t.hp = Math.max(0, t.hp - dmg);
      this.addLog(`${actor.name}は敵を攻撃！${t.name}に${dmg}ダメージ！`);
      if (t.hp <= 0) this.addLog(`${t.name}を倒した！`);
    } else if (act === 2 && enemies.length > 0) {
      const t = enemies[rnd(0, enemies.length - 1)];
      t.hp = Math.min(t.maxHp, t.hp + rnd(5, 15));
      this.addLog(`${actor.name}は敵を回復してしまった！`);
    } else {
      this.addLog(`${actor.name}はぼーっとしている…`);
    }
    this.renderEnemies(); this.renderParty();
    setTimeout(() => this.nextTurn(), 600);
  }
  victory() {
    this.battleActive = false;
    Sound.play('levelUp');
    let totalExp = 0, totalMoney = 0;
    this.enemies.forEach(e => {
      totalExp += e.exp || 0;
      totalMoney += e.money || 0;
    });
    this.game.party.money += totalMoney;
    const lvUps = this.game.party.gainExp(totalExp);
    const panel = $('battleResult');
    panel.style.display = 'block';
    panel.innerHTML = `
      <h3>🎉 勝利！</h3>
      <p>獲得EXP: ${totalExp}</p>
      <p>獲得: ¥${totalMoney}</p>
      ${lvUps.map(lu => `<p>🎊 ${lu.char}がLv${lu.level}に！${lu.skill ? `「${lu.skill}」習得！` : ''}</p>`).join('')}
      <button id="btnEndBattle">OK</button>
    `;
    $('btnEndBattle').addEventListener('click', () => Game.endBattle());
    if (lvUps.length > 0) Sound.play('levelUp');
  }
  defeat() {
    this.battleActive = false;
    this.game.gameOver();
  }
  renderEnemies() {
    const c = $('battleEnemies');
    c.innerHTML = '';
    this.enemies.forEach(e => {
      const div = document.createElement('div');
      div.className = 'enemy-unit' + (e.hp <= 0 ? ' defeated' : '');
      const hpPct = Math.max(0, (e.hp / e.maxHp) * 100);
      div.innerHTML = `
        <div class="unit-emoji">${e.hp > 0 ? (e.emoji || '👾') : '💀'}</div>
        <div class="unit-name">${e.name}</div>
        <div class="bar-container"><div class="bar-fill hp-fill" style="width:${hpPct}%"></div></div>
        <div class="unit-stat">HP:${e.hp}/${e.maxHp}</div>
        ${e.statusEffects.length ? `<div class="unit-status">${e.statusEffects.map(s => s.name).join(' ')}</div>` : ''}
      `;
      c.appendChild(div);
    });
  }
  renderParty() {
    const c = $('battleParty');
    c.innerHTML = '';
    this.game.party.members.forEach(m => {
      const active = this.currentActor && this.currentActor.actor === m && this.isPlayerTurn;
      const div = document.createElement('div');
      div.className = 'party-unit' + (m.hp <= 0 ? ' defeated' : '') + (active ? ' active-turn' : '');
      const hpPct = Math.max(0, (m.hp / m.maxHp) * 100);
      const spPct = Math.max(0, (m.sp / m.maxSp) * 100);
      div.innerHTML = `
        <div class="unit-emoji">${m.emoji}</div>
        <div class="unit-name">${m.name} Lv${m.lv}</div>
        <div class="bar-container"><div class="bar-fill hp-fill" style="width:${hpPct}%"></div></div>
        <div class="unit-stat">HP:${m.hp}/${m.maxHp}</div>
        <div class="bar-container"><div class="bar-fill sp-fill" style="width:${spPct}%"></div></div>
        <div class="unit-stat">SP:${m.sp}/${m.maxSp}</div>
        <div class="unit-stat">ULT:${m.ultimateGauge || 0}%</div>
        ${m.statusEffects.length ? `<div class="unit-status">${m.statusEffects.map(s => s.name).join(' ')}</div>` : ''}
      `;
      c.appendChild(div);
    });
  }
  addLog(text) {
    this.logs.push(text);
    const el = $('battleLog');
    el.innerHTML = this.logs.slice(-6).map(l => `<p>${l}</p>`).join('');
    el.scrollTop = el.scrollHeight;
  }
  hideAllPanels() {
    ['skillList', 'itemList', 'targetList', 'battleResult'].forEach(id => { const el = $(id); if (el) el.style.display = 'none'; });
  }
}

// ============================================================
// ANIMATION MANAGER
// ============================================================
class AnimationManager {
  static flash(el, color = '#fff', dur = 200) {
    if (!el) return;
    el.style.transition = `background-color ${dur}ms`;
    el.style.backgroundColor = color;
    setTimeout(() => { el.style.backgroundColor = ''; }, dur);
  }
  static shake(el, intensity = 5, dur = 300) {
    if (!el) return;
    el.style.transition = `transform 50ms`;
    el.style.transform = `translateX(${intensity}px)`;
    setTimeout(() => { el.style.transform = `translateX(-${intensity}px)`; }, dur / 4);
    setTimeout(() => { el.style.transform = ''; }, dur);
  }
}

// ============================================================
// GAME MANAGER
// ============================================================
class GameManager {
  constructor() {
    this.screen = new ScreenManager();
    this.dialog = new DialogSystem();
    this.party = new PartyManager();
    this.inventory = new InventoryManager();
    this.quests = new QuestManager();
    this.map = new MapEngine(this);
    this.battle = new BattleSystem(this);
    this.shop = new ShopSystem(this);
    this.chapter = 1;
    this.completedEvents = [];
    this.openedChests = [];
    this.clearedBosses = [];
    this.clearedChapters = [];
    this.gameCleared = false;
  }
  init() {
    Sound.init();
    this.map.init();
    this.setupEventListeners();
    this.screen.show('titleScreen');
    $('btnContinue').style.display = SaveManager.hasSave() ? 'inline-block' : 'none';
  }
  setupEventListeners() {
    $('btnNewGame').addEventListener('click', () => this.newGame());
    $('btnContinue').addEventListener('click', () => this.continueGame());
    $('btnHowTo').addEventListener('click', () => { Sound.play('menuSelect'); this.screen.show('howToScreen'); });
    $('btnBackTitle').addEventListener('click', () => { Sound.play('menuSelect'); this.screen.show('titleScreen'); });
    $('btnMenu').addEventListener('click', () => this.openMenu());
    $('btnInteract').addEventListener('click', () => this.map.interact());
    $('btnDialogNext').addEventListener('click', () => this.dialog.next());
    $('btnAttack').addEventListener('click', () => this.battle.onAttack());
    $('btnSkill').addEventListener('click', () => this.battle.onSkill());
    $('btnItem').addEventListener('click', () => this.battle.onItem());
    $('btnRun').addEventListener('click', () => this.battle.onRun());
    $('btnUltimate').addEventListener('click', () => this.battle.onUltimate());
    $('btnShopClose').addEventListener('click', () => this.shop.close());
    $('tabStatus').addEventListener('click', () => this.showMenuTab('status'));
    $('tabItems').addEventListener('click', () => this.showMenuTab('items'));
    $('tabQuests').addEventListener('click', () => this.showMenuTab('quests'));
    $('tabSave').addEventListener('click', () => this.manualSave());
    $('btnMenuClose').addEventListener('click', () => this.closeMenu());
    $('btnRetry').addEventListener('click', () => this.retry());
    $('btnBackToTitle').addEventListener('click', () => { Sound.play('menuSelect'); this.screen.show('titleScreen'); });
  }
  newGame() {
    Sound.play('menuSelect');
    this.chapter = 1;
    this.completedEvents = [];
    this.openedChests = [];
    this.clearedBosses = [];
    this.clearedChapters = [];
    this.gameCleared = false;
    this.party = new PartyManager();
    this.inventory = new InventoryManager();
    this.quests = new QuestManager();
    this.battle = new BattleSystem(this);
    this.party.addMember('takeru', 1);
    this.inventory.add('onigiri_ume', 3);
    this.startChapter(1);
  }
  continueGame() {
    Sound.play('menuSelect');
    const save = SaveManager.load();
    if (!save) return;
    this.chapter = save.chapter || 1;
    this.completedEvents = save.completedEvents || [];
    this.openedChests = save.openedChests || [];
    this.clearedBosses = save.clearedBosses || [];
    this.clearedChapters = save.clearedChapters || [];
    this.gameCleared = save.gameCleared || false;
    this.party = new PartyManager();
    this.party.money = save.money || 500;
    this.party.members = save.party || [];
    // Restore statusEffects arrays
    this.party.members.forEach(m => { if (!m.statusEffects) m.statusEffects = []; });
    this.inventory = new InventoryManager();
    this.inventory.items = save.inventory || {};
    this.quests = new QuestManager();
    this.quests.active = save.questsActive || [];
    this.quests.completed = save.questsCompleted || [];
    this.battle = new BattleSystem(this);
    this.screen.show('mapScreen');
    this.map.loadMap(save.chapter || 1, save.area || 0, save.playerX, save.playerY);
  }
  startChapter(chapterNum) {
    this.chapter = chapterNum;
    const mapData = MAP_DATA[chapterNum];
    if (!mapData) { this.endGame(); return; }
    // Akane joins at start of chapter 4
    if (chapterNum === 4 && !this.party.members.find(m => m.id === 'akane')) {
      const avgLv = Math.max(12, Math.floor(this.party.members.reduce((s, m) => s + m.lv, 0) / this.party.members.length));
      this.party.addMember('akane', avgLv);
    }
    this.screen.show('mapScreen');
    this.map.loadMap(chapterNum, 0);
    // Chapter intro events
    const introKey = chapterNum === 1 ? 'ch1_wakeup' : `ch${chapterNum}_intro`;
    if (STORY_DATA[introKey] && !this.completedEvents.includes(introKey)) {
      this.triggerEvent(introKey);
    }
  }
  triggerEvent(eventId) {
    if (this.completedEvents.includes(eventId)) return;
    this.completedEvents.push(eventId);
    const dialog = STORY_DATA[eventId];
    if (dialog) {
      this.dialog.show(dialog, () => this.onEventComplete(eventId));
    }
  }
  onEventComplete(eventId) {
    if (eventId === 'ch2_mike_meet') {
      if (!this.party.members.find(m => m.id === 'mike')) {
        const avgLv = Math.max(6, Math.floor(this.party.members.reduce((s, m) => s + m.lv, 0) / this.party.members.length));
        this.party.addMember('mike', avgLv);
      }
    }
    if (eventId === 'ending_all_quests') {
      this.party.members.forEach(m => {
        m.atk += 5; m.def += 5; m.spd += 5;
        m.maxHp += 5; m.maxSp += 5;
        m.hp = Math.min(m.hp + 5, m.maxHp);
        m.sp = Math.min(m.sp + 5, m.maxSp);
        m.hasHidden = true;
      });
    }
    this.map.updateHud();
  }
  startRandomBattle() {
    const enemyList = MAP_DATA[this.chapter].enemies;
    if (!enemyList || enemyList.length === 0) return;
    const count = rnd(1, Math.min(3, enemyList.length));
    const enemies = [];
    for (let i = 0; i < count; i++) enemies.push(enemyList[rnd(0, enemyList.length - 1)]);
    this.battle.start(enemies, false);
  }
  startBossBattle() {
    const bossId = MAP_DATA[this.chapter].boss;
    if (!bossId) return;
    const introKey = `ch${this.chapter}_boss_intro`;
    if (STORY_DATA[introKey] && !this.completedEvents.includes(introKey)) {
      this.completedEvents.push(introKey);
      this.dialog.show(STORY_DATA[introKey], () => this.battle.start([bossId], true));
    } else {
      this.battle.start([bossId], true);
    }
  }
  endBattle() {
    if (this.battle.isBoss && !this.clearedBosses.includes(this.chapter)) {
      this.clearedBosses.push(this.chapter);
      const victKey = `ch${this.chapter}_boss_victory`;
      this.screen.show('mapScreen');
      this.map.updateHud();
      if (STORY_DATA[victKey]) {
        this.dialog.show(STORY_DATA[victKey], () => {
          if (this.chapter === 2 && !this.completedEvents.includes('ch2_mike_meet')) {
            this.triggerEvent('ch2_mike_meet');
          }
          if (this.chapter === 5) {
            this.endGame();
          } else {
            if (!this.clearedChapters.includes(this.chapter)) this.clearedChapters.push(this.chapter);
            this.autoSave();
          }
        });
      } else {
        if (this.chapter === 5) { this.endGame(); }
        else {
          if (!this.clearedChapters.includes(this.chapter)) this.clearedChapters.push(this.chapter);
          this.autoSave();
        }
      }
    } else {
      this.screen.show('mapScreen');
      this.map.updateHud();
    }
  }
  endGame() {
    this.gameCleared = true;
    if (this.quests.allComplete() && !this.completedEvents.includes('ending_all_quests')) {
      this.triggerEvent('ending_all_quests');
    }
    const endDialog = STORY_DATA['ch5_boss_victory'];
    if (endDialog && !this.completedEvents.includes('game_end_shown')) {
      this.completedEvents.push('game_end_shown');
      this.dialog.show(endDialog, () => this.screen.show('titleScreen'));
    } else {
      this.screen.show('titleScreen');
    }
  }
  openChest(chest, x, y) {
    const key = `${this.chapter}_${this.map.area}_${x}_${y}`;
    this.openedChests.push(key);
    Sound.play('questComplete');
    const msgs = [];
    if (chest.content) {
      const item = ITEMS[chest.content];
      const qty = chest.qty || 1;
      this.inventory.add(chest.content, qty);
      msgs.push({ speaker: '', text: `📦 ${item ? item.name : chest.content} x${qty} を手に入れた！` });
    }
    if (chest.money) {
      this.party.money += chest.money;
      msgs.push({ speaker: '', text: `💰 ¥${chest.money} を手に入れた！` });
    }
    if (msgs.length === 0) msgs.push({ speaker: '', text: '📦 空っぽだった…' });
    this.dialog.show(msgs);
    this.map.updateHud();
  }
  handleQuestNpc(questId) {
    const quest = QUEST_DATA.find(q => q.id === questId);
    if (!quest) return;
    Sound.play('menuSelect');
    const giverData = NPC_DATA[quest.giver];
    const giverName = giverData ? giverData.name : '???';
    if (this.quests.isCompleted(questId)) {
      this.dialog.show([{ speaker: giverName, text: 'ありがとう！本当に助かったよ！😊' }]);
    } else if (this.quests.isActive(questId)) {
      // Auto-complete quests on second visit
      this.quests.complete(questId);
      this.party.money += quest.reward.money || 0;
      if (quest.reward.item) this.inventory.add(quest.reward.item, quest.reward.qty || 1);
      Sound.play('questComplete');
      const msgs = quest.completeDialog.map(t => ({ speaker: giverName, text: t }));
      msgs.push({ speaker: '', text: `🎉 クエスト「${quest.name}」完了！¥${quest.reward.money || 0}獲得！` });
      if (this.quests.allComplete()) {
        msgs.push({ speaker: '', text: '🏆 全サブクエスト完了！「ご近所ヒーローのあかし」獲得！' });
        this.party.members.forEach(m => {
          m.atk += 5; m.def += 5; m.spd += 5;
          m.maxHp += 5; m.maxSp += 5;
          m.hp = Math.min(m.hp + 5, m.maxHp);
          m.sp = Math.min(m.sp + 5, m.maxSp);
          m.hasHidden = true;
        });
      }
      this.dialog.show(msgs);
      this.map.updateHud();
    } else {
      // Accept quest
      this.quests.accept(questId);
      const msgs = quest.acceptDialog ? quest.acceptDialog.map(t => ({ speaker: giverName, text: t })) : [{ speaker: giverName, text: quest.desc }];
      msgs.push({ speaker: '', text: `📋 クエスト「${quest.name}」を受注！` });
      this.dialog.show(msgs);
    }
  }
  openMenu() {
    Sound.play('menuSelect');
    this.screen.show('menuScreen');
    this.showMenuTab('status');
  }
  showMenuTab(tab) {
    const content = $('menuContent');
    ['tabStatus', 'tabItems', 'tabQuests', 'tabSave'].forEach(t => $(t).classList.remove('active-tab'));
    switch (tab) {
      case 'status':
        $('tabStatus').classList.add('active-tab');
        content.innerHTML = this.party.members.map(m => `
          <div class="status-card">
            <h3>${m.emoji} ${m.name} Lv${m.lv}</h3>
            <p>HP: ${m.hp}/${m.maxHp} | SP: ${m.sp}/${m.maxSp}</p>
            <p>ATK: ${m.atk} | DEF: ${m.def} | SPD: ${m.spd}</p>
            <p>EXP: ${m.exp}/${m.lv * 100} | 属性: ${ELEMENT_NAMES[m.element] || ''}</p>
            <p>スキル: ${m.skills.map(s => SKILLS[s] ? SKILLS[s].name : s).join(', ')}</p>
            ${m.hasHidden ? '<p>★隠しスキル解放済み</p>' : ''}
            <p>必殺ゲージ: ${m.ultimateGauge || 0}%</p>
          </div>
        `).join('') + `<p class="money-display">所持金: ¥${this.party.money}</p>`;
        break;
      case 'items':
        $('tabItems').classList.add('active-tab');
        const items = this.inventory.getAll();
        if (items.length === 0) {
          content.innerHTML = '<p class="empty-msg">アイテムはありません</p>';
        } else {
          content.innerHTML = '<div class="menu-item-list">' + items.map(item => `
            <div class="menu-item-entry">
              <span>${item.name} x${item.qty}</span>
              <span class="item-desc-small">${item.desc || ''}</span>
              <button onclick="Game.useItemFromMenu('${item.id}')">使う</button>
            </div>
          `).join('') + '</div>';
        }
        break;
      case 'quests':
        $('tabQuests').classList.add('active-tab');
        const aq = this.quests.getActiveQuests();
        const cq = this.quests.getCompletedQuests();
        content.innerHTML = `
          <h3>📋 進行中 (${aq.length})</h3>
          ${aq.length ? aq.map(q => `<div class="quest-entry"><b>${q.name}</b><p>${q.desc}</p></div>`).join('') : '<p>なし</p>'}
          <h3>✅ 完了 (${cq.length}/15)</h3>
          ${cq.length ? cq.map(q => `<div class="quest-entry done"><b>${q.name}</b></div>`).join('') : '<p>なし</p>'}
        `;
        break;
    }
  }
  useItemFromMenu(itemId) {
    const item = ITEMS[itemId];
    if (!item) return;
    if (item.type === 'battleBuff') {
      const content = $('menuContent');
      content.innerHTML = '<p>このアイテムは戦闘中にしか使えません。</p><button onclick="Game.showMenuTab(\'items\')">戻る</button>';
      return;
    }
    const content = $('menuContent');
    content.innerHTML = `<h3>${item.name}を誰に使う？</h3>` +
      this.party.members.map((m, i) => `<button class="target-btn" onclick="Game.applyItemFromMenu('${itemId}', ${i})">${m.emoji} ${m.name} HP:${m.hp}/${m.maxHp} SP:${m.sp}/${m.maxSp}</button>`).join('') +
      '<button class="target-btn" onclick="Game.showMenuTab(\'items\')">戻る</button>';
  }
  applyItemFromMenu(itemId, idx) {
    const target = this.party.members[idx];
    if (!target || !this.inventory.has(itemId)) return;
    this.inventory.useItem(itemId, target);
    Sound.play('heal');
    this.showMenuTab('items');
    this.map.updateHud();
  }
  manualSave() {
    $('tabSave').classList.add('active-tab');
    this.autoSave();
    $('menuContent').innerHTML = '<div class="save-msg"><h3>💾 セーブ完了！</h3><p>データを保存しました。</p></div>';
    Sound.play('menuSelect');
  }
  closeMenu() { Sound.play('menuSelect'); this.screen.show('mapScreen'); }
  autoSave() {
    SaveManager.save({
      chapter: this.chapter, area: this.map.area,
      playerX: this.map.playerX, playerY: this.map.playerY,
      party: this.party.members, money: this.party.money,
      inventory: this.inventory.items,
      questsActive: this.quests.active, questsCompleted: this.quests.completed,
      completedEvents: this.completedEvents, openedChests: this.openedChests,
      clearedBosses: this.clearedBosses, clearedChapters: this.clearedChapters,
      gameCleared: this.gameCleared
    });
  }
  gameOver() {
    this.screen.show('gameOverScreen');
    $('gameOverTitle').textContent = '💀 ゲームオーバー';
  }
  retry() {
    if (SaveManager.hasSave()) this.continueGame();
    else this.screen.show('titleScreen');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
let Game;
document.addEventListener('DOMContentLoaded', () => {
  Game = new GameManager();
  Game.init();
});

/* ═══════════════════════════════════════════════
   🥦 ブロッコリ打 — game.js
   Typing Game Engine (Sushida-inspired)
   ═══════════════════════════════════════════════ */
'use strict';

const VERSION = '0.1.0';

// ── GitHub Ranking Config ──
const REPO_OWNER = 'Shunichi-Takeda';
const REPO_NAME = 'stock-inc-games';
const GAME_LABEL = 'broccoli-da';

// ══════════════════════════════════
// §1. Constants & Config
// ══════════════════════════════════

const COURSES = {
  easy:   { name: 'お手軽',   fee: 3000,  time: 60, label: '🟢' },
  normal: { name: 'おすすめ', fee: 5000,  time: 90, label: '🟡' },
  hard:   { name: '高級',     fee: 10000, time: 120, label: '🔴' },
};

const MODES = {
  practice: { name: '練習',     icon: '🐢', basketSpeed: 0.5 },
  normal:   { name: '普通',     icon: '▶️', basketSpeed: 1.0 },
  accuracy: { name: '正確重視', icon: '🎯', basketSpeed: 1.0 },
  speed:    { name: '速度必須', icon: '⚡', basketSpeed: 1.2 },
  oneshot:  { name: '一発勝負', icon: '💀', basketSpeed: 1.0 },
};

// Combo meter: keystroke-based, 4 stages per cycle, cycling
// Thresholds are cumulative keystrokes within one cycle (total = 130)
const COMBO_CYCLE_THRESHOLDS = [28, 59, 93, 130];
const COMBO_CYCLE_BONUSES    = [1,  1,  2,  3]; // seconds added
const COMBO_CYCLE_TOTAL = 130; // keystrokes per full cycle

const BASKET_EMOJIS = ['🥦', '🥕', '🍅', '🌽', '🥬', '🍆', '🧅', '🥒', '🫑', '🍠'];

// ══════════════════════════════════
// §2. Romaji Engine
// ══════════════════════════════════

const ROMAJI_MAP = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'si','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'ti','つ':'tu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'hu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','を':'wo','ん':'nn',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'zi','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'di','づ':'du','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  // 拗音
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
  'しゃ':'sya','しゅ':'syu','しょ':'syo',
  'ちゃ':'tya','ちゅ':'tyu','ちょ':'tyo',
  'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
  'みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
  'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'じゃ':'zya','じゅ':'zyu','じょ':'zyo',
  'びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
  // 特殊
  'ー':'-',
  'っ':'xtu', // placeholder, handled specially
  // 小書きかな（外来語音）
  'ふぁ':'fa','ふぃ':'fi','ふぅ':'fu','ふぇ':'fe','ふぉ':'fo',
  'てぃ':'thi','でぃ':'dhi','でゅ':'dhu',
  'うぃ':'wi','うぇ':'we','うぉ':'who',
  'しぇ':'sye','ちぇ':'tye','じぇ':'zye',
  'ぁ':'xa','ぃ':'xi','ぅ':'xu','ぇ':'xe','ぉ':'xo',
  'ゃ':'xya','ゅ':'xyu','ょ':'xyo',
};

// Alternative romaji inputs
const ROMAJI_ALTS = {
  'し': ['shi','ci'],
  'ち': ['chi'],
  'つ': ['tsu'],
  'ふ': ['fu'],
  'じ': ['ji'],
  'しゃ': ['sha','sya'],
  'しゅ': ['shu','syu'],
  'しょ': ['sho','syo'],
  'ちゃ': ['cha','cya','tya'],
  'ちゅ': ['chu','cyu','tyu'],
  'ちょ': ['cho','cyo','tyo'],
  'じゃ': ['ja','zya','jya'],
  'じゅ': ['ju','zyu','jyu'],
  'じょ': ['jo','zyo','jyo'],
  'を': ['wo'],
  // 小書きかな代替入力
  'ふぁ': ['hwa'],
  'ふぃ': ['hwi'],
  'ふぇ': ['hwe'],
  'ふぉ': ['hwo'],
  'てぃ': ['texi'],
  'でぃ': ['dexi'],
  'でゅ': ['dexyu'],
  'うぃ': ['uxi'],
  'うぇ': ['uxe'],
  'うぉ': ['uxo'],
};

/**
 * Convert hiragana reading to romaji segments.
 * Each segment: { kana, romaji: string, alts: string[] }
 */
function hiraganaToRomaji(reading) {
  const segments = [];
  let i = 0;
  while (i < reading.length) {
    // っ (double consonant)
    if (reading[i] === 'っ') {
      // The next consonant doubles
      const next = reading.substring(i + 1);
      let nextSeg = null;
      // Try 2-char kana first
      if (next.length >= 2) {
        const k2 = next.substring(0, 2);
        if (ROMAJI_MAP[k2]) {
          nextSeg = { kana: k2, base: ROMAJI_MAP[k2] };
        }
      }
      if (!nextSeg && next.length >= 1) {
        const k1 = next[0];
        if (ROMAJI_MAP[k1]) {
          nextSeg = { kana: k1, base: ROMAJI_MAP[k1] };
        }
      }
      if (nextSeg && nextSeg.base.length > 0) {
        const doubleChar = nextSeg.base[0];
        const mainRomaji = doubleChar + nextSeg.base;
        const alts = [mainRomaji];
        // xtu + normal
        alts.push('xtu' + nextSeg.base);
        alts.push('xtsu' + nextSeg.base);
        // Also double alternatives
        const altList = ROMAJI_ALTS[nextSeg.kana] || [];
        for (const alt of altList) {
          alts.push(doubleChar + alt);
          // Could also be first char of alt
          if (alt[0] !== doubleChar) {
            alts.push(alt[0] + alt);
          }
        }
        segments.push({
          kana: 'っ' + nextSeg.kana,
          romaji: mainRomaji,
          alts: [...new Set(alts)],
        });
        i += 1 + nextSeg.kana.length;
        continue;
      }
      // Standalone っ
      segments.push({ kana: 'っ', romaji: 'xtu', alts: ['xtu', 'xtsu', 'ltsu', 'ltu'] });
      i++;
      continue;
    }

    // ん handling
    if (reading[i] === 'ん') {
      const next = reading[i + 1] || '';
      // Before a/i/u/e/o/y/n or end, must use 'nn'
      // Before consonant other than n/y/vowel, can use 'n'
      const vowels = 'あいうえおやゆよなにぬねのん';
      const alts = ['nn'];
      if (next && !vowels.includes(next)) {
        alts.push('n');
      }
      if (!next) {
        alts.push('n');
      }
      alts.push("n'");
      alts.push('xn');
      segments.push({ kana: 'ん', romaji: 'nn', alts: [...new Set(alts)] });
      i++;
      continue;
    }

    // Try 2-char kana (拗音)
    if (i + 1 < reading.length) {
      const k2 = reading.substring(i, i + 2);
      if (ROMAJI_MAP[k2]) {
        const base = ROMAJI_MAP[k2];
        const alts = [base, ...(ROMAJI_ALTS[k2] || [])];
        segments.push({ kana: k2, romaji: base, alts: [...new Set(alts)] });
        i += 2;
        continue;
      }
    }

    // 1-char kana
    const k1 = reading[i];
    if (ROMAJI_MAP[k1]) {
      const base = ROMAJI_MAP[k1];
      const alts = [base, ...(ROMAJI_ALTS[k1] || [])];
      segments.push({ kana: k1, romaji: base, alts: [...new Set(alts)] });
    } else {
      // Unknown char, pass through
      segments.push({ kana: k1, romaji: k1, alts: [k1] });
    }
    i++;
  }
  return segments;
}

// ══════════════════════════════════
// §3. Word Manager
// ══════════════════════════════════

const BUILTIN_WORDS = {
  easy: [
    {text:'ねぎ',reading:'ねぎ',price:100},{text:'かぶ',reading:'かぶ',price:100},
    {text:'まめ',reading:'まめ',price:100},{text:'なす',reading:'なす',price:100},
    {text:'いも',reading:'いも',price:100},{text:'こめ',reading:'こめ',price:100},
    {text:'にく',reading:'にく',price:100},{text:'さけ',reading:'さけ',price:100},
    {text:'とまと',reading:'とまと',price:100},{text:'みかん',reading:'みかん',price:100},
    {text:'にんじん',reading:'にんじん',price:180},{text:'きゅうり',reading:'きゅうり',price:180},
    {text:'やさい',reading:'やさい',price:180},{text:'くだもの',reading:'くだもの',price:180},
    {text:'たまねぎ',reading:'たまねぎ',price:180},{text:'ぴーまん',reading:'ぴーまん',price:180},
    {text:'きゃべつ',reading:'きゃべつ',price:180},{text:'だいこん',reading:'だいこん',price:180},
    {text:'ブロッコリー',reading:'ぶろっこりー',price:240},{text:'ほうれんそう',reading:'ほうれんそう',price:240},
    {text:'アスパラガス',reading:'あすぱらがす',price:240},{text:'かぼちゃ',reading:'かぼちゃ',price:180},
    {text:'さつまいも',reading:'さつまいも',price:180},{text:'じゃがいも',reading:'じゃがいも',price:180},
    {text:'れたす',reading:'れたす',price:100},{text:'もも',reading:'もも',price:100},
    {text:'くり',reading:'くり',price:100},{text:'かき',reading:'かき',price:100},
    {text:'ゆず',reading:'ゆず',price:100},{text:'すもも',reading:'すもも',price:100},
    {text:'さらだ',reading:'さらだ',price:100},{text:'すーぷ',reading:'すーぷ',price:100},
    {text:'はたけ',reading:'はたけ',price:100},{text:'たね',reading:'たね',price:100},
    {text:'つち',reading:'つち',price:100},{text:'みず',reading:'みず',price:100},
    {text:'はる',reading:'はる',price:100},{text:'なつ',reading:'なつ',price:100},
    {text:'あき',reading:'あき',price:100},{text:'ふゆ',reading:'ふゆ',price:100},
  ],
  normal: [
    {text:'野菜炒め',reading:'やさいいため',price:180},{text:'サラダを作る',reading:'さらだをつくる',price:240},
    {text:'ブロッコリーの房',reading:'ぶろっこりーのふさ',price:240},{text:'旬の食材',reading:'しゅんのしょくざい',price:240},
    {text:'新鮮な野菜',reading:'しんせんなやさい',price:240},{text:'温野菜',reading:'おんやさい',price:180},
    {text:'朝ごはんのサラダ',reading:'あさごはんのさらだ',price:380},{text:'栄養バランス',reading:'えいようばらんす',price:240},
    {text:'八百屋で買う',reading:'やおやでかう',price:240},{text:'畑で育てる',reading:'はたけでそだてる',price:240},
    {text:'味噌汁を作る',reading:'みそしるをつくる',price:240},{text:'野菜ジュース',reading:'やさいじゅーす',price:240},
    {text:'ビタミンが豊富',reading:'びたみんがほうふ',price:240},{text:'お弁当のおかず',reading:'おべんとうのおかず',price:380},
    {text:'冬野菜がおいしい',reading:'ふゆやさいがおいしい',price:380},{text:'収穫する',reading:'しゅうかくする',price:240},
    {text:'種をまく',reading:'たねをまく',price:180},{text:'水やり',reading:'みずやり',price:180},
    {text:'緑の野菜',reading:'みどりのやさい',price:240},{text:'健康的な食事',reading:'けんこうてきなしょくじ',price:380},
    {text:'スープを煮る',reading:'すーぷをにる',price:240},{text:'天ぷらにする',reading:'てんぷらにする',price:240},
    {text:'漬物を作る',reading:'つけものをつくる',price:240},{text:'焼き野菜',reading:'やきやさい',price:180},
    {text:'茹で野菜',reading:'ゆでやさい',price:180},{text:'蒸し野菜',reading:'むしやさい',price:180},
    {text:'旬を味わう',reading:'しゅんをあじわう',price:240},{text:'いただきます',reading:'いただきます',price:240},
    {text:'ごちそうさま',reading:'ごちそうさま',price:240},{text:'おいしいね',reading:'おいしいね',price:180},
    {text:'食物繊維',reading:'しょくもつせんい',price:240},{text:'免疫力アップ',reading:'めんえきりょくあっぷ',price:380},
    {text:'朝市に行く',reading:'あさいちにいく',price:240},{text:'調理をする',reading:'ちょうりをする',price:240},
    {text:'包丁で切る',reading:'ほうちょうできる',price:240},{text:'フライパン',reading:'ふらいぱん',price:180},
    {text:'お鍋で煮込む',reading:'おなべでにこむ',price:240},{text:'味付けする',reading:'あじつけする',price:180},
    {text:'盛り付け',reading:'もりつけ',price:180},{text:'地産地消',reading:'ちさんちしょう',price:240},
  ],
  hard: [
    {text:'ブロッコリーは栄養満点',reading:'ぶろっこりーはえいようまんてん',price:500},
    {text:'新鮮な野菜をたくさん食べよう',reading:'しんせんなやさいをたくさんたべよう',price:500},
    {text:'毎日の食事に野菜を取り入れよう',reading:'まいにちのしょくじにやさいをとりいれよう',price:500},
    {text:'ブロッコリーの茎も美味しいよ',reading:'ぶろっこりーのくきもおいしいよ',price:500},
    {text:'野菜を洗って切る',reading:'やさいをあらってきる',price:240},
    {text:'畑に種をまこう',reading:'はたけにたねをまこう',price:240},
    {text:'朝ごはんを食べる',reading:'あさごはんをたべる',price:240},
    {text:'サラダが食べたいな',reading:'さらだがたべたいな',price:240},
    {text:'お弁当を作ろう',reading:'おべんとうをつくろう',price:240},
    {text:'スープを煮込もう',reading:'すーぷをにこもう',price:240},
    {text:'ブロッコリーを小房に分ける',reading:'ぶろっこりーをこぶさにわける',price:500},
    {text:'旬の野菜はとてもおいしい',reading:'しゅんのやさいはとてもおいしい',price:500},
    {text:'バランスよく食べることが大切',reading:'ばらんすよくたべることがたいせつ',price:500},
    {text:'温かいスープで体が温まる',reading:'あたたかいすーぷでからだがあたたまる',price:500},
    {text:'色とりどりの野菜を盛り付ける',reading:'いろとりどりのやさいをもりつける',price:500},
    {text:'野菜をたっぷり食べましょう',reading:'やさいをたっぷりたべましょう',price:380},
    {text:'栄養バランスを考えて食べよう',reading:'えいようばらんすをかんがえてたべよう',price:500},
    {text:'緑の野菜をもっと食べよう',reading:'みどりのやさいをもっとたべよう',price:380},
    {text:'有機野菜は安心して食べられる',reading:'ゆうきやさいはあんしんしてたべられる',price:500},
    {text:'新鮮な野菜で料理しよう',reading:'しんせんなやさいでりょうりしよう',price:380},
    {text:'ブロッコリーと卵のサラダ',reading:'ぶろっこりーとたまごのさらだ',price:380},
    {text:'野菜たっぷりのカレー',reading:'やさいたっぷりのかれー',price:380},
    {text:'冬のブロッコリーは甘い',reading:'ふゆのぶろっこりーはあまい',price:380},
    {text:'食べ物を大切にしよう',reading:'たべものをたいせつにしよう',price:380},
    {text:'手作り料理はおいしい',reading:'てづくりりょうりはおいしい',price:380},
    {text:'味を整えていこう',reading:'あじをととのえていこう',price:380},
    {text:'盛り付けが大切',reading:'もりつけがたいせつ',price:240},
    {text:'彩りがきれいだ',reading:'いろどりがきれいだ',price:240},
    {text:'緑が目に鮮やか',reading:'みどりがめにあざやか',price:240},
    {text:'畑仕事は楽しい',reading:'はたけしごとたのしい',price:240},
    {text:'健康に気をつける',reading:'けんこうにきをつける',price:240},
    {text:'元気が出る食事',reading:'げんきがでるしょくじ',price:240},
    {text:'家族で食卓を囲む',reading:'かぞくでしょくたくを',price:240},
    {text:'料理は楽しいな',reading:'りょうりはたのしいな',price:240},
    {text:'笑顔で食べよう',reading:'えがおでたべようね',price:240},
    {text:'旬の味を楽しむ',reading:'しゅんのあじをたのしむ',price:380},
    {text:'栄養をとろうね',reading:'えいようをとろうね',price:240},
    {text:'体を動かそうよ',reading:'からだをうごかそうよ',price:240},
    {text:'水やりをしよう',reading:'みずやりをしよう',price:240},
    {text:'お味噌汁を作ろう',reading:'おみそしるをつくろう',price:240},
  ],
};

class WordManager {
  constructor() {
    this.allWords = { easy: [], normal: [], hard: [] };
    this.loaded = false;
  }

  async load() {
    // Layer 1: builtin
    for (const diff of ['easy', 'normal', 'hard']) {
      this.allWords[diff] = [...BUILTIN_WORDS[diff]];
    }

    // Layer 2: external JSON
    try {
      const res = await fetch(`words.json?v=${VERSION}`);
      if (res.ok) {
        const data = await res.json();
        if (data.words) {
          for (const diff of ['easy', 'normal', 'hard']) {
            if (data.words[diff]) {
              const seen = new Set(this.allWords[diff].map(w => w.reading));
              for (const w of data.words[diff]) {
                if (!seen.has(w.reading)) {
                  this.allWords[diff].push(w);
                  seen.add(w.reading);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('words.json load failed, using builtin words', e);
    }

    this.loaded = true;
    console.log(`Words loaded: easy=${this.allWords.easy.length} normal=${this.allWords.normal.length} hard=${this.allWords.hard.length}`);
  }

  getShuffled(difficulty) {
    const words = [...this.allWords[difficulty]];
    // Deprioritize recently used
    const history = JSON.parse(localStorage.getItem('broccoli-da-history') || '[]');
    const recent = new Set(history);
    const fresh = words.filter(w => !recent.has(w.reading));
    const stale = words.filter(w => recent.has(w.reading));
    const combined = [...shuffle(fresh), ...shuffle(stale)];
    return combined;
  }

  saveHistory(usedReadings) {
    const prev = JSON.parse(localStorage.getItem('broccoli-da-history') || '[]');
    const updated = [...usedReadings, ...prev].slice(0, 200);
    localStorage.setItem('broccoli-da-history', JSON.stringify(updated));
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ══════════════════════════════════
// §4. Sound Manager
// ══════════════════════════════════

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggle() {
    this.muted = !this.muted;
    return this.muted;
  }

  play(type) {
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    switch (type) {
      case 'type':
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(784, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'miss':
        osc.type = 'sawtooth';
        osc.frequency.value = 200;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'bonus':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1100, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'gameover':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.2);
        osc.frequency.setValueAtTime(220, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
    }
  }
}

// ══════════════════════════════════
// §5. Game State
// ══════════════════════════════════

const wordManager = new WordManager();
const sound = new SoundManager();

let state = {
  screen: 'title',
  course: null,
  mode: null,
  // Game state
  timeLeft: 0,
  score: 0,
  comboStreak: 0,    // consecutive keystrokes without miss (for meter)
  comboBonusIndex: 0, // next bonus index within current cycle (0-3)
  totalBonusSeconds: 0, // total time bonus earned
  typedCount: 0,
  missCount: 0,
  skippedCount: 0,
  totalChars: 0,
  // Word state
  words: [],
  wordIndex: 0,
  currentWord: null,
  segments: [],
  segmentIndex: 0,
  charIndex: 0,  // within current segment's active romaji
  activeRomaji: '', // the romaji string being typed for current segment
  usedReadings: [],
  // Basket
  basketProgress: 0,
  basketDuration: 8000, // ms for basket to cross
  // Timer
  timerInterval: null,
  lastTick: 0,
  paused: false,
  gameOver: false,
};

// ══════════════════════════════════
// §6. DOM References
// ══════════════════════════════════

const $ = (id) => document.getElementById(id);

const screens = {
  title: $('titleScreen'),
  course: $('courseScreen'),
  mode: $('modeScreen'),
  countdown: $('countdownOverlay'),
  game: $('gameScreen'),
  result: $('resultScreen'),
  howTo: $('howToScreen'),
  pause: $('pauseOverlay'),
};

// ══════════════════════════════════
// §7. Screen Management
// ══════════════════════════════════

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle('active', key === name);
  }
  state.screen = name;
}

// ══════════════════════════════════
// §8. Game Flow
// ══════════════════════════════════

async function startGame() {
  if (!wordManager.loaded) {
    await wordManager.load();
  }

  const course = COURSES[state.course];
  state.timeLeft = course.time;
  state.score = 0;
  state.comboStreak = 0;
  state.comboBonusIndex = 0;
  state.totalBonusSeconds = 0;
  state.typedCount = 0;
  state.missCount = 0;
  state.skippedCount = 0;
  state.totalChars = 0;
  state.words = wordManager.getShuffled(state.course);
  state.wordIndex = 0;
  state.usedReadings = [];
  state.basketProgress = 0;
  state.paused = false;
  state.gameOver = false;

  // Basket speed
  const mode = MODES[state.mode];
  const baseSpeed = state.course === 'easy' ? 10000 : state.course === 'normal' ? 8000 : 7000;
  state.basketDuration = baseSpeed / mode.basketSpeed;

  // Countdown
  showScreen('countdown');
  $('countdownCourse').textContent = course.label + ' ' + course.name;
  $('countdownMode').textContent = mode.icon + ' ' + mode.name;

  await countdown();

  showScreen('game');
  sound.init();
  loadNextWord();
  updateHUD();
  startTimer();
}

function countdown() {
  return new Promise(resolve => {
    let count = 3;
    $('countdownNumber').textContent = count;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        $('countdownNumber').textContent = count;
        $('countdownNumber').style.animation = 'none';
        void $('countdownNumber').offsetWidth; // reflow
        $('countdownNumber').style.animation = 'countPulse 1s ease-in-out';
      } else if (count === 0) {
        $('countdownNumber').textContent = 'START!';
        $('countdownNumber').style.animation = 'none';
        void $('countdownNumber').offsetWidth;
        $('countdownNumber').style.animation = 'countPulse 1s ease-in-out';
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

function startTimer() {
  state.lastTick = performance.now();
  state.timerInterval = setInterval(() => {
    if (state.paused || state.gameOver) return;
    const now = performance.now();
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    state.timeLeft -= dt;
    state.basketProgress += (dt * 1000) / state.basketDuration;

    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endGame();
      return;
    }

    // Update basket position
    updateBasketPosition();

    // Check basket timeout (guard against transition period)
    if (state.currentWord && state.basketProgress >= 1) {
      onBasketMiss();
    }

    updateHUD();
  }, 50);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function loadNextWord() {
  if (state.wordIndex >= state.words.length) {
    // Wrap around
    state.words = shuffle(state.words);
    state.wordIndex = 0;
  }

  state.currentWord = state.words[state.wordIndex++];
  state.segments = hiraganaToRomaji(state.currentWord.reading);
  state.segmentIndex = 0;
  state.charIndex = 0;
  state.activeRomaji = state.segments[0]?.romaji || '';
  state.basketProgress = 0;

  updateWordDisplay();
  animateBasketEnter();
}

function onBasketMiss() {
  if (!state.currentWord) return; // already transitioning
  state.skippedCount++;
  state.currentWord = null; // prevent double fire
  resetComboMeter();

  sound.play('miss');

  // Mode-specific behavior
  if (state.mode === 'speed' || state.mode === 'oneshot') {
    endGame();
    return;
  }

  animateBasketLeave();
  setTimeout(() => loadNextWord(), 500);
}

function onWordComplete() {
  if (!state.currentWord) return; // already transitioning
  state.typedCount++;
  state.score += state.currentWord.price;
  state.usedReadings.push(state.currentWord.reading);
  state.currentWord = null; // prevent double fire

  sound.play('success');
  animateBasketSuccess();
  setTimeout(() => loadNextWord(), 400);
}

/**
 * Advance combo meter by one keystroke.
 * Called on every successful key press.
 */
function advanceComboMeter() {
  state.comboStreak++;

  // Check if we crossed a threshold
  const cyclePos = (state.comboStreak - 1) % COMBO_CYCLE_TOTAL; // 0-indexed within cycle
  const keystroke = cyclePos + 1; // 1-indexed position in current cycle

  const idx = state.comboBonusIndex;
  if (idx < COMBO_CYCLE_THRESHOLDS.length && keystroke === COMBO_CYCLE_THRESHOLDS[idx]) {
    const bonus = COMBO_CYCLE_BONUSES[idx];
    state.timeLeft += bonus;
    state.totalBonusSeconds += bonus;
    showTimeBonus(bonus);
    sound.play('bonus');
    state.comboBonusIndex++;
    // Cycle reset after last stage
    if (state.comboBonusIndex >= COMBO_CYCLE_THRESHOLDS.length) {
      state.comboBonusIndex = 0;
    }
  }
}

function resetComboMeter() {
  state.comboStreak = 0;
  state.comboBonusIndex = 0;
}

function handleKeyPress(key) {
  if (state.gameOver || state.paused || !state.currentWord) return;
  if (state.screen !== 'game') return;

  // Only accept a-z, -, '
  if (!/^[a-z\-']$/.test(key)) return;

  const seg = state.segments[state.segmentIndex];
  if (!seg) return;

  // Find which alternative matches
  let matched = false;

  // Try current active romaji first
  if (state.charIndex < state.activeRomaji.length &&
      key === state.activeRomaji[state.charIndex]) {
    state.charIndex++;
    matched = true;
  } else {
    // Try switching to an alternative
    for (const alt of seg.alts) {
      // Check if typed-so-far + key matches the start of this alt
      const typedSoFar = state.activeRomaji.substring(0, state.charIndex) + key;
      if (alt.startsWith(typedSoFar)) {
        state.activeRomaji = alt;
        state.charIndex = typedSoFar.length;
        matched = true;
        break;
      }
    }
  }

  // Special: single-n handling for ん
  // If current segment is ん, user typed 'n' (charIndex=1), and the new key
  // matches the START of the next segment → accept ん with single 'n' and
  // forward the key to the next segment.
  if (!matched && seg.kana === 'ん' && state.charIndex === 1) {
    const nextSeg = state.segments[state.segmentIndex + 1];
    if (nextSeg) {
      // Check if key matches start of any alternative of the next segment
      let nextMatch = false;
      let nextActiveRomaji = nextSeg.romaji;
      if (key === nextSeg.romaji[0]) {
        nextMatch = true;
      } else {
        for (const alt of nextSeg.alts) {
          if (key === alt[0]) {
            nextActiveRomaji = alt;
            nextMatch = true;
            break;
          }
        }
      }
      if (nextMatch) {
        // Complete ん with single 'n'
        state.segments[state.segmentIndex].usedRomaji = 'n';
        state.segmentIndex++;
        // Now process key for the next segment
        state.activeRomaji = nextActiveRomaji;
        state.charIndex = 1; // key already matched first char
        matched = true;

        // Check if next segment is now complete (single char romaji)
        if (state.charIndex >= state.activeRomaji.length) {
          state.segments[state.segmentIndex].usedRomaji = state.activeRomaji;
          state.segmentIndex++;
          state.charIndex = 0;
          if (state.segmentIndex < state.segments.length) {
            state.activeRomaji = state.segments[state.segmentIndex].romaji;
          }
        }
      }
    }
  }

  if (matched) {
    state.totalChars++;
    sound.play('type');
    advanceComboMeter();

    // Check if segment complete
    if (state.charIndex >= state.activeRomaji.length) {
      state.segments[state.segmentIndex].usedRomaji = state.activeRomaji;
      state.segmentIndex++;
      state.charIndex = 0;
      if (state.segmentIndex < state.segments.length) {
        state.activeRomaji = state.segments[state.segmentIndex].romaji;
      }
    }

    // Check if word complete
    if (state.segmentIndex >= state.segments.length) {
      updateWordDisplay(); // Show all chars as typed before transitioning
      onWordComplete();
      return; // skip the updateWordDisplay below (currentWord is now null)
    }

    updateWordDisplay();
  } else {
    // Miss!
    state.missCount++;
    sound.play('miss');
    $('typingArea').classList.add('shake');
    setTimeout(() => $('typingArea').classList.remove('shake'), 300);

    // Mode-specific miss handling
    if (state.mode === 'accuracy') {
      // Reset current word
      state.segmentIndex = 0;
      state.charIndex = 0;
      state.activeRomaji = state.segments[0]?.romaji || '';
      resetComboMeter();
      updateWordDisplay();
    } else if (state.mode === 'oneshot') {
      endGame();
    } else {
      resetComboMeter();
    }
  }

  updateHUD();
}

function endGame() {
  state.gameOver = true;
  stopTimer();
  wordManager.saveHistory(state.usedReadings);
  sound.play('gameover');
  showResult();
}

// ══════════════════════════════════
// §9. UI Updates
// ══════════════════════════════════

function updateHUD() {
  // Time display: 残り060秒 format (integer, zero-padded)
  const secs = Math.ceil(state.timeLeft);
  $('timeValue').textContent = String(secs).padStart(3, '0');
  $('scoreDisplay').textContent = `💰 ${state.score.toLocaleString()}円`;

  // Time warning
  const gameScreen = $('gameScreen');
  gameScreen.classList.toggle('time-warning', state.timeLeft <= 10);

  // Combo meter: show progress within current cycle
  const cyclePos = state.comboStreak % COMBO_CYCLE_TOTAL;
  const comboPercent = (cyclePos / COMBO_CYCLE_TOTAL) * 100;
  $('comboFill').style.width = comboPercent + '%';
  // Glow when close to next threshold
  const nextThreshold = COMBO_CYCLE_THRESHOLDS[state.comboBonusIndex] || COMBO_CYCLE_TOTAL;
  $('comboFill').classList.toggle('max', cyclePos >= nextThreshold * 0.85);

  // Update milestone labels
  for (let i = 0; i < COMBO_CYCLE_THRESHOLDS.length; i++) {
    const el = $('ms' + i);
    if (el) {
      el.classList.toggle('reached', cyclePos >= COMBO_CYCLE_THRESHOLDS[i]);
    }
  }
}

function updateWordDisplay() {
  if (!state.currentWord) return;

  $('wordDisplay').textContent = state.currentWord.text;
  $('readingDisplay').textContent = state.currentWord.reading;

  // Build romaji display
  let html = '';
  for (let i = 0; i < state.segments.length; i++) {
    const seg = state.segments[i];
    if (i < state.segmentIndex) {
      // Already typed — use the romaji that was actually used
      html += `<span class="typed">${seg.usedRomaji || seg.romaji}</span>`;
    } else if (i === state.segmentIndex) {
      // Current segment
      const active = state.activeRomaji;
      const typed = active.substring(0, state.charIndex);
      const current = active[state.charIndex] || '';
      const rest = active.substring(state.charIndex + 1);
      html += `<span class="typed">${typed}</span>`;
      html += `<span class="current">${current}</span>`;
      html += `<span class="untyped">${rest}</span>`;
    } else {
      // Not yet
      html += `<span class="untyped">${seg.romaji}</span>`;
    }
  }
  $('romajiDisplay').innerHTML = html;
}

function animateBasketEnter() {
  const area = $('basketArea');
  area.innerHTML = '';
  const basket = document.createElement('div');
  basket.className = 'basket';
  basket.id = 'currentBasket';
  const emoji = BASKET_EMOJIS[Math.floor(Math.random() * BASKET_EMOJIS.length)];
  basket.innerHTML = `
    <div class="basket-emoji">${emoji}</div>
    <div class="basket-price">${state.currentWord.price}円</div>
  `;
  area.appendChild(basket);
  updateBasketPosition();
}

function updateBasketPosition() {
  const basket = $('currentBasket');
  if (!basket) return;
  // progress 0 → right edge (100%), progress 1 → left edge (0%)
  const pct = (1 - state.basketProgress) * 100;
  basket.style.left = `${pct}%`;
  basket.style.transform = 'translateX(-50%)';
}

function animateBasketLeave() {
  const basket = $('basketArea').querySelector('.basket');
  if (basket) {
    basket.classList.remove('entering');
    basket.classList.add('leaving');
  }
}

function animateBasketSuccess() {
  const basket = $('basketArea').querySelector('.basket');
  if (basket) {
    basket.classList.remove('entering');
    basket.classList.add('success');
  }
}

function showTimeBonus(seconds) {
  const popup = $('timeBonusPopup');
  popup.textContent = `⏱️ +${seconds}秒！`;
  popup.classList.remove('show');
  void popup.offsetWidth;
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 1200);
}

// ══════════════════════════════════
// §10. Result Screen
// ══════════════════════════════════

function showResult() {
  const course = COURSES[state.course];
  const profit = state.score - course.fee;
  const isProfit = profit >= 0;

  if (isProfit) {
    $('resultTitle').textContent = '🎉 お買い得！';
    $('resultEmoji').textContent = '🥦🎊';
  } else {
    $('resultTitle').textContent = '😢 お買い損…';
    $('resultEmoji').textContent = '🥦💸';
  }

  $('resultSummary').innerHTML = `
    <div>お支払い: ${course.fee.toLocaleString()}円</div>
    <div>獲得: ${state.score.toLocaleString()}円</div>
    <div class="profit ${isProfit ? 'positive' : 'negative'}">
      ${isProfit ? '🎉 +' : '😢 '}${profit.toLocaleString()}円
    </div>
  `;

  const accuracy = state.totalChars > 0
    ? ((state.totalChars / (state.totalChars + state.missCount)) * 100).toFixed(1)
    : '0.0';
  const courseTime = course.time;
  const elapsed = courseTime - state.timeLeft;
  const speed = elapsed > 0 ? (state.totalChars / elapsed).toFixed(1) : '0.0';

  $('resultStats').innerHTML = `
    <div class="stat-item"><div class="stat-label">タイプ数</div><div class="stat-value">${state.typedCount}語</div></div>
    <div class="stat-item"><div class="stat-label">ミス数</div><div class="stat-value">${state.missCount}回</div></div>
    <div class="stat-item"><div class="stat-label">正確率</div><div class="stat-value">${accuracy}%</div></div>
    <div class="stat-item"><div class="stat-label">打鍵速度</div><div class="stat-value">${speed}打/秒</div></div>
    <div class="stat-item"><div class="stat-label">タイムボーナス</div><div class="stat-value">+${state.totalBonusSeconds}秒</div></div>
    <div class="stat-item"><div class="stat-label">スルー数</div><div class="stat-value">${state.skippedCount}回</div></div>
  `;

  showScreen('result');
}

// ══════════════════════════════════
// §11. Ranking System
// ══════════════════════════════════

let rankingCache = { data: null, timestamp: 0 };
let rankingActiveTab = 'normal';
const RANKING_CACHE_TTL = 60000; // 60s

// Mode icon → tab key mapping
const MODE_TAB_MAP = {
  '🐢': 'practice',
  '▶️': 'normal',
  '🎯': 'accuracy',
  '⚡': 'speed',
  '💀': 'oneshot',
};

async function loadRanking() {
  const now = Date.now();
  if (rankingCache.data && (now - rankingCache.timestamp) < RANKING_CACHE_TTL) {
    renderRanking(rankingCache.data, rankingActiveTab);
    return;
  }

  $('rankingContent').innerHTML = '<div class="ranking-loading">読み込み中...</div>';

  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=${GAME_LABEL}&state=open&per_page=100`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const issues = await res.json();

    const entries = [];
    for (const issue of issues) {
      const match = issue.title.match(/🏆\s*(\d+)\s*pts\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|\s*(.*)/);
      if (match) {
        const playerName = match[2].trim() === '-' ? issue.user.login : match[2].trim();
        const detail = match[4].trim();
        // Detect mode from detail (e.g. "🐢 練習", "▶️ 普通")
        let modeKey = 'unknown';
        for (const [icon, key] of Object.entries(MODE_TAB_MAP)) {
          if (detail.includes(icon)) {
            modeKey = key;
            break;
          }
        }
        entries.push({
          score: parseInt(match[1]),
          name: playerName,
          course: match[3].trim(),
          detail: detail,
          modeKey: modeKey,
          date: new Date(issue.created_at),
        });
      }
    }

    entries.sort((a, b) => b.score - a.score);
    rankingCache = { data: entries, timestamp: now };
    renderRanking(entries, rankingActiveTab);
  } catch (e) {
    console.error('Ranking load failed:', e);
    $('rankingContent').innerHTML = '<div class="ranking-loading">ランキングの読み込みに失敗しました</div>';
  }
}

function renderRanking(allEntries, tab) {
  const entries = allEntries.filter(e => e.modeKey === tab);
  const top = entries.slice(0, 20);

  if (!top.length) {
    $('rankingContent').innerHTML = '<div class="ranking-loading">まだスコアが登録されていません</div>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  let html = '<table class="ranking-table"><thead><tr><th>#</th><th>名前</th><th>スコア</th><th>コース</th></tr></thead><tbody>';
  for (let i = 0; i < top.length; i++) {
    const e = top[i];
    const rank = i < 3 ? medals[i] : (i + 1);
    html += `<tr><td>${rank}</td><td>${escapeHtml(e.name)}</td><td>${e.score.toLocaleString()}円</td><td>${escapeHtml(e.course)}</td></tr>`;
  }
  html += '</tbody></table>';
  $('rankingContent').innerHTML = html;
}

function openScoreRegistration() {
  const name = $('playerNameInput').value.trim() || '-';
  const course = COURSES[state.course];
  const mode = MODES[state.mode];
  const profit = state.score - course.fee;
  const accuracy = state.totalChars > 0
    ? ((state.totalChars / (state.totalChars + state.missCount)) * 100).toFixed(1)
    : '0.0';

  const title = `🏆 ${state.score} pts | ${name} | ${course.label} ${course.name} | ${mode.icon} ${mode.name}`;

  const body = `## 🥦 ブロッコリ打 スコア報告

| 項目 | 結果 |
|------|------|
| コース | ${course.label} ${course.name}（${course.fee.toLocaleString()}円） |
| モード | ${mode.icon} ${mode.name} |
| 獲得金額 | ${state.score.toLocaleString()}円 |
| 損益 | ${profit >= 0 ? '+' : ''}${profit.toLocaleString()}円 |
| タイプ数 | ${state.typedCount}語 |
| ミス数 | ${state.missCount}回 |
| 正確率 | ${accuracy}% |
| タイムボーナス | +${state.totalBonusSeconds}秒 |

Version: ${VERSION}`;

  // Note: URLSearchParams encodes commas in labels, which GitHub may not parse correctly.
  // Build URL manually to keep labels comma-separated without encoding.
  const encodedTitle = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(body);
  const issueUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?labels=score,${GAME_LABEL}&title=${encodedTitle}&body=${encodedBody}`;
  window.open(issueUrl, '_blank');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ══════════════════════════════════
// §12. Event Listeners
// ══════════════════════════════════

// Title
$('btnPlay').addEventListener('click', () => {
  showScreen('course');
});
$('btnHowTo').addEventListener('click', () => showScreen('howTo'));
$('btnRankingTitle').addEventListener('click', () => {
  $('rankingModal').classList.add('active');
  loadRanking();
});

// Course select
document.querySelectorAll('.course-card').forEach(card => {
  card.addEventListener('click', () => {
    state.course = card.dataset.course;
    showScreen('mode');
  });
});
$('btnBackFromCourse').addEventListener('click', () => showScreen('title'));

// Mode select
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    state.mode = card.dataset.mode;
    startGame();
  });
});
$('btnBackFromMode').addEventListener('click', () => showScreen('course'));

// How To
$('btnBackFromHowTo').addEventListener('click', () => showScreen('title'));

// Game
$('btnPause').addEventListener('click', () => {
  state.paused = true;
  showScreen('pause');
});
$('btnSound').addEventListener('click', () => {
  sound.init();
  const muted = sound.toggle();
  $('btnSound').textContent = muted ? '🔇' : '🔊';
});

// Pause
$('btnResume').addEventListener('click', () => {
  state.paused = false;
  state.lastTick = performance.now();
  showScreen('game');
});
$('btnQuit').addEventListener('click', () => {
  stopTimer();
  showScreen('title');
});

// Result
$('btnRetry').addEventListener('click', () => startGame());
$('btnToTitle').addEventListener('click', () => showScreen('title'));
$('btnRegisterScore').addEventListener('click', () => {
  $('nameModal').classList.add('active');
});
$('btnRankingResult').addEventListener('click', () => {
  $('rankingModal').classList.add('active');
  loadRanking();
});

// Name Modal
$('btnSubmitScore').addEventListener('click', () => {
  openScoreRegistration();
  $('nameModal').classList.remove('active');
});
$('btnCancelName').addEventListener('click', () => {
  $('nameModal').classList.remove('active');
});

// Ranking Modal
$('btnCloseRanking').addEventListener('click', () => {
  $('rankingModal').classList.remove('active');
});

// Ranking Tabs
document.querySelectorAll('.ranking-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    rankingActiveTab = tab.dataset.tab;
    if (rankingCache.data) {
      renderRanking(rankingCache.data, rankingActiveTab);
    }
  });
});

// Keyboard input
document.addEventListener('keydown', (e) => {
  if (state.screen === 'game' && !state.paused) {
    e.preventDefault();
    handleKeyPress(e.key.toLowerCase());
  }

  // ESC to pause
  if (e.key === 'Escape') {
    if (state.screen === 'game' && !state.paused) {
      state.paused = true;
      showScreen('pause');
    } else if (state.screen === 'pause') {
      state.paused = false;
      state.lastTick = performance.now();
      showScreen('game');
    }
  }
});

// ══════════════════════════════════
// §13. Initialize
// ══════════════════════════════════

function init() {
  $('versionDisplay').textContent = `v${VERSION}`;
  showScreen('title');
  // Preload words
  wordManager.load();
}

init();

# 🎮 Stock Inc. Games

**Stock Inc.** が適当に作った HTML ゲームを集めたポータルサイトです。  
すべてのゲームは GitHub Pages 上で公開されており、ブラウザからすぐに遊べます。

🌐 **ポータルサイト**: [https://shunichi-takeda.github.io/stock-inc-games/](https://shunichi-takeda.github.io/stock-inc-games/)

## 🕹️ ゲーム一覧

### 外部リポジトリのゲーム

| ゲーム | ジャンル | プレイ |
|--------|----------|--------|
| 🥦 ブロッコリーシューター | シューティング | [▶ Play](https://shunichi-takeda.github.io/narekan-shooting/) |
| 📖 ベジタブルキングダム ～最後の収穫祭～ | ノベル | [▶ Play](https://shunichi-takeda.github.io/narekan-shooting/novel.html) |
| 💼 Stock Philosophy ～ふたつの世界線～ | 学習 | [▶ Play](https://shunichi-takeda.github.io/stock-philosophy-game/) |

### このリポジトリ内のゲーム

| ゲーム | ジャンル | 状態 |
|--------|----------|------|
| 🥦🏰 ブロッコリー・タワーディフェンス | タワーディフェンス | 🚧 開発中 |

> ゲームは随時追加されます！自社メンバーだけでなく、他の人が作成したゲームも掲載していきます。

## 📁 ディレクトリ構成

```
stock-inc-games/
├── README.md
├── .agents/
│   └── AGENTS.md           # AI エージェント向けプロジェクトルール
├── index.html              # ゲーム一覧ポータル（GitHub Pages トップ）
├── assets/
│   └── thumbnails/         # ゲームのサムネイル画像
├── shared/                 # ゲーム間で共有するアセット
│   ├── css/common.css
│   └── js/utils.js
└── games/                  # このリポジトリ内のゲーム
    └── broccoli-td/        # ブロッコリー・タワーディフェンス
        ├── index.html
        ├── style.css
        └── game.js
```

## 🛠️ 技術スタック

- **HTML / CSS / JavaScript** のみ（フレームワーク不使用）
- **GitHub Pages** でホスティング（`main` ブランチの `/` をソースとして使用）
- 外部ライブラリは極力使わないシンプル構成

## 📝 ゲームの追加方法

### このリポジトリ内にゲームを追加する場合

1. `games/` 配下に新しいフォルダを作成（例: `games/my-new-game/`）
2. `index.html`, `style.css`, `game.js` を配置
3. `assets/thumbnails/` にサムネイル画像（PNG、16:10 推奨）を追加
4. ルートの `index.html` にゲームカードを追加し、適切な `data-category` を設定
5. `README.md` のゲーム一覧テーブルを更新
6. `main` ブランチに push → 自動で GitHub Pages に反映

### 外部 URL のゲームを一覧に追加する場合

外部リポジトリや他の人が作成したゲームも、ポータルに掲載できます。

1. `assets/thumbnails/` にサムネイル画像を追加
2. ルートの `index.html` に `<a>` タグのゲームカードを追加（`target="_blank"` で外部リンク）
3. `README.md` の「外部リポジトリのゲーム」テーブルを更新

### ゲームカードの HTML テンプレート

```html
<!-- 外部リンクのゲーム -->
<a href="https://example.github.io/game/" target="_blank" rel="noopener"
   class="game-card" data-category="shooting">
  <div class="card-thumb">
    <img src="assets/thumbnails/game-thumb.png" alt="ゲーム名" loading="lazy">
    <span class="badge badge-status badge--playable">▶ Play</span>
  </div>
  <div class="card-body">
    <h2>🎮 ゲーム名</h2>
    <p>ゲームの説明文。</p>
    <div class="card-tags">
      <span class="tag">ジャンル</span>
    </div>
    <span class="card-play">プレイする <span class="arrow">→</span></span>
  </div>
</a>

<!-- Coming Soon のゲーム -->
<div class="game-card coming-soon" data-category="strategy">
  <div class="card-thumb">
    <img src="assets/thumbnails/game-thumb.png" alt="ゲーム名" loading="lazy">
    <span class="badge badge-status badge--coming-soon">Coming Soon</span>
  </div>
  <div class="card-body">
    <h2>🎮 ゲーム名</h2>
    <p>ゲームの説明文。</p>
    <div class="card-tags">
      <span class="tag">ジャンル</span>
    </div>
    <span class="card-play" style="color: #64748b;">開発中…</span>
  </div>
</div>
```

### カテゴリ一覧（`data-category`）

| カテゴリ | フィルターボタン |
|----------|------------------|
| `shooting` | 🔫 シューティング |
| `novel` | 📖 ノベル |
| `strategy` | 🏰 ストラテジー |
| `learning` | 📚 学習 |

> 新しいカテゴリを追加する場合は `index.html` の `<nav class="filter-bar">` にボタンも追加してください。

## 📜 ライセンス

MIT License

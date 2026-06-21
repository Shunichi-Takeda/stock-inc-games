# AGENTS.md — Stock Inc. Games プロジェクトルール

## プロジェクト概要

- HTML ゲームのポータルサイト（GitHub Pages で公開）
- リポジトリ: `shunichi-takeda/stock-inc-games`
- GitHub Pages URL: `https://shunichi-takeda.github.io/stock-inc-games/`
- GitHub リポジトリへの push は `Shunichi-Takeda` アカウントで行う（`gh auth switch --user Shunichi-Takeda`）

## ゲームの種類

このポータルには **2種類のゲーム** が掲載される:

1. **内部ゲーム**: `games/` ディレクトリ内に直接格納されたゲーム
2. **外部ゲーム**: 別リポジトリの GitHub Pages URL にリンクするゲーム（自社・他の人が作成したものを含む）

## 技術スタック

- **HTML / CSS / JavaScript のみ**（フレームワーク不使用）
- 外部ライブラリは極力使わない
- ゲームは単一 HTML ファイルまたは `index.html` + `style.css` + `game.js` の構成
- `shared/css/common.css` と `shared/js/utils.js` に共通コードを配置

## ディレクトリ構成ルール

```
stock-inc-games/
├── index.html              # ポータル一覧ページ（GitHub Pages トップ）
├── assets/thumbnails/      # サムネイル画像（PNG、16:10 推奨）
├── shared/                 # 共通アセット
│   ├── css/common.css
│   └── js/utils.js
└── games/                  # 内部ゲーム（各ゲームごとにサブディレクトリ）
    └── <game-name>/
        ├── index.html
        ├── style.css
        └── game.js
```

## ゲームの追加手順

### 内部ゲームを追加する場合

1. `games/<game-name>/` ディレクトリを作成
2. `index.html`, `style.css`, `game.js` を配置
3. `assets/thumbnails/<game-name>.png` にサムネイル画像を追加
4. ルート `index.html` の `.games-grid` 内にゲームカードを追加
5. `README.md` の「このリポジトリ内のゲーム」テーブルを更新
6. ゲーム内に `← ゲーム一覧に戻る` リンク（`../../` へ）を設置

### 外部ゲームを追加する場合

1. `assets/thumbnails/<game-name>.png` にサムネイル画像を追加
2. ルート `index.html` の `.games-grid` 内に `<a>` タグでカードを追加（`target="_blank"`）
3. `README.md` の「外部リポジトリのゲーム」テーブルを更新

## index.html のゲームカード構造

ゲームカードには以下の `data-category` 属性を設定する:

| カテゴリ値 | 説明 |
|-----------|------|
| `shooting` | シューティング |
| `novel` | ノベル |
| `strategy` | ストラテジー（タワーディフェンス等） |
| `learning` | 学習・教育 |

新しいカテゴリを追加する場合は `<nav class="filter-bar">` にフィルターボタンも追加すること。

### プレイ可能なゲームのカード

```html
<a href="URL" target="_blank" rel="noopener"
   class="game-card" data-category="カテゴリ">
  <div class="card-thumb">
    <img src="assets/thumbnails/xxx.png" alt="名前" loading="lazy">
    <span class="badge badge-status badge--playable">▶ Play</span>
  </div>
  <div class="card-body">
    <h2>🎮 ゲーム名</h2>
    <p>説明文</p>
    <div class="card-tags"><span class="tag">タグ</span></div>
    <span class="card-play">プレイする <span class="arrow">→</span></span>
  </div>
</a>
```

### Coming Soon のカード

```html
<div class="game-card coming-soon" data-category="カテゴリ">
  <!-- badge--coming-soon を使用、<div> タグ（リンクなし） -->
</div>
```

## コミットルール

- コミットメッセージは日本語で、絵文字プレフィックス付き
- 例: `🎮 新ゲーム追加: ブロッコリーTD`、`🖼️ サムネイル更新`、`🐛 バグ修正`

## デプロイ

- `main` ブランチに push すると GitHub Pages に自動反映
- Pages ソース: `main` ブランチの `/`（ルート）

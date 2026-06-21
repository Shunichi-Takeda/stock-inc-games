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

> ゲームは随時追加されます！

## 📁 ディレクトリ構成

```
stock-inc-games/
├── README.md
├── index.html             # ゲーム一覧ポータル（GitHub Pages トップ）
├── assets/
│   └── thumbnails/        # ゲームのサムネイル画像
├── shared/                # ゲーム間で共有するアセット
│   ├── css/common.css
│   └── js/utils.js
└── games/                 # このリポジトリ内のゲーム
    └── broccoli-td/       # ブロッコリー・タワーディフェンス
        ├── index.html
        ├── style.css
        └── game.js
```

## 🛠️ 技術スタック

- **HTML / CSS / JavaScript** のみ（フレームワーク不使用）
- **GitHub Pages** でホスティング
- 外部ライブラリは極力使わないシンプル構成

## 📝 ゲームの追加方法

### このリポジトリ内にゲームを追加

1. `games/` 配下に新しいフォルダを作成
2. `index.html`, `style.css`, `game.js` を配置
3. `assets/thumbnails/` にサムネイル画像を追加
4. ルートの `index.html` にゲームカードを追加、`README.md` も更新
5. `main` ブランチに push → 自動で GitHub Pages に反映

### 外部 URL のゲームを一覧に追加

1. `assets/thumbnails/` にサムネイル画像を追加
2. ルートの `index.html` にゲームカード（`<a>` タグ）を追加
3. `README.md` の一覧テーブルも更新

## 📜 ライセンス

MIT License

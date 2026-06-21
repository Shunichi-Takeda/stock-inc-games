# 🎮 Stock Inc. Games

**Stock Inc.** が適当に作った HTML ゲームを集めたリポジトリです。  
すべてのゲームは GitHub Pages 上で公開されており、ブラウザからすぐに遊べます。

## 🕹️ ゲーム一覧

| ゲーム | 説明 | プレイ |
|--------|------|--------|
| 🥦 ブロッコリーシューター | _Coming Soon_ | - |

> ゲームは随時追加されます！

## 🌐 遊び方

GitHub Pages で公開しています：

```
https://shunichi-takeda.github.io/stock-inc-games/<ゲーム名>/
```

各ゲームのフォルダ内にある `index.html` をブラウザで開いても遊べます。

## 📁 ディレクトリ構成

```
stock-inc-games/
├── README.md              # このファイル
├── index.html             # ゲーム一覧ページ（GitHub Pages トップ）
├── shared/                # ゲーム間で共有するアセット・ユーティリティ
│   ├── css/
│   │   └── common.css     # 共通スタイル
│   └── js/
│       └── utils.js       # 共通ユーティリティ
└── games/                 # 各ゲームのディレクトリ
    └── broccoli-shooter/  # ブロッコリーシューター
        ├── index.html
        ├── style.css
        └── game.js
```

## 🛠️ 技術スタック

- **HTML / CSS / JavaScript** のみ（フレームワーク不使用）
- **GitHub Pages** でホスティング
- 外部ライブラリは極力使わないシンプル構成

## 📝 ゲームの追加方法

1. `games/` 配下に新しいフォルダを作成
2. `index.html`, `style.css`, `game.js` を配置
3. ルートの `index.html` と `README.md` のゲーム一覧を更新
4. `main` ブランチに push すると自動的に GitHub Pages に反映

## 📜 ライセンス

MIT License

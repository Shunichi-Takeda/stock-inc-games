# 🎮 Stock Inc. Games

**Stock Inc.** が適当に作った HTML ゲームを集めたポータルサイトです。  
すべてのゲームは GitHub Pages 上で公開されており、ブラウザからすぐに遊べます。

🌐 **ポータルサイト**: [https://shunichi-takeda.github.io/stock-inc-games/](https://shunichi-takeda.github.io/stock-inc-games/)

## 🕹️ ゲームの登録・管理

ゲームの登録・管理は **GitHub Issue** ベースで行います。  
誰でも簡単にゲームを追加・編集・削除できます。

| 操作 | 方法 |
|------|------|
| **ゲームを登録する** | [Issue を作成する](https://github.com/Shunichi-Takeda/stock-inc-games/issues/new?template=add-game.yml) |
| **登録内容を修正する** | 該当の Issue を編集する |
| **ゲームを削除する** | 該当の Issue を Close する |

> 詳しい手順は [ヘルプページ](https://shunichi-takeda.github.io/stock-inc-games/help.html) をご覧ください。

## 📁 ディレクトリ構成

```
stock-inc-games/
├── index.html              # ゲーム一覧ポータル（GitHub Issues API から動的生成）
├── help.html               # ゲーム登録・管理ヘルプページ
├── .github/
│   └── ISSUE_TEMPLATE/     # Issue テンプレート
│       ├── add-game.yml    # ゲーム登録フォーム
│       └── config.yml
├── assets/thumbnails/      # サムネイル画像（任意）
├── shared/                 # ゲーム間で共有するアセット
│   ├── css/common.css
│   └── js/utils.js
└── games/                  # このリポジトリ内のゲーム（任意）
    └── broccoli-td/
        ├── index.html
        ├── style.css
        └── game.js
```

## 🏗️ 仕組み

```
Issue 作成/編集/Close  →  GitHub Issues API  →  index.html が動的にカード生成
```

- `game` ラベル付きの **Open** な Issue がポータルに表示される
- Issue テンプレート（フォーム形式）で構造化されたデータを収集
- `index.html` がクライアントサイドで GitHub API を呼び出してカードを生成
- レスポンスは `localStorage` に5分間キャッシュ

## 🛠️ 技術スタック

- **HTML / CSS / JavaScript** のみ（フレームワーク不使用）
- **GitHub Pages** でホスティング
- **GitHub Issues API** でゲームデータを管理（CMS として利用）

## 📜 ライセンス

MIT License

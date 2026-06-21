# 🎮 Stock Inc. Games

**Stock Inc.** が AI と一緒に作った HTML ゲームを集めたポータルサイトです。  
すべてのゲームは GitHub Pages 上で公開されており、ブラウザからすぐに遊べます。  
誰でもゲームを登録できます（GitHub アカウントが必要です）。

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

## 🏆 ランキング機能

各ゲームの **スコアランキング** も GitHub Issues で管理しています。

| 操作 | 方法 |
|------|------|
| **スコアを登録する** | ゲームクリア後「🏆 ランキング登録」→ 名前入力 → GitHub Issue として登録 |
| **ランキングを見る** | ゲーム内「🏆 RANKING」ボタン |

### ラベル構成

スコア Issue には **2つのラベル** が付与されます:

| ラベル | 用途 |
|--------|------|
| `score` | 全ゲーム共通のスコア Issue 識別用 |
| `<ゲーム名>` (例: `broccoli-td`) | ゲーム固有のランキングフィルタ |

### タイトルフォーマット

```
🏆 {score} pts | {playerName} | {stageName} | ⭐{stars}
```

> ⚠️ スコア Issue のタイトルは変更しないでください（ランキング表示に使用されます）

## 🛠️ 技術スタック

- **HTML / CSS / JavaScript** のみ（フレームワーク不使用）
- **GitHub Pages** でホスティング
- **GitHub Issues API** でゲームデータを管理（CMS として利用）

## 📜 ライセンス

MIT License

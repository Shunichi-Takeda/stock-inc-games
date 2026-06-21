# AGENTS.md — Stock Inc. Games プロジェクトルール

## プロジェクト概要

- HTML ゲームのポータルサイト（GitHub Pages で公開）
- リポジトリ: `shunichi-takeda/stock-inc-games`
- GitHub Pages URL: `https://shunichi-takeda.github.io/stock-inc-games/`
- GitHub リポジトリへの push は `Shunichi-Takeda` アカウントで行う（`gh auth switch --user Shunichi-Takeda`）

## アーキテクチャ

ゲーム情報は **GitHub Issues** で管理される（Issues as CMS）。

```
Issue 作成/編集/Close  →  GitHub Issues API  →  index.html が動的にカード生成
```

- `game` ラベル付きの **Open** な Issue がポータルに表示される
- Issue テンプレート（`.github/ISSUE_TEMPLATE/add-game.yml`）で構造化データを収集
- `index.html` がクライアントサイドで GitHub API を呼び出してカードを動的生成
- レスポンスは `localStorage` に5分間キャッシュ

### Issue Body のフォーマット（GitHub Issue Forms が生成）

```markdown
### ゲームURL

https://example.github.io/game/

### サムネイル画像URL

https://example.com/thumbnail.png

### 紹介テキスト

ゲームの説明文

### カテゴリ

シューティング

### タグ（任意）

タグ1, タグ2
```

## ゲームの種類

このポータルには **2種類のゲーム** が掲載される:

1. **外部ゲーム**: 別リポジトリの GitHub Pages URL にリンクするゲーム（自社・他の人が作成したものを含む）
2. **内部ゲーム**: `games/` ディレクトリ内に直接格納されたゲーム（これも Issue で登録する）

## 技術スタック

- **HTML / CSS / JavaScript のみ**（フレームワーク不使用）
- 外部ライブラリは極力使わない
- ゲームは単一 HTML ファイルまたは `index.html` + `style.css` + `game.js` の構成
- `shared/css/common.css` と `shared/js/utils.js` に共通コードを配置
- **GitHub Issues API** をクライアントサイドから呼び出してゲームデータを取得

## ディレクトリ構成ルール

```
stock-inc-games/
├── index.html              # ポータル（GitHub Issues API から動的生成）
├── help.html               # ゲーム登録・管理ヘルプページ
├── .github/
│   └── ISSUE_TEMPLATE/     # Issue テンプレート
│       ├── add-game.yml    # ゲーム登録フォーム
│       └── config.yml
├── assets/thumbnails/      # サムネイル画像（任意）
├── shared/                 # 共通アセット
│   ├── css/common.css
│   └── js/utils.js
└── games/                  # 内部ゲーム（各ゲームごとにサブディレクトリ）
    └── <game-name>/
        ├── index.html
        ├── style.css
        └── game.js
```

## ゲームの追加・管理

### ゲームを登録する場合

1. GitHub Issue テンプレート（`add-game.yml`）を使って Issue を作成
2. `game` ラベルが自動付与される
3. ポータルに自動表示される（最大5分のキャッシュ遅延あり）

### ゲームを修正する場合

- 該当の Issue を編集する（`### ヘッダー` 行は変更しないこと）

### ゲームを削除する場合

- 該当の Issue を Close する

### 内部ゲームを追加する場合

1. Issue でゲームを登録（URL は GitHub Pages の URL を使用）
2. `games/<game-name>/` ディレクトリに `index.html`, `style.css`, `game.js` を配置
3. ゲーム内に `← ゲーム一覧に戻る` リンク（`../../` へ）を設置

## カテゴリ一覧

| カテゴリ値（Issue Body） | フィルターID | 説明 |
|--------------------------|-------------|------|
| シューティング | `shooting` | シューティング |
| ノベル | `novel` | ノベル |
| ストラテジー | `strategy` | ストラテジー（タワーディフェンス等） |
| 学習 | `learning` | 学習・教育 |
| その他 | `other` | その他 |

新しいカテゴリを追加する場合:
1. `.github/ISSUE_TEMPLATE/add-game.yml` のドロップダウンに選択肢を追加
2. `index.html` の `CATEGORY_MAP` と `CATEGORY_LABELS` にエントリを追加
3. `index.html` の `<nav class="filter-bar">` にフィルターボタンを追加

## コミットルール

- コミットメッセージは日本語で、絵文字プレフィックス付き
- 例: `🎮 新ゲーム追加: ブロッコリーTD`、`🖼️ サムネイル更新`、`🐛 バグ修正`

## デプロイ

- `main` ブランチに push すると GitHub Pages に自動反映
- Pages ソース: `main` ブランチの `/`（ルート）

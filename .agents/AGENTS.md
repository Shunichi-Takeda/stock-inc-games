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

### ラベル一覧

| ラベル名 | 色 | 用途 |
|---------|-----|------|
| `game` | — | ポータルに表示するゲーム登録用 |
| `score` | `#FBCA04` | 全ゲーム共通のスコア/ランキングIssue識別 |
| `broccoli-td` | `#22c55e` | ブロッコリーTD固有のランキングフィルタ |

新しいゲームのランキングを追加する場合は、`score` ラベルに加えてゲーム固有ラベル（例: `<game-name>`）を作成する。

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

## ランキングシステム（GitHub Issues ベース）

ゲーム内のスコアランキングも **GitHub Issues** で管理する。

### 仕組み

```
ゲームクリア → 名前入力 → GitHub Issue 作成ページを別タブで開く
                          → ユーザーが Submit → Issue 作成
ランキング表示 → GitHub Issues API でラベルフィルタ取得
              → タイトルからスコアをパース → ソート表示
```

### Issue タイトルフォーマット

```
🏆 {score} pts | {playerName} | {stageName} | ⭐{stars}
```

例: `🏆 6514 pts | Shunichi-Takeda | 🌿 丘の上の見張り台 | ⭐2`

- タイトルの `🏆 (\d+) pts` でスコアをパース
- `|` 区切りで名前・ステージ・星を取得
- 名前が空欄の場合は `{{github}}` を入れ、表示時に Issue 作成者の GitHub アカウント名で置換

### ラベル構成

| ラベル | 役割 |
|--------|------|
| `score` | 全ゲーム共通。スコアIssueの識別用 |
| `<game-name>` (例: `broccoli-td`) | ゲーム固有。ランキング取得時のフィルタに使用 |

Issue 作成 URL には `labels=score,<game-name>` で両ラベルを指定する。

### 実装方法（ゲーム側）

1. **定数定義**:
   ```javascript
   const REPO_OWNER = 'Shunichi-Takeda';
   const REPO_NAME = 'stock-inc-games';
   const GAME_LABEL = '<game-name>';  // ゲーム固有ラベル
   ```

2. **スコア登録（Issue 作成 URL を開く）**:
   ```javascript
   const params = new URLSearchParams({
     labels: `score,${GAME_LABEL}`,
     title: `🏆 ${score} pts | ${name} | ${stage} | ⭐${stars}`,
     body: body,
   });
   window.open(`https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?${params}`, '_blank');
   ```

3. **ランキング取得（Issues API）**:
   ```javascript
   const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=${GAME_LABEL}&state=open&per_page=100`;
   // タイトルから 🏆 (\d+) pts でスコアをパース → ソート → 上位20件表示
   ```

4. **キャッシュ**: 60秒 TTL でクライアントサイドキャッシュ

### 新ゲームにランキングを追加する手順

1. GitHub リポジトリに `<game-name>` ラベルを作成:
   ```bash
   GITHUB_TOKEN= gh label create <game-name> --repo Shunichi-Takeda/stock-inc-games --description "<ゲーム名>のスコア" --color "<色コード>"
   ```
2. ゲーム内の `game.js` に `GAME_LABEL = '<game-name>'` を定義
3. 上記の実装方法に従ってスコア登録・ランキング表示を実装
4. 名前入力モーダル・ランキングモーダルを HTML/CSS に追加

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

## ゲームバージョン管理

- ゲーム内に `VERSION` 定数を持ち、画面右下に表示
- バージョンは `Major.Minor.Patch` 形式（例: `0.3.0`）

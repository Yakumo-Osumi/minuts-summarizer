# 議事録要約・タスク抽出ツール

## プロジェクト概要

議事録テキストを貼り付けると、AIが自動で「要約」と「タスク一覧」を抽出してくれるWebツール。
転職ポートフォリオとして作成。業務効率化 × AI × (将来的に)AWS の構成。

---

## フェーズ構成

| フェーズ | 内容                                    | 状態      |
| -------- | --------------------------------------- | --------- |
| Phase 1  | AWSなし構成で動くものを作る             | 👈 今ここ |
| Phase 2  | バックエンドをAWS Lambdaに移行          | 未着手    |
| Phase 3  | S3 + CloudFrontでフロントをホスティング | 未着手    |

---

## Phase 1：技術スタック（AWSなし）

```
フロントエンド
└── React + TypeScript (Vite)
    └── UIコンポーネント / 状態管理 / APIコール

バックエンド
└── Node.js + Express
    └── Gemini APIの呼び出し（APIキーをサーバー側で管理）

Gemini API
└── gemini-3.5-flash（無料枠あり・速度速）
    └── 要約 + タスク抽出のプロンプト処理
```

### ディレクトリ構成

```
project-root/
├── CLAUDE.md               # このファイル
├── frontend/               # Reactアプリ
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── InputArea.tsx      # 議事録入力エリア
│   │   │   ├── ResultArea.tsx     # 要約・タスク表示
│   │   │   └── LoadingSpinner.tsx
│   │   ├── hooks/
│   │   │   └── useSummarize.ts    # API呼び出しロジック
│   │   └── types/
│   │       └── index.ts           # 型定義
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                # Expressサーバー
    ├── src/
    │   ├── index.ts               # サーバーエントリーポイント
    │   ├── routes/
    │   │   └── summarize.ts       # POST /api/summarize
    │   └── services/
    │       └── gemini.ts          # Gemini APIラッパー ← AWS移行時にここだけ変える
    ├── .env                       # GEMINI_API_KEY（gitignore必須）
    └── package.json
```

---

## 設計上の判断メモ

### routes/summarize.ts から直接 gemini.ts を呼ぶ構成について

本来は以下の3層構造が理想：

```
routes/summarize.ts       → ルーティング
services/summarize.ts     → ビジネスロジック
services/gemini.ts        → Gemini APIラッパー
```

ただし今回はエンドポイントが1つのみでビジネスロジックが薄いため、中間層を省略して routes から直接 gemini.ts を呼ぶ構成を採用。規模が拡大した場合は3層構造に移行する。

---

## API仕様

### POST /api/summarize

**Request**

```json
{
  "text": "議事録のテキスト全文..."
}
```

**Response**

```json
{
  "summary": "会議の要約テキスト...",
  "tasks": [
    {
      "id": 1,
      "assignee": "田中",
      "content": "〇〇の資料を作成する",
      "deadline": "今週中"
    },
    {
      "id": 2,
      "assignee": "未定",
      "content": "次回MTGの日程調整",
      "deadline": "明日まで"
    }
  ]
}
```

---

## Gemini プロンプト設計

```
system:
あなたは議事録を分析するアシスタントです。
以下のJSON形式のみで返答してください。余分なテキストは不要です。
{
  "summary": "要約（200字以内）",
  "tasks": [
    { "id": 番号, "assignee": "担当者名（不明な場合は未定）", "content": "タスク内容", "deadline": "期限（記載なければ未定）" }
  ]
}

user:
以下の議事録を分析してください。
{議事録テキスト}
```

---

## 実装ステップ（Phase 1）

### Step 1：バックエンド構築

- [x] `backend/` を Node.js + Express + TypeScript で初期化
- [x] `.env` に `GEMINI_API_KEY` を設定
- [x] `POST /api/summarize` エンドポイントを作成
- [x] Gemini APIを呼び出してJSON形式でレスポンスを返す
- [x] エラーハンドリング（APIエラー・空テキスト）を実装

### Step 2：フロントエンド構築

- [x] `frontend/` を Vite + React + TypeScript で初期化
- [x] 議事録入力テキストエリアを実装
- [x] 「要約する」ボタン押下でバックエンドにPOST
- [x] ローディング状態を表示
- [x] 要約テキストとタスク一覧を表示
- [x] エラー時のメッセージ表示

### Step 3：仕上げ

- [x] CORSの設定（フロント→バックエンドの通信を許可）
- [ ] 入力バリデーション（空文字・文字数制限）　※空文字チェックのみ実装済み、文字数上限は未実装
- [x] UIデザインの整備
- [ ] READMEの作成

---

## Phase 2 移行ガイド：AWS Lambda化

> Phase 1 完了後にここを見る

### 変更箇所（最小限）

```
変更前：backend/src/index.ts（Expressサーバー）
変更後：AWS Lambda関数 + API Gateway

変更が必要なファイル：
- backend/src/services/gemini.ts → Lambda関数ハンドラに流用可能
- frontend/src/hooks/useSummarize.ts → APIのURLをAPI GatewayのURLに変更するだけ
```

### AWS構成（Phase 2）

```
ユーザー
  ↓
API Gateway（POST /summarize）
  ↓
Lambda関数
  ├── Gemini API呼び出し
  └── レスポンスをJSONで返す
```

### 必要なAWSリソース

| リソース        | 用途                                  |
| --------------- | ------------------------------------- |
| AWS Lambda      | バックエンド処理（Express不要になる） |
| API Gateway     | HTTPエンドポイントの公開              |
| IAM Role        | LambdaがAWSサービスを使うための権限   |
| Secrets Manager | GEMINI_API_KEYの安全な管理            |

---

## Phase 3 移行ガイド：フロントエンドをAWSにホスティング

### AWS構成（Phase 3）

```
ユーザー
  ↓
CloudFront（CDN・HTTPS）
  ↓
S3バケット（Reactのビルド済みファイル）
```

### 手順概要

```bash
# ビルド
cd frontend && npm run build

# S3にアップロード
aws s3 sync dist/ s3://your-bucket-name

# CloudFrontのキャッシュ削除
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## 環境変数一覧

| 変数名           | フェーズ  | 説明                                  |
| ---------------- | --------- | ------------------------------------- |
| `GEMINI_API_KEY` | Phase 1〜 | GeminiのAPIキー                       |
| `PORT`           | Phase 1   | Expressのポート番号（デフォルト3001） |
| `VITE_API_URL`   | Phase 1〜 | フロントからAPIを叩くURL              |

---

## 注意事項

- `GEMINI_API_KEY` は絶対にフロントエンドのコードに書かない（GitHubに漏れる）
- `.env` は `.gitignore` に必ず追加する
- Gemini APIは無料枠があるため、開発中は `gemini-3.5-flash` を使う

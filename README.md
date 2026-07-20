# 議事録要約・タスク抽出ツール

議事録テキストを貼り付けると、AIが自動で「要約」と「タスク一覧」を抽出してくれるWebツールです。

転職ポートフォリオとして作成しました。業務効率化 × AI をテーマに、まず動くものを作り、品質改善を経てからAWS構成の要否を判断する方針で進めています。

## 技術スタック

| レイヤー       | 技術                                            |
| -------------- | ----------------------------------------------- |
| フロントエンド | React 19 / TypeScript / Vite / Tailwind CSS v4  |
| バックエンド   | Node.js / Express 5 / TypeScript                |
| AI             | Google Gemini API（`gemini-3.5-flash`）         |

## セットアップ手順

### 前提条件

- Node.js 18以上
- Google Gemini APIキー（[Google AI Studio](https://aistudio.google.com/) から取得）

### バックエンド

```bash
cd backend
npm install
cp .env.example .env   # .envを作成してGEMINI_API_KEYを設定
npm run dev            # http://localhost:3001 で起動
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 で起動
```

## 環境変数

| 変数名           | 説明                               | 例                    |
| ---------------- | ---------------------------------- | ---------------------- |
| `GEMINI_API_KEY` | Google Gemini APIキー              | `AIza...`              |
| `PORT`           | バックエンドのポート番号（省略可） | `3001`（デフォルト）   |

## 使い方

1. ブラウザで `http://localhost:5173` を開く
2. 議事録テキストをテキストエリアに貼り付ける（100〜5000文字）
3. 「要約する」ボタンをクリック
4. 要約とタスク一覧が表示される

## ディレクトリ構成

```
project-root/
├── CLAUDE.md               # 開発方針・設計メモ
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

## Roadmap

- **Phase 1（完了）**: AWSなし構成（React + Express）で動くものを作る
- **Phase 1.5（品質改善・進行中）**: タスク一覧のコピー/エクスポート機能（Markdown / CSV）、タスク抽出の再現率評価
- **Phase 2（保留中）**: バックエンドをAWS Lambda + API Gatewayに移行
- **Phase 3（保留中）**: フロントエンドをS3 + CloudFrontでホスティング

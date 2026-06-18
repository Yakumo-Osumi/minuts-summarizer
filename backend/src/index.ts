import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

/*
dotenv.config()はsummarizeRouterのimportより前に呼ぶ必要がある。
gemini.tsがモジュール読み込み時にprocess.env.GEMINI_API_KEYをトップレベルで参照するため。
CommonJSではimportがrequire()にコンパイルされ上から逐次実行されるので、この配置が有効。
（ESMの場合はimportが巻き上げられるためこの書き方は機能しない）
*/
dotenv.config();

import summarizeRouter from './routes/summarize';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定:フロントエンド（Vite開発サーバー）からのAPIリクエストを許可するため
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// /api/summarizeへのリクエストをsummarizeRouterに振り分けるため
app.use('/api/summarize', summarizeRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

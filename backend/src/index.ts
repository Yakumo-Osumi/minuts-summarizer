import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

/*
dotenv.config()は他のimportより前に呼ぶ必要がある
理由：importされたモジュールはその時点でprocess.envを参照するため、
後からdotenv.config()を呼んでも環境変数が読み込まれない
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

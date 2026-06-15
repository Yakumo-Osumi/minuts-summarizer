import { Router, Request, Response } from 'express';
import { summarizeMeeting } from '../services/gemini';

const router = Router();

/**
 * POST /api/summarize
 * @param text - 議事録テキスト
 * @returns summary (要約)と tasks(タスク一覧)
 */
router.post('/', async (req: Request, res: Response) => {
  console.log('リクエスト受信', req.body);
  const { text } = req.body;

  if (!text || text.trim() === '') {
    res.status(400).json({ error: '議事録テキストを入力してください' });
    return;
  } else if (typeof text !== 'string') {
    res.status(400).json({ error: '文字列を入力してください。' });
    return;
  }

  try {
    const result = await summarizeMeeting(text);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export default router;

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY が設定されていません');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// レスポンスのスキーマ定義
const summarizeSchema = z.object({
  summary: z.string(),
  tasks: z.array(
    z.object({
      id: z.number(),
      assignee: z.string(),
      content: z.string(),
      deadline: z.string(),
    }),
  ),
});

const SYSTEM_PROMPT = `あなたは議事録を分析するアシスタントです。
以下のJSON形式のみで返答してください。余分なテキストは不要です。
{
  "summary": "要約（200字以内）",
  "tasks": [
    { "id": 番号, "assignee": "担当者名（不明な場合は未定）", "content": "タスク内容", "deadline": "期限（記載なければ未定）" }
  ]
}`;

export const summarizeMeeting = async (text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `${SYSTEM_PROMPT}\n\n以下の議事録を分析してください。\n${text}`,
  });

  const responseText = response.text ?? '';

  // JSONのみ抽出（余分なテキストを除去）
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON形式を検知できませんでした');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('JSONの解析に失敗しました');
  }

  try {
    const validated = summarizeSchema.parse(parsed);

    return validated;
  } catch {
    throw new Error('AIが指定したJSON形式で返しませんでした');
  }
};

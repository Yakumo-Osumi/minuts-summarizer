import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY が設定されていません');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
    throw new Error('JSONの解析に失敗しました');
  }

  return JSON.parse(jsonMatch[0]);
};

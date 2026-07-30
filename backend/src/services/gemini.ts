import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY が設定されていません');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// レスポンスのスキーマ定義（TypeScript側：パース結果の型検証用）
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

// レスポンスのスキーマ定義（Gemini API側：responseSchemaでJSON構造そのものを強制）
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: '要約（200字以内）' },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          assignee: {
            type: Type.STRING,
            description: '担当者名（不明な場合は未定）',
          },
          content: { type: Type.STRING },
          deadline: {
            type: Type.STRING,
            description: '期限',
          },
        },
        required: ['id', 'assignee', 'content', 'deadline'],
        propertyOrdering: ['id', 'assignee', 'content', 'deadline'],
      },
    },
  },
  required: ['summary', 'tasks'],
};

// labeling-rules.md のタスク判定基準をそのままシステム指示として分離
const SYSTEM_INSTRUCTION = `あなたは議事録を分析し、要約とタスクを抽出するアシスタントです。

## タスクの定義
期限までに何をするのかが明確な事柄。

## タスクに含めるもの
1. 期限（例: 2026年9月30日）と行動を含むもの。
2.「次回までに」「来週まで」等の相対的な期限も、期限ありとして扱う。
3.「担当を決める」「発注先を選定する」など、意思決定を行うこと自体もタスクとして抽出する。

## タスクに含めないもの
1. 期限が含まれていないもの（例: "サーバー移設については別途調整", "担当は決めたが実施日は時期未定" 等）
2. 行動のない予定の決定事項（例: "創立記念日は10月1日", "社内システムのメンテナンスは今週末", "歓迎会の開催" 等）
3. 感想・提案のみで実施が決定していないもの（例: "そろそろ社内勉強会を再開してもよいかも、という案が出た"）

## 迷ったときの判断基準（エッジケース）
1. 担当者が曖昧なときは、assigneeを"不明"とする
2. 期限が"〜月初旬"、"〜月中旬"、"〜月下旬"などの曖昧なときは"(仮)"を先頭に付け具体的な日付をつける（例: "4月上旬までに"→"2026年4月8日まで"）
3. 行動が曖昧なとき、"検討する"などは抽象度を下げた表現に言い換える（例: "体制について見直す"→"新体制の案を資料にまとめる"）

## 各フィールドの定義
- assignee: タスクを実行する人達の名前。承認者や確認者は含まない。敬称を付けない。誰が行うか決まっていない場合は"不明"とする。
- content: 何をするかという情報を持つフィールド。
- deadline: タスクの期限を持つフィールド。`;

export const summarizeMeeting = async (text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: text,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const responseText = response.text ?? '';

  let parsed;
  try {
    parsed = JSON.parse(responseText);
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

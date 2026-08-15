/// <reference types="node" />
import fs from 'fs';
import path from 'path';

type Task = {
  id: number;
  assignee: string;
  content: string;
  deadline: string;
};

type MatchKey = {
  noun: string;
};

type GoldTask = Task & { matchKey: MatchKey };

type GoldFile = { summary: string; tasks: GoldTask[] };
type OutputFile = { summary: string; tasks: Task[] };

type SampleData = {
  name: string;
  goldTasks: GoldTask[];
  outputTasks: Task[];
};

type MatchedPair = { gold: GoldTask; output: Task };

type SampleResult = {
  name: string;
  matches: MatchedPair[];
  unmatchedGold: GoldTask[];
  unmatchedOutput: Task[];
};

const SAMPLE_NAMES = ['sample1', 'sample2', 'sample3'];
const HOLDOUT_NAMES = ['holdout1', 'holdout2'];

// `npm run eval -- holdout` のように第1引数でデータセットを切り替える（未指定時はsample）
function resolveDatasetNames(): string[] {
  const dataset = process.argv[2];
  if (dataset === 'holdout') return HOLDOUT_NAMES;
  return SAMPLE_NAMES;
}

// 担当者が曖昧な場合の表記ゆれ（labeling-rules.mdは"不明"、Gemini APIの出力仕様は"未定"）を吸収する
const UNASSIGNED_ALIASES = new Set(['不明', '未定']);

function normalizeAssignee(assignee: string): string {
  return UNASSIGNED_ALIASES.has(assignee) ? '未定' : assignee;
}

// 日本語の格助詞の有無による表記ゆれ（例：「送料改定のお知らせページ」/「送料改定お知らせページ」）を吸収するため、
// 比較の直前にのみ助詞を除去する（gold・outputの元データは変更しない）
function normalizeForMatch(text: string): string {
  return text.replace(/[のをがはにでとへも]/g, '');
}

function matchKeyMatches(matchKey: MatchKey, content: string): boolean {
  return normalizeForMatch(content).includes(normalizeForMatch(matchKey.noun));
}

// "2026年07月17日" や "次回定例（2026年7月21日）まで" のように埋め込まれた日付を抽出し、ISO形式に正規化する
function extractIsoDate(text: string): string | null {
  const match = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!match) return null;
  const year = match[1];
  const month = match[2];
  const day = match[3];
  if (!year || !month || !day) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// 基準日が不明な相対期限の表記ゆれ（例：「次回定例まで」「次回ミーティングまで」）を吸収するため、
// 付随語を除去し核となる相対語のみを残す（比較の直前にのみ適用し、gold・outputの元データは変更しない）
function normalizeRelativeDeadline(text: string): string {
  return text.replace(/(定例|ミーティング|まで)/g, '').trim();
}

function deadlineMatches(goldDeadline: string, outputDeadline: string): boolean {
  const goldIso = extractIsoDate(goldDeadline);
  const outputIso = extractIsoDate(outputDeadline);
  if (goldIso !== null && outputIso !== null) return goldIso === outputIso;
  if (goldIso !== null || outputIso !== null) return false;
  return normalizeRelativeDeadline(goldDeadline) === normalizeRelativeDeadline(outputDeadline);
}

function loadSample(name: string): SampleData {
  const goldPath = path.join(__dirname, 'labels', `${name}.json`);
  const outputPath = path.join(__dirname, 'outputs', `${name}.json`);
  const gold: GoldFile = JSON.parse(fs.readFileSync(goldPath, 'utf-8'));
  const output: OutputFile = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
  return { name, goldTasks: gold.tasks, outputTasks: output.tasks };
}

// 各goldタスクについて、assignee一致 かつ matchKey一致 の出力タスクを貪欲法で1つだけ対応付ける
function matchSample(sample: SampleData): SampleResult {
  const remainingOutputs = [...sample.outputTasks];
  const matches: MatchedPair[] = [];
  const unmatchedGold: GoldTask[] = [];

  for (const gold of sample.goldTasks) {
    const candidateIndex = remainingOutputs.findIndex(
      (output) =>
        normalizeAssignee(output.assignee) === normalizeAssignee(gold.assignee) &&
        matchKeyMatches(gold.matchKey, output.content),
    );

    if (candidateIndex === -1) {
      unmatchedGold.push(gold);
      continue;
    }

    const output = remainingOutputs.splice(candidateIndex, 1)[0]!;
    matches.push({ gold, output });
  }

  return {
    name: sample.name,
    matches,
    unmatchedGold,
    unmatchedOutput: remainingOutputs,
  };
}

type Metrics = {
  recall: number;
  precision: number;
  deadlineAccuracy: number;
};

function computeMetrics(matchCount: number, goldCount: number, outputCount: number, deadlineMatchCount: number): Metrics {
  return {
    recall: goldCount === 0 ? 1 : matchCount / goldCount,
    precision: outputCount === 0 ? 1 : matchCount / outputCount,
    deadlineAccuracy: matchCount === 0 ? 1 : deadlineMatchCount / matchCount,
  };
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function main() {
  const results = resolveDatasetNames().map((name) => matchSample(loadSample(name)));

  const tableRows: Record<string, string>[] = [];
  let totalGold = 0;
  let totalOutput = 0;
  let totalMatches = 0;
  let totalDeadlineMatches = 0;

  for (const result of results) {
    const goldCount = result.matches.length + result.unmatchedGold.length;
    const outputCount = result.matches.length + result.unmatchedOutput.length;
    const deadlineMatchCount = result.matches.filter((pair) =>
      deadlineMatches(pair.gold.deadline, pair.output.deadline),
    ).length;

    const metrics = computeMetrics(result.matches.length, goldCount, outputCount, deadlineMatchCount);

    tableRows.push({
      sample: result.name,
      recall: formatPercent(metrics.recall),
      precision: formatPercent(metrics.precision),
      deadlineAccuracy: formatPercent(metrics.deadlineAccuracy),
    });

    totalGold += goldCount;
    totalOutput += outputCount;
    totalMatches += result.matches.length;
    totalDeadlineMatches += deadlineMatchCount;
  }

  const aggregateMetrics = computeMetrics(totalMatches, totalGold, totalOutput, totalDeadlineMatches);
  tableRows.push({
    sample: '合計（マイクロ平均）',
    recall: formatPercent(aggregateMetrics.recall),
    precision: formatPercent(aggregateMetrics.precision),
    deadlineAccuracy: formatPercent(aggregateMetrics.deadlineAccuracy),
  });

  console.table(tableRows);

  for (const result of results) {
    if (result.unmatchedGold.length === 0 && result.unmatchedOutput.length === 0) continue;

    console.log(`\n--- ${result.name} ---`);
    for (const gold of result.unmatchedGold) {
      console.log(`FN（見逃し）: ${gold.assignee} / ${gold.content} / ${gold.deadline}`);
    }
    for (const output of result.unmatchedOutput) {
      console.log(`FP（誤抽出）: ${output.assignee} / ${output.content} / ${output.deadline}`);
    }
  }
}

main();

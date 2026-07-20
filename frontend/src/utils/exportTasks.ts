import type { Task } from "../types";

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r\n|\r|\n/g, "<br>");
}

export function toMarkdown(tasks: Task[]): string {
  const header = "| 担当者 | タスク内容 | 期限 |";
  const separator = "| --- | --- | --- |";
  const rows = tasks.map(
    (task) =>
      `| ${escapeMarkdownCell(task.assignee)} | ${escapeMarkdownCell(task.content)} | ${escapeMarkdownCell(task.deadline)} |`,
  );
  return [header, separator, ...rows].join("\n");
}

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(tasks: Task[]): string {
  const BOM = "\uFEFF";
  const header = ["担当者", "タスク内容", "期限"].join(",");
  const rows = tasks.map((task) =>
    [
      escapeCsvField(task.assignee),
      escapeCsvField(task.content),
      escapeCsvField(task.deadline),
    ].join(","),
  );
  return BOM + [header, ...rows].join("\r\n");
}

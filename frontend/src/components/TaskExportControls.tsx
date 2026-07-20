import { useState } from "react";
import type { Task } from "../types";
import { toCsv, toMarkdown } from "../utils/exportTasks";

type Props = {
  tasks: Task[];
};

type Format = "markdown" | "csv";

const FORMAT_CONFIG: Record<
  Format,
  { convert: (tasks: Task[]) => string; extension: string; mimeType: string }
> = {
  markdown: {
    convert: toMarkdown,
    extension: "md",
    mimeType: "text/markdown",
  },
  csv: {
    convert: toCsv,
    extension: "csv",
    mimeType: "text/csv",
  },
};

function buildFileName(extension: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `tasks_${year}${month}${day}.${extension}`;
}

function TaskExportControls({ tasks }: Props) {
  const [format, setFormat] = useState<Format>("markdown");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isDisabled = tasks.length === 0;

  const handleCopy = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const text = FORMAT_CONFIG[format].convert(tasks);
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage("コピーしました");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch {
      setErrorMessage("コピーに失敗しました");
    }
  };

  const handleDownload = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const { convert, extension, mimeType } = FORMAT_CONFIG[format];
      const text = convert(tasks);
      const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = buildFileName(extension);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch {
      setErrorMessage("ダウンロードに失敗しました");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <label htmlFor="export-format" className="text-sm text-gray-600">
          形式
        </label>
        <select
          id="export-format"
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={format}
          onChange={(e) => setFormat(e.target.value as Format)}
        >
          <option value="markdown">Markdown</option>
          <option value="csv">CSV</option>
        </select>
        <button
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1.5 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={handleCopy}
          disabled={isDisabled}
        >
          コピー
        </button>
        <button
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1.5 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={handleDownload}
          disabled={isDisabled}
        >
          ダウンロード
        </button>
      </div>
      {successMessage && (
        <span className="text-sm text-green-600">{successMessage}</span>
      )}
      {errorMessage && (
        <span className="text-sm text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}

export default TaskExportControls;

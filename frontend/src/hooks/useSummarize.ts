import { useState } from "react";
import type { SummarizeResponse } from "../types";

export const useSummarize = () => {
  const [result, setResult] = useState<SummarizeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "サーバーエラーが発生しました");
      }

      const data: SummarizeResponse = await response.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "予期せぬエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, error, summarize };
};

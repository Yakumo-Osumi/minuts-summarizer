import { useState } from "react";
import { useSummarize } from "./hooks/useSummarize";
import InputArea from "./components/InputArea";
import ResultArea from "./components/ResultArea";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const [text, setText] = useState("");
  const { result, isLoading, error, summarize } = useSummarize();

  const handleSubmit = () => {
    if (text.trim() === "") return;
    summarize(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            議事録要約ツール
          </h1>
          <p className="text-gray-500 text-sm">
            議事録を貼り付けるだけで、要約とタスクを自動抽出します
          </p>
        </div>
        <InputArea
          value={text}
          onChange={setText}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        {isLoading && <LoadingSpinner />}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex gap-2 items-center">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {result && <ResultArea result={result} />}
      </div>
    </div>
  );
}

export default App;

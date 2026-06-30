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
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          議事録要約ツール
        </h1>
        <InputArea
          value={text}
          onChange={setText}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        {isLoading && <LoadingSpinner />}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}
        {result && <ResultArea result={result} />}
      </div>
    </div>
  );
}

export default App;

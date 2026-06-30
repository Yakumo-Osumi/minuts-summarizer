import type { SummarizeResponse } from "../types";

type Props = {
  result: SummarizeResponse;
};

function ResultArea({ result }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3">要約</h2>
        <p className="text-gray-700 leading-relaxed">{result.summary}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3">タスク一覧</h2>
        <ul className="flex flex-col gap-3">
          {result.tasks.map((task) => (
            <li
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex gap-2 text-sm text-gray-500 mb-1">
                <span>担当：{task.assignee}</span>
                <span>期限：{task.deadline}</span>
              </div>
              <p className="text-gray-800">{task.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ResultArea;

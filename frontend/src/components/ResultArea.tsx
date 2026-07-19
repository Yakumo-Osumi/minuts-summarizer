import type { SummarizeResponse } from "../types";

type Props = {
  result: SummarizeResponse;
};

function ResultArea({ result }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-50 border-l-4 border-blue-500 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3 text-blue-700">要約</h2>
        <p className="text-gray-700 leading-relaxed">{result.summary}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3 text-gray-800">タスク一覧</h2>
        {result.tasks.length === 0 ? (
          <p className="text-gray-400 text-sm">タスクはありませんでした</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {result.tasks.map((task) => (
              <li
                key={task.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex gap-2 text-sm mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    担当：{task.assignee}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    期限：{task.deadline}
                  </span>
                </div>
                <p className="text-gray-800">{task.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ResultArea;

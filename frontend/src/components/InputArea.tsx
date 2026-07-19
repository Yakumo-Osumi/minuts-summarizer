type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
};

const MIN_LENGTH = 100;
const MAX_LENGTH = 5000;

function InputArea({ value, onChange, onSubmit, isLoading }: Props) {
  const isUnderMin = value.length > 0 && value.length < MIN_LENGTH;
  const isOverMax = value.length > MAX_LENGTH;
  const isDisabled =
    isLoading || isUnderMin || isOverMax || value.trim() === "";

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="minutes-input"
        className="text-sm font-medium text-gray-700"
      >
        議事録テキスト
      </label>
      <textarea
        id="minutes-input"
        className="w-full min-h-48 p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="議事録テキストを貼り付けてください..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex justify-between text-sm">
        {isUnderMin && (
          <span className="text-red-500">
            {MIN_LENGTH}文字以上入力してください
          </span>
        )}
        {isOverMax && (
          <span className="text-red-500">
            {MAX_LENGTH}文字以内で入力してください
          </span>
        )}
        {!isUnderMin && !isOverMax && <span />}
        <span className={isOverMax ? "text-red-500" : "text-gray-400"}>
          {value.length} / {MAX_LENGTH}
        </span>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={onSubmit}
        disabled={isDisabled}
      >
        {isLoading ? "要約中..." : "要約する"}
      </button>
    </div>
  );
}

export default InputArea;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
};

function InputArea({ value, onChange, onSubmit, isLoading }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <textarea
        id="minutes-input"
        className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="議事録テキストを貼り付けてください..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? "要約中..." : "要約する"}
      </button>
    </div>
  );
}

export default InputArea;

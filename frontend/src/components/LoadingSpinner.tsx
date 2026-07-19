function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8 gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      <p className="text-gray-500 text-sm">要約中...</p>
    </div>
  );
}

export default LoadingSpinner;

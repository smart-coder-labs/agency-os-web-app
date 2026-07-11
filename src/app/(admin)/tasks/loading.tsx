export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 rounded-lg w-32" />
          <div className="h-4 bg-gray-100 rounded w-72" />
        </div>
        <div className="h-9 bg-gray-100 rounded-lg w-28" />
      </div>

      {/* 3 metric cards */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-12 bg-gray-50 border-b border-gray-200" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 border-b border-gray-50 flex items-center px-6 gap-4">
            <div className="h-4 bg-gray-100 rounded w-48" />
            <div className="h-5 bg-gray-100 rounded-full w-16" />
            <div className="h-4 bg-gray-100 rounded w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

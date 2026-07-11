export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 rounded-lg w-56" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-gray-100 rounded-lg w-28" />
          <div className="h-9 bg-gray-100 rounded-lg w-28" />
        </div>
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>

      {/* Tabs bar */}
      <div className="h-11 bg-gray-100 rounded-xl w-full" />

      {/* Tab content skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-12 bg-gray-50 border-b border-gray-200" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 border-b border-gray-50 flex items-center px-6 gap-4">
            <div className="h-4 bg-gray-100 rounded w-48" />
            <div className="h-4 bg-gray-100 rounded w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

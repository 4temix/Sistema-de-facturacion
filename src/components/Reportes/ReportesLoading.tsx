export default function ReportesLoading() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-6 lg:p-8 animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-64 shimmer mb-3"></div>
          <div className="h-4 w-80 shimmer"></div>
        </div>

        {/* Year Cards (skeletons) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-16 shimmer"></div>
                <div className="h-6 w-10 shimmer"></div>
              </div>

              <div className="mb-6">
                <div className="h-3 w-24 shimmer mb-2"></div>
                <div className="h-8 w-32 shimmer"></div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="h-3 w-32 shimmer mb-3"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-8 shimmer rounded"></div>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="shimmer h-full w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="h-4 w-24 shimmer"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Otros reportes */}
        <div className="mt-12">
          <div className="h-6 w-40 shimmer mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shimmer rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 shimmer mb-2"></div>
                    <div className="h-3 w-32 shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

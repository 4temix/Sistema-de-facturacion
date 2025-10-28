export function FacturaSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full sm:w-[600px] h-full overflow-y-auto shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="shimmer h-6 w-40 rounded"></div>
            <div className="shimmer h-4 w-32 rounded"></div>
          </div>
          <div className="shimmer h-6 w-20 rounded-full"></div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-lg border text-center space-y-2"
            >
              <div className="shimmer h-3 w-16 mx-auto rounded"></div>
              <div className="shimmer h-5 w-24 mx-auto rounded"></div>
            </div>
          ))}
        </div>

        {/* Cliente */}
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200 space-y-2">
          <div className="shimmer h-4 w-24 rounded"></div>
          <div className="shimmer h-4 w-40 rounded"></div>
          <div className="shimmer h-3 w-32 rounded"></div>
          <div className="shimmer h-3 w-28 rounded"></div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border p-3 rounded-lg space-y-2">
              <div className="shimmer h-3 w-16 rounded"></div>
              <div className="shimmer h-4 w-24 rounded"></div>
            </div>
          ))}
        </div>

        {/* Productos */}
        <div className="space-y-3">
          <div className="shimmer h-4 w-24 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b py-2"
            >
              <div className="space-y-1">
                <div className="shimmer h-3 w-32 rounded"></div>
                <div className="shimmer h-3 w-24 rounded"></div>
              </div>
              <div className="shimmer h-4 w-16 rounded"></div>
            </div>
          ))}
        </div>

        {/* Ganancia y Margen */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="border p-4 rounded-lg space-y-2 bg-gray-50">
              <div className="shimmer h-3 w-20 rounded"></div>
              <div className="shimmer h-5 w-28 rounded"></div>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <div className="shimmer h-9 w-full rounded-lg"></div>
          <div className="shimmer h-9 w-full rounded-lg"></div>
        </div>

        <div className="shimmer h-9 w-full rounded-lg"></div>
      </div>
    </div>
  );
}

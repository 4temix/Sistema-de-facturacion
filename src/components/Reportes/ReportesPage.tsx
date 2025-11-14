import { VentasAnuales } from "../../Types/Reportes";
import { Link } from "react-router";

type Params = {
  data: VentasAnuales[];
};

export default function ReportesPage({ data = [] }: Params) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportes Anuales
          </h1>
          <p className="text-gray-600">
            Selecciona un año para ver el desglose mensual
          </p>
        </div>

        {/* Year Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((yearData) => (
            <Link
              key={yearData.anio}
              to={`/reportes/${yearData.anio}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              {/* Year Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {yearData.anio}
                </h2>
              </div>

              {/* Total Sales */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Ventas Totales</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${yearData.totalVentas.toLocaleString()}
                </p>
              </div>

              {/* Sales Bar Chart Visualization */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-medium text-gray-600 mb-3">
                  Ventas por Mes
                </p>
                <div className="space-y-1.5">
                  {[
                    { month: "Ene", value: yearData.ventasMensuales[0] },
                    { month: "Feb", value: yearData.ventasMensuales[1] },
                    { month: "Mar", value: yearData.ventasMensuales[2] },
                    { month: "Abr", value: yearData.ventasMensuales[3] },
                    { month: "May", value: yearData.ventasMensuales[4] },
                    { month: "Jun", value: yearData.ventasMensuales[5] },
                    { month: "Jul", value: yearData.ventasMensuales[6] },
                    { month: "Ago", value: yearData.ventasMensuales[7] },
                    { month: "Sep", value: yearData.ventasMensuales[8] },
                    { month: "Oct", value: yearData.ventasMensuales[9] },
                    { month: "Nov", value: yearData.ventasMensuales[10] },
                    { month: "Dic", value: yearData.ventasMensuales[11] },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">
                        {item.month}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            item.value > 0
                              ? "from-blue-500 to-blue-600"
                              : "from-error-500 to-error-600"
                          }  rounded-full transition-all`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 font-medium group-hover:text-blue-700">
                    Ver detalles →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Access to Other Reports */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Otros Reportes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/reportes/productos-top"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  {/* Icon: TrendingUp */}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Productos Top</p>
                  <p className="text-xs text-gray-600">Rankings y tendencias</p>
                </div>
              </div>
            </Link>

            <Link
              to="/reportes/categorias"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  {/* Icon: Tag */}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Por Categorías</p>
                  <p className="text-xs text-gray-600">Análisis detallado</p>
                </div>
              </div>
            </Link>

            <Link
              to="/reportes/devoluciones"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  {/* Icon: RotateCcw */}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Devoluciones</p>
                  <p className="text-xs text-gray-600">Control de retornos</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

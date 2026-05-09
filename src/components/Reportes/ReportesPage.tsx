import { VentasAnuales } from "../../Types/Reportes";
import { Link } from "react-router";
import { TbCalendarStats } from "react-icons/tb";
import { mesMetaEncadenada } from "../../Utilities/reportesMesMetaEncadenada";

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

type Params = {
  data: VentasAnuales[];
};

export default function ReportesPage({ data = [] }: Params) {
  return (
    <div className="flex bg-gray-50">
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
                <TbCalendarStats className="text-blue-500 text-2xl" />
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
                  {MESES_CORTOS.map((month, idx) => {
                    const ventas = yearData.ventasMensuales[idx] ?? 0;
                    const ventasMesPrevio =
                      idx === 0 ? null : (yearData.ventasMensuales[idx - 1] ?? 0);
                    const meta = mesMetaEncadenada(ventas, ventasMesPrevio);

                    return (
                    <div
                      key={`${yearData.anio}-${idx}`}
                      className="flex items-center gap-2"
                      title={
                        meta.esMesReferencia
                          ? "Primer mes del año: referencia base para el resto."
                          : "Barra según ventas vs el mes anterior (100% = igualaste ese total)."
                      }
                    >
                      <span className="text-xs text-gray-500 w-8">
                        {month}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all bg-gradient-to-r ${
                            meta.superoMeta
                              ? "from-green-500 to-green-600"
                              : meta.anchoBarra > 0
                                ? "from-blue-500 to-blue-600"
                                : "from-gray-300 to-gray-400"
                          }`}
                          style={{
                            width: `${meta.anchoBarra}%`,
                          }}
                        />
                      </div>
                    </div>
                    );
                  })}
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
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { DetailsYearType, VentaMensual } from "../../Types/Reportes";
import { Link } from "react-router";
import { TbCurrencyDollar, TbChartBar, TbTrophy } from "react-icons/tb";
import { mesMetaEncadenada } from "../../Utilities/reportesMesMetaEncadenada";

type Params = {
  data: DetailsYearType;
};

export default function DetailsYear({ data }: Params) {
  const [mejorMes, setMejorMes] = useState<VentaMensual | null>(null);

  let comp = parseFloat(
    data.comparacionAnioAnterior != null
      ? data.comparacionAnioAnterior.toFixed(2)
      : "100"
  );

  useEffect(() => {
    if (data.ventasMensuales.length > 0) {
      // 🔹 Encontrar el mes con mayor totalMes
      const mesTop = data.ventasMensuales.reduce((max, venta) =>
        venta.totalMes > max.totalMes ? venta : max
      );
      setMejorMes(mesTop);
    }
  }, [data.ventasMensuales]);
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/reportes"
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Volver a Años
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportes {data.anio}
          </h1>
          <p className="text-gray-600">
            Selecciona un mes para ver el reporte detallado
          </p>
        </div>

        {/* Year Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm">
                Ventas Totales {data.anio}
              </p>
              <TbCurrencyDollar className="text-blue-200 text-2xl" />
            </div>
            <p className="text-3xl font-bold">
              RD${data.totalAnual.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Comparación año anterior</p>
              <TbChartBar className="text-green-500 text-2xl" />
            </div>
            <p
              className={`text-3xl font-bold text-${
                comp < 0 ? "error" : "green"
              }-600`}
            >
              {comp > 0 ? "+" + comp : comp < 0 ? comp : 0}%
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Mejor Mes</p>
              <TbTrophy className="text-yellow-500 text-2xl" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {mejorMes?.mesNombre}
            </p>
            <p className="text-sm text-gray-600">
              ${mejorMes?.totalMes.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Monthly Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.ventasMensuales.map((monthData, index) => {
            const totalAnterior =
              index === 0
                ? null
                : data.ventasMensuales[index - 1]!.totalMes;
            const meta = mesMetaEncadenada(monthData.totalMes, totalAnterior);
            const badgeClass = meta.superoMeta
              ? "bg-green-100 text-green-700"
              : meta.esMesReferencia
                ? "bg-blue-100 text-blue-700"
                : meta.anchoBarra >= 100
                  ? "bg-blue-100 text-blue-700"
                  : meta.anchoBarra < 50
                    ? "bg-gray-100 text-gray-700"
                    : "bg-blue-50 text-blue-800";

            return (
            <Link
              key={monthData.mesNumero}
              to={`/reportes/${data.anio}/${monthData.mesNumero}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              {/* Month Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {monthData.mesNombre}
                </h3>
                <div
                  title="Respecto al total de ventas del mes anterior en la lista (el primero es mes base)."
                  className={`text-xs font-medium px-2 py-1 rounded-full ${badgeClass}`}
                >
                  {meta.etiquetaProgreso}
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ventas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    RD${monthData.totalMes.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Facturas</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {monthData.cantidadFacturas}
                    </p>
                  </div>
                  {/* <div>
                    <p className="text-xs text-gray-600 mb-1">Ticket Prom.</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${monthData.avgTicket}
                    </p>
                  </div> */}
                </div>
              </div>

              {/* Progress Bar: meta = ventas del mes previo en el listado */}
              <div className="mb-4">
                <p className="text-[10px] text-gray-500 mb-1">
                  {meta.esMesReferencia
                    ? "Mes base del seguimiento"
                    : "Avance vs mes anterior"}
                </p>
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      meta.superoMeta
                        ? "from-green-500 to-green-600"
                        : "from-blue-500 to-blue-600"
                    }`}
                    style={{
                      width: `${meta.anchoBarra}%`,
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                  Ver reporte completo →
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

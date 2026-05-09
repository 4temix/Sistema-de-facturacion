import { mesMetaEncadenada } from "../../Utilities/reportesMesMetaEncadenada";
import { ventasSemanaAnteriorDesdeVariacion } from "../../Utilities/ventasSemanaAnteriorDesdeVariacion";
import { TbChartArcs } from "react-icons/tb";

const fmtDOP = (n: number) =>
  new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

type Properties = {
  ventasSemana: number;
  variacionSemanal: number;
};

export default function MonthlyTarget({
  ventasSemana,
  variacionSemanal,
}: Properties) {
  const anterior = ventasSemanaAnteriorDesdeVariacion(
    ventasSemana,
    variacionSemanal
  );
  const puedeComparar = anterior != null;
  const diferencia = puedeComparar ? ventasSemana - anterior : null;
  const meta = puedeComparar
    ? mesMetaEncadenada(ventasSemana, anterior)
    : null;

  const textoVariacion = (() => {
    if (!Number.isFinite(variacionSemanal)) {
      return null;
    }
    const v = Math.round(variacionSemanal);
    if (v === 0) {
      return "Igual que la semana pasada (en ventas).";
    }
    if (v > 0) {
      return `Por encima de la semana pasada: +${v} % en ventas.`;
    }
    return `Por debajo de la semana pasada: ${v} % en ventas.`;
  })();

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-8 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Ventas semanales
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comparación con la semana anterior, en pesos y en breve.
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/15">
            <TbChartArcs className="text-xl text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {puedeComparar && anterior != null && diferencia != null && meta ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Semana anterior
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                  {fmtDOP(anterior)}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <p className="text-xs font-medium text-blue-800/80 dark:text-blue-200/90">
                  Esta semana
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-blue-950 dark:text-white">
                  {fmtDOP(ventasSemana)}
                </p>
              </div>
            </div>

            <div
              className={`mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm ${
                diferencia >= 0
                  ? "bg-green-50 text-green-900 dark:bg-green-500/10 dark:text-green-100"
                  : "bg-amber-50 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100"
              }`}
            >
              <span className="font-medium">Diferencia</span>
              <span className="font-bold tabular-nums">
                {diferencia >= 0 ? "+" : "−"}
                {fmtDOP(Math.abs(diferencia))}
              </span>
            </div>

            {textoVariacion && (
              <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                {textoVariacion}
              </p>
            )}

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Avance frente a la semana pasada</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${
                    meta.superoMeta
                      ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200"
                      : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                  }`}
                >
                  {meta.etiquetaProgreso}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all ${
                    meta.superoMeta
                      ? "from-green-500 to-green-600"
                      : meta.anchoBarra > 0
                        ? "from-blue-500 to-blue-600"
                        : "from-gray-300 to-gray-400"
                  }`}
                  style={{ width: `${meta.anchoBarra}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                100 % en la barra = mismo volumen de ventas que la semana pasada.
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {fmtDOP(ventasSemana)}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Ventas de la semana en curso. No se pudo calcular la semana anterior
              a partir del porcentaje recibido (dato incomparable o variación en
              −100 %).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

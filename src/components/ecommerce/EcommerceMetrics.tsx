import { BoxIconLine } from "../../icons";

type Parameters = {
  ventas: number;
  ganancias: number;
};

export default function EcommerceMetrics({
  ventas = 0,
  ganancias = 0,
}: Parameters) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ventas de la semana
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              RD{" "}
              {new Intl.NumberFormat("es-DO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(ventas)}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ganancias de la semana
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              RD{" "}
              {new Intl.NumberFormat("es-DO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(ganancias)}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}

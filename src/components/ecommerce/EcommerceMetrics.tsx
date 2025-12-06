import { TbShoppingCart, TbTrendingUp } from "react-icons/tb";

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
      {/* Ventas de la semana */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-500/20">
          <TbShoppingCart className="text-blue-600 dark:text-blue-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Ventas de la semana
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            ${ventas.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </h4>
        </div>
      </div>

      {/* Ganancias de la semana */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-500/20">
          <TbTrendingUp className="text-green-600 dark:text-green-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Ganancias de la semana
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            ${ganancias.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </h4>
        </div>
      </div>
    </div>
  );
}

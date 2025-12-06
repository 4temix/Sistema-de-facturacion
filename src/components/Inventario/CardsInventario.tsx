import {
  TbPackages,
  TbAlertTriangle,
  TbPackageOff,
  TbCash,
} from "react-icons/tb";
import { Metricas } from "../../Types/ProductTypes";

export default function CardsInventario({
  totalProductos,
  valorTotal,
  stockBajo,
  agotados,
}: Metricas) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {/* Total Productos */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-500/20">
          <TbPackages className="text-blue-600 dark:text-blue-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Productos
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {totalProductos ?? 0}
          </h4>
        </div>
      </div>

      {/* Stock Bajo */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl dark:bg-amber-500/20">
          <TbAlertTriangle className="text-amber-600 dark:text-amber-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Stock Bajo
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {stockBajo ?? 0}
          </h4>
        </div>
      </div>

      {/* Agotados */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-500/20">
          <TbPackageOff className="text-red-600 dark:text-red-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Agotados
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {agotados ?? 0}
          </h4>
        </div>
      </div>

      {/* Costo Total del Inventario */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-500/20">
          <TbCash className="text-green-600 dark:text-green-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Costo Total Inventario
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            ${valorTotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </h4>
        </div>
      </div>
    </div>
  );
}

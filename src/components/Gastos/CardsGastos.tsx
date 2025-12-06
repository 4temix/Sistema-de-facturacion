import {
  TbReportMoney,
  TbClockDollar,
  TbCircleCheck,
  TbReceipt,
  TbPackages,
} from "react-icons/tb";

type Props = {
  totalGastosMes: number;
  gastosPendientes: number;
  gastosPagados: number;
  cantidadGastosMes: number;
  gastosInventarioMes: number;
};

export default function CardsGastos({
  totalGastosMes,
  gastosPendientes,
  gastosPagados,
  cantidadGastosMes,
  gastosInventarioMes,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
      {/* Total Gastos del Mes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-500/20">
          <TbReportMoney className="text-blue-600 dark:text-blue-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Gastos del Mes
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            ${totalGastosMes.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </h4>
        </div>
      </div>

      {/* Gastos Pendientes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl dark:bg-amber-500/20">
          <TbClockDollar className="text-amber-600 dark:text-amber-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Gastos Pendientes
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            ${gastosPendientes.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </h4>
        </div>
      </div>

      {/* Gastos Pagados */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-500/20">
          <TbCircleCheck className="text-green-600 dark:text-green-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Gastos Pagados
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            ${gastosPagados.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </h4>
        </div>
      </div>

      {/* Cantidad de Gastos */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-500/20">
          <TbReceipt className="text-purple-600 dark:text-purple-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Cantidad de Gastos
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {cantidadGastosMes}
          </h4>
        </div>
      </div>

      {/* Gastos de Inventario */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl dark:bg-indigo-500/20">
          <TbPackages className="text-indigo-600 dark:text-indigo-400 text-2xl" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Gastos Inventario
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            ${gastosInventarioMes.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </h4>
        </div>
      </div>
    </div>
  );
}


import { useUserData } from "../../context/GlobalUserContext";
import {
  GastoList,
  GastoUpdate,
  SelectsGastosTable,
} from "../../Types/Gastos";
import { User } from "../../Types/Usuario";
import {
  handlePrintGastoFullPage,
  handlePrintGastoThermal,
} from "../../hooks/useImpresion";
import { LuPrinter } from "react-icons/lu";
import { FiEdit2 } from "react-icons/fi";
import {
  TbReceipt,
  TbBuildingStore,
  TbCalendar,
  TbNotes,
} from "react-icons/tb";

type GastoDetailsProps = {
  onClose: () => void;
  detail: GastoUpdate | null;
  /** Fila de la tabla (fecha, tipo y estado legibles) */
  summary: GastoList | null;
  selectsTable?: SelectsGastosTable;
  isLoading?: boolean;
  onEditar: (id: number) => void;
};

function labelTipo(
  detail: GastoUpdate,
  summary: GastoList | null,
  selects?: SelectsGastosTable,
): string {
  const fromSelect = selects?.tiposGastos?.find((t) => t.id === detail.tipoGasto);
  if (fromSelect) return fromSelect.name;
  return summary?.tipoGasto ?? `Tipo #${detail.tipoGasto}`;
}

function labelEstado(
  detail: GastoUpdate,
  summary: GastoList | null,
  selects?: SelectsGastosTable,
): string {
  const fromSelect = selects?.estadosGastos?.find((e) => e.id === detail.estado);
  if (fromSelect) return fromSelect.name;
  return summary?.estado ?? `Estado #${detail.estado}`;
}

export default function GastoDetails({
  onClose,
  detail,
  summary,
  selectsTable,
  isLoading,
  onEditar,
}: GastoDetailsProps) {
  const { user } = useUserData();

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    }).format(n);

  if (isLoading) {
    return (
      <div className="bg-white w-full h-full overflow-y-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="h-20 bg-gray-100 rounded-lg" />
            <div className="h-20 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-32 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bg-white w-full h-full overflow-y-auto p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          No se pudieron cargar los detalles del gasto.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-200 dark:bg-gray-700 py-2 rounded-lg"
        >
          Cerrar
        </button>
      </div>
    );
  }

  const fechaGasto =
    detail.fecha ?? summary?.fecha ?? null;
  const tipoLabel = labelTipo(detail, summary, selectsTable);
  const estadoLabel = labelEstado(detail, summary, selectsTable);

  return (
    <div className="bg-white w-full h-full overflow-y-auto p-6 dark:bg-gray-900">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TbReceipt className="text-brand-500 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gasto #{detail.id}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {tipoLabel}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full border text-sm font-medium bg-gray-50 dark:bg-gray-800 dark:text-gray-200">
          {estadoLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 text-xs">
            <TbCalendar className="text-lg" />
            Fecha del gasto
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(fechaGasto)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 text-xs">
            <TbCalendar className="text-lg" />
            Fecha de pago
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(detail.fechaPago)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="font-bold text-gray-900 dark:text-white">
            {formatMoney(detail.montoTotal)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pagado</p>
          <p className="font-bold text-green-600 dark:text-green-400">
            {formatMoney(detail.montoPagado)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pendiente</p>
          <p
            className={`font-bold ${
              detail.montoTotal - detail.montoPagado > 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {formatMoney(detail.montoTotal - detail.montoPagado)}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6 border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/30 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <TbBuildingStore className="text-gray-500 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Proveedor</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {detail.proveedor || summary?.proveedor || "—"}
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Comprobante</p>
            <p className="text-gray-900 dark:text-white">
              {detail.comprobante || summary?.comprobante || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Método de pago</p>
            <p className="text-gray-900 dark:text-white">
              {detail.metodoPago || summary?.metodoPago || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Origen del fondo</p>
            <p className="text-gray-900 dark:text-white">
              {detail.origenFondo || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Referencia</p>
            <p className="text-gray-900 dark:text-white">
              {detail.referencia || "—"}
            </p>
          </div>
        </div>
        {(detail.generaInventario || detail.productoId || detail.cantidad) && (
          <div className="text-sm border-t border-gray-200 dark:border-gray-600 pt-3">
            <p className="text-xs text-gray-500 mb-1">Inventario</p>
            <p className="text-gray-800 dark:text-gray-200">
              {detail.generaInventario ? "Genera inventario" : "No genera inventario"}
              {detail.productoId != null && (
                <span className="ml-2">· Producto ID: {detail.productoId}</span>
              )}
              {detail.cantidad != null && (
                <span className="ml-2">· Cantidad: {detail.cantidad}</span>
              )}
            </p>
          </div>
        )}
        {(detail.nota || summary?.nota) && (
          <div className="flex items-start gap-2 border-t border-gray-200 dark:border-gray-600 pt-3">
            <TbNotes className="text-gray-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Nota</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {detail.nota || summary?.nota}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="flex-1 min-w-[140px] bg-green-500 text-white py-2.5 px-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
            onClick={() =>
              handlePrintGastoThermal(detail, summary, user ?? ({} as User))
            }
          >
            <LuPrinter className="text-lg" />
            Imprimir (ticket)
          </button>
          <button
            type="button"
            className="flex-1 min-w-[140px] bg-emerald-700 text-white py-2.5 px-3 rounded-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 text-sm"
            onClick={() =>
              handlePrintGastoFullPage(detail, summary, user ?? ({} as User))
            }
          >
            <LuPrinter className="text-lg" />
            Página completa (A4)
          </button>
        </div>
        <button
          type="button"
          onClick={() => onEditar(detail.id)}
          className="w-full bg-brand-500 text-white py-2.5 rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
        >
          <FiEdit2 /> Editar gasto
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

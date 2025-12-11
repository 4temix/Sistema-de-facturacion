import { NominaListItem } from "../../Types/Nomina.types";
import {
  TbCalendar,
  TbCash,
  TbReceipt,
  TbCheck,
  TbClock,
} from "react-icons/tb";

interface NominaCardProps {
  nomina: NominaListItem;
  onClick: (id: number) => void;
}

export default function NominaCard({ nomina, onClick }: NominaCardProps) {
  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      onClick={() => onClick(nomina.id)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden group"
    >
      {/* Header con tipo y estado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TbReceipt className="text-white text-xl" />
          <span className="text-white font-semibold">{nomina.tipo}</span>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            nomina.aprobado
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {nomina.aprobado ? (
            <>
              <TbCheck className="w-3 h-3" /> Aprobada
            </>
          ) : (
            <>
              <TbClock className="w-3 h-3" /> Pendiente
            </>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-4">
        {/* Período */}
        <div className="flex items-center gap-2 text-gray-600">
          <TbCalendar className="text-blue-500" />
          <span className="text-sm">
            {formatDate(nomina.periodoInicio)} - {formatDate(nomina.periodoFin)}
          </span>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              Devengado
            </p>
            <p className="text-sm font-bold text-green-700">
              {formatCurrency(nomina.totalDevengado)}
            </p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              Descuentos
            </p>
            <p className="text-sm font-bold text-red-700">
              {formatCurrency(nomina.totalDescuentos)}
            </p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              Neto
            </p>
            <p className="text-sm font-bold text-blue-700">
              {formatCurrency(nomina.totalPagoNet)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center pt-2 border-t border-gray-100">
          <span className="text-xs text-blue-600 font-medium group-hover:underline flex items-center gap-1">
            <TbCash className="w-4 h-4" />
            Ver detalles de nómina
          </span>
        </div>
      </div>
    </div>
  );
}


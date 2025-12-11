import { NominaDetalleDto } from "../../Types/Nomina.types";
import {
  TbUser,
  TbCash,
  TbClock,
  TbPlus,
  TbMinus,
  TbReceipt,
  TbShieldCheck,
  TbPercentage,
} from "react-icons/tb";

interface NominaEmpleadoDetailsProps {
  detalle: NominaDetalleDto;
  onClose: () => void;
  isLoading?: boolean;
}

// Skeleton de carga
function DetailsSkeleton() {
  return (
    <div className="bg-white w-full h-full overflow-y-auto p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
        ))}
      </div>

      <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
      <div className="h-32 bg-gray-100 rounded-lg"></div>
    </div>
  );
}

export default function NominaEmpleadoDetails({
  detalle,
  onClose,
  isLoading,
}: NominaEmpleadoDetailsProps) {
  if (isLoading) {
    return <DetailsSkeleton />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white w-full h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TbUser className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-900">
              {detalle.empleadoNombre}
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            Detalle de nómina del empleado
          </p>
        </div>
      </div>

      {/* Resumen principal */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-500">Total Devengado</p>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(detalle.totalDevengado)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-500">Total Descuentos</p>
          <p className="text-lg font-bold text-red-700">
            {formatCurrency(detalle.totalDescuentos)}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-500">Pago Neto</p>
          <p className="text-lg font-bold text-blue-700">
            {formatCurrency(detalle.pagoNeto)}
          </p>
        </div>
      </div>

      {/* Ingresos */}
      <div className="mb-6 border rounded-lg p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <TbPlus className="text-green-600 text-xl" />
          <h3 className="font-semibold text-gray-900">Ingresos</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TbCash className="text-gray-500" />
              <span className="text-sm text-gray-700">Salario Base</span>
            </div>
            <span className="font-medium text-green-700">
              {formatCurrency(detalle.salarioBase)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TbClock className="text-gray-500" />
              <span className="text-sm text-gray-700">
                Horas Extras ({detalle.horasExtras} hrs)
              </span>
            </div>
            <span className="font-medium text-green-700">
              {formatCurrency(detalle.montoHorasExtras)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TbReceipt className="text-gray-500" />
              <span className="text-sm text-gray-700">Otros Ingresos</span>
            </div>
            <span className="font-medium text-green-700">
              {formatCurrency(detalle.otrosIngresos)}
            </span>
          </div>
        </div>
      </div>

      {/* Descuentos */}
      <div className="mb-6 border rounded-lg p-4 bg-red-50 border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <TbMinus className="text-red-600 text-xl" />
          <h3 className="font-semibold text-gray-900">Descuentos</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TbShieldCheck className="text-gray-500" />
              <span className="text-sm text-gray-700">SFS (Salud)</span>
            </div>
            <span className="font-medium text-red-700">
              -{formatCurrency(detalle.sfs)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TbShieldCheck className="text-gray-500" />
              <span className="text-sm text-gray-700">AFP (Pensiones)</span>
            </div>
            <span className="font-medium text-red-700">
              -{formatCurrency(detalle.afp)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TbPercentage className="text-gray-500" />
              <span className="text-sm text-gray-700">ISR (Impuestos)</span>
            </div>
            <span className="font-medium text-red-700">
              -{formatCurrency(detalle.isr)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TbMinus className="text-gray-500" />
              <span className="text-sm text-gray-700">Otros Descuentos</span>
            </div>
            <span className="font-medium text-red-700">
              -{formatCurrency(detalle.otrosDescuentos)}
            </span>
          </div>
        </div>
      </div>

      {/* Cerrar */}
      <button
        onClick={onClose}
        className="w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cerrar
      </button>
    </div>
  );
}


import { EmpleadoDetailsDto } from "../../Types/Empleados.types";
import { PencilIcon } from "../../icons";
import {
  TbUser,
  TbCalendar,
  TbPhone,
  TbMail,
  TbMapPin,
  TbBriefcase,
  TbCash,
  TbClock,
  TbShieldCheck,
  TbBuildingBank,
  TbId,
  TbUserCheck,
  TbUserX,
} from "react-icons/tb";

interface EmpleadoDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: EmpleadoDetailsDto;
  isLoading?: boolean;
  onEditar?: (id: number) => void;
}

// Skeleton de carga
function EmpleadoSkeleton() {
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
      <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
      <div className="h-32 bg-gray-100 rounded-lg"></div>
    </div>
  );
}

export default function EmpleadoDetails({
  onClose,
  empleado,
  isLoading,
  onEditar,
}: EmpleadoDetailsProps) {
  if (isLoading) {
    return <EmpleadoSkeleton />;
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
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

  const isActivo = !empleado.fechaSalida;

  return (
    <div className="bg-white w-full h-full overflow-y-auto p-6">
        {/* 🔹 Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TbUser className="text-blue-600 text-2xl" />
              <h2 className="text-2xl font-bold text-gray-900">
                {empleado.nombres} {empleado.apellidos}
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              {empleado.puesto} • Desde {formatDate(empleado.fechaIngreso)}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${
              isActivo
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-red-100 text-red-800 border-red-300"
            }`}
          >
            {isActivo ? (
              <>
                <TbUserCheck className="w-4 h-4" /> Activo
              </>
            ) : (
              <>
                <TbUserX className="w-4 h-4" /> Inactivo
              </>
            )}
          </div>
        </div>

        {/* 🔹 Información Personal */}
        <div className="mb-6 border rounded-lg p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <TbId className="text-blue-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Información Personal</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Cédula</p>
              <p className="font-medium text-gray-800">{empleado.cedula}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
              <p className="font-medium text-gray-800">
                {formatDate(empleado.fechaNacimiento)}
              </p>
            </div>
          </div>
        </div>

        {/* 🔹 Contacto */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TbPhone className="text-gray-500 text-lg" />
              <p className="text-xs text-gray-500">Teléfono</p>
            </div>
            <p className="font-medium">{empleado.telefono || "N/A"}</p>
          </div>
          <div className="bg-white border p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TbMail className="text-gray-500 text-lg" />
              <p className="text-xs text-gray-500">Email</p>
            </div>
            <p className="font-medium text-sm break-all">
              {empleado.email || "N/A"}
            </p>
          </div>
        </div>

        {/* 🔹 Dirección */}
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <TbMapPin className="text-gray-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Dirección</h3>
          </div>
          <p className="text-gray-800">{empleado.direccion}</p>
          <p className="text-gray-600 text-sm">
            {empleado.municipio}, {empleado.provincia}
          </p>
        </div>

        {/* 🔹 Información Laboral */}
        <div className="mb-6 border rounded-lg p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <TbBriefcase className="text-purple-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Información Laboral</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Puesto</p>
              <p className="font-medium text-gray-800">{empleado.puesto}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tipo de Contrato</p>
              <p className="font-medium text-gray-800">{empleado.tipoContrato}</p>
            </div>
          </div>
        </div>

        {/* 🔹 Fechas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TbCalendar className="text-green-500 text-lg" />
              <p className="text-xs text-gray-500">Fecha Ingreso</p>
            </div>
            <p className="font-medium">{formatDate(empleado.fechaIngreso)}</p>
          </div>
          {empleado.fechaSalida && (
            <div className="bg-white border p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TbCalendar className="text-red-500 text-lg" />
                <p className="text-xs text-gray-500">Fecha Salida</p>
              </div>
              <p className="font-medium">{formatDate(empleado.fechaSalida)}</p>
            </div>
          )}
        </div>

        {/* 🔹 Salario */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TbCash className="text-green-600 text-lg" />
              <p className="text-xs text-gray-600">Salario Base</p>
            </div>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(empleado.salarioBase)}
            </p>
          </div>
          {empleado.salarioPorHora && empleado.salarioPorHora > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TbClock className="text-blue-600 text-lg" />
                <p className="text-xs text-gray-600">Salario por Hora</p>
              </div>
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(empleado.salarioPorHora)}
              </p>
            </div>
          )}
        </div>

        {/* 🔹 Seguridad Social */}
        <div className="mb-6 border rounded-lg p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <TbShieldCheck className="text-orange-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Seguridad Social</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">ARS ID</p>
              <p className="font-medium text-gray-800">
                {empleado.arsId || "No registrado"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">AFP ID</p>
              <p className="font-medium text-gray-800">
                {empleado.afpId || "No registrado"}
              </p>
            </div>
          </div>
        </div>

        {/* 🔹 Información Bancaria */}
        <div className="mb-6 border rounded-lg p-4 bg-sky-50 border-sky-200">
          <div className="flex items-center gap-2 mb-3">
            <TbBuildingBank className="text-sky-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Información Bancaria</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Banco</p>
              <p className="font-medium text-gray-800">
                {empleado.banco || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cuenta Bancaria</p>
              <p className="font-medium text-gray-800">
                {empleado.cuentaBancaria || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* 🔹 Botones */}
        <div className="flex gap-3">
          {onEditar && isActivo && (
            <button
              onClick={() => onEditar(empleado.id)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="flex justify-center items-center gap-2">
                <PencilIcon /> Editar
              </span>
            </button>
          )}
        </div>

        {/* 🔹 Cerrar */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cerrar
        </button>
    </div>
  );
}


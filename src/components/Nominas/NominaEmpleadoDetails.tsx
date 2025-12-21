import { useState, useEffect } from "react";
import { NominaDetalleDto, NominaDetailsUpdate } from "../../Types/Nomina.types";
import { EmpleadoDetailsDto } from "../../Types/Empleados.types";
import {
  TbUser,
  TbCash,
  TbClock,
  TbPlus,
  TbMinus,
  TbReceipt,
  TbShieldCheck,
  TbPercentage,
  TbEdit,
  TbCheck,
  TbX,
  TbId,
  TbPhone,
  TbMail,
  TbMapPin,
  TbBriefcase,
  TbCalendar,
  TbBuildingBank,
} from "react-icons/tb";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import Swal from "sweetalert2";
import LoaderFun from "../loader/LoaderFunc";

interface NominaEmpleadoDetailsProps {
  detalle: NominaDetalleDto;
  onClose: () => void;
  isLoading?: boolean;
  onUpdate?: () => void;
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
  onUpdate,
}: NominaEmpleadoDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [empleadoInfo, setEmpleadoInfo] = useState<EmpleadoDetailsDto | null>(null);
  const [isLoadingEmpleado, setIsLoadingEmpleado] = useState(false);
  
  // Cargar información del empleado
  useEffect(() => {
    if (detalle.empleadoId) {
      setIsLoadingEmpleado(true);
      apiRequestThen<EmpleadoDetailsDto>({
        url: `api/empleados/get-empleado/${detalle.empleadoId}`,
      })
        .then((response) => {
          if (response.success && response.result) {
            setEmpleadoInfo(response.result);
          }
        })
        .finally(() => {
          setIsLoadingEmpleado(false);
        });
    }
  }, [detalle.empleadoId]);
  
  // Los datos vienen intercambiados del backend:
  // detalle.salarioBase contiene el valor de pagado
  // detalle.pagado contiene el valor de salarioBase
  const salarioBaseReal = detalle.pagado; // El salario base real está en pagado
  const pagadoReal = detalle.salarioBase; // El pagado real está en salarioBase
  
  const [formData, setFormData] = useState<NominaDetailsUpdate>({
    id: detalle.id,
    salarioBase: pagadoReal || 0, // pagado se envía como salarioBase en el DTO
    horasExtras: detalle.horasExtras,
    montoHorasExtras: detalle.montoHorasExtras,
    otrosIngresos: detalle.otrosIngresos,
  });

  // Sincronizar formData cuando cambie el detalle
  useEffect(() => {
    if (!isEditing) {
      const pagadoReal = detalle.salarioBase; // El pagado real está en salarioBase
      setFormData({
        id: detalle.id,
        salarioBase: pagadoReal || 0, // pagado se envía como salarioBase en el DTO
        horasExtras: detalle.horasExtras,
        montoHorasExtras: detalle.montoHorasExtras,
        otrosIngresos: detalle.otrosIngresos,
      });
    }
  }, [detalle, isEditing]);

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

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    const pagadoReal = detalle.salarioBase; // El pagado real está en salarioBase
    setFormData({
      id: detalle.id,
      salarioBase: pagadoReal || 0, // pagado se envía como salarioBase en el DTO
      horasExtras: detalle.horasExtras,
      montoHorasExtras: detalle.montoHorasExtras,
      otrosIngresos: detalle.otrosIngresos,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    const pagadoReal = detalle.salarioBase; // El pagado real está en salarioBase
    setFormData({
      id: detalle.id,
      salarioBase: pagadoReal || 0, // pagado se envía como salarioBase en el DTO
      horasExtras: detalle.horasExtras,
      montoHorasExtras: detalle.montoHorasExtras,
      otrosIngresos: detalle.otrosIngresos,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Usar el ID del detalle de nómina (detalle.id), no el ID del empleado (detalle.empleadoId)
      const updateData: NominaDetailsUpdate = {
        id: detalle.id, // ID del detalle de nómina
        salarioBase: formData.salarioBase,
        horasExtras: formData.horasExtras,
        montoHorasExtras: formData.montoHorasExtras,
        otrosIngresos: formData.otrosIngresos,
      };

      const response = await apiRequestThen<boolean>({
        url: "api/nomina/update",
        configuration: {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        },
      });

      if (!response.success) {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "error",
          title: response.errorMessage || "Error al actualizar los detalles",
        });
        return;
      }

      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "success",
        title: "Detalles actualizados correctamente",
      });

      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "error",
        title: "Error al actualizar los detalles",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white w-full h-full overflow-y-auto p-6 relative">
      {isSaving && <LoaderFun absolute={false} />}
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TbUser className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-900">
              {detalle.empleadoNombre}
            </h2>
          </div>
          {empleadoInfo && (
            <p className="text-gray-600 text-sm">
              {empleadoInfo.puesto} • Desde {formatDate(empleadoInfo.fechaIngreso)}
            </p>
          )}
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TbEdit className="w-4 h-4" />
            <span>Editar</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <TbCheck className="w-4 h-4" />
              <span>Guardar</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <TbX className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
          </div>
        )}
      </div>

      {/* Información del Empleado */}
      {empleadoInfo && (
        <>
          {/* Información Personal */}
          <div className="mb-6 border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <TbId className="text-blue-600 text-xl" />
              <h3 className="font-semibold text-gray-900">Información Personal</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Cédula</p>
                <p className="font-medium text-gray-800">{empleadoInfo.cedula}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                <p className="font-medium text-gray-800">
                  {formatDate(empleadoInfo.fechaNacimiento)}
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white border p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TbPhone className="text-gray-500 text-lg" />
                <p className="text-xs text-gray-500">Teléfono</p>
              </div>
              <p className="font-medium">{empleadoInfo.telefono || "N/A"}</p>
            </div>
            <div className="bg-white border p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TbMail className="text-gray-500 text-lg" />
                <p className="text-xs text-gray-500">Email</p>
              </div>
              <p className="font-medium text-sm break-all">
                {empleadoInfo.email || "N/A"}
              </p>
            </div>
          </div>

          {/* Dirección */}
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <TbMapPin className="text-gray-600 text-xl" />
              <h3 className="font-semibold text-gray-900">Dirección</h3>
            </div>
            <p className="text-gray-800">{empleadoInfo.direccion}</p>
            <p className="text-gray-600 text-sm">
              {empleadoInfo.municipio}, {empleadoInfo.provincia}
            </p>
          </div>

          {/* Información Laboral */}
          <div className="mb-6 border rounded-lg p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <TbBriefcase className="text-purple-600 text-xl" />
              <h3 className="font-semibold text-gray-900">Información Laboral</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Puesto</p>
                <p className="font-medium text-gray-800">{empleadoInfo.puesto}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo de Contrato</p>
                <p className="font-medium text-gray-800">{empleadoInfo.tipoContrato}</p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white border p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TbCalendar className="text-green-500 text-lg" />
                <p className="text-xs text-gray-500">Fecha Ingreso</p>
              </div>
              <p className="font-medium">{formatDate(empleadoInfo.fechaIngreso)}</p>
            </div>
            {empleadoInfo.fechaSalida && (
              <div className="bg-white border p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TbCalendar className="text-red-500 text-lg" />
                  <p className="text-xs text-gray-500">Fecha Salida</p>
                </div>
                <p className="font-medium">{formatDate(empleadoInfo.fechaSalida)}</p>
              </div>
            )}
          </div>

          {/* Salario del Empleado */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TbCash className="text-green-600 text-lg" />
                <p className="text-xs text-gray-600">Salario Base</p>
              </div>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(empleadoInfo.salarioBase)}
              </p>
            </div>
            {empleadoInfo.salarioPorHora && empleadoInfo.salarioPorHora > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TbClock className="text-blue-600 text-lg" />
                  <p className="text-xs text-gray-600">Salario por Hora</p>
                </div>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(empleadoInfo.salarioPorHora)}
                </p>
              </div>
            )}
          </div>

          {/* Seguridad Social */}
          <div className="mb-6 border rounded-lg p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <TbShieldCheck className="text-orange-600 text-xl" />
              <h3 className="font-semibold text-gray-900">Seguridad Social</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">ARS ID</p>
                <p className="font-medium text-gray-800">
                  {empleadoInfo.arsId || "No registrado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">AFP ID</p>
                <p className="font-medium text-gray-800">
                  {empleadoInfo.afpId || "No registrado"}
                </p>
              </div>
            </div>
          </div>

          {/* Información Bancaria */}
          <div className="mb-6 border rounded-lg p-4 bg-sky-50 border-sky-200">
            <div className="flex items-center gap-2 mb-3">
              <TbBuildingBank className="text-sky-600 text-xl" />
              <h3 className="font-semibold text-gray-900">Información Bancaria</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Banco</p>
                <p className="font-medium text-gray-800">
                  {empleadoInfo.banco || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cuenta Bancaria</p>
                <p className="font-medium text-gray-800">
                  {empleadoInfo.cuentaBancaria || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

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
          {/* Salario Base del empleado (no editable) */}
          <div className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2">
              <TbCash className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Salario Base del Empleado</span>
            </div>
            <span className="font-medium text-blue-700">
              {formatCurrency(salarioBaseReal)}
            </span>
          </div>
          
          {isEditing ? (
            <>
              <div className="bg-white p-3 rounded-lg">
                <Label htmlFor="salarioPagado">Salario Pagado *</Label>
                <Input
                  type="number"
                  id="salarioPagado"
                  value={formData.salarioBase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salarioBase: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="bg-white p-3 rounded-lg">
                <Label htmlFor="horasExtras">Horas Extras</Label>
                <Input
                  type="number"
                  id="horasExtras"
                  value={formData.horasExtras}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      horasExtras: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.5"
                  min="0"
                />
              </div>
              <div className="bg-white p-3 rounded-lg">
                <Label htmlFor="montoHorasExtras">Monto Horas Extras</Label>
                <Input
                  type="number"
                  id="montoHorasExtras"
                  value={formData.montoHorasExtras}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      montoHorasExtras: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="bg-white p-3 rounded-lg">
                <Label htmlFor="otrosIngresos">Otros Ingresos</Label>
                <Input
                  type="number"
                  id="otrosIngresos"
                  value={formData.otrosIngresos}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otrosIngresos: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.01"
                  min="0"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <TbCash className="text-gray-500" />
                  <span className="text-sm text-gray-700">Salario Pagado</span>
                </div>
                <span className="font-medium text-green-700">
                  {formatCurrency(pagadoReal)}
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
            </>
          )}
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


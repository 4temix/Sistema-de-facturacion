import { customStyles } from "../../Utilities/StyleForReactSelect";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select, { SingleValue } from "react-select";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import { BaseSelecst, Option } from "../../Types/ProductTypes";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { GastoUpdate, SelectsGastos, SelectsGastosTable } from "../../Types/Gastos";
import * as Yup from "yup";

type Actions = {
  closeModal: () => void;
  id: number;
  onSuccess?: () => void;
};

// Esquema de validación
const ValidationGastoUpdate = Yup.object().shape({
  tipoGasto: Yup.number().required("El tipo de gasto es requerido"),
  estado: Yup.number().required("El estado es requerido"),
  montoTotal: Yup.number()
    .required("El monto total es requerido")
    .min(0, "El monto debe ser mayor o igual a 0"),
});

const SkeletonBox = ({ height = "h-10", width = "w-full" }) => (
  <div className={`shimmer ${height} ${width} mb-2`} />
);

export default function EditGasto({ closeModal, id, onSuccess }: Actions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para los selects de gastos
  const [gastosSelects, setGastosSelects] = useState<SelectsGastos>({
    tiposGasto: [],
    estados: [],
  });

  // Monto que ya estaba pagado cuando se cargó el gasto
  const [montoPagadoAnterior, setMontoPagadoAnterior] = useState<number>(0);
  // Monto pendiente por pagar (montoTotal - montoPagadoAnterior)
  const [montoPendiente, setMontoPendiente] = useState<number>(0);
  // Nuevo pago a realizar (lo que el usuario ingresa)
  const [nuevoPago, setNuevoPago] = useState<number>(0);

  // Referencias para evitar ciclos infinitos
  const isUpdatingFromEstado = useRef(false);
  const isUpdatingFromMonto = useRef(false);

  // Formik
  const formik = useFormik<GastoUpdate>({
    initialValues: {
      id: 0,
      tipoGasto: 0,
      proveedor: "",
      comprobante: "",
      montoTotal: 0,
      montoPagado: 0,
      estado: 0,
      metodoPago: "",
      fechaPago: "",
      origenFondo: "",
      generaInventario: false,
      productoId: null,
      cantidad: null,
      referencia: "",
      nota: "",
    },
    validationSchema: ValidationGastoUpdate,
    onSubmit: (values) => {
      SaveGasto(values);
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched, setValues, validateForm, setTouched } = formik;

  // Cargar selects de gastos
  useEffect(() => {
    apiRequestThen<SelectsGastosTable>({
      url: "api/gastos/selects",
    }).then((response) => {
      if (!response.success || !response.result) return;
      setGastosSelects({
        tiposGasto: response.result.tiposGastos ?? [],
        estados: response.result.estadosGastos ?? [],
      });
    });
  }, []);

  // Obtener datos del gasto para editar
  useEffect(() => {
    if (!id) return;
    GetGastoForUpdate(id);
  }, [id]);

  function GetGastoForUpdate(gastoId: number) {
    setIsLoading(true);
    apiRequestThen<GastoUpdate>({
      url: `api/gastos/get-update/${gastoId}`,
      configuration: {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    })
      .then((response) => {
        if (!response.success || !response.result) return;
        
        const data = response.result;
        // Guardar el monto que ya estaba pagado
        setMontoPagadoAnterior(data.montoPagado);
        // Calcular monto pendiente: montoTotal - montoPagado
        setMontoPendiente(data.montoTotal - data.montoPagado);
        // El nuevo pago empieza en 0
        setNuevoPago(0);
        
        setValues(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function SaveGasto(gasto: GastoUpdate) {
    setIsSaving(true);
    
    // Calcular el monto pagado total: lo anterior + el nuevo pago
    const montoTotalPagado = montoPagadoAnterior + nuevoPago;
    
    // Crear el objeto a enviar con el monto pagado calculado
    const gastoToSend: GastoUpdate = {
      ...gasto,
      montoPagado: montoTotalPagado,
    };
    
    apiRequestThen<boolean>({
      url: "api/gastos/update",
      configuration: {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gastoToSend),
      },
    })
      .then((response) => {
        if (!response.success) return;
        if (onSuccess) {
          onSuccess();
        }
        closeModal();
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  // 🔄 Calcular estado automáticamente según el nuevo pago
  useEffect(() => {
    if (isUpdatingFromEstado.current) {
      isUpdatingFromEstado.current = false;
      return;
    }

    const montoTotal = values.montoTotal;
    // Monto total que se habrá pagado después del nuevo pago
    const totalPagado = montoPagadoAnterior + nuevoPago;

    if (montoTotal === null || montoTotal === 0) return;

    const estadoPagado = gastosSelects.estados?.find(
      (e) => e.name.toLowerCase() === "pagado"
    );
    const estadoPendiente = gastosSelects.estados?.find(
      (e) => e.name.toLowerCase() === "pendiente"
    );
    const estadoParcial = gastosSelects.estados?.find((e) =>
      e.name.toLowerCase().includes("parcial")
    );

    isUpdatingFromMonto.current = true;

    if (totalPagado >= montoTotal) {
      // Ya pagó todo
      if (estadoPagado) {
        setFieldValue("estado", estadoPagado.id);
      }
    } else if (totalPagado <= 0) {
      // No ha pagado nada
      if (estadoPendiente) {
        setFieldValue("estado", estadoPendiente.id);
      }
    } else {
      // Pago parcial
      if (estadoParcial) {
        setFieldValue("estado", estadoParcial.id);
      }
    }
  }, [values.montoTotal, nuevoPago, montoPagadoAnterior, gastosSelects.estados]);

  // 🔄 Actualizar nuevoPago cuando se selecciona un estado manualmente
  useEffect(() => {
    if (isUpdatingFromMonto.current) {
      isUpdatingFromMonto.current = false;
      return;
    }

    const estado = values.estado;
    const montoTotal = values.montoTotal;

    if (estado === null || estado === 0 || montoTotal === null || montoTotal === 0) return;

    const estadoPagado = gastosSelects.estados?.find(
      (e) => e.name.toLowerCase() === "pagado"
    );
    const estadoPendiente = gastosSelects.estados?.find(
      (e) => e.name.toLowerCase() === "pendiente"
    );

    isUpdatingFromEstado.current = true;

    // Si seleccionó "Pagado" → poner nuevoPago = lo que falta (montoPendiente)
    if (estadoPagado && estado === estadoPagado.id) {
      setNuevoPago(montoPendiente);
    }
    // Si seleccionó "Pendiente" → poner nuevoPago = 0
    else if (estadoPendiente && estado === estadoPendiente.id) {
      setNuevoPago(0);
    }
  }, [values.estado, values.montoTotal, montoPendiente, gastosSelects.estados]);

  // Actualizar monto pendiente cuando cambia el nuevo pago
  useEffect(() => {
    const montoTotal = values.montoTotal ?? 0;
    const pendienteRestante = montoTotal - montoPagadoAnterior - nuevoPago;
    setMontoPendiente(pendienteRestante > 0 ? pendienteRestante : 0);
  }, [nuevoPago, values.montoTotal, montoPagadoAnterior]);

  const handleSubmit = async () => {
    const errors = await validateForm();
    setTouched(
      Object.keys(formik.initialValues).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>),
      true
    );

    if (Object.keys(errors).length === 0) {
      SaveGasto(values);
    }
  };

  if (isLoading) {
    return <GastoFormUpdateSkeleton />;
  }

  return (
    <>
      <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Actualizar Gasto
          </h4>
        </div>
      </div>

      <form className="flex flex-col">
        <div className="px-2 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5">
            {/* 1️⃣ Tipo de gasto y Estado */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tipoGasto">Tipo de gasto</Label>
                <Select<Option, false>
                  id="tipoGasto"
                  styles={customStyles(!!errors.tipoGasto && touched.tipoGasto)}
                  placeholder="Selecciona un tipo..."
                  menuPortalTarget={document.body}
                  value={
                    gastosSelects.tiposGasto
                      ?.map((element) => ({
                        value: element.id.toString(),
                        label: element.name,
                      }))
                      .find((opt) => opt.value === values.tipoGasto?.toString()) || null
                  }
                  options={gastosSelects.tiposGasto?.map((element: BaseSelecst) => ({
                    value: element.id.toString(),
                    label: element.name,
                  }))}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("tipoGasto", parseInt(e.value));
                  }}
                  onBlur={() => setFieldTouched("tipoGasto", true)}
                />
                {errors.tipoGasto && touched.tipoGasto && (
                  <p className="mt-1.5 text-xs text-error-500">{errors.tipoGasto}</p>
                )}
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select<Option, false>
                  id="estado"
                  styles={customStyles(!!errors.estado && touched.estado)}
                  placeholder="Selecciona un estado..."
                  menuPortalTarget={document.body}
                  value={
                    gastosSelects.estados
                      ?.map((element) => ({
                        value: element.id.toString(),
                        label: element.name,
                      }))
                      .find((opt) => opt.value === values.estado?.toString()) || null
                  }
                  options={gastosSelects.estados?.map((element: BaseSelecst) => ({
                    value: element.id.toString(),
                    label: element.name,
                  }))}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("estado", parseInt(e.value));
                  }}
                  onBlur={() => setFieldTouched("estado", true)}
                />
                {errors.estado && touched.estado && (
                  <p className="mt-1.5 text-xs text-error-500">{errors.estado}</p>
                )}
              </div>
            </div>

            {/* 2️⃣ Proveedor y Comprobante */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  type="text"
                  id="proveedor"
                  placeholder="Nombre del proveedor"
                  value={values.proveedor ?? ""}
                  onChange={(e) => setFieldValue("proveedor", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="comprobante">Comprobante</Label>
                <Input
                  type="text"
                  id="comprobante"
                  placeholder="Número de comprobante"
                  value={values.comprobante ?? ""}
                  onChange={(e) => setFieldValue("comprobante", e.target.value)}
                />
              </div>
            </div>

            {/* 3️⃣ Montos - Resumen visual */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-blue-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Resumen de Pago
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monto Total</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    ${(values.montoTotal ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ya Pagado</p>
                  <p className="text-lg font-bold text-green-600">
                    ${montoPagadoAnterior.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nuevo Pago</p>
                  <p className="text-lg font-bold text-blue-600">
                    ${nuevoPago.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quedará Pendiente</p>
                  <p className="text-lg font-bold text-red-500">
                    ${montoPendiente.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* 4️⃣ Campos de monto editables */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="montoTotal">Monto Total</Label>
                <Input
                  type="number"
                  id="montoTotal"
                  placeholder="0.00"
                  hint={errors.montoTotal && touched.montoTotal ? errors.montoTotal : ""}
                  value={values.montoTotal ?? ""}
                  error={!!errors.montoTotal && touched.montoTotal}
                  onChange={(e) => {
                    const val = e.target.value;
                    const nuevoTotal = val === "" ? 0 : parseFloat(val);
                    setFieldValue("montoTotal", nuevoTotal);
                    // Recalcular pendiente cuando cambia el total
                    const pendienteOriginal = nuevoTotal - montoPagadoAnterior;
                    if (nuevoPago > pendienteOriginal) {
                      setNuevoPago(pendienteOriginal > 0 ? pendienteOriginal : 0);
                    }
                  }}
                  onBlur={() => setFieldTouched("montoTotal", true)}
                />
              </div>
              <div>
                <Label htmlFor="nuevoPago">Monto a Pagar Ahora</Label>
                <Input
                  type="number"
                  id="nuevoPago"
                  placeholder="0.00"
                  hint={
                    nuevoPago > (values.montoTotal ?? 0) - montoPagadoAnterior
                      ? `Máximo permitido: ${((values.montoTotal ?? 0) - montoPagadoAnterior).toFixed(2)}`
                      : `Pendiente por pagar: ${((values.montoTotal ?? 0) - montoPagadoAnterior).toFixed(2)}`
                  }
                  value={nuevoPago || ""}
                  error={nuevoPago > (values.montoTotal ?? 0) - montoPagadoAnterior}
                  onChange={(e) => {
                    const val = e.target.value;
                    const nuevoValor = val === "" ? 0 : parseFloat(val);
                    const maxPermitido = (values.montoTotal ?? 0) - montoPagadoAnterior;
                    
                    // Validar que no exceda lo pendiente
                    if (nuevoValor <= maxPermitido && nuevoValor >= 0) {
                      setNuevoPago(nuevoValor);
                    } else if (nuevoValor > maxPermitido) {
                      // Si excede, poner el máximo
                      setNuevoPago(maxPermitido);
                    } else {
                      setNuevoPago(0);
                    }
                  }}
                />
              </div>
            </div>

            {/* 5️⃣ Método de pago y Origen de fondo */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="metodoPago">Método de pago</Label>
                <Select<Option, false>
                  id="metodoPago"
                  styles={customStyles()}
                  placeholder="Selecciona un método..."
                  menuPortalTarget={document.body}
                  value={
                    values.metodoPago
                      ? { value: values.metodoPago, label: values.metodoPago }
                      : null
                  }
                  options={[
                    { label: "Transferencia", value: "Transferencia" },
                    { label: "Efectivo", value: "Efectivo" },
                  ]}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("metodoPago", e.value);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="origenFondo">Origen del fondo</Label>
                <Select<Option, false>
                  id="origenFondo"
                  styles={customStyles()}
                  placeholder="Selecciona el origen..."
                  menuPortalTarget={document.body}
                  value={
                    values.origenFondo
                      ? { value: values.origenFondo, label: values.origenFondo }
                      : null
                  }
                  options={[
                    { label: "Cuenta de banco", value: "Cuenta de banco" },
                    { label: "Efectivo", value: "Efectivo" },
                  ]}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("origenFondo", e.value);
                  }}
                />
              </div>
            </div>

            {/* 6️⃣ Fecha de pago */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fechaPago">Fecha de pago</Label>
                <Input
                  type="date"
                  id="fechaPago"
                  value={values.fechaPago?.split("T")[0] ?? ""}
                  onChange={(e) => setFieldValue("fechaPago", e.target.value)}
                />
              </div>
            </div>

            {/* 7️⃣ Referencia */}
            <div>
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                type="text"
                id="referencia"
                placeholder="Referencia adicional..."
                value={values.referencia ?? ""}
                onChange={(e) => setFieldValue("referencia", e.target.value)}
              />
            </div>

            {/* 8️⃣ Nota */}
            <div>
              <Label htmlFor="nota">Nota</Label>
              <textarea
                id="nota"
                rows={3}
                placeholder="Observaciones o detalles adicionales..."
                value={values.nota ?? ""}
                className="border rounded-xl w-full p-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                onChange={(e) => setFieldValue("nota", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={closeModal} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e?.preventDefault();
              handleSubmit();
            }}
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Actualizar Gasto"}
          </Button>
        </div>
      </form>
    </>
  );
}

function GastoFormUpdateSkeleton() {
  return (
    <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
      <div className="px-2 pr-14">
        <div className="shimmer h-6 w-60 my-4 rounded" />
      </div>

      <form className="flex flex-col">
        <div className="px-2 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5">
            {/* 1️⃣ Tipo y Estado */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 2️⃣ Proveedor y Comprobante */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 3️⃣ Resumen */}
            <SkeletonBox height="h-24" />

            {/* 4️⃣ Montos */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 5️⃣ Método de pago y Origen */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 6️⃣ Fecha */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <SkeletonBox />
            </div>

            {/* 7️⃣ Referencia */}
            <SkeletonBox />

            {/* 8️⃣ Nota */}
            <SkeletonBox height="h-20" />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <SkeletonBox height="h-8" width="w-24" />
          <SkeletonBox height="h-8" width="w-32" />
        </div>
      </form>
    </div>
  );
}


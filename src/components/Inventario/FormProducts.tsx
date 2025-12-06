import { customStyles } from "../../Utilities/StyleForReactSelect";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select, { SingleValue } from "react-select";
import { useFormik } from "formik";
import { ValidationProduct } from "../../Utilities/ValidationProduct";
import { useEffect, useRef } from "react";
import {
  BaseSelecst,
  Option,
  SaveProducto,
  Selects,
} from "../../Types/ProductTypes";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { GastoFormValues, SaveGasto } from "../../Types/Gastos";
import { ValidationGasto } from "../Gastos/yup";
import LoaderFun from "../loader/LoaderFunc";
import { useState } from "react";

type Actions = {
  closeModal: () => void;
  selectsData: Selects | undefined;
  onSuccess?: () => void;
};

// Regex para validar números (enteros y decimales)
const regexNum = /^[0-9]*\.?[0-9]*$/;

// Estados de pago locales
const ESTADOS_PAGO = [
  { id: 1, name: "Pagado" },
  { id: 2, name: "Parcial" },
  { id: 3, name: "Pendiente" },
];

// Tipo de gasto por defecto (Compra de inventario)
const TIPO_GASTO_DEFAULT = 1;

// Valores default de los gastos
export const gastosInitialValues: GastoFormValues = {
  tipoGasto: TIPO_GASTO_DEFAULT,
  proveedor: "",
  comprobante: "",
  fecha: "",
  montoTotal: null,
  montoPagado: null,
  saldoPendiente: null,
  estado: null,
  metodoPago: "",
  fechaPago: "",
  origenFondo: "",
  referencia: "",
  nota: "",
  cantidad: null,
};

// Tipo para enviar al backend
type ProductoData = {
  producto: SaveProducto;
  gastos: SaveGasto;
};

export default function FormProducts(params: Actions) {
  const { closeModal, selectsData, onSuccess } = params;

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);

  // Referencias para evitar ciclos infinitos
  const isUpdatingFromEstado = useRef(false);
  const isUpdatingFromMonto = useRef(false);

  // Formik validation para producto
  const {
    values,
    touched,
    errors,
    setFieldValue,
    setFieldTouched,
    validateForm,
    initialValues,
    setTouched,
  } = useFormik({
    initialValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      categoriaId: null,
      marcaId: null,
      tipoId: null,
      estadoId: null,
      precioCompra: 0,
      precioVenta: 0,
      precioMinimo: null,
      stockActual: 0,
      stockMinimo: 0,
      unidadMedida: "unidad",
      ubicacion: "",
      codigoBarras: "",
      impuesto: 0,
    },
    validationSchema: ValidationProduct,
    onSubmit: (values) => {
      console.log("Producto enviado:", values);
    },
  });

  // Crear instancia de formik para gastos en el componente padre
  const formikGasto = useFormik<GastoFormValues>({
    initialValues: gastosInitialValues,
    validationSchema: ValidationGasto,
    onSubmit: (values) => {
      console.log("Gasto enviado:", values);
    },
  });

  const {
    values: valuesGasto,
    setFieldValue: setFieldValueGastos,
    touched: touchedGasto,
    errors: errorsGasto,
    setFieldTouched: setFieldTouchedGasto,
  } = formikGasto;

  // Guardar producto y gasto juntos
  function SaveProductoConGasto(producto: SaveProducto, gasto: SaveGasto) {
    setIsLoading(true);

    const data: ProductoData = {
      producto: producto,
      gastos: gasto,
    };

    apiRequestThen<boolean>({
      url: "api/productos/guardar_producto",
      configuration: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    })
      .then((response) => {
        if (!response.success) {
          return;
        }
        // Refrescar datos en la página padre
        if (onSuccess) {
          onSuccess();
        }
        closeModal();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // 🔄 Calcular montoTotal cuando cambia stockActual o precioCompra
  useEffect(() => {
    const stock = values.stockActual ?? 0;
    const precio = values.precioCompra ?? 0;

    if (stock > 0 && precio > 0) {
      setFieldValueGastos("montoTotal", stock * precio);
    } else {
      setFieldValueGastos("montoTotal", null);
    }
  }, [values.stockActual, values.precioCompra, setFieldValueGastos]);

  // 🔄 Calcular saldoPendiente cuando cambia montoTotal o montoPagado
  useEffect(() => {
    const montoTotal = valuesGasto.montoTotal;
    const montoPagado = valuesGasto.montoPagado;

    if (montoTotal === null || montoTotal === 0) {
      setFieldValueGastos("saldoPendiente", null);
      return;
    }

    if (montoPagado === null) {
      setFieldValueGastos("saldoPendiente", montoTotal);
      return;
    }

    const saldoPendiente = montoTotal - montoPagado;

    if (saldoPendiente <= 0) {
      setFieldValueGastos("saldoPendiente", 0);
    } else {
      setFieldValueGastos("saldoPendiente", saldoPendiente);
    }
  }, [valuesGasto.montoTotal, valuesGasto.montoPagado, setFieldValueGastos]);

  // 🔄 Sincronizar cantidad del gasto con stockActual del producto
  useEffect(() => {
    const stock = values.stockActual ?? 0;
    if (stock > 0) {
      setFieldValueGastos("cantidad", stock);
    } else {
      setFieldValueGastos("cantidad", null);
    }
  }, [values.stockActual, setFieldValueGastos]);

  // 🔄 Seleccionar estado automáticamente según el pago
  useEffect(() => {
    if (isUpdatingFromEstado.current) {
      isUpdatingFromEstado.current = false;
      return;
    }

    const montoTotal = valuesGasto.montoTotal;
    const montoPagado = valuesGasto.montoPagado;

    if (montoTotal === null || montoTotal === 0) return;

    isUpdatingFromMonto.current = true;

    if (montoPagado === null || montoPagado === 0) {
      // Pendiente = 3
      setFieldValueGastos("estado", 3);
    } else if (montoPagado >= montoTotal) {
      // Pagado = 1
      setFieldValueGastos("estado", 1);
    } else {
      // Parcial = 2
      setFieldValueGastos("estado", 2);
    }
  }, [valuesGasto.montoTotal, valuesGasto.montoPagado, setFieldValueGastos]);

  // 🔄 Actualizar montoPagado cuando se selecciona un estado manualmente
  useEffect(() => {
    if (isUpdatingFromMonto.current) {
      isUpdatingFromMonto.current = false;
      return;
    }

    const estado = valuesGasto.estado;
    const montoTotal = valuesGasto.montoTotal;

    if (estado === null || montoTotal === null || montoTotal === 0) return;

    isUpdatingFromEstado.current = true;

    // Pagado = 1 → poner montoPagado = montoTotal
    if (estado === 1) {
      setFieldValueGastos("montoPagado", montoTotal);
    }
    // Pendiente = 3 → poner montoPagado = 0
    else if (estado === 3) {
      setFieldValueGastos("montoPagado", 0);
    }
    // Parcial = 2 → no cambiar montoPagado
  }, [valuesGasto.estado, valuesGasto.montoTotal, setFieldValueGastos]);

  return (
    <>
      <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        {isLoading && <LoaderFun absolute={false} />}
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Agregar un producto
          </h4>
        </div>
      </div>
      <form className="flex flex-col">
        <div className="px-2 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5">
            {/* 1️⃣ Código y nombre */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del producto"
                  hint={errors.nombre && touched.nombre ? errors.nombre : ""}
                  value={values.nombre ?? ""}
                  error={errors.nombre && touched.nombre ? true : false}
                  onChange={(e) => {
                    setFieldValue("nombre", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("nombre", true)}
                />
              </div>
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  type="text"
                  id="codigo"
                  placeholder="Ej: SKU-1234"
                  hint={errors.codigo}
                  value={values.codigo ?? ""}
                  error={errors.codigo ? true : false}
                  onChange={(e) => {
                    setFieldValue("codigo", e.target.value);
                  }}
                />
              </div>
            </div>

            {/* 2️⃣ Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                rows={3}
                placeholder="Detalles o características del producto..."
                value={values.descripcion ?? ""}
                className={`border rounded-xl w-full p-2 text-sm`}
                onChange={(e) => {
                  setFieldValue("descripcion", e.target.value);
                }}
              ></textarea>
            </div>

            {/* 3️⃣ Categoría, Marca y Unidad de medida */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Select<Option, false>
                  id="categoria"
                  styles={customStyles()}
                  placeholder="Selecciona una categoría..."
                  menuPortalTarget={document.body}
                  options={selectsData?.categorias?.map(
                    (element: BaseSelecst) => ({
                      value: element.id.toString(),
                      label: element.name,
                    })
                  )}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("categoriaId", parseInt(e.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select<Option, false>
                  id="tipo"
                  styles={customStyles()}
                  placeholder="Selecciona un tipo..."
                  menuPortalTarget={document.body}
                  options={selectsData?.tipos?.map((element: BaseSelecst) => ({
                    value: element.id.toString(),
                    label: element.name,
                  }))}
                  onChange={(e) => {
                    if (!e || Array.isArray(e)) return;
                    setFieldValue("tipoId", parseInt(e.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Select<Option, false>
                  id="marca"
                  styles={customStyles()}
                  placeholder="Selecciona una marca..."
                  menuPortalTarget={document.body}
                  options={selectsData?.marcas?.map((element: BaseSelecst) => ({
                    value: element.id.toString(),
                    label: element.name,
                  }))}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("marcaId", parseInt(e.value));
                  }}
                />
              </div>
            </div>

            {/* 4️⃣ Precios */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="precio_compra">Precio de compra</Label>
                <Input
                  type="text"
                  id="precio_compra"
                  placeholder="0.00"
                  hint={
                    errors.precioCompra && touched.precioCompra
                      ? errors.precioCompra
                      : ""
                  }
                  value={
                    values.precioCompra === 0 ? "" : values.precioCompra ?? ""
                  }
                  error={
                    errors.precioCompra && touched.precioCompra ? true : false
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("precioCompra", 0);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("precioCompra", Number(value));
                    }
                  }}
                  onBlur={() => setFieldTouched("precioCompra", true)}
                />
              </div>
              <div>
                <Label htmlFor="precio_venta">Precio de venta</Label>
                <Input
                  type="text"
                  id="precio_venta"
                  placeholder="0.00"
                  hint={
                    errors.precioVenta && touched.precioVenta
                      ? errors.precioVenta
                      : ""
                  }
                  value={
                    values.precioVenta === 0 ? "" : values.precioVenta ?? ""
                  }
                  error={
                    errors.precioVenta && touched.precioVenta ? true : false
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("precioVenta", 0);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("precioVenta", Number(value));
                    }
                  }}
                  onBlur={() => setFieldTouched("precioVenta", true)}
                />
              </div>
              <div>
                <Label htmlFor="precio_minimo">Precio minimo negociable</Label>
                <Input
                  type="text"
                  id="precio_minimo"
                  placeholder="0.00"
                  hint={errors.precioMinimo}
                  value={
                    values.precioMinimo === 0 ? "" : values.precioMinimo ?? ""
                  }
                  error={errors.precioMinimo ? true : false}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("precioMinimo", null);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("precioMinimo", Number(value));
                    }
                  }}
                />
              </div>
            </div>

            {/* 5️⃣ Stock y ubicación */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="stockActual">Stock actual</Label>
                <Input
                  type="text"
                  id="stockActual"
                  placeholder="0"
                  hint={
                    errors.stockActual && touched.stockActual
                      ? errors.stockActual
                      : ""
                  }
                  value={
                    values.stockActual === 0 ? "" : values.stockActual ?? ""
                  }
                  error={
                    errors.stockActual && touched.stockActual ? true : false
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("stockActual", 0);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("stockActual", Number(value));
                    }
                  }}
                  onBlur={() => setFieldTouched("stockActual", true)}
                />
              </div>
              <div>
                <Label htmlFor="stock_minimo">Stock mínimo</Label>
                <Input
                  type="text"
                  id="stock_minimo"
                  placeholder="0"
                  hint={errors.stockMinimo}
                  value={
                    values.stockMinimo === 0 ? "" : values.stockMinimo ?? ""
                  }
                  error={errors.stockMinimo ? true : false}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("stockMinimo", 0);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("stockMinimo", Number(value));
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  type="text"
                  id="ubicacion"
                  placeholder="Ej: Estante A3"
                  hint={errors.ubicacion}
                  value={values.ubicacion ?? ""}
                  error={errors.ubicacion ? true : false}
                  onChange={(e) => {
                    setFieldValue("ubicacion", e.target.value);
                  }}
                />
              </div>
            </div>

            {/* 6️⃣ Código de barras y estado */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="codigo_barras">Código de barras</Label>
                <Input
                  type="text"
                  id="codigo_barras"
                  placeholder="Ej: 1234567890"
                  hint={errors.codigoBarras}
                  value={values.codigoBarras ?? ""}
                  error={errors.codigoBarras ? true : false}
                  onChange={(e) => {
                    setFieldValue("codigoBarras", e.target.value);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select<Option, false>
                  id="estado"
                  styles={customStyles(!!errors.estadoId && touched.estadoId)}
                  placeholder="Seleccione un estado.."
                  menuPortalTarget={document.body}
                  options={selectsData?.estados?.map(
                    (element: BaseSelecst) => ({
                      value: element.id.toString(),
                      label: element.name,
                    })
                  )}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("estadoId", parseInt(e.value));
                  }}
                  onBlur={() => setFieldTouched("estadoId", true)}
                />
                {errors.estadoId && touched.estadoId && (
                  <p className={`mt-1.5 text-xs text-error-500`}>
                    {errors.estadoId}
                  </p>
                )}
              </div>
            </div>

            {/* 7️⃣ Impuesto */}
            <div>
              <Label htmlFor="impuesto">Impuesto (%)</Label>
              <Input
                type="text"
                id="impuesto"
                placeholder="Ej: 18"
                hint={errors.impuesto}
                value={values.impuesto === 0 ? "" : values.impuesto ?? ""}
                error={errors.impuesto ? true : false}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFieldValue("impuesto", 0);
                    return;
                  }
                  if (regexNum.test(value)) {
                    setFieldValue("impuesto", Number(value));
                  }
                }}
              />
            </div>

            {/* 8️⃣ Sección de Gastos */}
            <div className="border-t border-gray-200 pt-5 mt-2">
              <h5 className="text-lg font-semibold text-gray-700 dark:text-white/80 mb-4">
                Información del Gasto
              </h5>

              {/* Montos calculados automáticamente */}
              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                <div>
                  <Label htmlFor="montoTotal">Monto total</Label>
                  <Input
                    type="text"
                    id="montoTotal"
                    placeholder="0.00"
                    value={valuesGasto.montoTotal ?? ""}
                    disabled
                    hint="Calculado: Stock × Precio compra"
                  />
                </div>
                <div>
                  <Label htmlFor="montoPagado">Monto pagado</Label>
                  <Input
                    type="text"
                    id="montoPagado"
                    placeholder="0.00"
                    hint={
                      errorsGasto.montoPagado && touchedGasto.montoPagado
                        ? errorsGasto.montoPagado
                        : ""
                    }
                    value={
                      valuesGasto.montoPagado === 0
                        ? ""
                        : valuesGasto.montoPagado ?? ""
                    }
                    error={
                      errorsGasto.montoPagado && touchedGasto.montoPagado
                        ? true
                        : false
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setFieldValueGastos("montoPagado", 0);
                        return;
                      }
                      if (regexNum.test(value)) {
                        setFieldValueGastos("montoPagado", Number(value));
                      }
                    }}
                    onBlur={() => setFieldTouchedGasto("montoPagado", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="saldoPendiente">Saldo pendiente</Label>
                  <Input
                    type="text"
                    id="saldoPendiente"
                    placeholder="0.00"
                    value={valuesGasto.saldoPendiente ?? ""}
                    disabled
                    hint="Calculado automáticamente"
                  />
                </div>
              </div>

              {/* Estado de pago y método */}
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                <div>
                  <Label htmlFor="estadoGasto">Estado de pago</Label>
                  <Select<Option, false>
                    id="estadoGasto"
                    styles={customStyles(
                      !!errorsGasto.estado && touchedGasto.estado
                    )}
                    placeholder="Selecciona un estado..."
                    menuPortalTarget={document.body}
                    value={
                      valuesGasto.estado
                        ? {
                            value: valuesGasto.estado.toString(),
                            label:
                              ESTADOS_PAGO.find(
                                (e) => e.id === valuesGasto.estado
                              )?.name ?? "",
                          }
                        : null
                    }
                    options={ESTADOS_PAGO.map((estado) => ({
                      value: estado.id.toString(),
                      label: estado.name,
                    }))}
                    onChange={(e: SingleValue<Option>) => {
                      if (!e) return;
                      setFieldValueGastos("estado", parseInt(e.value));
                    }}
                    onBlur={() => setFieldTouchedGasto("estado", true)}
                  />
                  {errorsGasto.estado && touchedGasto.estado && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errorsGasto.estado}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="metodoPagoGasto">Método de pago</Label>
                  <Select<Option, false>
                    id="metodoPagoGasto"
                    styles={customStyles()}
                    placeholder="Selecciona método..."
                    menuPortalTarget={document.body}
                    value={
                      valuesGasto.metodoPago
                        ? {
                            value: valuesGasto.metodoPago,
                            label: valuesGasto.metodoPago,
                          }
                        : null
                    }
                    options={[
                      { value: "Efectivo", label: "Efectivo" },
                      { value: "Transferencia", label: "Transferencia" },
                      { value: "Tarjeta", label: "Tarjeta" },
                    ]}
                    onChange={(e: SingleValue<Option>) => {
                      if (!e) return;
                      setFieldValueGastos("metodoPago", e.value);
                    }}
                  />
                </div>
              </div>

              {/* Proveedor y fechas */}
              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                <div>
                  <Label htmlFor="proveedorGasto">Proveedor</Label>
                  <Input
                    type="text"
                    id="proveedorGasto"
                    placeholder="Nombre del proveedor"
                    value={valuesGasto.proveedor ?? ""}
                    onChange={(e) => {
                      setFieldValueGastos("proveedor", e.target.value);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaGasto">Fecha del gasto</Label>
                  <Input
                    type="date"
                    id="fechaGasto"
                    value={valuesGasto.fecha ?? ""}
                    onChange={(e) => {
                      setFieldValueGastos("fecha", e.target.value);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaPagoGasto">Fecha de pago</Label>
                  <Input
                    type="date"
                    id="fechaPagoGasto"
                    value={valuesGasto.fechaPago ?? ""}
                    onChange={(e) => {
                      setFieldValueGastos("fechaPago", e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* Origen de fondo y comprobante */}
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                <div>
                  <Label htmlFor="origenFondoGasto">Origen del fondo</Label>
                  <Select<Option, false>
                    id="origenFondoGasto"
                    styles={customStyles()}
                    placeholder="Selecciona origen..."
                    menuPortalTarget={document.body}
                    value={
                      valuesGasto.origenFondo
                        ? {
                            value: valuesGasto.origenFondo,
                            label: valuesGasto.origenFondo,
                          }
                        : null
                    }
                    options={[
                      { value: "Efectivo", label: "Efectivo" },
                      { value: "Cuenta de banco", label: "Cuenta de banco" },
                    ]}
                    onChange={(e: SingleValue<Option>) => {
                      if (!e) return;
                      setFieldValueGastos("origenFondo", e.value);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="comprobanteGasto">Comprobante</Label>
                  <Input
                    type="text"
                    id="comprobanteGasto"
                    placeholder="Número de comprobante"
                    value={valuesGasto.comprobante ?? ""}
                    onChange={(e) => {
                      setFieldValueGastos("comprobante", e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* Nota */}
              <div>
                <Label htmlFor="notaGasto">Nota</Label>
                <textarea
                  id="notaGasto"
                  rows={2}
                  placeholder="Observaciones adicionales..."
                  value={valuesGasto.nota ?? ""}
                  className="border rounded-xl w-full p-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  onChange={(e) => {
                    setFieldValueGastos("nota", e.target.value);
                  }}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={async (e?: React.MouseEvent<HTMLButtonElement>) => {
              e?.preventDefault();

              // Validar producto
              const errorsProducto = await validateForm();
              setTouched(
                Object.keys(initialValues).reduce((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {} as Record<string, boolean>),
                true
              );

              // Validar gasto
              const errorsGastoForm = await formikGasto.validateForm();
              formikGasto.setTouched(
                Object.keys(gastosInitialValues).reduce((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {} as Record<string, boolean>),
                true
              );

              // Si no hay errores en ninguno, guardar
              if (
                Object.keys(errorsProducto).length === 0 &&
                Object.keys(errorsGastoForm).length === 0
              ) {
                const gastoToSave: SaveGasto = {
                  tipoGasto: valuesGasto.tipoGasto ?? TIPO_GASTO_DEFAULT,
                  proveedor: valuesGasto.proveedor || undefined,
                  comprobante: valuesGasto.comprobante || undefined,
                  fecha: valuesGasto.fecha || undefined,
                  montoTotal: valuesGasto.montoTotal!,
                  montoPagado: valuesGasto.montoPagado ?? 0,
                  saldoPendiente: valuesGasto.saldoPendiente || undefined,
                  estado: valuesGasto.estado!,
                  metodoPago: valuesGasto.metodoPago || undefined,
                  fechaPago: valuesGasto.fechaPago || undefined,
                  origenFondo: valuesGasto.origenFondo || undefined,
                  referencia: valuesGasto.referencia || undefined,
                  nota: valuesGasto.nota || undefined,
                };

                SaveProductoConGasto(values, gastoToSave);
              } else {
                console.log("Errores producto:", errorsProducto);
                console.log("Errores gasto:", errorsGastoForm);
              }
            }}
          >
            Guardar producto
          </Button>
        </div>
      </form>
    </>
  );
}

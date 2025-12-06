import { customStyles } from "../../Utilities/StyleForReactSelect";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select, { SingleValue } from "react-select";
import { FormikProps } from "formik";
import { GastoFormValues, SelectsGastos } from "../../Types/Gastos";
import { BaseSelecst, Option, Selects } from "../../Types/ProductTypes";

// Regex para validar números (enteros y decimales)
const regexNum = /^[0-9]*\.?[0-9]*$/;

// Tipo flexible que acepta tanto Selects como SelectsGastos
type SelectsDataType = Partial<
  Selects & {
    tiposGasto?: BaseSelecst[];
    metodosPago?: BaseSelecst[];
    origenesFondo?: BaseSelecst[];
    productos?: BaseSelecst[];
  }
>;

type FormGastosProps = {
  formik: FormikProps<GastoFormValues>;
  selectsData: SelectsDataType | SelectsGastos | undefined;
  onCancel?: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  title?: string;
  showTipoGasto?: boolean;
};

export default function FormGastos({
  formik,
  selectsData,
  onCancel,
  onSubmit,
  submitLabel = "Guardar gasto",
  title = "Registrar gasto",
  showTipoGasto = true,
}: FormGastosProps) {
  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;

  return (
    <>
      <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h4>
        </div>
      </div>
      <form className="flex flex-col">
        <div className="px-2 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5">
            {/* 1️⃣ Tipo de gasto y Estado */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              {showTipoGasto && (
                <div>
                  <Label htmlFor="tipoGasto">Tipo de gasto</Label>
                  <Select<Option, false>
                    id="tipoGasto"
                    styles={customStyles(
                      !!errors.tipoGasto && touched.tipoGasto
                    )}
                    placeholder="Selecciona un tipo..."
                    menuPortalTarget={document.body}
                    options={(selectsData as SelectsGastos)?.tiposGasto?.map(
                      (element: BaseSelecst) => ({
                        value: element.id.toString(),
                        label: element.name,
                      })
                    )}
                    onChange={(e: SingleValue<Option>) => {
                      if (!e) return;
                      setFieldValue("tipoGasto", parseInt(e.value));
                    }}
                    onBlur={() => setFieldTouched("tipoGasto", true)}
                  />
                  {errors.tipoGasto && touched.tipoGasto && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errors.tipoGasto}
                    </p>
                  )}
                </div>
              )}
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select<Option, false>
                  id="estado"
                  styles={customStyles(!!errors.estado && touched.estado)}
                  placeholder="Selecciona un estado..."
                  menuPortalTarget={document.body}
                  options={(selectsData as SelectsGastos)?.estados?.map(
                    (element: BaseSelecst) => ({
                      value: element.id.toString(),
                      label: element.name,
                    })
                  )}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("estado", parseInt(e.value));
                  }}
                  onBlur={() => setFieldTouched("estado", true)}
                />
                {errors.estado && touched.estado && (
                  <p className="mt-1.5 text-xs text-error-500">
                    {errors.estado}
                  </p>
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
                  hint={
                    errors.proveedor && touched.proveedor
                      ? errors.proveedor
                      : ""
                  }
                  value={values.proveedor ?? ""}
                  error={errors.proveedor && touched.proveedor ? true : false}
                  onChange={(e) => {
                    setFieldValue("proveedor", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("proveedor", true)}
                />
              </div>
              <div>
                <Label htmlFor="comprobante">Comprobante</Label>
                <Input
                  type="text"
                  id="comprobante"
                  placeholder="Número de comprobante"
                  hint={
                    errors.comprobante && touched.comprobante
                      ? errors.comprobante
                      : ""
                  }
                  value={values.comprobante ?? ""}
                  error={
                    errors.comprobante && touched.comprobante ? true : false
                  }
                  onChange={(e) => {
                    setFieldValue("comprobante", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("comprobante", true)}
                />
              </div>
            </div>

            {/* 3️⃣ Montos */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="montoTotal">Monto total</Label>
                <Input
                  type="text"
                  id="montoTotal"
                  placeholder="0.00"
                  hint={
                    errors.montoTotal && touched.montoTotal
                      ? errors.montoTotal
                      : ""
                  }
                  value={values.montoTotal === 0 ? "" : values.montoTotal ?? ""}
                  error={errors.montoTotal && touched.montoTotal ? true : false}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("montoTotal", 0);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("montoTotal", Number(value));
                    }
                  }}
                  onBlur={() => setFieldTouched("montoTotal", true)}
                />
              </div>
              <div>
                <Label htmlFor="montoPagado">Monto pagado</Label>
                <Input
                  type="text"
                  id="montoPagado"
                  placeholder="0.00"
                  hint={
                    errors.montoPagado && touched.montoPagado
                      ? errors.montoPagado
                      : ""
                  }
                  value={
                    values.montoPagado === 0 ? "" : values.montoPagado ?? ""
                  }
                  error={
                    errors.montoPagado && touched.montoPagado ? true : false
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("montoPagado", 0);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("montoPagado", Number(value));
                    }
                  }}
                  onBlur={() => setFieldTouched("montoPagado", true)}
                />
              </div>
              <div>
                <Label htmlFor="saldoPendiente">Saldo pendiente</Label>
                <Input
                  type="text"
                  id="saldoPendiente"
                  placeholder="0.00"
                  hint={errors.saldoPendiente}
                  value={
                    values.saldoPendiente === 0
                      ? ""
                      : values.saldoPendiente ?? ""
                  }
                  error={errors.saldoPendiente ? true : false}
                  disabled
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("saldoPendiente", null);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("saldoPendiente", Number(value));
                    }
                  }}
                />
              </div>
            </div>

            {/* 4️⃣ Fechas */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fecha">Fecha del gasto</Label>
                <Input
                  type="date"
                  id="fecha"
                  placeholder="Selecciona una fecha"
                  hint={errors.fecha && touched.fecha ? errors.fecha : ""}
                  value={values.fecha ?? ""}
                  error={errors.fecha && touched.fecha ? true : false}
                  onChange={(e) => {
                    setFieldValue("fecha", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("fecha", true)}
                />
              </div>
              <div>
                <Label htmlFor="fechaPago">Fecha de pago</Label>
                <Input
                  type="date"
                  id="fechaPago"
                  placeholder="Selecciona una fecha"
                  hint={errors.fechaPago}
                  value={values.fechaPago ?? ""}
                  error={errors.fechaPago ? true : false}
                  onChange={(e) => {
                    setFieldValue("fechaPago", e.target.value);
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
                  styles={customStyles(
                    !!errors.metodoPago && touched.metodoPago
                  )}
                  placeholder="Selecciona método de pago..."
                  menuPortalTarget={document.body}
                  value={
                    values.metodoPago
                      ? { value: values.metodoPago, label: values.metodoPago }
                      : null
                  }
                  options={[
                    { value: "Efectivo", label: "Efectivo" },
                    { value: "Transferencia", label: "Transferencia" },
                    { value: "Tarjeta", label: "Tarjeta" },
                  ]}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("metodoPago", e.value);
                  }}
                  onBlur={() => setFieldTouched("metodoPago", true)}
                />
                {errors.metodoPago && touched.metodoPago && (
                  <p className="mt-1.5 text-xs text-error-500">
                    {errors.metodoPago}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="origenFondo">Origen del fondo</Label>
                <Select<Option, false>
                  id="origenFondo"
                  styles={customStyles(
                    !!errors.origenFondo && touched.origenFondo
                  )}
                  placeholder="Selecciona origen del fondo..."
                  menuPortalTarget={document.body}
                  value={
                    values.origenFondo
                      ? { value: values.origenFondo, label: values.origenFondo }
                      : null
                  }
                  options={[
                    { value: "Efectivo", label: "Efectivo" },
                    { value: "Cuenta de banco", label: "Cuenta de banco" },
                  ]}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("origenFondo", e.value);
                  }}
                  onBlur={() => setFieldTouched("origenFondo", true)}
                />
                {errors.origenFondo && touched.origenFondo && (
                  <p className="mt-1.5 text-xs text-error-500">
                    {errors.origenFondo}
                  </p>
                )}
              </div>
            </div>

            {/* 6️⃣ Cantidad (para inventario) */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  type="text"
                  id="cantidad"
                  placeholder="0"
                  hint={errors.cantidad}
                  value={values.cantidad === 0 ? "" : values.cantidad ?? ""}
                  error={errors.cantidad ? true : false}
                  disabled
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFieldValue("cantidad", null);
                      return;
                    }
                    if (regexNum.test(value)) {
                      setFieldValue("cantidad", Number(value));
                    }
                  }}
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
                hint={errors.referencia}
                value={values.referencia ?? ""}
                error={errors.referencia ? true : false}
                onChange={(e) => {
                  setFieldValue("referencia", e.target.value);
                }}
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
                onChange={(e) => {
                  setFieldValue("nota", e.target.value);
                }}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (onCancel) {
                onCancel();
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
              e?.preventDefault();
              onSubmit();
            }}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </>
  );
}

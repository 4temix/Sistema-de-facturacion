import { customStyles } from "../../Utilities/StyleForReactSelect";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select, { SingleValue } from "react-select";
import { FormikProps } from "formik";
import {
  EmpleadoFormValues,
  SelectsEmpleados,
} from "../../Types/Empleados.types";
import { Option } from "../../Types/ProductTypes";

// Regex para validar números
const regexNum = /^[0-9]*\.?[0-9]*$/;

// Horas laborables por mes (8 horas/día × 22 días laborables)
const HORAS_POR_MES = 176;

// Tipos de contrato predefinidos
const TIPOS_CONTRATO = [
  { value: "Indefinido", label: "Indefinido" },
  { value: "Temporal", label: "Temporal" },
  { value: "Por obra", label: "Por obra" },
  { value: "Prueba", label: "Prueba" },
];

type FormEmpleadosProps = {
  formik: FormikProps<EmpleadoFormValues>;
  selectsData: SelectsEmpleados | undefined;
  onCancel?: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  title?: string;
};

export default function FormEmpleados({
  formik,
  selectsData,
  onCancel,
  onSubmit,
  submitLabel = "Guardar empleado",
  title = "Registrar empleado",
}: FormEmpleadosProps) {
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
            {/* 1️⃣ Datos personales */}
            <div className="border-b pb-4 mb-2">
              <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Datos Personales
              </h5>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    type="text"
                    id="nombres"
                    placeholder="Nombres del empleado"
                    hint={
                      errors.nombres && touched.nombres ? errors.nombres : ""
                    }
                    value={values.nombres}
                    error={!!errors.nombres && touched.nombres}
                    onChange={(e) => setFieldValue("nombres", e.target.value)}
                    onBlur={() => setFieldTouched("nombres", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    type="text"
                    id="apellidos"
                    placeholder="Apellidos del empleado"
                    hint={
                      errors.apellidos && touched.apellidos
                        ? errors.apellidos
                        : ""
                    }
                    value={values.apellidos}
                    error={!!errors.apellidos && touched.apellidos}
                    onChange={(e) => setFieldValue("apellidos", e.target.value)}
                    onBlur={() => setFieldTouched("apellidos", true)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
                <div>
                  <Label htmlFor="cedula">Cédula *</Label>
                  <Input
                    type="text"
                    id="cedula"
                    placeholder="000-0000000-0"
                    hint={errors.cedula && touched.cedula ? errors.cedula : ""}
                    value={values.cedula}
                    error={!!errors.cedula && touched.cedula}
                    onChange={(e) => setFieldValue("cedula", e.target.value)}
                    onBlur={() => setFieldTouched("cedula", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                  <Input
                    type="date"
                    id="fechaNacimiento"
                    value={values.fechaNacimiento}
                    onChange={(e) =>
                      setFieldValue("fechaNacimiento", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    type="text"
                    id="telefono"
                    placeholder="809-000-0000"
                    hint={
                      errors.telefono && touched.telefono ? errors.telefono : ""
                    }
                    value={values.telefono}
                    error={!!errors.telefono && touched.telefono}
                    onChange={(e) => setFieldValue("telefono", e.target.value)}
                    onBlur={() => setFieldTouched("telefono", true)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-3 mt-3">
                <div>
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="correo@ejemplo.com"
                    hint={errors.email && touched.email ? errors.email : ""}
                    value={values.email}
                    error={!!errors.email && touched.email}
                    onChange={(e) => setFieldValue("email", e.target.value)}
                    onBlur={() => setFieldTouched("email", true)}
                  />
                </div>
              </div>
            </div>

            {/* 2️⃣ Dirección */}
            <div className="border-b pb-4 mb-2">
              <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Dirección
              </h5>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="provincia">Provincia *</Label>
                  <Input
                    type="text"
                    id="provincia"
                    placeholder="Provincia"
                    hint={
                      errors.provincia && touched.provincia
                        ? errors.provincia
                        : ""
                    }
                    value={values.provincia}
                    error={!!errors.provincia && touched.provincia}
                    onChange={(e) => setFieldValue("provincia", e.target.value)}
                    onBlur={() => setFieldTouched("provincia", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="municipio">Municipio *</Label>
                  <Input
                    type="text"
                    id="municipio"
                    placeholder="Municipio"
                    hint={
                      errors.municipio && touched.municipio
                        ? errors.municipio
                        : ""
                    }
                    value={values.municipio}
                    error={!!errors.municipio && touched.municipio}
                    onChange={(e) => setFieldValue("municipio", e.target.value)}
                    onBlur={() => setFieldTouched("municipio", true)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="direccion">Dirección completa *</Label>
                <Input
                  type="text"
                  id="direccion"
                  placeholder="Calle, número, sector..."
                  hint={
                    errors.direccion && touched.direccion
                      ? errors.direccion
                      : ""
                  }
                  value={values.direccion}
                  error={!!errors.direccion && touched.direccion}
                  onChange={(e) => setFieldValue("direccion", e.target.value)}
                  onBlur={() => setFieldTouched("direccion", true)}
                />
              </div>
            </div>

            {/* 3️⃣ Información laboral */}
            <div className="border-b pb-4 mb-2">
              <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Información Laboral
              </h5>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fechaIngreso">Fecha de ingreso *</Label>
                  <Input
                    type="date"
                    id="fechaIngreso"
                    hint={
                      errors.fechaIngreso && touched.fechaIngreso
                        ? errors.fechaIngreso
                        : ""
                    }
                    value={values.fechaIngreso}
                    error={!!errors.fechaIngreso && touched.fechaIngreso}
                    onChange={(e) =>
                      setFieldValue("fechaIngreso", e.target.value)
                    }
                    onBlur={() => setFieldTouched("fechaIngreso", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="puestoId">Puesto *</Label>
                  <Select<Option, false>
                    id="puestoId"
                    styles={customStyles(!!errors.puestoId && touched.puestoId)}
                    placeholder="Seleccione un puesto..."
                    menuPortalTarget={document.body}
                    value={
                      values.puestoId
                        ? {
                            value: values.puestoId.toString(),
                            label:
                              selectsData?.puestos?.find(
                                (p) => p.id === values.puestoId
                              )?.nombre || "",
                          }
                        : null
                    }
                    options={selectsData?.puestos?.map((p) => ({
                      value: p.id.toString(),
                      label: p.nombre,
                    }))}
                    onChange={(e: SingleValue<Option>) => {
                      if (!e) return;
                      setFieldValue("puestoId", parseInt(e.value));
                    }}
                    onBlur={() => setFieldTouched("puestoId", true)}
                  />
                  {errors.puestoId && touched.puestoId && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errors.puestoId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
                <div>
                  <Label htmlFor="tipoContrato">Tipo de contrato *</Label>
                  <Select<Option, false>
                    id="tipoContrato"
                    styles={customStyles(
                      !!errors.tipoContrato && touched.tipoContrato
                    )}
                    placeholder="Seleccione..."
                    menuPortalTarget={document.body}
                    value={
                      values.tipoContrato
                        ? {
                            value: values.tipoContrato,
                            label: values.tipoContrato,
                          }
                        : null
                    }
                    options={TIPOS_CONTRATO}
                    onChange={(e: SingleValue<Option>) => {
                      if (!e) return;
                      setFieldValue("tipoContrato", e.value);
                    }}
                    onBlur={() => setFieldTouched("tipoContrato", true)}
                  />
                  {errors.tipoContrato && touched.tipoContrato && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {errors.tipoContrato}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="salarioBase">Salario base *</Label>
                  <Input
                    type="text"
                    id="salarioBase"
                    placeholder="0.00"
                    hint={
                      errors.salarioBase && touched.salarioBase
                        ? errors.salarioBase
                        : ""
                    }
                    value={
                      values.salarioBase === null ? "" : values.salarioBase
                    }
                    error={!!errors.salarioBase && touched.salarioBase}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setFieldValue("salarioBase", null);
                        setFieldValue("salarioPorHora", null);
                        return;
                      }
                      if (regexNum.test(value)) {
                        const salarioBase = Number(value);
                        setFieldValue("salarioBase", salarioBase);
                        // Calcular salario por hora automáticamente
                        if (salarioBase > 0) {
                          const salarioPorHora = salarioBase / HORAS_POR_MES;
                          setFieldValue("salarioPorHora", Number(salarioPorHora.toFixed(2)));
                        }
                      }
                    }}
                    onBlur={() => setFieldTouched("salarioBase", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="salarioPorHora">Salario por hora</Label>
                  <Input
                    type="text"
                    id="salarioPorHora"
                    placeholder="0.00"
                    value={
                      values.salarioPorHora === null
                        ? ""
                        : values.salarioPorHora
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setFieldValue("salarioPorHora", null);
                        setFieldValue("salarioBase", null);
                        return;
                      }
                      if (regexNum.test(value)) {
                        const salarioPorHora = Number(value);
                        setFieldValue("salarioPorHora", salarioPorHora);
                        // Calcular salario base automáticamente
                        if (salarioPorHora > 0) {
                          const salarioBase = salarioPorHora * HORAS_POR_MES;
                          setFieldValue("salarioBase", Number(salarioBase.toFixed(2)));
                          setFieldTouched("salarioBase", true);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 4️⃣ Seguridad social */}
            <div className="border-b pb-4 mb-2">
              <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Seguridad Social
              </h5>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="arsId">ARS</Label>
                  <Select<Option, false>
                    id="arsId"
                    styles={customStyles()}
                    placeholder="Seleccione ARS..."
                    menuPortalTarget={document.body}
                    isClearable
                    value={
                      values.arsId
                        ? {
                            value: values.arsId.toString(),
                            label:
                              selectsData?.ars?.find(
                                (a) => a.id === values.arsId
                              )?.nombre || "",
                          }
                        : null
                    }
                    options={selectsData?.ars?.map((a) => ({
                      value: a.id.toString(),
                      label: a.nombre,
                    }))}
                    onChange={(e: SingleValue<Option>) => {
                      setFieldValue("arsId", e ? parseInt(e.value) : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="afpId">AFP</Label>
                  <Select<Option, false>
                    id="afpId"
                    styles={customStyles()}
                    placeholder="Seleccione AFP..."
                    menuPortalTarget={document.body}
                    isClearable
                    value={
                      values.afpId
                        ? {
                            value: values.afpId.toString(),
                            label:
                              selectsData?.afp?.find(
                                (a) => a.id === values.afpId
                              )?.nombre || "",
                          }
                        : null
                    }
                    options={selectsData?.afp?.map((a) => ({
                      value: a.id.toString(),
                      label: a.nombre,
                    }))}
                    onChange={(e: SingleValue<Option>) => {
                      setFieldValue("afpId", e ? parseInt(e.value) : null);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 5️⃣ Información bancaria */}
            <div>
              <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Información Bancaria
              </h5>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    type="text"
                    id="banco"
                    placeholder="Nombre del banco"
                    value={values.banco}
                    onChange={(e) => setFieldValue("banco", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cuentaBancaria">Cuenta bancaria</Label>
                  <Input
                    type="text"
                    id="cuentaBancaria"
                    placeholder="Número de cuenta"
                    value={values.cuentaBancaria}
                    onChange={(e) =>
                      setFieldValue("cuentaBancaria", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (onCancel) onCancel();
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

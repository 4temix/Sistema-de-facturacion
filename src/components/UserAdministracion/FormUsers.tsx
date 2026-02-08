import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { FormikProps } from "formik";
import { UserSelectResponse } from "../../Types/Usuario";
import Select, { SingleValue } from "react-select";
import { BaseSelecst, Option } from "../../Types/ProductTypes";
import { customStyles } from "../../Utilities/StyleForReactSelect";
import { FormContent } from "../../pages/Administracion/userAdministracion";
// // Regex para validar números
// const regexNum = /^[0-9]*\.?[0-9]*$/;

// // Tipos de contrato predefinidos
// const TIPOS_CONTRATO = [
//   { value: "Indefinido", label: "Indefinido" },
//   { value: "Temporal", label: "Temporal" },
//   { value: "Por obra", label: "Por obra" },
//   { value: "Prueba", label: "Prueba" },
// ];

type FormEmpleadosProps = {
  formik: FormikProps<FormContent>;
  selectsData: UserSelectResponse | undefined;
  onCancel?: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  title?: string;
};

export default function FormUsers({
  formik,
  selectsData,
  onCancel,
  onSubmit,
  submitLabel = "Guardar usuario",
  title = "Registrar usuario",
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
            <div className="mb-2">
              <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Datos Personales
              </h5>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input
                    type="text"
                    id="nombres"
                    placeholder="Nombres del usuario"
                    hint={
                      errors.realName && touched.realName ? errors.realName : ""
                    }
                    value={values.realName}
                    error={!!errors.realName && touched.realName}
                    onChange={(e) => setFieldValue("realName", e.target.value)}
                    onBlur={() => setFieldTouched("realName", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    type="text"
                    id="apellidos"
                    placeholder="Apellidos del empleado"
                    hint={
                      errors.lastName && touched.lastName ? errors.lastName : ""
                    }
                    value={values.lastName}
                    error={!!errors.lastName && touched.lastName}
                    onChange={(e) => setFieldValue("lastName", e.target.value)}
                    onBlur={() => setFieldTouched("lastName", true)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-3 mt-3">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
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

              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
                <div>
                  <Label htmlFor="userName">UserName</Label>
                  <Input
                    type="text"
                    id="userName"
                    placeholder="userName"
                    hint={
                      errors.username && touched.username ? errors.username : ""
                    }
                    value={values.username}
                    error={!!errors.username && touched.username}
                    onChange={(e) => setFieldValue("username", e.target.value)}
                    onBlur={() => setFieldTouched("username", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="pass">Contraseña</Label>
                  <Input
                    id="pass"
                    placeholder="contraseña"
                    value={values.pass}
                    hint={errors.pass && touched.pass ? errors.pass : ""}
                    onChange={(e) => setFieldValue("pass", e.target.value)}
                    error={!!errors.pass && touched.pass}
                    onBlur={() => setFieldTouched("pass", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Confirmacion de contraseña</Label>
                  <Input
                    type="text"
                    id="telefono"
                    placeholder="Repetir contraseña"
                    hint={
                      errors.repeatpass && touched.repeatpass
                        ? errors.repeatpass
                        : ""
                    }
                    value={values.repeatpass}
                    error={!!errors.repeatpass && touched.repeatpass}
                    onChange={(e) =>
                      setFieldValue("repeatpass", e.target.value)
                    }
                    onBlur={() => setFieldTouched("repeatpass", true)}
                  />
                </div>
              </div>
            </div>

            {/* 2️⃣ Dirección */}
            <div className="border-b pb-4 mb-2">
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="provincia">Numero de telefono</Label>
                  <Input
                    type="text"
                    id="provincia"
                    placeholder="809-000-0000"
                    hint={
                      errors.teNumber && touched.teNumber ? errors.teNumber : ""
                    }
                    value={values.teNumber}
                    error={!!errors.teNumber && touched.teNumber}
                    onChange={(e) => setFieldValue("teNumber", e.target.value)}
                    onBlur={() => setFieldTouched("teNumber", true)}
                  />
                </div>
                <div>
                  <Label htmlFor="compName">Nombre de compañia</Label>
                  <Input
                    type="text"
                    id="compName"
                    placeholder="Nombre de la compañia"
                    hint={
                      errors.compName && touched.compName ? errors.compName : ""
                    }
                    value={values.compName}
                    error={!!errors.compName && touched.compName}
                    onChange={(e) => setFieldValue("compName", e.target.value)}
                    onBlur={() => setFieldTouched("compName", true)}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3 mt-5">
                <div>
                  <Label htmlFor="categoria">Role</Label>
                  <Select<Option, false>
                    id="categoria"
                    styles={customStyles(!!errors.rolId && touched.rolId)}
                    placeholder="Rol seleccionado"
                    menuPortalTarget={document.body}
                    options={selectsData?.roles?.map(
                      (element: BaseSelecst) => ({
                        value: element.id.toString(),
                        label: element.name,
                      }),
                    )}
                    onChange={(e: SingleValue<Option>) => {
                      if (!e) return;
                      setFieldValue("rolId", parseInt(e.value));
                    }}
                    onBlur={() => setFieldTouched("rolId", true)}
                  />
                  {errors.rolId && touched.rolId && (
                    <p className={`mt-1.5 text-xs text-error-500`}>
                      {errors.rolId}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="categoria">Estado</Label>
                  <Select<Option, false>
                    id="categoria"
                    styles={customStyles(!!errors.estado && touched.estado)}
                    placeholder="Estado de la cuenta"
                    menuPortalTarget={document.body}
                    options={selectsData?.estados?.map(
                      (element: BaseSelecst) => ({
                        value: element.id.toString(),
                        label: element.name,
                      }),
                    )}
                    onChange={(e: SingleValue<Option>) => {
                      if (!e) return;
                      setFieldValue("estado", parseInt(e.value));
                    }}
                    onBlur={() => setFieldTouched("estado", true)}
                  />
                  {errors.estado && touched.estado && (
                    <p className={`mt-1.5 text-xs text-error-500`}>
                      {errors.estado}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                {/* <Label htmlFor="direccion">Dirección completa *</Label>
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
                /> */}
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

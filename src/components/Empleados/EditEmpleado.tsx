import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { apiRequest, apiRequestThen } from "../../Utilities/FetchFuntions";
import {
  EmpleadoFormValues,
  EmpleadoUpdateDto,
  SelectsEmpleados,
} from "../../Types/Empleados.types";
import { ValidationEmpleado } from "./yup";
import FormEmpleados from "./FormEmpleados";
import LoaderFun from "../loader/LoaderFunc";
import Label from "../form/Label";
import Input from "../form/input/InputField";

type Props = {
  id: number;
  closeModal: () => void;
  onSuccess: () => void;
};

// Valores iniciales
const initialFormValues: EmpleadoFormValues = {
  nombres: "",
  apellidos: "",
  cedula: "",
  fechaNacimiento: "",
  telefono: "",
  email: "",
  provincia: "",
  municipio: "",
  direccion: "",
  fechaIngreso: "",
  puestoId: null,
  tipoContrato: "",
  salarioBase: null,
  salarioPorHora: null,
  arsId: null,
  afpId: null,
  banco: "",
  cuentaBancaria: "",
};

export default function EditEmpleado({ id, closeModal, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectsData, setSelectsData] = useState<SelectsEmpleados>();
  const [fechaSalida, setFechaSalida] = useState<string>("");

  const formik = useFormik<EmpleadoFormValues>({
    initialValues: initialFormValues,
    validationSchema: ValidationEmpleado,
    onSubmit: async (values) => {
      setIsSaving(true);

      const empleadoData: EmpleadoUpdateDto = {
        id,
        nombres: values.nombres,
        apellidos: values.apellidos,
        cedula: values.cedula,
        fechaNacimiento: values.fechaNacimiento || undefined,
        telefono: values.telefono,
        email: values.email,
        provincia: values.provincia,
        municipio: values.municipio,
        direccion: values.direccion,
        fechaIngreso: values.fechaIngreso,
        puestoId: values.puestoId!,
        tipoContrato: values.tipoContrato,
        salarioBase: values.salarioBase!,
        salarioPorHora: values.salarioPorHora || undefined,
        arsId: values.arsId || undefined,
        afpId: values.afpId || undefined,
        banco: values.banco,
        cuentaBancaria: values.cuentaBancaria,
        fechaSalida: fechaSalida || undefined,
      };

      try {
        const response = await apiRequest({
          url: "api/empleados/actualizar_empleado",
          configuration: {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(empleadoData),
          },
        });

        if (response.success) {
          onSuccess();
          closeModal();
        }
      } catch (error) {
        console.error("Error al actualizar empleado:", error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Cargar datos del empleado
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Cargar selects
      const selectsResponse = await apiRequestThen<{
        puestos: { id: number; nombre: string }[];
        ars: { id: number; nombre: string }[];
        afp: { id: number; nombre: string }[];
      }>({ url: "api/empleados/selects-form" });

      if (selectsResponse.success && selectsResponse.result) {
        setSelectsData({
          ...selectsResponse.result,
          tiposContrato: [],
        });
      }

      // Cargar datos del empleado
      const empleadoResponse = await apiRequestThen<EmpleadoUpdateDto>({
        url: `api/empleados/get-data-update/${id}`,
      });

      if (empleadoResponse.success && empleadoResponse.result) {
        const emp = empleadoResponse.result;
        formik.setValues({
          nombres: emp.nombres || "",
          apellidos: emp.apellidos || "",
          cedula: emp.cedula || "",
          fechaNacimiento: emp.fechaNacimiento || "",
          telefono: emp.telefono || "",
          email: emp.email || "",
          provincia: emp.provincia || "",
          municipio: emp.municipio || "",
          direccion: emp.direccion || "",
          fechaIngreso: emp.fechaIngreso || "",
          puestoId: emp.puestoId || null,
          tipoContrato: emp.tipoContrato || "",
          salarioBase: emp.salarioBase || null,
          salarioPorHora: emp.salarioPorHora || null,
          arsId: emp.arsId || null,
          afpId: emp.afpId || null,
          banco: emp.banco || "",
          cuentaBancaria: emp.cuentaBancaria || "",
        });
        setFechaSalida(emp.fechaSalida || "");
      }

      setIsLoading(false);
    }

    loadData();
  }, [id]);

  if (isLoading) {
    return <LoaderFun absolute={false} />;
  }

  return (
    <div className="relative">
      {isSaving && <LoaderFun absolute={false} />}
      <FormEmpleados
        formik={formik}
        selectsData={selectsData}
        onCancel={closeModal}
        onSubmit={() => formik.handleSubmit()}
        submitLabel="Actualizar empleado"
        title="Editar empleado"
      />

      {/* Campo adicional de fecha de salida */}
      <div className="px-2 mt-4 border-t pt-4">
        <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Baja del empleado
        </h5>
        <div className="max-w-xs">
          <Label htmlFor="fechaSalida">Fecha de salida</Label>
          <Input
            type="date"
            id="fechaSalida"
            value={fechaSalida}
            onChange={(e) => setFechaSalida(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Dejar vacío si el empleado sigue activo
          </p>
        </div>
      </div>
    </div>
  );
}

import * as yup from "yup";

export const ValidationEmpleado = yup.object().shape({
  nombres: yup
    .string()
    .required("El nombre es requerido")
    .min(2, "Mínimo 2 caracteres"),
  apellidos: yup
    .string()
    .required("El apellido es requerido")
    .min(2, "Mínimo 2 caracteres"),
  cedula: yup
    .string()
    .required("La cédula es requerida")
    .matches(/^\d{3}-?\d{7}-?\d{1}$/, "Formato de cédula inválido"),
  fechaNacimiento: yup.string().nullable(),
  telefono: yup.string().required("El teléfono es requerido"),
  email: yup
    .string()
    .email("Correo inválido")
    .required("El correo es requerido"),
  provincia: yup.string().required("La provincia es requerida"),
  municipio: yup.string().required("El municipio es requerido"),
  direccion: yup.string().required("La dirección es requerida"),
  fechaIngreso: yup.string().required("La fecha de ingreso es requerida"),
  puestoId: yup
    .number()
    .nullable()
    .required("El puesto es requerido")
    .min(1, "Seleccione un puesto"),
  tipoContrato: yup.string().required("El tipo de contrato es requerido"),
  salarioBase: yup
    .number()
    .nullable()
    .required("El salario base es requerido")
    .min(0, "El salario debe ser positivo"),
  salarioPorHora: yup.number().nullable(),
  arsId: yup.number().nullable(),
  afpId: yup.number().nullable(),
  banco: yup.string().nullable(),
  cuentaBancaria: yup.string().nullable(),
});

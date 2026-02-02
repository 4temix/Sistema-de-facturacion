import * as yup from "yup";

export const ValidationUpdateUser = yup.object({
  username: yup
    .string()
    .required("El usuario es requerido")
    .min(3, "Mínimo 3 caracteres"),

  realName: yup
    .string()
    .required("El nombre es requerido")
    .min(2, "Mínimo 2 caracteres"),

  lastName: yup
    .string()
    .required("El apellido es requerido")
    .min(2, "Mínimo 2 caracteres"),

  email: yup
    .string()
    .email("Correo inválido")
    .required("El correo es requerido"),

  teNumber: yup.string().required("El teléfono es requerido"),

  about: yup.string().nullable(),

  compName: yup.string().nullable(),

  pass: yup.string().min(4, "Mínimo 4 caracteres"),

  repeatpass: yup
    .string()
    .oneOf([yup.ref("repeatpass")], "Las contraseñas no coinciden")
    .min(4, "Mínimo 4 caracteres"),

  rolId: yup
    .number()
    .required("El rol es requerido")
    .min(1, "Seleccione un rol"),

  estado: yup.number().required("El estado es requerido"),
});

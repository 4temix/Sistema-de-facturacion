import * as Yup from "yup";

/** Alta de plan (POST save_membership_plan). */
export const ValidationMembresiaPlanCreate = Yup.object({
  name: Yup.string()
    .trim()
    .required("El nombre es obligatorio")
    .max(150, "Máximo 150 caracteres"),
  price: Yup.number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Precio obligatorio"),
  intervalCount: Yup.number()
    .integer("Debe ser un número entero")
    .min(1, "Mínimo 1 intervalo")
    .required("Cantidad obligatoria"),
  intervalTypeMes: Yup.boolean().required(),
  availableAll: Yup.boolean(),
  accessFinished: Yup.boolean(),
});

/** Actualización de plan (PUT update_membership_plan). */
export const ValidationMembresiaPlanUpdate = Yup.object({
  id: Yup.number().integer().positive().required(),
  name: Yup.string()
    .trim()
    .required("El nombre es obligatorio")
    .max(150, "Máximo 150 caracteres"),
  price: Yup.number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Precio obligatorio"),
  intervalCount: Yup.number()
    .integer("Debe ser un número entero")
    .min(1, "Mínimo 1 intervalo")
    .required("Cantidad obligatoria"),
  availableAll: Yup.boolean(),
  accessFinished: Yup.boolean(),
  isActive: Yup.boolean(),
});

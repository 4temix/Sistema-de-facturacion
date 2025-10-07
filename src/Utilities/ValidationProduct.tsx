import * as Yup from "yup";

export const ValidationProduct = Yup.object({
  codigo: Yup.string().max(50, "Máximo 50 caracteres"),
  nombre: Yup.string()
    .max(150, "Máximo 150 caracteres")
    .required("El nombre es obligatorio"),
  descripcion: Yup.string().nullable(),
  categoria_id: Yup.number().nullable(),
  marca_id: Yup.number().nullable(),
  estado_id: Yup.number().nullable(),
  tipo_id: Yup.number().nullable(),
  precio_compra: Yup.number()
    .typeError("Debe ser un número")
    .positive("Debe ser mayor que 0")
    .required("Precio de compra obligatorio"),
  precio_venta: Yup.number()
    .typeError("Debe ser un número")
    .positive("Debe ser mayor que 0")
    .required("Precio de venta obligatorio"),
  stock_actual: Yup.number()
    .integer("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .required("Stock actual obligatorio"),
  stock_minimo: Yup.number()
    .integer("Debe ser un número entero")
    .min(0, "No puede ser negativo"),
  unidad_medida: Yup.string(),
  ubicacion: Yup.string().nullable(),
  codigo_barras: Yup.string().nullable(),
  impuesto: Yup.number().typeError("Debe ser un número").min(0).max(100),
});

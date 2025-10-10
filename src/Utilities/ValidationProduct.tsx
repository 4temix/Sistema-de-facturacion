import * as Yup from "yup";

export const ValidationProduct = Yup.object({
  codigo: Yup.string().max(50, "Máximo 50 caracteres"),
  nombre: Yup.string()
    .max(150, "Máximo 150 caracteres")
    .required("El nombre es obligatorio"),
  descripcion: Yup.string().nullable(),
  categoriaId: Yup.number().nullable(),
  marcaId: Yup.number().nullable(),
  estadoId: Yup.number().nullable().required(),
  tipoId: Yup.number().nullable(),
  precioCompra: Yup.number()
    .typeError("Debe ser un número")
    .positive("Debe ser mayor que 0")
    .required("Precio de compra obligatorio"),
  precioVenta: Yup.number()
    .typeError("Debe ser un número")
    .positive("Debe ser mayor que 0")
    .required("Precio de venta obligatorio"),
  stockActual: Yup.number()
    .integer("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .required("Stock actual obligatorio"),
  stockMinimo: Yup.number()
    .integer("Debe ser un número entero")
    .min(0, "No puede ser negativo"),
  unidadMedida: Yup.string(),
  ubicacion: Yup.string().nullable(),
  codigoBarras: Yup.string().nullable(),
  impuesto: Yup.number().typeError("Debe ser un número").min(0).max(100),
});

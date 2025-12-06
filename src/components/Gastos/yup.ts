import * as Yup from "yup";

// Esquema de validación con Yup
export const ValidationGasto = Yup.object().shape({
  tipoGasto: Yup.number().required("El tipo de gasto es requerido").nullable(),
  estado: Yup.number().required("El estado es requerido").nullable(),
  montoTotal: Yup.number()
    .required("El monto total es requerido")
    .min(0, "El monto debe ser mayor o igual a 0")
    .nullable(),
  montoPagado: Yup.number()
    .required("El monto pagado es requerido")
    .min(0, "El monto debe ser mayor o igual a 0")
    .nullable(),
  proveedor: Yup.string().optional(),
  comprobante: Yup.string().optional(),
  fecha: Yup.string().optional(),
  fechaPago: Yup.string().optional(),
  metodoPago: Yup.string().optional(),
  origenFondo: Yup.string().optional(),
  referencia: Yup.string().optional(),
  nota: Yup.string().optional(),
});

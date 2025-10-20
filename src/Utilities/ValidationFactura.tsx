import * as Yup from "yup";

export const ValidationFactura = Yup.object({
  nombreCliente: Yup.string()
    .max(150, "Máximo 150 caracteres")
    .nullable()
    .required("La factura debe estar a nombre de alguien"),

  DocumentoCliente: Yup.string().max(20, "Máximo 20 caracteres").nullable(),

  TelefonoCliente: Yup.string()
    .matches(/^[0-9+() -]*$/, "Formato de teléfono inválido")
    .max(20, "Máximo 20 caracteres")
    .nullable(),

  MetodoPagoId: Yup.number()
    .required()
    .integer("Debe ser un número entero")
    .required("El método de pago es obligatorio"),

  MontoPagado: Yup.number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("El monto pagado es obligatorio"),
});

import { BaseSelecst } from "./ProductTypes";

//tipo para las cards de metricas en la pagina de facturas
export type MetricasFacturas = {
  ventasMes: number;
  fPendientes: number;
  montoTransito: number;
  totalVentasMesEspc: number;
  totalVentasMesReal: number;
};

//tipos para los elementos de la tabla de facturas
export type Factura = {
  id: number;
  monto: number;
  estado: string;
  cliente: string;
  fechaPago: string | null;
  metodoPago: string;
  fechaEmision: string;
  numeroFactura: string;
};

//tipos para los parametros
export type ParamsFacturasRequest = {
  estado?: number | null;
  search?: string | null;
  fechaPago?: Date | string | null;
  page?: number;
  pageSize?: number;
  fechaInit?: string;
  FechaFin?: string;
};

//data response
export type DataRequest = {
  data: Factura[];
  total_pages: number;
};

export type SaveFactura = {
  clienteId: number | null;
  nombreCliente: string;
  documentoCliente: string | null;
  telefonoCLiente: string | null;

  subtotal: number;
  impuestoTotal: number;
  descuentoTotal: number;
  total: number;
  ganancia: number;

  detalleManoDeObra: string;
  manoDeObra: number;

  metodoPagoId: number;
  montoPagado: number;

  vendedor: number;
  sucursal: string;
  moneda: string;

  productos: ProduscFactruraSend[] | null;
};

//sendFactura
export type ProduscFactruraSend = {
  productoId: number;
  precioVentaActual: number;
  precioBase: number;
  cantidad: number;
  desuento: number;
  impuesto: number;
  precioCompra: number;
};

export type SelectsFacturacion = {
  metodoPago: BaseSelecst[];
  estados: BaseSelecst[];
};

export interface ProductoVenta {
  nombre: string;
  productoId: number;
  precioVentaActual: number;
  cantidad: number;
  descuento: number;
  impuestos: number;
  montoDevuelto: number;
  cantidadDevuelta: number;
  devoluciones: DevolucionDetalle[];
}

//deralles de facturacion
export interface FacturaDetalle {
  id: number;
  numeroFactura: string;

  // Fechas
  fechaEmision: string; // Se recibe como ISO string desde C#
  fechaPago: string | null;

  // Cliente
  clienteId: number | null;
  nombreCliente: string;
  documentoCliente: string | null;
  telefonoCliente: string | null;

  gananciaActual: number;

  // Totales
  subtotal: number;
  impuestoTotal: number;
  descuentoTotal: number;
  total: number;
  ganancia: number;
  margen: number;

  // Estado y pago
  montoPagado: number;
  estado: string | null;
  metodoPago: string | null;

  // Relaciones y metadatos
  vendedor: number;
  sucursal: string | null;
  moneda: string;
  tipoCambio: number;

  // Actualización
  actualizadoEn: string | null;
  actualizacionPago: string | null;

  // Productos
  productos: ProductoVenta[] | null;

  //totales
  totales: Totales;

  detalleManoDeObra: string;
  manoDeObra: number;

  //devoluciones
  devoluciones: DevolucionDetalle[];
}

//productos devueltos
export type DevolucionDetallesSave = {
  facturaId: number;
  productoId: number;
  cantidad: number;
  precioVenta: number;
  tipo: string | "Reintegrable" | "Defectuoso"; // restringido a los valores válidos
  observaciones?: string;
  fecha?: string; // ISO string (ej: "2025-10-25T14:30:00Z")
};

//totales para los detalles de factura
export type Totales = {
  totalActual: number;
  totalDevuelto: number;
  totalOriginal: number;
  impuestoActual: number;
  subtotalActual: number;
  impuestoDevuelto: number;
  impuestoOriginal: number;
  subtotalDevuelto: number;
  subtotalOriginal: number;
};

//para los detalles de productos devueltos
export type DevolucionDetalle = {
  id: number;
  tipo: string;
  fecha: string; // DateTime en C# se recibe como ISO string en JSON
  cantidad: number;
  impuestos: number;
  observaciones: string;
  precioUnitario: number;
};

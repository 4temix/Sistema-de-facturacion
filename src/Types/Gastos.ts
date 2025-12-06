import { BaseSelecst } from "./ProductTypes";

// DTO para guardar gasto (coincide con SaveGastosDto del backend)
export type SaveGasto = {
  tipoGasto: number;
  proveedor?: string;
  comprobante?: string;
  usuarioRegistro?: number;
  fecha?: string; // ISO timestamp
  montoTotal: number;
  montoPagado: number;
  saldoPendiente?: number;
  estado: number; // pendiente / parcial / pagado
  metodoPago?: string;
  fechaPago?: string;
  origenFondo?: string;
  referencia?: string;
  nota?: string;
};

// Tipos para los valores iniciales del formulario
export type GastoFormValues = {
  tipoGasto: number | null;
  proveedor: string;
  comprobante: string;
  fecha: string;
  montoTotal: number | null;
  montoPagado: number | null;
  saldoPendiente: number | null;
  estado: number | null;
  metodoPago: string;
  fechaPago: string;
  origenFondo: string;
  referencia: string;
  nota: string;
  cantidad: number | null;
};

// Selects para el formulario de gastos
export type SelectsGastos = {
  tiposGasto: BaseSelecst[];
  estados: BaseSelecst[];
};

// Parámetros de filtrado de gastos
export type GetGastosParams = {
  pTipoGasto?: number;
  pEstado?: number;
  pMetodoPago?: string;
  pOrigenFondo?: string;
  pSearch?: string;
  pFechaInit?: string; // ISO date string
  pFechaEnd?: string; // ISO date string
  pPage?: number;
  pPageSize?: number;
};

// Elemento de la lista de gastos
export type GastoList = {
  id: number;
  fecha: string; // ISO date string
  estado: string;
  proveedor: string;
  tipoGasto: string;
  comprobante: string;
  metodoPago: string;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
};

// Métricas de gastos
export type GastoMetrics = {
  totalGastosMes: number;
  gastosPendientes: number;
  gastosPagados: number;
  cantidadGastosMes: number;
  gastosInventarioMes: number;
};

// Respuesta de lista paginada
export type DataGastoResponse = {
  data: GastoList[];
  totalPages: number;
};

// selects de la pagina
export type SelectsGastosTable = {
  tiposGastos: BaseSelecst[];
  estadosGastos: BaseSelecst[];
};

export type GastoUpdate = {
  id: number;
  tipoGasto: number;
  proveedor: string | null;
  comprobante: string | null;
  montoTotal: number;
  montoPagado: number;
  estado: number;
  metodoPago: string | null;
  fechaPago: string | null; // ISO string
  origenFondo: string | null;
  generaInventario: boolean;
  productoId: number | null;
  cantidad: number | null;
  referencia: string | null;
  nota: string | null;
};

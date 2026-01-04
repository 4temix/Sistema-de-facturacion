import { DataRequest } from "./FacturacionTypes";
import { GastoList } from "./Gastos";

export type VentasAnuales = {
  anio: number;
  totalVentas: number;
  ventasMensuales: number[];
};

export type DetailsYearType = {
  anio: number;
  totalAnual: number;
  ventasMensuales: VentaMensual[];
  crecimientoPromedio: number | null;
  comparacionAnioAnterior: number | null;
};

export type VentaMensual = {
  totalMes: number;
  mesNombre: string;
  mesNumero: number;
  cantidadFacturas: number;
  crecimientoMensual: number | null;
};

export type ReporteMensual = {
  mes: string;
  anio: number;
  semanas: Semana[];
  totales: Totales;
  gastos: GastosReportDto;
  mesNumber: number;
  devoluciones: Devoluciones;
  facturasMes: DataRequest; // <-- LO RELLENAS TÚ
  topProductos: TopProducto[];
  totalNomina: number;
};

export type Semana = {
  totalSemana: number;
  numeroSemana: number;
  cantidadFacturas: number;
};

export type Totales = {
  mesNombre: string;
  totalVentas: number;
  totalFacturas: number;
  totalGanancia: number;
};

export type Devoluciones = {
  cantidad: number;
  valorTotal: number;
  productoMasDevuelto: string;
  cantidadPerdida: number;
  valorTotalPerdido: number;
  cantidadReintegrable: number;
  valorTotalReintegrable: number;
};

export type TopProducto = {
  producto: string;
  totalVendido: number;
  cantidadVendida: number;
};

//gastos
export interface GastosReportDto {
  metrics: Metrics;
  detalles: GastoList[];
}

export interface Metrics {
  totalGastado: number;
  cantidadGastos: number;
  totalPendiente: number;
}

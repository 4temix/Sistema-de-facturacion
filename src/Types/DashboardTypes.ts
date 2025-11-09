import { DataRequest } from "./FacturacionTypes";

export type DashboardData = {
  ventasYear: number[]; // Array con las ventas por mes o año
  ventasSemana: number; // Total de ventas de la semana
  gananciasSemana: number; // Ganancias netas de la semana
  ventasRecientes: DataRequest; // Últimas facturas o ventas recientes
  variacionSemanal: number; // Porcentaje de variación semanal
};

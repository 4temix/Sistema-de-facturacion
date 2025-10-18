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
};

//data response
export type DataRequest = {
  data: Factura[];
  total_pages: number;
};

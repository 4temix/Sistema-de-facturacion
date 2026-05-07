import type {
  FacturaDetalle,
  FacturaPagosDto,
  ProductoVenta,
} from "../Types/FacturacionTypes";

/** Cantidad devuelta por línea: prioriza suma de movimientos, si no el campo agregado del API. */
export function cantidadDevueltaProducto(p: ProductoVenta): number {
  const fromList = (p.devoluciones ?? []).reduce(
    (acc, d) => acc + (d.cantidad ?? 0),
    0,
  );
  if (fromList > 0) return fromList;
  return p.cantidadDevuelta ?? 0;
}

/**
 * Cantidad que sigue en la venta (no devuelta). Alineado con `actualizarProductos` en reembolsos:
 * `cantidad` en detalle de factura es la facturada original; las devoluciones van aparte.
 */
export function cantidadVentaActualProducto(p: ProductoVenta): number {
  return Math.max(0, p.cantidad - cantidadDevueltaProducto(p));
}

export function subtotalLineaVentaActual(p: ProductoVenta): number {
  return p.precioVentaActual * cantidadVentaActualProducto(p);
}

export function facturaPagosOrdenados(
  pagos: FacturaDetalle["pagos"],
): FacturaPagosDto[] {
  return [...(pagos ?? [])].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );
}

export type TotalesFacturaResumen = {
  totalActual: number;
  totalDevuelto: number;
  totalOriginal: number;
  subtotalActual: number;
  subtotalDevuelto: number;
  subtotalOriginal: number;
  hayDevoluciones: boolean;
};

export function getTotalesFacturaResumen(f: FacturaDetalle): TotalesFacturaResumen {
  const t = f.totales;
  const totalActual = t?.totalActual ?? f.total;
  const totalDevuelto = t?.totalDevuelto ?? 0;
  const totalOriginal = t?.totalOriginal ?? f.total;
  const subtotalActual = t?.subtotalActual ?? f.subtotal;
  const subtotalDevuelto = t?.subtotalDevuelto ?? 0;
  const subtotalOriginal = t?.subtotalOriginal ?? f.subtotal;
  const hayPorTotales = totalDevuelto > 0 || subtotalDevuelto > 0;
  const hayPorLineas = (f.productos ?? []).some(
    (p) => cantidadDevueltaProducto(p) > 0,
  );
  return {
    totalActual,
    totalDevuelto,
    totalOriginal,
    subtotalActual,
    subtotalDevuelto,
    subtotalOriginal,
    hayDevoluciones: hayPorTotales || hayPorLineas,
  };
}

/** Saldo pendiente: respeta historial de abonos si existe; si no, total efectivo menos lo pagado. */
export function saldoPendienteFactura(f: FacturaDetalle): number {
  const orden = facturaPagosOrdenados(f.pagos);
  if (orden.length) return orden[orden.length - 1]!.montoPendiente;
  const { totalActual } = getTotalesFacturaResumen(f);
  return totalActual - f.montoPagado;
}

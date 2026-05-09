/**
 * Si la API envía ventas de la semana actual y la variación % respecto a la semana
 * anterior (WoW), reconstruye el total de la semana pasada.
 * Fórmula: variación = (actual − anterior) / anterior × 100 → anterior = actual / (1 + variación/100).
 */
export function ventasSemanaAnteriorDesdeVariacion(
  ventasSemanaActual: number,
  variacionPorciento: number
): number | null {
  if (!Number.isFinite(ventasSemanaActual) || !Number.isFinite(variacionPorciento)) {
    return null;
  }
  const denominador = 1 + variacionPorciento / 100;
  if (Math.abs(denominador) < 1e-9) {
    return null;
  }
  const anterior = ventasSemanaActual / denominador;
  return anterior >= 0 && Number.isFinite(anterior) ? anterior : null;
}

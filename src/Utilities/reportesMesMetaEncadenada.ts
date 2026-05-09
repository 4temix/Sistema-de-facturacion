/**
 * Barra de meta encadenada: el primer mes del array es la referencia inicial;
 * cada mes siguiente compara sus ventas con el total del mes anterior (100% = igualó esa meta).
 */
export type MesMetaEncadenada = {
  anchoBarra: number;
  superoMeta: boolean;
  esMesReferencia: boolean;
  etiquetaProgreso: string;
};

export function mesMetaEncadenada(
  totalActual: number,
  totalMesAnterior: number | null
): MesMetaEncadenada {
  if (totalMesAnterior === null) {
    if (totalActual > 0) {
      return {
        anchoBarra: 100,
        superoMeta: false,
        esMesReferencia: true,
        etiquetaProgreso: "Base",
      };
    }
    return {
      anchoBarra: 0,
      superoMeta: false,
      esMesReferencia: true,
      etiquetaProgreso: "—",
    };
  }

  if (totalMesAnterior <= 0) {
    if (totalActual <= 0) {
      return {
        anchoBarra: 0,
        superoMeta: false,
        esMesReferencia: false,
        etiquetaProgreso: "0%",
      };
    }
    return {
      anchoBarra: 100,
      superoMeta: true,
      esMesReferencia: false,
      etiquetaProgreso: "100%",
    };
  }

  const ratio = (totalActual / totalMesAnterior) * 100;
  return {
    anchoBarra: Math.min(ratio, 100),
    superoMeta: ratio > 100,
    esMesReferencia: false,
    etiquetaProgreso: `${Math.round(ratio)}%`,
  };
}

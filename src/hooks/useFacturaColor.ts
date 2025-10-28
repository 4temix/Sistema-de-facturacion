import { useCallback } from "react";

type EstadoFactura =
  | "Emitida"
  | "Pagada"
  | "Parcialmente pagada"
  | "Anulada"
  | "Reembolsada"
  | "Reembolso parcial"
  | "Aperturada"
  | string;

export function useFacturaColor() {
  const getFacturaColor = useCallback((estado: EstadoFactura): string => {
    if (!estado) return "bg-slate-100 text-slate-800";

    switch (estado.toLowerCase()) {
      case "emitida":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pagada":
        return "bg-green-100 text-green-800 border-green-300";
      case "parcialmente pagada":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "anulada":
        return "bg-gray-200 text-gray-800 border-gray-300";
      case "reembolsada":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "reembolso parcial":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "aperturada":
        return "bg-sky-100 text-sky-800 border-sky-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  }, []);

  return getFacturaColor;
}

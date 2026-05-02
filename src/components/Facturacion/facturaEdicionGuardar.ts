import Swal from "sweetalert2";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import type {
  DevolucionDetallesSave,
  FacturaDetalle,
} from "../../Types/FacturacionTypes";

export type PayloadEdicionFactura = {
  id: number;
  estado: number;
  pagado: number;
  detalles: DevolucionDetallesSave[];
};

export function guardarEdicionFactura(
  facturaDetails: FacturaDetalle,
  saveElement: PayloadEdicionFactura,
  onSuccess: () => void,
) {
  const devolucion = {
    id: saveElement.id,
    estado: saveElement.estado === 0 ? 0 : saveElement.estado,
    pagado:
      facturaDetails.montoPagado >= facturaDetails.total
        ? 0
        : saveElement.pagado,
    detalles: saveElement.detalles,
  };

  apiRequestThen<boolean>({
    url: "api/facturas/ediccion",
    configuration: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(devolucion),
    },
  }).then((response) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    if (!response.success) {
      Toast.fire({
        icon: "error",
        title: response.errorMessage,
      });
      return;
    }
    Toast.fire({
      icon: "success",
      title: "Factura guardada correctamente",
    });
    onSuccess();
  });
}

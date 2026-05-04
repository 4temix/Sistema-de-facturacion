import Label from "../form/Label";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { useModalEdit } from "../../context/ModalEditContext";
import { useEffect, useState } from "react";
import LoaderFun from "../loader/LoaderFunc";
import Checkbox from "../form/input/Checkbox";
import { guardarEdicionFactura } from "./facturaEdicionGuardar";

type EdicionParameters = {
  closeModal: () => void;
};

const regexNum = /^-?\d+(\.\d+)?$/;

export function EdicionFacturaPago({ closeModal }: EdicionParameters) {
  const { facturaDetails } = useModalEdit();
  const [pagado, setPagado] = useState(0);
  const [isCheckedTwo, setIsCheckedTwo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!facturaDetails) return;
    setPagado(0);
    setIsCheckedTwo(false);
  }, [facturaDetails?.id]);

  useEffect(() => {
    if (!facturaDetails) return;
    setPagado(
      isCheckedTwo ? facturaDetails.total - facturaDetails.montoPagado : 0,
    );
  }, [isCheckedTwo, facturaDetails?.id, facturaDetails?.total, facturaDetails?.montoPagado]);

  const saldoPendiente = facturaDetails
    ? Math.max(0, facturaDetails.total - facturaDetails.montoPagado)
    : 0;
  const yaPagadaTotal =
    facturaDetails != null && facturaDetails.montoPagado >= facturaDetails.total;

  async function guardar() {
    if (!facturaDetails) return;
    setIsSaving(true);
    try {
      await guardarEdicionFactura(
        facturaDetails,
        {
          id: facturaDetails.id,
          estado: 0,
          pagado,
          detalles: [],
        },
        closeModal,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative w-full min-h-[120px]">
      <div className="relative w-full shrink-0 border-b border-gray-100 bg-white px-2 pb-3 pr-14 pt-1 dark:border-gray-800 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Abonar saldo — pago pendiente
        </h4>
        <p className="mb-0 text-sm text-gray-500 dark:text-gray-400 lg:mb-1">
          Registra un abono al saldo pendiente. No modifica el estado de la
          factura ni productos ni devoluciones.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-3">
        <div className="bg-white border p-3 rounded-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Monto ya pagado</p>
          <p className="font-medium">
            {(facturaDetails?.montoPagado ?? 0).toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-white border p-3 rounded-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Total de la factura</p>
          <p className="font-medium">
            {(facturaDetails?.total ?? 0).toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg dark:bg-amber-950/30 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200/90">
            Saldo pendiente
          </p>
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            {saldoPendiente.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
      </div>

      <form
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          void guardar();
        }}
      >
        <div className="px-2 pb-4 space-y-4">
          <div>
            <Label htmlFor="monto_abono">Monto a abonar ahora</Label>
            {yaPagadaTotal ? (
              <Input
                type="text"
                id="monto_abono"
                disabled
                value={facturaDetails?.montoPagado ?? ""}
                placeholder="Sin saldo pendiente"
              />
            ) : (
              <Input
                type="text"
                id="monto_abono"
                value={pagado === 0 ? "" : String(pagado)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setPagado(0);
                    return;
                  }
                  if (regexNum.test(value)) {
                    setPagado(parseFloat(value));
                  }
                }}
                hint={
                  facturaDetails &&
                  facturaDetails.total < pagado + facturaDetails.montoPagado
                    ? "El abono supera el total de la factura"
                    : ""
                }
                error={
                  !!(
                    facturaDetails &&
                    facturaDetails.total < pagado + facturaDetails.montoPagado
                  )
                }
                placeholder={`Máx. pendiente: ${saldoPendiente.toFixed(2)}`}
              />
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Suma al monto ya registrado; no reemplaza el total pagado
              anterior.
            </p>
          </div>

          {!yaPagadaTotal && (
            <Checkbox
              checked={isCheckedTwo}
              onChange={setIsCheckedTwo}
              label="Abonar todo el saldo pendiente de una vez"
            />
          )}
        </div>

        <div className="flex items-center gap-3 px-2 mt-2 lg:justify-end">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={closeModal}
            disabled={isSaving}
          >
            Cerrar
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={() => {
              void guardar();
            }}
            disabled={isSaving}
          >
            {isSaving ? "Enviando…" : "Guardar pago"}
          </Button>
        </div>
      </form>
      {isSaving && <LoaderFun />}
    </div>
  );
}

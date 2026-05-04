import { customStyles } from "../../Utilities/StyleForReactSelect";
import Label from "../form/Label";
import Select from "react-select";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { BaseSelecst } from "../../Types/ProductTypes";
import { Option } from "../../Types/ProductTypes";
import { useModalEdit } from "../../context/ModalEditContext";
import {
  DevolucionDetallesSave,
  ProductoVenta,
} from "../../Types/FacturacionTypes";
import { useEffect, useState } from "react";
import { BoxCubeIcon } from "../../icons";
import Swal from "sweetalert2";
import { guardarEdicionFactura } from "./facturaEdicionGuardar";
import { TbTrash, TbInfoCircle, TbPackage } from "react-icons/tb";
import LoaderFun from "../loader/LoaderFunc";

type EdicionParameters = {
  closeModal: () => void;
  selectsData?: BaseSelecst[];
};

type Devolucion = {
  id: number;
  estado: Option;
  detalles: DevolucionDetallesSave[];
};

const regexNum = /^-?\d+(\.\d+)?$/;

/**
 * Estados (id como string) que rellenan todas las líneas devueltas de una vez
 * (p. ej. anulación / reembolso total). Deben alinearse con el backend.
 */
const ESTADOS_AUTO_DEVOLUCION_TOTAL = new Set(["4", "5"]);

function actualizarProductos(productos: ProductoVenta[] | null | undefined) {
  if (!productos) return;

  return productos
    .map((p) => {
      const cantidadDevuelta = p.devoluciones.reduce(
        (acc, d) => acc + (d.cantidad ?? 0),
        0,
      );

      const nuevaCantidad = p.cantidad - cantidadDevuelta;

      return {
        ...p,
        cantidad: nuevaCantidad < 0 ? 0 : nuevaCantidad,
      };
    })
    .filter((p) => p.cantidad > 0);
}

/** Cantidad aún disponible para agregar al borrador, dado lo ya en `detalles`. */
function recomputarDisponible(
  productos: ProductoVenta[] | null | undefined,
  detalles: DevolucionDetallesSave[],
): ProductoVenta[] {
  const base = actualizarProductos(productos);
  if (!base) return [];
  const quitados = new Map<number, number>();
  for (const d of detalles) {
    quitados.set(
      d.productoId,
      (quitados.get(d.productoId) ?? 0) + d.cantidad,
    );
  }
  return base
    .map((p) => ({
      ...p,
      cantidad: Math.max(0, p.cantidad - (quitados.get(p.productoId) ?? 0)),
    }))
    .filter((p) => p.cantidad > 0);
}

function buildDetallesAutoTotal(
  disponibles: ProductoVenta[],
  facturaId: number,
): DevolucionDetallesSave[] {
  return disponibles
    .filter((p) => p.cantidad > 0)
    .map((p) => ({
      facturaId,
      productoId: p.productoId,
      cantidad: p.cantidad,
      precioVenta: p.precioVentaActual,
      tipo: "Reintegrable",
      observaciones: "",
    }));
}

export function EdicionFacturaReembolsos({
  selectsData,
  closeModal,
}: EdicionParameters) {
  const [sendData, setSendData] = useState<Devolucion>({
    id: 0,
    estado: { value: "", label: "" },
    detalles: [],
  });

  const [isSaving, setIsSaving] = useState(false);

  const [elementSelect, setElementSelect] = useState<DevolucionDetallesSave>();

  const [editData, setEditData] = useState<ProductoVenta[]>();

  const { facturaDetails } = useModalEdit();

  function nombreProducto(productoId: number): string {
    const p = facturaDetails?.productos?.find((x) => x.productoId === productoId);
    return p?.nombre ?? `Producto #${productoId}`;
  }

  function handleEstadoChange(e: Option | null) {
    if (!e || !facturaDetails) return;
    setElementSelect(undefined);

    const v = e.value;
    const baseDisponible =
      actualizarProductos(facturaDetails.productos) ?? [];

    let nuevosDetalles: DevolucionDetallesSave[] = [];
    if (ESTADOS_AUTO_DEVOLUCION_TOTAL.has(v)) {
      nuevosDetalles = buildDetallesAutoTotal(baseDisponible, facturaDetails.id);
    }

    setSendData((prev) => ({
      ...prev,
      estado: { value: e.value, label: e.label },
      detalles: nuevosDetalles,
    }));
    setEditData(recomputarDisponible(facturaDetails.productos, nuevosDetalles));
  }

  function aggDetallesDevolucion(
    element: ProductoVenta,
    cantidad: number,
    estado: string,
    observaciones: string = "",
  ) {
    if (estado == "") {
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
      Toast.fire({
        icon: "warning",
        title: "Seleccione el estado en el que se devolvió el producto",
      });
      return;
    }
    if (!facturaDetails) return;

    const prev = sendData.detalles;
    const disponible = recomputarDisponible(facturaDetails.productos, prev);
    const fila = disponible.find((p) => p.productoId === element.productoId);
    if (!fila || fila.cantidad < cantidad) {
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "info",
        title: "No hay cantidad suficiente disponible para esta devolución",
      });
      return;
    }

    const existente = prev.findIndex(
      (el) => el.productoId === element.productoId,
    );

    let newDetalles: DevolucionDetallesSave[];
    if (existente !== -1 && prev[existente].tipo === estado) {
      newDetalles = [...prev];
      newDetalles[existente] = {
        ...newDetalles[existente],
        cantidad: newDetalles[existente].cantidad + cantidad,
      };
    } else {
      newDetalles = [
        ...prev,
        {
          facturaId: facturaDetails.id,
          productoId: element.productoId,
          cantidad,
          precioVenta: element.precioVentaActual,
          tipo: estado,
          observaciones: observaciones ?? "",
        },
      ];
    }

    setSendData((s) => ({ ...s, detalles: newDetalles }));
    setEditData(recomputarDisponible(facturaDetails.productos, newDetalles));
    setElementSelect(undefined);
  }

  function removeDetalle(index: number) {
    if (!facturaDetails) return;
    const nuevos = sendData.detalles.filter((_, i) => i !== index);
    setSendData((prev) => ({ ...prev, detalles: nuevos }));
    setEditData(recomputarDisponible(facturaDetails.productos, nuevos));
  }

  function updateDevolution(value: number | string, key: string) {
    if (key == "cantidad" && editData) {
      const producto = editData.find(
        (el) => el.productoId == elementSelect?.productoId,
      );

      if (!producto) return;

      if (Number(value) > producto.cantidad) {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "info",
          title: "Esta cantidad no está disponible para reembolsar",
        });
        return;
      }
    }

    setElementSelect((prev) => {
      if (!prev) return undefined;
      return { ...prev, [key]: value };
    });
  }

  async function saveDevolution(saveElement: Devolucion) {
    if (!facturaDetails) return;
    setIsSaving(true);
    try {
      await guardarEdicionFactura(
        facturaDetails,
        {
          id: saveElement.id,
          estado:
            saveElement.estado.value === ""
              ? 0
              : parseInt(saveElement.estado.value, 10),
          pagado: 0,
          detalles: saveElement.detalles,
        },
        closeModal,
      );
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    const vacio: DevolucionDetallesSave[] = [];
    setEditData(actualizarProductos(facturaDetails?.productos));
    setSendData({
      id: facturaDetails?.id ?? 0,
      estado: { value: "", label: "" },
      detalles: vacio,
    });
    setElementSelect(undefined);
  }, [facturaDetails]);

  const estadoValor = sendData.estado.value;
  const esAutoTotal = ESTADOS_AUTO_DEVOLUCION_TOTAL.has(estadoValor);
  const muestraLineasProducto =
    estadoValor !== "2" && estadoValor !== "0" && estadoValor !== "";

  return (
    <div className="relative w-full min-h-[160px]">
      <div className="relative w-full shrink-0 border-b border-gray-100 bg-white px-2 pb-3 pr-14 pt-1 dark:border-gray-800 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Reembolsos y devoluciones
        </h4>
        <p className="mb-0 text-sm text-gray-500 dark:text-gray-400 lg:mb-1">
          Elige el estado de la factura. Si el estado implica devolución total,
          las líneas se generan solas; si no, arma la devolución producto a
          producto. Al cambiar de estado se limpia el borrador anterior para
          evitar líneas duplicadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
        <div className="bg-white border p-4 rounded-xl dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Factura
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            #{facturaDetails?.numeroFactura}
          </p>
        </div>
        <div className="bg-white border p-4 rounded-xl dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {(facturaDetails?.total ?? 0).toLocaleString("es-DO", {
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
          void saveDevolution(sendData);
        }}
      >
        <div className="px-2 pb-4 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <Label
              htmlFor="status-reembolso"
              className="text-sm font-semibold text-gray-800 dark:text-white/90"
            >
              Estado de la factura (reembolso / devolución)
            </Label>
            <Select<Option, false>
              name="status-reembolso"
              inputId="status-reembolso"
              styles={customStyles()}
              placeholder="Seleccione un estado…"
              menuPortalTarget={document.body}
              value={
                sendData.estado.label !== ""
                  ? {
                      label: sendData.estado.label,
                      value: sendData.estado.value.toString(),
                    }
                  : null
              }
              options={selectsData?.map((producto: BaseSelecst) => ({
                label: producto.name,
                value: producto.id.toString(),
              }))}
              onChange={handleEstadoChange}
              className="select-custom mt-2 pl-0"
              classNamePrefix="select"
            />
            {esAutoTotal && (
              <div className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                <TbInfoCircle className="mt-0.5 shrink-0 text-lg" />
                <span>
                  Este estado incluye{" "}
                  <strong>todas las unidades disponibles</strong> como
                  devolución reintegrable. Si cambias a otro estado, la lista de
                  líneas se vacía y puedes definir devoluciones manuales.
                </span>
              </div>
            )}
          </div>

          {muestraLineasProducto && (
            <>
              <section>
                <div className="mb-2 flex items-center gap-2">
                  <TbPackage className="text-lg text-gray-600 dark:text-gray-400" />
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Productos disponibles para devolver
                  </h5>
                </div>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  {esAutoTotal
                    ? "Las líneas ya están en “Líneas a enviar”. Puedes revisarlas abajo o cambiar de estado para editar manualmente."
                    : "Pulsa “Añadir línea”, indica cantidad y si el artículo es reintegrable o defectuoso, y guarda."}
                </p>

                <div className="max-h-[min(360px,50vh)] space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/40">
                  {!editData?.length && (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No quedan unidades pendientes de devolver con el borrador
                      actual.
                    </p>
                  )}
                  {editData?.map((producto: ProductoVenta) => {
                    const abierto =
                      elementSelect?.productoId === producto.productoId;
                    return (
                      <div
                        key={producto.productoId}
                        className={`rounded-xl border bg-white p-4 shadow-sm transition-shadow dark:bg-gray-900 ${
                          abierto
                            ? "border-brand-500 ring-2 ring-brand-500/20 dark:border-brand-500"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {producto.nombre}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              #{producto.productoId} ·{" "}
                              {producto.precioVentaActual.toLocaleString("es-DO", {
                                style: "currency",
                                currency: "DOP",
                              })}{" "}
                              · Disponible:{" "}
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {producto.cantidad}
                              </span>
                            </p>
                          </div>
                          {!esAutoTotal && (
                            <div className="flex shrink-0 gap-2">
                              {!abierto ? (
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    if (!facturaDetails) return;
                                    setElementSelect({
                                      facturaId: facturaDetails.id,
                                      productoId: producto.productoId,
                                      cantidad: 1,
                                      precioVenta: producto.precioVentaActual,
                                      tipo: "",
                                      observaciones: "",
                                    });
                                  }}
                                >
                                  Añadir línea
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                  onClick={() => setElementSelect(undefined)}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {abierto && !esAutoTotal && (
                          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <Label htmlFor={`cantidad-dev-${producto.productoId}`}>
                                  Cantidad a devolver
                                </Label>
                                <Input
                                  type="text"
                                  id={`cantidad-dev-${producto.productoId}`}
                                  value={elementSelect?.cantidad ?? ""}
                                  placeholder="Ej. 1"
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                      updateDevolution(0, "cantidad");
                                      return;
                                    }
                                    if (regexNum.test(value)) {
                                      updateDevolution(
                                        parseInt(e.target.value, 10),
                                        "cantidad",
                                      );
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`tipo-dev-${producto.productoId}`}>
                                  Condición del producto
                                </Label>
                                <Select<Option, false>
                                  name="estado_producto"
                                  inputId={`tipo-dev-${producto.productoId}`}
                                  styles={customStyles()}
                                  placeholder="Elegir…"
                                  menuPortalTarget={document.body}
                                  value={
                                    elementSelect?.tipo
                                      ? {
                                          label: elementSelect.tipo,
                                          value: elementSelect.tipo,
                                        }
                                      : null
                                  }
                                  options={[
                                    {
                                      label: "Reintegrable",
                                      value: "Reintegrable",
                                    },
                                    {
                                      label: "Defectuoso",
                                      value: "Defectuoso",
                                    },
                                  ]}
                                  onChange={(ev) => {
                                    if (!ev) return;
                                    updateDevolution(ev.value, "tipo");
                                  }}
                                  className="select-custom pl-0"
                                  classNamePrefix="select"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`obs-dev-${producto.productoId}`}>
                                Observaciones
                              </Label>
                              <textarea
                                id={`obs-dev-${producto.productoId}`}
                                rows={2}
                                placeholder="Opcional: motivo, estado físico, etc."
                                value={elementSelect?.observaciones ?? ""}
                                className="w-full rounded-xl border border-gray-200 p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                                onChange={(e) => {
                                  updateDevolution(e.target.value, "observaciones");
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => setElementSelect(undefined)}
                              >
                                Cerrar
                              </Button>
                              <Button
                                size="sm"
                                type="button"
                                onClick={() => {
                                  if (!elementSelect) return;
                                  aggDetallesDevolucion(
                                    producto,
                                    elementSelect.cantidad,
                                    elementSelect.tipo,
                                    elementSelect.observaciones,
                                  );
                                }}
                              >
                                Agregar a la lista
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h5 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Líneas a enviar ({sendData.detalles.length})
                </h5>
                <div className="max-h-[min(280px,40vh)] space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/40">
                  {sendData.detalles.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Aún no hay líneas. Elige un estado con devolución total o
                      añade productos arriba.
                    </p>
                  ) : (
                    sendData.detalles.map(
                      (linea: DevolucionDetallesSave, key: number) => (
                        <div
                          key={`${linea.productoId}-${key}-${linea.tipo}`}
                          className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        >
                          <BoxCubeIcon className="hidden h-8 w-8 shrink-0 text-gray-400 sm:block" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {nombreProducto(linea.productoId)}
                            </p>
                            <p className="text-xs text-gray-500">
                              #{linea.productoId} · Cantidad:{" "}
                              <strong>{linea.cantidad}</strong>
                              {linea.observaciones ? (
                                <span className="mt-1 block text-gray-600 dark:text-gray-300">
                                  {linea.observaciones}
                                </span>
                              ) : null}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              linea.tipo === "Defectuoso"
                                ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                            }`}
                          >
                            {linea.tipo}
                          </span>
                          <button
                            type="button"
                            title="Quitar línea"
                            className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                            onClick={() => removeDetalle(key)}
                          >
                            <TbTrash className="h-5 w-5" />
                          </button>
                        </div>
                      ),
                    )
                  )}
                </div>
              </section>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
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
            disabled={isSaving}
            onClick={() => {
              void saveDevolution(sendData);
            }}
          >
            {isSaving ? "Enviando…" : "Guardar reembolso"}
          </Button>
        </div>
      </form>
      {isSaving && <LoaderFun />}
    </div>
  );
}

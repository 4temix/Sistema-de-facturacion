import { useUserData } from "../../context/GlobalUserContext";
import {
  useModalEdit,
  type FacturaEditModalMode,
} from "../../context/ModalEditContext";
import { useFacturaColor } from "../../hooks/useFacturaColor";
import {
  handlePrintFactura,
  handlePrintFacturaFullPage,
} from "../../hooks/useImpresion";
import {
  FacturaDetalle,
  FacturaPagosDto,
  ProductoVenta,
} from "../../Types/FacturacionTypes";
import { User } from "../../Types/Usuario";
import { FacturaSkeleton } from "./FacturaSkeleton";
import { LuPrinter, LuWallet } from "react-icons/lu";
import {
  TbFileInvoice,
  TbUser,
  TbCalendar,
  TbPackage,
  TbTool,
  TbTrendingUp,
  TbPercentage,
  TbCash,
  TbCreditCard,
  TbReceiptRefund,
  TbHistory,
  TbCoin,
} from "react-icons/tb";

interface FacturaDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  factura: FacturaDetalle;
  isLoading?: boolean;
  onEliminar?: (factura: FacturaDetalle) => void;
  onEditar?: (factura: FacturaDetalle) => void;
  btnEdit?: boolean;
}

// ===============================
// 🧭 Componente principal
// ===============================
export default function FacturacionDetails({
  onClose,
  factura,
  isLoading,
  btnEdit,
}: FacturaDetailsDrawerProps) {
  const getFacturaColor = useFacturaColor();

  const { user } = useUserData();

  const { modalEditOpen, AsingFactura } = useModalEdit();

  function abrirEdicion(mode: FacturaEditModalMode) {
    AsingFactura(factura);
    modalEditOpen(mode);
  }

  if (isLoading) {
    return <FacturaSkeleton />;
  }

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMoney = (n: number) =>
    n.toLocaleString("es-DO", { style: "currency", currency: "DOP" });

  const pagosOrdenados: FacturaPagosDto[] = [...(factura.pagos ?? [])].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );

  return (
    <div className="bg-white w-full h-full overflow-y-auto p-6">
      {/* 🔹 Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TbFileInvoice className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-900">
              Factura #{factura.numeroFactura}
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            Emitida el {formatDate(factura.fechaEmision)}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full border text-sm font-medium ${getFacturaColor(
            factura.estado ?? "default",
          )}`}
        >
          {factura.estado ?? "Desconocido"}
        </div>
      </div>

      {/* 🔹 Totales generales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border text-center">
          <p className="text-xs text-gray-500">Subtotal</p>
          <p className="font-bold text-gray-900">
            {factura.subtotal.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border text-center">
          <p className="text-xs text-gray-500">Total impuestos</p>
          <p className="font-bold text-gray-900">{factura.impuestoTotal} %</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-bold text-blue-600 text-lg">
            {factura.total.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border text-center">
          <p className="text-xs text-gray-500">Total Descuento</p>
          <p className="font-bold text-green-600 text-lg">
            {factura.descuentoTotal} %
          </p>
        </div>
      </div>

      {/* 🔹 Totales detallados (actual / devuelto / original) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500">Subtotal Actual</p>
          <p className="font-medium">
            {factura.totales.subtotalActual.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-white border p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500">Subtotal Devuelto</p>
          <p className="font-medium">
            {factura.totales.subtotalDevuelto.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-white border p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500">Subtotal Original</p>
          <p className="font-medium">
            {factura.totales.subtotalOriginal.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
      </div>

      {/* 🔹 Cliente */}
      <div className="mb-6 border rounded-lg p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TbUser className="text-blue-600 text-xl" />
          <h3 className="font-semibold text-gray-900">Cliente</h3>
        </div>
        <p className="text-gray-800 font-medium">{factura.nombreCliente}</p>
        {factura.documentoCliente && (
          <p className="text-gray-600 text-sm">
            Documento: {factura.documentoCliente}
          </p>
        )}
        {factura.telefonoCliente && (
          <p className="text-gray-600 text-sm">
            Teléfono: {factura.telefonoCliente}
          </p>
        )}
      </div>

      {/* 🔹 Fechas */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TbCalendar className="text-gray-500 text-lg" />
            <p className="text-xs text-gray-500">Emisión</p>
          </div>
          <p className="font-medium">{formatDate(factura.fechaEmision)}</p>
        </div>
        <div className="bg-white border p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TbCalendar className="text-gray-500 text-lg" />
            <p className="text-xs text-gray-500">Fecha de pago</p>
          </div>
          <p className="font-medium">{formatDate(factura.fechaPago)}</p>
        </div>
        {factura.estado === "Parcialmente pagada" && (
          <div className="bg-white border p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TbCalendar className="text-gray-500 text-lg" />
              <p className="text-xs text-gray-500">Ultima fecha de pago</p>
            </div>
            <p className="font-medium">
              {formatDate(factura.actualizacionPago)}
            </p>
          </div>
        )}
      </div>

      {/* 🔹 Productos */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TbPackage className="text-gray-600 text-xl" />
          Productos
        </h3>
        {factura.productos && factura.productos.length > 0 ? (
          factura.productos.map((p: ProductoVenta) => (
            <div key={p.productoId} className="border-b py-2 text-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{p.nombre}</p>
                  <p className="text-gray-600 text-xs">
                    Cantidad: {p.cantidad} | Desc: {p.descuento}% | Imp:{" "}
                    {p.impuestos.toFixed(2)} %
                  </p>
                  {p.cantidadDevuelta > 0 && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <TbReceiptRefund className="text-sm" />
                      Devuelto: {p.cantidadDevuelta} | Monto:{" "}
                      {p.montoDevuelto.toLocaleString("es-DO", {
                        style: "currency",
                        currency: "DOP",
                      })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {p.precioVentaActual.toLocaleString("es-DO", {
                      style: "currency",
                      currency: "DOP",
                    })}
                  </p>
                  <p className="font-semibold text-gray-900">
                    St:{" "}
                    {(p.precioVentaActual * p.cantidad).toLocaleString(
                      "es-DO",
                      { style: "currency", currency: "DOP" },
                    )}
                  </p>
                </div>
              </div>

              {/* 🔹 Devoluciones por producto */}
              {p.devoluciones && p.devoluciones.length > 0 && (
                <div className="mt-2 border-l-2 border-red-300 pl-3">
                  {p.devoluciones.map((d) => (
                    <div key={d.id} className="text-xs text-gray-700 mb-1">
                      <p>
                        <span className="font-semibold">{d.tipo}</span> -{" "}
                        {formatDate(d.fecha)}
                      </p>
                      <p>
                        Cantidad: {d.cantidad} | Precio unitario:{" "}
                        {d.precioUnitario.toLocaleString("es-DO", {
                          style: "currency",
                          currency: "DOP",
                        })}
                      </p>
                      <p>Impuestos: {d.impuestos.toFixed(2)} %</p>
                      <p className="italic text-gray-500">
                        Observaciones: {d.observaciones}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-sm italic">
            No hay productos registrados.
          </p>
        )}
      </div>

      {factura.manoDeObra > 0 && (
        <div className="mb-6 border rounded-lg p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TbTool className="text-blue-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Mano de obra</h3>
          </div>
          <p className="text-gray-800 font-medium">
            {factura.manoDeObra.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
          {factura.documentoCliente && (
            <p className="text-gray-600 text-sm">
              Realizado:{factura.detalleManoDeObra}
            </p>
          )}
        </div>
      )}

      {/* 🔹 Ganancia y Margen */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TbCash className="text-gray-500 text-lg" />
            <p className="text-xs text-gray-500">Monto pagado</p>
          </div>
          <p className="font-medium">
            {factura.montoPagado.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-white border p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TbCreditCard className="text-gray-500 text-lg" />
            <p className="text-xs text-gray-500">Metodo de pago</p>
          </div>
          <p className="font-medium">{factura.metodoPago}</p>
        </div>
      </div>

      {pagosOrdenados.length > 0 && (
        <div className="mb-6 rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 p-5 shadow-sm ring-1 ring-emerald-100/60">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <TbHistory className="text-xl" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  Historial de abonos
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {pagosOrdenados.length} pago
                  {pagosOrdenados.length !== 1 ? "s" : ""} registrado
                  {pagosOrdenados.length !== 1 ? "s" : ""} sobre esta factura.
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-emerald-900/80 bg-emerald-100/80 border border-emerald-200/80 rounded-lg px-3 py-2">
              <p className="font-medium text-emerald-950">Saldo tras último abono</p>
              <p className="text-base font-bold tabular-nums">
                {formatMoney(
                  pagosOrdenados[pagosOrdenados.length - 1]!.montoPendiente,
                )}
              </p>
            </div>
          </div>

          <ol className="mt-4 space-y-0">
            {pagosOrdenados.map((pago, idx) => (
              <li key={`${pago.fecha}-${idx}`} className="relative flex gap-0">
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <span
                    className="z-[1] flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-xs font-bold text-emerald-700 shadow-sm"
                    aria-hidden
                  >
                    {idx + 1}
                  </span>
                  {idx < pagosOrdenados.length - 1 && (
                    <span
                      className="w-0.5 flex-1 min-h-[12px] bg-gradient-to-b from-emerald-400 to-emerald-200"
                      aria-hidden
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-5 pl-3">
                  <div className="rounded-lg border border-gray-200/80 bg-white/95 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TbCoin className="text-emerald-600 shrink-0" />
                        <span className="font-medium text-gray-800">
                          Abono #{idx + 1}
                        </span>
                      </div>
                      <time
                        dateTime={pago.fecha}
                        className="text-xs font-medium text-gray-500 tabular-nums"
                      >
                        {formatDateTime(pago.fecha)}
                      </time>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-md bg-emerald-50/70 border border-emerald-100/80 px-3 py-2.5">
                        <dt className="text-[11px] uppercase tracking-wide text-emerald-800/80 font-semibold">
                          Monto abonado
                        </dt>
                        <dd className="text-lg font-bold text-emerald-950 tabular-nums mt-0.5">
                          {formatMoney(pago.montoPagado)}
                        </dd>
                      </div>
                      <div className="rounded-md bg-amber-50/70 border border-amber-100/80 px-3 py-2.5">
                        <dt className="text-[11px] uppercase tracking-wide text-amber-900/75 font-semibold">
                          Pendiente después
                        </dt>
                        <dd className="text-lg font-bold text-amber-950 tabular-nums mt-0.5">
                          {formatMoney(pago.montoPendiente)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className={`border  p-4 rounded-lg ${
            factura.ganancia > 0
              ? "bg-green-50 border-green-200"
              : "bg-error-50 border-error-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <TbTrendingUp
              className={`text-lg ${
                factura.ganancia > 0 ? "text-green-600" : "text-error-500"
              }`}
            />
            <p className="text-xs text-gray-600">Ganancia</p>
          </div>
          <p
            className={`text-lg font-bold ${
              factura.ganancia > 0 ? " text-green-700" : "text-error-500"
            }`}
          >
            {factura.ganancia.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TbPercentage className="text-purple-600 text-lg" />
            <p className="text-xs text-gray-600">Margen</p>
          </div>
          <p className="text-lg font-bold text-purple-700">
            {factura.margen.toFixed(2)}%
          </p>
        </div>
      </div>
      <div
        className={`border mb-5 p-4 rounded-lg ${
          factura.gananciaActual > 0
            ? "bg-green-50 border-green-200"
            : "bg-error-50 border-error-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <TbTrendingUp
            className={`text-lg ${
              factura.gananciaActual > 0 ? "text-green-600" : "text-error-500"
            }`}
          />
          <p className="text-xs text-gray-600">Ganancia actual</p>
        </div>
        <p
          className={`text-lg font-bold ${
            factura.gananciaActual > 0 ? " text-green-700" : "text-error-500"
          }`}
        >
          {factura.gananciaActual.toLocaleString("es-DO", {
            style: "currency",
            currency: "DOP",
          })}
        </p>
      </div>

      {/* 🔹 Botones */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {btnEdit && (
            <>
              <button
                type="button"
                onClick={() => abrirEdicion("pago")}
                disabled={factura.estado == "Reembolsada"}
                className={`flex-1 min-w-[140px] ${
                  factura.estado != "Reembolsada"
                    ? "bg-sky-600 text-white hover:bg-sky-700"
                    : "bg-gray-300 cursor-not-allowed"
                } py-2 rounded-lg transition-colors text-sm`}
              >
                <span className="flex justify-center items-center gap-2">
                  <LuWallet className="text-lg" />
                  Abonar saldo
                </span>
              </button>
              <button
                type="button"
                onClick={() => abrirEdicion("devoluciones")}
                disabled={factura.estado == "Reembolsada"}
                className={`flex-1 min-w-[140px] ${
                  factura.estado != "Reembolsada"
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-gray-300 cursor-not-allowed"
                } py-2 rounded-lg transition-colors text-sm`}
              >
                <span className="flex justify-center items-center gap-2">
                  <TbReceiptRefund className="text-lg" />
                  Reembolsos
                </span>
              </button>
            </>
          )}
          <button
            type="button"
            className="flex-1 min-w-[120px] bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
            onClick={() => {
              handlePrintFactura(factura, user ?? ({} as User));
            }}
          >
            <span className="flex justify-center items-center gap-2 text-sm">
              <LuPrinter className="text-lg" /> Ticket / 48mm
            </span>
          </button>
          <button
            type="button"
            className="flex-1 min-w-[120px] bg-emerald-700 text-white py-2 rounded-lg hover:bg-emerald-800 transition-colors"
            onClick={() => {
              handlePrintFacturaFullPage(factura, user ?? ({} as User));
            }}
          >
            <span className="flex justify-center items-center gap-2 text-sm">
              <LuPrinter className="text-lg" /> Página completa (A4)
            </span>
          </button>
        </div>
      </div>

      {/* 🔹 Cerrar */}
      <button
        onClick={onClose}
        className="mt-4 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cerrar
      </button>
    </div>
  );
}

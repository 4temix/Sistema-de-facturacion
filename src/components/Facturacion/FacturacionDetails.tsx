import { useModalEdit } from "../../context/ModalEditContext";
import { useFacturaColor } from "../../hooks/useFacturaColor";
import { handlePrintFactura } from "../../hooks/useImpresion";
import { PencilIcon } from "../../icons";
import { FacturaDetalle, ProductoVenta } from "../../Types/FacturacionTypes";
import { FacturaSkeleton } from "./FacturaSkeleton";
import { LuPrinter } from "react-icons/lu";
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

  const { modalEditOpen, AsingFactura } = useModalEdit();

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

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex justify-end">
        <div className="bg-white w-full max-w-[600px] h-full overflow-y-auto shadow-xl p-6">
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
                factura.estado ?? "default"
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
              <p className="font-bold text-gray-900">
                {factura.impuestoTotal} %
              </p>
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
                          { style: "currency", currency: "DOP" }
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
                factura.gananciaActual > 0
                  ? " text-green-700"
                  : "text-error-500"
              }`}
            >
              {factura.gananciaActual.toLocaleString("es-DO", {
                style: "currency",
                currency: "DOP",
              })}
            </p>
          </div>

          {/* 🔹 Botones */}
          <div className="flex gap-3">
            {btnEdit && (
              <button
                onClick={() => {
                  modalEditOpen();
                  AsingFactura(factura);
                }}
                disabled={factura.estado == "Reembolsada" ? true : false}
                className={`flex-1 ${
                  factura.estado != "Reembolsada"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300"
                } py-2 rounded-lg transition-colors`}
              >
                <span className="flex justify-center items-center gap-2">
                  <PencilIcon /> Editar
                </span>
              </button>
            )}
            <button
              className="flex-1 bg-green-400 text-white py-2 rounded-lg hover:bg-green-500 transition-colors"
              onClick={() => {
                handlePrintFactura(factura);
              }}
            >
              <span className="flex justify-center items-center gap-2">
                <LuPrinter className="text-lg" /> Imprimir
              </span>
            </button>
          </div>

          {/* 🔹 Cerrar */}
          <button
            onClick={onClose}
            className="mt-4 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}

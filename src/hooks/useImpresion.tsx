import { FacturaDetalle } from "../Types/FacturacionTypes";
import {
  cantidadDevueltaProducto,
  facturaPagosOrdenados,
  getTotalesFacturaResumen,
  saldoPendienteFactura,
  subtotalLineaVentaActual,
} from "../Utilities/facturaDevoluciones";

function buildFacturaPagosPrintBlock(
  pagos: FacturaDetalle["pagos"],
  formatDate: (d: string | null) => string,
  formatCurrency: (n: number) => string,
  variant: "thermal" | "a4",
): string {
  const list = facturaPagosOrdenados(pagos);
  if (!list.length) return "";

  if (variant === "thermal") {
    return `
        <hr class="divider" />
        <div class="section-title">Abonos</div>
        ${list
          .map(
            (p, i) => `
          <div class="product">
            <div class="product-name">#${i + 1} · ${formatDate(p.fecha)}</div>
            <div class="product-line"><span>Pagado</span><span>RD$ ${formatCurrency(p.montoPagado)}</span></div>
            <div class="product-line"><span>Pend. tras abono</span><span>RD$ ${formatCurrency(p.montoPendiente)}</span></div>
          </div>
        `,
          )
          .join("")}
      `;
  }

  return `
        <hr class="divider" />
        <div class="section-title">Historial de abonos</div>
        <table style="width:100%; border-collapse:collapse; font-size:0.9rem; margin:8px 0 12px;">
          <thead>
            <tr style="border-bottom:2px solid #111;">
              <th style="text-align:left; padding:6px 8px;">#</th>
              <th style="text-align:left; padding:6px 8px;">Fecha</th>
              <th style="text-align:right; padding:6px 8px;">Monto abonado</th>
              <th style="text-align:right; padding:6px 8px;">Pendiente después</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                (p, i) => `
              <tr style="border-bottom:1px solid #ddd;">
                <td style="padding:8px;">${i + 1}</td>
                <td style="padding:8px;">${formatDate(p.fecha)}</td>
                <td style="padding:8px; text-align:right; font-weight:600;">RD$ ${formatCurrency(p.montoPagado)}</td>
                <td style="padding:8px; text-align:right;">RD$ ${formatCurrency(p.montoPendiente)}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      `;
}
import { GastoList, GastoUpdate } from "../Types/Gastos";
import { User } from "../Types/Usuario";

export const handlePrintFactura = (factura: FacturaDetalle, user: User) => {
  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("es-DO") : "N/A";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-DO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const tot = getTotalesFacturaResumen(factura);

  // let stringsms = `<img src="../../public/images/logo.jpg" class="logo" alt="Logo" />`;

  // docker run -d --name prueba-db --network red_prueba -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=forerunner117@# -e POSTGRES_DB=basePrueba -v postgres_data:/var/lib/postgresql/data postgres:18

  // docker run -d --name back-prueba -p 8080:8080 -e ASPNETCORE_URLS=http://0.0.0.0:8080 backp:1.0

  const printContent = `
    <html>
      <head>
        <title>Factura ${factura.numeroFactura}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 48mm;
            max-width: 48mm;
            margin: 0 auto;
            padding: 2mm 1mm;
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #000;
            text-align: center;
            position: relative;
            left: -3px;
          }

          /* Mismo tamaño que .product-line (11px); centrado */
          .print-devolucion {
            margin-top: 5px;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            color: #a40000;
            line-height: 1.35;
          }
          .print-devolucion .print-devolucion-monto {
            display: block;
            font-size: 11px;
            margin-top: 2px;
          }
          .print-total-original-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            margin: 6px 0 4px;
            text-align: center;
            width: 100%;
          }
          .print-total-original-block .print-total-original-lbl {
            font-weight: 700;
            font-size: 11px;
            color: #222;
            line-height: 1.25;
          }
          .print-total-original-block .print-total-original-val {
            font-size: 11px;
            font-weight: 700;
            color: #000;
          }

          /* Header */
          .header {
            text-align: center;
            margin-bottom: 6px;
          }
          
          .logo {
            width: 50px;
            height: auto;
            margin-bottom: 4px;
          }
          
          .store-name {
            font-size: 18px;
            font-weight: bold;
            margin: 4px 0;
          }

          /* Dividers */
          .divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          
          .divider-double {
            border: none;
            border-top: 2px solid #000;
            margin: 6px 0;
          }

          /* Invoice number */
          .invoice-box {
            background: #f0f0f0;
            padding: 4px;
            margin: 6px 0;
            font-size: 14px;
            font-weight: bold;
          }

          /* Info rows */
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 11px;
            text-align: left;
          }
          
          .info-value {
            font-weight: bold;
            text-align: right;
          }

          /* Section titles */
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin: 6px 0 4px 0;
            text-transform: uppercase;
          }

          /* Products */
          .product {
            margin: 6px 0;
            padding-bottom: 4px;
            border-bottom: 1px dotted #aaa;
            text-align: left;
          }
          
          .product:last-child {
            border-bottom: none;
          }
          
          .product-name {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 2px;
          }
          
          .product-line {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          
          .product-extras {
            font-size: 10px;
            color: #303030;
          }

          /* Labor */
          .labor-box {
            background: #f5f5f5;
            padding: 4px;
            margin: 6px 0;
            text-align: left;
          }
          
          .labor-detail {
            font-size: 10px;
            color: #444;
            font-style: italic;
          }

          /* Totals */
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 12px;
          }
          
          .grand-total {
            font-size: 16px;
            font-weight: bold;
            background: #000;
            padding: 6px 4px;
            margin: 6px 0;
          }

          /* Payment */
          .payment-box {
            margin: 6px 0;
          }
          
          .payment-method {
            font-weight: bold;
            background: #eee;
            padding: 4px 8px;
            display: inline-block;
            margin: 4px 0;
            font-size: 12px;
          }
          
          .payment-date {
            font-size: 11px;
          }

          /* Footer */
          .footer {
            margin-top: 8px;
          }
          
          .thank-you {
            font-size: 13px;
            font-weight: bold;
            margin: 4px 0;
          }
          
          .footer-note {
            font-size: 10px;
            color: #303030;
          }

          /* Print */
          @media print {
            body {
              width: 48mm;
              max-width: 48mm;
              padding: 1mm;
              left: -3px;
            }
            
            @page {
              size: 48mm auto;
              margin: 0;
            }
            
            .no-print {
              display: none !important;
            }
          }

          /* Button */
          .btn {
            display: block;
            width: 100%;
            margin: 8px 0;
            padding: 8px;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid #000;
            background: #fff;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        
        <div class="header">
          <div class="store-name">${user.compName}</div>
        </div>

        <hr class="divider-double" />

        <div class="invoice-box">
          FACTURA #${factura.numeroFactura}
        </div>

        <div class="info-row">
          <span>Cliente:</span>
          <span class="info-value">${factura.nombreCliente}</span>
        </div>
        <div class="info-row">
          <span>Fecha:</span>
          <span class="info-value">${formatDate(factura.fechaEmision)}</span>
        </div>
        <div class="info-row">
          <span>Estado:</span>
          <span class="info-value">${factura.estado}</span>
        </div>

        <hr class="divider" />

        <div class="section-title">PRODUCTOS</div>
        
        ${(factura.productos ?? [])
          .map((p) => {
            const dev = cantidadDevueltaProducto(p);
            const stActual = subtotalLineaVentaActual(p);
            const devLine =
              dev > 0
                ? `<div class="print-devolucion"><span>Devuelto: ${dev} uds</span><span class="print-devolucion-monto">RD$ ${formatCurrency(p.montoDevuelto ?? 0)}</span></div>`
                : "";
            return `
            <div class="product">
              <div class="product-name">${p.nombre}</div>
              <div class="product-line">
                <span>x${p.cantidad}${dev > 0 ? ` (en venta: ${p.cantidad - dev})` : ""}</span>
                <span>RD$ ${formatCurrency(stActual)}</span>
              </div>
              ${devLine}
              ${
                p.descuento > 0 || p.impuestos > 0
                  ? `<div class="product-extras">
                      ${p.descuento > 0 ? `Desc: ${p.descuento}%` : ""}
                      ${p.descuento > 0 && p.impuestos > 0 ? " | " : ""}
                      ${
                        p.impuestos > 0 ? `Imp: ${p.impuestos.toFixed(2)}%` : ""
                      }
                    </div>`
                  : ""
              }
            </div>
          `;
          })
          .join("")}

        ${
          factura.manoDeObra > 0
            ? `
          <hr class="divider" />
          
          <div class="section-title">MANO DE OBRA</div>
          
          <div class="labor-box">
            <div class="product-line">
              <span>Servicio</span>
              <span>RD$ ${formatCurrency(factura.manoDeObra)}</span>
            </div>
            ${
              factura.detalleManoDeObra
                ? `<div class="labor-detail">${factura.detalleManoDeObra}</div>`
                : ""
            }
          </div>
        `
            : ""
        }

        <hr class="divider-double" />

        <div class="total-row">
          <span>Subtotal (actual):</span>
          <span>RD$ ${formatCurrency(tot.subtotalActual)}</span>
        </div>
        ${
          tot.hayDevoluciones && tot.subtotalDevuelto > 0
            ? `<div class="total-row" style="color:#a40000;">
                <span>Subtotal devuelto:</span>
                <span>RD$ ${formatCurrency(tot.subtotalDevuelto)}</span>
              </div>`
            : ""
        }
        
        ${
          factura.impuestoTotal > 0
            ? `<div class="total-row">
                <span>Impuestos:</span>
                <span>${factura.impuestoTotal}%</span>
              </div>`
            : ""
        }
        
        ${
          factura.descuentoTotal > 0
            ? `<div class="total-row">
                <span>Descuento:</span>
                <span>-${factura.descuentoTotal}%</span>
              </div>`
            : ""
        }
        ${
          tot.hayDevoluciones && tot.totalOriginal !== tot.totalActual
            ? `<div class="print-total-original-block">
                <span class="print-total-original-lbl">Total venta original</span>
                <span class="print-total-original-val">RD$ ${formatCurrency(tot.totalOriginal)}</span>
              </div>`
            : ""
        }
        
        <div class="grand-total">
          <div class="product-line">
            <span>TOTAL (actual)</span>
            <span>RD$ ${formatCurrency(tot.totalActual)}</span>
          </div>
        </div>
        ${
          tot.totalDevuelto > 0
            ? `<div class="total-row" style="margin-top:4px;font-weight:bold;color:#a40000;">
                <span>Reembolso / devolución:</span>
                <span>RD$ ${formatCurrency(tot.totalDevuelto)}</span>
              </div>`
            : ""
        }

        ${buildFacturaPagosPrintBlock(
          factura.pagos,
          formatDate,
          formatCurrency,
          "thermal",
        )}

        <div class="payment-box">
          <div>Método de pago:</div>
          <div class="payment-method">${factura.metodoPago || "N/A"}</div>
          <div class="payment-date">fecha de pago: ${formatDate(
            factura.fechaPago,
          )}</div>
          <div class="payment-date">Monto pagado: RD$ ${formatCurrency(
            factura.montoPagado,
          )}</div>
          ${
            tot.totalDevuelto > 0
              ? `<div class="payment-date" style="color:#a40000;font-weight:bold;">Monto devuelto (mercancía): RD$ ${formatCurrency(tot.totalDevuelto)}</div>`
              : ""
          }
           <div class="payment-date">Monto pendiente: RD$ ${formatCurrency(
             saldoPendienteFactura(factura),
           )}</div>
        </div>

        <hr class="divider" />

        <div class="footer">
          <div class="thank-you">¡Gracias!</div>
          <div class="footer-note">Conserve su recibo</div>
        </div>

        <button class="btn no-print" onclick="window.print()">
          Reimprimir
        </button>
        
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};

/** Misma información que el ticket térmico, en hoja A4 con márgenes para impresora estándar */
export const handlePrintFacturaFullPage = (
  factura: FacturaDetalle,
  user: User,
) => {
  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("es-DO") : "N/A";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-DO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const tot = getTotalesFacturaResumen(factura);

  const printContent = `
    <html>
      <head>
        <title>Factura ${factura.numeroFactura}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 12mm 14mm 12mm calc(14mm - 3px);
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.45;
            color: #111;
          }
          /* Igual que .product-line (0.9rem); centrado */
          .print-devolucion-a4 {
            margin-top: 6px;
            color: #a40000;
            font-weight: 700;
            font-size: 0.9rem;
            line-height: 1.35;
            text-align: center;
          }
          .print-devolucion-a4 .print-devolucion-monto {
            display: block;
            font-size: 0.9rem;
            margin-top: 3px;
          }
          .print-total-original-a4 {
            margin: 10px 0 8px;
            padding: 8px 0;
            border-top: 1px dashed #bbb;
            text-align: center;
          }
          .print-total-original-a4 .lbl {
            display: block;
            font-weight: 700;
            font-size: 0.9rem;
            color: #333;
            margin-bottom: 3px;
          }
          .print-total-original-a4 .val {
            display: block;
            font-size: 0.9rem;
            font-weight: 700;
            color: #111;
          }
          h1 { font-size: 1.35rem; margin-bottom: 4px; }
          .muted { color: #555; font-size: 0.9rem; }
          .divider { border: none; border-top: 1px solid #ccc; margin: 12px 0; }
          .divider-double { border-top: 2px solid #111; margin: 14px 0; }
          .invoice-box {
            background: #f4f4f4;
            padding: 10px 12px;
            margin: 10px 0;
            font-size: 1.05rem;
            font-weight: bold;
            text-align: center;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
            font-size: 0.95rem;
          }
          .section-title {
            font-weight: bold;
            font-size: 0.95rem;
            margin: 14px 0 8px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .product {
            margin: 10px 0;
            padding-bottom: 8px;
            border-bottom: 1px dotted #bbb;
          }
          .product-name { font-weight: bold; margin-bottom: 4px; }
          .product-line { display: flex; justify-content: space-between; font-size: 0.9rem; }
          .total-row { display: flex; justify-content: space-between; margin: 6px 0; }
          .grand-total {
            font-size: 1.15rem;
            font-weight: bold;
            background: #111;
            color: #fff;
            padding: 10px 12px;
            margin: 12px 0;
          }
          .payment-box { margin: 12px 0; font-size: 0.95rem; }
          .footer { margin-top: 16px; text-align: center; font-size: 0.9rem; color: #444; }
          @media print {
            body {
              padding: 10mm 10mm 10mm calc(10mm - 3px);
            }
            .no-print { display: none !important; }
          }
          @page { size: A4 portrait; margin: 12mm; }
        </style>
      </head>
      <body>
        <div style="text-align:center; margin-bottom: 12px;">
          <div style="font-size: 1.25rem; font-weight: bold;">${user.compName ?? "Empresa"}</div>
          <div class="muted">Factura de venta</div>
        </div>
        <hr class="divider-double" />
        <div class="invoice-box">FACTURA #${factura.numeroFactura}</div>
        <div class="info-row"><span>Cliente:</span><span style="font-weight:600">${factura.nombreCliente}</span></div>
        <div class="info-row"><span>Emisión:</span><span>${formatDate(factura.fechaEmision)}</span></div>
        <div class="info-row"><span>Estado:</span><span>${factura.estado}</span></div>
        <hr class="divider" />
        <div class="section-title">Productos</div>
        ${(factura.productos ?? [])
          .map((p) => {
            const dev = cantidadDevueltaProducto(p);
            const stActual = subtotalLineaVentaActual(p);
            const devLine =
              dev > 0
                ? `<div class="print-devolucion-a4"><span>Devuelto: ${dev} uds</span><span class="print-devolucion-monto">RD$ ${formatCurrency(p.montoDevuelto ?? 0)}</span></div>`
                : "";
            return `
          <div class="product">
            <div class="product-name">${p.nombre}</div>
            <div class="product-line">
              <span>Cant. ${p.cantidad}${dev > 0 ? ` (en venta: ${p.cantidad - dev})` : ""}</span>
              <span>RD$ ${formatCurrency(stActual)}</span>
            </div>
            ${devLine}
          </div>`;
          })
          .join("")}
        ${
          factura.manoDeObra > 0
            ? `<div class="section-title">Mano de obra</div>
               <div class="info-row"><span>Servicio</span><span>RD$ ${formatCurrency(factura.manoDeObra)}</span></div>
               ${factura.detalleManoDeObra ? `<p class="muted" style="margin-top:6px;">${factura.detalleManoDeObra}</p>` : ""}`
            : ""
        }
        <hr class="divider-double" />
        <div class="total-row"><span>Subtotal (actual)</span><span>RD$ ${formatCurrency(tot.subtotalActual)}</span></div>
        ${
          tot.hayDevoluciones && tot.subtotalDevuelto > 0
            ? `<div class="total-row" style="color:#a40000;"><span>Subtotal devuelto</span><span>RD$ ${formatCurrency(tot.subtotalDevuelto)}</span></div>`
            : ""
        }
        ${
          tot.hayDevoluciones && tot.totalOriginal !== tot.totalActual
            ? `<div class="print-total-original-a4"><span class="lbl">Total venta original</span><span class="val">RD$ ${formatCurrency(tot.totalOriginal)}</span></div>`
            : ""
        }
        <div class="grand-total">
          <div class="product-line"><span>TOTAL (actual)</span><span>RD$ ${formatCurrency(tot.totalActual)}</span></div>
        </div>
        ${
          tot.totalDevuelto > 0
            ? `<div class="info-row" style="color:#a40000;font-weight:600;margin-top:8px;"><span>Reembolso / devolución</span><span>RD$ ${formatCurrency(tot.totalDevuelto)}</span></div>`
            : ""
        }
        ${buildFacturaPagosPrintBlock(
          factura.pagos,
          formatDate,
          formatCurrency,
          "a4",
        )}
        <div class="payment-box">
          <div class="info-row"><span>Método de pago</span><span>${factura.metodoPago || "N/A"}</span></div>
          <div class="info-row"><span>Fecha de pago</span><span>${formatDate(factura.fechaPago)}</span></div>
          <div class="info-row"><span>Monto pagado (acum.)</span><span>RD$ ${formatCurrency(factura.montoPagado)}</span></div>
          ${
            tot.totalDevuelto > 0
              ? `<div class="info-row" style="color:#a40000;"><span>Monto devuelto (mercancía)</span><span>RD$ ${formatCurrency(tot.totalDevuelto)}</span></div>`
              : ""
          }
          <div class="info-row"><span>Saldo pendiente</span><span>RD$ ${formatCurrency(saldoPendienteFactura(factura))}</span></div>
        </div>
        <div class="footer"><p>Gracias por su compra.</p><p class="muted">Documento generado desde el sistema.</p></div>
        <button class="no-print" style="margin-top:16px;padding:10px;width:100%;cursor:pointer;" onclick="window.print()">Imprimir</button>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};

function formatDateGasto(date: string | null | undefined) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMoneyGasto(n: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  }).format(n);
}

export const handlePrintGastoThermal = (
  detail: GastoUpdate,
  summary: GastoList | null,
  user: User,
) => {
  const fechaGasto = detail.fecha ?? summary?.fecha;
  const printContent = `
    <html><head><title>Gasto #${detail.id}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { width:48mm; max-width:48mm; margin:0 auto; padding:2mm 1mm; font-family:Arial,sans-serif; font-size:11px; line-height:1.4; }
      .h { font-weight:bold; font-size:13px; text-align:center; margin-bottom:6px; }
      .row { display:flex; justify-content:space-between; margin:3px 0; font-size:10px; }
      .sep { border-top:1px dashed #000; margin:6px 0; }
      .big { font-weight:bold; font-size:12px; margin-top:6px; text-align:center; }
      @page { size:48mm auto; margin:0; }
    </style></head><body>
      <div class="h">${user.compName ?? "Gasto"}</div>
      <div class="sep"></div>
      <div class="row"><span>ID</span><span>#${detail.id}</span></div>
      <div class="row"><span>Fecha</span><span>${formatDateGasto(fechaGasto)}</span></div>
      <div class="row"><span>Pago</span><span>${formatDateGasto(detail.fechaPago)}</span></div>
      <div class="sep"></div>
      <div class="row"><span>Total</span><span>${formatMoneyGasto(detail.montoTotal)}</span></div>
      <div class="row"><span>Pagado</span><span>${formatMoneyGasto(detail.montoPagado)}</span></div>
      <div class="big">${formatMoneyGasto(detail.montoTotal - detail.montoPagado)} pend.</div>
      <div class="sep"></div>
      <div style="font-size:9px;">${(detail.nota || summary?.nota || "").slice(0, 200)}</div>
      <button style="margin-top:8px;width:100%;" class="no-print" onclick="window.print()">Imprimir</button>
    </body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(printContent);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
    };
  }
};

export const handlePrintGastoFullPage = (
  detail: GastoUpdate,
  summary: GastoList | null,
  user: User,
) => {
  const fechaGasto = detail.fecha ?? summary?.fecha;
  const printContent = `
    <html><head><title>Gasto #${detail.id}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { width:100%; max-width:210mm; margin:0 auto; padding:12mm 14mm; font-family:'Segoe UI',Arial,sans-serif; font-size:12pt; color:#111; }
      h1 { font-size:1.25rem; margin-bottom:4px; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:12px 0; }
      .box { border:1px solid #ddd; padding:10px; border-radius:6px; background:#fafafa; }
      .label { font-size:0.75rem; color:#666; text-transform:uppercase; }
      .row { display:flex; justify-content:space-between; margin:6px 0; }
      .sep { border-top:1px solid #ccc; margin:14px 0; }
      @page { size:A4 portrait; margin:12mm; }
    </style></head><body>
      <h1>Comprobante de gasto #${detail.id}</h1>
      <p style="color:#555;">${user.compName ?? ""}</p>
      <div class="sep"></div>
      <div class="grid">
        <div class="box"><div class="label">Fecha del gasto</div><div>${formatDateGasto(fechaGasto)}</div></div>
        <div class="box"><div class="label">Fecha de pago</div><div>${formatDateGasto(detail.fechaPago)}</div></div>
        <div class="box"><div class="label">Proveedor</div><div>${detail.proveedor ?? summary?.proveedor ?? "—"}</div></div>
        <div class="box"><div class="label">Comprobante</div><div>${detail.comprobante ?? summary?.comprobante ?? "—"}</div></div>
      </div>
      <div class="row"><span>Total</span><strong>${formatMoneyGasto(detail.montoTotal)}</strong></div>
      <div class="row"><span>Pagado</span><strong>${formatMoneyGasto(detail.montoPagado)}</strong></div>
      <div class="row"><span>Pendiente</span><strong>${formatMoneyGasto(detail.montoTotal - detail.montoPagado)}</strong></div>
      <div class="sep"></div>
      <div class="row"><span>Método de pago</span><span>${detail.metodoPago ?? summary?.metodoPago ?? "—"}</span></div>
      <div class="row"><span>Origen fondo</span><span>${detail.origenFondo ?? "—"}</span></div>
      <div class="row"><span>Referencia</span><span>${detail.referencia ?? "—"}</span></div>
      <p style="margin-top:12px;"><span class="label">Nota</span><br/>${(detail.nota || summary?.nota || "—").replace(/</g, "&lt;")}</p>
      <button style="margin-top:20px;" onclick="window.print()">Imprimir</button>
    </body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(printContent);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
    };
  }
};

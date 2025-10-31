import { FacturaDetalle } from "../Types/FacturacionTypes";

export const handlePrintFactura = (factura: FacturaDetalle) => {
  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("es-DO") : "N/A";

  const printContent = `
    <html>
      <head>
        <title>Factura ${factura.numeroFactura}</title>
        <style>
          @media print {

            body {
              width: 58mm;
              margin: 0;
              padding: 0;
              font-family: monospace;
              font-size: 10px;
            }
            .center { text-align: center; }
            .divider { border-bottom: 1px dashed #000; margin: 4px 0; }
            .product-line { text-align: center; margin: 2px 0; word-wrap: break-word; }
            .totals { text-align: center; margin-top: 2px; }
            .total-label { display: inline-block; width: 60px; }
            .total-value { font-weight: bold; }
            @page { size: 58mm auto; margin: 0; }
            #reprint-btn { display: none; } /* Oculta el botón al imprimir */
          }
          #reprint-btn {
            display: block;
            margin: 8px auto;
            padding: 4px 8px;
            font-size: 10px;
            border: 1px solid #000;
            background: #f3f3f3;
            cursor: pointer;
            width: 90%;
            border-radius: 4px;
          }
          #reprint-btn:hover {
            background: #ddd;
          }
        </style>
      </head>
      <body>
        <section class="receipt-template">
          <header class="receipt-header center">
            <img src="../../public/images/logo.jpg" width="80" />
            <h2 class="store-name">Repuesto</h2>
            <p>Cliente: ${factura.nombreCliente}</p>
            <p>Factura #: ${factura.numeroFactura}</p>
            <p>Fecha: ${formatDate(factura.fechaEmision)}</p>
            <div class="divider"></div>
          </header>

          <section class="listing-area item-list">
            ${factura
              .productos!.map(
                (p) => `
                  <div class="product-line">
                    ${p.nombre} : x${p.cantidad} RD$${(
                  p.precioVentaActual * p.cantidad
                ).toFixed(2)}
                  </div>
                  ${
                    p.descuento > 0
                      ? `<div class="product-line">Desc: ${p.descuento}%</div>`
                      : ""
                  }
                  ${
                    p.impuestos > 0
                      ? `<div class="product-line">Imp: ${p.impuestos.toFixed(
                          2
                        )}%</div>`
                      : ""
                  }
                `
              )
              .join("")}
          </section>

          <div class="divider"></div>

          <section class="info-area totals">
            <div class="totals"><span class="total-label">Subtotal:</span> <span class="total-value">${factura.subtotal.toFixed(
              2
            )} DOP</span></div>
            <div class="totals"><span class="total-label">Impuestos:</span> <span class="total-value">${
              factura.impuestoTotal
            }%</span></div>
            ${
              factura.descuentoTotal > 0
                ? `<div class="totals"><span class="total-label">Descuento:</span> <span class="total-value">${factura.descuentoTotal}%</span></div>`
                : ""
            }
            <div class="totals"><span class="total-label">TOTAL:</span> <span class="total-value">${factura.total.toFixed(
              2
            )} DOP</span></div>
          </section>

          <div class="divider"></div>

          <section class="info-area center">
            <p>Método de pago: ${factura.metodoPago || "N/A"}</p>
            <p>Fecha pago: ${formatDate(factura.fechaPago)}</p>
            <p>¡Gracias por su compra!</p>
          </section>
        </section>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Esperar que todo cargue antes de imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};

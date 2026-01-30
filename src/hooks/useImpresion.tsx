import { FacturaDetalle } from "../Types/FacturacionTypes";

export const handlePrintFactura = (factura: FacturaDetalle) => {
  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("es-DO") : "N/A";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-DO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

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
          <img src="../../public/images/logo.jpg" class="logo" alt="Logo" />
          <div class="store-name">REPUESTO</div>
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
        
        ${factura
          .productos!.map(
            (p) => `
            <div class="product">
              <div class="product-name">${p.nombre}</div>
              <div class="product-line">
                <span>x${p.cantidad}</span>
                <span>RD$ ${formatCurrency(
                  p.precioVentaActual * p.cantidad
                )}</span>
              </div>
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
          `
          )
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
          <span>Subtotal:</span>
          <span>RD$ ${formatCurrency(factura.subtotal)}</span>
        </div>
        
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
        
        <div class="grand-total">
          <div class="product-line">
            <span>TOTAL</span>
            <span>RD$ ${formatCurrency(factura.total)}</span>
          </div>
        </div>

        <div class="payment-box">
          <div>Método de pago:</div>
          <div class="payment-method">${factura.metodoPago || "N/A"}</div>
          <div class="payment-date">fecha de pago: ${formatDate(
            factura.fechaPago
          )}</div>
          <div class="payment-date">Monto pagado: ${formatCurrency(
            factura.montoPagado
          )}</div>
           <div class="payment-date">Monto pendiente: ${formatCurrency(
             factura.total - factura.montoPagado
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

import { ProductoDetalles } from "../../Types/ProductTypes";

interface ProductoDetallesScreenProps {
  producto: ProductoDetalles;
}

export default function ProductoDetallesScreen({
  producto,
}: ProductoDetallesScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {producto.nombre}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    producto.estado === "activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {producto.estado}
                </span>
              </div>
              <p className="text-slate-600 mb-4">{producto.descripcion}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>
                  Código:{" "}
                  <span className="font-mono font-medium text-slate-700">
                    {producto.codigo}
                  </span>
                </span>
                <span>•</span>
                <span>
                  ID:{" "}
                  <span className="font-medium text-slate-700">
                    #{producto.id}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Detalles Básicos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                {/* ICONO: Info/Document icon */}
                Información Básica
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Categoría
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {producto.categoria}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Marca
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {producto.marca}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Tipo
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {producto.tipo}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Unidad de Medida
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {producto.unidadMedida}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Ubicación
                  </p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    {/* ICONO: Location/MapPin icon */}
                    {producto.ubicacion}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles Financieros */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                {/* ICONO: Dollar/Currency icon */}
                Detalles Financieros
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">
                    Precio de Compra
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    ${producto.precioCompra.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">
                    Precio de Venta
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    ${producto.precioVenta.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Precio Mínimo</span>
                  <span className="text-sm font-semibold text-amber-600">
                    ${producto.precioMinimo.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Impuesto</span>
                  <span className="text-sm font-medium text-slate-900">
                    {producto.impuesto}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Descuento Base</span>
                  <span className="text-sm font-medium text-slate-900">
                    {producto.descuentoBase}%
                  </span>
                </div>
              </div>
            </div>

            {/* Inventario y Riesgo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                {/* ICONO: Package/Box icon */}
                Inventario y Riesgo
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Stock Actual</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {producto.stockActual}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Stock Mínimo</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {producto.stockMinimo}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">
                    Días de Suministro
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {producto.diasSuministroRestante}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Total Devuelto</span>
                  <span className="text-sm font-medium text-slate-900">
                    {producto.totalDevueltoHistorico}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">
                    Tasa de Devolución
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    {producto.tasaDevolucionPorcentaje}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Métricas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Métricas de Rentabilidad */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                {/* ICONO: TrendingUp/Chart icon */}
                Métricas de Rentabilidad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-emerald-700 font-medium">
                      Ganancia por Unidad
                    </p>
                    {/* ICONO: DollarSign icon */}
                  </div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {producto.gananciaPorUnidadBruta}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Ganancia bruta
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-700 font-medium">
                      Margen de Ganancia
                    </p>
                    {/* ICONO: Percent icon */}
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {producto.margenGananciaBrutoPorcentaje} %
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Porcentaje bruto</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-700 font-medium">ROI</p>
                    {/* ICONO: TrendingUp icon */}
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {producto.roiPorcentaje} %
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Retorno de inversión
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-amber-700 font-medium">
                      Ganancia Total
                    </p>
                    {/* ICONO: Wallet icon */}
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {producto.gananciaTotalHistorica}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Histórica acumulada
                  </p>
                </div>
              </div>
            </div>

            {/* Métricas de Ventas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                {/* ICONO: ShoppingCart/BarChart icon */}
                Métricas de Ventas y Popularidad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    {/* ICONO: Package icon */}
                    <p className="text-sm text-slate-600 font-medium">
                      Total Vendido
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {producto.totalVendidoHistorico}
                  </p>
                  <p className="text-xs text-slate-500">Unidades históricas</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    {/* ICONO: Calendar icon */}
                    <p className="text-sm text-slate-600 font-medium">
                      Últimos 30 Días
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {producto.vendidoUltimos30Dias}
                  </p>
                  <p className="text-xs text-slate-500">Unidades vendidas</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    {/* ICONO: DollarSign icon */}
                    <p className="text-sm text-slate-600 font-medium">
                      Venta Neta
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {producto.ventaNetaUltimos30Dias}
                  </p>
                  <p className="text-xs text-slate-500">Últimos 30 días</p>
                </div>
              </div>
            </div>

            {/* Resumen Rápido */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg shadow-sm p-6 text-white">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {/* ICONO: Star/Award icon */}
                Resumen de Rendimiento
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Estado</p>
                  <p className="text-lg font-semibold capitalize">
                    {producto.estado}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Margen</p>
                  <p className="text-lg font-semibold">
                    {producto.margenGananciaBrutoPorcentaje} %
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">ROI</p>
                  <p className="text-lg font-semibold">
                    {producto.roiPorcentaje} %
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ventas 30d</p>
                  <p className="text-lg font-semibold">
                    {producto.vendidoUltimos30Dias}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

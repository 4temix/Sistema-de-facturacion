import { Link, useSearchParams } from "react-router";
import { ReporteMensual } from "../../Types/Reportes";
import PageBreadcrumb from "../common/PageBreadCrumb";
import TableFacturas from "../Facturacion/TableFacturas";
import { useEffect, useState } from "react";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { DataRequest } from "../../Types/FacturacionTypes";
import { ParamsFacturasRequest } from "../../Types/FacturacionTypes";

export default function DetailsMonth({ params }: { params: ReporteMensual }) {
  const { fechaInit, fechaFin } = generarRangoFecha(
    params.anio,
    params.mesNumber
  );

  //filtros de busqueda
  const [filters, setFilters] = useState({
    estado: null,
    search: "",
    fechaPago: null,
    page: 1,
    PageSize: 10,
    fechaInit,
    fechaFin,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  //productos de la tabla
  const [productosData, setProductosData] = useState<DataRequest>({
    data: params.facturasMes.data,
    total_pages: params.facturasMes.total_pages,
  });

  //eliminar nulos
  function buildQueryString<T extends Record<string, any>>(filters: T): string {
    const validEntries = Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined) // ✅ elimina null/undefined
      .map(([key, value]) => [key, String(value)]); // convierte a string

    return new URLSearchParams(Object.fromEntries(validEntries)).toString();
  }

  //funcion para obtener los elementos de la tabla
  function getData(filters: ParamsFacturasRequest) {
    // setPagUtilities((p) => ({ ...p, tableLoader: true }));
    const queryString = buildQueryString(filters);

    apiRequestThen<DataRequest>({
      url: `api/facturas?${queryString}`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        console.log(response.result);
        setProductosData(
          response.result ?? {
            data: [],
            total_pages: 0,
          }
        );
      })
      .finally(() => {
        // setPagUtilities((p) => ({ ...p, tableLoader: false }));
      });
  }

  //incremento de la pagina
  function incrementPage(page: number) {
    updateFilter(page, "page");
    searchParams.set("pag", page.toString());
    setSearchParams(searchParams);
  }

  //actualizar los fintros
  function updateFilter(value: string | number | null, key: string) {
    setFilters((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  }

  function generarRangoFecha(anio: number, mes: number) {
    // mes: 1–12

    const fechaInit = new Date(anio, mes - 1, 1);

    // truco oficial para último día del mes:
    const fechaFin = new Date(anio, mes, 0);

    return {
      fechaInit: fechaInit.toISOString().split("T")[0],
      fechaFin: fechaFin.toISOString().split("T")[0],
    };
  }

  //debounce para busquedas
  useEffect(() => {
    getData(filters);
  }, [filters.page]);

  useEffect(() => {
    if (!searchParams.get("pag")) {
      return;
    }
    updateFilter(Number(searchParams.get("pag")), "page");
  }, [searchParams]);

  if (!params) return null;
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/reportes/${params.anio}`}
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Volver a {params.anio}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reporte de {params.mes} {params.anio}
          </h1>
          <p className="text-gray-600">
            Análisis detallado de ventas, inventario y rentabilidad
          </p>
        </div>

        {/* KPIs Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm">Ventas Totales</p>
              {/* Icon: DollarSign */}
            </div>
            <p className="text-3xl font-bold mb-1">
              {new Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
                minimumFractionDigits: 2,
              }).format(params.totales.totalVentas)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Total Pedidos</p>
              {/* Icon: ShoppingCart */}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {params.totales.totalFacturas}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Ganancias del mes</p>
              {/* Icon: TrendingUp */}
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">
              {new Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
                minimumFractionDigits: 2,
              }).format(params.totales.totalGanancia)}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ventas por Semana */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Ventas por Semana
            </h3>
            <div className="space-y-4">
              {params.semanas?.map((week, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Semana {week.numeroSemana}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {new Intl.NumberFormat("es-DO", {
                          style: "currency",
                          currency: "DOP",
                          minimumFractionDigits: 2,
                        }).format(week?.totalSemana)}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{
                          width: `${(week.totalSemana / 30000) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-600">
                        {week.cantidadFacturas} pedidos
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Productos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Top 5 Productos del Mes
            </h3>
            <div className="space-y-3">
              {params.topProductos?.map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.producto}
                    </p>
                    <p className="text-xs text-gray-600">
                      {product.cantidadVendida} unidades vendidas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${product.totalVendido?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Devoluciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Devoluciones</h3>
              {/* Icon: RotateCcw */}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Total Devuelto</p>
                  <p className="text-lg font-bold text-gray-900">
                    {params.devoluciones.cantidad}
                  </p>
                  <p className="text-xs text-gray-600">unidades</p>
                  <p className="text-xs text-gray-600 mb-1">Valor</p>
                  <p className="text-lg font-bold text-purple-500">
                    ${params.devoluciones.valorTotal?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">reintegrable</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Devuelto</p>
                    <p className="text-lg font-bold text-gray-900">
                      {params.devoluciones.cantidadPerdida}
                    </p>
                    <p className="text-xs text-gray-600">unidades</p>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Valor</p>
                  <p className="text-lg font-bold text-red-600">
                    ${params.devoluciones.valorTotalPerdido?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">perdido</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Devuelto</p>
                    <p className="text-lg font-bold text-gray-900">
                      {params.devoluciones.cantidadReintegrable}
                    </p>
                    <p className="text-xs text-gray-600">unidades</p>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Valor</p>
                  <p className="text-lg font-bold text-blue-500">
                    $
                    {params.devoluciones.valorTotalReintegrable?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">reintegrable</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Producto más devuelto:</span>
                  <span className="font-medium text-gray-900">
                    {params.devoluciones.productoMasDevuelto}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] col-span-12 md:min-w-[600px] mt-9">
            <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
              <PageBreadcrumb pageTitle="Ventas recientes" />
              <TableFacturas
                loader={false}
                data={productosData.data}
                total_pages={productosData.total_pages}
                setPage={incrementPage}
                pageNUmber={filters.page}
                pageSize={10}
                updateSize={() => {}}
                showPag={true}
                showColum={{ actions: false }}
                btnEdit={false}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

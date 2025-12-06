import { useMemo, useState } from "react";
import { LuPrinter } from "react-icons/lu";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  Cell,
  type VisibilityState,
} from "@tanstack/react-table";
import { PencilIcon } from "../../icons";
import { Pagination } from "./pagination";
import Input from "../form/input/InputField";
import {
  DataRequest,
  Factura,
  FacturaDetalle,
  Totales,
} from "../../Types/FacturacionTypes";
import { LoadingTable } from "../loader/LoadingTable";
import { useFacturaColor } from "../../hooks/useFacturaColor";
import Drawer from "../ui/modal/Drawer";
import FacturacionDetails from "./FacturacionDetails";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { useModalEdit } from "../../context/ModalEditContext";
import { handlePrintFactura } from "../../hooks/useImpresion";
import LoaderFun from "../loader/LoaderFunc";
import ColumnVisibilityToggle from "../ui/ColumnVisibilityToggle";

type internalProps = DataRequest & {
  setPage: (page: number) => void;
  pageNUmber: number;
  pageSize?: number;
  updateSize: (value: number, key: string) => void;
  loader: boolean;
  showPag?: boolean;
  showColum?: VisibilityState;
  btnEdit?: boolean;
};

export default function TableFacturas({
  data,
  total_pages,
  setPage,
  pageNUmber,
  pageSize,
  updateSize,
  loader,
  showPag = true,
  showColum,
  btnEdit = true,
}: internalProps) {
  const getFacturaColor = useFacturaColor();
  const [isLoading, setIsLoading] = useState(false);

  //cargando
  const [loadintComplete, setLoadintComplete] = useState(false);

  const { modalEditOpen, AsingFactura } = useModalEdit();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    fechaPago: false,
    metodoPago: false,
    ...showColum,
  });

  // Configuración de columnas para el toggle
  const columnConfig = [
    { id: "nombre", label: "Factura" },
    { id: "cliente", label: "Cliente" },
    { id: "fechaEmision", label: "Fecha Emisión" },
    { id: "fechaPago", label: "Fecha Pago" },
    { id: "monto", label: "Monto" },
    { id: "estado", label: "Estado" },
    { id: "metodoPago", label: "Método Pago" },
    { id: "actions", label: "Acciones" },
  ];

  const [DetailsFactura, setDetailsFactura] = useState<FacturaDetalle>({
    id: 0,
    numeroFactura: "",

    // Fechas
    fechaEmision: "", // Se recibe como ISO string desde C#
    fechaPago: "",

    // Cliente
    clienteId: 0,
    nombreCliente: "",
    documentoCliente: "",
    telefonoCliente: "",

    // Totales
    subtotal: 0,
    impuestoTotal: 0,
    descuentoTotal: 0,
    total: 0,
    ganancia: 0,
    margen: 0,

    // Estado y pago
    montoPagado: 0,
    estado: "",
    metodoPago: "",

    // Relaciones y metadatos
    vendedor: 1,
    sucursal: "",
    moneda: "",
    tipoCambio: 0,

    // Actualización
    actualizadoEn: "",
    actualizacionPago: "",

    // Productos
    productos: [],

    detalleManoDeObra: "",
    manoDeObra: 0,

    totales: {} as Totales,

    devoluciones: [],

    gananciaActual: 0,
  });

  //funcion para obtener los elementos de la tabla
  function getData(id: number) {
    setIsLoading(true);

    apiRequestThen<FacturaDetalle>({
      url: `api/facturas/details/${id}`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        setDetailsFactura(response.result!);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const [IsDetailsOpen, setIsDetailsOpen] = useState(false);
  const columns = useMemo(() => {
    return [
      {
        id: "nombre",
        accessorKey: "nombre",
        header: "Factura",
        cell: ({ row }: { row: Row<Factura> }) => (
          <span>
            <strong>#</strong>
            {row.original.numeroFactura}
          </span>
        ),
      },
      {
        id: "cliente",
        accessorKey: "cliente",
        header: "Cliente",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "N/A"}</span>
        ),
      },
      {
        id: "fechaEmision",
        accessorKey: "fechaEmision",
        header: "Fecha emision",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>
            {new Date(getValue()).toLocaleDateString("es-DO") ?? "N/A"}
          </span>
        ),
      },
      {
        id: "fechaPago",
        accessorKey: "fechaPago",
        header: "Fecha pago",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>
            {getValue() != null
              ? new Date(getValue()).toLocaleDateString("es-DO")
              : "N/A"}
          </span>
        ),
      },
      {
        id: "monto",
        accessorKey: "monto",
        header: "Monto",
        cell: ({ getValue }: { getValue: () => number }) =>
          new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2,
          }).format(getValue()),
      },
      {
        id: "estado",
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }: { getValue: () => string }) => (
          <div
            className={`px-3 py-1 rounded-full border text-sm font-medium text-center ${getFacturaColor(
              getValue()
            )}`}
          >
            {getValue() ?? "Desconocido"}
          </div>
        ),
      },
      {
        id: "metodoPago",
        accessorKey: "metodoPago",
        header: "Metodo de pago",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue()}</span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }: { row: Row<Factura> }) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`transition-colors duration-200  ${
                row.original.estado != "Reembolsada"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300"
              } action_btn`}
              onClick={() => {
                if (row.original.estado == "Reembolsada") {
                  return;
                }
                EditFactura(row.original.id);
              }}
              style={{
                padding: "8px 16px",
                color: "white",
                borderRadius: "6px",
              }}
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => {
                Impresion(row.original.id);
              }}
              className="transition-colors duration-200 hover:bg-green-500 bg-green-400 action_btn"
              style={{
                padding: "8px 16px",
                color: "white",
                borderRadius: "6px",
              }}
            >
              <LuPrinter />
            </button>
          </div>
        ),
      },
    ];
  }, []);

  function EditFactura(id: number) {
    setLoadintComplete(true);
    apiRequestThen<FacturaDetalle>({
      url: `api/facturas/details/${id}`,
    })
      .then((response) => {
        if (!response.success) {
          return;
        }
        AsingFactura(response.result!);
        modalEditOpen();
      })
      .finally(() => {
        setLoadintComplete(false);
      });
  }

  function Impresion(id: number) {
    setLoadintComplete(true);
    apiRequestThen<FacturaDetalle>({
      url: `api/facturas/details/${id}`,
    })
      .then((response) => {
        if (!response.success) {
          return;
        }
        handlePrintFactura(response.result!);
      })
      .finally(() => {
        setLoadintComplete(false);
      });
  }

  const table = useReactTable<Factura>({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {loadintComplete && <LoaderFun absolute={false} />}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        {/* Header con toggle de columnas */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {data.length} factura{data.length !== 1 ? "s" : ""}
          </span>
          <ColumnVisibilityToggle
            columns={columnConfig}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />
        </div>

        <Drawer isOpen={IsDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
          <FacturacionDetails
            isOpen={IsDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            factura={DetailsFactura}
            isLoading={isLoading}
            btnEdit={btnEdit}
          />
        </Drawer>
        {loader ? (
          <LoadingTable columns={7} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      No hay facturas registradas
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;

                        // Si el click viene de un botón o un hijo con la clase .action_btn, no abrir el modal
                        if (target.closest(".action_btn")) {
                          return;
                        }

                        getData(row.original.id);
                        setIsDetailsOpen(true);
                      }}
                    >
                      {row
                        .getVisibleCells()
                        .map((cell: Cell<Factura, unknown>) => (
                          <td
                            key={cell.id}
                            className="px-4 py-3 text-gray-700 dark:text-gray-300"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {showPag && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Mostrar:</span>
              <Input
                type="number"
                id="size"
                placeholder="5"
                className="max-w-[70px]"
                value={pageSize ?? ""}
                onChange={(e) => {
                  if (e.target.value == "e") {
                    return;
                  }
                  updateSize(parseInt(e.target.value), "PageSize");
                }}
              />
            </div>
            <Pagination
              totalPages={total_pages}
              currentPage={pageNUmber}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
}

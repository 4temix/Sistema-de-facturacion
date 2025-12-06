import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  Cell,
  type VisibilityState,
} from "@tanstack/react-table";
import { GastoList, DataGastoResponse } from "../../Types/Gastos";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Pagination } from "../Inventario/pagination";
import ColumnVisibilityToggle from "../ui/ColumnVisibilityToggle";

type Props = DataGastoResponse & {
  setPage: (page: number) => void;
  pageNumber: number;
  pageSize: number;
  updateSize: (value: string | number | null | undefined, key: string) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function TableGastos({
  data,
  totalPages,
  setPage,
  pageNumber,
  onEdit,
  onDelete,
}: Props) {
  // Estado de visibilidad de columnas - algunas ocultas por defecto
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    comprobante: false,
    metodoPago: false,
    montoPagado: false,
  });

  // Configuración de columnas para el toggle
  const columnConfig = [
    { id: "id", label: "ID" },
    { id: "fecha", label: "Fecha" },
    { id: "tipoGasto", label: "Tipo" },
    { id: "proveedor", label: "Proveedor" },
    { id: "comprobante", label: "Comprobante" },
    { id: "montoTotal", label: "Total" },
    { id: "montoPagado", label: "Pagado" },
    { id: "saldoPendiente", label: "Pendiente" },
    { id: "metodoPago", label: "Método Pago" },
    { id: "estado", label: "Estado" },
    { id: "actions", label: "Acciones" },
  ];

  // Todas las columnas disponibles
  const columns = useMemo(() => {
    return [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }: { getValue: () => number }) => (
          <span className="text-sm font-mono text-gray-500">#{getValue()}</span>
        ),
      },
      {
        id: "fecha",
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ getValue }: { getValue: () => string }) => {
          const fecha = getValue();
          if (!fecha) return <span className="text-gray-400">-</span>;
          return (
            <span className="text-sm">
              {new Date(fecha).toLocaleDateString("es-DO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        id: "tipoGasto",
        accessorKey: "tipoGasto",
        header: "Tipo",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm font-medium truncate max-w-[100px] block">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        id: "proveedor",
        accessorKey: "proveedor",
        header: "Proveedor",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm truncate max-w-[120px] block">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        id: "comprobante",
        accessorKey: "comprobante",
        header: "Comprobante",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm truncate max-w-[100px] block text-gray-600">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        id: "montoTotal",
        accessorKey: "montoTotal",
        header: "Total",
        cell: ({ getValue }: { getValue: () => number }) => (
          <span className="text-sm font-semibold">
            $
            {(getValue() ?? 0).toLocaleString("es-DO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        ),
      },
      {
        id: "montoPagado",
        accessorKey: "montoPagado",
        header: "Pagado",
        cell: ({ getValue }: { getValue: () => number }) => (
          <span className="text-sm font-medium text-green-600">
            $
            {(getValue() ?? 0).toLocaleString("es-DO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        ),
      },
      {
        id: "saldoPendiente",
        accessorKey: "saldoPendiente",
        header: "Pendiente",
        cell: ({ getValue }: { getValue: () => number }) => {
          const pendiente = getValue() ?? 0;
          return (
            <span
              className={`text-sm font-medium ${
                pendiente > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              $
              {pendiente.toLocaleString("es-DO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          );
        },
      },
      {
        id: "metodoPago",
        accessorKey: "metodoPago",
        header: "Método Pago",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm text-gray-600">{getValue() || "-"}</span>
        ),
      },
      {
        id: "estado",
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }: { getValue: () => string }) => {
          const estado = getValue();
          let styles = "bg-gray-100 text-gray-700";
          if (estado?.toLowerCase() === "pagado") {
            styles = "bg-green-50 text-green-700";
          } else if (estado?.toLowerCase() === "pendiente") {
            styles = "bg-red-50 text-red-700";
          } else if (estado?.toLowerCase().includes("parcial")) {
            styles = "bg-amber-50 text-amber-700";
          }
          return (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${styles}`}
            >
              {estado || "-"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: Row<GastoList> }) => (
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors action_btn"
              onClick={() => onEdit(row.original.id)}
              title="Editar"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors action_btn"
              title="Eliminar"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [onEdit, onDelete]);

  const table = useReactTable<GastoList>({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      {/* Header con toggle de columnas */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {data.length} registro{data.length !== 1 ? "s" : ""}
        </span>
        <ColumnVisibilityToggle
          columns={columnConfig}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      </div>

      {/* Tabla con scroll horizontal contenido */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
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
                  No hay gastos registrados
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest(".action_btn")) return;
                    // Click en la fila para ver detalles
                  }}
                >
                  {row
                    .getVisibleCells()
                    .map((cell: Cell<GastoList, unknown>) => (
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

      {/* Paginación */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <span className="text-sm text-gray-500">
          Página {pageNumber} de {totalPages || 1}
        </span>
        <Pagination
          totalPages={totalPages}
          currentPage={pageNumber}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  Cell,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  EmpleadoListItem,
  EmpleadosListResponse,
} from "../../Types/Empleados.types";
import { FiEdit2 } from "react-icons/fi";
import { TbUserCheck, TbUserX } from "react-icons/tb";
import { Pagination } from "../Inventario/pagination";
import ColumnVisibilityToggle from "../ui/ColumnVisibilityToggle";

type Props = EmpleadosListResponse & {
  setPage: (page: number) => void;
  pageNumber: number;
  pageSize: number;
  onEdit: (id: number) => void;
};

export default function TableEmpleados({
  data,
  totalPages,
  setPage,
  pageNumber,
  onEdit,
}: Props) {
  // Estado de visibilidad de columnas
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    email: false,
  });

  // Configuración de columnas para el toggle
  const columnConfig = [
    { id: "id", label: "ID" },
    { id: "nombreCompleto", label: "Nombre" },
    { id: "cedula", label: "Cédula" },
    { id: "telefono", label: "Teléfono" },
    { id: "email", label: "Email" },
    { id: "puesto", label: "Puesto" },
    { id: "activo", label: "Estado" },
    { id: "actions", label: "Acciones" },
  ];

  // Columnas
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
        id: "nombreCompleto",
        accessorFn: (row: EmpleadoListItem) =>
          `${row.nombres} ${row.apellidos}`,
        header: "Nombre",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {getValue()}
          </span>
        ),
      },
      {
        id: "cedula",
        accessorKey: "cedula",
        header: "Cédula",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm font-mono text-gray-600">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        id: "telefono",
        accessorKey: "telefono",
        header: "Teléfono",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm text-gray-600">{getValue() || "-"}</span>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm text-gray-600 truncate max-w-[180px] block">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        id: "puesto",
        accessorKey: "puesto",
        header: "Puesto",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        id: "activo",
        accessorKey: "activo",
        header: "Estado",
        cell: ({ getValue }: { getValue: () => boolean }) => {
          const activo = getValue();
          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                activo ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {activo ? (
                <>
                  <TbUserCheck className="w-3.5 h-3.5" /> Activo
                </>
              ) : (
                <>
                  <TbUserX className="w-3.5 h-3.5" /> Inactivo
                </>
              )}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: Row<EmpleadoListItem> }) => (
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors action_btn"
              onClick={() => onEdit(row.original.id)}
              title="Editar"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [onEdit]);

  const table = useReactTable<EmpleadoListItem>({
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
          {data.length} empleado{data.length !== 1 ? "s" : ""}
        </span>
        <ColumnVisibilityToggle
          columns={columnConfig}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      </div>

      {/* Tabla */}
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
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {row
                    .getVisibleCells()
                    .map((cell: Cell<EmpleadoListItem, unknown>) => (
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

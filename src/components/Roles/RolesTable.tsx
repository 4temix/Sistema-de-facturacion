import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { RoleAccess } from "../../Types/Roles.types";

type RolesTableProps = {
  data: RoleAccess[];
  loading?: boolean;
  onEdit: (role: RoleAccess) => void;
  onDelete: (role: RoleAccess) => void;
};

function getMenuAccessTags(row: RoleAccess): string[] {
  return row.menuAccess
    .filter((item) => item.activo)
    .map((item) => {
      const permNames = item.permisos
        .filter((p) => p.activo)
        .map((p) => p.nombrePermiso);
      return permNames.length > 0
        ? `${item.text} (${permNames.join(", ")})`
        : item.text;
    });
}

export default function RolesTable({
  data,
  loading = false,
  onEdit,
  onDelete,
}: RolesTableProps) {
  const columns = useMemo<ColumnDef<RoleAccess, unknown>[]>(
    () => [
      {
        id: "role",
        accessorKey: "role",
        header: "Rol",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {String(getValue() ?? "—")}
          </span>
        ),
      },
      {
        id: "menuAccess",
        accessorFn: getMenuAccessTags,
        header: "Acceso al menú",
        cell: ({ getValue }) => {
          const tags = (getValue() ?? []) as string[];
          if (tags.length === 0)
            return <span className="text-gray-500">—</span>;
          return (
            <div className="flex flex-wrap gap-1 max-w-md">
              {tags.map((text, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  {text}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.original);
              }}
              title="Editar"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original);
              }}
              title="Eliminar"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  });

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center text-gray-500">
        Cargando roles...
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {data.length} {data.length === 1 ? "rol" : "roles"}
        </span>
      </div>
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
                      header.getContext(),
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
                  No hay roles registrados
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-gray-700 dark:text-gray-300 align-top"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

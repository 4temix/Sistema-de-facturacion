import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  Cell,
  type VisibilityState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { FiEdit2 } from "react-icons/fi";
import ColumnVisibilityToggle from "../ui/ColumnVisibilityToggle";
import Drawer from "../ui/modal/Drawer";

import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { Estado, Rol, User } from "../../Types/Usuario";

type Props = {
  data: User[];
  setPage: (page: number) => void;
  pageNumber: number;
  pageSize: number;
  onEdit: (id: number) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
};

// Valor por defecto para visibilidad de columnas
const defaultColumnVisibility: VisibilityState = {
  id: false,
  email: false,
};

// Estado inicial para detalles de empleado
const initialEmpleadoDetails: User = {
  id: 0,
  username: "",
  realName: "",
  lastName: "",
  teNumber: "",
  email: "",
  about: "",
  compName: "",
  rol: {} as Rol,
  estado: {} as Estado,
  fechaCreacion: "",
  address: "",
  userImage: null,
};

export default function TableUsers({
  data,
  onEdit,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange: onColumnVisibilityChangeProp,
}: Props) {
  // Estado interno para cuando no se pasan las props
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>(defaultColumnVisibility);

  // Usar props si se pasan, sino usar estado interno
  const columnVisibility = columnVisibilityProp ?? internalColumnVisibility;
  const onColumnVisibilityChange =
    onColumnVisibilityChangeProp ?? setInternalColumnVisibility;

  // Estado para el drawer de detalles
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [empleadoDetails, setEmpleadoDetails] = useState<User>(
    initialEmpleadoDetails,
  );

  // Función para cargar los detalles del empleado
  function loadEmpleadoDetails(id: number) {
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);

    apiRequestThen<User>({
      url: `api/empleados/get-empleado/${id}`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        if (response.result) {
          setEmpleadoDetails(response.result);
        }
      })
      .finally(() => {
        setIsLoadingDetails(false);
      });
  }

  // Configuración de columnas para el toggle
  const columnConfig = [
    { id: "id", label: "ID" },
    { id: "realName", label: "Nombre" },
    { id: "rol", label: "Role" },
    { id: "teNumber", label: "Teléfono" },
    { id: "email", label: "Email" },
    { id: "estado", label: "Estado" },
    { id: "compName", label: "Nombre de compañia" },
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
        id: "realName",
        accessorFn: (row: User) => `${row.realName} ${row.lastName}`,
        header: "Nombre",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {getValue()}
          </span>
        ),
      },
      {
        id: "compName",
        accessorKey: "compName",
        header: "compañia",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="text-sm font-mono text-gray-600">
            {getValue() || "-"}
          </span>
        ),
      },
      {
        id: "teNumber",
        accessorKey: "teNumber",
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
        id: "rol",
        accessorKey: "rol",
        header: "Role",
        cell: ({ getValue }: { getValue: () => Rol }) => (
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
            {getValue().nombre || "-"}
          </span>
        ),
      },
      {
        id: "estado",
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }: { getValue: () => Estado }) => {
          const activo = getValue().nombre;
          return (
            <div
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${
                activo
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-red-100 text-red-800 border-red-300"
              }`}
            >
              {activo}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }: { row: Row<User> }) => (
          <div className="flex items-center gap-2">
            <button
              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.original.id);
              }}
              title="Editar"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [onEdit]);

  const table = useReactTable<User>({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Header con toggle de columnas */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {data.length} empleado{data.length !== 1 ? "s" : ""}
        </span>
        <ColumnVisibilityToggle
          columns={columnConfig}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      </div>

      {/* Drawer de detalles */}
      <Drawer isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        {/* <EmpleadoDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          empleado={empleadoDetails}
          isLoading={isLoadingDetails}
          onEditar={(id) => {
            setIsDetailsOpen(false);
            onEdit(id);
          }}
        /> */}
        <></>
      </Drawer>

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
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => loadEmpleadoDetails(row.original.id)}
                >
                  {row.getVisibleCells().map((cell: Cell<User, unknown>) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-gray-700 dark:text-gray-300"
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

      {/* Paginación */}
      {/* <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <span className="text-sm text-gray-500">
          Página {pageNumber} de {totalPages || 1}
        </span>
        <Pagination
          totalPages={totalPages}
          currentPage={pageNumber}
          onPageChange={setPage}
        />
      </div> */}
    </div>
  );
}

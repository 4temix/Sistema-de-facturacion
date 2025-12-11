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
import {
  EmpleadoListItem,
  EmpleadosListResponse,
  EmpleadoDetailsDto,
} from "../../Types/Empleados.types";
import { FiEdit2 } from "react-icons/fi";
import { TbUserCheck, TbUserX } from "react-icons/tb";
import { Pagination } from "../Inventario/pagination";
import ColumnVisibilityToggle from "../ui/ColumnVisibilityToggle";
import Drawer from "../ui/modal/Drawer";
import EmpleadoDetails from "./EmpleadoDetails";
import { apiRequestThen } from "../../Utilities/FetchFuntions";

type Props = EmpleadosListResponse & {
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
const initialEmpleadoDetails: EmpleadoDetailsDto = {
  id: 0,
  nombres: "",
  apellidos: "",
  cedula: "",
  telefono: "",
  email: "",
  provincia: "",
  municipio: "",
  direccion: "",
  fechaIngreso: "",
  puesto: "",
  tipoContrato: "",
  salarioBase: 0,
  banco: "",
  cuentaBancaria: "",
};

export default function TableEmpleados({
  data,
  totalPages,
  setPage,
  pageNumber,
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
  const [empleadoDetails, setEmpleadoDetails] = useState<EmpleadoDetailsDto>(
    initialEmpleadoDetails
  );

  // Función para cargar los detalles del empleado
  function loadEmpleadoDetails(id: number) {
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);

    apiRequestThen<EmpleadoDetailsDto>({
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
            <div
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${
                activo 
                  ? "bg-green-100 text-green-800 border-green-300" 
                  : "bg-red-100 text-red-800 border-red-300"
              }`}
            >
              {activo ? (
                <>
                  <TbUserCheck className="w-4 h-4" /> Activo
                </>
              ) : (
                <>
                  <TbUserX className="w-4 h-4" /> Inactivo
                </>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }: { row: Row<EmpleadoListItem> }) => (
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

  const table = useReactTable<EmpleadoListItem>({
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
        <EmpleadoDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          empleado={empleadoDetails}
          isLoading={isLoadingDetails}
          onEditar={(id) => {
            setIsDetailsOpen(false);
            onEdit(id);
          }}
        />
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => loadEmpleadoDetails(row.original.id)}
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

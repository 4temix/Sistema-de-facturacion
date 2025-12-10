import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  Cell,
  type VisibilityState,
} from "@tanstack/react-table";
import { DataRequest, Producto, Selects } from "../../Types/ProductTypes";
import { TrashBinIcon, PencilIcon } from "../../icons";
import { Pagination } from "./pagination";
import Input from "../form/input/InputField";
import { useNavigate } from "react-router";
import EditProducto from "./EditProducto";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import ColumnVisibilityToggle from "../ui/ColumnVisibilityToggle";

type internalProps = DataRequest & {
  setPage: (page: number) => void;
  pageNUmber: number;
  pageSize?: number;
  selects: Selects;
  updateSize: (value: number, key: string) => void;
  onUpdateSuccess?: () => void;
};

type idActual = {
  id: number;
  refreshKey: string;
};

export default function PropertyDataTable({
  data,
  total_pages,
  setPage,
  pageNUmber,
  pageSize,
  updateSize,
  selects,
  onUpdateSuccess,
}: internalProps) {
  const route = useNavigate();

  const [idUpdate, setIdUpdate] = useState<idActual>({ id: 0, refreshKey: "" });

  const { isOpen, openModal, closeModal } = useModal();

  // Estado de visibilidad de columnas
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    porsentaje: false,
    categoria: false,
    estado: false,
  });

  // Configuración de columnas para el toggle
  const columnConfig = [
    { id: "nombre", label: "Producto" },
    { id: "marca", label: "Marca" },
    { id: "porsentaje", label: "Margen (%)" },
    { id: "categoria", label: "Categoría" },
    { id: "estado", label: "Estado" },
    { id: "precioCompra", label: "Precio Compra" },
    { id: "precioVenta", label: "Precio Venta" },
    { id: "stockActual", label: "Stock" },
    { id: "actions", label: "Acciones" },
  ];

  // Columnas
  const columns = useMemo(() => {
    return [
      {
        id: "nombre",
        accessorKey: "nombre",
        header: "Producto",
        cell: ({ row }: { row: Row<Producto> }) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>{row.original.nombre}</strong>
            <small className="text-gray-500">
              Código: {row.original.codigo}
            </small>
          </div>
        ),
      },
      {
        id: "marca",
        accessorKey: "marca",
        header: "Marca",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "N/A"}</span>
        ),
      },
      {
        id: "porsentaje",
        accessorKey: "porsentaje",
        header: "Margen (%)",
        cell: ({ getValue }: { getValue: () => string }) => {
          const porsentaje = Math.round(parseFloat(getValue()) * 100) / 100;
          return (
            <span
              className={
                porsentaje > 0
                  ? "text-green-500"
                  : porsentaje < 0
                  ? "text-error-600"
                  : ""
              }
            >
              {typeof porsentaje === "number" && !isNaN(porsentaje)
                ? porsentaje
                : "N/A"}
            </span>
          );
        },
      },
      {
        id: "categoria",
        accessorKey: "categoria",
        header: "Categoría",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "Sin categoría"}</span>
        ),
      },
      {
        id: "estado",
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "Sin estado"}</span>
        ),
      },
      {
        id: "precioCompra",
        accessorKey: "precioCompra",
        header: "Precio de compra",
        cell: ({ getValue }: { getValue: () => number }) =>
          new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2,
          }).format(getValue()),
      },
      {
        id: "precioVenta",
        accessorKey: "precioVenta",
        header: "Precio de venta",
        cell: ({ getValue }: { getValue: () => number }) =>
          new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2,
          }).format(getValue()),
      },
      {
        id: "stockActual",
        accessorKey: "stockActual",
        header: "Stock actual",
        cell: ({ getValue }: { getValue: () => number }) => {
          const stock = getValue();
          return (
            <span
              className={`font-medium ${
                stock === 0
                  ? "text-red-600"
                  : stock <= 5
                  ? "text-amber-600"
                  : ""
              }`}
            >
              {stock}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }: { row: Row<Producto> }) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="transition-colors duration-200 hover:bg-[#1642a1] bg-[#2563eb] action_btn"
              onClick={() => {
                setIdUpdate({
                  id: row.original.id,
                  refreshKey: Date.now().toString(),
                });
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
              onClick={() => alert(`Eliminar ${row.original.nombre}`)}
              className="transition-colors duration-200 hover:bg-[#a52424] bg-[#dc2626] action_btn"
              style={{
                padding: "8px 16px",
                color: "white",
                borderRadius: "6px",
              }}
            >
              <TrashBinIcon />
            </button>
          </div>
        ),
      },
    ];
  }, []);

  useEffect(() => {
    if (idUpdate?.id != 0) {
      openModal();
    }
  }, [idUpdate]);

  const table = useReactTable<Producto>({
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
      <div className="mt-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        {/* Header con toggle de columnas */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {data.length} producto{data.length !== 1 ? "s" : ""}
          </span>
          <ColumnVisibilityToggle
            columns={columnConfig}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />
        </div>t

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
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;

                      if (target.closest(".action_btn")) {
                        return;
                      }
                      route(`${row.original.id}`);
                    }}
                  >
                    {row
                      .getVisibleCells()
                      .map((cell: Cell<Producto, unknown>) => (
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
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        CloseClickBanner={false}
        className="max-w-[1200px] m-4 p-5"
      >
        <section
          className="overflow-y-scroll max-h-[90vh] [&::-webkit-scrollbar]:w-2 
                 [&::-webkit-scrollbar-track]:bg-gray-200 
                 [&::-webkit-scrollbar-thumb]:bg-blue-500 
                 [&::-webkit-scrollbar-thumb]:rounded-full 
                 [&::-webkit-scrollbar-thumb:hover]:bg-blue-600"
        >
          <EditProducto
            selectsData={selects}
            id={idUpdate.id}
            closeModal={closeModal}
            onSuccess={onUpdateSuccess}
          />
        </section>
      </Modal>
    </>
  );
}

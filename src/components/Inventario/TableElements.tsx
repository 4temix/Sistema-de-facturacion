import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Row,
  Cell,
} from "@tanstack/react-table";
import { Producto } from "../../Types/ProductTypes";
import { TrashBinIcon, PencilIcon } from "../../icons";

type DataFn = {
  data: Producto[];
};

export default function PropertyDataTable({ data }: DataFn) {
  // Columnas
  const columns = useMemo(() => {
    return [
      {
        accessorKey: "nombre",
        header: "Producto",
        cell: ({ row }: { row: Row<Producto> }) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>{row.original.nombre}</strong>
            <small>Código: {row.original.codigo}</small>
          </div>
        ),
      },
      {
        accessorKey: "marca",
        header: "Marca",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "N/A"}</span>
        ),
      },
      {
        accessorKey: "categoria",
        header: "Categoría",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "Sin categoría"}</span>
        ),
      },
      {
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
        accessorKey: "stockActual",
        header: "Stock actual",
        cell: ({ getValue }: { getValue: () => number }) => (
          <span>{getValue()}</span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }: { row: Row<Producto> }) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="transition-colors duration-200 hover:bg-[#1642a1] bg-[#2563eb]"
              onClick={() => alert(`Editar ${row.original.nombre}`)}
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
              className="transition-colors duration-200 hover:bg-[#a52424] bg-[#dc2626]"
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

  const table = useReactTable<Producto>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-8 overflow-x-scroll">
      <table className="border-collapse w-[100%]">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b-[1px] border-solid borde-b-[#ccc] p-4 text-left"
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
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="transition-colors duration-200 hover:bg-gray-200 cursor-pointer"
            >
              {row.getVisibleCells().map((cell: Cell<Producto, unknown>) => (
                <td
                  key={cell.id}
                  className="p-4 border-b-[1px] border-solid borde-b-[#ccc]"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

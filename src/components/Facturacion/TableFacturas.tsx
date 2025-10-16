import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Row,
  Cell,
} from "@tanstack/react-table";
import { DataRequest, Producto } from "../../Types/ProductTypes";
import { TrashBinIcon, PencilIcon } from "../../icons";
import { Pagination } from "./pagination";
import Input from "../form/input/InputField";
import { number } from "yup";

type internalProps = DataRequest & {
  setPage: (page: number) => void;
  pageNUmber: number;
  pageSize?: number;
  updateSize: (value: number, key: string) => void;
};

export default function TableFacturas({
  data,
  total_pages,
  setPage,
  pageNUmber,
  pageSize,
  updateSize,
}: internalProps) {
  // Columnas
  const columns = useMemo(() => {
    return [
      {
        accessorKey: "nombre",
        header: "Factura",
        cell: ({ row }: { row: Row<Producto> }) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>#{row.original.nombre}</strong>
            <small>Código: {row.original.codigo}</small>
          </div>
        ),
      },
      {
        accessorKey: "marca",
        header: "Cliente",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "N/A"}</span>
        ),
      },
      {
        accessorKey: "porsentaje",
        header: "Fecha",
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
        accessorKey: "categoria",
        header: "Monto",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "Sin categoría"}</span>
        ),
      },
      {
        accessorKey: "precioVenta",
        header: "Estado",
        cell: ({ getValue }: { getValue: () => number }) =>
          new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2,
          }).format(getValue()),
      },
      {
        accessorKey: "stockActual",
        header: "Metodo de pago",
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
    <>
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
      <div className="flex justify-end">
        <Input
          type="number"
          id="size"
          placeholder="Ej: 18"
          className="max-w-[100px] mr-12"
          value={pageSize ?? ""}
          onChange={(e) => {
            if (e.target.value == "e") {
              return;
            }
            updateSize(parseInt(e.target.value), "PageSize");
          }}
        />
        <Pagination
          totalPages={total_pages}
          currentPage={pageNUmber}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}

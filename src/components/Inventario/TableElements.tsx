import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Row,
  Cell,
} from "@tanstack/react-table";

// Tipo de datos
type PropertyType = {
  id: number;
  titulo: string;
  ciudad: string;
  estado: string;
  precio: number;
  imagenes: { url: string }[];
  estadoPropiedad: string;
};

// Datos de prueba
const mockData: PropertyType[] = [
  {
    id: 1,
    titulo: "Casa Bonita",
    ciudad: "Santo Domingo",
    estado: "RD",
    precio: 150000,
    imagenes: [{ url: "https://via.placeholder.com/100" }],
    estadoPropiedad: "Pending",
  },
  {
    id: 2,
    titulo: "Apartamento Moderno",
    ciudad: "Santiago",
    estado: "RD",
    precio: 85000,
    imagenes: [{ url: "https://via.placeholder.com/100" }],
    estadoPropiedad: "Verified",
  },
  {
    id: 3,
    titulo: "Villa Lujo",
    ciudad: "Punta Cana",
    estado: "RD",
    precio: 250000,
    imagenes: [{ url: "https://via.placeholder.com/100" }],
    estadoPropiedad: "Completed",
  },
];

export default function PropertyDataTable() {
  const [data, setData] = useState<PropertyType[]>(mockData);

  // Columnas
  const columns = useMemo(() => {
    return [
      {
        accessorKey: "titulo",
        header: "Listing Title",
        cell: ({ row }: { row: Row<PropertyType> }) => (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={row.original.imagenes[0]?.url || "/noImage.png"}
              alt={row.original.titulo}
              width={60}
              height={60}
            />
            <div>
              <p>{row.original.titulo}</p>
              <small>
                {row.original.estado} / {row.original.ciudad}
              </small>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "precio",
        header: "Price",
        cell: ({ getValue }: { getValue: () => number }) =>
          `$${getValue().toLocaleString("en-US")}`,
      },
      {
        accessorKey: "estadoPropiedad",
        header: "Status",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue()}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: Row<PropertyType> }) => (
          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={() => alert(`Edit ${row.original.titulo}`)}
              style={{ padding: "2px 6px" }}
            >
              Edit
            </button>
            <button
              onClick={() => alert(`Delete ${row.original.titulo}`)}
              style={{ padding: "2px 6px" }}
            >
              Delete
            </button>
          </div>
        ),
      },
    ];
  }, []);

  const table = useReactTable<PropertyType>({
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
            <tr key={row.id}>
              {row
                .getVisibleCells()
                .map((cell: Cell<PropertyType, unknown>) => (
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

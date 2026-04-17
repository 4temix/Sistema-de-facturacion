# TanStack Table y tablas con visor de columnas

- **Librería**: `@tanstack/react-table`. Todas las tablas de datos usan TanStack.
- **Contenedor**: `DataTable` de `src/components/ui/DataTable.tsx` con `data`, `columns`, `columnConfig`, y opcionales `emptyMessage`, `onRowClick`, `getRowId`, `countLabel`, visibilidad de columnas y **`pagination`** opcional (barra simple integrada; ver abajo).
- **Columnas**: `useMemo<ColumnDef<T, unknown>[]>(() => [...], [deps])`. Cada columna: `id`, `header`, `accessorKey` y/o `cell`. Columna acciones: `id: "actions"`, `header: ""`, botón en cell (DataTable hace stopPropagation en "actions").
- **columnConfig**: Array `{ id: string; label: string }` en el mismo orden que las columnas; los ids coinciden con los de las columnas. Lo usa el visor de columnas integrado en DataTable.

### Paginación del lado del servidor (lista paginada)

- Si los datos vienen **por página** desde la API (`Page`, `Limit`, `total`/`pages`), **no** pagines dentro de TanStack: la tabla solo muestra la página actual.

#### Patrón recomendado (igual que productos admin)

Para el mismo UX que **`ProductsAdmin`** (`src/components/ProductsAdmin/index.tsx` + `src/pages/ProductsAdmin.tsx`):

1. Estado con **`usePagination`** (`src/hooks/usePagination.ts`): `page`, `setPage`, `limit`, `setLimitAndReset`, `goToFirstPage`.
2. El **`fetch`** usa `page` y `limit` en la query al backend; guarda `total` y `totalPages` (o `pages`) de la respuesta.
3. Debajo de la tabla (no dentro del `DataTable`), renderiza **`PaginationControls`** (`src/components/ui/PaginationControls.tsx`):
   - Muestra **total** de registros (“N elementos en total”), selector **Por página** (10 / 20 / 50), texto **Página X de Y** (números en negrita) y flechas anterior/siguiente.
4. La tabla puede recibir **`loading`** y mostrar un **spinner** en un contenedor con borde (como `ProductsTable`), mientras `PaginationControls` recibe `disabled={loading}`.
5. Si al cambiar filtros debe volver a la primera página: `goToFirstPage()` o `setLimitAndReset` ya reinician según el hook.
6. Opcional: si `page > totalPages` tras un fetch, ajustar `page` a `totalPages` (ver efecto en `ProductsAdmin`).

**Ejemplo de estructura en la página:**

```tsx
import PaginationControls from "../ui/PaginationControls";
import { usePagination } from "../../hooks/usePagination";

const { page, setPage, limit, setLimitAndReset, goToFirstPage } = usePagination({
  initialPage: 1,
  initialLimit: 10,
});

// fetch con page, limit → setData, setTotal, setTotalPages

<div className="flex flex-col gap-4">
  <MiTable data={data} loading={loading} ... />
  <PaginationControls
    page={page}
    totalPages={totalPages}
    total={total}
    limit={limit}
    onPageChange={setPage}
    onLimitChange={setLimitAndReset}
    disabled={loading}
    itemLabel={(n) => (n === 1 ? "ítem" : "ítems")}
  />
</div>
```

Referencias reales: **`ProductsAdmin`** / `ProductsTable`; **`AdminOrdersListPage`** / `AdminOrdersTable` (`admin_orders`).

#### Alternativa: barra simple dentro de `DataTable`

- Prop opcional **`pagination`**, tipo **`DataTablePagination`** exportado desde `DataTable.tsx` (`pageNumber`, `totalPages`, `onPageChange`, `disabled?`).
- Útil si no necesitas selector de tamaño de página ni el mismo layout que `PaginationControls`; la barra va **pegada** al borde inferior de la tabla.

### Código de referencia: DataTable (src/components/ui/DataTable.tsx) – uso de tabla y visor

```tsx
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef, type VisibilityState, type OnChangeFn, type Cell } from "@tanstack/react-table";
import ColumnVisibilityToggle, { type ColumnConfig } from "./ColumnVisibilityToggle";

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  columnConfig: ColumnConfig[];
  defaultColumnVisibility?: VisibilityState;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string;
  countLabel?: (n: number) => string;
  pagination?: DataTablePagination;
};

export default function DataTable<T>({
  data, columns, columnConfig,
  defaultColumnVisibility = {},
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange: onColumnVisibilityChangeProp,
  emptyMessage = "No hay registros", onRowClick, getRowId,
  countLabel = (n) => (n === 1 ? "registro" : "registros"),
  pagination,
}: DataTableProps<T>) {
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility);
  const columnVisibility = columnVisibilityProp ?? internalColumnVisibility;
  const onColumnVisibilityChange = onColumnVisibilityChangeProp ?? setInternalColumnVisibility;

  const table = useReactTable<T>({
    data, columns,
    state: { columnVisibility },
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ? (originalRow: T) => getRowId(originalRow) : undefined,
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="... border-b border-slate-200 bg-slate-50">
        <span>{rowCount} {countLabel(rowCount)}</span>
        <ColumnVisibilityToggle
          columns={columnConfig}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      </div>
      <table>...</table>
      {/* rows: row.getVisibleCells().map(cell => ... flexRender(cell.column.columnDef.cell, cell.getContext()) ...) */}
      {/* onClick en td: if (cell.column.id === "actions") e.stopPropagation() */}
      {pagination && (
        <div className="... border-t ...">
          {/* Página {pagination.pageNumber} de {pagination.totalPages}; botones Anterior / Siguiente */}
        </div>
      )}
    </div>
  );
}
```

### Código de referencia: ColumnVisibilityToggle (src/components/ui/ColumnVisibilityToggle.tsx)

```tsx
import type { VisibilityState } from '@tanstack/react-table'

export type ColumnConfig = { id: string; label: string }

export default function ColumnVisibilityToggle({ columns, columnVisibility, onColumnVisibilityChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setIsOpen((o) => !o)} ...>
        <FiColumns size={16} /> Columnas
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 py-2 w-48 ...">
          {columns.map((col) => {
            const isVisible = columnVisibility[col.id] !== false
            return (
              <label key={col.id} className="flex items-center gap-2 px-3 py-2.5 ...">
                <input type="checkbox" checked={isVisible}
                  onChange={() => onColumnVisibilityChange((prev) => ({ ...prev, [col.id]: !isVisible }))} />
                {col.label}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

### Código de referencia: tabla de reservas (columnConfig + columns + DataTable)

```tsx
// src/components/Reservaciones/ReservationsTable.tsx
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/DataTable";
import Button from "../Button";

const columnConfig = [
  { id: "customerName", label: "Cliente" },
  { id: "date", label: "Fecha" },
  { id: "timeRange", label: "Horario" },
  { id: "status", label: "Estado" },
  { id: "tables", label: "Mesas" },
  { id: "roomNumber", label: "Habitación" },
  { id: "email", label: "Email" },
  { id: "actions", label: "" },
];

export default function ReservationsTable({ data, loading, onEdit, onRowClick }) {
  const columns = useMemo<ColumnDef<ReservationItem, unknown>[]>(() => [
    {
      id: "customerName",
      accessorKey: "customerName",
      header: "Cliente",
      cell: ({ getValue }) => (
        <span className="font-medium text-slate-800">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      id: "date",
      accessorKey: "startTime",
      header: "Fecha",
      cell: ({ getValue }) => {
        const v = getValue();
        return (
          <span className="text-slate-600 whitespace-nowrap">
            {v ? new Date(String(v)).toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
          </span>
        );
      },
    },
    {
      id: "timeRange",
      header: "Horario",
      cell: ({ row }) => {
        const r = row.original;
        const start = r.startTime ? new Date(r.startTime) : null;
        const end = r.endTime ? new Date(r.endTime) : null;
        if (!start || !end) return <span className="text-slate-400">—</span>;
        return (
          <span className="text-slate-600 whitespace-nowrap">
            {start.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })} – {end.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      },
    },
    { id: "status", accessorKey: "status", header: "Estado", cell: ({ getValue }) => <span className="text-slate-600 capitalize">{String(getValue() ?? "—")}</span> },
    {
      id: "tables",
      header: "Mesas",
      cell: ({ row }) => {
        const r = row.original;
        if (r.tables?.length) return <span className="text-slate-600">{r.tables.map((t) => t.name).join(", ")}</span>;
        return <span className="text-slate-400">—</span>;
      },
    },
    { id: "roomNumber", accessorKey: "roomNumber", header: "Habitación", cell: ({ getValue }) => <span className="text-slate-600">{getValue() != null ? String(getValue()) : "—"}</span> },
    { id: "email", accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-slate-600 truncate max-w-[180px] block">{String(getValue() ?? "—")}</span> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        onEdit ? (
          <Button type="button" variant="ghost" className="!py-1.5 !px-2" onClick={() => onEdit(row.original)} aria-label="Editar">
            <FiEdit2 size={18} />
          </Button>
        ) : null,
    },
  ], [onEdit]);

  return (
    <DataTable<ReservationItem>
      data={data}
      columns={columns}
      columnConfig={columnConfig}
      emptyMessage="No hay reservas"
      getRowId={(row) => String(row.id)}
      countLabel={(n) => (n === 1 ? "reserva" : "reservas")}
      onRowClick={onRowClick}
    />
  );
}
```

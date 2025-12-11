import { useState, useRef, useEffect } from "react";
import { TbColumns3, TbCheck } from "react-icons/tb";
import type { VisibilityState, OnChangeFn } from "@tanstack/react-table";

type ColumnConfig = {
  id: string;
  label: string;
};

type Props = {
  columns: ColumnConfig[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
};

export default function ColumnVisibilityToggle({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (columnId: string) => {
    const currentVisibility = columnVisibility[columnId] !== false;
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnId]: !currentVisibility,
    });
  };

  const isColumnVisible = (columnId: string) => {
    return columnVisibility[columnId] !== false;
  };

  const visibleCount = columns.filter((col) => isColumnVisible(col.id)).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <TbColumns3 className="w-4 h-4" />
        <span>Columnas</span>
        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded dark:bg-blue-900 dark:text-blue-300">
          {visibleCount}/{columns.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[9999] mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700" style={{ position: 'absolute' }}>
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mostrar columnas
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {columns.map((column) => (
              <button
                key={column.id}
                type="button"
                onClick={() => toggleColumn(column.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {column.label}
                </span>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    isColumnVisible(column.id)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isColumnVisible(column.id) && (
                    <TbCheck className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const allVisible: VisibilityState = {};
                columns.forEach((col) => {
                  allVisible[col.id] = true;
                });
                onColumnVisibilityChange(allVisible);
              }}
              className="flex-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              Mostrar todas
            </button>
            <button
              type="button"
              onClick={() => {
                const allHidden: VisibilityState = {};
                columns.forEach((col) => {
                  allHidden[col.id] = false;
                });
                // Siempre mantener acciones visible
                allHidden["actions"] = true;
                onColumnVisibilityChange(allHidden);
              }}
              className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Ocultar todas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


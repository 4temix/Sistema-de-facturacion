import { PaginationProps } from "../../Types/ProductTypes";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 4,
  className = "",
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages + 2) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con "..."
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(2, currentPage - halfVisible);
      let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

      // Ajustar si estamos cerca del inicio
      if (currentPage <= halfVisible + 1) {
        endPage = maxVisiblePages;
      }

      // Ajustar si estamos cerca del final
      if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      // Siempre mostrar primera página
      pages.push(1);

      // Añadir "..." después de la primera página si es necesario
      if (startPage > 2) {
        pages.push("...");
      }

      // Añadir páginas del medio
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      // Añadir "..." antes de la última página si es necesario
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Siempre mostrar última página
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botón Primera Página */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Primera página"
        >
          {"<<"}
        </button>
      )}

      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Página anterior"
      >
        {"<"}
      </button>

      {/* Números de Página */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === "..." ? (
            <div key={`ellipsis-${index}`} className="px-2 py-2">
              {"..."}
            </div>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[10px] px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Página siguiente"
      >
        {">"}
      </button>

      {/* Botón Última Página */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Última página"
        >
          {">>"}
        </button>
      )}
    </div>
  );
}

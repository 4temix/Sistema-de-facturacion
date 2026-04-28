import { useState, useEffect, useMemo } from "react";
import { PaginationProps } from "../../Types/ProductTypes";

const NARROW_QUERY = "(max-width: 640px)";

function buildPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number,
): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisiblePages + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  const halfVisible = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(2, currentPage - halfVisible);
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

  if (currentPage <= halfVisible + 1) {
    endPage = maxVisiblePages;
  }

  if (currentPage >= totalPages - halfVisible) {
    startPage = totalPages - maxVisiblePages + 1;
  }

  pages.push(1);

  if (startPage > 2) {
    pages.push("...");
  }

  for (let i = startPage; i <= endPage; i++) {
    if (i > 1 && i < totalPages) {
      pages.push(i);
    }
  }

  if (endPage < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = "",
}: PaginationProps) {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const effectiveMax = isNarrow ? Math.min(3, maxVisiblePages) : maxVisiblePages;

  const pages = useMemo(
    () =>
      totalPages < 1
        ? []
        : buildPageNumbers(currentPage, totalPages, effectiveMax),
    [currentPage, totalPages, effectiveMax],
  );

  if (totalPages < 1) {
    return null;
  }

  const btnNav =
    "shrink-0 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-md sm:rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm leading-none";

  const btnPage = (active: boolean) =>
    `shrink-0 min-h-9 min-w-9 sm:min-w-[36px] px-1.5 sm:px-2 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors ${
      active
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
    }`;

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 w-full max-w-full min-w-0 ${className}`}
    >
      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${btnNav} hidden sm:inline-flex`}
          title="Primera página"
        >
          {"<<"}
        </button>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={btnNav}
        title="Página anterior"
      >
        {"<"}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 max-w-full min-w-0">
        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 py-1.5 text-gray-500 text-xs sm:text-sm select-none"
            >
              …
            </span>
          ) : (
            <button
              type="button"
              key={page}
              onClick={() => onPageChange(page as number)}
              className={btnPage(currentPage === page)}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={btnNav}
        title="Página siguiente"
      >
        {">"}
      </button>

      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${btnNav} hidden sm:inline-flex`}
          title="Última página"
        >
          {">>"}
        </button>
      )}
    </div>
  );
}

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

/**
 * Sincroniza un panel lateral con un parámetro en la query string.
 * Al abrir se añade una entrada al historial; el botón atrás del móvil solo elimina el parámetro y cierra el panel.
 */
export function useDrawerSearchParam(paramKey: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const drawerId = useMemo(() => {
    const v = searchParams.get(paramKey);
    return v != null && v !== "" ? v : null;
  }, [searchParams, paramKey]);

  const openDrawer = useCallback(
    (id: string | number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(paramKey, String(id));
          return next;
        },
        { replace: false },
      );
    },
    [paramKey, setSearchParams],
  );

  const closeDrawer = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(paramKey);
        return next;
      },
      { replace: true },
    );
  }, [paramKey, setSearchParams]);

  return {
    drawerId,
    isDrawerOpen: drawerId !== null,
    openDrawer,
    closeDrawer,
  };
}

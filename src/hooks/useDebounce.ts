import { useEffect, useState } from "react";

/**
 * Hook que devuelve un valor "debounceado" después de cierto tiempo sin cambios.
 * @param value Valor a controlar
 * @param delay Milisegundos de espera (por defecto 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Si el valor cambia antes de cumplirse el delay, limpia el timeout
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Convierte fechas de formulario (solo día `Y-m-d` desde Flatpickr o `<input type="date">`)
 * a ISO 8601 en UTC, para que System.Text.Json / Npgsql mapeen bien a `timestamptz`.
 *
 * Una cadena solo-fecha provoca `DateTimeKind.Unspecified` en el servidor; hay que enviar instante UTC explícito.
 */
export function toUtcIsoFromDateInput(
  value: string | undefined | null,
): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  if (s === "") return undefined;

  if (s.includes("T")) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return `${s}T00:00:00.000Z`;
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

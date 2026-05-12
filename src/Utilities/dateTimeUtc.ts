/**
 * El backend envía instantes en UTC sin sufijo `Z`. Se interpretan como UTC
 * y se muestran en hora local del navegador.
 */

/** ISO 8601 con zona explícita o, si no hay zona, se asume UTC (añade `Z`). */
export function parseUtcIsoFromApi(
  iso: string | null | undefined,
): Date | null {
  if (iso == null || typeof iso !== "string") return null;
  const t = iso.trim();
  if (!t) return null;
  const hasTz = /([zZ]|[+-]\d{2}:?\d{2})$/.test(t);
  const normalized = hasTz ? t : `${t}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type FormatUtcToLocalOptions = {
  locale?: string;
} & Intl.DateTimeFormatOptions;

/**
 * Formatea una fecha/hora UTC del API a cadena legible en zona local.
 */
export function formatUtcToLocal(
  iso: string | null | undefined,
  options?: FormatUtcToLocalOptions,
): string | null {
  const d = parseUtcIsoFromApi(iso);
  if (!d) return null;
  const locale = options?.locale ?? "es-DO";
  const { locale: _omit, ...fmt } = options ?? {};
  return d.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    ...fmt,
  });
}

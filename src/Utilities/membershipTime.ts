import type { UserMembershipSnapshot } from "../Types/Usuario";
import { formatUtcToLocal, parseUtcIsoFromApi } from "./dateTimeUtc";

/** Estados de solicitud/membresía que bloquean edición en backend (cancelada / expirada). */
export const MEMBERSHIP_ROW_STATUS_CANCELLED = 3;
export const MEMBERSHIP_ROW_STATUS_EXPIRED = 4;

export type MembershipVisualPhase = "none" | "active" | "grace" | "expired";

/**
 * Fase visual respecto a `expiresAt` y `graceUntil`:
 * - `active`: aún no pasó la fecha de vencimiento del período.
 * - `grace`: pasó `expiresAt` pero no `graceUntil` (por vencer acceso definitivo).
 * - `expired`: pasó `graceUntil` (o no hay gracia y pasó `expiresAt`).
 */
export function getMembershipVisualPhase(
  m: UserMembershipSnapshot | null | undefined,
  now: Date = new Date(),
): MembershipVisualPhase {
  if (!m) return "none";
  const exp = parseUtcIsoFromApi(m.expiresAt);
  const grace = parseUtcIsoFromApi(m.graceUntil);
  const hardEnd = grace ?? exp;
  if (!hardEnd) return "none";
  if (now.getTime() > hardEnd.getTime()) return "expired";
  if (
    exp &&
    grace &&
    now.getTime() > exp.getTime() &&
    now.getTime() <= grace.getTime()
  ) {
    return "grace";
  }
  return "active";
}

/** Texto breve del tiempo hasta un instante UTC (para contadores en UI). */
export function formatSpanishDurationUntil(
  iso: string | null | undefined,
  now: Date = new Date(),
): string | null {
  const target = parseUtcIsoFromApi(iso);
  if (!target) return null;
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return "vencido";
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  if (days >= 365) {
    const y = Math.floor(days / 365);
    return `en ${y} año${y === 1 ? "" : "s"}`;
  }
  if (days >= 60) {
    const mo = Math.floor(days / 30);
    return `en ${mo} mes${mo === 1 ? "" : "es"}`;
  }
  if (days >= 1) return `en ${days} día${days === 1 ? "" : "s"}`;
  const hours = Math.floor(sec / 3600);
  if (hours >= 1) return `en ${hours} h`;
  const min = Math.max(1, Math.floor(sec / 60));
  return `en ${min} min`;
}

/** Texto muy breve para badge / cabecera (sin fechas largas). */
export function getMembershipIndicatorShort(
  m: UserMembershipSnapshot | null | undefined,
  now: Date = new Date(),
): { phase: MembershipVisualPhase; title: string; subtitle: string | null } {
  if (!m) {
    return { phase: "none", title: "Sin membresía", subtitle: null };
  }
  let phase = getMembershipVisualPhase(m, now);
  if (phase === "none") phase = "active";

  const plan = (m.plan || "Membresía").trim();

  if (phase === "expired") {
    return { phase: "expired", title: "Membresía vencida", subtitle: plan };
  }
  if (phase === "grace") {
    const rel = formatSpanishDurationUntil(m.graceUntil, now);
    return {
      phase: "grace",
      title: plan,
      subtitle: rel ? `Gracia · ${rel}` : "Periodo de gracia",
    };
  }
  const end = m.graceUntil ?? m.expiresAt;
  const rel = formatSpanishDurationUntil(end, now);
  return {
    phase: "active",
    title: plan,
    subtitle: rel ? `Acceso ${rel}` : (m.status?.nombre ?? null),
  };
}

/** Edición de fila de historial permitida solo si no cancelada/expirada y no pasó `expiresAt`. */
export function canEditMembresiaHistorialRow(row: {
  status: { id: number };
  expiresAt: string;
}): boolean {
  const sid = row.status?.id;
  if (sid === MEMBERSHIP_ROW_STATUS_CANCELLED) return false;
  if (sid === MEMBERSHIP_ROW_STATUS_EXPIRED) return false;
  const exp = parseUtcIsoFromApi(row.expiresAt);
  if (!exp) return true;
  return Date.now() <= exp.getTime();
}

/** Textos cortos para badge en cabecera o tarjeta resumen. */
export function getMembershipHeadlineDescription(
  m: UserMembershipSnapshot,
  now: Date = new Date(),
): { phase: MembershipVisualPhase; primary: string; secondary: string | null } {
  const phase = getMembershipVisualPhase(m, now);
  const plan = m.plan || "Membresía";
  const estado = m.status?.nombre ? ` · ${m.status.nombre}` : "";

  if (phase === "expired") {
    return {
      phase,
      primary: `${plan}${estado}`,
      secondary: "Vencida (incl. periodo de gracia)",
    };
  }

  if (phase === "grace") {
    const rel = formatSpanishDurationUntil(m.graceUntil, now);
    const abs = formatUtcToLocal(m.graceUntil);
    return {
      phase,
      primary: `${plan}${estado}`,
      secondary: `Gracia: fin de acceso ${abs ?? "—"}${rel ? ` (${rel})` : ""}`,
    };
  }

  const hardEnd = m.graceUntil ?? m.expiresAt;
  const relEnd = formatSpanishDurationUntil(hardEnd, now);
  const absEnd = formatUtcToLocal(hardEnd);
  const relPeriodEnd = formatSpanishDurationUntil(m.expiresAt, now);
  const absPeriodEnd = formatUtcToLocal(m.expiresAt);
  const showRenewalHint =
    m.graceUntil &&
    m.expiresAt &&
    parseUtcIsoFromApi(m.expiresAt) &&
    now.getTime() <= (parseUtcIsoFromApi(m.expiresAt)?.getTime() ?? 0);

  return {
    phase,
    primary: `${plan}${estado}`,
    secondary: showRenewalHint
      ? `Período hasta ${absPeriodEnd ?? "—"} (${relPeriodEnd ?? ""}) · acceso total hasta ${absEnd ?? "—"} (${relEnd ?? ""})`
      : `Fin de acceso: ${absEnd ?? "—"} · ${relEnd ?? ""}`,
  };
}

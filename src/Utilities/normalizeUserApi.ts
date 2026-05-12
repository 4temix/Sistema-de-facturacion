import type { User, UserMembershipSnapshot } from "../Types/Usuario";

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function nullableNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function record(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

/** Une `nombre` / `name` / PascalCase en anidados rol y estado. */
function rolNombre(r: Record<string, unknown>): string {
  return str(r.nombre ?? r.Nombre ?? r.name ?? r.Name);
}

function normalizeMembershipFromApi(
  raw: unknown,
): UserMembershipSnapshot | null {
  if (raw === null || raw === undefined) return null;
  const o = record(raw);
  const status = record(o.status ?? o.Status);
  const planLabel = str(o.plan ?? o.Plan ?? "");
  const statusNombre = rolNombre(status);
  const statusId = num(status.id ?? status.Id);
  if (!planLabel && !statusId && nullableNum(o.planId ?? o.PlanId) == null) {
    return null;
  }
  const startRaw = o.startAt ?? o.StartAt;
  const expRaw = o.expiresAt ?? o.ExpiresAt;
  const graceRaw = o.graceUntil ?? o.GraceUntil;
  const isActiveRaw = o.isActive ?? o.IsActive;
  return {
    planId: nullableNum(o.planId ?? o.PlanId),
    plan: planLabel || "—",
    price: num(o.price ?? o.Price),
    status: {
      id: statusId,
      nombre: statusNombre || "—",
    },
    isActive:
      isActiveRaw === null || isActiveRaw === undefined
        ? null
        : Boolean(isActiveRaw),
    startAt: startRaw != null && String(startRaw).trim() ? String(startRaw) : null,
    expiresAt: expRaw != null && String(expRaw).trim() ? String(expRaw) : null,
    graceUntil:
      graceRaw != null && String(graceRaw).trim() ? String(graceRaw) : null,
  };
}

/**
 * Normaliza elementos de `api/user/users` para el front (camelCase, PascalCase,
 * rol/estado con `name` en lugar de `nombre`).
 */
export function normalizeUserFromApi(raw: unknown): User {
  const o = record(raw);
  const rol = record(o.rol ?? o.Rol);
  const estado = record(o.estado ?? o.Estado);

  return {
    id: num(o.id ?? o.Id),
    username: str(o.username ?? o.Username),
    realName: str(o.realName ?? o.RealName),
    lastName: str(o.lastName ?? o.LastName),
    email: str(o.email ?? o.Email),
    teNumber: str(o.teNumber ?? o.TeNumber ?? o.telefono ?? o.Telefono),
    about: str(o.about ?? o.About),
    compName: str(o.compName ?? o.CompName),
    address: str(o.address ?? o.Address),
    fechaCreacion: str(o.fechaCreacion ?? o.FechaCreacion),
    userImage: (o.userImage ?? o.UserImage ?? null) as string | null,
    rol: {
      id: num(rol.id ?? rol.Id),
      nombre: rolNombre(rol),
    },
    estado: {
      id: num(estado.id ?? estado.Id),
      nombre: rolNombre(estado),
    },
    membership: normalizeMembershipFromApi(o.membership ?? o.Membership),
  };
}

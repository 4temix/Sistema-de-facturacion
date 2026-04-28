import type { User } from "../Types/Usuario";

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function record(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

/** Une `nombre` / `name` / PascalCase en anidados rol y estado. */
function rolNombre(r: Record<string, unknown>): string {
  return str(r.nombre ?? r.Nombre ?? r.name ?? r.Name);
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
  };
}

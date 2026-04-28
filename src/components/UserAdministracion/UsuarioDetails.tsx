import type { User } from "../../Types/Usuario";
import { PencilIcon } from "../../icons";
import {
  TbUser,
  TbPhone,
  TbMail,
  TbBuilding,
  TbMapPin,
  TbCalendar,
  TbNotes,
  TbId,
  TbShieldCheck,
} from "react-icons/tb";

export type UsuarioDetailsProps = {
  user: User;
  onClose: () => void;
  onEditar: (id: number) => void;
};

function formatRegistro(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("es-DO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return null;
  }
}

function badgeEstadoCuenta(nombre: string) {
  const n = (nombre || "").toLowerCase();
  if (
    /inactiv|deshab|bloque|suspend|baja|deshabilit/i.test(n) ||
    n === "—"
  ) {
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800";
  }
  if (/activ|habil|vig|ok|habilit/i.test(n)) {
    return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950/40 dark:text-green-200 dark:border-green-800";
  }
  return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600";
}

export default function UsuarioDetails({
  user,
  onClose,
  onEditar,
}: UsuarioDetailsProps) {
  const nombreCompleto = `${user.realName ?? ""} ${user.lastName ?? ""}`.trim() || "Sin nombre";
  const estadoNombre = user.estado?.nombre || "—";
  const fechaReg = formatRegistro(user.fechaCreacion);

  return (
    <div className="h-full w-full overflow-y-auto bg-white p-6 dark:bg-gray-900">
      {/* Header (misma línea que Facturación / Gastos / Empleados) */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <TbUser className="shrink-0 text-2xl text-brand-500" />
            <h2 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
              {nombreCompleto}
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-mono text-gray-800 dark:text-gray-200">
              @{user.username}
            </span>
            <span className="mx-1.5 text-gray-400">·</span>
            <span className="text-xs text-gray-500">ID #{user.id}</span>
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${badgeEstadoCuenta(estadoNombre)}`}
        >
          {estadoNombre}
        </span>
      </div>

      {/* Tarjetas resumen (estilo GastoDetails) */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <TbShieldCheck className="text-lg text-blue-600 dark:text-blue-400" />
            Rol en el sistema
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {user.rol?.nombre || "—"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <TbCalendar className="text-lg text-emerald-600 dark:text-emerald-400" />
            Fecha de registro
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {fechaReg ?? "—"}
          </p>
        </div>
      </div>

      {/* Identidad / cuenta (bloque azul como EmpleadoDetails “Información personal”) */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50/90 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
        <div className="mb-3 flex items-center gap-2">
          <TbId className="text-xl text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Cuenta e identidad
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {nombreCompleto}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Usuario</p>
            <p className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
              {user.username || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/80">
          <div className="mb-1 flex items-center gap-2">
            <TbMail className="text-lg text-gray-500 dark:text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Correo</p>
          </div>
          <p className="break-all text-sm font-medium text-gray-900 dark:text-white">
            {user.email || "N/A"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/80">
          <div className="mb-1 flex items-center gap-2">
            <TbPhone className="text-lg text-gray-500 dark:text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.teNumber || "N/A"}
          </p>
        </div>
      </div>

      {/* Empresa y dirección */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="mb-3 flex items-center gap-2">
          <TbBuilding className="text-xl text-gray-600 dark:text-gray-300" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Organización
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Compañía</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.compName || "—"}
            </p>
          </div>
          <div className="flex gap-2 border-t border-gray-200/80 pt-3 dark:border-gray-600/80">
            <TbMapPin className="mt-0.5 shrink-0 text-lg text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dirección</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {user.address || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nota */}
      <div className="mb-6 rounded-lg border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/25">
        <div className="mb-2 flex items-center gap-2">
          <TbNotes className="text-xl text-amber-700 dark:text-amber-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Nota / acerca de
          </h3>
        </div>
        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {user.about?.trim() ? user.about : "Sin notas registradas."}
        </p>
      </div>

      {/* Acciones (mismo patrón que EmpleadoDetails) */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onEditar(user.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <PencilIcon className="h-4 w-4" />
          Editar usuario
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-gray-200 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

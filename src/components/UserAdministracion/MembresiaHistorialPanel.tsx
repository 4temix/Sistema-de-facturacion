import { useCallback, useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { formatUtcToLocal } from "../../Utilities/dateTimeUtc";
import { canEditMembresiaHistorialRow } from "../../Utilities/membershipTime";
import type {
  MembresiaHistorialItem,
  MembresiaPlanUsuarioOption,
} from "../../Types/MembresiaUsuario.types";
import LoaderFun from "../loader/LoaderFunc";
import ModalUpdateMembresiaHistorialStatus from "./ModalUpdateMembresiaHistorialStatus";

function record(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function readProp(r: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (k in r && r[k] !== undefined && r[k] !== null) return r[k];
  }
  return undefined;
}

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function normalizePlan(raw: unknown): MembresiaPlanUsuarioOption {
  const p = record(raw);
  return {
    id: num(readProp(p, "id", "Id")),
    name: str(readProp(p, "name", "Name") ?? ""),
    price: num(readProp(p, "price", "Price")),
    intervalType: str(readProp(p, "intervalType", "IntervalType") ?? ""),
    intervalCount: num(readProp(p, "intervalCount", "IntervalCount")),
    availableAll: Boolean(readProp(p, "availableAll", "AvailableAll")),
  };
}

function normalizeHistorialItem(raw: unknown): MembresiaHistorialItem | null {
  const o = record(raw);
  const id = num(o.id ?? o.Id);
  if (!id) return null;
  const st = record(o.status ?? o.Status);
  return {
    id,
    userId: num(o.userId ?? o.UserId),
    status: {
      id: num(st.id ?? st.Id),
      nombre: str(st.nombre ?? st.Nombre ?? st.name ?? ""),
    },
    plan: normalizePlan(o.plan ?? o.Plan),
    requestedAt: str(o.requestedAt ?? o.RequestedAt ?? ""),
    reviewedAt: str(o.reviewedAt ?? o.ReviewedAt ?? ""),
    note: str(o.note ?? o.Note ?? ""),
    expiresAt: str(o.expiresAt ?? o.ExpiresAt ?? ""),
  };
}

function formatPrecio(n: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

type Props = {
  userId: number;
  /** Incrementar o cambiar para forzar nueva carga del historial. */
  reloadKey?: number;
  onChanged?: () => void;
};

export default function MembresiaHistorialPanel({ userId, reloadKey = 0, onChanged }: Props) {
  const [rows, setRows] = useState<MembresiaHistorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<MembresiaHistorialItem | null>(null);

  const load = useCallback(async () => {
    if (!userId || userId <= 0) return;
    setLoading(true);
    setError(null);
    const res = await apiRequestThen<unknown[]>({
      url: `api/v1/membresia/historial/${userId}`,
      configuration: { method: "GET" },
    });
    setLoading(false);
    if (!res.success) {
      setError(res.errorMessage ?? "No se pudo cargar el historial.");
      setRows([]);
      return;
    }
    const raw = Array.isArray(res.result) ? res.result : [];
    setRows(
      raw
        .map((x) => normalizeHistorialItem(x))
        .filter((x): x is MembresiaHistorialItem => x != null),
    );
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const handleAfterUpdate = () => {
    void load();
    onChanged?.();
  };

  if (!userId) return null;

  return (
    <div className="mb-6 rounded-lg border border-violet-200/90 bg-violet-50/50 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Historial de membresías
        </h3>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs font-medium text-violet-700 hover:underline dark:text-violet-300"
        >
          Actualizar
        </button>
      </div>

      {loading && (
        <div className="relative min-h-[6rem] py-6">
          <LoaderFun absolute />
        </div>
      )}
      {!loading && error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No hay registros de membresía para este usuario.
        </p>
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-violet-100 bg-white/80 dark:border-violet-900/40 dark:bg-gray-900/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-violet-100 bg-violet-50/80 text-xs font-medium text-gray-600 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-gray-300">
              <tr>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Solicitud</th>
                <th className="px-3 py-2">Revisión</th>
                <th className="px-3 py-2">Vence</th>
                <th className="px-3 py-2 w-24"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100 dark:divide-violet-900/40">
              {rows.map((r) => {
                const editable = canEditMembresiaHistorialRow(r);
                return (
                  <tr key={r.id} className="text-gray-800 dark:text-gray-200">
                    <td className="px-3 py-2">
                      <span className="font-medium">{r.plan.name}</span>
                      <span className="ml-1 text-xs text-gray-500">
                        ({formatPrecio(r.plan.price)})
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs dark:border-gray-600">
                        {r.status.nombre}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {formatUtcToLocal(r.requestedAt) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {formatUtcToLocal(r.reviewedAt) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {formatUtcToLocal(r.expiresAt) ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {editable ? (
                        <button
                          type="button"
                          title="Cambiar estado"
                          onClick={() => setEditRow(r)}
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-violet-700 hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-violet-950/60"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editRow && (
        <ModalUpdateMembresiaHistorialStatus
          isOpen={!!editRow}
          membresiaId={editRow.id}
          currentStatusId={editRow.status.id}
          onClose={() => setEditRow(null)}
          onSuccess={handleAfterUpdate}
        />
      )}
    </div>
  );
}

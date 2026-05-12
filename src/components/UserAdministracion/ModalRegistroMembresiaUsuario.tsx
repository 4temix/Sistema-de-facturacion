import { useCallback, useEffect, useState } from "react";
import Select, { type SingleValue } from "react-select";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { customStyles } from "../../Utilities/StyleForReactSelect";
import { ValidationMembresiaUsuarioAsignar } from "../../Utilities/ValidationMembresiaUsuarioAsignar";
import type { Option } from "../../Types/ProductTypes";
import type {
  AsignarMembresiaUsuarioPayload,
  MembresiaEstadoUsuarioOption,
  MembresiaPlanUsuarioOption,
  MembresiaUsuarioSelectsResponse,
} from "../../Types/MembresiaUsuario.types";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import LoaderFun from "../loader/LoaderFunc";

const API_MEMBRESIA = "api/v1/membresia";

const assignInitial = {
  plan: null as Option | null,
  status: null as Option | null,
};

function readProp(r: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (k in r && r[k] !== undefined && r[k] !== null) return r[k];
  }
  return undefined;
}

function normalizeSelects(raw: unknown): MembresiaUsuarioSelectsResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const planesRaw = readProp(o, "planes", "Planes");
  const statusRaw = readProp(o, "status", "Status", "estados", "Estados");
  const planes = Array.isArray(planesRaw) ? planesRaw : [];
  const status = Array.isArray(statusRaw) ? statusRaw : [];
  return {
    planes: planes.map((p) => {
      const x = p as Record<string, unknown>;
      return {
        id: Number(readProp(x, "id", "Id")),
        name: String(readProp(x, "name", "Name") ?? ""),
        price: Number(readProp(x, "price", "Price")),
        intervalType: String(readProp(x, "intervalType", "IntervalType") ?? ""),
        intervalCount: Number(readProp(x, "intervalCount", "IntervalCount")),
        availableAll: Boolean(readProp(x, "availableAll", "AvailableAll")),
      };
    }),
    status: status.map((s) => {
      const x = s as Record<string, unknown>;
      return {
        id: Number(readProp(x, "id", "Id")),
        nombre: String(readProp(x, "nombre", "Nombre", "name", "Name") ?? ""),
      };
    }),
  };
}

function formatPrecio(n: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

function planToOption(p: MembresiaPlanUsuarioOption): Option {
  const unidad =
    p.intervalType === "month"
      ? p.intervalCount === 1
        ? "mes"
        : "meses"
      : p.intervalCount === 1
        ? "año"
        : "años";
  const label = `${p.name} — ${formatPrecio(p.price)} · ${p.intervalCount} ${unidad}`;
  return { value: String(p.id), label };
}

function estadoToOption(s: MembresiaEstadoUsuarioOption): Option {
  return { value: String(s.id), label: s.nombre };
}

function buildAsignarPayload(
  values: typeof assignInitial,
  userId: number,
): AsignarMembresiaUsuarioPayload | null {
  if (!values.plan || !values.status) return null;
  return {
    planId: Number(values.plan.value),
    userId,
    statusId: Number(values.status.value),
  };
}

async function persistAsignarMembresia(
  payload: AsignarMembresiaUsuarioPayload,
) {
  return apiRequestThen<unknown>({
    url: API_MEMBRESIA,
    configuration: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  });
}

export type ModalRegistroMembresiaUsuarioProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  /** Texto para el encabezado (ej. nombre del usuario). */
  userLabel: string;
  onSuccess?: () => void;
};

export default function ModalRegistroMembresiaUsuario({
  isOpen,
  onClose,
  userId,
  userLabel,
  onSuccess,
}: ModalRegistroMembresiaUsuarioProps) {
  const [loadingSelects, setLoadingSelects] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [planes, setPlanes] = useState<MembresiaPlanUsuarioOption[]>([]);
  const [estados, setEstados] = useState<MembresiaEstadoUsuarioOption[]>([]);

  const loadSelects = useCallback(async () => {
    setLoadingSelects(true);
    setLoadError(null);
    const res = await apiRequestThen<MembresiaUsuarioSelectsResponse>({
      url: API_MEMBRESIA,
      configuration: { method: "GET" },
    });
    setLoadingSelects(false);
    if (!res.success || res.result == null) {
      setLoadError(res.errorMessage ?? "No se pudieron cargar planes y estados.");
      setPlanes([]);
      setEstados([]);
      return;
    }
    const normalized = normalizeSelects(res.result);
    if (!normalized) {
      setLoadError("Respuesta inválida del servidor.");
      setPlanes([]);
      setEstados([]);
      return;
    }
    setPlanes(normalized.planes);
    setEstados(normalized.status);
  }, []);

  const formik = useFormik({
    initialValues: assignInitial,
    validationSchema: ValidationMembresiaUsuarioAsignar,
    onSubmit: async (values, { resetForm }) => {
      if (!userId || userId <= 0) {
        void Swal.fire({
          icon: "error",
          title: "Usuario inválido",
          text: "No se puede asignar membresía sin un usuario válido.",
        });
        return;
      }
      const payload = buildAsignarPayload(values, userId);
      if (!payload) {
        void Swal.fire({
          icon: "warning",
          title: "Datos incompletos",
          text: "Plan y estado son obligatorios.",
        });
        return;
      }
      const res = await persistAsignarMembresia(payload);
      if (res.success) {
        void Swal.fire({
          icon: "success",
          title: "Membresía registrada",
          timer: 2000,
          showConfirmButton: false,
        });
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        void Swal.fire({
          icon: "error",
          title: "Error",
          text: res.errorMessage ?? "No se pudo registrar la membresía.",
        });
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
      setLoadError(null);
      return;
    }
    void loadSelects();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir
  }, [isOpen]);

  const handleGuardarAsignacion = async () => {
    const errs = await formik.validateForm();
    formik.setTouched(
      Object.keys(assignInitial).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
      true,
    );
    if (Object.keys(errs).length === 0) {
      await formik.submitForm();
    }
  };

  const planOptions = planes.map(planToOption);
  const statusOptions = estados.map(estadoToOption);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!formik.isSubmitting) {
          formik.resetForm();
          onClose();
        }
      }}
      className="max-w-lg w-full"
      zIndex="z-[200]"
    >
      <div className="relative flex min-h-0 w-full flex-col max-h-[min(92dvh,38rem)] overflow-hidden">
        <div className="relative w-full shrink-0 border-b border-gray-100 bg-white px-5 pb-4 pr-14 pt-5 sm:px-6 sm:pr-16 sm:pt-6 dark:border-gray-800 dark:bg-gray-900">
          <h4 className="mb-0 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Registrar membresía
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Usuario:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {userLabel}
            </span>
          </p>
        </div>

        {loadingSelects ? (
          <div className="relative min-h-[12rem] w-full px-5 py-10 sm:px-6">
            <LoaderFun absolute />
          </div>
        ) : loadError ? (
          <div className="px-5 py-8 sm:px-6">
            <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
          </div>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              void handleGuardarAsignacion();
            }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4 sm:px-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                <div>
                  <Label htmlFor="membresia-plan-select">Plan</Label>
                  <Select<Option, false>
                    inputId="membresia-plan-select"
                    instanceId="membresia-plan"
                    options={planOptions}
                    value={formik.values.plan}
                    onChange={(opt: SingleValue<Option>) => {
                      void formik.setFieldValue("plan", opt);
                    }}
                    onBlur={() => void formik.setFieldTouched("plan", true)}
                    placeholder="Seleccionar plan…"
                    styles={customStyles(
                      !!(formik.touched.plan && formik.errors.plan),
                    )}
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {formik.touched.plan && formik.errors.plan && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {formik.errors.plan}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="membresia-status-select">
                    Estado de la membresía
                  </Label>
                  <Select<Option, false>
                    inputId="membresia-status-select"
                    instanceId="membresia-status"
                    options={statusOptions}
                    value={formik.values.status}
                    onChange={(opt: SingleValue<Option>) => {
                      void formik.setFieldValue("status", opt);
                    }}
                    onBlur={() => void formik.setFieldTouched("status", true)}
                    placeholder="Seleccionar estado…"
                    styles={customStyles(
                      !!(formik.touched.status && formik.errors.status),
                    )}
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {formik.touched.status && formik.errors.status && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {formik.errors.status}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 bg-white/95 px-5 pb-6 pt-5 dark:border-gray-800 dark:bg-gray-900/95 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={formik.isSubmitting}
                onClick={() => {
                  formik.resetForm();
                  onClose();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? "Guardando…" : "Registrar"}
              </Button>
            </div>

            {formik.isSubmitting && <LoaderFun absolute />}
          </form>
        )}
      </div>
    </Modal>
  );
}

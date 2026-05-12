import { useCallback, useEffect, useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { customStyles } from "../../Utilities/StyleForReactSelect";
import type { Option } from "../../Types/ProductTypes";
import type {
  MembresiaEstadoUsuarioOption,
  MembresiaUsuarioSelectsResponse,
  UpdateMembresiaStatusPayload,
} from "../../Types/MembresiaUsuario.types";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import LoaderFun from "../loader/LoaderFunc";

const API_MEMBRESIA = "api/v1/membresia";
const API_UPDATE_STATUS = "api/v1/membresia/update_status_membership";

function readProp(r: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (k in r && r[k] !== undefined && r[k] !== null) return r[k];
  }
  return undefined;
}

function normalizeSelects(raw: unknown): MembresiaUsuarioSelectsResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const statusRaw = readProp(o, "status", "Status", "estados", "Estados");
  const status = Array.isArray(statusRaw) ? statusRaw : [];
  return {
    planes: [],
    status: status.map((s) => {
      const x = s as Record<string, unknown>;
      return {
        id: Number(readProp(x, "id", "Id")),
        nombre: String(readProp(x, "nombre", "Nombre", "name", "Name") ?? ""),
      };
    }),
  };
}

function estadoToOption(s: MembresiaEstadoUsuarioOption): Option {
  return { value: String(s.id), label: s.nombre };
}

const formSchema = Yup.object({
  status: Yup.object({
    value: Yup.string().required(),
    label: Yup.string().required(),
  })
    .nullable()
    .required("Seleccione un estado"),
  note: Yup.string().max(500, "Máximo 500 caracteres"),
});

export type ModalUpdateMembresiaHistorialStatusProps = {
  isOpen: boolean;
  onClose: () => void;
  membresiaId: number;
  currentStatusId: number;
  onSuccess?: () => void;
};

export default function ModalUpdateMembresiaHistorialStatus({
  isOpen,
  onClose,
  membresiaId,
  currentStatusId,
  onSuccess,
}: ModalUpdateMembresiaHistorialStatusProps) {
  const [loadingSelects, setLoadingSelects] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
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
      setLoadError(res.errorMessage ?? "No se pudieron cargar los estados.");
      setEstados([]);
      return;
    }
    const normalized = normalizeSelects(res.result);
    if (!normalized) {
      setLoadError("Respuesta inválida del servidor.");
      setEstados([]);
      return;
    }
    setEstados(normalized.status);
  }, []);

  const defaultStatusOption = useMemo((): Option | null => {
    const s = estados.find((e) => e.id === currentStatusId);
    return s ? estadoToOption(s) : null;
  }, [estados, currentStatusId]);

  const formik = useFormik({
    initialValues: {
      status: null as Option | null,
      note: "",
    },
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!values.status) return;
      const payload: UpdateMembresiaStatusPayload = {
        membresiaId,
        statusId: Number(values.status.value),
        note: values.note?.trim() ?? "",
      };
      const res = await apiRequestThen<unknown>({
        url: API_UPDATE_STATUS,
        configuration: {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      });
      if (res.success) {
        void Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          timer: 1800,
          showConfirmButton: false,
        });
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        void Swal.fire({
          icon: "error",
          title: "No se pudo actualizar",
          text: res.errorMessage ?? "Intente de nuevo.",
        });
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
      setLoadError(null);
      setEstados([]);
      return;
    }
    void loadSelects();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || estados.length === 0) return;
    void formik.setValues({
      status: defaultStatusOption,
      note: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, estados, defaultStatusOption]);

  const statusOptions = estados.map(estadoToOption);

  const handleGuardar = async () => {
    const errs = await formik.validateForm();
    formik.setTouched({ status: true, note: true }, true);
    if (Object.keys(errs).length === 0) {
      await formik.submitForm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!formik.isSubmitting) {
          formik.resetForm();
          onClose();
        }
      }}
      className="max-w-md w-full"
      zIndex="z-[200]"
    >
      <div className="relative flex min-h-0 w-full flex-col max-h-[min(92dvh,32rem)] overflow-hidden">
        <div className="relative w-full shrink-0 border-b border-gray-100 bg-white px-5 pb-4 pr-14 pt-5 sm:px-6 sm:pr-16 sm:pt-6 dark:border-gray-800 dark:bg-gray-900">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Cambiar estado de membresía
          </h4>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Registro #{membresiaId}
          </p>
        </div>

        {loadingSelects ? (
          <div className="relative min-h-[10rem] w-full px-5 py-10 sm:px-6">
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
              void handleGuardar();
            }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4 sm:px-6">
              <div className="grid grid-cols-1 gap-y-5">
                <div>
                  <Label htmlFor="hist-memb-status">Estado</Label>
                  <Select<Option, false>
                    inputId="hist-memb-status"
                    instanceId="hist-memb-status"
                    options={statusOptions}
                    value={formik.values.status}
                    onChange={(opt: SingleValue<Option>) => {
                      void formik.setFieldValue("status", opt);
                    }}
                    onBlur={() => void formik.setFieldTouched("status", true)}
                    placeholder="Seleccionar…"
                    styles={customStyles(
                      !!(formik.touched.status && formik.errors.status),
                    )}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {formik.touched.status && formik.errors.status && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {String(formik.errors.status)}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hist-memb-note">Nota (opcional)</Label>
                  <textarea
                    id="hist-memb-note"
                    name="note"
                    rows={3}
                    value={formik.values.note}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    placeholder="Motivo o comentario interno…"
                  />
                  {formik.touched.note && formik.errors.note && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {formik.errors.note}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 bg-white/95 px-5 pb-6 pt-5 dark:border-gray-800 dark:bg-gray-900/95 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
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
                {formik.isSubmitting ? "Guardando…" : "Guardar"}
              </Button>
            </div>

            {formik.isSubmitting && <LoaderFun absolute />}
          </form>
        )}
      </div>
    </Modal>
  );
}

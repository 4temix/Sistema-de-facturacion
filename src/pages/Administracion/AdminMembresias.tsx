import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import Select, { type SingleValue } from "react-select";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import {
  ValidationMembresiaPlanCreate,
  ValidationMembresiaPlanUpdate,
} from "../../Utilities/ValidationMembresiaPlan";
import { customStyles } from "../../Utilities/StyleForReactSelect";
import type { Option } from "../../Types/ProductTypes";
import Button from "../../components/ui/button/Button";
import Checkbox from "../../components/form/input/Checkbox";
import { Modal } from "../../components/ui/modal";
import LoaderFun from "../../components/loader/LoaderFunc";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import type {
  MembershipPlanAdmin,
  SaveMembershipPlanPayload,
  UpdateMembershipPlanPayload,
} from "../../Types/MembresiaAdmin.types";

const API_LIST = "api/v1/membresia/membership_list_admin";
const API_SAVE = "api/v1/membresia/save_membership_plan";
const API_UPDATE = "api/v1/membresia/update_membership_plan";

const INTERVAL_OPTIONS: Option[] = [
  { value: "true", label: "Mes" },
  { value: "false", label: "Año" },
];

const regexNum = /^[0-9]*\.?[0-9]*$/;
const regexEntero = /^[0-9]*$/;

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function isMonthIntervalType(type: boolean | string): boolean {
  if (typeof type === "boolean") return type;
  if (type === "month") return true;
  if (type === "year") return false;
  return false;
}

function intervalLabel(type: boolean | string, count: number) {
  if (isMonthIntervalType(type)) {
    return count === 1 ? "1 mes" : `${count} meses`;
  }
  return count === 1 ? "1 año" : `${count} años`;
}

function intervalTypeNombre(type: boolean | string) {
  return isMonthIntervalType(type) ? "Mes" : "Año";
}

function coerceBool(v: unknown, defaultValue = false): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes") return true;
    if (s === "false" || s === "0" || s === "no") return false;
  }
  return defaultValue;
}

function readProp(r: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (k in r && r[k] !== undefined && r[k] !== null) return r[k];
  }
  return undefined;
}

function normalizeMembershipFromApi(raw: unknown): MembershipPlanAdmin {
  const r = raw as Record<string, unknown>;
  const intervalTypeRaw = readProp(r, "intervalType", "IntervalType");
  return {
    id: Number(readProp(r, "id", "Id")),
    name: String(readProp(r, "name", "Name") ?? ""),
    price: Number(readProp(r, "price", "Price")),
    intervalType:
      typeof intervalTypeRaw === "boolean" || typeof intervalTypeRaw === "string"
        ? (intervalTypeRaw as boolean | string)
        : "month",
    intervalCount: Number(readProp(r, "intervalCount", "IntervalCount")),
    availableAll: coerceBool(
      readProp(r, "availableAll", "AvailableAll", "available_all"),
    ),
    accessFinished: coerceBool(
      readProp(r, "accessFinished", "AccessFinished", "access_finished"),
    ),
    isActive: coerceBool(
      readProp(r, "isActive", "IsActive", "is_active"),
      true,
    ),
  };
}

type CreateFormValues = {
  name: string;
  price: number;
  intervalCount: number;
  intervalTypeMes: boolean;
  availableAll: boolean;
  accessFinished: boolean;
};

type EditFormValues = {
  id: number;
  name: string;
  price: number;
  intervalCount: number;
  availableAll: boolean;
  accessFinished: boolean;
  isActive: boolean;
};

const createInitial: CreateFormValues = {
  name: "",
  price: 0,
  intervalCount: 1,
  intervalTypeMes: true,
  availableAll: true,
  accessFinished: false,
};

const editInitial: EditFormValues = {
  id: 0,
  name: "",
  price: 0,
  intervalCount: 1,
  availableAll: true,
  accessFinished: false,
  isActive: true,
};

function buildSaveMembershipPayload(
  values: CreateFormValues,
): SaveMembershipPlanPayload {
  return {
    name: values.name.trim(),
    price: Number(values.price),
    intervalType: values.intervalTypeMes,
    intervalCount: Number(values.intervalCount),
    availableAll: values.availableAll,
    accessFinished: values.accessFinished,
  };
}

function buildUpdateMembershipPayload(
  values: EditFormValues,
): UpdateMembershipPlanPayload {
  return {
    id: values.id,
    name: values.name.trim(),
    price: Number(values.price),
    intervalCount: Number(values.intervalCount),
    availableAll: values.availableAll,
    accessFinished: values.accessFinished,
    isActive: values.isActive,
  };
}

export default function AdminMembresias() {
  const [items, setItems] = useState<MembershipPlanAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await apiRequestThen<MembershipPlanAdmin[]>({
      url: API_LIST,
      configuration: { method: "GET" },
    });
    setLoading(false);
    if (!res.success) {
      setLoadError(res.errorMessage ?? "No se pudo cargar la lista");
      setItems([]);
      return;
    }
    const raw = Array.isArray(res.result) ? res.result : [];
    setItems(raw.map(normalizeMembershipFromApi));
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const persistCreatePlan = useCallback(
    (payload: SaveMembershipPlanPayload) =>
      apiRequestThen<unknown>({
        url: API_SAVE,
        configuration: {
          method: "POST",
          body: JSON.stringify(payload),
        },
      }),
    [],
  );

  const persistUpdatePlan = useCallback(
    (payload: UpdateMembershipPlanPayload) =>
      apiRequestThen<unknown>({
        url: API_UPDATE,
        configuration: {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      }),
    [],
  );

  const createFormik = useFormik({
    initialValues: createInitial,
    validationSchema: ValidationMembresiaPlanCreate,
    onSubmit: async (values, { resetForm }) => {
      const payload = buildSaveMembershipPayload(values);
      const res = await persistCreatePlan(payload);
      if (res.success) {
        resetForm();
        setCreateOpen(false);
        await fetchList();
        void Swal.fire({
          icon: "success",
          title: "Plan creado",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        void Swal.fire({
          icon: "error",
          title: "Error",
          text: res.errorMessage ?? "No se pudo crear el plan",
        });
      }
    },
  });

  const editFormik = useFormik({
    initialValues: editInitial,
    validationSchema: ValidationMembresiaPlanUpdate,
    onSubmit: async (values, { resetForm }) => {
      const payload = buildUpdateMembershipPayload(values);
      const res = await persistUpdatePlan(payload);
      if (res.success) {
        resetForm();
        setEditOpen(false);
        await fetchList();
        void Swal.fire({
          icon: "success",
          title: "Plan actualizado",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        void Swal.fire({
          icon: "error",
          title: "Error",
          text: res.errorMessage ?? "No se pudo actualizar el plan",
        });
      }
    },
  });

  const openEdit = (m: MembershipPlanAdmin) => {
    setCreateOpen(false);
    createFormik.resetForm();
    editFormik.setValues({
      id: m.id,
      name: m.name,
      price: m.price,
      intervalCount: m.intervalCount,
      availableAll: !!m.availableAll,
      accessFinished: !!m.accessFinished,
      isActive: !!m.isActive,
    });
    setEditOpen(true);
  };

  const handleCreateSubmit = async () => {
    const errs = await createFormik.validateForm();
    createFormik.setTouched(
      Object.keys(createInitial).reduce(
        (acc, key) => {
          acc[key as keyof CreateFormValues] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
      true,
    );
    if (Object.keys(errs).length === 0) {
      await createFormik.submitForm();
    }
  };

  const handleEditSubmit = async () => {
    const errs = await editFormik.validateForm();
    editFormik.setTouched(
      Object.keys(editInitial).reduce(
        (acc, key) => {
          acc[key as keyof EditFormValues] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
      true,
    );
    if (Object.keys(errs).length === 0) {
      await editFormik.submitForm();
    }
  };

  const editingPlan = editFormik.values.id
    ? (items.find((x) => x.id === editFormik.values.id) ?? null)
    : null;

  const intervalSelectValue: Option | null =
    INTERVAL_OPTIONS.find(
      (o) => o.value === String(createFormik.values.intervalTypeMes),
    ) ?? null;

  return (
    <section>
      <article className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Membresías
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administra planes: precio, intervalo, disponibilidad y estado.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          className="inline-flex items-center gap-2 shrink-0"
          onClick={() => {
            setEditOpen(false);
            editFormik.resetForm();
            createFormik.resetForm();
            setCreateOpen(true);
          }}
        >
          <FiPlus size={18} />
          Nueva membresía
        </Button>
      </article>

      {loadError && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          {loadError}
        </p>
      )}

      {loading ? (
        <LoaderFun />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">{m.name}</h3>
                  <p className="text-sm text-white/90">
                    {formatPrice(m.price)} ·{" "}
                    {intervalLabel(m.intervalType, m.intervalCount)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    m.isActive
                      ? "bg-white/20 text-white"
                      : "bg-black/20 text-white/80"
                  }`}
                >
                  {m.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="p-4 space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                <p>
                  <span className="text-gray-400 dark:text-gray-500">
                    Tipo intervalo:{" "}
                  </span>
                  {intervalTypeNombre(m.intervalType)}
                </p>
                <p>
                  <span className="text-gray-400 dark:text-gray-500">
                    Disponible para todos:{" "}
                  </span>
                  {m.availableAll ? "Sí" : "No"}
                </p>
                <p>
                  <span className="text-gray-400 dark:text-gray-500">
                    Acceso finalizado:{" "}
                  </span>
                  {m.accessFinished ? "Sí" : "No"}
                </p>
              </div>
              <div className="p-4 pt-0 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full inline-flex items-center justify-center gap-2"
                  type="button"
                  onClick={() => openEdit(m)}
                >
                  <FiEdit2 size={16} />
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && !loadError && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay planes de membresía registrados.
        </p>
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => {
          if (!createFormik.isSubmitting) {
            setCreateOpen(false);
            createFormik.resetForm();
          }
        }}
        className="max-w-2xl w-full"
      >
        <div className="relative flex min-h-0 w-full flex-col max-h-[min(92dvh,40rem)] overflow-hidden">
          <div className="relative w-full shrink-0 border-b border-gray-100 bg-white px-5 pb-4 pr-14 pt-5 sm:px-6 sm:pr-16 sm:pt-6 dark:border-gray-800 dark:bg-gray-900">
            <h4 className="mb-0 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Nueva membresía
            </h4>
          </div>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreateSubmit();
            }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4 sm:px-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                <div>
                  <Label htmlFor="memb-create-nombre">Nombre</Label>
                  <Input
                    type="text"
                    id="memb-create-nombre"
                    placeholder="Ej. Mensual"
                    value={createFormik.values.name}
                    hint={
                      createFormik.touched.name && createFormik.errors.name
                        ? createFormik.errors.name
                        : ""
                    }
                    error={
                      !!(createFormik.touched.name && createFormik.errors.name)
                    }
                    onChange={(e) =>
                      createFormik.setFieldValue("name", e.target.value)
                    }
                    onBlur={() => createFormik.setFieldTouched("name", true)}
                  />
                </div>
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="memb-create-precio">Precio</Label>
                    <Input
                      type="text"
                      id="memb-create-precio"
                      placeholder="0.00"
                      hint={
                        createFormik.touched.price && createFormik.errors.price
                          ? String(createFormik.errors.price)
                          : ""
                      }
                      error={
                        !!(
                          createFormik.touched.price &&
                          createFormik.errors.price
                        )
                      }
                      value={
                        createFormik.values.price === 0
                          ? ""
                          : String(createFormik.values.price)
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          createFormik.setFieldValue("price", 0);
                          return;
                        }
                        if (regexNum.test(v)) {
                          createFormik.setFieldValue("price", Number(v));
                        }
                      }}
                      onBlur={() =>
                        createFormik.setFieldTouched("price", true)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="memb-create-intervalo-tipo">
                      Intervalo (tipo)
                    </Label>
                    <Select<Option, false>
                      inputId="memb-create-intervalo-tipo"
                      instanceId="memb-create-intervalo"
                      options={INTERVAL_OPTIONS}
                      value={intervalSelectValue}
                      onChange={(e: SingleValue<Option>) => {
                        if (!e) return;
                        void createFormik.setFieldValue(
                          "intervalTypeMes",
                          e.value === "true",
                        );
                      }}
                      onBlur={() =>
                        createFormik.setFieldTouched("intervalTypeMes", true)
                      }
                      placeholder="Mes o año…"
                      styles={customStyles(
                        !!(
                          createFormik.touched.intervalTypeMes &&
                          createFormik.errors.intervalTypeMes
                        ),
                      )}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                    {createFormik.touched.intervalTypeMes &&
                      createFormik.errors.intervalTypeMes && (
                        <p className="mt-1.5 text-xs text-error-500">
                          {createFormik.errors.intervalTypeMes}
                        </p>
                      )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="memb-create-interval-count">
                    Cantidad de intervalos
                  </Label>
                  <Input
                    type="text"
                    id="memb-create-interval-count"
                    placeholder="1"
                    hint={
                      createFormik.touched.intervalCount &&
                      createFormik.errors.intervalCount
                        ? String(createFormik.errors.intervalCount)
                        : ""
                    }
                    error={
                      !!(
                        createFormik.touched.intervalCount &&
                        createFormik.errors.intervalCount
                      )
                    }
                    value={
                      createFormik.values.intervalCount === 0
                        ? ""
                        : String(createFormik.values.intervalCount)
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") {
                        createFormik.setFieldValue("intervalCount", 0);
                        return;
                      }
                      if (regexEntero.test(v)) {
                        createFormik.setFieldValue("intervalCount", Number(v));
                      }
                    }}
                    onBlur={() =>
                      createFormik.setFieldTouched("intervalCount", true)
                    }
                  />
                </div>
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                  <Checkbox
                    id="memb-create-available-all"
                    label="Disponible para todos"
                    checked={createFormik.values.availableAll}
                    onChange={(c) =>
                      createFormik.setFieldValue("availableAll", c)
                    }
                  />
                  <Checkbox
                    id="memb-create-access-finished"
                    label="Acceso finalizado"
                    checked={createFormik.values.accessFinished}
                    onChange={(c) =>
                      createFormik.setFieldValue("accessFinished", c)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 bg-white/95 px-5 pb-6 pt-5 dark:border-gray-800 dark:bg-gray-900/95 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-6">
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={createFormik.isSubmitting}
                onClick={() => {
                  setCreateOpen(false);
                  createFormik.resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" type="submit" disabled={createFormik.isSubmitting}>
                {createFormik.isSubmitting ? "Guardando…" : "Crear plan"}
              </Button>
            </div>
          </form>
          {createFormik.isSubmitting && <LoaderFun absolute />}
        </div>
      </Modal>

      <Modal
        isOpen={editOpen && editFormik.values.id > 0}
        onClose={() => {
          if (!editFormik.isSubmitting) {
            setEditOpen(false);
            editFormik.resetForm();
          }
        }}
        className="max-w-2xl w-full"
      >
        <div className="relative flex min-h-0 w-full flex-col max-h-[min(92dvh,44rem)] overflow-hidden">
          <div className="relative w-full shrink-0 border-b border-gray-100 bg-white px-5 pb-4 pr-14 pt-5 sm:px-6 sm:pr-16 sm:pt-6 dark:border-gray-800 dark:bg-gray-900">
            <h4 className="mb-0 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Actualizar membresía
            </h4>
            {editingPlan && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tipo de intervalo del plan:{" "}
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {intervalTypeNombre(editingPlan.intervalType)}
                </span>{" "}
                (solo puedes ajustar la cantidad de intervalos en este formulario).
              </p>
            )}
          </div>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              void handleEditSubmit();
            }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4 sm:px-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                <div>
                  <Label htmlFor="memb-edit-nombre">Nombre</Label>
                  <Input
                    type="text"
                    id="memb-edit-nombre"
                    placeholder="Nombre del plan"
                    value={editFormik.values.name}
                    hint={
                      editFormik.touched.name && editFormik.errors.name
                        ? editFormik.errors.name
                        : ""
                    }
                    error={!!(editFormik.touched.name && editFormik.errors.name)}
                    onChange={(e) =>
                      editFormik.setFieldValue("name", e.target.value)
                    }
                    onBlur={() => editFormik.setFieldTouched("name", true)}
                  />
                </div>
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="memb-edit-precio">Precio</Label>
                    <Input
                      type="text"
                      id="memb-edit-precio"
                      placeholder="0.00"
                      hint={
                        editFormik.touched.price && editFormik.errors.price
                          ? String(editFormik.errors.price)
                          : ""
                      }
                      error={
                        !!(editFormik.touched.price && editFormik.errors.price)
                      }
                      value={
                        editFormik.values.price === 0
                          ? ""
                          : String(editFormik.values.price)
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          editFormik.setFieldValue("price", 0);
                          return;
                        }
                        if (regexNum.test(v)) {
                          editFormik.setFieldValue("price", Number(v));
                        }
                      }}
                      onBlur={() => editFormik.setFieldTouched("price", true)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="memb-edit-interval-count">
                      Cantidad de intervalos
                    </Label>
                    <Input
                      type="text"
                      id="memb-edit-interval-count"
                      placeholder="1"
                      hint={
                        editFormik.touched.intervalCount &&
                        editFormik.errors.intervalCount
                          ? String(editFormik.errors.intervalCount)
                          : ""
                      }
                      error={
                        !!(
                          editFormik.touched.intervalCount &&
                          editFormik.errors.intervalCount
                        )
                      }
                      value={
                        editFormik.values.intervalCount === 0
                          ? ""
                          : String(editFormik.values.intervalCount)
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          editFormik.setFieldValue("intervalCount", 0);
                          return;
                        }
                        if (regexEntero.test(v)) {
                          editFormik.setFieldValue("intervalCount", Number(v));
                        }
                      }}
                      onBlur={() =>
                        editFormik.setFieldTouched("intervalCount", true)
                      }
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
                  <Checkbox
                    id="memb-edit-available-all"
                    label="Disponible para todos"
                    checked={editFormik.values.availableAll}
                    onChange={(c) =>
                      editFormik.setFieldValue("availableAll", c)
                    }
                  />
                  <Checkbox
                    id="memb-edit-access-finished"
                    label="Acceso finalizado"
                    checked={editFormik.values.accessFinished}
                    onChange={(c) =>
                      editFormik.setFieldValue("accessFinished", c)
                    }
                  />
                  <Checkbox
                    id="memb-edit-is-active"
                    label="Plan activo"
                    checked={editFormik.values.isActive}
                    onChange={(c) => editFormik.setFieldValue("isActive", c)}
                  />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 bg-white/95 px-5 pb-6 pt-5 dark:border-gray-800 dark:bg-gray-900/95 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-6">
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={editFormik.isSubmitting}
                onClick={() => {
                  setEditOpen(false);
                  editFormik.resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" type="submit" disabled={editFormik.isSubmitting}>
                {editFormik.isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </form>
          {editFormik.isSubmitting && <LoaderFun absolute />}
        </div>
      </Modal>
    </section>
  );
}

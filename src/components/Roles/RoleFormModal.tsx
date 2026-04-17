import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import type { RoleAccess } from "../../Types/Roles.types";
import type { RoleFormValues } from "./roleFormUtils";
import {
  roleSchema,
  getInitialValues,
  setItemActivo,
} from "./roleFormUtils";
import Checkbox from "../form/input/Checkbox";

type RoleFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  editing: RoleAccess | null;
  /** Primer rol o plantilla para armar ítems en “nuevo rol” */
  menuTemplateForNew: import("../../Types/Roles.types").MenuAccessItemApi[] | null;
  onSubmit: (values: RoleFormValues) => void;
};

export default function RoleFormModal({
  isOpen,
  onClose,
  editing,
  menuTemplateForNew,
  onSubmit,
}: RoleFormModalProps) {
  const initial = getInitialValues(editing, menuTemplateForNew);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl w-full m-4 p-6 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        {editing ? "Editar rol" : "Nuevo rol"}
      </h2>

      <Formik
        initialValues={initial}
        validationSchema={roleSchema}
        onSubmit={(values) => onSubmit(values)}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del rol
              </label>
              <Field
                name="role"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Ej. Admin, Editor"
              />
              {touched.role && errors.role && (
                <p className="text-sm text-red-600 mt-1">{errors.role}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Acceso al menú
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Marca el ítem para permitir <strong>ver la página</strong>.
                Despliega cada ítem para activar permisos. Si desactivas el ítem,
                todos sus permisos se desactivan.
              </p>

              {values.menuAccess.length === 0 ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  No hay plantilla de menú. Asegúrate de que exista al menos un
                  rol en el sistema para copiar la estructura.
                </p>
              ) : (
                <div className="space-y-2">
                  {values.menuAccess.map((item, itemIndex) => {
                    const expanded = !!expandedIds[item.id];
                    return (
                      <div
                        key={item.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
                      >
                        <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                          <Checkbox
                            checked={item.activo}
                            onChange={(checked) => {
                              const next = setItemActivo(
                                values.menuAccess,
                                item.id,
                                checked,
                              );
                              setFieldValue("menuAccess", next);
                            }}
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.activo ? "Ver página" : "Sin acceso"}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 min-w-[120px]">
                            {item.text}
                          </span>
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-sm ml-auto"
                            onClick={() =>
                              setExpandedIds((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
                          >
                            {expanded ? "Ocultar permisos ▲" : "Permisos ▼"}
                          </button>
                        </div>
                        {expanded && (
                          <div className="px-3 pb-3 pt-0 border-t border-gray-100 dark:border-gray-700 space-y-2">
                            {item.permisos.length === 0 ? (
                              <p className="text-xs text-gray-500 pt-2">
                                Sin permisos adicionales para este ítem.
                              </p>
                            ) : (
                              item.permisos.map((perm, permIndex) => (
                                <div
                                  key={perm.id}
                                  className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {perm.nombrePermiso}
                                  </span>
                                  <Checkbox
                                    checked={perm.activo}
                                    disabled={!item.activo}
                                    onChange={(checked) => {
                                      const nextMenu = [...values.menuAccess];
                                      const nextPermisos = [
                                        ...nextMenu[itemIndex].permisos,
                                      ];
                                      nextPermisos[permIndex] = {
                                        ...nextPermisos[permIndex],
                                        activo: checked,
                                      };
                                      nextMenu[itemIndex] = {
                                        ...nextMenu[itemIndex],
                                        permisos: nextPermisos,
                                      };
                                      setFieldValue("menuAccess", nextMenu);
                                    }}
                                  />
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm">
                {editing ? "Guardar" : "Crear"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

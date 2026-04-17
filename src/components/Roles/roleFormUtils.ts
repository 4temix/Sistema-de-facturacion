import * as Yup from "yup";
import type {
  MenuAccessItemApi,
  RoleAccess,
  RolePermisoApi,
} from "../../Types/Roles.types";

export const roleSchema = Yup.object({
  role: Yup.string().required("Requerido"),
});

export type RoleFormValues = {
  role: string;
  menuAccess: MenuAccessItemApi[];
};

/** Clona la estructura del menú con todo desactivado (plantilla para “nuevo rol”) */
export function emptyMenuFromTemplate(
  template: MenuAccessItemApi[],
): MenuAccessItemApi[] {
  return template.map((item) => ({
    ...item,
    text: item.text,
    activo: false,
    permisos: item.permisos.map((p) => ({ ...p, activo: false })),
  }));
}

export function getInitialValues(
  editing: RoleAccess | null,
  menuTemplateForNew: MenuAccessItemApi[] | null,
): RoleFormValues {
  if (editing) {
    return {
      role: editing.role,
      menuAccess: editing.menuAccess.map((item) => ({
        ...item,
        permisos: item.permisos.map((p) => ({ ...p })),
      })),
    };
  }
  if (menuTemplateForNew && menuTemplateForNew.length > 0) {
    return {
      role: "",
      menuAccess: emptyMenuFromTemplate(menuTemplateForNew),
    };
  }
  return {
    role: "",
    menuAccess: [],
  };
}

export function formValuesToApiRole(
  values: RoleFormValues,
  existingId?: number,
): RoleAccess {
  return {
    id: existingId ?? 0,
    role: values.role,
    menuAccess: values.menuAccess,
  };
}

/** Si el ítem se desactiva, desactiva todos sus permisos */
export function setItemActivo(
  menuAccess: MenuAccessItemApi[],
  itemId: number,
  activo: boolean,
): MenuAccessItemApi[] {
  return menuAccess.map((item) => {
    if (item.id !== itemId) return item;
    const nextPermisos: RolePermisoApi[] = activo
      ? item.permisos.map((p) => ({ ...p }))
      : item.permisos.map((p) => ({ ...p, activo: false }));
    return { ...item, activo, permisos: nextPermisos };
  });
}

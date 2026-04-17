import { useEffect, useState, useMemo } from "react";
import { FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
import type { RoleAccess } from "../../Types/Roles.types";
import Button from "../../components/ui/button/Button";
import { useRolesList } from "../../components/Roles/useRolesList";
import { formValuesToApiRole } from "../../components/Roles/roleFormUtils";
import type { RoleFormValues } from "../../components/Roles/roleFormUtils";
import RoleFormModal from "../../components/Roles/RoleFormModal";
import RolesTable from "../../components/Roles/RolesTable";
import { apiRequestThen } from "../../Utilities/FetchFuntions";

const API_UPDATE_ROLE = "api/v1/role";

export default function RoleAdministration() {
  const {
    roles,
    loading: loadingRoles,
    error: rolesError,
    refetch,
  } = useRolesList();
  const [editing, setEditing] = useState<RoleAccess | null>(null);
  const [showForm, setShowForm] = useState(false);

  const menuTemplateForNew = useMemo(() => {
    if (!roles.length) return null;
    return roles[0].menuAccess.map((item) => ({
      ...item,
      permisos: item.permisos.map((p) => ({ ...p })),
    }));
  }, [roles]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSubmit = async (values: RoleFormValues) => {
    const payload = formValuesToApiRole(values, editing?.id);

    if (editing) {
      try {
        const res = await apiRequestThen<unknown>({
          url: API_UPDATE_ROLE,
          configuration: {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        });
        if (res.success) {
          setShowForm(false);
          setEditing(null);
          await refetch();
          void Swal.fire({
            icon: "success",
            title: "Rol actualizado",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          void Swal.fire({
            icon: "error",
            title: "Error",
            text: res.errorMessage ?? "No se pudo guardar el rol",
          });
        }
      } catch (err) {
        console.error(err);
        void Swal.fire({
          icon: "error",
          title: "Error",
          text: err instanceof Error ? err.message : "Error de conexión",
        });
      }
    } else {
      void Swal.fire({
        icon: "info",
        title: "Crear rol",
        text: "El alta de nuevos roles no está disponible por API en este momento. Solo se puede editar un rol existente (PUT).",
      });
    }
  };

  const handleDelete = (r: RoleAccess) => {
    const nombre = r.role;
    if (window.confirm(`¿Eliminar rol "${nombre}"?`)) {
      void Swal.fire({
        icon: "info",
        title: "No disponible",
        text: "Eliminación de roles no implementada.",
      });
    }
  };

  return (
    <section>
      <article className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Administración de roles
        </h2>
        <Button
          size="sm"
          variant="primary"
          className="inline-flex items-center gap-2"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          disabled={!menuTemplateForNew?.length}
        >
          <FiPlus size={18} />
          Nuevo rol
        </Button>
      </article>

      {rolesError && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          {rolesError}
        </p>
      )}

      <RoleFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        editing={editing}
        menuTemplateForNew={menuTemplateForNew}
        onSubmit={handleSubmit}
      />

      <RolesTable
        data={roles}
        loading={loadingRoles}
        onEdit={(r) => {
          setEditing(r);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    </section>
  );
}

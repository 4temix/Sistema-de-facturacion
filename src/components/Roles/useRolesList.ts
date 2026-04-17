import { useState, useCallback } from "react";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import type { RoleAccess } from "../../Types/Roles.types";

const API_ROLES = "api/v1/role";

export function useRolesList() {
  const [roles, setRoles] = useState<RoleAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequestThen<RoleAccess[]>({ url: API_ROLES });
      if (res.success && res.result != null) {
        setRoles(Array.isArray(res.result) ? res.result : []);
      } else {
        setError(res.errorMessage ?? "Error al cargar roles");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  return { roles, loading, error, refetch };
}

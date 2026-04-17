/** Respuesta GET/PUT /api/v1/role */
export type RolePermisoApi = {
  nombrePermiso: string;
  id: number;
  activo: boolean;
};

export type MenuAccessItemApi = {
  text: string;
  id: number;
  activo: boolean;
  permisos: RolePermisoApi[];
};

export type RoleAccess = {
  id: number;
  role: string;
  menuAccess: MenuAccessItemApi[];
};

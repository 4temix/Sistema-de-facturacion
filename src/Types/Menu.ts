export interface Permission {
  id: number;
  nombrePermiso: string;
  activo: boolean;
}

export interface SubMenu {
  id: number;
  text: string;
  url: string;
  permisos: Permission[];
}

export interface MenuSection {
  id: number;
  seccion: string;
  submenus: SubMenu[];
}

export type Menu = MenuSection[];

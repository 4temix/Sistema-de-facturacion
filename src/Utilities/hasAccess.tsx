import { Menu } from "../Types/Menu";

export const hasAccess = (
  menu: Menu,
  path: string,
  requiredPermission?: string
): boolean => {
  // Normalizar la ruta eliminando trailing slashes
  const normalizedPath = path.replace(/\/$/, "");

  for (const section of menu) {
    for (const submenu of section.submenus) {
      const menuUrl = submenu.url.replace(/\/$/, "");

      // Comparación exacta
      if (menuUrl === normalizedPath) {
        if (!requiredPermission) return true;

        return submenu.permisos.some(
          (p) => p.nombrePermiso === requiredPermission && p.activo
        );
      }

      // Para rutas dinámicas, comparar la ruta base
      // Ejemplo: /inventario/2 debería coincidir con /inventario
      const menuSegments = menuUrl.split("/").filter(Boolean);
      const pathSegments = normalizedPath.split("/").filter(Boolean);

      if (menuSegments.length > 0 && pathSegments.length > 0) {
        // Comparar el primer segmento (ruta base)
        if (menuSegments[0] === pathSegments[0]) {
          // Si la ruta del menú es más corta o igual, es válida
          // Ejemplo: /inventario coincide con /inventario/2
          if (pathSegments.length >= menuSegments.length) {
            if (!requiredPermission) return true;

            return submenu.permisos.some(
              (p) => p.nombrePermiso === requiredPermission && p.activo
            );
          }
        }
      }
    }
  }
  return false;
};

# Bloqueo de rutas y comprobación de acceso

Regla de referencia para proteger rutas (requieren login) y opcionalmente comprobar permisos por ruta. El código de referencia viene del proyecto facturacion (free-react-tailwind-admin-dashboard); se puede combinar con el AuthContext del hotel usando `useAuth()` y `menus`.

## Patrón general

1. **ProtectedRoute**: componente que envuelve la ruta; comprueba si hay sesión (token + usuario) y, opcionalmente, si el usuario tiene acceso a esa ruta según el menú y un permiso opcional.
2. **hasAccess(menu, path, permission?)**: función pura que recibe el menú del usuario, la ruta actual y un permiso opcional; devuelve si el usuario puede acceder.
3. **App/rutas**: cada ruta protegida se envuelve en `<ProtectedRoute>` (y opcionalmente se pasa `permission`). Las rutas de login/signup van fuera del layout protegido.

---

## Código de referencia (tal cual en facturacion)

### 1. App.tsx – Rutas con ProtectedRoute

```tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy } from "react";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AuthProvider } from "./context/GlobalUserContext";
import { ProtectedRoute } from "./Utilities/ProtectedRouteProps";

const Home = lazy(() => import("./pages/Dashboard/Home"));
const Productos = lazy(() => import("./pages/Gestion/Productos"));
const Facturacion = lazy(() => import("./pages/Gestion/Facturacion"));
// ... más lazy imports

const routes = createBrowserRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <AppLayout />
      </>
    ),
    children: [
      {
        index: true,
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/inventario",
        element: (
          <ProtectedRoute>
            <Productos />
          </ProtectedRoute>
        ),
      },
      {
        path: "/inventario/:id",
        element: (
          <ProtectedRoute>
            <PageDetailsProductos />
          </ProtectedRoute>
        ),
      },
      {
        path: "/facturacion",
        element: (
          <ProtectedRoute>
            <Facturacion />
          </ProtectedRoute>
        ),
      },
      // ... más rutas envueltas en <ProtectedRoute>
      // Algunas rutas sin proteger (dentro del layout):
      // { path: "/calendar", element: <Calendar /> },
    ],
  },

  // Auth sin proteger
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },

  { path: "/404", element: <NotFound /> },
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <RouterProvider router={routes} />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
```

### 2. ProtectedRouteProps.tsx – Componente que bloquea la ruta y comprueba acceso

```tsx
import { Navigate, useLocation } from "react-router-dom";
import { hasAccess } from "./hasAccess";
import { JSX } from "react";
import { useUserData } from "../context/GlobalUserContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { menu, isLoading, isAuthenticated, token, user } = useUserData();
  const location = useLocation();

  // Mostrar loader mientras se valida la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Verificar token en estado o localStorage (por si el estado aún no se actualizó)
  const tokenFromStorage = localStorage.getItem("token");
  const hasToken = token || tokenFromStorage;

  // Si no hay token o no está autenticado (sin usuario en contexto), redirigir al login
  if (!hasToken || !isAuthenticated || !user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Verificar permisos solo si hay menú disponible
  // Si el menú está vacío, permitir el acceso (puede estar cargando)
  if (menu.length > 0) {
    const allowed = hasAccess(menu, location.pathname, permission);

    if (!allowed) {
      return <Navigate to="/404" replace />;
    }
  }

  return children;
}
```

### 3. hasAccess.tsx – Función que comprueba si la ruta está en el menú y el permiso

```tsx
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
```

---

## Cómo combinarlo con AuthContext (proyecto hotel)

En el hotel el contexto expone `useAuth()` con `user`, `menus`, `isInitialized`, `login`, `logout`. No hay `isLoading` ni `token` expuestos; el menú es `menus` (array de MenuSection).

- **Equivalencias**:
  - `useUserData()` → `useAuth()`
  - `menu` → `menus` (mismo tipo: array de secciones con submenus y permisos)
  - `isLoading` → `!isInitialized`
  - `isAuthenticated` / `user` → `!!user`
  - `token` → se puede comprobar `localStorage.getItem("token")` si se quiere redundancia.

- **ProtectedRoute adaptado al hotel** (opción con permiso opcional y hasAccess):
  - Si `!isInitialized`: mostrar loader (como en la referencia).
  - Si no hay `user` (y opcionalmente no hay token en localStorage): `<Navigate to="/login" replace state={{ from: location }} />`.
  - Si `menus.length > 0` y se quiere comprobar acceso por ruta: llamar a `hasAccess(menus, location.pathname, permission)`; si devuelve false, `<Navigate to="/404" replace />`.
  - En caso contrario, renderizar `children`.

- **hasAccess en el hotel**: el tipo `Menu` en facturacion es equivalente a `MenuSection[]` (src/types/Menu.ts: submenus[].url, submenus[].permisos[].nombrePermiso, .activo). Se puede reutilizar la misma función importando el tipo desde `src/types/Menu.ts` (Menu = MenuSection[]).

- **Rutas en el hotel**: en App.tsx se usa Layout + Outlet; las rutas hijas pueden envolver cada elemento en `<ProtectedRoute>` o envolver una vez el `<Outlet />` dentro del Layout. Si se usa permiso por ruta, pasar `permission` donde haga falta, por ejemplo `<ProtectedRoute permission="editar">`.

Resumen: la regla de auth-context explica cómo se guarda y se expone el usuario y los menús; esta regla define cómo usar esa data para bloquear rutas y comprobar acceso, con el código de referencia copiado y la adaptación al AuthContext del hotel.

# Estructura del proyecto

La estructura debe ser clara, con responsabilidades separadas por carpetas. Mantener esta organización al añadir páginas, componentes o módulos.

## Árbol de referencia (src/)

```
src/
├── App.tsx                 # Rutas, Layout, ProtectedRoute
├── main.tsx
├── style.css               # Estilos globales
│
├── pages/                  # Una página por ruta (pantalla completa)
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Bienvenida.tsx
│   ├── BienvenidaSlug.tsx
│   ├── BienvenidaSlugFloor.tsx
│   ├── Reservaciones.tsx
│   ├── Restaurantes.tsx
│   ├── Usuarios.tsx
│   └── Roles.tsx
│
├── components/             # Componentes reutilizables y por feature
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ProtectedRoute.tsx
│   ├── ScreenGuard.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── PasswordInput.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── Toggle.tsx
│   ├── Collapsible.tsx
│   │
│   ├── ui/                 # Primitivas de UI (tablas, paginación, visor columnas)
│   │   ├── DataTable.tsx
│   │   ├── ColumnVisibilityToggle.tsx
│   │   └── Pagination.tsx
│   │
│   ├── Bienvenida/
│   │   ├── index.tsx           # Vista principal / lista
│   │   ├── CreateFloorModal.tsx
│   │   ├── useRestaurantDetails.ts
│   │   ├── useRestaurantDashboard.ts
│   │   └── FloorEditor/        # Subcarpeta por subdominio (editor de pisos)
│   │       ├── FloorEditor.tsx
│   │       ├── FloorLayoutViewer.tsx
│   │       ├── WaitlistPanel.tsx
│   │       ├── floorEditorConstants.ts
│   │       └── *Modal.tsx      # Modales del editor
│   │
│   ├── Dashboard/
│   │   ├── index.tsx
│   │   └── AdminDashboard/
│   │       ├── index.tsx
│   │       ├── AdminDashboardHeader.tsx
│   │       └── Admin*.tsx      # Bloques del dashboard
│   │
│   ├── Reservaciones/
│   │   ├── CreateReservaModal.tsx
│   │   ├── EditReservaModal.tsx
│   │   ├── ViewReservaModal.tsx
│   │   └── ReservationsTable.tsx
│   │
│   ├── Restaurantes/
│   │   ├── index.tsx           # Contenedor de lista + acciones
│   │   ├── RestaurantFormModal.tsx
│   │   ├── RestaurantTable.tsx
│   │   ├── restaurantFormUtils.ts
│   │   └── useRestaurantsList.ts
│   │
│   ├── Usuarios/
│   │   ├── index.tsx
│   │   ├── UserFormModal.tsx
│   │   ├── UserTable.tsx
│   │   ├── userFormUtils.ts
│   │   ├── useUsersList.ts
│   │   └── useUserCreateSelects.ts
│   │
│   └── Roles/
│       ├── index.tsx
│       ├── RoleFormModal.tsx
│       ├── RolesTable.tsx
│       ├── roleFormUtils.ts
│       └── useRolesList.ts
│
├── context/                # Contextos React globales
│   ├── AuthContext.tsx
│   ├── PageHeaderContext.tsx
│   ├── DataContext.tsx
│   └── mockData.ts
│
├── hooks/                  # Hooks compartidos (auth, permisos, etc.)
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useAdminDashboardPermission.ts
│
├── types/                  # Tipos e interfaces por dominio
│   ├── index.ts
│   ├── forms.ts
│   ├── Users.types.ts
│   ├── Restaurant.types.ts
│   ├── RestaurantDetails.types.ts
│   ├── RestaurantDashboard.types.ts
│   ├── Roles.types.ts
│   ├── Menu.ts
│   └── Global.types.ts
│
├── utils/                  # Utilidades puras (fetch, rutas, constantes)
│   ├── FetchFunction.ts
│   ├── routes.ts
│   └── constants.ts
│
└── lib/                    # Datos/helpers específicos de un dominio (opcional)
    └── dashboard-data.ts
```

## Reglas por carpeta

### pages/
- **Una página por ruta**: cada archivo corresponde a una pantalla (ruta en App). Nombres en PascalCase.
- **Poca lógica de negocio**: la página orquesta estado local (modales, filtros, fecha), llama a hooks de datos y renderiza componentes de `components/`. No duplicar lógica que ya vive en hooks o en componentes de feature.
- **Imports**: desde `../components/...`, `../hooks/...`, `../types/...`, `../utils/...`.

### components/
- **Raíz de components**: componentes compartidos por toda la app (Layout, Header, Sidebar, Button, Input, Select, Modal, Card, ProtectedRoute, ScreenGuard, etc.). Un archivo por componente cuando es genérico.
- **components/ui/**: primitivas reutilizables (DataTable, Pagination, ColumnVisibilityToggle). Usadas por varias features.
- **Carpeta por feature/módulo** (Bienvenida, Dashboard, Reservaciones, Restaurantes, Usuarios, Roles):
  - **index.tsx**: vista principal del módulo (lista, filtros, botones de acción) o reexportaciones. La página en `pages/` puede importar este index o los hijos según convenga.
  - **XxxFormModal.tsx** / **XxxModal.tsx**: modales de formulario o detalle.
  - **XxxTable.tsx**: tabla de datos (usa DataTable + columnConfig + columnDefs).
  - **xxxFormUtils.ts**: validación (Yup), valores iniciales, mapeo API ↔ formulario. No poner lógica de API aquí; solo formas y transformaciones.
  - **useXxxList.ts**, **useXxxDetails.ts**, **useXxxSelects.ts**: hooks de datos/API o de opciones para selects, **vivos en la carpeta del feature** cuando son específicos de ese módulo. Si un hook es global (auth, permisos), va en `hooks/`.
- **Subcarpetas** (ej. Bienvenida/FloorEditor/, Dashboard/AdminDashboard/): cuando un feature tiene muchos archivos o un subdominio claro; mismo patrón (index, modales, tablas, utils, hooks locales).

### context/
- Contextos que envuelven la app o grandes zonas (Auth, PageHeader, Data). Un archivo por contexto. No poner lógica de UI; solo estado y setters que consumen las páginas/componentes.

### hooks/
- Hooks **compartidos** entre varias páginas o features: useAuth, usePermissions, etc. Los hooks que solo usa un módulo pueden vivir en `components/[Feature]/` (ej. useRestaurantDetails en Bienvenida, useUsersList en Usuarios).

### types/
- Tipos por dominio: `*.types.ts` o `Nombre.ts`. Formas de API, DTOs, valores de formulario. `forms.ts` para tipos compartidos de formularios (ej. Option). Reexportaciones en `index.ts` si hace falta.

### utils/
- Funciones puras: fetch/API (FetchFunction), mapeo de rutas, constantes. Sin React ni estado; importables desde cualquier parte.

### lib/
- Opcional: datos mock o helpers muy específicos de un dominio (ej. datos/transformaciones del dashboard).

## Convenciones de nombres

- **Páginas**: PascalCase, singular o plural según la ruta (Reservaciones, Usuarios, Restaurantes).
- **Componentes**: PascalCase (UserFormModal, ReservationsTable).
- **Hooks**: camelCase con prefijo `use` (useAuth, useRestaurantDetails, useUsersList).
- **Utils/helpers**: camelCase (FetchFunction.ts exporta apiRequestThen; formUtils en camelCase: userFormUtils, restaurantFormUtils).
- **Tipos**: PascalCase para interfaces/types; archivos pueden ser `Nombre.types.ts` o `Nombre.ts`.

## Dónde poner archivos nuevos

| Tipo | Ubicación |
|------|-----------|
| Nueva pantalla/ruta | `pages/NombrePantalla.tsx` |
| Componente genérico (botón, input, card) | `components/Nombre.tsx` |
| Tabla, paginación, visor columnas | `components/ui/` |
| Todo lo de un nuevo módulo (lista + modales + tabla + hooks) | `components/NombreModulo/` (con index, modales, table, formUtils, useXxx) |
| Subdominio dentro de un módulo | `components/NombreModulo/Subcarpeta/` |
| Contexto global | `context/NombreContext.tsx` |
| Hook usado en varios sitios | `hooks/useNombre.ts` |
| Hook solo de un módulo | `components/NombreModulo/useNombre.ts` |
| Tipos de un dominio | `types/Nombre.types.ts` o `types/Nombre.ts` |
| Fetch / rutas / constantes | `utils/` |

Mantener esta separación: páginas delgadas, lógica en hooks y en formUtils, componentes de feature agrupados por carpeta, tipos centralizados y utils sin dependencias de UI.

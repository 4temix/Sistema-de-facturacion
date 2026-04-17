# Contexto de usuario (auth): cómo se guarda y se expone la data

El estado del usuario logueado y los menús se mantienen en un contexto React y se persisten con tokens en `localStorage`. Cualquier componente o página puede leer `user`, `menus` e `isInitialized` y usar `login`/`logout` mediante el hook `useAuth`.

## Dónde está

- **Contexto y provider**: `src/context/AuthContext.tsx` (AuthProvider, useAuth).
- **Hook público**: `src/hooks/useAuth.ts` reexporta `useAuth` desde el contexto para que se importe desde `../hooks/useAuth`.
- **Montaje del provider**: En `src/main.tsx`, `AuthProvider` envuelve `App` (junto con BrowserRouter y DataProvider). Todo lo que esté dentro de la app puede usar `useAuth()`.

## Persistencia: tokens en localStorage

Solo se guardan los tokens; el usuario no se serializa en localStorage.

- **Claves**: `"token"` (access) y `"refreshToken"` (refresh).
- **Quién escribe**:
  - **Login**: tras un login correcto se hace `localStorage.setItem(STORAGE_TOKEN, result.token)` y `localStorage.setItem(STORAGE_REFRESH, result.refreshToken)`.
  - **Refresh** (en `FetchFunction.ts`): al renovar el token se vuelven a guardar con `localStorage.setItem("token", ...)` y `localStorage.setItem("refreshToken", ...)`.
- **Quién borra**:
  - **Logout**: `AuthContext` hace `localStorage.removeItem(STORAGE_TOKEN)` y `localStorage.removeItem(STORAGE_REFRESH)` y luego pone `user` y `menus` a `null`/`[]`.
  - Si al arrancar no hay token o la petición "user by id" falla, también se eliminan los tokens y se deja al usuario sin autenticar.

## Inicialización al cargar la app

1. Al montar `AuthProvider`, en un `useEffect` se lee `localStorage.getItem(STORAGE_TOKEN)`.
2. **Si no hay token**: se hace `dispatch({ type: "SET_AUTH", payload: { user: null, menus: [] } })` y luego `dispatch({ type: "INIT_DONE" })`. La app ve `user: null` e `isInitialized: true`.
3. **Si hay token**: se llama a `fetchCurrentUser()`:
   - Petición GET a `API_USER_BY_ID` (api/v1/user/by_id) con el token en cabecera (lo añade `apiRequestThen`).
   - Si la respuesta trae `userData.usuario`, se mapea con `mapUsuarioToAuthUser` a un `AuthUser` y se hace `dispatch({ type: "SET_AUTH", payload: { user: authUser, menus } })`.
   - Si falla o no hay usuario, se borran los tokens y se hace SET_AUTH con `user: null`, `menus: []`.
   - Al terminar (éxito o error), se hace `dispatch({ type: "INIT_DONE" })`.

Así la “data del usuario” disponible en la app viene siempre del estado del contexto, rehidratado desde la API usando el token guardado, no desde localStorage directamente.

## Estado del contexto (reducer)

- **Estado**: `user: AuthUser | null`, `menus: MenuSection[]`, `isInitialized: boolean`.
- **Acciones**: `SET_AUTH` (user + menus) e `INIT_DONE` (isInitialized = true).
- **Valor expuesto por el provider**: `user`, `menus`, `isInitialized`, `login`, `logout`.

## Login

- Se llama a `login(email, password)`.
- POST a `API_LOGIN` con `{ email, password }`.
- Si la respuesta es correcta y trae `token`, `refreshToken` y `userData`:
  - Se guardan los dos tokens en localStorage.
  - Se mapea `userData.usuario` + `userData.menus` a `AuthUser` y menús y se hace `SET_AUTH`.
- Si algo falla, no se guardan tokens y se devuelve `{ ok: false, error: mensaje }`. El estado de auth no cambia.

## Logout

- Se llama a `logout()`.
- Se eliminan `token` y `refreshToken` de localStorage.
- Se hace `SET_AUTH` con `user: null` y `menus: []`. No se llama a ninguna API.

## Cómo consumir la data en la app

Siempre usar el hook; no importar el contexto directamente en componentes:

```ts
import { useAuth } from "../hooks/useAuth";  // o la ruta que corresponda

function MiComponente() {
  const { user, menus, isInitialized, login, logout } = useAuth();

  // user: AuthUser | null → nombre, email, rol, restaurante, restauranteId, etc.
  // menus: MenuSection[] → menú de navegación y permisos por pantalla
  // isInitialized: boolean → true cuando ya se comprobó el token (o no hay token)
  // login(email, password) → Promise<{ ok: boolean; error?: string }>
  // logout() → void
}
```

Debe usarse dentro de un árbol envuelto por `AuthProvider`; si no, `useAuth` lanza.

## Tipos relevantes

- **AuthUser** (`src/types/index.ts`): extiende `User` y añade `rol: Role` y `restaurante?: Restaurant`. Incluye `id`, `nombre`, `email`, `rolId`, `restauranteId`, `rol`, `restaurante`, etc.
- **MenuSection**: estructura de menú con submenus y permisos; la usa el Sidebar y la lógica de permisos por pantalla.
- **ScreenPermission** / **ScreenId**: para saber si el usuario puede “ver”, “editar” o “eliminar” en cada pantalla (ver regla de permisos si existe).

## Resumen

| Qué | Dónde |
|-----|--------|
| Guardar sesión | Solo tokens en localStorage (`token`, `refreshToken`). |
| Datos del usuario en memoria | Estado del AuthContext: `user`, `menus`, `isInitialized`. |
| Rehidratar al cargar | Si hay token → GET user by id → SET_AUTH con user y menus; si no hay token o falla → SET_AUTH null y borrar tokens. |
| Usar en componentes | `useAuth()` desde `hooks/useAuth`; leer `user`, `menus`, `isInitialized` y llamar `login`/`logout`. |
| Provider | `AuthProvider` en `main.tsx` envolviendo `App`. |

No guardar el objeto `user` en localStorage; solo los tokens. La fuente de verdad del usuario es el estado del contexto, rellenado por login o por `fetchCurrentUser` al iniciar.

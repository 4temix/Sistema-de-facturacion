# Fetch y hooks de API

## Cómo está creado `src/utils/FetchFunction.ts`

- **Tipo de respuesta estándar**: `ApiResponse<T>` con `success`, `errorMessage?` y `result?`.
- **Función principal**: `apiRequestThen<T>({ url, configuration?: RequestInit }): Promise<ApiResponse<T>>`.
- **Refresh en 401**, **processResponse** para 400/403/500 y éxito.

Al crear nuevas funciones de API o hooks que llamen al backend, usar siempre `apiRequestThen` y el tipo `ApiResponse<T>`. No usar `fetch` directo para APIs autenticadas.

### Código de referencia: documento completo `src/utils/FetchFunction.ts`

```ts
import type { LoginResponse } from "../types/Users.types";

export interface ApiResponse<T> {
  success: boolean;
  errorMessage?: string;
  result?: T;
}

interface FetchParams {
  url: string;
  configuration?: RequestInit;
}

let baseUrl = "https://localhost:7114/";

export async function apiRequestThen<T>({
  url,
  configuration = {},
}: FetchParams): Promise<ApiResponse<T>> {
  const accessToken = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(configuration.headers as HeadersInit),
  };

  const response = await fetch(baseUrl + url, {
    ...configuration,
    headers,
  });

  // ⛔ Token expirado
  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      return {
        success: false,
        errorMessage: "Sesión expirada",
      };
    }

    // 🔁 Reintento automático
    return apiRequestThen<T>({
      url,
      configuration,
    });
  }

  return processResponse<T>(response);
}

export async function refreshAccessToken(): Promise<LoginResponse | null> {
  const peticion = await fetch(baseUrl + "api/user/refresh", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
    },
  });

  const data: ApiResponse<LoginResponse> = await peticion.json();

  if (!data.success) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/signin";
    return null;
  }

  localStorage.setItem("token", data.result?.token ?? "");
  localStorage.setItem("refreshToken", data.result?.refreshToken ?? "");

  return data.result ?? null;
}

/**
 * Función auxiliar para procesar respuestas HTTP
 */
async function processResponse<T>(res: Response): Promise<ApiResponse<T>> {
  // Manejo de errores HTTP
  if (res.status === 401) {
    return { success: false, errorMessage: "Token inválido o expirado" };
  }
  if (res.status === 403) {
    return { success: false, errorMessage: "No autorizado" };
  }

  // Si la respuesta tiene un cuerpo JSON
  const json = await res.json().catch(() => null);

  if (res.status === 400 || res.status === 500) {
    const errorMsg =
      json?.error || json?.errorMessage || json?.detail || "Error inesperado";
    return { success: false, errorMessage: errorMsg };
  }

  // Caso normal (200 OK)
  const data = json as ApiResponse<T>;
  if (data?.success === false) {
    return { success: false, errorMessage: data.errorMessage };
  }

  return {
    success: true,
    result: data?.result ?? (data as unknown as T),
  };
}
```

## Uso opcional con hooks `use*`

Cuando se encapsula una petición en un hook: estado `data`, `loading`, `error`, `refetch`; constantes de API; patrón try/catch/finally; `useEffect` para cargar al montar. Las funciones que no son hooks (create, update) pueden vivir en el mismo archivo y usar `apiRequestThen` con `method`, `body`, etc.

### Código de referencia: hook `useRestaurantDashboard` (src/components/Bienvenida/useRestaurantDashboard.ts)

```ts
import { useState, useCallback, useEffect } from "react";
import { apiRequestThen } from "../../utils/FetchFunction";
import type { RestaurantDashboardResult } from "../../types/RestaurantDashboard.types";

const API_RESTAURANT_DASHBOARD = "api/v1/restaurant/restaurante_dashboard";

export function useRestaurantDashboard() {
  const [data, setData] = useState<RestaurantDashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequestThen<RestaurantDashboardResult>({
        url: API_RESTAURANT_DASHBOARD,
      });
      if (res.success && res.result != null) {
        setData(res.result);
      } else {
        setError(res.errorMessage ?? "Error al cargar el dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
```

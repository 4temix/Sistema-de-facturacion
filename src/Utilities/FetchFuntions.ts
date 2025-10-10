// utils/apiRequest.ts

export interface ApiResponse<T> {
  success: boolean;
  errorMessage?: string;
  result?: T;
}

interface FetchParams {
  url: string;
  configuration?: RequestInit;
}

export const baseUrl = "https://localhost:7114/";

/**
 * Función genérica y tipada para hacer peticiones HTTP con async/await
 * Compatible con la clase Response<T> del backend en C#
 */
export async function apiRequest<T>({
  url,
  configuration,
}: FetchParams): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(baseUrl + url, configuration);

    // Manejo de códigos de estado HTTP
    if (res.status === 401) {
      return { success: false, errorMessage: "Token inválido o expirado" };
    }

    if (res.status === 403) {
      return { success: false, errorMessage: "No autorizado" };
    }

    if (res.status === 400 || res.status === 500) {
      try {
        const json = await res.json();
        const errorMsg =
          json?.error ||
          json?.errorMessage ||
          json?.detail ||
          "Error inesperado";
        return { success: false, errorMessage: errorMsg };
      } catch {
        return {
          success: false,
          errorMessage: "Error inesperado del servidor",
        };
      }
    }

    // Intentar procesar la respuesta JSON
    const json = (await res.json()) as ApiResponse<T>;

    // Si el backend devuelve un Response<T> de C#
    if (json.success === false) {
      return {
        success: false,
        errorMessage: json.errorMessage || "Error desconocido del servidor",
      };
    }

    // Retorna el resultado correctamente tipado
    return {
      success: true,
      result: json.result ?? (json as unknown as T),
    };
  } catch (error) {
    console.error("Error de conexión:", error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}

export function apiRequestThen<T>({
  url,
  configuration,
}: FetchParams): Promise<ApiResponse<T>> {
  console.log(configuration);

  return fetch(baseUrl + url, configuration)
    .then(async (res): Promise<ApiResponse<T>> => {
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
          json?.error ||
          json?.errorMessage ||
          json?.detail ||
          "Error inesperado";
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
    })
    .catch(
      (error): ApiResponse<T> => ({
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
    );
}

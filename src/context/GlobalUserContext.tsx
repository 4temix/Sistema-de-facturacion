import { createContext, useContext, useEffect } from "react";
import { LoginResponse, User } from "../Types/Usuario";
import { Menu } from "../Types/Menu";
import { useState, useCallback } from "react";
import { apiRequest, refreshAccessToken } from "../Utilities/FetchFuntions";

export interface AuthContextType {
  user: User | null;
  menu: Menu;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

type AuthState = {
  user: User | null;
  menu: Menu;
  token: string | null;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    menu: [],
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validar token y obtener datos del usuario al iniciar la aplicación
  useEffect(() => {
    const validateTokenAndLoadUser = async () => {
      // Si estamos en la página de login o signup, no validar token
      if (
        window.location.pathname === "/signin" ||
        window.location.pathname === "/signup"
      ) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Primero establecer el token en el estado
        setAuth({
          user: null,
          menu: [],
          token: token,
        });

        // Hacer petición para obtener los datos del usuario usando apiRequest
        // Agregar el token a los headers manualmente
        const response = await apiRequest<any>({
          url: "api/user/by_id",
          configuration: {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        });

        let responseData = response.result;
        if (!response.success || !response.result) {
          // Si la respuesta no es exitosa, limpiar tokens y redirigir al login
          let data = await refreshAccessToken();
          responseData = data;
        }

        if (!responseData) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          setAuth({
            user: null,
            menu: [],
            token: null,
          });
          // El finally establecerá isLoading en false
          window.location.href = "/signin";
          return;
        }

        // La respuesta viene como { token, refreshToken, userData: { usuario, menus } }
        const responseToken = responseData.token;
        const responseRefreshToken = responseData.refreshToken;
        const responseUser = responseData.userData?.usuario;
        const responseMenu = responseData.userData?.menus || [];

        // Si no hay usuario, limpiar y salir
        if (!responseUser) {
          throw new Error("No se pudo obtener los datos del usuario");
        }

        const currentRefreshToken =
          localStorage.getItem("refreshToken") || refreshToken;

        const userData: LoginResponse = {
          token: (responseToken as string) || token,
          refreshToken: (responseRefreshToken as string) || currentRefreshToken,
          user: responseUser as User,
          menu: (Array.isArray(responseMenu) ? responseMenu : []) as Menu,
        };

        // Actualizar tokens si vienen nuevos
        if (userData.token && userData.token !== token) {
          localStorage.setItem("token", userData.token);
        }
        if (
          userData.refreshToken &&
          userData.refreshToken !== currentRefreshToken
        ) {
          localStorage.setItem("refreshToken", userData.refreshToken);
        }

        // Actualizar el estado
        setAuth({
          user: userData.user,
          menu: userData.menu,
          token: userData.token || token,
        });
      } catch (error) {
        // Si hay error, limpiar tokens y redirigir al login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setAuth({
          user: null,
          menu: [],
          token: null,
        });
        window.location.href = "/signin";
      } finally {
        // Asegurar que siempre se establezca isLoading en false
        setIsLoading(false);
      }
    };

    validateTokenAndLoadUser();
  }, []);

  const login = useCallback((data: LoginResponse) => {
    // Validar datos esenciales
    if (!data.token || !data.refreshToken || !data.user) {
      throw new Error("Datos incompletos para realizar el login");
    }

    // Guardar tokens en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    // Guardar datos del usuario y menú en el estado
    setAuth({
      user: data.user,
      menu: Array.isArray(data.menu) ? data.menu : [],
      token: data.token,
    });
  }, []);

  const logout = useCallback(() => {
    setAuth({
      user: null,
      menu: [],
      token: null,
    });

    // Solo eliminar los tokens del localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }, []);

  const value = {
    user: auth.user,
    menu: auth.menu,
    token: auth.token,
    isLoading,
    isAuthenticated: !!auth.token && !!auth.user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ Hook personalizado para usar el contexto
export function useUserData() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUserData debe usarse dentro de AuthProvider");
  }
  return context;
}

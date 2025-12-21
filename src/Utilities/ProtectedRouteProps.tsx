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

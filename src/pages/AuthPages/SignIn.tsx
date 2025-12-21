import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useUserData } from "../../context/GlobalUserContext";

export default function SignIn() {
  const { isAuthenticated, isLoading, token } = useUserData();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (!isLoading && (isAuthenticated || token)) {
      console.log("Usuario ya autenticado, redirigiendo...");
    }
  }, [isAuthenticated, isLoading, token]);

  // Si ya está autenticado, redirigir
  if (!isLoading && (isAuthenticated || token)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}

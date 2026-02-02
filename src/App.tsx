import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy } from "react";

// Layout principal
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AuthProvider } from "./context/GlobalUserContext";
import { ProtectedRoute } from "./Utilities/ProtectedRouteProps";

// lazy loading para cada página
const Home = lazy(() => import("./pages/Dashboard/Home"));
const Productos = lazy(() => import("./pages/Gestion/Productos"));
const Facturacion = lazy(() => import("./pages/Gestion/Facturacion"));
const Gastos = lazy(() => import("./pages/Gestion/Gastos"));
const Empleados = lazy(() => import("./pages/Gestion/Empleados"));
const Nominas = lazy(() => import("./pages/Gestion/Nominas"));
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const Blank = lazy(() => import("./pages/Blank"));
const Mantenimientos = lazy(
  () => import("./pages/Configuraciones/Mantenimientos"),
);
const Reportes = lazy(() => import("./pages/Reportes/Reportes"));
const PageDetailsProductos = lazy(
  () => import("./pages/Gestion/PageDetailsProductos"),
);
const DetailsYearPage = lazy(() => import("./pages/Reportes/DetailsYear"));
const DetailsMonth = lazy(() => import("./pages/Reportes/PageDetailsMonth"));
const UserAdministracion = lazy(
  () => import("./pages/Administracion/userAdministracion"),
);

// Definición de rutas
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
      //principal
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
      {
        path: "/gastos",
        element: (
          <ProtectedRoute>
            <Gastos />
          </ProtectedRoute>
        ),
      },
      {
        path: "/empleados",
        element: (
          <ProtectedRoute>
            <Empleados />
          </ProtectedRoute>
        ),
      },
      {
        path: "/nominas",
        element: (
          <ProtectedRoute>
            <Nominas />
          </ProtectedRoute>
        ),
      },
      {
        path: "/nominas/:id",
        element: (
          <ProtectedRoute>
            <Nominas />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mantenimientos",
        element: (
          <ProtectedRoute>
            <Mantenimientos />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reportes",
        element: (
          <ProtectedRoute>
            <Reportes />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reportes/:year",
        element: (
          <ProtectedRoute>
            <DetailsYearPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reportes/:year/:month",
        element: (
          <ProtectedRoute>
            <DetailsMonth />
          </ProtectedRoute>
        ),
      },

      // Others Page
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <UserProfiles />
          </ProtectedRoute>
        ),
      },

      //administracion
      {
        path: "/users-administracion",
        element: (
          <ProtectedRoute>
            <UserAdministracion />
          </ProtectedRoute>
        ),
      },
      { path: "/calendar", element: <Calendar /> },
      { path: "/blank", element: <Blank /> },

      // Forms
      { path: "/form-elements", element: <FormElements /> },

      // Tables
      { path: "/basic-tables", element: <BasicTables /> },

      // Ui Elements
      { path: "/alerts", element: <Alerts /> },
      { path: "/avatars", element: <Avatars /> },
      { path: "/badge", element: <Badges /> },
      { path: "/buttons", element: <Buttons /> },
      { path: "/images", element: <Images /> },
      { path: "/videos", element: <Videos /> },

      // Charts
      { path: "/line-chart", element: <LineChart /> },
      { path: "/bar-chart", element: <BarChart /> },
    ],
  },

  // Auth
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },

  // 404 Page
  { path: "/404", element: <NotFound /> },

  // Fallback 404
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

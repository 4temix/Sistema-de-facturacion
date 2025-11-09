import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy } from "react";

// Layout principal
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// lazy loading para cada página
const Home = lazy(() => import("./pages/Dashboard/Home"));
const Productos = lazy(() => import("./pages/Gestion/Productos"));
const Facturacion = lazy(() => import("./pages/Gestion/Facturacion"));
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
  () => import("./pages/Configuraciones/Mantenimientos")
);
const Reportes = lazy(() => import("./pages/Reportes/Reportes"));

const PageDetailsProductos = lazy(
  () => import("./pages/Gestion/PageDetailsProductos")
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
      { index: true, path: "/", element: <Home /> },
      //principal
      { path: "/inventario", element: <Productos /> },
      { path: "/inventario/:id", element: <PageDetailsProductos /> },
      { path: "/facturacion", element: <Facturacion /> },
      { path: "/mantenimientos", element: <Mantenimientos /> },
      { path: "/reportes", element: <Reportes /> },

      // Others Page
      { path: "/profile", element: <UserProfiles /> },
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

  // Fallback 404
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={routes} />
    </HelmetProvider>
  );
}

export default App;

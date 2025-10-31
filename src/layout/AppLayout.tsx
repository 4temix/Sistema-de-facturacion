import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { ScrollToTop } from "../components/common/ScrollToTop";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      {/* <LoaderFun /> */}
      {/* Sidebar + Backdrop */}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>

      {/* Contenido principal */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:pl-[290px]" : "lg:pl-[90px]"
        } ${isMobileOpen ? "pl-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      {/* ScrollToTop asegura que al cambiar de ruta el scroll se resetee */}
      <ScrollToTop />
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;

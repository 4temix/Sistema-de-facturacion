import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronDownIcon,
  HorizontaLDots,
  GridIcon,
  BoxCubeIcon,
  PieChartIcon,
  CalenderIcon,
  UserCircleIcon,
  DollarLineIcon,
  BoxIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  FileIcon,
  TaskIcon,
  GroupIcon,
  FolderIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useUserData } from "../context/GlobalUserContext";
import { MenuSection, SubMenu } from "../Types/Menu";
import SidebarWidget from "./SidebarWidget";

// Función para obtener icono según el nombre de la sección o submenú
const getIconForMenu = (menuName: string) => {
  const name = menuName.toLowerCase().trim();

  // Dashboard / Inicio
  if (
    name.includes("dashboard") ||
    name.includes("inicio") ||
    name.includes("home")
  ) {
    return <GridIcon />;
  }

  // Gestión / Administración
  if (
    name.includes("gestion") ||
    name.includes("gestión") ||
    name.includes("administracion") ||
    name.includes("admin")
  ) {
    return <BoxCubeIcon />;
  }

  // Reportes / Estadísticas
  if (
    name.includes("reporte") ||
    name.includes("estadistica") ||
    name.includes("estadística") ||
    name.includes("analisis") ||
    name.includes("análisis")
  ) {
    return <PieChartIcon />;
  }

  // Calendario
  if (
    name.includes("calendario") ||
    name.includes("calendar") ||
    name.includes("evento")
  ) {
    return <CalenderIcon />;
  }

  // Usuarios / Perfiles / Empleados
  if (
    name.includes("usuario") ||
    name.includes("user") ||
    name.includes("perfil") ||
    name.includes("empleado") ||
    name.includes("personal")
  ) {
    return <UserCircleIcon />;
  }

  // Facturación / Ventas / Compras
  if (
    name.includes("facturacion") ||
    name.includes("facturación") ||
    name.includes("venta") ||
    name.includes("compra") ||
    name.includes("invoice")
  ) {
    return <DollarLineIcon />;
  }

  // Inventario / Productos / Stock
  if (
    name.includes("inventario") ||
    name.includes("producto") ||
    name.includes("stock") ||
    name.includes("almacen") ||
    name.includes("almacén")
  ) {
    return <BoxIcon />;
  }

  // Gastos / Egresos
  if (
    name.includes("gasto") ||
    name.includes("egreso") ||
    name.includes("pago") ||
    name.includes("expense")
  ) {
    return <DollarLineIcon />;
  }

  // Nóminas / Salarios
  if (
    name.includes("nomina") ||
    name.includes("nómina") ||
    name.includes("salario") ||
    name.includes("payroll")
  ) {
    return <DollarLineIcon />;
  }

  // Formularios
  if (name.includes("formulario") || name.includes("form")) {
    return <ListIcon />;
  }

  // Tablas / Listados
  if (
    name.includes("tabla") ||
    name.includes("table") ||
    name.includes("listado") ||
    name.includes("lista")
  ) {
    return <TableIcon />;
  }

  // Configuración / Mantenimiento / Settings
  if (
    name.includes("configuracion") ||
    name.includes("configuración") ||
    name.includes("mantenimiento") ||
    name.includes("setting") ||
    name.includes("ajuste")
  ) {
    return <PageIcon />;
  }

  // Documentos / Archivos
  if (
    name.includes("documento") ||
    name.includes("archivo") ||
    name.includes("file") ||
    name.includes("doc")
  ) {
    return <FileIcon />;
  }

  // Tareas / Actividades
  if (
    name.includes("tarea") ||
    name.includes("actividad") ||
    name.includes("task")
  ) {
    return <TaskIcon />;
  }

  // Grupos / Equipos
  if (
    name.includes("grupo") ||
    name.includes("equipo") ||
    name.includes("team")
  ) {
    return <GroupIcon />;
  }

  // Carpetas / Categorías
  if (
    name.includes("carpeta") ||
    name.includes("categoria") ||
    name.includes("categoría") ||
    name.includes("folder")
  ) {
    return <FolderIcon />;
  }

  // Por defecto
  return <PageIcon />;
};

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { menu } = useUserData();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => {
      // Comparar rutas exactas o rutas base para rutas dinámicas
      if (location.pathname === path) return true;
      // Para rutas dinámicas como /inventario/2, comparar con /inventario
      const pathSegments = path.split("/").filter(Boolean);
      const locationSegments = location.pathname.split("/").filter(Boolean);
      if (pathSegments.length > 0 && locationSegments.length > 0) {
        return pathSegments[0] === locationSegments[0];
      }
      return false;
    },
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;

    // Verificar en el menú desde contexto
    if (menu && menu.length > 0) {
      menu.forEach((section: MenuSection, index: number) => {
        if (section.submenus && section.submenus.length > 0) {
          section.submenus.forEach((submenu: SubMenu) => {
            if (isActive(submenu.url)) {
              setOpenSubmenu({
                type: "main",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    }

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, menu]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: "main", index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          {menu && menu.length > 0 ? (
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              <ul className="flex flex-col gap-4">
                {menu.map((section: MenuSection, index: number) => {
                  return (
                    <li key={`${section.id}-${index}`}>
                      {section.submenus && section.submenus.length > 0 ? (
                        <>
                          <button
                            onClick={() => handleSubmenuToggle(index)}
                            className={`menu-item group ${
                              openSubmenu?.type === "main" &&
                              openSubmenu?.index === index
                                ? "menu-item-active"
                                : "menu-item-inactive"
                            } cursor-pointer ${
                              !isExpanded && !isHovered
                                ? "lg:justify-center"
                                : "lg:justify-start"
                            }`}
                          >
                            <span
                              className={`menu-item-icon-size ${
                                openSubmenu?.type === "main" &&
                                openSubmenu?.index === index
                                  ? "menu-item-icon-active"
                                  : "menu-item-icon-inactive"
                              }`}
                            >
                              {getIconForMenu(section.seccion)}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                              <span className="menu-item-text">
                                {section.seccion}
                              </span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                              <ChevronDownIcon
                                className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                  openSubmenu?.type === "main" &&
                                  openSubmenu?.index === index
                                    ? "rotate-180 text-brand-500"
                                    : ""
                                }`}
                              />
                            )}
                          </button>
                          {section.submenus &&
                            (isExpanded || isHovered || isMobileOpen) && (
                              <div
                                ref={(el) => {
                                  subMenuRefs.current[`main-${index}`] = el;
                                }}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                  height:
                                    openSubmenu?.type === "main" &&
                                    openSubmenu?.index === index
                                      ? `${subMenuHeight[`main-${index}`]}px`
                                      : "0px",
                                }}
                              >
                                <ul className="mt-2 space-y-1 ml-9">
                                  {section.submenus.map((submenu: SubMenu) => {
                                    if (submenu.text == "Perfil") {
                                      return "";
                                    }
                                    return (
                                      <li key={submenu.id}>
                                        <Link
                                          to={submenu.url}
                                          className={`menu-dropdown-item ${
                                            isActive(submenu.url)
                                              ? "menu-dropdown-item-active"
                                              : "menu-dropdown-item-inactive"
                                          }`}
                                        >
                                          {submenu.text}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                        </>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
              {isExpanded || isHovered || isMobileOpen
                ? "No hay menú disponible"
                : ""}
            </div>
          )}
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;

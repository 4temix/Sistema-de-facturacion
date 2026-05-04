import type React from "react";
import { useEffect, useRef } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** end: alineado a la derecha. centerMobile: centrado en móvil (perfil). custom: solo clases propias (p. ej. notificaciones). */
  placement?: "end" | "centerMobile" | "custom";
}

const placementLayout: Record<
  NonNullable<DropdownProps["placement"]>,
  string
> = {
  end: "right-0 left-auto translate-x-0",
  centerMobile:
    "left-1/2 right-auto w-[min(260px,calc(100vw-1.25rem))] max-w-[calc(100vw-1.25rem)] -translate-x-1/2 sm:left-auto sm:right-0 sm:w-auto sm:max-w-none sm:translate-x-0",
  custom: "",
};

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  placement = "end",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-40 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${placementLayout[placement]} ${className}`}
    >
      {children}
    </div>
  );
};

import type React from "react";
import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
};

export default function Drawer({
  isOpen,
  onClose,
  children,
  position = "right",
  size = "lg",
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: DrawerProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    left: {
      sm: "w-80",
      md: "w-96",
      lg: "w-[32rem]",
      full: "w-full",
    },
    right: {
      sm: "w-80",
      md: "w-96",
      lg: "w-[32rem]",
      full: "w-full",
    },
    top: {
      sm: "h-80",
      md: "h-96",
      lg: "h-[32rem]",
      full: "h-full",
    },
    bottom: {
      sm: "h-80",
      md: "h-96",
      lg: "h-[32rem]",
      full: "h-full",
    },
  };

  const positionClasses = {
    left: "left-0 top-0 bottom-0 animate-in slide-in-from-left duration-300",
    right: "right-0 top-0 bottom-0 animate-in slide-in-from-right duration-300",
    top: "top-0 left-0 right-0 animate-in slide-in-from-top duration-300",
    bottom:
      "bottom-0 left-0 right-0 animate-in slide-in-from-bottom duration-300",
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 z-40"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      {/* Drawer */}
      <div
        className={`fixed bg-white shadow-2xl z-50 ${positionClasses[position]} ${sizeClasses[position][size]} flex flex-col initSidebar w-full sm:max-w-[600px]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}

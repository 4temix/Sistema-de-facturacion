import { createContext, ReactNode, useContext, useRef, useState } from "react";
import { useModal } from "../hooks/useModal";
import { FacturaDetalle } from "../Types/FacturacionTypes";

export type FacturaEditModalMode = "pago" | "devoluciones";

type ModalContextType = {
  modalEditIsOpen: boolean;
  editModalMode: FacturaEditModalMode | null;
  modalEditOpen: (mode: FacturaEditModalMode) => void;
  closeModalEdit: () => void;
  AsingFactura: (factura: FacturaDetalle) => void;
  facturaDetails?: FacturaDetalle;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalEditProvider({ children }: { children: ReactNode }) {
  const {
    isOpen: modalEditIsOpen,
    openModal: openModalRaw,
    closeModal: closeModalRaw,
  } = useModal();

  const [facturaDetails, setFacturaDetails] = useState<FacturaDetalle>();
  const [editModalMode, setEditModalMode] =
    useState<FacturaEditModalMode | null>(null);
  const plus = useRef(1);

  function AsingFactura(factura: FacturaDetalle) {
    setFacturaDetails(factura);
    plus.current++;
    console.log(plus.current);
  }

  function modalEditOpen(mode: FacturaEditModalMode) {
    setEditModalMode(mode);
    openModalRaw();
  }

  function closeModalEdit() {
    setEditModalMode(null);
    closeModalRaw();
  }

  return (
    <ModalContext.Provider
      value={{
        modalEditIsOpen,
        editModalMode,
        modalEditOpen,
        closeModalEdit,
        AsingFactura,
        facturaDetails,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModalEdit() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalEdit debe usarse dentro de ModalEditProvider");
  }
  return context;
}

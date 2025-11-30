import { createContext, ReactNode, useContext, useRef, useState } from "react";
import { useModal } from "../hooks/useModal";
import { FacturaDetalle } from "../Types/FacturacionTypes";

type ModalContextType = {
  modalEditIsOpen: boolean;
  modalEditOpen: () => void;
  closeModalEdit: () => void;
  AsingFactura: (factura: FacturaDetalle) => void;
  facturaDetails?: FacturaDetalle;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalEditProvider({ children }: { children: ReactNode }) {
  const {
    isOpen: modalEditIsOpen,
    openModal: modalEditOpen,
    closeModal: closeModalEdit,
  } = useModal();

  const [facturaDetails, setFacturaDetails] = useState<FacturaDetalle>();
  const plus = useRef(1);

  //funcion para actualizar la factura
  function AsingFactura(factura: FacturaDetalle) {
    setFacturaDetails(factura);
    plus.current++;
    console.log(plus.current);
  }

  return (
    <ModalContext.Provider
      value={{
        modalEditIsOpen,
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

// ✅ Hook personalizado para usar el contexto
export function useModalEdit() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalEdit debe usarse dentro de ModalEditProvider");
  }
  return context;
}

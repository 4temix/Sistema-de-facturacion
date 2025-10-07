import CardsInventario from "../../components/Inventario/CardsInventario";
import Button from "../../components/ui/button/Button";
import PropertyDataTable from "../../components/Inventario/TableElements";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "react-select";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { customStyles } from "../../Utilities/StyleForReactSelect";
import FormProducts from "../../components/Inventario/FormProducts";

export default function Productos() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isProductModalOpen,
    openModal: openProductModal,
    closeModal: closeProductModal,
  } = useModal();

  return (
    <section>
      <article className="flex mb-3">
        <div className="text-container">
          <h2 className="text-3xl font-bold">Inventario</h2>
        </div>
        <div className="action-container ml-auto">
          <Button size="sm" variant="primary" onClick={openProductModal}>
            Button Text
          </Button>
          <Modal
            isOpen={isProductModalOpen}
            onClose={closeProductModal}
            className="max-w-[1200px] m-4 p-5"
          >
            <section
              className="overflow-y-scroll max-h-[95vh] [&::-webkit-scrollbar]:w-2 
         [&::-webkit-scrollbar-track]:bg-gray-200 
         [&::-webkit-scrollbar-thumb]:bg-blue-500 
         [&::-webkit-scrollbar-thumb]:rounded-full 
         [&::-webkit-scrollbar-thumb:hover]:bg-blue-600"
            >
              <FormProducts closeModal={closeProductModal} />
            </section>
          </Modal>
        </div>
      </article>
      <article>
        <CardsInventario />
      </article>
      <article className="grid lg:grid-cols-2 gap-4 rounded-2xl border sm:grid-cols-1 border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5 mt-4">
        <div className="col-span-1">
          <Label htmlFor="inputTwo">Buscar productos</Label>
          <Input
            type="text"
            id="inputTwo"
            placeholder="Nombre del producto..."
          />
        </div>
        <div className="flex items-end">
          <Button size="sm" variant="primary" onClick={openModal}>
            Filtros
          </Button>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] m-4 p-5"
        >
          <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Filtros
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Filtra los elementos para encontrarlos mas rapido
              </p>
            </div>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div className="grid sm:grid-cols-1 gap-3 lg:grid-cols-2">
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      name="colors"
                      id="status"
                      styles={customStyles}
                      placeholder={"status..."}
                      options={[
                        { value: "chocolate", label: "Chocolate" },
                        { value: "strawberry", label: "Strawberry" },
                        { value: "vanilla", label: "Vanilla" },
                      ]}
                      // value={{}}
                      // styles={customStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inputTwo">Categoria</Label>
                    <Select
                      name="colors"
                      id="category"
                      styles={customStyles}
                      placeholder={"status..."}
                      options={[
                        { value: "chocolate", label: "Chocolate" },
                        { value: "strawberry", label: "Strawberry" },
                        { value: "vanilla", label: "Vanilla" },
                      ]}
                      // value={{}}
                      // styles={customStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inputTwo">Marca</Label>
                    <Select
                      name="colors"
                      id="brand"
                      styles={customStyles}
                      placeholder={"status..."}
                      options={[
                        { value: "chocolate", label: "Chocolate" },
                        { value: "strawberry", label: "Strawberry" },
                        { value: "vanilla", label: "Vanilla" },
                      ]}
                      // value={{}}
                      // styles={customStyles}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={() => {}}
                    />
                  </div>
                </div>

                <div className="grid-cols-2 grid gap-3">
                  <div className="col-span-1">
                    <Label htmlFor="inputTwo">precio minimo</Label>
                    <Input
                      type="text"
                      id="inputTwo"
                      placeholder="Nombre del producto..."
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="inputTwo">Precio maximo</Label>
                    <Input
                      type="text"
                      id="inputTwo"
                      placeholder="Nombre del producto..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm">Save Changes</Button>
            </div>
          </form>
        </Modal>
      </article>
      <article>
        <PropertyDataTable />
      </article>
    </section>
  );
}

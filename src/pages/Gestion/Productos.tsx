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
import { useEffect, useRef, useState } from "react";
import { apiRequest, apiRequestThen } from "../../Utilities/FetchFuntions";
import {
  BaseSelecst,
  DataRequest,
  Metricas,
  // Producto,
  ProductoFiltro,
  Selects,
} from "../../Types/ProductTypes";
import { useDebounce } from "../../hooks/useDebounce";

export default function Productos() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isProductModalOpen,
    openModal: openProductModal,
    closeModal: closeProductModal,
  } = useModal();

  //metricas superiores
  const [dataMetricas, setDataMetricas] = useState<Metricas>();
  //productos de la tabla
  const [productosData, setProductosData] = useState<DataRequest>({
    data: [],
    total_pages: 0,
  });

  //selects para crear y filtrar productos
  const [selectsData, setSelectsData] = useState<Selects>();

  const [labelSelects, setLabelSelects] = useState({
    tipo: "",
    marca: "",
    categoria: "",
    estado: "",
  });

  //filtros de busqueda
  const [filters, setFilters] = useState({
    tipo: null,
    marca: null,
    categoria: null,
    estado: null,
    precioVentaMinimo: null,
    precioVentaMaximo: null,
    search: "",
    stockBajo: null,
    agotados: null,
    page: 1,
    PageSize: 5,
  });

  //elementos para que funcione el debounce
  const debouncedSearch = useDebounce(filters.search, 600);
  let BeforeFilter = useRef<string>("");

  //actualizar los fintros
  function updateFilter(value: string | number | null, key: string) {
    setFilters((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  }

  //actualizar los labels de los filtros
  function updateLabels(value: string | null, key: string) {
    setLabelSelects((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  }

  //eliminar nulos
  function buildQueryString<T extends Record<string, any>>(filters: T): string {
    const validEntries = Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined) // ✅ elimina null/undefined
      .map(([key, value]) => [key, String(value)]); // convierte a string

    return new URLSearchParams(Object.fromEntries(validEntries)).toString();
  }

  //funcion para obtener los elementos de la tabla
  function getData(filters?: ProductoFiltro) {
    const queryString = buildQueryString(filters);

    if (BeforeFilter.current == queryString) {
      return;
    }
    apiRequestThen<DataRequest>({
      url: `api/productos/productos?${queryString}`,
    }).then((response) => {
      if (!response.success) {
        console.error("Error:", response.errorMessage);
        return;
      }
      console.log(response.result);
      setProductosData(
        response.result ?? {
          data: [],
          total_pages: 0,
        }
      );
    });
  }

  useEffect(() => {
    async function Data() {
      const request = await apiRequest<Metricas>({
        url: "api/productos/metricas_productos",
      });

      if (request.success) {
        setDataMetricas(request.result);
      }
    }

    //peticion para los selcts
    apiRequestThen<Selects>({
      url: "api/mantenimiento/selects",
    }).then((response) => {
      if (!response.success) {
        console.error("Error:", response.errorMessage);
        return;
      }
      setSelectsData(response.result);
    });

    getData(filters);
    Data();
  }, []);

  useEffect(() => {
    getData(filters);
  }, [filters.page]);

  //incremento de la pagina
  function incrementPage(page: number) {
    updateFilter(page, "page");
  }

  //debounce para busquedas
  useEffect(() => {
    getData(filters);
  }, [debouncedSearch]);
  return (
    <section>
      <article className="flex mb-3">
        <div className="text-container">
          <h2 className="text-3xl font-bold">Inventario</h2>
        </div>
        <div className="action-container ml-auto">
          <Button size="sm" variant="primary" onClick={openProductModal}>
            Crear producto
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
              <FormProducts
                closeModal={closeProductModal}
                selectsData={selectsData}
              />
            </section>
          </Modal>
        </div>
      </article>
      <article>
        <CardsInventario
          totalProductos={dataMetricas?.totalProductos ?? 0}
          margenPromedio={dataMetricas?.margenPromedio ?? 0}
          valorTotal={dataMetricas?.valorTotal ?? 0}
          stockBajo={dataMetricas?.stockBajo ?? 0}
          agotados={dataMetricas?.agotados ?? 0}
        />
      </article>
      <article className="grid lg:grid-cols-2 gap-4 rounded-2xl border sm:grid-cols-1 border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5 mt-4">
        <div className="col-span-1">
          <form
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              getData(filters);
            }}
          >
            <Label htmlFor="inputTwo">Buscar productos</Label>
            <Input
              type="text"
              id="inputTwo"
              value={filters.search ?? ""}
              placeholder="Nombre del producto..."
              onChange={(e) => {
                updateFilter(e.target.value, "search");
              }}
            />
          </form>
        </div>
        <div className="flex items-end gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              getData(filters);
            }}
          >
            Buscar
          </Button>
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
                      styles={customStyles()}
                      placeholder={"Estado..."}
                      //se hace de esta manera para tener los labels de los selects
                      //para hacer que salga el place holder se hace la verificacion de si hay valor
                      value={
                        filters.estado
                          ? {
                              label: labelSelects?.estado,
                              value: filters.estado,
                            }
                          : null
                      }
                      options={selectsData?.estados?.map(
                        (producto: BaseSelecst) => ({
                          label: producto.name,
                          value: producto.id.toString(),
                        })
                      )}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={(e) => {
                        updateFilter(parseInt(e.value), "estado");
                        updateLabels(e.label, "estado");
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inputTwo">Categoria</Label>
                    <Select
                      name="colors"
                      id="category"
                      styles={customStyles()}
                      placeholder={"Categoria..."}
                      //se hace de esta manera para tener los labels de los selects
                      //para hacer que salga el place holder se hace la verificacion de si hay valor
                      value={
                        filters.categoria
                          ? {
                              label: labelSelects?.categoria,
                              value: filters.categoria,
                            }
                          : null
                      }
                      options={selectsData?.categorias?.map(
                        (producto: BaseSelecst) => ({
                          label: producto.name,
                          value: producto.id.toString(),
                        })
                      )}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={(e) => {
                        updateFilter(parseInt(e.value), "categoria");
                        updateLabels(e.label, "categoria");
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inputTwo">Marca</Label>
                    <Select
                      name="colors"
                      id="brand"
                      styles={customStyles()}
                      placeholder={"Marca..."}
                      //se hace de esta manera para tener los labels de los selects
                      //para hacer que salga el place holder se hace la verificacion de si hay valor
                      value={
                        filters.marca
                          ? {
                              label: labelSelects?.marca,
                              value: filters.marca,
                            }
                          : null
                      }
                      options={selectsData?.marcas?.map(
                        (producto: BaseSelecst) => ({
                          label: producto.name,
                          value: producto.id.toString(),
                        })
                      )}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={(e) => {
                        updateFilter(parseInt(e.value), "marca");
                        updateLabels(e.label, "marca");
                      }}
                    />
                  </div>
                </div>

                <div className="grid-cols-2 grid gap-3">
                  <div className="col-span-1">
                    <Label htmlFor="inputTwo">precio minimo</Label>
                    <Input
                      type="number"
                      value={filters.precioVentaMinimo ?? ""}
                      id="inputTwo"
                      placeholder="Minimo..."
                      onChange={(e) => {
                        updateFilter(
                          parseFloat(e.target.value),
                          "precioVentaMinimo"
                        );
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="inputTwo">Precio maximo</Label>
                    <Input
                      type="text"
                      id="inputTwo"
                      value={filters.precioVentaMaximo ?? ""}
                      placeholder="Maximo..."
                      onChange={(e) => {
                        if (e.target.value == "") {
                          updateFilter(null, "precioVentaMaximo");
                          return;
                        }
                        updateFilter(
                          parseInt(e.target.value),
                          "precioVentaMaximo"
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  getData(filters);
                  closeModal();
                }}
              >
                Buscar
              </Button>
            </div>
          </form>
        </Modal>
      </article>
      <article>
        <PropertyDataTable
          data={productosData.data}
          total_pages={productosData.total_pages}
          setPage={incrementPage}
          pageNUmber={filters.page}
          pageSize={filters.PageSize}
          updateSize={updateFilter}
        />
      </article>
    </section>
  );
}

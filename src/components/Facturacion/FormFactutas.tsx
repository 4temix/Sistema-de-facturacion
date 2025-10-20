import { customStyles } from "../../Utilities/StyleForReactSelect";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select, { SingleValue } from "react-select";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import {
  BaseSelecst,
  DataRequest,
  Option,
  Producto,
  ProductoFiltro,
  SaveProducto,
} from "../../Types/ProductTypes";
import { TrashBinIcon, PencilIcon, BoxCubeIcon } from "../../icons";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { useDebounce } from "../../hooks/useDebounce";
import { ValidationFactura } from "../../Utilities/ValidationFactura";
import { SelectsFacturacion } from "../../Types/FacturacionTypes";

type Actions = {
  closeModal: () => void;
  selectsData: SelectsFacturacion | undefined;
};

type Productos = {
  id: number;
  nombre: string;
  codigo: string;
  precioVenta: number;
  precioMinimo: number;
  cantidad: number;
  descuento: number;
  subtotal: number;
  precioVentaOriginal: number;
};

//expresion regular para validar si algo es
const regexNum = /^-?\d+(\.\d+)?$/;
export default function FormFactutas(params: Actions) {
  const { closeModal, selectsData } = params;
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

  //search configuration
  const [searchConfig, setSearchConfig] = useState({
    enFoco: false,
  });

  //elementos para que funcione el debounce
  const debouncedSearch = useDebounce(filters.search, 600);
  let BeforeFilter = useRef<string>("");
  let searchFocus = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  //formik validation
  const {
    values,
    handleBlur,
    touched,
    handleChange,
    errors,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    validateForm,
    initialValues,
    setTouched,
  } = useFormik({
    initialValues: {
      clienteId: 1,
      nombreCliente: "",
      DocumentoCliente: "",
      TelefonoCLiente: "",

      Subtotal: 0,
      ImpuestoTotal: 0,
      DescuentoTotal: 0,
      Total: 0,
      Ganancia: 0,

      MetodoPagoId: 0,
      MontoPagado: 0,

      Vendedor: 1,
      Sucursal: 1,
      Moneda: "DOP",

      Productos: [],
    },
    validationSchema: ValidationFactura,
    onSubmit: (values) => {
      console.log("Producto enviado:", values);
    },
  });

  //propductos de la busqueda
  const [productosData, setProductosData] = useState<DataRequest>({
    data: [],
    total_pages: 0,
  });

  //productos agregados
  const [products, setProducts] = useState<Productos[]>([]);

  //funcion para agregar productos a la factura
  function SaveElements(productElement: Producto) {
    let existElement = products.find((el) => el.id == productElement.id);

    if (existElement) {
      handleProductoChange(
        existElement.id,
        "cantidad",
        existElement.cantidad + 1
      );
      return;
    }

    setProducts((prev) => [
      ...prev,
      {
        id: productElement.id,
        nombre: productElement.nombre,
        codigo: productElement.codigo,
        precioVenta: productElement.precioVenta,
        precioMinimo: 0,
        cantidad: 1,
        descuento: 0,
        subtotal: productElement.precioVenta,
        precioVentaOriginal: productElement.precioVenta,
      },
    ]);
  }

  //guardar los elementos
  function SaveFactura(producto: SaveProducto) {
    return;
    apiRequestThen<boolean>({
      url: "api/productos/guardar_producto",
      configuration: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      },
    }).then((response) => {
      if (!response.success) {
        return;
      }
      closeModal();
    });
  }

  //funcion para actualizar los elementos de los formularios
  const handleProductoChange = (id: number, field: string, value: number) => {
    const index = products.findIndex((el) => el.id === id);
    const producto = index !== -1 ? products[index] : null;

    if (producto == undefined) {
      return;
    }

    producto[field] = value;

    // Si cambia el precio, recalcula descuento
    if (field === "precioVenta" && producto.precioVentaOriginal) {
      producto.descuento = Math.round(
        Math.max(
          0,
          ((producto.precioVentaOriginal - producto.precioVenta) /
            producto.precioVentaOriginal) *
            100
        )
      );
    }

    // Si cambia el descuento, recalcula precio
    if (field === "descuento" && producto.precioVentaOriginal) {
      producto.precioVenta =
        producto.precioVentaOriginal * (1 - producto.descuento / 100);
    }

    // ✅ Recalcular subtotal siempre al final
    producto.subtotal = producto.cantidad * producto.precioVenta;

    // Validación de precio mínimo
    // if (producto.precioVenta < producto.precioMinimo) {
    //   alert(
    //     `⚠️ El precio ingresado (${producto.precioVenta}) está por debajo del mínimo (${producto.precioMinimo})`
    //   );
    // }

    // Actualizar el array
    const nuevosProductos = [...products];
    nuevosProductos[index] = producto;
    setProducts(nuevosProductos);
  };

  //eliminar nulos
  function buildQueryString<T extends Record<string, any>>(filters: T): string {
    const validEntries = Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined) // ✅ elimina null/undefined
      .map(([key, value]) => [key, String(value)]); // convierte a string

    return new URLSearchParams(Object.fromEntries(validEntries)).toString();
  }

  //funcion para buscar los elementos de la facturacion
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
    if (!searchFocus.current) {
      return;
    }

    if (filters.search.length == 0) {
      setProductosData({ data: [], total_pages: 0 });
      return;
    }
    getData(filters);
  }, [debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSearchConfig((prev) => ({ ...prev, enFoco: false }));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Creacion de factura
          </h4>
        </div>
      </div>
      <form className="flex flex-col">
        <div className="px-2 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5">
            {/* 1️⃣ Código y nombre */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nombre">Nombre cliente</Label>
                <Input
                  type="text"
                  id="nombreCliente"
                  placeholder="Nombre del producto"
                  hint={
                    errors.nombreCliente && touched.nombreCliente
                      ? errors.nombreCliente
                      : ""
                  }
                  value={values.nombreCliente ?? ""}
                  error={
                    errors.nombreCliente && touched.nombreCliente ? true : false
                  }
                  onChange={(e) => {
                    setFieldValue("nombreCliente", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("nombreCliente", true)}
                />
              </div>
              <div>
                <Label htmlFor="nombre">Documento del Cliente</Label>
                <Input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del producto"
                  hint={
                    errors.DocumentoCliente && touched.DocumentoCliente
                      ? errors.DocumentoCliente
                      : ""
                  }
                  value={values.DocumentoCliente ?? ""}
                  error={
                    errors.DocumentoCliente && touched.DocumentoCliente
                      ? true
                      : false
                  }
                  onChange={(e) => {
                    setFieldValue("DocumentoCliente", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("DocumentoCliente", true)}
                />
              </div>
              <div>
                <Label htmlFor="nombre">Telefono del cliente</Label>
                <Input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del producto"
                  hint={
                    errors.TelefonoCLiente && touched.TelefonoCLiente
                      ? errors.TelefonoCLiente
                      : ""
                  }
                  value={values.TelefonoCLiente ?? ""}
                  error={
                    errors.TelefonoCLiente && touched.TelefonoCLiente
                      ? true
                      : false
                  }
                  onChange={(e) => {
                    setFieldValue("TelefonoCLiente", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("TelefonoCLiente", true)}
                />
              </div>
              <div>
                <Label htmlFor="nombre">Nombre cliente</Label>
                <Input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del producto"
                  hint={
                    errors.nombreCliente && touched.nombreCliente
                      ? errors.nombreCliente
                      : ""
                  }
                  value={values.nombreCliente ?? ""}
                  error={
                    errors.nombreCliente && touched.nombreCliente ? true : false
                  }
                  onChange={(e) => {
                    setFieldValue("nombreCliente", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("nombreCliente", true)}
                />
              </div>
            </div>
            <h5 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Productos
            </h5>
            <div className="relative ">
              <Label htmlFor="nombre">Buscar producto</Label>
              <Input
                ref={inputRef}
                type="text"
                id="search"
                placeholder="Nombre del producto o codigo..."
                onFocus={() => setSearchConfig((p) => ({ ...p, enFoco: true }))}
                value={filters.search ?? ""}
                onChange={(e) => {
                  if (!searchFocus.current) {
                    searchFocus.current = true;
                  }
                  setFilters((prev) => ({
                    ...prev,
                    ["search"]: e.target.value,
                  }));
                }}
              />
              {searchConfig.enFoco && (
                <div
                  className="absolute z-40 w-full bg-gray-100 max-h-[300px] min-h-[200px] rounded-[9px] p-3 overflow-y-scroll"
                  ref={dropdownRef}
                >
                  {productosData.data.map((producto: Producto) => (
                    <div
                      key={producto.id}
                      className="p-3 border border-gray-200 rounded-[9px] dark:border-gray-800 flex bg-white min-h-24 gap-3 lg:flex-row flex-col mt-3 hover:bg-gray-300 transition-colors duration-150 ease-in cursor-pointer"
                      onClick={() => {
                        SaveElements(producto);
                      }}
                    >
                      <div className="bg-gray-200 p-2 flex justify-center items-center rounded-[9px] max-h-[40px]">
                        <BoxCubeIcon />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                          {producto.nombre}
                        </div>
                        <span className="text-gray-500">
                          Código: {producto.codigo}
                        </span>
                      </div>

                      {/* BOTÓN ELIMINAR */}
                      <div className="ml-auto flex gap-2 flex-col">
                        <span>RD${producto.precioVenta.toFixed(2)}</span>
                        <span className="text-gray-400">
                          {producto.stockActual} en stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div
              className={`bg-brand-25 min-h-[200px] rounded-[9px] p-3 overflow-y-scroll max-h-[450px] ${
                products.length == 0 &&
                "flex flex-col justify-center items-center"
              }`}
            >
              {/* mapeo de elementos */}

              {products.length == 0 && (
                <p className="text-gray-500">
                  Seleccione los elementos para la factura
                </p>
              )}
              {products.map((producto, index) => (
                <div
                  key={producto.id || index}
                  className="p-3 border border-gray-200 rounded-[9px] dark:border-gray-800 flex bg-white min-h-24 gap-3 lg:flex-row flex-col mt-3"
                >
                  <div className="bg-gray-200 p-2 flex justify-center items-center rounded-[9px] max-h-[40px]">
                    <BoxCubeIcon />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      {producto.nombre}
                    </div>
                    <span className="text-gray-500">
                      Código: {producto.codigo}
                    </span>
                    <span>RD${producto.precioVentaOriginal.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2 lg:flex-row flex-col">
                    {/* CANTIDAD */}
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        value={producto.cantidad ?? ""}
                        onChange={(e) => {
                          if (
                            regexNum.test(e.target.value) ||
                            e.target.value.length == 0
                          ) {
                            handleProductoChange(
                              producto.id,
                              "cantidad",
                              Number(e.target.value)
                            );
                          }
                        }}
                      />
                    </div>

                    {/* PRECIO DE VENTA */}
                    <div>
                      <Label>Precio de venta</Label>
                      <Input
                        value={producto.precioVenta}
                        onChange={(e) => {
                          if (
                            regexNum.test(e.target.value) ||
                            e.target.value.length == 0
                          ) {
                            handleProductoChange(
                              producto.id,
                              "precioVenta",
                              Number(e.target.value)
                            );
                          }
                        }}
                      />
                    </div>

                    {/* DESCUENTO */}
                    <div>
                      <Label>Descuento %</Label>
                      <Input
                        className="max-w-20"
                        value={producto.descuento}
                        onChange={(e) => {
                          if (
                            regexNum.test(e.target.value) ||
                            e.target.value.length == 0
                          ) {
                            handleProductoChange(
                              producto.id,
                              "descuento",
                              Number(e.target.value)
                            );
                          }
                        }}
                      />
                    </div>

                    {/* SUBTOTAL */}
                    <div className="flex flex-col">
                      <Label>Subtotal</Label>
                      <span>RD${producto.subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* BOTÓN ELIMINAR */}
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nuevos = products.filter((_, i) => i !== index);
                        setProducts(nuevos);
                      }}
                      className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-error-600"
                    >
                      <TrashBinIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* 3️⃣ Categoría, Marca y Unidad de medida */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="categoria">Metodo de pago</Label>
                <Select
                  id="categoria"
                  styles={customStyles()}
                  placeholder="Selecciona un metodo de pago..."
                  options={selectsData?.metodoPago?.map(
                    (element: BaseSelecst) => ({
                      value: element.id.toString(),
                      label: element.name,
                    })
                  )}
                  onChange={(e: SingleValue<Option>) => {
                    setFieldValue("MetodoPagoId", parseInt(e.value));
                  }}
                  menuPosition="fixed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={async (e?: React.MouseEvent<HTMLButtonElement>) => {
              e?.preventDefault();
              // Valida todos los campos
              const errors = await validateForm();

              // Marca todos los campos como tocados
              setTouched(
                Object.keys(initialValues).reduce((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {} as Record<string, boolean>),
                true
              );
              // Si no hay errores
              if (Object.keys(errors).length === 0) {
                console.log("todo bien");
                SaveFactura(values);
              } else {
                console.log("Errores encontrados:", errors);
              }
            }}
          >
            Guardar Factura
          </Button>
        </div>
      </form>
    </>
  );
}

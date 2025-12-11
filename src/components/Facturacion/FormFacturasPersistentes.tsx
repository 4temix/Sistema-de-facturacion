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
} from "../../Types/ProductTypes";
import { TrashBinIcon, BoxCubeIcon } from "../../icons";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { useDebounce } from "../../hooks/useDebounce";
import { ValidationFactura } from "../../Utilities/ValidationFactura";
import {
  ProduscFactruraSend,
  SaveFactura,
  SelectsFacturacion,
} from "../../Types/FacturacionTypes";
import LoaderFun from "../loader/LoaderFunc";
import Swal from "sweetalert2";
import Checkbox from "../form/input/Checkbox";

type Productos = {
  id: number;
  nombre: string;
  codigo: string;
  precioVenta: number;
  precioMinimo: number;
  cantidad: number;
  descuento: number;
  subtotal: number;
  impuestos: number;
  precioCompra: number;
  precioVentaOriginal: number;
};

type PersistenciaFactura = {
  id: number;
  factura: SaveFactura;
  elements: Productos[];
};

type productosStock = {
  id: number;
  stockActual: number;
};

type Actions = {
  closeModal: () => void;
  selectsData: SelectsFacturacion | undefined;
  sendFactura: (params: PersistenciaFactura) => void;
  factura: PersistenciaFactura;
  sendStock: (elements: productosStock[]) => void;
  stockGlobal: productosStock[];
  deleteFactura: (id: number) => void;
  facturasP: PersistenciaFactura[];
  onSuccess?: () => void;
};

//expresion regular para validar si algo es
const regexNum = /^-?\d+(\.\d+)?$/;
export default function FormFacturasPersistentes(params: Actions) {
  const { closeModal, selectsData, onSuccess } = params;
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
    loading: false,
  });

  //elementos para que funcione el debounce
  const debouncedSearch = useDebounce(filters.search, 400);
  let BeforeFilter = useRef<string>("");
  let searchFocus = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  //formik validation
  const {
    values,
    // handleBlur,
    touched,
    // handleChange,
    errors,
    setFieldValue,
    setFieldTouched,
    // handleSubmit,
    setValues,
    validateForm,
    initialValues,
    setTouched,
  } = useFormik({
    initialValues: {
      clienteId: 1,
      nombreCliente: "",
      documentoCliente: "",
      telefonoCLiente: "",

      subtotal: 0,
      impuestoTotal: 0,
      descuentoTotal: 0,
      total: 0,
      ganancia: 0,

      metodoPagoId: 0,
      montoPagado: 0,

      detalleManoDeObra: "",
      manoDeObra: 0,

      vendedor: 1,
      sucursal: "Repuesto",
      moneda: "DOP",

      productos: [],
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

  const [isCheckedTwo, setIsCheckedTwo] = useState(false);

  //productos agregados
  const [products, setProducts] = useState<Productos[]>([]);

  //cargando
  const [isLoading, setIsLoading] = useState(false);

  //funcion para agregar productos a la factura
  function SaveElements(productElement: Producto) {
    let existElement = products.find((el) => el.id == productElement.id);
    let cantidad = params.stockGlobal.findIndex(
      (el) => el.id == productElement.id
    );

    if (existElement) {
      if (params.stockGlobal[cantidad].stockActual == 0) {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "info",
          title: "No queda existencia de este producto",
        });
        return;
      }

      handleProductoChange(
        existElement.id,
        "cantidad",
        existElement.cantidad + 1
      );

      const elementCantidad = params.stockGlobal[cantidad];
      elementCantidad.stockActual = elementCantidad.stockActual - 1;

      const cantidades = [...params.stockGlobal];
      cantidades[cantidad] = elementCantidad;
      params.sendStock(cantidades);

      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "success",
        title: "Cantida agregada exitosamente",
      });
      return;
    }

    //agregacion del elemento a la facturacion
    const elements = [...products];
    elements.push({
      id: productElement.id,
      nombre: productElement.nombre,
      codigo: productElement.codigo,
      precioVenta: productElement.precioVenta,
      precioMinimo: productElement.precioMinimo,
      cantidad: 1,
      impuestos: productElement.impuestos,
      descuento: 0,
      precioCompra: productElement.precioCompra,
      subtotal: productElement.precioVenta,
      precioVentaOriginal: productElement.precioVenta,
    });

    if (cantidad != -1) {
      if (params.stockGlobal[cantidad].stockActual == 0) {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "info",
          title: "No queda existencia de este producto",
        });
        return;
      }

      const elementCantidad = params.stockGlobal[cantidad];
      elementCantidad.stockActual = elementCantidad.stockActual - 1;
      const cantidades = [...params.stockGlobal];
      cantidades[cantidad] = elementCantidad;
      params.sendStock(cantidades);
    } else {
      if (productElement.stockActual == 0) {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "info",
          title: "No queda existencia de este producto",
        });
        return;
      }
      //creacion de un historial de stock
      const cantidades = [...params.stockGlobal];
      cantidades.push({
        id: productElement.id,
        stockActual: productElement.stockActual - 1,
      });

      params.sendStock(cantidades);
    }
    RecalcularFactura(elements);

    setProducts([...elements]);

    params.sendFactura({
      id: params.factura.id,
      factura: values,
      elements: [...elements],
    });

    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "success",
      title: "producto agregado",
    });
  }

  //funcion para recalcular los valores totaldes de la factura
  function RecalcularFactura(elements: Productos[]) {
    //calculo del total de los elementos comprados
    const resultado = elements.reduce(
      (acc, el) => {
        // subtotal de la línea = precio unitario * cantidad
        const subtotalLinea = el.precioVenta * el.cantidad;

        // impuesto total de la línea = (precio unitario * tasa / 100) * cantidad
        const totalImpuestosLinea =
          ((el.precioVenta * el.impuestos) / 100) * el.cantidad;

        // acumula subtotal, impuesto y descuento
        const TotalDeLine = subtotalLinea + totalImpuestosLinea;

        return {
          subtotal: acc.subtotal + subtotalLinea,
          total: acc.total + TotalDeLine,
          descuentoTotal: acc.descuentoTotal + (el.descuento || 0),
          impuestos: acc.impuestos + el.impuestos * el.cantidad,
        };
      },
      { subtotal: 0, total: 0, descuentoTotal: 0, impuestos: 0 }
    );

    // asigna los valores al estado o formulario
    setFieldValue("subtotal", resultado.subtotal + values.manoDeObra);
    setFieldValue("descuentoTotal", resultado.descuentoTotal);
    setFieldValue("impuestoTotal", resultado.impuestos);
    setFieldValue("total", resultado.total + values.manoDeObra);
  }

  //guardar los elementos
  function SaveFactura(producto: SaveFactura) {
    if (products.length == 0) {
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "info",
        title: "No se puede guardar una factura sin elementos",
      });
      return;
    }
    setIsLoading(true);
    const saveProductos: ProduscFactruraSend[] = [];

    products.forEach((el: Productos) => {
      if (el.cantidad !== 0) {
        saveProductos.push({
          productoId: el.id,
          precioVentaActual: el.precioVenta,
          precioBase: el.precioVentaOriginal,
          cantidad: el.cantidad,
          desuento: el.descuento,
          impuesto: el.impuestos,
          precioCompra: el.precioCompra,
        });
      }
    });

    const payload = {
      ...producto,
      productos: saveProductos,
    };

    apiRequestThen<boolean>({
      url: "api/facturas/crear_factura",
      configuration: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    })
      .then((response) => {
        if (!response.success) {
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });
          Toast.fire({
            icon: "error",
            title: response.errorMessage,
          });
          return;
        }
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Factura guardada correctamente",
        });

        // Refrescar datos en la página padre
        if (onSuccess) {
          onSuccess();
        }

        if (params.facturasP.length == 1) {
          params.sendStock([]);
          closeModal();
          return;
        }

        params.deleteFactura(params.factura.id);
        closeModal();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  //funcion para actualizar los elementos de los formularios
  const handleProductoChange = (id: number, field: string, value: number) => {
    const index = products.findIndex((el) => el.id === id);
    const producto = index !== -1 ? products[index] : null;

    if (producto == undefined) {
      return;
    }

    if (field === "cantidad") {
      const indexStock = params.stockGlobal.findIndex((el) => el.id === id);
      if (indexStock === -1) return;

      const elementoStock = params.stockGlobal[index];
      const cantidadAnterior = producto.cantidad;
      const cantidadDisponible = elementoStock.stockActual + cantidadAnterior;
      const cantidadNueva = Number(value) || 0;

      console.log(
        "anterior",
        cantidadAnterior,
        "disponible",
        cantidadDisponible,
        "nueva",
        cantidadNueva
      );

      // 1️⃣ Si la cantidad nueva es 0 → devolver al stock global lo que tenía antes
      if (cantidadNueva === 0) {
        const nuevoStock = elementoStock.stockActual + cantidadAnterior;

        const actualizado = [...params.stockGlobal];
        actualizado[indexStock] = { ...elementoStock, stockActual: nuevoStock };

        producto.cantidad = 0;
        producto.subtotal = 0;
        const productosUpdate = [...products];
        productosUpdate[index] = producto;

        RecalcularFactura(productosUpdate);
        params.sendStock(actualizado);
        params.sendFactura({
          id: params.factura.id,
          factura: values,
          elements: [...productosUpdate],
        });

        return;
      }

      // 2️⃣ Si la cantidad nueva supera lo disponible → no aplicar el cambio
      if (cantidadNueva > cantidadDisponible) {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "info",
          title: "NO queda existencia de este producto",
        });
        return; // ❌ detenemos aquí, no actualizamos nada
      }

      // 3️⃣ Calcular diferencia real
      const diferencia = cantidadNueva - cantidadAnterior;
      const nuevoStock = elementoStock.stockActual - diferencia;

      if (nuevoStock < 0) {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "info",
          title: "NO queda existencia de este producto",
        });
        return;
      }

      // 4️⃣ Actualizar el stock global
      const actualizado = [...params.stockGlobal];
      actualizado[indexStock] = { ...elementoStock, stockActual: nuevoStock };
      params.sendStock(actualizado);

      // 5️⃣ Actualizar la cantidad del producto
      producto.cantidad = cantidadNueva;
    }

    (producto as any)[field] = value;

    // Si cambia el precio, recalcula descuento
    if (field === "precioVenta" && producto.precioVentaOriginal) {
      producto.descuento = Math.max(
        0,
        Math.round(
          ((producto.precioVentaOriginal - producto.precioVenta) /
            producto.precioVentaOriginal) *
            100 *
            100
        ) / 100
      );
    }

    // Si cambia el descuento, recalcula precio
    if (field === "descuento" && producto.precioVentaOriginal) {
      producto.precioVenta =
        producto.precioVentaOriginal * (1 - producto.descuento / 100);
    }

    // ✅ Recalcular subtotal siempre al final
    producto.subtotal =
      Math.round(producto.cantidad * producto.precioVenta * 100) / 100;

    // Actualizar el array
    const nuevosProductos = [...products];
    nuevosProductos[index] = producto;

    params.sendFactura({
      id: params.factura.id,
      factura: values,
      elements: [...nuevosProductos],
    });

    RecalcularFactura(nuevosProductos);

    setProducts(nuevosProductos);
  };

  //guardar factura para persitencia
  function sendFacturaPP() {
    if (values.nombreCliente.length == 0) {
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "warning",
        title: "Asigne un nombre de cliente",
      });
      return;
    }
    params.sendFactura({
      id: params.factura.id,
      factura: values,
      elements: products,
    });
    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "success",
      title: "Factura Guardada",
    });
  }

  //eliminar nulos
  function buildQueryString<T extends Record<string, any>>(filters: T): string {
    const validEntries = Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined) // ✅ elimina null/undefined
      .map(([key, value]) => [key, String(value)]); // convierte a string

    return new URLSearchParams(Object.fromEntries(validEntries)).toString();
  }

  //funcion para buscar los elementos de la facturacion
  function getData(filters: ProductoFiltro) {
    const queryString = buildQueryString(filters);

    if (BeforeFilter.current == queryString) {
      return;
    }
    apiRequestThen<DataRequest>({
      url: `api/productos/productos?${queryString}`,
    })
      .then((response) => {
        if (!response.success) {
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });
          Toast.fire({
            icon: "error",
            title: response.errorMessage,
          });
          return;
        }

        setProductosData(
          response.result ?? {
            data: [],
            total_pages: 0,
          }
        );
      })
      .finally(() => {
        setSearchConfig((p) => ({ ...p, loading: false }));
      });
  }

  //esta funcion es para buscar la existencia de la cantidad actualmente en el front y vincularla a la cantidad que tiene desde el backend
  function SearchCantidad(id: number) {
    const cantidad = params.stockGlobal.find((el) => el.id === id);
    return cantidad?.stockActual;
  }

  //delete producto
  function DeleteProduct(id: number) {
    const nuevos = products.filter((el) => el.id !== id);
    const index = products.findIndex((el) => el.id === id);
    const producto = index !== -1 ? products[index] : null;
    //para los elementos globales y control del multi factura

    if (producto == undefined) {
      return;
    }

    const indexStock = params.stockGlobal.findIndex((el) => el.id === id);
    if (index === -1) return;

    const elementoStock = params.stockGlobal[indexStock];
    const cantidadAnterior = producto.cantidad;
    const cantidadNueva = 0;

    // 1️⃣ Si la cantidad nueva es 0 → devolver al stock global lo que tenía antes
    if (cantidadNueva === 0) {
      const nuevoStock = elementoStock.stockActual + cantidadAnterior;
      console.log(cantidadAnterior);
      const actualizado = [...params.stockGlobal];
      actualizado[index] = { ...elementoStock, stockActual: nuevoStock };
      params.sendStock(actualizado);
      producto.cantidad = 0;
      //agregacion del producto a los productos globales
    }

    const nuevosProductos = [...products];
    producto.subtotal = 0;
    nuevosProductos[index] = producto;

    RecalcularFactura(nuevosProductos);
    params.sendFactura({
      id: params.factura.id,
      factura: values,
      elements: [...nuevosProductos],
    });

    setProducts(nuevos);
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

  useEffect(() => {
    if (
      filters.search.length == 0 &&
      searchConfig.loading == true &&
      productosData.data.length == 0
    ) {
      setSearchConfig((p) => ({ ...p, loading: false }));
    }
  }, [filters.search, productosData.data]);

  useEffect(() => {
    setFieldValue("montoPagado", isCheckedTwo ? values.total : 0);
  }, [isCheckedTwo]);

  useEffect(() => {
    if (params.factura.id == 0) {
      return;
    }
    setValues({
      clienteId: params.factura.factura.clienteId ?? 0,
      nombreCliente: params.factura.factura.nombreCliente ?? "",
      documentoCliente: params.factura.factura.documentoCliente ?? "",
      telefonoCLiente: params.factura.factura.telefonoCLiente ?? "",

      subtotal: params.factura.factura.subtotal ?? 0,
      impuestoTotal: params.factura.factura.impuestoTotal ?? 0,
      descuentoTotal: params.factura.factura.descuentoTotal ?? 0,
      total: params.factura.factura.total ?? 0,
      ganancia: params.factura.factura.ganancia ?? 0,

      metodoPagoId: params.factura.factura.metodoPagoId ?? 0,
      montoPagado: params.factura.factura.montoPagado ?? 0,

      vendedor: params.factura.factura.vendedor ?? 1,
      sucursal: params.factura.factura.sucursal ?? "Repuesto",
      moneda: params.factura.factura.moneda ?? "DOP",
      detalleManoDeObra: params.factura.factura.detalleManoDeObra ?? "",
      manoDeObra: params.factura.factura.manoDeObra ?? 0,

      productos: [],
    });

    setProducts(params.factura.elements);
  }, [params.factura]);

  return (
    <>
      <div className="relative max-h-[95vh] overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        {isLoading && <LoaderFun absolute={false} />}
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
                <Label htmlFor="documento">Documento del Cliente</Label>
                <Input
                  type="text"
                  id="documento"
                  placeholder="Nombre del producto"
                  hint={
                    errors.documentoCliente && touched.documentoCliente
                      ? errors.documentoCliente
                      : ""
                  }
                  value={values.documentoCliente ?? ""}
                  error={
                    errors.documentoCliente && touched.documentoCliente
                      ? true
                      : false
                  }
                  onChange={(e) => {
                    setFieldValue("documentoCliente", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("documentoCliente", true)}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Telefono del cliente</Label>
                <Input
                  type="text"
                  id="telefono"
                  placeholder="Nombre del producto"
                  hint={
                    errors.telefonoCLiente && touched.telefonoCLiente
                      ? errors.telefonoCLiente
                      : ""
                  }
                  value={values.telefonoCLiente ?? ""}
                  error={
                    errors.telefonoCLiente && touched.telefonoCLiente
                      ? true
                      : false
                  }
                  onChange={(e) => {
                    setFieldValue("telefonoCLiente", e.target.value);
                  }}
                  onBlur={() => setFieldTouched("telefonoCLiente", true)}
                />
              </div>
            </div>
            <h5 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Productos
            </h5>
            <div className="relative">
              <Label htmlFor="search">Buscar producto</Label>
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

                  if (searchConfig.loading == false) {
                    setSearchConfig((p) => ({ ...p, loading: true }));
                  }

                  setFilters((prev) => ({
                    ...prev,
                    ["search"]: e.target.value,
                  }));
                }}
              />

              {searchConfig.enFoco && (
                <div
                  className={`absolute z-40 w-full bg-gray-100 max-h-[300px] min-h-[200px] rounded-[9px] p-3 overflow-y-scroll ${
                    productosData.data.length == 0 &&
                    filters.search.length > 0 &&
                    "flex justify-center items-center"
                  } ${
                    productosData.data.length == 0 &&
                    filters.search.length == 0 &&
                    "flex justify-center items-center"
                  }`}
                  ref={dropdownRef}
                >
                  {searchConfig.loading && <LoaderFun absolute={true} />}

                  {productosData.data.length == 0 &&
                    filters.search.length == 0 && (
                      <p className="text-gray-500">
                        Escriba el nombre el producto a buscar
                      </p>
                    )}

                  {productosData.data.length == 0 &&
                    filters.search.length > 0 && (
                      <p className="text-gray-500">Sin resultados</p>
                    )}

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
                          {SearchCantidad(producto.id) ?? producto.stockActual}
                          en stock
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
                    <div>
                      <span>
                        RD${producto.precioVentaOriginal.toFixed(2)} -{" "}
                      </span>
                      <span
                        className={`${
                          producto.precioVenta < producto.precioMinimo
                            ? "text-error-500"
                            : "text-green-400"
                        }`}
                      >
                        {producto.precioMinimo.toFixed(2)}
                      </span>
                    </div>
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
                        DeleteProduct(producto.id);
                      }}
                      className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-error-600"
                    >
                      <TrashBinIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* mano de obra */}
            <div>
              <Label htmlFor="descripcion">Mano de obra</Label>
              <textarea
                id="descripcion"
                rows={3}
                placeholder="Costo de la accion realizada..."
                value={values.detalleManoDeObra ?? ""}
                className={`border rounded-xl w-full p-2 text-sm`}
                onChange={(e) => {
                  setFieldValue("detalleManoDeObra", e.target.value);
                }}
              ></textarea>
            </div>
            <div>
              <Label htmlFor="telefono">Monto mano de obra</Label>
              <Input
                type="text"
                id="telefono"
                placeholder="monto de la mano de obra a pagar"
                hint={
                  errors.manoDeObra && touched.manoDeObra
                    ? errors.manoDeObra
                    : ""
                }
                value={values.manoDeObra ?? ""}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setFieldValue("total", values.total - values.manoDeObra);
                    setFieldValue(
                      "subtotal",
                      values.subtotal - values.manoDeObra
                    );
                    setFieldValue("manoDeObra", 0);
                    return;
                  }

                  if (!regexNum.test(value)) return;

                  const manoDeObra = Number(value);

                  setFieldValue(
                    "total",
                    values.total - values.manoDeObra + manoDeObra
                  );
                  setFieldValue(
                    "subtotal",
                    values.subtotal - values.manoDeObra + manoDeObra
                  );
                  setFieldValue("manoDeObra", manoDeObra);
                }}
                onBlur={() => setFieldTouched("manoDeObra", true)}
              />
            </div>

            {/* 3️⃣ Categoría, Marca y Unidad de medida */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="categoria">Metodo de pago</Label>
                <Select<Option, false>
                  id="categoria"
                  styles={customStyles(
                    !!errors.metodoPagoId && touched.metodoPagoId
                  )}
                  placeholder="Método de pago..."
                  menuPortalTarget={document.body}
                  options={selectsData?.metodoPago?.map(
                    (element: BaseSelecst) => ({
                      value: element.id.toString(),
                      label: element.name,
                    })
                  )}
                  onChange={(e: SingleValue<Option>) => {
                    if (!e) return;
                    setFieldValue("metodoPagoId", parseInt(e.value));
                  }}
                  onBlur={() => setFieldTouched("metodoPagoId", true)}
                />
                {errors.metodoPagoId && touched.metodoPagoId && (
                  <p className={`mt-1.5 text-xs text-error-500`}>
                    {errors.metodoPagoId}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="telefono">Monto pagado</Label>
                <Input
                  type="text"
                  id="telefono"
                  placeholder="Nombre del producto"
                  hint={
                    errors.montoPagado && touched.montoPagado
                      ? errors.montoPagado
                      : ""
                  }
                  value={values.montoPagado ?? ""}
                  error={
                    errors.montoPagado && touched.montoPagado ? true : false
                  }
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      setFieldValue("montoPagado", 0);
                      return;
                    }

                    if (regexNum.test(value)) {
                      setFieldValue("montoPagado", Number(e.target.value));
                    }
                  }}
                  onBlur={() => setFieldTouched("montoPagado", true)}
                />
              </div>
              <Checkbox
                checked={isCheckedTwo}
                onChange={setIsCheckedTwo}
                disabled={values.total == 0 ? true : false}
                label="Todo pagado"
              />
              <div className="rounded-[9px] bg-gray-200 flex flex-col p-3">
                <span>
                  Subtotal: {"RD$"}
                  {values.subtotal}
                </span>
                <span>
                  Desc: {"RD$"}
                  {values.descuentoTotal}
                </span>
                <span>
                  Total impuestos:
                  {values.impuestoTotal}%
                </span>
                <span>
                  Total: {"RD$"}
                  {values.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600"
            onClick={() => {
              sendFacturaPP();
              closeModal();
            }}
          >
            Guardar factura temporal
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              closeModal();
            }}
          >
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
                SaveFactura({ ...values });
              } else {
                console.log("Errores encontrados:", errors);
              }
            }}
          >
            Guardar factura
          </Button>
        </div>
      </form>
    </>
  );
}

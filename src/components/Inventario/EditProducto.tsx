import { customStyles } from "../../Utilities/StyleForReactSelect";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select, { SingleValue } from "react-select";
import { useFormik } from "formik";
import { ValidationProduct } from "../../Utilities/ValidationProduct";
import { useEffect, useState } from "react";
import {
  BaseSelecst,
  Option,
  Selects,
  UpdateProducto,
} from "../../Types/ProductTypes";
import { apiRequestThen } from "../../Utilities/FetchFuntions";

type Actions = {
  closeModal: () => void;
  selectsData: Selects | undefined;
  id: number;
  onSuccess?: () => void;
};

const SkeletonBox = ({ height = "h-10", width = "w-full" }) => (
  <div className={`shimmer ${height} ${width} mb-2`} />
);

export default function EditProducto(params: Actions) {
  const { closeModal, selectsData, id, onSuccess } = params;
  // const [dataSelect, setDataSelect] = useState({
  //   categoria: { value: 0, label: "" },
  //   tipo: { value: 0, label: "" },
  //   marca: { value: 0, label: "" },
  //   estado: { value: 0, label: "" },
  // });

  const [isLoading, setIsloading] = useState(false);

  //formik validation
  const {
    values,
    // handleBlur,
    touched,
    setValues,
    // handleChange,
    errors,
    setFieldValue,
    setFieldTouched,
    // handleSubmit,
    validateForm,
    initialValues,
    setTouched,
  } = useFormik({
    initialValues: {
      id: 0,
      codigo: "",
      nombre: "",
      descripcion: "",
      categoriaId: 0,
      marcaId: 0,
      tipoId: 0,
      estadoId: 0,
      precioCompra: 0,
      precioVenta: 0,
      minPriceSale: 0,
      stockActual: 0,
      stockMinimo: 0,
      unidadMedida: "unidad",
      ubicacion: "",
      codigoBarras: "",
      impuesto: 0,
    } as UpdateProducto,
    validationSchema: ValidationProduct,
    onSubmit: (values) => {
      console.log("Producto enviado:", values);
    },
  });

  //guardar los elementos
  function Saveproducto(producto: any) {
    setIsloading(true);
    apiRequestThen<boolean>({
      url: "api/productos/detalles-update",
      configuration: {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      },
    })
      .then((response) => {
        if (!response.success) {
          return;
        }
        // Refrescar datos en la página padre
        if (onSuccess) {
          onSuccess();
        }
        closeModal();
      })
      .finally(() => {
        setIsloading(false);
      });
  }

  //guardar los elementos
  function GetForUpdate(id: number) {
    setIsloading(true);
    apiRequestThen<UpdateProducto>({
      url: `api/productos/detalles-update/${id}`,
      configuration: {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    })
      .then((response) => {
        if (!response.success) {
          return;
        }
        console.log(response.result);
        setValues(response.result!);
      })
      .finally(() => {
        setIsloading(false);
      });
  }

  useEffect(() => {
    if (!id) {
      return;
    }
    GetForUpdate(id);
  }, [id]);

  return (
    <>
      {isLoading ? (
        <ProductFormUpdateSkeleton />
      ) : (
        <>
          <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Actualizar un producto
              </h4>
            </div>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                {/* 1️⃣ Código y nombre */}
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      type="text"
                      id="nombre"
                      placeholder="Nombre del producto"
                      hint={
                        errors.nombre && touched.nombre ? errors.nombre : ""
                      }
                      value={values.nombre ?? ""}
                      error={errors.nombre && touched.nombre ? true : false}
                      onChange={(e) => {
                        setFieldValue("nombre", e.target.value);
                      }}
                      onBlur={() => setFieldTouched("nombre", true)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      type="text"
                      id="codigo"
                      disabled={true}
                      placeholder="Ej: SKU-1234"
                      hint={errors.codigo}
                      value={values.codigo ?? ""}
                      error={errors.codigo ? true : false}
                      onChange={(e) => {
                        setFieldValue("codigo", e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* 2️⃣ Descripción */}
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <textarea
                    id="descripcion"
                    rows={3}
                    placeholder="Detalles o características del producto..."
                    value={values.descripcion ?? ""}
                    className={`border rounded-xl w-full p-2 text-sm`}
                    onChange={(e) => {
                      setFieldValue("descripcion", e.target.value);
                    }}
                  ></textarea>
                </div>

                {/* 3️⃣ Categoría, Marca y Unidad de medida */}
                <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select<Option, false>
                      id="categoria"
                      styles={customStyles()}
                      placeholder="Selecciona una categoría..."
                      value={
                        selectsData?.categorias
                          ?.map((element) => ({
                            value: element.id.toString(),
                            label: element.name,
                          }))
                          .find(
                            (opt) =>
                              opt.value === values.categoriaId?.toString()
                          ) || null
                      }
                      options={selectsData?.categorias?.map(
                        (element: BaseSelecst) => ({
                          value: element.id.toString(),
                          label: element.name,
                        })
                      )}
                      onChange={(e: SingleValue<Option>) => {
                        if (!e) return;
                        setFieldValue("categoriaId", parseInt(e.value));
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Tipo</Label>
                    <Select<Option, false>
                      id="categoria"
                      styles={customStyles()}
                      placeholder="Selecciona un tipo..."
                      value={
                        selectsData?.tipos
                          ?.map((element) => ({
                            value: element.id.toString(),
                            label: element.name,
                          }))
                          .find(
                            (opt) => opt.value === values.tipoId?.toString()
                          ) || null
                      }
                      options={selectsData?.tipos?.map(
                        (element: BaseSelecst) => ({
                          value: element.id.toString(),
                          label: element.name,
                        })
                      )}
                      onChange={(e) => {
                        if (!e || Array.isArray(e)) return;
                        setFieldValue("tipoId", parseInt(e.value));
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Marca</Label>
                    <Select<Option, false>
                      id="categoria"
                      styles={customStyles()}
                      placeholder="Selecciona una marca..."
                      value={
                        selectsData?.marcas
                          ?.map((element) => ({
                            value: element.id.toString(),
                            label: element.name,
                          }))
                          .find(
                            (opt) => opt.value === values.marcaId?.toString()
                          ) || null
                      }
                      options={selectsData?.marcas?.map(
                        (element: BaseSelecst) => ({
                          value: element.id.toString(),
                          label: element.name,
                        })
                      )}
                      onChange={(e: SingleValue<Option>) => {
                        if (!e) return;
                        setFieldValue("marcaId", parseInt(e.value));
                      }}
                    />
                  </div>
                  {/* <div>
                <Label htmlFor="unidadMedida">Unidad de medida</Label>
                <Select
                  id="unidadMedida"
                  styles={customStyles}
                  placeholder="Unidad..."
                  options={categoriaOptions}
                  onChange={(e: SingleValue<Option>) => {
                    setFieldValue("unidadMedida", parseInt(e.value));
                  }}
                />
              </div> */}
                </div>

                {/* 4️⃣ Precios */}
                <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="precio_compra">Precio de compra</Label>
                    <Input
                      type="number"
                      id="precio_compra"
                      placeholder="0.00"
                      hint={
                        errors.precioCompra && touched.precioCompra
                          ? errors.precioCompra
                          : ""
                      }
                      value={values.precioCompra ?? ""}
                      error={
                        errors.precioCompra && touched.precioCompra
                          ? true
                          : false
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setFieldValue(
                          "precioCompra",
                          val === "" ? null : parseFloat(val)
                        );
                      }}
                      onBlur={() => setFieldTouched("precioCompra", true)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio_venta">Precio de venta</Label>
                    <Input
                      type="number"
                      id="precio_venta"
                      placeholder="0.00"
                      hint={
                        errors.precioVenta && touched.precioVenta
                          ? errors.precioVenta
                          : ""
                      }
                      value={values.precioVenta ?? ""}
                      error={
                        errors.precioVenta && touched.precioVenta ? true : false
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setFieldValue(
                          "precioVenta",
                          val === "" ? null : parseFloat(val)
                        );
                      }}
                      onBlur={() => setFieldTouched("precioVenta", true)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio_minimo">
                      Precio minimo negociable
                    </Label>
                    <Input
                      type="number"
                      id="precio_minimo"
                      placeholder="0.00"
                      hint={errors.minPriceSale}
                      value={values.minPriceSale ?? ""}
                      error={errors.minPriceSale ? true : false}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFieldValue(
                          "minPriceSale",
                          val === "" ? null : parseFloat(val)
                        );
                      }}
                    />
                  </div>
                </div>

                {/* 5️⃣ Stock y ubicación */}
                <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="stockActual">Stock actual</Label>
                    <Input
                      type="number"
                      id="stockActual"
                      placeholder="0"
                      hint={
                        errors.stockActual && touched.stockActual
                          ? errors.stockActual
                          : ""
                      }
                      value={values.stockActual ?? ""}
                      error={
                        errors.stockActual && touched.stockActual ? true : false
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setFieldValue(
                          "stockActual",
                          val === "" ? null : parseFloat(val)
                        );
                      }}
                      onBlur={() => setFieldTouched("stockActual", true)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_minimo">Stock mínimo</Label>
                    <Input
                      type="number"
                      id="stock_minimo"
                      placeholder="0"
                      hint={errors.stockMinimo}
                      value={values.stockMinimo ?? ""}
                      error={errors.stockMinimo ? true : false}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFieldValue(
                          "stockMinimo",
                          val === "" ? null : parseFloat(val)
                        );
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      type="text"
                      id="ubicacion"
                      placeholder="Ej: Estante A3"
                      hint={errors.ubicacion}
                      value={values.ubicacion ?? ""}
                      error={errors.ubicacion ? true : false}
                      onChange={(e) => {
                        setFieldValue("ubicacion", e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* 6️⃣ Código de barras y estado */}
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="codigo_barras">Código de barras</Label>
                    <Input
                      type="text"
                      disabled={true}
                      id="codigo_barras"
                      placeholder="Ej: 1234567890"
                      hint={errors.codigoBarras}
                      value={values.codigoBarras ?? ""}
                      error={errors.codigoBarras ? true : false}
                      onChange={(e) => {
                        setFieldValue("codigoBarras", e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="es_activo">Estado</Label>
                    <Select<Option, false>
                      id="estado"
                      styles={customStyles(
                        !!errors.estadoId && touched.estadoId
                      )}
                      placeholder="Seleccione un estado.."
                      value={
                        selectsData?.estados
                          ?.map((element) => ({
                            value: element.id.toString(),
                            label: element.name,
                          }))
                          .find(
                            (opt) => opt.value === values.estadoId?.toString()
                          ) || null
                      }
                      options={selectsData?.estados?.map(
                        (element: BaseSelecst) => ({
                          value: element.id.toString(),
                          label: element.name,
                        })
                      )}
                      onChange={(e: SingleValue<Option>) => {
                        if (!e) return;
                        setFieldValue("estadoId", parseInt(e.value));
                      }}
                      onBlur={() => setFieldTouched("estadoId", true)}
                    />
                    {errors.estadoId && touched.estadoId && (
                      <p className={`mt-1.5 text-xs text-error-500`}>
                        {errors.estadoId}
                      </p>
                    )}
                  </div>
                </div>

                {/* 7️⃣ Impuesto */}
                <div>
                  <Label htmlFor="impuesto">Impuesto (%)</Label>
                  <Input
                    type="number"
                    id="impuesto"
                    placeholder="Ej: 18"
                    hint={errors.impuesto}
                    value={values.impuesto ?? ""}
                    error={errors.impuesto ? true : false}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFieldValue(
                        "impuesto",
                        val === "" ? null : parseFloat(val)
                      );
                    }}
                  />
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
                    Saveproducto(values);
                  } else {
                    console.log("Errores encontrados:", errors);
                  }
                }}
              >
                Guardar producto
              </Button>
            </div>
          </form>
        </>
      )}
    </>
  );
}

function ProductFormUpdateSkeleton() {
  return (
    <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
      <div className="px-2 pr-14">
        <div className="shimmer h-6 w-60 my-4 rounded" />
      </div>

      <form className="flex flex-col">
        <div className="px-2 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5">
            {/* 1️⃣ Código y nombre */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 2️⃣ Descripción */}
            <SkeletonBox height="h-20" />

            {/* 3️⃣ Categoría, Marca, Tipo */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <SkeletonBox />
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 4️⃣ Precios */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <SkeletonBox />
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 5️⃣ Stock y ubicación */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <SkeletonBox />
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 6️⃣ Código de barras y estado */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
              <SkeletonBox />
              <SkeletonBox />
            </div>

            {/* 7️⃣ Impuesto */}
            <SkeletonBox />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <SkeletonBox height="h-8" width="w-24" />
          <SkeletonBox height="h-8" width="w-32" />
        </div>
      </form>
    </div>
  );
}

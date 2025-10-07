import { customStyles } from "../../Utilities/StyleForReactSelect";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select, { SingleValue } from "react-select";
import { useFormik } from "formik";
import { ValidationProduct } from "../../Utilities/ValidationProduct";
import { useEffect } from "react";

type Actions = {
  closeModal: () => void;
};

type Option = {
  value: string;
  label: string;
};

const categoriaOptions: Option[] = [
  { value: "1", label: "Electrónica" },
  { value: "2", label: "Ropa" },
  { value: "3", label: "Hogar" },
];

export default function FormProducts(params: Actions) {
  const { closeModal } = params;

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
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria_id: 0,
      marca_id: 0,
      tipo_id: 0,
      estado_id: 0,
      precio_compra: 0,
      precio_venta: 0,
      precio_minimo: 0,
      stock_actual: 0,
      stock_minimo: 0,
      unidad_medida: "unidad",
      ubicacion: "",
      codigo_barras: "",
      impuesto: 0,
    },
    validationSchema: ValidationProduct,
    onSubmit: (values) => {
      console.log("Producto enviado:", values);
    },
  });

  useEffect(() => {
    console.log(values);
  }, [values]);

  return (
    <>
      <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Agregar un producto
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
                  hint={errors.nombre}
                  value={values.nombre ?? ""}
                  error={errors.nombre ? true : false}
                  onChange={(e) => {
                    setFieldValue("nombre", e.target.value);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  type="text"
                  id="codigo"
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
                <Select
                  id="categoria"
                  styles={customStyles}
                  placeholder="Selecciona una categoría..."
                  options={categoriaOptions}
                  onChange={(e: SingleValue<Option>) => {
                    setFieldValue("categoria_id", parseInt(e.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="categoria">Tipo</Label>
                <Select
                  id="categoria"
                  styles={customStyles}
                  placeholder="Selecciona una categoría..."
                  options={categoriaOptions}
                  onChange={(e: SingleValue<Option>) => {
                    setFieldValue("tipo_id", parseInt(e.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="categoria">Marca</Label>
                <Select
                  id="categoria"
                  styles={customStyles}
                  placeholder="Selecciona una categoría..."
                  options={categoriaOptions}
                  onChange={(e: SingleValue<Option>) => {
                    setFieldValue("marca_id", parseInt(e.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="unidad_medida">Unidad de medida</Label>
                <Select
                  id="unidad_medida"
                  styles={customStyles}
                  placeholder="Unidad..."
                  options={categoriaOptions}
                  onChange={(e: SingleValue<Option>) => {
                    setFieldValue("unidad_medida", parseInt(e.value));
                  }}
                />
              </div>
            </div>

            {/* 4️⃣ Precios */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="precio_compra">Precio de compra</Label>
                <Input
                  type="number"
                  id="precio_compra"
                  placeholder="0.00"
                  hint={errors.precio_compra}
                  value={values.precio_compra ?? ""}
                  error={errors.precio_compra ? true : false}
                  onChange={(e) => {
                    setFieldValue("precio_compra", parseFloat(e.target.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="precio_venta">Precio de venta</Label>
                <Input
                  type="number"
                  id="precio_venta"
                  placeholder="0.00"
                  hint={errors.precio_venta}
                  value={values.precio_venta ?? ""}
                  error={errors.precio_venta ? true : false}
                  onChange={(e) => {
                    setFieldValue("precio_venta", parseFloat(e.target.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="precio_minimo">Precio minimo negociable</Label>
                <Input
                  type="number"
                  id="precio_minimo"
                  placeholder="0.00"
                  hint={errors.precio_minimo}
                  value={values.precio_minimo ?? ""}
                  error={errors.precio_minimo ? true : false}
                  onChange={(e) => {
                    setFieldValue("precio_minimo", parseFloat(e.target.value));
                  }}
                />
              </div>
            </div>

            {/* 5️⃣ Stock y ubicación */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="stock_actual">Stock actual</Label>
                <Input
                  type="number"
                  id="stock_actual"
                  placeholder="0"
                  hint={errors.stock_actual}
                  value={values.stock_actual ?? ""}
                  error={errors.stock_actual ? true : false}
                  onChange={(e) => {
                    setFieldValue("stock_actual", parseInt(e.target.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="stock_minimo">Stock mínimo</Label>
                <Input
                  type="number"
                  id="stock_minimo"
                  placeholder="0"
                  hint={errors.stock_minimo}
                  value={values.stock_minimo ?? ""}
                  error={errors.stock_minimo ? true : false}
                  onChange={(e) => {
                    setFieldValue("stock_minimo", parseInt(e.target.value));
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
                  id="codigo_barras"
                  placeholder="Ej: 1234567890"
                  hint={errors.codigo_barras}
                  value={values.codigo_barras ?? ""}
                  error={errors.codigo_barras ? true : false}
                  onChange={(e) => {
                    setFieldValue("codigo_barras", e.target.value);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="es_activo">Estado</Label>
                <Select
                  id="estado"
                  styles={customStyles}
                  options={categoriaOptions}
                  onChange={(e: SingleValue<Option>) => {
                    setFieldValue("estado_id", parseInt(e.value));
                  }}
                />
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
                  setFieldValue("impuesto", e.target.value);
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
          <Button size="sm">Guardar producto</Button>
        </div>
      </form>
    </>
  );
}

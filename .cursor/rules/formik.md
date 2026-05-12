# Formularios con Formik (patrón canónico del proyecto)

La referencia principal es **`src/components/Facturacion/FormFactutas.tsx`** (nombre del archivo con la variante `Factutas`). Otros formularios complejos que siguen la misma idea: `FormFacturasPersistentes.tsx`, `FormProducts.tsx`, `EditProducto.tsx`.

## Principios

1. **`useFormik`** (no obligatorio usar `<Formik>` + `<Form>` salvo casos puntuales): desestructurar lo que haga falta, típicamente `values`, `touched`, `errors`, `setFieldValue`, `setFieldTouched`, `validateForm`, `initialValues`, `setTouched`.
2. **Yup en archivo aparte** bajo `src/Utilities/`, exportado como constante (ej. `ValidationFactura` en `ValidationFactura.tsx`). El hook recibe `validationSchema: ValidationFactura`.
3. **Layout del bloque de formulario**: contenedor externo + cabecera con borde + `<form className="flex flex-col">` + rejilla interna + fila de botones al pie.
4. **Campos**: `Label` + `Input` con `hint` / `error` / `onBlur` → `setFieldTouched`. Números en `Input` tipo `text` con regex en `onChange` cuando aplique (ver factura: `montoPagado`).
5. **`react-select`**: `Select` de `react-select`, `customStyles` desde `Utilities/StyleForReactSelect`, `Option` desde `Types/ProductTypes`, `menuPortalTarget={document.body}`. Errores debajo con `text-error-500` si hace falta además del borde rojo en estilos.

---

## 1. Yup separado (`src/Utilities/ValidationFactura.tsx`)

```ts
import * as Yup from "yup";

export const ValidationFactura = Yup.object({
  nombreCliente: Yup.string()
    .max(150, "Máximo 150 caracteres")
    .nullable()
    .required("La factura debe estar a nombre de alguien"),
  metodoPagoId: Yup.number()
    .integer("Debe ser un número entero")
    .min(1, "Seleccione un metodo de pago")
    .required("El método de pago es obligatorio"),
  montoPagado: Yup.number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("El monto pagado es obligatorio"),
});
```

- Un esquema por dominio (`ValidationProduct`, `ValidationMembresiaPlan`, etc.).
- Mensajes en español, alineados con lo que el usuario ve en `hint` / `<p>` de error.

---

## 2. Hook Formik (inicio de `FormFactutas.tsx`)

```tsx
const {
  values,
  touched,
  errors,
  setFieldValue,
  setFieldTouched,
  validateForm,
  initialValues,
  setTouched,
} = useFormik({
  initialValues: {
    nombreCliente: "",
    documentoCliente: "",
    metodoPagoId: 0,
    montoPagado: 0,
    // ... resto de campos con tipos coherentes con Save* / DTO
  },
  validationSchema: ValidationFactura,
  onSubmit: (values) => {
    // En factura a veces solo log; el envío real va en funciones dedicadas
  },
});
```

- **`initialValues`**: debe incluir **todas** las claves que Yup valide y que uses en el formulario (incluidos ids en 0 si aplica).
- Para **edición** con datos remotos: tras `GET`, `setValues(response.result)` (como `EditProducto.tsx`) o `enableReinitialize` con `initialValues` derivados del padre.

---

## 3. Enviar / validar antes de guardar (patrón `handleGuardarFacturaPrincipal`)

No confiar solo en `onSubmit` del `useFormik` si el guardado lo disparas desde botones custom o lógica extra. Patrón del proyecto:

```tsx
const handleGuardarFacturaPrincipal = async () => {
  const errors = await validateForm();
  setTouched(
    Object.keys(initialValues).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
    true,
  );
  if (Object.keys(errors).length === 0) {
    SaveFactura({ ...values });
  }
};
```

- Así se marcan **todos** los campos tocados y se muestran errores completos en un solo intento.
- El `<form onSubmit={(e) => { e.preventDefault(); void handleGuardarFacturaPrincipal(); }}>` redirige el submit al mismo handler.

---

## 3.1 Integración “colección + Formik + persistencia” (`SaveElements` → `RecalcularFactura` → `SaveFactura`)

En formularios compuestos (factura + líneas de producto), conviene **separar responsabilidades** en funciones con nombres claros y un solo sentido de flujo de datos.

### Capas (orden mental)

| Capa | Función típica (`FormFactutas.tsx`) | Responsabilidad |
|------|--------------------------------------|-----------------|
| **A. Entrada de ítem** | `SaveElements(productElement: Producto)` | Validar stock/reglas de negocio, actualizar estado local `products` (o equivalente), notificar UX (toast), invocar la capa B. |
| **B. Derivados en Formik** | `RecalcularFactura(elements: Productos[])` | A partir de la colección **actual**, calcular totales/subtotales/impuestos y escribirlos en el formulario con `setFieldValue` (no mezclar cálculo duplicado en JSX). |
| **C. Persistencia** | `SaveFactura(producto: SaveFactura)` | Componer el **DTO del API** (`payload`): campos del form (`...producto` / `values`) + datos hijos desde estado (`products` → `saveProductos`), validar precondiciones (ej. `total > 0`), `setIsLoading`, `apiRequestThen`, toasts, `onSuccess` / `closeModal`. |

### Flujo recomendado

1. **`SaveElements`** recibe un **tipo de dominio** (`Producto`), no el `values` completo del formulario.
2. Tras mutar `products` (inmutable: copia `[...]`, luego `setProducts`), llama **`RecalcularFactura(elements)`** con el array **ya actualizado** para que Formik refleje importes coherentes.
3. **`SaveFactura`** (o `persistFactura`) es el **único lugar** que arma `JSON.stringify` hacia el backend y conoce la URL; el handler del botón “Guardar” solo valida Yup y delega aquí.

### Patrón de código (esquema)

```tsx
// A — ítem suelto → estado local + sincroniza totales en Formik
function SaveElements(productElement: Producto) {
  // validar stock, mutar products, params.sendStock(...)
  const elements = [...products /* actualizar o push */];
  RecalcularFactura(elements);
  setProducts(elements);
}

// B — colección → campos derivados del formulario
function RecalcularFactura(elements: Productos[]) {
  const resultado = elements.reduce(/* subtotal, impuestos, total */, inicial);
  setFieldValue("subtotal", resultado.subtotal + values.manoDeObra);
  setFieldValue("total", resultado.total + values.manoDeObra);
  // …
}

// C — formulario + colección → API
function SaveFactura(producto: SaveFactura) {
  if (values.total === 0) {
    /* feedback */ return;
  }
  setIsLoading(true);
  const saveProductos = products
    .filter((el) => el.cantidad !== 0)
    .map((el) => ({ productoId: el.id, cantidad: el.cantidad /* … */ }));
  const payload = { ...producto, productos: saveProductos };
  void apiRequestThen({ url: "…", method: "POST", body: JSON.stringify(payload) })
    .then(/* toast, closeModal, onSuccess */)
    .finally(() => setIsLoading(false));
}
```

### Reglas prácticas

- **No** armar el `body` del POST repartiendo lógica entre `onClick` sueltos y `SaveFactura`; centralizar en la función de persistencia (capa C).
- **No** actualizar `subtotal`/`total` solo en `useEffect` si ya existe `RecalcularFactura`; una sola fuente de verdad tras cambios de líneas.
- Si el formulario **no** tiene líneas (solo campos), basta con **capa C** directa: `buildPayload(values)` + `persistX(payload)` llamados desde el handler post-`validateForm`.

---

## 4. Estructura visual (shell + rejilla + botones)

Copiar la jerarquía de **`FormFactutas.tsx`** (aprox. líneas 786–798 y 1284–1326):

```tsx
return (
  <div className="relative flex min-h-0 w-full flex-col">
    {/* Cabecera del formulario / modal */}
    <div className="relative shrink-0 border-b border-gray-100 bg-white px-2 pb-3 pr-14 pt-1 dark:border-gray-800 dark:bg-gray-900">
      <h4 className="mb-0 text-2xl font-semibold text-gray-800 dark:text-white/90">
        Creacion de factura
      </h4>
    </div>

    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        void handleGuardarFacturaPrincipal();
      }}
    >
      <div className="px-2 pb-4 pt-2">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5">
          {/* Fila de dos columnas en pantallas grandes */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nombreCliente">Nombre cliente</Label>
              <Input
                type="text"
                id="nombreCliente"
                placeholder="…"
                hint={
                  errors.nombreCliente && touched.nombreCliente
                    ? errors.nombreCliente
                    : ""
                }
                value={values.nombreCliente ?? ""}
                error={
                  !!(errors.nombreCliente && touched.nombreCliente)
                }
                onChange={(e) =>
                  setFieldValue("nombreCliente", e.target.value)
                }
                onBlur={() => setFieldTouched("nombreCliente", true)}
              />
            </div>
            {/* más campos */}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="mt-6 flex flex-col gap-2 px-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        <Button size="sm" variant="outline" type="button" onClick={closeModal}>
          Cancelar
        </Button>
        <Button size="sm" type="submit">
          Guardar
        </Button>
      </div>
    </form>

    {isLoading && <LoaderFun />}
  </div>
);
```

- **`pr-14` en la cabecera**: deja aire al botón cerrar del `Modal` cuando el formulario va dentro de modal.
- **Modales**: mismo layout dentro del `children` del `Modal`; si hay `react-select`, usar `menuPortalTarget={document.body}` y, si el menú queda detrás del overlay, `menuPosition="fixed"` y/o `zIndex` alto en el modal (ver otros formularios).

---

## 5. Input numérico con regex (ej. `montoPagado`)

```tsx
const regexNum = /^-?\d+(\.\d+)?$/;

<Input
  type="text"
  id="montoPagadoFact"
  placeholder="0.00"
  hint={
    errors.montoPagado && touched.montoPagado ? errors.montoPagado : ""
  }
  value={values.montoPagado ?? ""}
  error={!!(errors.montoPagado && touched.montoPagado)}
  onChange={(e) => {
    const value = e.target.value;
    if (value === "") {
      setFieldValue("montoPagado", 0);
      return;
    }
    if (regexNum.test(value)) {
      setFieldValue("montoPagado", Number(value));
    }
  }}
  onBlur={() => setFieldTouched("montoPagado", true)}
/>
```

---

## 6. Select + Formik (ej. método de pago)

```tsx
import Select, { type SingleValue } from "react-select";
import { customStyles } from "../../Utilities/StyleForReactSelect";
import type { Option } from "../../Types/ProductTypes";

<Label htmlFor="metodoPago">Método de pago</Label>
<Select<Option, false>
  inputId="metodoPago"
  styles={customStyles(!!(errors.metodoPagoId && touched.metodoPagoId))}
  placeholder="Seleccionar…"
  menuPortalTarget={document.body}
  options={selectsData?.metodoPago?.map((el) => ({
    value: el.id.toString(),
    label: el.name,
  }))}
  onChange={(e: SingleValue<Option>) => {
    if (!e) return;
    setFieldValue("metodoPagoId", parseInt(e.value, 10));
  }}
  onBlur={() => setFieldTouched("metodoPagoId", true)}
/>
{errors.metodoPagoId && touched.metodoPagoId && (
  <p className="mt-1.5 text-xs text-error-500">{errors.metodoPagoId}</p>
)}
```

- **`value` controlado**: calcular con `.find()` sobre `options` según `values.metodoPagoId` (no dejar el Select sin `value` si el resto del formulario es controlado).

---

## 7. Checkbox del diseño (`components/form/input/Checkbox.tsx`)

En factura, el checkbox “todo pagado” puede estar ligado a estado local + `useEffect` que hace `setFieldValue("montoPagado", …)`. Para campos booleanos puros del modelo, preferir `setFieldValue('campo', checked)` desde `onChange` del `Checkbox`.

---

## Checklist al crear un formulario nuevo

| Paso | Acción |
|------|--------|
| 1 | Definir tipo de valores / payload en `src/Types/…` |
| 2 | Crear `src/Utilities/ValidationNombreEntidad.tsx` con `Yup.object({…})` |
| 3 | `useFormik({ initialValues, validationSchema, onSubmit })` |
| 4 | Shell: `relative flex min-h-0 w-full flex-col` + cabecera con `border-b` + título `text-2xl font-semibold` |
| 5 | `form` + `px-2 pb-4 pt-2` + `grid grid-cols-1 gap-x-6 gap-y-5` + subrejillas `lg:grid-cols-2` / `lg:grid-cols-3` |
| 6 | Cada campo: `Label` + `Input`/`Select` + `hint`/`error` + `setFieldTouched` en blur |
| 7 | Guardado: `validateForm` + `setTouched` sobre `initialValues`; si no hay errores: **solo campos** → `buildPayload` + `persistX` (capa C); **con líneas** → `SaveElements` → `Recalcular` → `SaveFactura` |
| 8 | Pie: `mt-6 flex flex-col gap-2 px-2 sm:flex-row … sm:justify-end sm:gap-3` (como `FormFactutas`); `LoaderFun` si hay carga global |

---

## No hacer (en este repo)

- Mezclar validación grande en el mismo archivo del formulario si ya existe el patrón `Validation*.tsx`.
- Inputs sin `hint`/`error` cuando Yup ya define el mensaje.
- Olvidar `menuPortalTarget` en selects dentro de modales con overflow.
- Usar solo `onSubmit` de Formik sin `setTouched` masivo si el botón de guardar **no** es `type="submit"` o la validación debe alinearse con el patrón anterior.

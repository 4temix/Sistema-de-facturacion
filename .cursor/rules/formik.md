# Uso de Formik

- **Importar**: `import { Formik, Form } from "formik";` (y `Field` si se usan campos nativos con `Field`).
- **Estructura en modales**: Formulario dentro de `Modal`; `<Formik>` con `initialValues`, `validationSchema`, `onSubmit`, `enableReinitialize` para edición.
- **Render props**: Children como función con `values`, `errors`, `touched`, `setFieldValue`, `setFieldTouched`, `handleChange`, `handleBlur`.
- **Input**: Componente `Input` con `name`, `value={values.x}`, `onChange={handleChange}`, `onBlur={handleBlur}`, `error`, `hint`. O `<Field name="x" className="..." />` y mensaje de error debajo.
- **Select**: Ver regla de Select. `value` desde options, `onChange` con `setFieldValue`, `onBlur` con `setFieldTouched`.
- **Checkbox / Color**: `<Field name="x">{(field) => ( ... field.value, field.onChange ... )}</Field>`.
- **Submit**: Botón `type="submit"` dentro de `<Form>`. Errores de servidor como mensaje global en el modal.

### Código de referencia: Formik en modal (UserFormModal – estructura y campos)

```tsx
import { Formik, Form } from "formik";
import type { SingleValue } from "react-select";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import Select from "../Select";
import type { Option } from "../../types/forms";
import { getSchema } from "./userFormUtils";

// ...

<Modal isOpen={isOpen} onClose={onClose} title={editing ? "Editar usuario" : "Nuevo usuario"} size="lg">
  {selectsError && <p className="text-sm text-red-600 mb-4">{selectsError}</p>}
  <Formik
    initialValues={initialValues}
    validationSchema={getSchema(!!editing)}
    onSubmit={handleSubmit}
    enableReinitialize
  >
    {({
      values,
      errors,
      touched,
      setFieldValue,
      setFieldTouched,
      handleChange,
      handleBlur,
    }) => (
      <Form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
            <Input
              name="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Usuario"
              error={!!(touched.username && errors.username)}
              hint={touched.username && errors.username ? String(errors.username) : undefined}
            />
          </div>
          {/* Más Inputs igual: name, value, onChange, onBlur, error, hint */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Restaurante asignado</label>
            <Select
              id="restaurant_id"
              placeholder={loadingSelects ? "Cargando..." : "— Ninguno —"}
              value={
                restauranteOptions.find((o) => o.value === String(values.restaurant_id)) ?? restauranteOptions[0]
              }
              options={restauranteOptions}
              onChange={(e: SingleValue<Option>) => {
                setFieldValue("restaurant_id", parseInt(e?.value ?? "0", 10));
              }}
              onBlur={() => setFieldTouched("restaurant_id", true)}
              isDisabled={loadingSelects}
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loadingSelects || submitting}>
            {submitting ? "Enviando..." : editing ? "Guardar" : "Crear"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        </div>
      </Form>
    )}
  </Formik>
</Modal>
```

### Campo con Field (RestaurantFormModal – color + checkbox)

```tsx
import { Formik, Form, Field } from "formik";

// Color
<Field name="color">
  {({ field }: { field: { value: string; onChange: (e: unknown) => void } }) => (
    <>
      <input type="color" {...field} className="w-10 h-10 rounded border border-slate-300 cursor-pointer" />
      <input type="text" value={field.value} onChange={field.onChange} className="flex-1 px-3 py-2 rounded-lg ..." />
    </>
  )}
</Field>
{touched.color && errors.color && <p className="text-sm text-red-600 mt-1">{errors.color}</p>}

// Checkbox
<Field name="isActive" type="checkbox" className="rounded border-slate-300" />
<label className="text-sm font-medium text-slate-700">Activo</label>
```

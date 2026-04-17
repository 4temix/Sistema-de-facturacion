# Select (react-select)

- **Componente**: `src/components/Select.tsx`. Wrapper de `react-select` con estilos custom.
- **Tipo**: `Option` en `src/types/forms.ts`: `{ value: string; label: string }`.
- **Props**: `id?`, `placeholder?`, `value` (Option | null), `options`, `onChange: (option: SingleValue<Option>) => void`, `onBlur?`, `isDisabled?`, `error?`, `className?`.
- **Con Formik**: `value` = find en options por `values.campo`; `onChange` = `setFieldValue("campo", e?.value ?? "")` o `parseInt(e?.value ?? "0", 10)`; `onBlur` = `setFieldTouched("campo", true)`.

### Código de referencia: componente Select (src/components/Select.tsx)

```tsx
import ReactSelect from "react-select";
import type { StylesConfig, SingleValue } from "react-select";
import type { Option } from "../types/forms";

type SelectProps = {
  id?: string;
  placeholder?: string;
  value?: Option | null;
  options?: Option[];
  onChange: (option: SingleValue<Option>) => void;
  onBlur?: () => void;
  isDisabled?: boolean;
  error?: boolean;
  className?: string;
};

function customStyles(hasError: boolean): StylesConfig<Option, false> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: "0.5rem",
      borderColor: hasError
        ? "rgb(239 68 68)"
        : state.isFocused ? "rgb(100 116 139)" : "rgb(203 213 225)",
      boxShadow: state.isFocused && !hasError ? "0 0 0 2px rgb(100 116 139 / 0.2)" : "none",
      "&:hover": { borderColor: hasError ? "rgb(239 68 68)" : "rgb(148 163 184)" },
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    placeholder: (base) => ({ ...base, color: "rgb(148 163 184)" }),
    singleValue: (base) => ({ ...base, color: "rgb(30 41 59)" }),
    input: (base) => ({ ...base, color: "rgb(30 41 59)" }),
  };
}

export default function Select({ id, placeholder = "Seleccione...", value, options, onChange, onBlur, isDisabled = false, error = false, className = "" }: SelectProps) {
  return (
    <div className={className}>
      <ReactSelect<Option, false>
        inputId={id}
        styles={customStyles(error)}
        placeholder={placeholder}
        menuPortalTarget={document.body}
        value={value}
        options={options}
        onChange={onChange}
        onBlur={onBlur}
        isDisabled={isDisabled}
        isClearable={false}
      />
    </div>
  );
}
```

### Tipo Option (src/types/forms.ts)

```ts
export type Option = {
  value: string;
  label: string;
};
```

### Uso con Formik (valor numérico y valor string)

```tsx
// Valor numérico (ej. restaurant_id)
<Select
  id="restaurant_id"
  placeholder="— Ninguno —"
  value={restauranteOptions.find((o) => o.value === String(values.restaurant_id)) ?? restauranteOptions[0]}
  options={restauranteOptions}
  onChange={(e: SingleValue<Option>) => {
    setFieldValue("restaurant_id", parseInt(e?.value ?? "0", 10));
  }}
  onBlur={() => setFieldTouched("restaurant_id", true)}
/>

// Valor string (ej. userLink)
<Select
  value={values.userLink ? { value: values.userLink, label: userLabel(users.find(...)) } : userOptions[0]}
  options={userOptions}
  onChange={(e: SingleValue<Option>) => setFieldValue("userLink", e?.value ?? "")}
  onBlur={() => setFieldTouched("userLink", true)}
/>
```

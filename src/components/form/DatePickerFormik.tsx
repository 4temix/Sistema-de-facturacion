import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

interface DatePickerFormikProps {
  id: string;
  name: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
}

export default function DatePickerFormik({
  id,
  name,
  label,
  placeholder = "Seleccione una fecha",
  value,
  onChange,
  onBlur,
  error = false,
  errorMessage,
}: DatePickerFormikProps) {
  const flatpickrRef = useRef<flatpickr.Instance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);

  // Mantener las referencias actualizadas
  useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
  }, [onChange, onBlur]);

  useEffect(() => {
    if (!inputRef.current) return;

    const options: flatpickr.Options.Options = {
      dateFormat: "Y-m-d",
      clickOpens: true,
      allowInput: false,
      defaultDate: value || undefined,
      onChange: (selectedDates, dateStr) => {
        if (dateStr && onChangeRef.current) {
          onChangeRef.current(dateStr);
        }
        if (onBlurRef.current) {
          onBlurRef.current();
        }
      },
      onClose: () => {
        if (onBlurRef.current) {
          onBlurRef.current();
        }
      },
    };

    flatpickrRef.current = flatpickr(inputRef.current, options);

    return () => {
      if (flatpickrRef.current && !Array.isArray(flatpickrRef.current)) {
        flatpickrRef.current.destroy();
      }
    };
  }, []);

  // Actualizar el valor cuando cambie desde fuera
  useEffect(() => {
    if (flatpickrRef.current && !Array.isArray(flatpickrRef.current) && inputRef.current) {
      const currentValue = flatpickrRef.current.input.value;
      if (currentValue !== value) {
        flatpickrRef.current.setDate(value || "", false);
      }
    }
  }, [value]);

  const inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 ${
    error
      ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-800"
      : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
  }`;

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          placeholder={placeholder}
          className={inputClasses}
          readOnly
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
      {error && errorMessage && (
        <p className="mt-1.5 text-xs text-error-500">{errorMessage}</p>
      )}
    </div>
  );
}


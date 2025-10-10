import { StylesConfig } from "react-select";

type Option = {
  value: string;
  label: string;
};

export const customStyles = (hasError?: boolean): StylesConfig<Option> => ({
  control: (provided, state) => ({
    ...provided,
    height: "2.75rem", // h-11
    width: "100%",
    borderRadius: "0.5rem", // rounded-lg
    borderWidth: "1px",
    borderColor: hasError
      ? "#ef4444" // rojo si hay error
      : state.isFocused
      ? "#93c5fd"
      : "#d1d5db",
    backgroundColor: "transparent",
    paddingLeft: "1rem", // px-4
    paddingRight: "0.50rem", // pr-11
    boxShadow: hasError
      ? "0 0 0 1px #ef4444"
      : state.isFocused
      ? "0 0 0 3px rgba(59,130,246,0.1)"
      : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:hover": {
      borderColor: hasError ? "#ef4444" : "#93c5fd",
    },
  }),
});

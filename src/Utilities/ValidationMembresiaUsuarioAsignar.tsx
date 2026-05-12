import * as Yup from "yup";

function isSelectOption(v: unknown): v is { value: string; label: string } {
  return (
    v != null &&
    typeof v === "object" &&
    "value" in v &&
    typeof (v as { value: unknown }).value === "string" &&
    String((v as { value: string }).value).length > 0 &&
    "label" in v &&
    typeof (v as { label: unknown }).label === "string"
  );
}

/** Asignar membresía a usuario (POST api/v1/membresia). */
export const ValidationMembresiaUsuarioAsignar = Yup.object({
  plan: Yup.mixed()
    .test("plan", "Selecciona un plan", (v) => isSelectOption(v))
    .required("Selecciona un plan"),
  status: Yup.mixed()
    .test("status", "Selecciona un estado", (v) => isSelectOption(v))
    .required("Selecciona un estado"),
});

import * as Yup from "yup";

export const ValidationNomina = Yup.object().shape({
  tipo: Yup.string().required("El tipo de nómina es requerido"),
  periodoInicio: Yup.string().required("La fecha de inicio es requerida"),
  periodoFin: Yup.string().required("La fecha de fin es requerida"),
});


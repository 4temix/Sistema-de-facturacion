import * as yup from "yup";

export const ValidationUserProfile = yup.object().shape({
  realName: yup
    .string()
    .nullable()
    .min(2, "Mínimo 2 caracteres"),
  lastName: yup
    .string()
    .nullable()
    .min(2, "Mínimo 2 caracteres"),
  teNumber: yup
    .string()
    .nullable(),
  about: yup
    .string()
    .nullable(),
  compName: yup
    .string()
    .nullable(),
  address: yup
    .string()
    .nullable(),
  userImage: yup
    .mixed<File>()
    .nullable(),
});


import { useState } from "react";
import { useFormik, FormikProps } from "formik";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { ValidationUserProfile } from "./yup";
import { apiRequestThen, baseUrl } from "../../Utilities/FetchFuntions";
import { useUserData } from "../../context/GlobalUserContext";
import Swal from "sweetalert2";

export interface UserProfileFormValues {
  realName: string | null;
  lastName: string | null;
  teNumber: string | null;
  about: string | null;
  compName: string | null;
  address: string | null;
  userImage: File | null;
}

interface EditUserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditUserProfile({
  isOpen,
  onClose,
  onSuccess,
}: EditUserProfileProps) {
  const { user, token } = useUserData();
  const [isSaving, setIsSaving] = useState(false);
  // TODO: Reactivar cuando se implemente la funcionalidad de imagen
  // const [imagePreview, setImagePreview] = useState<string | null>(
  //   user?.userImage || null
  // );

  const formik: FormikProps<UserProfileFormValues> = useFormik({
    initialValues: {
      realName: user?.realName || null,
      lastName: user?.lastName || null,
      teNumber: user?.teNumber || null,
      about: user?.about || null,
      compName: user?.compName || null,
      address: user?.address || null,
      userImage: null,
    },
    validationSchema: ValidationUserProfile,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSaving(true);

      try {
        // TODO: Cuando se implemente la imagen, cambiar a FormData
        // Crear FormData para enviar la imagen si existe
        // const formData = new FormData();
        // formData.append("Id", user?.id.toString() || "");
        // if (values.realName) formData.append("RealName", values.realName);
        // if (values.lastName) formData.append("LastName", values.lastName);
        // if (values.teNumber) formData.append("TeNumber", values.teNumber);
        // if (values.about) formData.append("About", values.about);
        // if (values.compName) formData.append("CompName", values.compName);
        // if (values.address) formData.append("Address", values.address);
        // if (values.userImage) {
        //   formData.append("UserImage", values.userImage);
        // }

        // Enviar como JSON (sin imagen por ahora)
        const updateData: any = {
          Id: user?.id || 0,
        };
        if (values.realName) updateData.RealName = values.realName;
        if (values.lastName) updateData.LastName = values.lastName;
        if (values.teNumber) updateData.TeNumber = values.teNumber;
        if (values.about) updateData.About = values.about;
        if (values.compName) updateData.CompName = values.compName;
        if (values.address) updateData.Address = values.address;
        // TODO: Agregar UserImage cuando se implement

        apiRequestThen<null>({
          url: `api/user/update_user`,
          configuration: {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          },
        }).then((response) => {
          if (!response.success) {
            const Toast = Swal.mixin({
              toast: true,
              position: "bottom-end",
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });

            Toast.fire({
              icon: "error",
              title: response.errorMessage || "Error al actualizar el perfil",
            });
            return;
          }

          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });

          Toast.fire({
            icon: "success",
            title: "Perfil actualizado correctamente",
          });

          onClose();
          onSuccess?.();
        });
      } catch (error) {
        console.error("Error al actualizar perfil:", error);
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: "error",
          title: "Error inesperado al actualizar el perfil",
        });
      } finally {
        setIsSaving(false);
      }
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;

  // TODO: Reactivar cuando se implemente la funcionalidad de imagen
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setFieldValue("userImage", file);
  //     // Crear preview de la imagen
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Editar Perfil
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Actualiza tu información personal.
          </p>
        </div>
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            formik.handleSubmit();
          }}
        >
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div>
              <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                Información Personal
              </h5>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label htmlFor="realName">Nombre</Label>
                  <Input
                    type="text"
                    id="realName"
                    value={values.realName || ""}
                    onChange={(e) => setFieldValue("realName", e.target.value)}
                    onBlur={() => setFieldTouched("realName", true)}
                    error={!!errors.realName && touched.realName}
                    hint={
                      errors.realName && touched.realName ? errors.realName : ""
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    type="text"
                    id="lastName"
                    value={values.lastName || ""}
                    onChange={(e) => setFieldValue("lastName", e.target.value)}
                    onBlur={() => setFieldTouched("lastName", true)}
                    error={!!errors.lastName && touched.lastName}
                    hint={
                      errors.lastName && touched.lastName ? errors.lastName : ""
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label htmlFor="teNumber">Teléfono</Label>
                  <Input
                    type="text"
                    id="teNumber"
                    value={values.teNumber || ""}
                    onChange={(e) => setFieldValue("teNumber", e.target.value)}
                    onBlur={() => setFieldTouched("teNumber", true)}
                    error={!!errors.teNumber && touched.teNumber}
                    hint={
                      errors.teNumber && touched.teNumber ? errors.teNumber : ""
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label htmlFor="compName">Nombre de la Empresa</Label>
                  <Input
                    type="text"
                    id="compName"
                    value={values.compName || ""}
                    onChange={(e) => setFieldValue("compName", e.target.value)}
                    onBlur={() => setFieldTouched("compName", true)}
                    error={!!errors.compName && touched.compName}
                    hint={
                      errors.compName && touched.compName ? errors.compName : ""
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="about">Acerca de</Label>
                  <Input
                    type="text"
                    id="about"
                    value={values.about || ""}
                    onChange={(e) => setFieldValue("about", e.target.value)}
                    onBlur={() => setFieldTouched("about", true)}
                    error={!!errors.about && touched.about}
                    hint={errors.about && touched.about ? errors.about : ""}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    type="text"
                    id="address"
                    value={values.address || ""}
                    onChange={(e) => setFieldValue("address", e.target.value)}
                    onBlur={() => setFieldTouched("address", true)}
                    error={!!errors.address && touched.address}
                    hint={
                      errors.address && touched.address ? errors.address : ""
                    }
                  />
                </div>

                {/* TODO: Reactivar cuando se implemente la funcionalidad de imagen */}
                {/* <div className="col-span-2">
                  <Label htmlFor="userImage">Imagen de Perfil</Label>
                  {imagePreview && (
                    <div className="mb-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400"
                  />
                </div> */}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

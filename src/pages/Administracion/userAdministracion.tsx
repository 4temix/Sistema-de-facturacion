import { useSearchParams } from "react-router";
import { useModal } from "../../hooks/useModal";
import { useEffect, useRef, useState } from "react";
import {
  EmpleadosMetrics,
  GetEmpleadosParams,
} from "../../Types/Empleados.types";
import { VisibilityState } from "@tanstack/react-table";
import { useDebounce } from "../../hooks/useDebounce";
import { useFormik } from "formik";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import LoaderFun from "../../components/loader/LoaderFunc";
import CardsEmpleados from "../../components/Empleados/CardsEmpleados";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { LoadingTable } from "../../components/loader/LoadingTable";
import { CreateUser, User, UserSelectResponse } from "../../Types/Usuario";
import { ValidationUsers } from "../../components/UserAdministracion/yup";
import FormUsers from "../../components/UserAdministracion/FormUsers";
import { BaseSelecst } from "../../Types/ProductTypes";
import TableUsers from "../../components/UserAdministracion/TableUsers";
import FormUsersEdit from "../../components/UserAdministracion/FormUsersEdit";
import { ValidationUpdateUser } from "../../components/UserAdministracion/yupUpdateUser";

export type FormContent = CreateUser & {
  repeatpass: string;
};

export type FormContentUpdate = CreateUser & {
  id: number;
  repeatpass: string;
};

const initialFormValues: FormContent = {
  username: "",
  realName: "",
  lastName: "",
  email: "",
  teNumber: "",
  about: "",
  compName: "",
  address: "",
  pass: "",
  rolId: 0,
  repeatpass: "",
  estado: 0,
};

const initialFormValuesUpdate: FormContentUpdate = {
  id: 0,
  username: "",
  realName: "",
  lastName: "",
  email: "",
  teNumber: "",
  about: "",
  compName: "",
  address: "",
  pass: "",
  rolId: 0,
  repeatpass: "",
  estado: 0,
};

export default function UserAdministracion() {
  const {
    isOpen: isEmpleadoModalOpen,
    openModal: openEmpleadoModal,
    closeModal: closeEmpleadoModal,
  } = useModal();
  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();

  const [searchParams, setSearchParams] = useSearchParams();

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editEmpleadoId, setEditEmpleadoId] = useState<number | null>(null);

  // Métricas superiores
  const [dataMetricas, setDataMetricas] = useState<EmpleadosMetrics>({
    totalEmpleados: 0,
    empleadosActivos: 0,
    empleadosInactivos: 0,
  });

  // Empleados de la tabla
  const [empleadosData, setEmpleadosData] = useState<User[]>([] as User[]);

  // Selects para crear empleados
  const [selectsData, setSelectsData] = useState<UserSelectResponse>({
    roles: [] as BaseSelecst[],
    estados: [] as BaseSelecst[],
  });

  const initialFilters: GetEmpleadosParams = {
    search: searchParams.get("search") ?? "",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    pageSize: 10,
  };

  // Filtros de búsqueda
  const [filters, setFilters] = useState(initialFilters);

  // Estado de visibilidad de columnas (persistente en la página)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    email: false,
  });

  // Elementos para que funcione el debounce
  const debouncedSearch = useDebounce(filters.search ?? "", 600);
  const BeforeFilter = useRef<string>("");

  // Formik para crear empleados
  const formik = useFormik<FormContent>({
    initialValues: initialFormValues,
    validationSchema: ValidationUsers,
    onSubmit: async (values) => {
      const userData: CreateUser = {
        username: values.username,
        realName: values.realName,
        lastName: values.lastName,
        email: values.email,
        teNumber: values.teNumber,
        about: values.about || "",
        compName: values.compName || "",
        address: values.address,
        pass: values.pass,
        rolId: values.rolId,
        estado: values.estado,
      };

      console.log("se ejecuta");

      setIsSaving(true);
      try {
        const response = await apiRequestThen({
          url: "api/user",
          configuration: {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          },
        });

        if (response.success) {
          closeEmpleadoModal();
          formik.resetForm();
          // Forzar recarga de datos
          BeforeFilter.current = "";
          getData(filters);
          getMetrics();
        }
      } catch (error) {
        console.error("Error al guardar el empleado:", error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  //edit user
  const formikUpdate = useFormik<FormContentUpdate>({
    initialValues: initialFormValuesUpdate,
    validationSchema: ValidationUpdateUser,
    onSubmit: async (values) => {
      const userData = {
        id: values.id,
        username: values.username,
        realName: values.realName,
        lastName: values.lastName,
        email: values.email,
        teNumber: values.teNumber,
        about: values.about || "",
        compName: values.compName || "",
        address: values.address,
        pass: values.pass,
        rolId: values.rolId,
        estado: values.estado,
      };

      setIsSaving(true);
      try {
        const response = await apiRequestThen({
          url: "api/user/user_update_admin",
          configuration: {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          },
        });

        if (response.success) {
          closeEditModal();
          formik.resetForm();
          // Forzar recarga de datos
          BeforeFilter.current = "";
          getData(filters);
          getMetrics();
        }
      } catch (error) {
        console.error("Error al guardar el empleado:", error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Actualizar los filtros
  function updateFilter(
    value: string | number | null | undefined,
    key: string,
  ) {
    setFilters((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  }

  // Eliminar nulos y undefined
  function buildQueryString<T extends Record<string, unknown>>(
    filters: T,
  ): string {
    const validEntries = Object.entries(filters)
      .filter(
        ([_, value]) => value !== null && value !== undefined && value !== "",
      )
      .map(([key, value]) => [key, String(value)]);

    return new URLSearchParams(Object.fromEntries(validEntries)).toString();
  }

  // Función para obtener los empleados de la tabla
  function getData(filters: GetEmpleadosParams) {
    const queryString = buildQueryString(filters);

    if (BeforeFilter.current === queryString) {
      if (loadingComplete) {
        setLoadingComplete(false);
      }
      return;
    }
    setLoadingComplete(true);

    BeforeFilter.current = queryString;
    apiRequestThen<User[]>({
      url: `api/user/users`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        setEmpleadosData(response.result ?? ([] as User[]));
        // Calcular métricas basándose en los datos
      })
      .finally(() => {
        setLoadingComplete(false);
      });
  }

  // Función para obtener las métricas (si existe endpoint)
  function getMetrics() {
    // Por ahora calculamos de los datos
    // Si el backend tiene endpoint de métricas, usarlo aquí
  }

  // Cargar selects y datos iniciales
  useEffect(() => {
    // Petición para los selects del formulario
    apiRequestThen<UserSelectResponse>({
      url: "api/user/user_create_selects",
    }).then((response) => {
      if (!response.success) {
        console.error("Error:", response.errorMessage);
        return;
      }

      console.log(response);
      if (response.result) {
        setSelectsData({
          roles: response.result.roles,
          estados: response.result.estados,
        });
      }
    });
  }, []);

  useEffect(() => {
    getData(filters);
  }, [filters.page]);

  // Incremento de la página
  function incrementPage(page: number) {
    updateFilter(page, "page");
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  }

  // Debounce para búsquedas
  useEffect(() => {
    getData(filters);
  }, [debouncedSearch]);

  // Sincronizar filtros con searchParams
  useEffect(() => {
    const params: Record<string, string> = {};

    if (filters.search) params.search = filters.search;
    if (filters.page && filters.page > 1) params.page = filters.page.toString();

    setSearchParams(params);
  }, [filters]);

  return (
    <section>
      <article className="flex mb-3">
        <div className="text-container">
          <h2 className="text-3xl font-bold">Usuarios</h2>
        </div>
        <div className="action-container ml-auto">
          <Button size="sm" variant="primary" onClick={openEmpleadoModal}>
            Nuevo usuario
          </Button>
          <Modal
            isOpen={isEmpleadoModalOpen}
            onClose={closeEmpleadoModal}
            className="max-w-[900px] m-4 p-5"
          >
            {isSaving && <LoaderFun absolute={false} />}
            <section
              className="overflow-y-scroll max-h-[95vh] [&::-webkit-scrollbar]:w-2 
         [&::-webkit-scrollbar-track]:bg-gray-200 
         [&::-webkit-scrollbar-thumb]:bg-blue-500 
         [&::-webkit-scrollbar-thumb]:rounded-full 
         [&::-webkit-scrollbar-thumb:hover]:bg-blue-600"
            >
              <FormUsers
                formik={formik}
                selectsData={selectsData}
                onCancel={closeEmpleadoModal}
                onSubmit={() => {
                  formik.handleSubmit();
                }}
              />
            </section>
          </Modal>
        </div>
      </article>

      <article>
        <CardsEmpleados
          totalEmpleados={dataMetricas.totalEmpleados}
          empleadosActivos={dataMetricas.empleadosActivos}
          empleadosInactivos={dataMetricas.empleadosInactivos}
        />
      </article>

      <article className="grid lg:grid-cols-2 gap-4 rounded-2xl border sm:grid-cols-1 border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5 mt-4">
        <div className="col-span-1">
          <form
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              const filtersWithPageReset = { ...filters, page: 1 };
              setFilters(filtersWithPageReset);
              getData(filtersWithPageReset);
            }}
          >
            <Label htmlFor="searchEmpleados">Buscar empleados</Label>
            <Input
              type="text"
              id="searchEmpleados"
              value={filters.search ?? ""}
              placeholder="Nombre, cédula, correo..."
              onChange={(e) => {
                updateFilter(e.target.value, "search");
              }}
            />
          </form>
        </div>
        <div className="flex items-end gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const filtersWithPageReset = { ...filters, page: 1 };
              setFilters(filtersWithPageReset);
              getData(filtersWithPageReset);
            }}
          >
            Buscar
          </Button>
        </div>
      </article>

      {!loadingComplete ? (
        <TableUsers
          data={empleadosData}
          setPage={incrementPage}
          pageNumber={filters.page ?? 1}
          pageSize={filters.pageSize!}
          onEdit={(id) => {
            setEditEmpleadoId(id);
            const usuario = empleadosData.find((el) => el.id == id);

            if (usuario) {
              formikUpdate.setValues({
                id: usuario.id,
                username: usuario.username || "",
                realName: usuario.realName || "",
                lastName: usuario.lastName || "",
                email: usuario.email || "",
                teNumber: usuario.teNumber,
                about: usuario.about || "",
                compName: usuario.compName || "",
                address: usuario.address || "",
                pass: "",
                repeatpass: "",
                rolId: usuario.rol.id,
                estado: usuario.estado.id,
              });
              openEditModal();
            }
          }}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      ) : (
        <LoadingTable columns={7} />
      )}

      {/* Modal de edición de empleados */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        className="max-w-[900px] m-4 p-5"
      >
        <section
          className="overflow-y-scroll max-h-[95vh] [&::-webkit-scrollbar]:w-2 
         [&::-webkit-scrollbar-track]:bg-gray-200 
         [&::-webkit-scrollbar-thumb]:bg-blue-500 
         [&::-webkit-scrollbar-thumb]:rounded-full 
         [&::-webkit-scrollbar-thumb:hover]:bg-blue-600"
        >
          {editEmpleadoId && (
            <FormUsersEdit
              formik={formikUpdate}
              selectsData={selectsData}
              onCancel={closeEditModal}
              onSubmit={() => {
                formikUpdate.handleSubmit();
              }}
            />
          )}
        </section>
      </Modal>
    </section>
  );
}

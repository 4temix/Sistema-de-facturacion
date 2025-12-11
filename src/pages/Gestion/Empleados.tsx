import CardsEmpleados from "../../components/Empleados/CardsEmpleados";
import Button from "../../components/ui/button/Button";
import TableEmpleados from "../../components/Empleados/TableEmpleados";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import FormEmpleados from "../../components/Empleados/FormEmpleados";
import EditEmpleado from "../../components/Empleados/EditEmpleado";
import { useEffect, useRef, useState } from "react";
import { apiRequest, apiRequestThen } from "../../Utilities/FetchFuntions";
import type { VisibilityState } from "@tanstack/react-table";
import {
  EmpleadoFormValues,
  EmpleadoCreateDto,
  EmpleadosListResponse,
  EmpleadosMetrics,
  GetEmpleadosParams,
  SelectsEmpleados,
} from "../../Types/Empleados.types";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearchParams } from "react-router";
import { LoadingTable } from "../../components/loader/LoadingTable";
import { useFormik } from "formik";
import { ValidationEmpleado } from "../../components/Empleados/yup";
import LoaderFun from "../../components/loader/LoaderFunc";

// Valores iniciales del formulario
const initialFormValues: EmpleadoFormValues = {
  nombres: "",
  apellidos: "",
  cedula: "",
  fechaNacimiento: "",
  telefono: "",
  email: "",
  provincia: "",
  municipio: "",
  direccion: "",
  fechaIngreso: "",
  puestoId: null,
  tipoContrato: "",
  salarioBase: null,
  salarioPorHora: null,
  arsId: null,
  afpId: null,
  banco: "",
  cuentaBancaria: "",
};

export default function Empleados() {
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
  const [empleadosData, setEmpleadosData] = useState<EmpleadosListResponse>({
    data: [],
    totalPages: 0,
  });

  // Selects para crear empleados
  const [selectsData, setSelectsData] = useState<SelectsEmpleados>();

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
  const formik = useFormik<EmpleadoFormValues>({
    initialValues: initialFormValues,
    validationSchema: ValidationEmpleado,
    onSubmit: async (values) => {
      const empleadoData: EmpleadoCreateDto = {
        nombres: values.nombres,
        apellidos: values.apellidos,
        cedula: values.cedula,
        fechaNacimiento: values.fechaNacimiento || undefined,
        telefono: values.telefono,
        email: values.email,
        provincia: values.provincia,
        municipio: values.municipio,
        direccion: values.direccion,
        fechaIngreso: values.fechaIngreso,
        puestoId: values.puestoId!,
        tipoContrato: values.tipoContrato,
        salarioBase: values.salarioBase!,
        salarioPorHora: values.salarioPorHora || undefined,
        arsId: values.arsId || undefined,
        afpId: values.afpId || undefined,
        banco: values.banco,
        cuentaBancaria: values.cuentaBancaria,
      };

      setIsSaving(true);
      try {
        const response = await apiRequest({
          url: "api/empleados/crear_empleado",
          configuration: {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(empleadoData),
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

  // Actualizar los filtros
  function updateFilter(
    value: string | number | null | undefined,
    key: string
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
    filters: T
  ): string {
    const validEntries = Object.entries(filters)
      .filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
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
    apiRequestThen<EmpleadosListResponse>({
      url: `api/empleados/listar?${queryString}`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        setEmpleadosData(
          response.result ?? {
            data: [],
            totalPages: 0,
          }
        );
        // Calcular métricas basándose en los datos
        if (response.result) {
          const activos = response.result.data.filter((e) => e.activo).length;
          setDataMetricas({
            totalEmpleados: response.result.data.length,
            empleadosActivos: activos,
            empleadosInactivos: response.result.data.length - activos,
          });
        }
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
    apiRequestThen<{
      puestos: { id: number; nombre: string }[];
      ars: { id: number; nombre: string }[];
      afp: { id: number; nombre: string }[];
    }>({
      url: "api/empleados/selects-form",
    }).then((response) => {
      if (!response.success) {
        console.error("Error:", response.errorMessage);
        return;
      }
      if (response.result) {
        setSelectsData({
          ...response.result,
          tiposContrato: [],
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
          <h2 className="text-3xl font-bold">Empleados</h2>
        </div>
        <div className="action-container ml-auto">
          <Button size="sm" variant="primary" onClick={openEmpleadoModal}>
            Nuevo Empleado
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
              <FormEmpleados
                formik={formik}
                selectsData={selectsData}
                onCancel={closeEmpleadoModal}
                onSubmit={() => formik.handleSubmit()}
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
        <TableEmpleados
          data={empleadosData.data}
          totalPages={empleadosData.totalPages}
          setPage={incrementPage}
          pageNumber={filters.page ?? 1}
          pageSize={filters.pageSize!}
          onEdit={(id) => {
            setEditEmpleadoId(id);
            openEditModal();
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
            <EditEmpleado
              id={editEmpleadoId}
              closeModal={closeEditModal}
              onSuccess={() => {
                // Refrescar datos
                BeforeFilter.current = "";
                getData(filters);
              }}
            />
          )}
        </section>
      </Modal>
    </section>
  );
}

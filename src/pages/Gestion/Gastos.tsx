import CardsGastos from "../../components/Gastos/CardsGastos";
import Button from "../../components/ui/button/Button";
import TableGastos from "../../components/Gastos/TableGastos";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "react-select";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { customStyles } from "../../Utilities/StyleForReactSelect";
import FormGastos from "../../components/Gastos/FormGastos";
import EditGasto from "../../components/Gastos/EditGasto";
import { useEffect, useRef, useState } from "react";
import { apiRequest, apiRequestThen } from "../../Utilities/FetchFuntions";
import { Option, BaseSelecst } from "../../Types/ProductTypes";
import type { VisibilityState } from "@tanstack/react-table";
import {
  GastoMetrics,
  DataGastoResponse,
  SelectsGastosTable,
  GetGastosParams,
  GastoFormValues,
  SelectsGastos,
  SaveGasto,
} from "../../Types/Gastos";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearchParams } from "react-router";
import { LoadingTable } from "../../components/loader/LoadingTable";
import { useFormik } from "formik";
import { ValidationGasto } from "../../components/Gastos/yup";
import LoaderFun from "../../components/loader/LoaderFunc";

// Valores iniciales del formulario
const initialFormValues: GastoFormValues = {
  tipoGasto: null,
  proveedor: "",
  comprobante: "",
  fecha: "",
  montoTotal: null,
  montoPagado: null,
  saldoPendiente: null,
  estado: null,
  metodoPago: "",
  fechaPago: "",
  origenFondo: "",
  referencia: "",
  nota: "",
  cantidad: null,
};

export default function Gastos() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isGastoModalOpen,
    openModal: openGastoModal,
    closeModal: closeGastoModal,
  } = useModal();
  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();

  const [searchParams, setSearchParams] = useSearchParams();

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editGastoId, setEditGastoId] = useState<number | null>(null);

  // Métricas superiores
  const [dataMetricas, setDataMetricas] = useState<GastoMetrics>();

  // Gastos de la tabla
  const [gastosData, setGastosData] = useState<DataGastoResponse>({
    data: [],
    totalPages: 0,
  });

  // Selects para crear y filtrar gastos
  const [selectsData, setSelectsData] = useState<SelectsGastos>();
  const [selectsTable, setSelectsTable] = useState<SelectsGastosTable>();

  const [labelSelects, setLabelSelects] = useState({
    tipoGasto: "",
    estado: "",
    metodoPago: "",
    origenFondo: "",
  });

  // Estado de visibilidad de columnas (persistente en la página)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    comprobante: false,
    metodoPago: false,
    montoPagado: false,
  });

  const initialFilters: GetGastosParams = {
    pTipoGasto: searchParams.get("pTipoGasto")
      ? Number(searchParams.get("pTipoGasto"))
      : undefined,

    pEstado: searchParams.get("pEstado")
      ? Number(searchParams.get("pEstado"))
      : undefined,

    pMetodoPago: searchParams.get("pMetodoPago") ?? undefined,

    pOrigenFondo: searchParams.get("pOrigenFondo") ?? undefined,

    pSearch: searchParams.get("pSearch") ?? "",

    pFechaInit: searchParams.get("pFechaInit") ?? undefined,
    pFechaEnd: searchParams.get("pFechaEnd") ?? undefined,

    pPage: searchParams.get("pPage") ? Number(searchParams.get("pPage")) : 1,
    pPageSize: 10,
  };

  // Filtros de búsqueda
  const [filters, setFilters] = useState(initialFilters);

  // Elementos para que funcione el debounce
  const debouncedSearch = useDebounce(filters.pSearch ?? "", 600);
  const BeforeFilter = useRef<string>("");

  // Formik para crear gastos
  const formik = useFormik<GastoFormValues>({
    initialValues: initialFormValues,
    validationSchema: ValidationGasto,
    onSubmit: async (values) => {
      const gastoData: SaveGasto = {
        tipoGasto: values.tipoGasto!,
        proveedor: values.proveedor || undefined,
        comprobante: values.comprobante || undefined,
        fecha: values.fecha || undefined,
        montoTotal: values.montoTotal!,
        montoPagado: values.montoPagado ?? 0,
        saldoPendiente: values.saldoPendiente ?? undefined,
        estado: values.estado!,
        metodoPago: values.metodoPago || undefined,
        fechaPago: values.fechaPago || undefined,
        origenFondo: values.origenFondo || undefined,
        referencia: values.referencia || undefined,
        nota: values.nota || undefined,
      };

      setIsSaving(true);
      try {
        const response = await apiRequest({
          url: "api/gastos",
          configuration: {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gastoData),
          },
        });

        if (response.success) {
          closeGastoModal();
          formik.resetForm();
          // Forzar recarga de datos
          BeforeFilter.current = "";
          getData(filters);
          getMetrics();
        }
      } catch (error) {
        console.error("Error al guardar el gasto:", error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Referencias para evitar ciclos infinitos
  const isUpdatingFromEstado = useRef(false);
  const isUpdatingFromMonto = useRef(false);

  // 🔄 Calcular saldoPendiente cuando cambia montoTotal o montoPagado
  useEffect(() => {
    const montoTotal = formik.values.montoTotal;
    const montoPagado = formik.values.montoPagado;

    // Si montoTotal es nulo o 0, resetear saldoPendiente
    if (montoTotal === null || montoTotal === 0) {
      formik.setFieldValue("saldoPendiente", null);
      return;
    }

    // Si montoPagado es nulo, el saldo pendiente es el monto total
    if (montoPagado === null) {
      formik.setFieldValue("saldoPendiente", montoTotal);
      return;
    }

    // Calcular saldo pendiente
    const saldoPendiente = montoTotal - montoPagado;

    if (saldoPendiente <= 0) {
      formik.setFieldValue("saldoPendiente", 0);
    } else {
      formik.setFieldValue("saldoPendiente", saldoPendiente);
    }
  }, [formik.values.montoTotal, formik.values.montoPagado]);

  // 🔄 Seleccionar estado automáticamente según el pago (solo si no viene de cambio de estado)
  useEffect(() => {
    // Si el cambio viene de la selección de estado, no actualizar
    if (isUpdatingFromEstado.current) {
      isUpdatingFromEstado.current = false;
      return;
    }

    const montoTotal = formik.values.montoTotal;
    const montoPagado = formik.values.montoPagado;

    if (montoTotal === null || montoTotal === 0) return;

    // Buscar los IDs de los estados
    const estadoPagado = selectsData?.estados?.find(
      (e) => e.name.toLowerCase() === "pagado"
    );
    const estadoPendiente = selectsData?.estados?.find(
      (e) => e.name.toLowerCase() === "pendiente"
    );
    const estadoParcial = selectsData?.estados?.find((e) =>
      e.name.toLowerCase().includes("parcial")
    );

    isUpdatingFromMonto.current = true;

    if (montoPagado === null || montoPagado === 0) {
      if (estadoPendiente) {
        formik.setFieldValue("estado", estadoPendiente.id);
      }
    } else if (montoPagado >= montoTotal) {
      if (estadoPagado) {
        formik.setFieldValue("estado", estadoPagado.id);
      }
    } else {
      if (estadoParcial) {
        formik.setFieldValue("estado", estadoParcial.id);
      }
    }
  }, [
    formik.values.montoTotal,
    formik.values.montoPagado,
    selectsData?.estados,
  ]);

  // 🔄 Actualizar montoPagado cuando se selecciona un estado manualmente
  useEffect(() => {
    // Si el cambio viene del cálculo de montos, no actualizar
    if (isUpdatingFromMonto.current) {
      isUpdatingFromMonto.current = false;
      return;
    }

    const estado = formik.values.estado;
    const montoTotal = formik.values.montoTotal;

    // Si no hay estado o montoTotal, salir
    if (estado === null || montoTotal === null || montoTotal === 0) return;

    // Buscar los IDs de los estados
    const estadoPagado = selectsData?.estados?.find(
      (e) => e.name.toLowerCase() === "pagado"
    );
    const estadoPendiente = selectsData?.estados?.find(
      (e) => e.name.toLowerCase() === "pendiente"
    );

    isUpdatingFromEstado.current = true;

    // Si seleccionó "Pagado" → poner montoPagado = montoTotal
    if (estadoPagado && estado === estadoPagado.id) {
      formik.setFieldValue("montoPagado", montoTotal);
    }
    // Si seleccionó "Pendiente" → poner montoPagado = 0
    else if (estadoPendiente && estado === estadoPendiente.id) {
      formik.setFieldValue("montoPagado", 0);
    }
  }, [formik.values.estado, formik.values.montoTotal, selectsData?.estados]);

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

  // Actualizar los labels de los filtros
  function updateLabels(value: string | null, key: string) {
    setLabelSelects((prev) => {
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

  // Función para obtener los gastos de la tabla
  function getData(filters: GetGastosParams) {
    const queryString = buildQueryString(filters);

    if (BeforeFilter.current === queryString) {
      if (loadingComplete) {
        setLoadingComplete(false);
      }
      return;
    }
    setLoadingComplete(true);

    BeforeFilter.current = queryString;
    apiRequestThen<DataGastoResponse>({
      url: `api/gastos?${queryString}`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        setGastosData(
          response.result ?? {
            data: [],
            totalPages: 0,
          }
        );
      })
      .finally(() => {
        setLoadingComplete(false);
      });
  }

  // Función para obtener las métricas
  function getMetrics() {
    apiRequest<GastoMetrics>({
      url: "api/gastos/metrics",
    }).then((request) => {
      if (request.success) {
        setDataMetricas(request.result);
      }
    });
  }

  useEffect(() => {
    getMetrics();

    // Petición para los selects de la tabla
    apiRequestThen<SelectsGastosTable>({
      url: "api/gastos/selects",
    }).then((response) => {
      if (!response.success) {
        console.error("Error:", response.errorMessage);
        return;
      }
      setSelectsTable(response.result);
      // También usamos estos selects para el formulario
      if (response.result) {
        setSelectsData({
          tiposGasto: response.result.tiposGastos ?? [],
          estados: response.result.estadosGastos ?? [],
        });

        // Recuperar labels si hay filtros en la URL
        const newLabels = { ...labelSelects };
        if (filters.pTipoGasto) {
          const tipo = response.result.tiposGastos?.find(
            (t) => t.id === filters.pTipoGasto
          );
          if (tipo) newLabels.tipoGasto = tipo.name;
        }
        if (filters.pEstado) {
          const estado = response.result.estadosGastos?.find(
            (e) => e.id === filters.pEstado
          );
          if (estado) newLabels.estado = estado.name;
        }
        if (filters.pMetodoPago) {
          newLabels.metodoPago = filters.pMetodoPago;
        }
        if (filters.pOrigenFondo) {
          newLabels.origenFondo = filters.pOrigenFondo;
        }
        setLabelSelects(newLabels);
      }
    });
  }, []);

  useEffect(() => {
    getData(filters);
  }, [filters.pPage]);

  // Incremento de la página
  function incrementPage(page: number) {
    updateFilter(page, "pPage");
    searchParams.set("pPage", page.toString());
    setSearchParams(searchParams);
  }

  // Debounce para búsquedas
  useEffect(() => {
    getData(filters);
  }, [debouncedSearch]);

  // Sincronizar filtros con searchParams
  useEffect(() => {
    const params: Record<string, string> = {};

    if (filters.pTipoGasto) params.pTipoGasto = filters.pTipoGasto.toString();
    if (filters.pEstado) params.pEstado = filters.pEstado.toString();
    if (filters.pMetodoPago) params.pMetodoPago = filters.pMetodoPago;
    if (filters.pOrigenFondo) params.pOrigenFondo = filters.pOrigenFondo;
    if (filters.pSearch) params.pSearch = filters.pSearch;
    if (filters.pFechaInit) params.pFechaInit = filters.pFechaInit;
    if (filters.pFechaEnd) params.pFechaEnd = filters.pFechaEnd;
    if (filters.pPage && filters.pPage > 1)
      params.pPage = filters.pPage.toString();

    setSearchParams(params);
  }, [filters]);

  return (
    <section>
      <article className="flex mb-3">
        <div className="text-container">
          <h2 className="text-3xl font-bold">Gastos</h2>
        </div>
        <div className="action-container ml-auto">
          <Button size="sm" variant="primary" onClick={openGastoModal}>
            Registrar Gasto
          </Button>
          <Modal
            isOpen={isGastoModalOpen}
            onClose={closeGastoModal}
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
              <FormGastos
                formik={formik}
                selectsData={selectsData}
                onCancel={closeGastoModal}
                onSubmit={() => formik.handleSubmit()}
              />
            </section>
          </Modal>
        </div>
      </article>

      <article>
        <CardsGastos
          totalGastosMes={dataMetricas?.totalGastosMes ?? 0}
          gastosPendientes={dataMetricas?.gastosPendientes ?? 0}
          gastosPagados={dataMetricas?.gastosPagados ?? 0}
          cantidadGastosMes={dataMetricas?.cantidadGastosMes ?? 0}
          gastosInventarioMes={dataMetricas?.gastosInventarioMes ?? 0}
        />
      </article>

      <article className="grid lg:grid-cols-2 gap-4 rounded-2xl border sm:grid-cols-1 border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 py-5 mt-4">
        <div className="col-span-1">
          <form
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              getData(filters);
            }}
          >
            <Label htmlFor="searchGastos">Buscar gastos</Label>
            <Input
              type="text"
              id="searchGastos"
              value={filters.pSearch ?? ""}
              placeholder="Proveedor, comprobante..."
              onChange={(e) => {
                updateFilter(e.target.value, "pSearch");
              }}
            />
          </form>
        </div>
        <div className="flex items-end gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              getData(filters);
            }}
          >
            Buscar
          </Button>
          <Button size="sm" variant="primary" onClick={openModal}>
            Filtros
          </Button>
        </div>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] m-4 p-5"
        >
          <div className="relative w-full overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Filtros
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Filtra los gastos para encontrarlos más rápido
              </p>
            </div>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div className="grid sm:grid-cols-1 gap-3 lg:grid-cols-2">
                  <div>
                    <Label htmlFor="tipoGasto">Tipo de Gasto</Label>
                    <Select<Option, false>
                      name="tipoGasto"
                      id="tipoGasto"
                      styles={customStyles()}
                      placeholder={"Tipo de gasto..."}
                      menuPortalTarget={document.body}
                      value={
                        filters.pTipoGasto
                          ? {
                              label: labelSelects?.tipoGasto,
                              value: filters.pTipoGasto.toString(),
                            }
                          : null
                      }
                      options={selectsTable?.tiposGastos?.map(
                        (item: BaseSelecst) => ({
                          label: item.name,
                          value: item.id.toString(),
                        })
                      )}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={(e) => {
                        if (!e) return;
                        updateFilter(parseInt(e.value), "pTipoGasto");
                        updateLabels(e.label, "tipoGasto");
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Select<Option, false>
                      name="estado"
                      id="estado"
                      styles={customStyles()}
                      placeholder={"Estado..."}
                      menuPortalTarget={document.body}
                      value={
                        filters.pEstado
                          ? {
                              label: labelSelects?.estado,
                              value: filters.pEstado.toString(),
                            }
                          : null
                      }
                      options={selectsTable?.estadosGastos?.map(
                        (item: BaseSelecst) => ({
                          label: item.name,
                          value: item.id.toString(),
                        })
                      )}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={(e) => {
                        if (!e) return;
                        updateFilter(parseInt(e.value), "pEstado");
                        updateLabels(e.label, "estado");
                      }}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-1 gap-3 lg:grid-cols-2">
                  <div>
                    <Label htmlFor="metodoPago">Método de Pago</Label>
                    <Select<Option, false>
                      name="metodoPago"
                      id="metodoPago"
                      styles={customStyles()}
                      placeholder={"Método de pago..."}
                      menuPortalTarget={document.body}
                      value={
                        filters.pMetodoPago
                          ? {
                              label: labelSelects?.metodoPago,
                              value: filters.pMetodoPago,
                            }
                          : null
                      }
                      options={[
                        { label: "Efectivo", value: "Efectivo" },
                        { label: "Transferencia", value: "Transferencia" },
                        { label: "Tarjeta", value: "Tarjeta" },
                      ]}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={(e) => {
                        if (!e) return;
                        updateFilter(e.value, "pMetodoPago");
                        updateLabels(e.label, "metodoPago");
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="origenFondo">Origen del Fondo</Label>
                    <Select<Option, false>
                      name="origenFondo"
                      id="origenFondo"
                      styles={customStyles()}
                      placeholder={"Origen del fondo..."}
                      menuPortalTarget={document.body}
                      value={
                        filters.pOrigenFondo
                          ? {
                              label: labelSelects?.origenFondo,
                              value: filters.pOrigenFondo,
                            }
                          : null
                      }
                      options={[
                        { label: "Efectivo", value: "Efectivo" },
                        { label: "Cuenta de banco", value: "Cuenta de banco" },
                      ]}
                      className="select-custom pl-0"
                      classNamePrefix="select"
                      onChange={(e) => {
                        if (!e) return;
                        updateFilter(e.value, "pOrigenFondo");
                        updateLabels(e.label, "origenFondo");
                      }}
                    />
                  </div>
                </div>

                <div className="grid-cols-2 grid gap-3">
                  <div className="col-span-1">
                    <Label htmlFor="fechaInit">Fecha inicio</Label>
                    <Input
                      type="date"
                      id="fechaInit"
                      value={filters.pFechaInit ?? ""}
                      onChange={(e) => {
                        updateFilter(e.target.value || undefined, "pFechaInit");
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="fechaEnd">Fecha fin</Label>
                    <Input
                      type="date"
                      id="fechaEnd"
                      value={filters.pFechaEnd ?? ""}
                      onChange={(e) => {
                        updateFilter(e.target.value || undefined, "pFechaEnd");
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cerrar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // Resetear página a 1 al buscar con filtros
                  const filtersWithPageReset = { ...filters, pPage: 1 };
                  setFilters(filtersWithPageReset);
                  getData(filtersWithPageReset);
                  closeModal();
                }}
              >
                Buscar
              </Button>
              <Button
                type="button"
                className="bg-red-500 hover:bg-red-700"
                onClick={() => {
                  setFilters({
                    pTipoGasto: undefined,
                    pEstado: undefined,
                    pMetodoPago: undefined,
                    pOrigenFondo: undefined,
                    pSearch: "",
                    pFechaInit: undefined,
                    pFechaEnd: undefined,
                    pPage: 1,
                    pPageSize: 10,
                  });
                  setLabelSelects({
                    tipoGasto: "",
                    estado: "",
                    metodoPago: "",
                    origenFondo: "",
                  });
                  setSearchParams({});
                }}
              >
                Reiniciar filtros
              </Button>
            </div>
          </form>
        </Modal>
      </article>

      {!loadingComplete ? (
        <TableGastos
          data={gastosData.data}
          totalPages={gastosData.totalPages}
          setPage={incrementPage}
          pageNumber={filters.pPage ?? 1}
          pageSize={filters.pPageSize!}
          updateSize={updateFilter}
          onEdit={(id) => {
            setEditGastoId(id);
            openEditModal();
          }}
          onDelete={(id) => {
            console.log("Eliminar gasto:", id);
          }}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      ) : (
        <LoadingTable columns={10} />
      )}

      {/* Modal de edición de gastos */}
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
          {editGastoId && (
            <EditGasto
              id={editGastoId}
              closeModal={closeEditModal}
              onSuccess={() => {
                // Refrescar datos y métricas
                BeforeFilter.current = "";
                getData(filters);
                getMetrics();
              }}
            />
          )}
        </section>
      </Modal>
    </section>
  );
}

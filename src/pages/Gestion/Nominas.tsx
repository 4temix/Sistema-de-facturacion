import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useParams, useNavigate } from "react-router";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Button from "../../components/ui/button/Button";
import NominaCard from "../../components/Nominas/NominaCard";
import NominaDetalle from "../../components/Nominas/NominaDetalle";
import FormNomina from "../../components/Nominas/FormNomina";
import { ValidationNomina } from "../../components/Nominas/yup";
import { apiRequest, apiRequestThen } from "../../Utilities/FetchFuntions";
import {
  NominaListItem,
  NominaListResponse,
  NominaCompletaDto,
  NominaFormValues,
  NominaCreateDto,
} from "../../Types/Nomina.types";
import { LoadingTable } from "../../components/loader/LoadingTable";
import LoaderFun from "../../components/loader/LoaderFunc";
import { Pagination } from "../../components/Inventario/pagination";
import { TbReceipt, TbPlus } from "react-icons/tb";

// Valores iniciales del formulario
const initialFormValues: NominaFormValues = {
  periodoInicio: "",
  periodoFin: "",
  tipo: "",
};

export default function Nominas() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Lista de nóminas
  const [nominasData, setNominasData] = useState<NominaListResponse>({
    data: [],
    totalPages: 0,
  });

  // Nómina seleccionada para ver detalle
  const [selectedNomina, setSelectedNomina] = useState<NominaCompletaDto | null>(
    null
  );
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const BeforeFilter = useRef<string>("");

  // Formik para crear nóminas
  const formik = useFormik<NominaFormValues>({
    initialValues: initialFormValues,
    validationSchema: ValidationNomina,
    onSubmit: async (values) => {
      const nominaData: NominaCreateDto = {
        periodoInicio: values.periodoInicio,
        periodoFin: values.periodoFin,
        tipo: values.tipo,
      };

      setIsSaving(true);
      try {
        const response = await apiRequest({
          url: "api/nomina/crear",
          configuration: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nominaData),
          },
        });

        if (response.success) {
          closeModal();
          formik.resetForm();
          BeforeFilter.current = "";
          getData();
        }
      } catch (error) {
        console.error("Error al crear la nómina:", error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  // Obtener lista de nóminas
  function getData() {
    const queryString = `page=${page}&pageSize=${pageSize}`;

    if (BeforeFilter.current === queryString) {
      return;
    }
    setLoadingComplete(true);
    BeforeFilter.current = queryString;

    apiRequestThen<NominaListResponse>({
      url: `api/nomina/listar?${queryString}`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        setNominasData(
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

  // Obtener detalle de una nómina
  function getNominaDetalle(nominaId: number) {
    setLoadingDetalle(true);
    apiRequestThen<NominaCompletaDto>({
      url: `api/nomina/${nominaId}`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        if (response.result) {
          setSelectedNomina(response.result);
        }
      })
      .finally(() => {
        setLoadingDetalle(false);
      });
  }

  // Cargar datos al montar y cuando cambia la página
  useEffect(() => {
    getData();
  }, [page]);

  // Si hay un ID en la URL, cargar los detalles de esa nómina
  useEffect(() => {
    if (id) {
      getNominaDetalle(parseInt(id));
    } else {
      setSelectedNomina(null);
    }
  }, [id]);

  // Manejar click en una card - navegar a la URL con el ID
  const handleCardClick = (nominaId: number) => {
    navigate(`/nominas/${nominaId}`);
  };

  // Volver a la lista - navegar a /nominas
  const handleBack = () => {
    navigate("/nominas");
  };

  // Después de aprobar, recargar
  const handleAprobar = () => {
    BeforeFilter.current = "";
    getData();
    if (id) {
      getNominaDetalle(parseInt(id));
    }
  };

  // Determinar vista basado en la URL
  const isDetailView = !!id;

  return (
    <section>
      {loadingDetalle && <LoaderFun absolute={false} />}

      {!isDetailView ? (
        <>
          {/* Header */}
          <article className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TbReceipt className="text-blue-600" />
                Nóminas
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Gestión de nóminas de empleados
              </p>
            </div>
            <Button onClick={openModal} className="flex items-center gap-2">
              <TbPlus className="w-5 h-5" />
              Nueva Nómina
            </Button>

            {/* Modal de crear nómina */}
            <Modal
              isOpen={isOpen}
              onClose={closeModal}
              className="max-w-[500px] m-4"
            >
              {isSaving && <LoaderFun absolute={false} />}
              <FormNomina
                formik={formik}
                onCancel={closeModal}
                onSubmit={() => formik.handleSubmit()}
              />
            </Modal>
          </article>

          {/* Grid de Cards */}
          {loadingComplete ? (
            <LoadingTable columns={4} />
          ) : nominasData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <TbReceipt className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No hay nóminas registradas
              </h3>
              <p className="text-gray-400 mb-4">
                Crea tu primera nómina para empezar
              </p>
              <Button onClick={openModal} className="flex items-center gap-2">
                <TbPlus className="w-5 h-5" />
                Crear Nómina
              </Button>
            </div>
          ) : (
            <>
              <article className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {nominasData.data.map((nomina: NominaListItem) => (
                  <NominaCard
                    key={nomina.id}
                    nomina={nomina}
                    onClick={handleCardClick}
                  />
                ))}
              </article>

              {/* Paginación */}
              {nominasData.totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    totalPages={nominasData.totalPages}
                    currentPage={page}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Vista de detalle */
        selectedNomina && (
          <NominaDetalle
            nomina={selectedNomina}
            onBack={handleBack}
            onAprobar={handleAprobar}
            onUpdate={() => {
              if (id) {
                getNominaDetalle(parseInt(id));
              }
            }}
          />
        )
      )}
    </section>
  );
}


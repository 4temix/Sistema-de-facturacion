import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { TrashBinIcon, PencilIcon } from "../../icons";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { DatosSelect } from "../../Types/ConfigurationTypes";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Swal from "sweetalert2";
import LoaderFun from "../../components/loader/LoaderFunc";

type Item = {
  name: string;
  action: (id: number) => void;
  id: number;
};

export default function Mantenimientos() {
  const [DataRequest, setDataRequest] = useState<DatosSelect>();
  const {
    isOpen: isProductModalOpen,
    openModal: openProductModal,
    closeModal: closeProductModal,
  } = useModal();

  const [form, setFormData] = useState({
    value: "",
    nameCategoria: "",
  });

  const [loader, setLoader] = useState(false);

  function updateForm(value: string, key: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  //funcion para obtener los elementos de la tabla
  function getData() {
    setLoader(true);
    apiRequestThen<DatosSelect>({
      url: `api/mantenimiento/selects`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        setDataRequest(response.result!);
        closeProductModal();
        setFormData({ value: "", nameCategoria: "" });
      })
      .finally(() => {
        setLoader(false);
      });
  }

  //funcion para obtener los elementos de la tabla
  function setData(direccion: string, data: string) {
    setLoader(true);
    apiRequestThen<DatosSelect>({
      url: `api/mantenimiento/${direccion}-producto`,
      configuration: {
        body: JSON.stringify({ name: data }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        getData();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  function closeModalElement() {
    setFormData({ value: "", nameCategoria: "" });
    closeProductModal();
  }

  function DeleteData(direccion: string, id: number) {
    setLoader(true);
    apiRequestThen<DatosSelect>({
      url: `api/mantenimiento/${direccion}-producto/${id}`,
      configuration: {
        method: "DELEtE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        getData();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      {loader && <LoaderFun />}
      <Modal
        isOpen={isProductModalOpen}
        onClose={closeModalElement}
        CloseClickBanner={false}
        className="max-w-[400px] m-4 p-2"
      >
        <section className="p-10">
          <div>
            <Label htmlFor="nombre">{form.nameCategoria}</Label>
            <Input
              type="text"
              id="nombreCliente"
              placeholder="Nombre del..."
              value={form.value ?? ""}
              onChange={(e) => {
                updateForm(e.target.value, "value");
              }}
            />
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModalElement}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setData(form.nameCategoria, form.value);
              }}
            >
              Guardar
            </Button>
          </div>
        </section>
      </Modal>
      <PageBreadcrumb pageTitle="Mantenimientos" />
      <section className="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-4">
        <ComponentCard
          title="Categoria"
          button_text="Agregar"
          action={() => {
            openProductModal();
            updateForm("categoria", "nameCategoria");
          }}
        >
          {DataRequest?.categorias.map((el) => (
            <Items
              name={el.name}
              id={el.id}
              action={() => {
                DeleteData("categoria", el.id);
              }}
            />
          ))}
        </ComponentCard>
        <ComponentCard
          title="Tipo"
          button_text="Agregar"
          action={() => {
            openProductModal();
            updateForm("tipo", "nameCategoria");
          }}
        >
          {DataRequest?.tipos.map((el) => (
            <Items
              name={el.name}
              id={el.id}
              action={() => {
                DeleteData("tipo", el.id);
              }}
            />
          ))}
        </ComponentCard>
        <ComponentCard
          title="Marca"
          button_text="Agregar"
          action={() => {
            openProductModal();
            updateForm("marca", "nameCategoria");
          }}
        >
          {DataRequest?.marcas.map((el) => (
            <Items
              name={el.name}
              id={el.id}
              action={() => {
                DeleteData("marca", el.id);
              }}
            />
          ))}
        </ComponentCard>
        <ComponentCard
          title="Estado"
          button_text="Agregar"
          action={() => {
            openProductModal();
            updateForm("estado", "nameCategoria");
          }}
        >
          {DataRequest?.estados.map((el) => (
            <Items
              name={el.name}
              id={el.id}
              action={() => {
                DeleteData("estado", el.id);
              }}
            />
          ))}
        </ComponentCard>
      </section>
    </>
  );
}

function Items({ name, action, id }: Item) {
  return (
    <div className="p-2 border border-gray-200 rounded-2xl dark:border-gray-800 flex mb-1">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {name}
      </div>
      <div className="ml-auto flex gap-2">
        <button className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-theme-xs hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto  hover:bg-amber-300 ">
          <PencilIcon />
        </button>
        <button
          onClick={() => {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: "bg-blue-500 p-2 ml-2 rounded-2x1 border",
                cancelButton: "bg-error-500 p-2 mr-2 rounded-2x1 border",
              },
              buttonsStyling: false,
            });
            swalWithBootstrapButtons
              .fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
                reverseButtons: true,
              })
              .then((result) => {
                if (result.isConfirmed) {
                  action(id);
                }
              });
          }}
          className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-theme-xs hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto  hover:bg-error-600 "
        >
          <TrashBinIcon />
        </button>
      </div>
    </div>
  );
}

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { TrashBinIcon, PencilIcon } from "../../icons";

type Item = {
  text: string;
  id: number;
};

export default function Mantenimientos() {
  return (
    <>
      <PageBreadcrumb pageTitle="Mantenimientos" />
      <section className="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-4">
        <ComponentCard title="Categoria" button_text="Agregar">
          <div>
            <Items />
          </div>
        </ComponentCard>
        <ComponentCard title="Tipo" button_text="Agregar">
          <div>nada que ver</div>
        </ComponentCard>
        <ComponentCard title="Marca" button_text="Agregar">
          <div>nada que ver</div>
        </ComponentCard>
        <ComponentCard title="Estado" button_text="Agregar">
          <div>nada que ver</div>
        </ComponentCard>
      </section>
    </>
  );
}

function Items() {
  return (
    <div className="p-2 border border-gray-200 rounded-2xl dark:border-gray-800 flex">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        algo
      </div>
      <div className="ml-auto flex gap-2">
        <button className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-theme-xs hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto  hover:bg-amber-300 ">
          <PencilIcon />
        </button>
        <button className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-theme-xs hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto  hover:bg-error-600 ">
          <TrashBinIcon />
        </button>
      </div>
    </div>
  );
}

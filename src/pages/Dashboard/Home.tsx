import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { DashboardData } from "../../Types/DashboardTypes";
import TableFacturas from "../../components/Facturacion/TableFacturas";
import { ModalEditProvider } from "../../context/ModalEditContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

function Pts() {
  const [dataRequest, setDataRequest] = useState<DashboardData>({
    ventasYear: [],
    ventasSemana: 0,
    gananciasSemana: 0,
    ventasRecientes: { data: [], total_pages: 0 },
    variacionSemanal: 0,
  });

  const [configUt, SetConfigUt] = useState({ loader: false });

  function saveConfig(label: string, value: boolean) {
    SetConfigUt((prev) => {
      return { ...prev, [label]: value };
    });
  }

  //funcion para obtener los elementos de la tabla
  function getData() {
    saveConfig("loader", true);
    apiRequestThen<DashboardData>({
      url: `api/dashboard/metricas`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        setDataRequest(response.result!);
      })
      .finally(() => {
        saveConfig("loader", false);
      });
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            ganancias={dataRequest.gananciasSemana}
            ventas={dataRequest.ventasSemana}
          />

          <MonthlySalesChart ventasYear={dataRequest.ventasYear} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget variacionSemanal={dataRequest.variacionSemanal} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] col-span-12 md:min-w-[940px]">
          <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
            <PageBreadcrumb pageTitle="Ventas recientes" />
            <TableFacturas
              loader={configUt.loader}
              data={dataRequest.ventasRecientes.data}
              total_pages={dataRequest.ventasRecientes.total_pages}
              setPage={() => {}}
              pageNUmber={1}
              pageSize={6}
              updateSize={() => {}}
              showPag={false}
              btnEdit={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <ModalEditProvider>
      <Pts />
    </ModalEditProvider>
  );
}

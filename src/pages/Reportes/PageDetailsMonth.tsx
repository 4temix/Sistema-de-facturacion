import { useEffect, useState } from "react";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { useNavigate, useParams } from "react-router";
import { ReporteMensual } from "../../Types/Reportes";
import ReportesLoading from "../../components/Reportes/ReportesLoading";
import DetailsMonth from "../../components/Reportes/DetailsMonth";
import { ModalEditProvider } from "../../context/ModalEditContext";

function PageDetailsMonthP() {
  //metricas superiores
  const [data, setData] = useState<ReporteMensual>();
  const [loading, setLoading] = useState(false);

  const { year, month } = useParams<string>();
  const navigate = useNavigate();

  //funcion para obtener los elementos de la tabla
  function getData() {
    setLoading(true);
    apiRequestThen<ReporteMensual>({
      url: `api/reportes/details/${year}/${month}`,
    })
      .then((response) => {
        if (!response.success) {
          navigate("/nada");
          return;
        }
        setData(response.result!);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <section>
      {loading && <ReportesLoading />}

      {!loading && data && <DetailsMonth params={data} />}
    </section>
  );
}
export default function DetailsYearPage() {
  return (
    <ModalEditProvider>
      <PageDetailsMonthP />
    </ModalEditProvider>
  );
}

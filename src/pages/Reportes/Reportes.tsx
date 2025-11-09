import { useEffect, useState } from "react";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { useNavigate } from "react-router";
import ReportesPage from "../../components/Reportes/ReportesPage";
import { VentasAnuales } from "../../Types/Reportes";
import ReportesLoading from "../../components/Reportes/ReportesLoading";

export default function Reportes() {
  //metricas superiores
  const [data, setData] = useState<VentasAnuales[]>();
  const [loading, setLoading] = useState(false);

  //   const { id } = useParams<string>();
  const navigate = useNavigate();

  //funcion para obtener los elementos de la tabla
  function getData() {
    setLoading(true);
    apiRequestThen<VentasAnuales[]>({
      url: `api/reportes`,
    })
      .then((response) => {
        if (!response.success) {
          navigate("/nada");
          return;
        }
        console.log(response);
        setData(response.result ?? []);
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
      {loading ? <ReportesLoading /> : <ReportesPage data={data!} />}
    </section>
  );
}

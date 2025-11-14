import { useEffect, useState } from "react";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { useNavigate, useParams } from "react-router";
import { DetailsYearType } from "../../Types/Reportes";
import ReportesLoading from "../../components/Reportes/ReportesLoading";
import DetailsYear from "../../components/Reportes/DetailsYear";

export default function DetailsYearPage() {
  //metricas superiores
  const [data, setData] = useState<DetailsYearType>({
    anio: 0,
    totalAnual: 0,
    ventasMensuales: [],
    crecimientoPromedio: 0,
    comparacionAnioAnterior: 0,
  });
  const [loading, setLoading] = useState(false);

  const { year } = useParams<string>();
  const navigate = useNavigate();

  //funcion para obtener los elementos de la tabla
  function getData() {
    setLoading(true);
    apiRequestThen<DetailsYearType>({
      url: `api/reportes/details/${year}`,
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
      {loading ? <ReportesLoading /> : <DetailsYear data={data} />}
    </section>
  );
}

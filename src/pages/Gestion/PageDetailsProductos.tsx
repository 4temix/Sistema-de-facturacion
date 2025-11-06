import { useEffect, useState } from "react";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { ProductoDetalles } from "../../Types/ProductTypes";
import { useNavigate, useParams } from "react-router";
import ProductoDetallesScreen from "../../components/Inventario/ProductsDetails";

export default function PageDetailsProductos() {
  //metricas superiores
  const [data, setData] = useState<ProductoDetalles>();
  const { id } = useParams<string>();
  const navigate = useNavigate();

  //funcion para obtener los elementos de la tabla
  function getData(id: number) {
    apiRequestThen<ProductoDetalles>({
      url: `api/productos/detalles/${id}`,
    }).then((response) => {
      if (!response.success) {
        navigate("/nada");
        return;
      }
      console.log(response.result);
      setData(response.result);
    });
  }

  useEffect(() => {
    if (!parseInt(id!)) {
      return;
    }
    getData(parseInt(id!));
  }, []);

  if (data == undefined) {
    return <section></section>;
  }

  return (
    <section>
      <ProductoDetallesScreen producto={data!} />
    </section>
  );
}

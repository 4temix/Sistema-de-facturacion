import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  Cell,
} from "@tanstack/react-table";
import { PencilIcon, DownloadIcon } from "../../icons";
import { Pagination } from "./pagination";
import Input from "../form/input/InputField";
import {
  DataRequest,
  Factura,
  FacturaDetalle,
  Totales,
} from "../../Types/FacturacionTypes";
import { LoadingTable } from "../loader/LoadingTable";
import { useFacturaColor } from "../../hooks/useFacturaColor";
import Drawer from "../ui/modal/Drawer";
import FacturacionDetails from "./FacturacionDetails";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
import { useModalEdit } from "../../context/ModalEditContext";
import { handlePrintFactura } from "../../hooks/useImpresion";
import LoaderFun from "../loader/LoaderFunc";

type internalProps = DataRequest & {
  setPage: (page: number) => void;
  pageNUmber: number;
  pageSize?: number;
  updateSize: (value: number, key: string) => void;
  loader: boolean;
};

export default function TableFacturas({
  data,
  total_pages,
  setPage,
  pageNUmber,
  pageSize,
  updateSize,
  loader,
}: internalProps) {
  const getFacturaColor = useFacturaColor();
  const [isLoading, setIsLoading] = useState(false);

  //cargando
  const [loadintComplete, setLoadintComplete] = useState(false);

  const { modalEditOpen, AsingFactura } = useModalEdit();
  // Columnas
  const [DetailsFactura, setDetailsFactura] = useState<FacturaDetalle>({
    id: 0,
    numeroFactura: "",

    // Fechas
    fechaEmision: "", // Se recibe como ISO string desde C#
    fechaPago: "",

    // Cliente
    clienteId: 0,
    nombreCliente: "",
    documentoCliente: "",
    telefonoCliente: "",

    // Totales
    subtotal: 0,
    impuestoTotal: 0,
    descuentoTotal: 0,
    total: 0,
    ganancia: 0,
    margen: 0,

    // Estado y pago
    montoPagado: 0,
    estado: "",
    metodoPago: "",

    // Relaciones y metadatos
    vendedor: 1,
    sucursal: "",
    moneda: "",
    tipoCambio: 0,

    // Actualización
    actualizadoEn: "",
    actualizacionPago: "",

    // Productos
    productos: [],

    totales: {} as Totales,

    devoluciones: [],

    gananciaActual: 0,
  });

  //funcion para obtener los elementos de la tabla
  function getData(id: number) {
    setIsLoading(true);

    apiRequestThen<FacturaDetalle>({
      url: `api/facturas/details/${id}`,
    })
      .then((response) => {
        if (!response.success) {
          console.error("Error:", response.errorMessage);
          return;
        }
        setDetailsFactura(response.result!);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const [IsDetailsOpen, setIsDetailsOpen] = useState(false);
  const columns = useMemo(() => {
    return [
      {
        accessorKey: "nombre",
        header: "Factura",
        cell: ({ row }: { row: Row<Factura> }) => (
          <span>
            <strong>#</strong>
            {row.original.numeroFactura}
          </span>
        ),
      },
      {
        accessorKey: "cliente",
        header: "Cliente",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue() ?? "N/A"}</span>
        ),
      },
      {
        accessorKey: "fechaEmision",
        header: "Fecha emision",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>
            {new Date(getValue()).toLocaleDateString("es-DO") ?? "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "fechaPago",
        header: "Fecha pago",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>
            {getValue() != null
              ? new Date(getValue()).toLocaleDateString("es-DO")
              : "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "monto",
        header: "Monto",
        cell: ({ getValue }: { getValue: () => number }) =>
          new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2,
          }).format(getValue()),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }: { getValue: () => string }) => (
          <div
            className={`px-3 py-1 rounded-full border text-sm font-medium text-center ${getFacturaColor(
              getValue()
            )}`}
          >
            {getValue() ?? "Desconocido"}
          </div>
        ),
      },
      {
        accessorKey: "metodoPago",
        header: "Metodo de pago",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span>{getValue()}</span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }: { row: Row<Factura> }) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="transition-colors duration-200 hover:bg-[#1642a1] bg-[#2563eb] action_btn"
              onClick={() => EditFactura(row.original.id)}
              style={{
                padding: "8px 16px",
                color: "white",
                borderRadius: "6px",
              }}
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => Impresion(row.original.id)}
              className="transition-colors duration-200 hover:bg-green-500 bg-green-400 action_btn"
              style={{
                padding: "8px 16px",
                color: "white",
                borderRadius: "6px",
              }}
            >
              <DownloadIcon />
            </button>
          </div>
        ),
      },
    ];
  }, []);

  function EditFactura(id: number) {
    setLoadintComplete(true);
    apiRequestThen<FacturaDetalle>({
      url: `api/facturas/details/${id}`,
    })
      .then((response) => {
        if (!response.success) {
          return;
        }
        AsingFactura(response.result!);
        modalEditOpen();
      })
      .finally(() => {
        setLoadintComplete(false);
      });
  }

  function Impresion(id: number) {
    setLoadintComplete(true);
    apiRequestThen<FacturaDetalle>({
      url: `api/facturas/details/${id}`,
    })
      .then((response) => {
        if (!response.success) {
          return;
        }
        handlePrintFactura(response.result!);
      })
      .finally(() => {
        setLoadintComplete(false);
      });
  }

  const table = useReactTable<Factura>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {loadintComplete && <LoaderFun absolute={false} />}
      <div className="overflow-x-scroll">
        <Drawer isOpen={IsDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
          <FacturacionDetails
            isOpen={IsDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            factura={DetailsFactura}
            isLoading={isLoading}
          />
        </Drawer>
        {loader ? (
          <LoadingTable columns={7} />
        ) : (
          <table className="md:table-fixed w-[120%] border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border-b-[1px] border-solid borde-b-[#ccc] p-4 text-left"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors duration-200 hover:bg-gray-200 cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;

                    // Si el click viene de un botón o un hijo con la clase .action_btn, no abrir el modal
                    if (target.closest(".action_btn")) {
                      return;
                    }

                    getData(row.original.id);
                    setIsDetailsOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell: Cell<Factura, unknown>) => (
                    <td
                      key={cell.id}
                      className="p-4 border-b-[1px] border-solid borde-b-[#ccc]"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-center flex-col sm:flex-row">
        <Input
          type="number"
          id="size"
          placeholder="Ej: 18"
          className="max-w-[100px]"
          value={pageSize ?? ""}
          onChange={(e) => {
            if (e.target.value == "e") {
              return;
            }
            updateSize(parseInt(e.target.value), "PageSize");
          }}
        />
        <Pagination
          totalPages={total_pages}
          currentPage={pageNUmber}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}

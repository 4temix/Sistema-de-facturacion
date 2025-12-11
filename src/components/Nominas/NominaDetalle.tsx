import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  Cell,
} from "@tanstack/react-table";
import { NominaCompletaDto, NominaDetalleDto } from "../../Types/Nomina.types";
import {
  TbCalendar,
  TbCheck,
  TbClock,
  TbArrowLeft,
  TbReceipt,
} from "react-icons/tb";
import Drawer from "../ui/modal/Drawer";
import NominaEmpleadoDetails from "./NominaEmpleadoDetails";
import Button from "../ui/button/Button";
import { apiRequest } from "../../Utilities/FetchFuntions";
import LoaderFun from "../loader/LoaderFunc";

interface NominaDetalleProps {
  nomina: NominaCompletaDto;
  onBack: () => void;
  onAprobar: () => void;
}

export default function NominaDetalle({
  nomina,
  onBack,
  onAprobar,
}: NominaDetalleProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetalle, setSelectedDetalle] =
    useState<NominaDetalleDto | null>(null);
  const [isAprobando, setIsAprobando] = useState(false);

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleAprobar = async () => {
    setIsAprobando(true);
    try {
      const response = await apiRequest({
        url: `api/nomina/aprobar/${nomina.id}`,
        configuration: { method: "POST" },
      });
      if (response.success) {
        onAprobar();
      }
    } catch (error) {
      console.error("Error al aprobar nómina:", error);
    } finally {
      setIsAprobando(false);
    }
  };

  const columns = useMemo(() => {
    return [
      {
        id: "empleadoNombre",
        accessorKey: "empleadoNombre",
        header: "Empleado",
        cell: ({ getValue }: { getValue: () => string }) => (
          <span className="font-medium text-gray-900">{getValue()}</span>
        ),
      },
      {
        id: "salarioBase",
        accessorKey: "salarioBase",
        header: "Salario Base",
        cell: ({ getValue }: { getValue: () => number }) => (
          <span>{formatCurrency(getValue())}</span>
        ),
      },
      {
        id: "totalDevengado",
        accessorKey: "totalDevengado",
        header: "Devengado",
        cell: ({ getValue }: { getValue: () => number }) => (
          <span className="text-green-700 font-medium">
            {formatCurrency(getValue())}
          </span>
        ),
      },
      {
        id: "totalDescuentos",
        accessorKey: "totalDescuentos",
        header: "Descuentos",
        cell: ({ getValue }: { getValue: () => number }) => (
          <span className="text-red-700 font-medium">
            -{formatCurrency(getValue())}
          </span>
        ),
      },
      {
        id: "pagoNeto",
        accessorKey: "pagoNeto",
        header: "Pago Neto",
        cell: ({ getValue }: { getValue: () => number }) => (
          <span className="text-blue-700 font-bold">
            {formatCurrency(getValue())}
          </span>
        ),
      },
    ];
  }, []);

  const table = useReactTable<NominaDetalleDto>({
    data: nomina.detalles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {isAprobando && <LoaderFun absolute={false} />}

      {/* Drawer de detalles del empleado */}
      <Drawer isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        {selectedDetalle && (
          <NominaEmpleadoDetails
            detalle={selectedDetalle}
            onClose={() => setIsDetailsOpen(false)}
          />
        )}
      </Drawer>

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <TbArrowLeft className="w-5 h-5" />
          <span>Volver a nóminas</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <TbReceipt className="text-blue-600 text-3xl" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Nómina {nomina.tipo}
                </h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <TbCalendar className="w-4 h-4" />
                  {formatDate(nomina.periodoInicio)} -{" "}
                  {formatDate(nomina.periodoFin)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                nomina.aprobado
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {nomina.aprobado ? (
                <>
                  <TbCheck className="w-4 h-4" /> Aprobada
                </>
              ) : (
                <>
                  <TbClock className="w-4 h-4" /> Pendiente
                </>
              )}
            </div>
            {!nomina.aprobado && (
              <Button onClick={handleAprobar} size="sm">
                Aprobar Nómina
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Resumen totales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Total Devengado</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(nomina.totalDevengado)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Total Descuentos</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(nomina.totalDescuentos)}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Total Neto a Pagar</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(nomina.totalPagoNet)}
          </p>
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            {nomina.detalles.length} empleado
            {nomina.detalles.length !== 1 ? "s" : ""} en esta nómina
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-gray-100 bg-gray-50/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
            <tbody className="divide-y divide-gray-50">
              {nomina.detalles.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No hay empleados en esta nómina
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row: Row<NominaDetalleDto>) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedDetalle(row.original);
                      setIsDetailsOpen(true);
                    }}
                  >
                    {row
                      .getVisibleCells()
                      .map((cell: Cell<NominaDetalleDto, unknown>) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 text-sm text-gray-700"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


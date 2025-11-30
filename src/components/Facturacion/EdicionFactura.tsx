import { customStyles } from "../../Utilities/StyleForReactSelect";
import Label from "../form/Label";
import Select from "react-select";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { BaseSelecst } from "../../Types/ProductTypes";
import { Option } from "../../Types/ProductTypes";
import { useModalEdit } from "../../context/ModalEditContext";
import {
  DevolucionDetallesSave,
  ProductoVenta,
} from "../../Types/FacturacionTypes";
import { useEffect, useState } from "react";
import { BoxCubeIcon } from "../../icons";
import Checkbox from "../form/input/Checkbox";
import Swal from "sweetalert2";
import { apiRequestThen } from "../../Utilities/FetchFuntions";
type EdicionParameters = {
  closeModal: () => void;
  selectsData?: BaseSelecst[];
};

type Devolucion = {
  id: number;
  estado: Option;
  pagado: number;
  detalles: DevolucionDetallesSave[];
};

const regexNum = /^-?\d+(\.\d+)?$/;
export function EdicionFactura({ selectsData, closeModal }: EdicionParameters) {
  const [sendData, setSendData] = useState<Devolucion>({
    id: 0,
    estado: { value: "", label: "" },
    pagado: 0,
    detalles: [],
  });

  const [isCheckedTwo, setIsCheckedTwo] = useState(false);
  const [elementSelect, setElementSelect] = useState<DevolucionDetallesSave>();

  function updateFields(value: number | null | any, key: string) {
    if (value == 0) value = 0;
    setSendData((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  }

  const [editData, setEditData] = useState<ProductoVenta[]>();

  const { facturaDetails } = useModalEdit();

  function actualizarProductos(productos: ProductoVenta[] | null | undefined) {
    if (!productos) return;

    return productos
      .map((p) => {
        const cantidadDevuelta = p.devoluciones.reduce(
          (acc, d) => acc + (d.cantidad ?? 0),
          0
        );

        const nuevaCantidad = p.cantidad - cantidadDevuelta;

        return {
          ...p,
          cantidad: nuevaCantidad < 0 ? 0 : nuevaCantidad,
        };
      })
      .filter((p) => p.cantidad > 0); // ❌ excluye los agotados
  }

  //funcion para agregar elementos al segundo array que sera enviado
  function aggDetallesDevolucion(
    element: ProductoVenta,
    cantidad: number,
    estado: string,
    observaciones: string = ""
  ) {
    if (estado == "") {
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "warning",
        title: "Seleccione el estado en el que se devolvio le producto",
      });
      return;
    }
    let elements = [...sendData.detalles];

    const existente = sendData.detalles.findIndex(
      (el) => el.productoId == element?.productoId
    );

    if (!editData) return;
    const producto = editData.findIndex(
      (el) => el.productoId == element?.productoId
    );
    let elementSelect = editData;

    if (elementSelect[producto].cantidad - cantidad < 0) {
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "info",
        title: "No quedan elementos",
      });
      return;
    }

    elementSelect[producto].cantidad =
      elementSelect[producto].cantidad - cantidad;

    if (existente != -1 && sendData.detalles[existente].tipo == estado) {
      let elementsSend = sendData.detalles;
      elementsSend[existente].cantidad = elementsSend[existente].cantidad + 1;
      setEditData(elementSelect);
      updateFields(elementsSend, "detalles");
      return;
    }

    if (!facturaDetails) return;
    elements.push({
      facturaId: facturaDetails.id,
      productoId: element.productoId,
      cantidad: cantidad,
      precioVenta: element.precioVentaActual,
      tipo: estado,
      observaciones: observaciones ?? "",
    });

    setEditData(elementSelect);
    updateFields(elements, "detalles");
  }

  function updateDevolution(value: number | string, key: string) {
    if (key == "cantidad" && editData) {
      const producto = editData.find(
        (el) => el.productoId == elementSelect?.productoId
      );

      if (!producto) return;

      if (Number(value) > producto.cantidad) {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "info",
          title: "Esta cantida no esta disponible para reembolsar",
        });
        return;
      }
    }

    setElementSelect((prev) => {
      if (!prev) return undefined; // o un objeto inicial si prefieres
      return { ...prev, [key]: value };
    });
  }

  function saveDevolution(saveElement: Devolucion) {
    if (!facturaDetails) return;
    const devolucion = {
      id: saveElement.id,
      estado:
        saveElement.estado.value == "" ? 0 : parseInt(saveElement.estado.value),
      pagado:
        facturaDetails.montoPagado >= facturaDetails.total
          ? 0
          : saveElement.pagado,
      detalles: saveElement.detalles,
    };

    apiRequestThen<boolean>({
      url: "api/facturas/ediccion",
      configuration: {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(devolucion),
      },
    })
      .then((response) => {
        if (!response.success) {
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });
          Toast.fire({
            icon: "error",
            title: response.errorMessage,
          });
          return;
        }
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Factura guardada correctamente",
        });
        closeModal();
      })
      .finally(() => {
        // setIsLoading(false);
      });
  }

  useEffect(() => {
    setEditData(actualizarProductos(facturaDetails?.productos));
    setSendData({
      id: facturaDetails?.id ?? 0,
      estado: { value: "", label: "" },
      pagado: facturaDetails?.montoPagado ?? 0,
      detalles: [],
    });
  }, [facturaDetails]);

  //marcar el total del monto pagado
  useEffect(() => {
    updateFields(
      isCheckedTwo && facturaDetails
        ? facturaDetails?.total - facturaDetails?.montoPagado
        : 0,
      "pagado"
    );
  }, [isCheckedTwo]);

  useEffect(() => {
    if (sendData.estado.value == "5") {
      editData?.forEach((el) => {
        aggDetallesDevolucion(el, el.cantidad, "Reintegrable", "");
      });
    }
  }, [sendData.estado]);

  return (
    <>
      <div className="relative w-full bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edición
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Edicion de los elementos
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border p-3 rounded-lg">
          {/* <CalendarIcon /> */}
          <p className="text-xs text-gray-500">Monto pagado</p>
          <p className="font-medium">
            {facturaDetails?.montoPagado.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
        <div className="bg-white border p-3 rounded-lg">
          {/* <CalendarIcon /> */}
          <p className="text-xs text-gray-500">Total a pagar</p>
          <p className="font-medium">
            {" "}
            {facturaDetails?.total.toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
            })}
          </p>
        </div>
      </div>
      <form className="flex flex-col">
        <div className="px-2 custom-scrollbar">
          <div className="grid">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-1">
                <Label htmlFor="status">Estado de facturas</Label>
                <Select<Option, false>
                  name="colors"
                  id="status"
                  styles={customStyles()}
                  placeholder={"Estado..."}
                  //se hace de esta manera para tener los labels de los selects
                  // para hacer que salga el place holder se hace la verificacion de si hay valor
                  value={
                    sendData?.estado.label != ""
                      ? {
                          label: sendData.estado.label,
                          value: sendData.estado.value.toString(),
                        }
                      : null
                  }
                  options={selectsData?.map((producto: BaseSelecst) => ({
                    label: producto.name,
                    value: producto.id.toString(),
                  }))}
                  onChange={(e) => {
                    if (!e) return;
                    updateFields({ value: e.value, label: e.label }, "estado");
                  }}
                  menuPosition="fixed"
                  className="select-custom pl-0"
                  classNamePrefix="select"
                />
              </div>

              <div className="">
                <Label htmlFor="monto_a_pagar">Monto a pagar</Label>
                {facturaDetails?.montoPagado != undefined &&
                facturaDetails?.montoPagado >= facturaDetails?.total ? (
                  <Input
                    type="text"
                    id="monto_a_pagar"
                    disabled={true}
                    value={facturaDetails?.montoPagado ?? ""}
                    placeholder="Monto a abonar"
                  />
                ) : (
                  <Input
                    type="text"
                    id="monto_a_pagar"
                    value={sendData.pagado ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === "") {
                        updateFields(0, "pagado"); // o null si prefieres
                        return;
                      }

                      if (regexNum.test(value)) {
                        updateFields(parseFloat(value), "pagado");
                      }
                    }}
                    hint={
                      facturaDetails?.montoPagado != undefined &&
                      facturaDetails?.total <
                        sendData.pagado + facturaDetails.montoPagado
                        ? "El monto introducido es mayor que el total"
                        : ""
                    }
                    error={
                      facturaDetails?.montoPagado != undefined &&
                      facturaDetails?.total <
                        sendData.pagado + facturaDetails.montoPagado
                        ? true
                        : false
                    }
                    placeholder="Maximo..."
                  />
                )}
              </div>
              <Checkbox
                checked={isCheckedTwo}
                onChange={setIsCheckedTwo}
                label="Todo pagado"
              />
            </div>
          </div>

          {sendData.estado.value != "2" &&
            sendData.estado.value != "0" &&
            sendData.estado.value != "" && (
              <>
                <div
                  className={`w-full bg-gray-100 max-h-[300px] min-h-[200px] rounded-[9px] p-3 overflow-y-scroll mt-3 `}
                >
                  {/* {searchConfig.loading && <LoaderFun absolute={true} />}

                {productosData.data.length == 0 && filters.search.length == 0 && (
                  <p className="text-gray-500">
                    Escriba el nombre el producto a buscar
                  </p>
                )}

                {productosData.data.length == 0 && filters.search.length > 0 && (
                  <p className="text-gray-500">Sin resultados</p>
                )} */}

                  {editData?.map((producto: ProductoVenta) => (
                    <div
                      key={producto.productoId}
                      className="p-3 border border-gray-200 rounded-[9px] dark:border-gray-800 flex bg-white min-h-24 gap-3 lg:flex-row flex-col mt-3 cursor-pointer base"
                    >
                      <div className="bg-gray-200 p-2 flex justify-center items-center rounded-[9px] max-h-[40px]">
                        <BoxCubeIcon />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                          <span className="truncate w-[250px] block">
                            #{producto.productoId} {producto.nombre}
                          </span>
                        </div>
                        {elementSelect?.productoId == producto.productoId && (
                          <>
                            <div>
                              <Label htmlFor="monto_a_pagar">Cantidad</Label>{" "}
                              <Input
                                type="text"
                                id="monto_a_pagar"
                                value={elementSelect.cantidad ?? ""}
                                placeholder="cantidad a devolver"
                                onChange={(e) => {
                                  const value = e.target.value;

                                  if (value === "") {
                                    updateDevolution(0, "cantidad"); // o null si prefieres
                                    return;
                                  }

                                  if (regexNum.test(value)) {
                                    updateDevolution(
                                      parseInt(e.target.value),
                                      "cantidad"
                                    );
                                  }
                                }}
                              />
                            </div>
                            <div className="col-span-1">
                              <Label htmlFor="estado_producto">
                                Estado del producto
                              </Label>
                              <Select<Option, false>
                                name="estado_producto"
                                id="status"
                                styles={customStyles()}
                                placeholder={"Estado..."}
                                value={
                                  elementSelect
                                    ? {
                                        label: elementSelect.tipo,
                                        value: elementSelect.tipo,
                                      }
                                    : null
                                }
                                options={[
                                  {
                                    label: "Reintegrable",
                                    value: "Reintegrable",
                                  },
                                  { label: "Defectuoso", value: "Defectuoso" },
                                ]}
                                onChange={(e) => {
                                  if (!e) return;
                                  updateDevolution(e.value, "tipo");
                                }}
                                menuPosition="fixed"
                                className="select-custom pl-0"
                                classNamePrefix="select"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      {!elementSelect?.productoId && (
                        <div
                          className="w-20 h-10 border-dashed border-black border-2 flex items-center justify-center m-auto hover:scale-110 transition-transform ease-in duration-100"
                          onClick={() => {
                            if (!facturaDetails) return;
                            setElementSelect({
                              facturaId: facturaDetails.id,
                              productoId: producto.productoId,
                              cantidad: 1,
                              precioVenta: producto.precioVentaActual,
                              tipo: "",
                              observaciones: "",
                            });
                          }}
                        >
                          +
                        </div>
                      )}
                      {elementSelect?.productoId == producto.productoId && (
                        <div className="lg:mt-[22px]">
                          <Label htmlFor="descripcion">Observaciones</Label>
                          <textarea
                            id="descripcion"
                            rows={3}
                            placeholder="Detalles de la devolucion"
                            value={elementSelect.observaciones ?? ""}
                            className={`border rounded-xl w-full p-2 text-sm`}
                            onChange={(e) => {
                              updateDevolution(e.target.value, "observaciones");
                            }}
                          ></textarea>
                        </div>
                      )}

                      {/* BOTÓN ELIMINAR */}
                      <div className="flex flex-col justify-between items-end ml-auto">
                        <div className="ml-auto flex gap-2 flex-col">
                          <span>
                            RD${producto.precioVentaActual.toFixed(2)}
                          </span>

                          <span className="text-gray-400">
                            Cantidad: {producto.cantidad}
                          </span>
                        </div>
                        {elementSelect?.productoId == producto.productoId && (
                          <div className="flex items-center gap-3 px-2 justify-end items-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setElementSelect(undefined);
                              }}
                            >
                              Cerrar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                aggDetallesDevolucion(
                                  producto,
                                  elementSelect.cantidad,
                                  elementSelect.tipo,
                                  elementSelect.observaciones
                                );
                              }}
                            >
                              Guardar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p>Devoluciones</p>
                <div
                  className={`w-full bg-gray-100 max-h-[300px] min-h-[200px] rounded-[9px] p-3 overflow-y-scroll mt-3`}
                >
                  {sendData.detalles?.map(
                    (producto: DevolucionDetallesSave, key: number) => (
                      <div
                        key={key}
                        className="p-3 border border-gray-200 rounded-[9px] dark:border-gray-800 flex bg-white min-h-24 gap-3 lg:flex-row flex-col mt-3 hover:bg-gray-300 transition-colors duration-150 ease-in cursor-pointer"
                        onClick={() => {}}
                      >
                        <div className="bg-gray-200 p-2 flex justify-center items-center rounded-[9px] max-h-[40px]">
                          <BoxCubeIcon />
                        </div>

                        <div className="flex flex-col">
                          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            # {producto.productoId}
                          </div>
                          <p>{producto.observaciones}</p>
                        </div>

                        {/* BOTÓN ELIMINAR */}
                        <div className="ml-auto flex gap-2 flex-col">
                          <span className="text-gray-400">
                            Cantidad: {producto.cantidad}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
        </div>
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Cerrar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              saveDevolution(sendData);
            }}
          >
            Guardar
          </Button>
        </div>
      </form>
    </>
  );
}

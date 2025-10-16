//metricas
export type Metricas = {
  agotados: number;
  stockBajo: number;
  valorTotal: number;
  margenPromedio: number;
  totalProductos: number;
};

//producto list resumen
export type Producto = {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  categoria?: string | null;
  tipo?: string | null;
  estado?: string | null;
  marca?: string | null;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  Porsentaje: string;
};

//respuesta del backend
export type DataRequest = {
  data: Producto[];
  total_pages: number;
};

//filtro de busqueda
export type ProductoFiltro = {
  tipo?: number | null;
  marca?: number | null;
  categoria?: number | null;
  estado?: number | null;
  precioVentaMinimo?: number | null;
  precioVentaMaximo?: number | null;
  search?: string | null;
  stockBajo?: boolean | null;
  agotados?: boolean | null;
};
//opciones para los selects
export type Option = {
  value: string;
  label: string;
};

//selecsts para crear un producto
export type BaseSelecst = {
  id: number;
  name: string;
};

export type Selects = {
  categorias: BaseSelecst[];
  tipos: BaseSelecst[];
  marcas: BaseSelecst[];
  estados: BaseSelecst[];
};

//guardar producto
export type SaveProducto = {
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  categoriaId: number | null;
  marcaId: number | null;
  tipoId: number | null;
  estadoId: number | null;
  precioCompra: number;
  precioVenta: number;
  precioMinimo: number | null;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string;
  ubicacion: string;
  codigoBarras: string;
  impuesto: number | null;
};

//paginacion para tablas
export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
};

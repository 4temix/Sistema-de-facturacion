// Types para el módulo de Nóminas

// DTO para crear nómina
export interface NominaCreateDto {
  periodoInicio: string; // DateOnly como ISO string
  periodoFin: string;
  tipo: string;
}

// DTO para actualizar nómina
export interface NominaUpdateDto {
  id: number;
  periodoInicio: string;
  periodoFin: string;
  tipo: string;
  aprobado: boolean;
}

// Item de la lista de nóminas
export interface NominaListItem {
  id: number;
  periodoInicio: string;
  periodoFin: string;
  tipo: string;
  totalDevengado: number;
  totalDescuentos: number;
  totalPagoNet: number;
  aprobado: boolean;
}

// Respuesta de lista de nóminas
export interface NominaListResponse {
  data: NominaListItem[];
  totalPages: number;
}

// Detalle de empleado en nómina
export interface NominaDetalleDto {
  id: number;
  nominaId: number;
  empleadoId: number;
  empleadoNombre: string;
  salarioBase: number;
  horasExtras: number;
  montoHorasExtras: number;
  otrosIngresos: number;
  sfs: number;
  afp: number;
  isr: number;
  otrosDescuentos: number;
  totalDevengado: number;
  totalDescuentos: number;
  pagoNeto: number;
}

// Nómina completa con detalles
export interface NominaCompletaDto {
  id: number;
  periodoInicio: string;
  periodoFin: string;
  tipo: string;
  totalDevengado: number;
  totalDescuentos: number;
  totalPagoNet: number;
  aprobado: boolean;
  detalles: NominaDetalleDto[];
}

// Detalle individual para el drawer
export interface NominaDetalleGetDto {
  id: number;
  empleadoId: number;
  salarioBase: number;
  horasExtras: number;
  montoHorasExtras: number;
  otrosIngresos: number;
  sfs: number;
  afp: number;
  isr: number;
  otrosDescuentos: number;
  totalDevengado: number;
  totalDescuentos: number;
  pagoNeto: number;
}

// Nómina GET (info básica con fecha de creación)
export interface NominaGetDto {
  id: number;
  periodoInicio: string;
  periodoFin: string;
  tipo: string;
  totalDevengado: number;
  totalDescuentos: number;
  totalPagoNet: number;
  aprobado: boolean;
  creadaEn: string;
}

// Parámetros para listar nóminas
export interface GetNominasParams {
  page?: number;
  pageSize?: number;
}

// Valores del formulario para crear nómina
export interface NominaFormValues {
  periodoInicio: string;
  periodoFin: string;
  tipo: string;
}


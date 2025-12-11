// Types para el módulo de Empleados

// DTO para crear empleado
export interface EmpleadoCreateDto {
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento?: string;
  telefono: string;
  email: string;
  provincia: string;
  municipio: string;
  direccion: string;
  fechaIngreso: string;
  puestoId: number;
  tipoContrato: string;
  salarioBase: number;
  salarioPorHora?: number;
  arsId?: number;
  afpId?: number;
  banco: string;
  cuentaBancaria: string;
}

// DTO para actualizar empleado
export interface EmpleadoUpdateDto extends EmpleadoCreateDto {
  id: number;
  fechaSalida?: string;
}

// Item de la lista de empleados
export interface EmpleadoListItem {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  email: string;
  puesto: string;
  activo: boolean;
}

// Respuesta de la lista de empleados
export interface EmpleadosListResponse {
  data: EmpleadoListItem[];
  totalPages: number;
}

// Select de empleados
export interface EmpleadoSelect {
  id: number;
  nombre: string;
}

// Parámetros para obtener empleados
export interface GetEmpleadosParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

// Valores del formulario
export interface EmpleadoFormValues {
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  provincia: string;
  municipio: string;
  direccion: string;
  fechaIngreso: string;
  puestoId: number | null;
  tipoContrato: string;
  salarioBase: number | null;
  salarioPorHora: number | null;
  arsId: number | null;
  afpId: number | null;
  banco: string;
  cuentaBancaria: string;
}

// Selects para el formulario de empleados
export interface SelectsEmpleados {
  puestos: { id: number; nombre: string }[];
  ars: { id: number; nombre: string }[];
  afp: { id: number; nombre: string }[];
  tiposContrato: { value: string; label: string }[];
}

// Métrica para cards (opcional)
export interface EmpleadosMetrics {
  totalEmpleados: number;
  empleadosActivos: number;
  empleadosInactivos: number;
}

// DTO para detalles de empleado (getById)
export interface EmpleadoDetailsDto {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento?: string;
  telefono: string;
  email: string;
  provincia: string;
  municipio: string;
  direccion: string;
  fechaIngreso: string;
  puesto: string;
  tipoContrato: string;
  salarioBase: number;
  salarioPorHora?: number;
  arsId?: number;
  afpId?: number;
  banco: string;
  cuentaBancaria: string;
  fechaSalida?: string;
}

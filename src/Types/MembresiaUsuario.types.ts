/** Plan disponible al registrar membresía a un usuario (GET opciones). */
export type MembresiaPlanUsuarioOption = {
  id: number;
  name: string;
  price: number;
  intervalType: string;
  intervalCount: number;
  availableAll: boolean;
};

export type MembresiaEstadoUsuarioOption = {
  id: number;
  nombre: string;
};

/** Resultado GET `api/v1/membresia` (selects para alta de membresía de usuario). */
export type MembresiaUsuarioSelectsResponse = {
  planes: MembresiaPlanUsuarioOption[];
  status: MembresiaEstadoUsuarioOption[];
};

/** POST `api/v1/membresia` */
export type AsignarMembresiaUsuarioPayload = {
  planId: number;
  userId: number;
  statusId: number;
};

/** GET `api/v1/membresia/historial/{userId}` — fila de historial. */
export type MembresiaHistorialItem = {
  id: number;
  userId: number;
  status: { id: number; nombre: string };
  plan: MembresiaPlanUsuarioOption;
  requestedAt: string;
  reviewedAt: string;
  note: string;
  expiresAt: string;
};

/** PUT `api/v1/membresia/update_status_membership` */
export type UpdateMembresiaStatusPayload = {
  membresiaId: number;
  statusId: number;
  note: string;
};

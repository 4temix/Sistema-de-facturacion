import { Menu } from "./Menu";
import { BaseSelecst } from "./ProductTypes";

export interface Rol {
  id: number;
  nombre: string;
}

export interface Estado {
  id: number;
  nombre: string;
}

/** Membresía embebida en usuario (lista admin, login, by_id). */
export interface UserMembershipSnapshot {
  planId: number | null;
  plan: string;
  price: number;
  status: { id: number; nombre: string };
  isActive: boolean | null;
  startAt: string | null;
  expiresAt: string | null;
  graceUntil: string | null;
}

export interface User {
  id: number;
  username: string;
  realName: string;
  lastName: string;
  email: string;
  teNumber: string;
  about: string;
  compName: string;
  address: string;
  fechaCreacion: string; // ISO string
  userImage: string | null;

  rol: Rol;
  estado: Estado;
  /** Membresía vigente o última conocida; `null` si no tiene. */
  membership?: UserMembershipSnapshot | null;
}

export interface CreateUser {
  username: string;
  realName: string;
  lastName: string;
  email: string;
  teNumber: string;
  about: string;
  pass: string;
  compName: string;
  address: string;
  rolId: number;
  estado: number;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  menu: Menu;
}

export type UserSelectResponse = {
  roles: BaseSelecst[];
  estados: BaseSelecst[];
};

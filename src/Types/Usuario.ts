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

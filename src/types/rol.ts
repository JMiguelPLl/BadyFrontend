export type EstadoRol = "Activo" | "Inactivo";

export interface Rol {
  id: number;
  descripcion: string;
  estado: EstadoRol;
}

export interface RolFormulario {
  descripcion: string;
}

export interface RespuestaRol {
  message?: string;
  estado?: EstadoRol;
}
export type EstadoUsuario = "Activo" | "Inactivo";

export interface Usuario {
  id: number;
  nombre: string;
  numero: string;
  email: string;
  estado: EstadoUsuario;
  idRol: number;
  rol: string;
}

export interface RolSelector {
  id: number;
  descripcion: string;
  estado: "Activo" | "Inactivo";
}

export interface UsuarioFormulario {
  nombre: string;
  numero: string;
  email: string;
  contrasena: string;
  idRol: string;
}

export interface UsuarioCrear {
  nombre: string;
  numero: string;
  email: string;
  contrasena: string;
  idRol: number;
}

export interface UsuarioActualizar {
  nombre: string;
  telefono: string;
  email: string;
  contrasena?: string;
  idRol: number;
}

export interface RespuestaUsuario {
  message?: string;
  usuario?: Usuario;
}
export type Estado = "Activo" | "Inactivo";

export interface Vehiculo {
  id: number;
  marca: string;
  placa?: string | null;
  cantidadCarga: string;
  estado: Estado;
}

export interface VehiculoForm {
  marca: string;
  placa: string;
  cantidadCarga: string;
}

export interface AsignacionVehiculo {
  id: number;
  idUsuario: number;
  usuario: string;
  correoUsuario?: string | null;
  idVehiculo: number;
  vehiculo: string;
  placa?: string | null;
  cantidadCarga: string;
  fecha: string;
  estado: Estado;
}

export interface AsignacionForm {
  idUsuario: string;
  idVehiculo: string;
}

export interface UsuarioAsignadoVehiculo {
  idAsignacion: number;
  idUsuario: number;
  usuario: string;
  correo?: string | null;
  fechaAsignacion: string;
  estado: Estado;
}

export interface DetalleVehiculoAsignado {
  idVehiculo: number;
  marca: string;
  placa?: string | null;
  cantidadCarga: string;
  estadoVehiculo: Estado;
  cantidadUsuariosAsignados: number;
  usuariosAsignados: UsuarioAsignadoVehiculo[];
}
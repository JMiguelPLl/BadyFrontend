export type EstadoProducto = "Activo" | "Inactivo";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  stock: number;
  precio: number;
  estado: EstadoProducto;
  imagen?: string | null;
  imagenUrl?: string | null;
}

export interface ProductoFormulario {
  nombre: string;
  descripcion: string;
  stock: string;
  precio: string;
  imagen?: string | null;
  imagenUrl?: string | null;
}

export interface ProductoGuardar {
  nombre: string;
  descripcion: string;
  stock: number;
  precio: number;
  imagen?: string | null;
  eliminarImagen?: boolean;
}

export interface RespuestaProducto {
  message?: string;
  estado?: EstadoProducto;
  producto?: Producto;
}
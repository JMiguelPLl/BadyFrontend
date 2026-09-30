export type Cliente = {
  id: number;
  nombre: string;
  numero: string;
  email?: string | null;
  estado: "Activo" | "Inactivo";
  tieneAccesoApp?: boolean;
};

export type ClienteFormulario = {
  nombre: string;
  numero: string;
  email?: string;
  contrasena?: string;
  tieneAccesoApp?: boolean;
};
export type Cliente = {
  id: number;
  nombre: string;
  numero: string;
  email: string;
  estado: "Activo" | "Inactivo";
};

export type ClienteFormulario = {
  nombre: string;
  numero: string;
  email: string;
  contrasena: string;
};
export interface Catalogo {
  id: number;
  nombre: string;
}

export interface SedeCompleta {
  id: number;
  sban: string;
  nombreSede: string;
  municipio?: string;
  regional?: string;
  departamento?: string;
  direccion?: string;
  horario?: string;
  atencion?: string;
  activa?: boolean;
}
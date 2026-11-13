export interface Sede {
  id: number;
  sban: string;
  nombreSede: string;
  municipio?: string;
  regional?: string;
  departamento?: string;
  direccion?: string;
  horario?: string;
  atencion?: string;
  activa: boolean;
  horaInicioManana?: string;
  horaFinManana?: string;
  horaInicioTarde?: string;
  horaFinTarde?: string;
}
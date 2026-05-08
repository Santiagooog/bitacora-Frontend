export interface Caso {
  id: number;
  fechaSolicitud: string;
  servicio: string;
  tipoServicio: string;
  numeroCasoInt: string;
  numeroCasoESolution?: string;
  estado: string;
  sede: string;
  descripcionFalla: string;
  responsable?: string | null;
  agenteRecibe?: string | null;
  agenteResolutor?: string | null;
  fechaSolucion?: string | null;
  observaciones?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}
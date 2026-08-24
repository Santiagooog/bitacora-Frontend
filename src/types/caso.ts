export interface Caso {
  id: number;
  fechaSolicitud: string;
  
  // ✅ IDs para editar (nuevos)
  servicioId: number;
  tipoServicioId: number;
  estadoId: number;
  sedeId: number;
  
  // Nombres para mostrar
  servicio: string;
  tipoServicio: string;
  numeroCasoInt: string;
  numeroCasoESolution?: string;
  estado: string;
  sban: string;
  sede: string;
  descripcionFalla: string;
  responsable?: string | null;
  agenteRecibe?: string | null;
  agenteResolutor?: string | null;
  fechaSolucion?: string | null;
  observaciones?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPorId?: number;
  creadoPorNombre?: string;
  creadoPorApellido?: string;
  actualizadoPorId?: number;
  actualizadoPorNombre?: string;
  actualizadoPorApellido?: string;
}
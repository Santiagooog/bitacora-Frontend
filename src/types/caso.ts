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
  proyecto?: string;
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
  fechaVencimiento?: string;
  segundosAnsRestantes?: number;
  categoriaFallaNombre?: string;
  categoriaFallaId?: number | null;
  categoriaSolucionNombre?: string;
  categoriaSolucionId?: number | null;
  equipo?: string;
  modelo?: string;
  serial?: string;
  placa?: string;
  activoId?: number;
  activoSerial?: string;
  activoPlaca?: string;
  activoName?: string;
  activoDeviceType?: string;
  activoTipoServicio?: string;
  canalEscalamiento?: string;
  grupoEscalamiento?: string;
  escaladoA?: string;
}

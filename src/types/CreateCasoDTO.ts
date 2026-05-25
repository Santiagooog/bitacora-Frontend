export interface CreateCasoDto {
  fechaSolicitud: string;

  servicioId: number;
  tipoServicioId: number;

  numeroCasoInt: string;
  numeroCasoESolution?: string;

  estadoId: number;
  sedeId: number;

  descripcionFalla: string;

  observaciones?: string;
}
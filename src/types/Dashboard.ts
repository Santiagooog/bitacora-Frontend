import type { Caso } from "./caso";

export interface DashboardFilters {
  termino?: string;
  servicioId?: number | null;
  estadoId?: number | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
}

export interface DashboardResponse {
  totalCasos: number;
  casosActivos: number;
  casosEscalados: number;
  ansVencidos: number;
  casosPorEstado: Record<string, number>;
  casosPorServicio: Record<string, number>;
  casosPorSede: Record<string, number>;
  casosPorMes: Record<string, number>;
  casosRecientes: Caso[];
}

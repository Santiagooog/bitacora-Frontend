export interface DashboardResponse {
  totalCasos: number;
  casosPorEstado: Record<string, number>;
  casosPorServicio: Record<string, number>;
  casosPorSede: Record<string, number>;
}
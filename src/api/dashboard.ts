import api from "./axios";
import type { DashboardFilters, DashboardResponse } from "../types/Dashboard";

export const getDashboard = async (
  filtros: DashboardFilters,
): Promise<DashboardResponse> => {
  const response = await api.get("/dashboard", { params: filtros });
  return response.data;
};

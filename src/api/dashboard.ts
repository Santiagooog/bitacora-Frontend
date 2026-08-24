import api from "./axios";
import type { DashboardResponse } from "../types/Dashboard";

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get("/dashboard");
  return response.data;
};
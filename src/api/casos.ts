import { api } from "./axios";
import type { Caso } from "../types/caso";

export const getCasos = async (): Promise<Caso[]> => {
  const response = await api.get<Caso[]>("/casos");
  return response.data;
};
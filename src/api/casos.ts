import { api } from "./axios";
import type { Caso } from "../types/caso";
import type { CreateCasoDto } from "../types/CreateCaso";

export const getCasos = async (): Promise<Caso[]> => {
  const response = await api.get<Caso[]>("/casos");
  return response.data;
};

export const createCaso = async (
  caso: CreateCasoDto
): Promise<Caso> => {
  const response = await api.post<Caso>(
    "/casos",
    caso
  );

  return response.data;
};
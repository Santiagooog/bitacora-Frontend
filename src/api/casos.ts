import api from "./axios";
import type { Caso } from "../types/caso";

export const getCasos = async (): Promise<Caso[]> => {
  const response = await api.get("/casos");
  return response.data;
};

export const getCasoById = async (id: number): Promise<Caso> => {
  const response = await api.get(`/casos/${id}`);
  return response.data;
};

export const createCaso = async (data: any) => {
  const response = await api.post("/casos", data);
  return response.data;
};

export const updateCaso = async (id: number, data: any) => {
  const response = await api.put(`/casos/${id}`, data);
  return response.data;
};

export const deleteCaso = async (id: number) => {
  await api.delete(`/casos/${id}`);
};

export const getCasosPaginado = async (termino: string, pagina: number, tamanio: number) => {
  const response = await api.get("/casos/paginado", {
    params: { termino, pagina, tamanio }
  });
  return response.data; // { content, totalElements, totalPages, number, size, ... }
};

export const buscarCasos = async (termino: string): Promise<Caso[]> => {
  const response = await api.get("/casos/buscar", { params: { termino } });
  return response.data;
};
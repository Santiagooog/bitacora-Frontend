import api from "../api/axios";
import type { CategoriaFalla } from "../types/CategoriaFalla";

export const getCategoriasFallaPorServicio = async (servicioId: number): Promise<CategoriaFalla[]> => {
  const response = await api.get(`/categorias/fallas/servicio/${servicioId}`);
  return response.data;
};

export const crearCategoriaFalla = async (servicioId: number, nombre: string): Promise<void> => {
  await api.post("/categorias/fallas", null, { params: { servicioId, nombre } });
};

export const eliminarCategoriaFalla = async (id: number): Promise<void> => {
  await api.delete(`/categorias/fallas/${id}`);
};
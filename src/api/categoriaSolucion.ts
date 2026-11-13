import api from "./axios";
import type { CategoriaSolucion } from "../types/CategoriaSolucion";

export const getCategoriasSolucionPorServicio = async (servicioId: number): Promise<CategoriaSolucion[]> => {
  const response = await api.get(`/categorias/soluciones/servicio/${servicioId}`);
  return response.data;
};

export const crearCategoriaSolucion = async (servicioId: number, nombre: string): Promise<void> => {
  await api.post("/categorias/soluciones", null, { params: { servicioId, nombre } });
};

export const eliminarCategoriaSolucion = async (id: number): Promise<void> => {
  await api.delete(`/categorias/soluciones/${id}`);
};
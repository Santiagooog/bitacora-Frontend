import api from "./axios";
import type { Catalogo, SedeCompleta } from "../types/Catalogo";

export const getServicios = async (): Promise<Catalogo[]> => {
  const response = await api.get("/servicios");
  return response.data;
};

export const crearServicio = async (nombre: string, descripcion: string): Promise<Catalogo> => {
  const response = await api.post("/servicios", { nombre, descripcion });
  return response.data;
};

export const getTiposServicio = async (): Promise<Catalogo[]> => {
  const response = await api.get("/tipos-servicio");
  return response.data;
};

export const getEstados = async (): Promise<Catalogo[]> => {
  const response = await api.get("/estados");
  return response.data;
};

export const getSedes = async (): Promise<SedeCompleta[]> => {
  const response = await api.get("/sedes");
  return response.data;
};

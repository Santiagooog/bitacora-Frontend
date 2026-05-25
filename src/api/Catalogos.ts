import { api } from "./axios";
import type { Catalogo } from "../types/Catalogo";

export const getServicios = async (): Promise<Catalogo[]> => {
  const response = await api.get("/servicios");
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

export const getSedes = async (): Promise<Catalogo[]> => {
  const response = await api.get("/sedes");
  return response.data;
};
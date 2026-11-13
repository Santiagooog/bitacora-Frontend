import api from "./axios";
import type { PuntoAcceso } from "../types/PuntoAcceso";

export const getPuntosPaginados = async (
  termino: string,
  sban: string | null,
  tipo: string | null,
  regional: string | null,
  proyecto: string | null,
  pagina: number,
  tamanio: number
) => {
  const params: Record<string, any> = { termino, pagina, tamanio };
  if (sban) params.sban = sban;
  if (tipo) params.tipo = tipo;
  if (regional) params.regional = regional;
  if (proyecto) params.proyecto = proyecto;

  const response = await api.get("/puntos-acceso/todos", { params });
  return response.data;
};

export const getPuntosPorPlaca = async (placa: string): Promise<PuntoAcceso[]> => {
  const response = await api.get(`/puntos-acceso/por-placa/${placa}`);
  return response.data;
};

export const getSbansDisponibles = async (): Promise<string[]> => {
  const response = await api.get("/puntos-acceso/sbans");
  return response.data;
};

export const getRegionalesDisponibles = async (): Promise<string[]> => {
  const response = await api.get("/puntos-acceso/regionales");
  return response.data;
};

export const getTiposDisponibles = async (): Promise<string[]> => {
  const response = await api.get("/puntos-acceso/tipos");
  return response.data;
};

export const getProyectosDisponibles = async (): Promise<string[]> => {
  const response = await api.get("/puntos-acceso/proyectos");
  return response.data;
};

export const eliminarPuntoAcceso = async (id: number) => {
  await api.delete(`/puntos-acceso/${id}`);
};

export interface CargaMasivaPuntoResponse {
  totalLineas: number;
  creados: number;
  omitidos: number;
  errores: number;
  detalles: string[];
}

export const cargarPuntosAccesoCsv = async (
  file: File
): Promise<CargaMasivaPuntoResponse> => {
  const formData = new FormData();
  formData.append("archivo", file);

  const response = await api.post("/puntos-acceso/carga-masiva", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const sincronizarPuntosAActivos = async () => {
  const response = await api.post("/puntos-acceso/sincronizar-a-activos");
  return response.data as { sincronizados: number; mensaje: string };
};

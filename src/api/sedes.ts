import api from "./axios";
import type { Sede } from "../types/Sede";

export const getSedesPaginadas = async (
  termino: string,
  regional: string | null,
  pagina: number,
  tamanio: number
) => {
  const params: Record<string, any> = { termino, pagina, tamanio };
  if (regional) params.regional = regional;
  const response = await api.get("/sedes/todos", { params });
  return response.data;
};

export const getRegionales = async (): Promise<string[]> => {
  const response = await api.get("/sedes/regionales");
  return response.data;
};

export const crearSede = async (data: Partial<Sede>) => {
  const response = await api.post("/sedes", data);
  return response.data;
};

export const actualizarSede = async (id: number, data: Partial<Sede>) => {
  const response = await api.put(`/sedes/${id}`, data);
  return response.data;
};

export const eliminarSede = async (id: number) => {
  await api.delete(`/sedes/${id}`);
};

export interface CargaMasivaSedeResponse {
  totalLineas: number;
  creados: number;
  omitidos: number;
  errores: number;
  detalles: string[];
}

export const cargarSedesCsv = async (
  file: File
): Promise<CargaMasivaSedeResponse> => {
  const formData = new FormData();
  formData.append("archivo", file);

  const response = await api.post("/sedes/carga-masiva", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
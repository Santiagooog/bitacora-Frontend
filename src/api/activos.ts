import api from "./axios";
import type { Activo } from "../types/Activo";
export type { Activo } from "../types/Activo";

export const getActivosPaginados = async (
  termino: string,
  tipoServicio: string | null,
  pagina: number,
  tamanio: number
) => {
  const response = await api.get("/activos/todos", {
    params: { termino, tipoServicio, pagina, tamanio },
  });
  return response.data;
};

export const getActivosPorSede = async (
  sban: string,
  tipoServicio?: string | null
) => {
  const response = await api.get("/activos/por-sede", {
    params: {
      sban,
      ...(tipoServicio ? { tipoServicio } : {}),
    },
  });
  return response.data;
};

export const crearActivo = async (data: Partial<Activo>) => {
  const response = await api.post("/activos", data);
  return response.data;
};

export const actualizarActivo = async (id: number, data: Partial<Activo>) => {
  const response = await api.put(`/activos/${id}`, data);
  return response.data;
};

export const eliminarActivo = async (id: number) => {
  await api.delete(`/activos/${id}`);
};

export interface CargaMasivaResponse {
  totalLineas: number;
  creados: number;
  omitidos: number;
  errores: number;
  detalles: string[];
}

export const cargarActivosCsv = async (
  file: File,
  tipoServicio: string
): Promise<CargaMasivaResponse> => {
  const formData = new FormData();
  formData.append("archivo", file);
  formData.append("tipoServicio", tipoServicio);

  const response = await api.post("/activos/carga-masiva", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

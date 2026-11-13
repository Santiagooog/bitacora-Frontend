import api from "./axios";
import type { Caso } from "../types/caso";

export const getCasos = async (): Promise<Caso[]> => {
  const response = await api.get("/casos");
  return response.data;
};

export const getCasosPaginado = async (termino: string, pagina: number, tamanio: number) => {
  const response = await api.get("/casos/paginado", {
    params: { termino, pagina, tamanio },
  });
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


export const descargarCasosExcel = async (
  termino: string,
  estadoId: number | null,
  servicioId: number | null,
  sedeId: number | null,
  fechaDesde: string | null,
  fechaHasta: string | null,
  soloActivos: boolean,
): Promise<Blob> => {
  const response = await api.get("/casos/exportar-excel", {
    params: {
      termino: termino || "",
      estadoId,
      servicioId,
      sedeId,
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
      soloActivos,
    },
    responseType: "blob",
  });
  return response.data;
};

export const deleteCaso = async (id: number) => {
  await api.delete(`/casos/${id}`);
};

export const getCasosFiltrados = async (
  termino: string,
  estadoId: number | null,
  servicioId: number | null,
  sedeId: number | null,
  fechaDesde: string | null,
  fechaHasta: string | null,
  soloActivos: boolean,
  pagina: number,
  tamanio: number
) => {
  const response = await api.get("/casos/filtrados", {
    params: {
      termino: termino || "",
      estadoId,
      servicioId,
      sedeId,
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
      soloActivos,
      pagina,
      tamanio,
    },
  });
  return response.data;
};

export const buscarCasos = async (termino: string): Promise<Caso[]> => {
  const response = await api.get("/casos/buscar", { params: { termino } });
  return response.data;
};

export const getSugerencias = async (texto: string) => {
  const response = await api.get("/casos/sugerencias", { params: { texto } });
  return response.data;
};

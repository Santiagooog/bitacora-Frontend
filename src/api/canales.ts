import api from "./axios";

export interface CanalEscalamiento {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export const getCanalesActivos = async (): Promise<CanalEscalamiento[]> => {
  const response = await api.get("/canales-escalamiento");
  return response.data;
};

export const getTodosCanales = async (): Promise<CanalEscalamiento[]> => {
  const response = await api.get("/canales-escalamiento/todos");
  return response.data;
};

export const crearCanal = async (nombre: string, descripcion?: string) => {
  await api.post("/canales-escalamiento", null, { params: { nombre, descripcion } });
};

export const actualizarCanal = async (id: number, nombre: string, descripcion?: string, activo?: boolean) => {
  await api.put(`/canales-escalamiento/${id}`, null, { params: { nombre, descripcion, activo } });
};

export const eliminarCanal = async (id: number) => {
  await api.delete(`/canales-escalamiento/${id}`);
};
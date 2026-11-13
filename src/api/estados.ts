import api from "./axios";

export interface Estado {
  id: number;
  nombre: string;
  descripcion: string;
}

export const getTransicionesValidas = async (estadoActual: string): Promise<Estado[]> => {
  const response = await api.get(`/estados/transiciones/${estadoActual}`);
  return response.data;
};
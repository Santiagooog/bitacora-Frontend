import api from "./axios";

export interface HistorialCaso {
  id: number;
  usuarioId?: number;
  nombreUsuario?: string;
  apellidoUsuario?: string;
  accion: string;
  campoModificado?: string;
  valorAnterior?: string;
  valorNuevo?: string;
  observacion?: string;
  fecha: string;
}

export const getHistorialCaso = async (casoId: number): Promise<HistorialCaso[]> => {
  const response = await api.get(`/casos/${casoId}/historial`);
  return response.data;
};
import api from "./axios";

export interface Ans {
  id: number;
  sban: string;
  oficinasTipo: string;
  reg: string;
  oficina: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  horario: string;
  tiempoSdwan: number;
  tiempoWifiPublico: number;
  tiempoControlAcceso: number;
}

export type TipoCargaAns =
  | "POR_SERVICIO"
  | "SDWAN"
  | "WIFI_PUBLICO"
  | "CONTROL_ACCESO";

export const getAnsPaginado = async (
  termino: string,
  pagina: number,
  tamanio: number
) => {
  const response = await api.get("/ans", {
    params: { termino, pagina, tamanio },
  });
  return response.data;
};

export const actualizarAns = async (id: number, datos: Partial<Ans>) => {
  const response = await api.put(`/ans/${id}`, datos);
  return response.data;
};

export interface CargaMasivaAnsResponse {
  totalLineas: number;
  creados: number;
  omitidos: number;
  errores: number;
  detalles: string[];
}

export const cargarAnsCsv = async (
  file: File,
  tipo: TipoCargaAns
): Promise<CargaMasivaAnsResponse> => {
  const formData = new FormData();
  formData.append("archivo", file);

  const response = await api.post(`/ans/carga-masiva?tipo=${tipo}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
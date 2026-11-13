export interface Activo {
  id: number;
  serial: string;
  name: string;
  sban: string;
  site: string;
  deviceType: string;
  placa?: string | null;
  tipoServicio: string;
  activo: boolean;
  proyecto?: string;
}

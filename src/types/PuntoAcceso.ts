export interface PuntoAcceso {
  id: number;
  placa?: string;
  estado?: string;
  marca?: string;
  tipo: string;          // CONTROLADORA | LECTORA
  modelo?: string;
  descripcion?: string;
  serie: string;
  mac?: string;
  sban?: string;
  oficina?: string;
  ciudad?: string;
  regional?: string;
  area?: string;
  piso?: number;
  fechaInstalacion?: string;
  fechaInicioSoporte?: string;
  fechaFinSoporte?: string;
  nombreFuncionario?: string;
  cedula?: string;
  cargo?: string;
  nombreAxiom?: string;
  fechaMantenimiento1?: string;
  fechaMantenimiento2?: string;
  versionFirmware?: string;
  proyecto?: string;
  activo: boolean;
}
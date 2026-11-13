import type { CategoriaSolucion } from "./CategoriaSolucion";

export interface CategoriaFalla {
  id: number;
  servicioId: number;
  servicioNombre: string;
  nombre: string;
  activo: boolean;
  soluciones: CategoriaSolucion[];
}
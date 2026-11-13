import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServicios } from "../../api/Catalogos";
import { getCategoriasFallaPorServicio, crearCategoriaFalla, eliminarCategoriaFalla } from "../../api/categoriaFalla";
import { getCategoriasSolucionPorServicio, crearCategoriaSolucion, eliminarCategoriaSolucion } from "../../api/categoriaSolucion";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2, Loader2 } from "lucide-react";

export const CategoriasPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [mostrarFormFalla, setMostrarFormFalla] = useState(false);
  const [mostrarFormSolucion, setMostrarFormSolucion] = useState(false);
  const [nuevaFalla, setNuevaFalla] = useState("");
  const [nuevaSolucion, setNuevaSolucion] = useState("");

  const esAdmin = user?.rol === "ADMIN";

  const { data: servicios = [] } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });

  const { data: fallas = [], isLoading: cargandoFallas } = useQuery({
    queryKey: ["categoriasFalla", servicioId],
    queryFn: () => getCategoriasFallaPorServicio(servicioId!),
    enabled: !!servicioId,
  });

  const { data: soluciones = [], isLoading: cargandoSoluciones } = useQuery({
    queryKey: ["categoriasSolucion", servicioId],
    queryFn: () => getCategoriasSolucionPorServicio(servicioId!),
    enabled: !!servicioId,
  });

  const mutationFalla = useMutation({
    mutationFn: (nombre: string) => crearCategoriaFalla(servicioId!, nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriasFalla", servicioId] });
      setNuevaFalla("");
      setMostrarFormFalla(false);
    },
  });

  const mutationSolucion = useMutation({
    mutationFn: (nombre: string) => crearCategoriaSolucion(servicioId!, nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriasSolucion", servicioId] });
      setNuevaSolucion("");
      setMostrarFormSolucion(false);
    },
  });

  const mutationEliminarFalla = useMutation({
    mutationFn: eliminarCategoriaFalla,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriasFalla", servicioId] });
    },
  });

  const mutationEliminarSolucion = useMutation({
    mutationFn: eliminarCategoriaSolucion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriasSolucion", servicioId] });
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Categorías de Fallas y Soluciones</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Servicio</label>
        <select
          value={servicioId ?? ""}
          onChange={(e) => setServicioId(Number(e.target.value))}
          className="w-full md:w-96 rounded-lg border p-2"
        >
          <option value="">Seleccione un servicio</option>
          {servicios.map((servicio) => (
            <option key={servicio.id} value={servicio.id}>
              {servicio.nombre}
            </option>
          ))}
        </select>
      </div>

      {servicioId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fallas */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Categorías de Falla</h2>
              {esAdmin && (
                <button onClick={() => setMostrarFormFalla(true)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                  <Plus size={16} /> Agregar
                </button>
              )}
            </div>

            {mostrarFormFalla && esAdmin && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={nuevaFalla}
                  onChange={(e) => setNuevaFalla(e.target.value)}
                  className="border rounded-lg px-3 py-2 flex-1"
                  placeholder="Nombre de la falla"
                />
                <button
                  onClick={() => mutationFalla.mutate(nuevaFalla)}
                  disabled={!nuevaFalla.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {mutationFalla.isPending ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
                </button>
              </div>
            )}

            {cargandoFallas ? (
              <p className="text-sm text-slate-500">Cargando...</p>
            ) : (
              <ul className="space-y-2">
                {fallas.map((falla) => (
                  <li key={falla.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-sm">{falla.nombre}</span>
                    {esAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la falla "${falla.nombre}"?`)) {
                            mutationEliminarFalla.mutate(falla.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                ))}
                {fallas.length === 0 && <p className="text-sm text-slate-400">No hay fallas registradas</p>}
              </ul>
            )}
          </div>

          {/* Soluciones */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Categorías de Solución</h2>
              {esAdmin && (
                <button onClick={() => setMostrarFormSolucion(true)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                  <Plus size={16} /> Agregar
                </button>
              )}
            </div>

            {mostrarFormSolucion && esAdmin && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={nuevaSolucion}
                  onChange={(e) => setNuevaSolucion(e.target.value)}
                  className="border rounded-lg px-3 py-2 flex-1"
                  placeholder="Nombre de la solución"
                />
                <button
                  onClick={() => mutationSolucion.mutate(nuevaSolucion)}
                  disabled={!nuevaSolucion.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {mutationSolucion.isPending ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
                </button>
              </div>
            )}

            {cargandoSoluciones ? (
              <p className="text-sm text-slate-500">Cargando...</p>
            ) : (
              <ul className="space-y-2">
                {soluciones.map((solucion) => (
                  <li key={solucion.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-sm">{solucion.nombre}</span>
                    {esAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la solución "${solucion.nombre}"?`)) {
                            mutationEliminarSolucion.mutate(solucion.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                ))}
                {soluciones.length === 0 && <p className="text-sm text-slate-400">No hay soluciones registradas</p>}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTodosCanales,
  crearCanal,
  actualizarCanal,
  eliminarCanal,
  type CanalEscalamiento,
} from "../../api/canales";
import { useAuth } from "../../context/AuthContext";
import { Plus, Pencil, Trash2, Loader2, Check, X } from "lucide-react";

export const CanalesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const esAdmin = user?.rol === "ADMIN";

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");

  const { data: canales = [], isLoading } = useQuery({
    queryKey: ["canales"],
    queryFn: getTodosCanales,
    enabled: esAdmin,
  });

  const mutationCrear = useMutation({
    mutationFn: () => crearCanal(nuevoNombre, nuevaDescripcion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canales"] });
      setNuevoNombre("");
      setNuevaDescripcion("");
      setMostrarForm(false);
    },
  });

  const mutationActualizar = useMutation({
    mutationFn: (id: number) => actualizarCanal(id, editNombre, editDescripcion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canales"] });
      setIdEditando(null);
    },
  });

  const mutationEliminar = useMutation({
    mutationFn: eliminarCanal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canales"] });
    },
  });

  if (!esAdmin) return <div className="p-6 text-red-600">No autorizado</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Canales de Escalamiento</h1>
          <p className="mt-1 text-slate-500">Gestión de canales por los que se escala un caso</p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Nuevo canal
        </button>
      </div>

      {mostrarForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 font-semibold text-blue-900">Crear nuevo canal</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Nombre (ej: LLAMADA)"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="rounded-lg border p-2"
            />
            <input
              placeholder="Descripción (opcional)"
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              className="rounded-lg border p-2"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => mutationCrear.mutate()}
              disabled={!nuevoNombre.trim() || mutationCrear.isPending}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {mutationCrear.isPending ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
            </button>
            <button
              onClick={() => setMostrarForm(false)}
              className="rounded border border-slate-300 px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descripción</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {canales.map((canal: CanalEscalamiento) => {
                const editando = idEditando === canal.id;
                return (
                  <tr key={canal.id} className="border-t">
                    <td className="px-6 py-3">
                      {editando ? (
                        <input
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          className="w-full rounded border p-1"
                        />
                      ) : (
                        canal.nombre
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {editando ? (
                        <input
                          value={editDescripcion}
                          onChange={(e) => setEditDescripcion(e.target.value)}
                          className="w-full rounded border p-1"
                        />
                      ) : (
                        canal.descripcion || "—"
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs ${canal.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {canal.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {editando ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => mutationActualizar.mutate(canal.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setIdEditando(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setIdEditando(canal.id);
                              setEditNombre(canal.nombre);
                              setEditDescripcion(canal.descripcion || "");
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el canal "${canal.nombre}"?`)) {
                                mutationEliminar.mutate(canal.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {canales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No hay canales registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
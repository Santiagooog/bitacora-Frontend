import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getCasosPaginado, deleteCaso } from "../../api/casos";
import type { Caso } from "../../types/caso";

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "SOLUCIONADO":
      return "bg-green-100 text-green-700";
    case "ESCALADO":
      return "bg-yellow-100 text-yellow-700";
    case "EN PROCESO":
      return "bg-blue-100 text-blue-700";
    case "DEVUELTO":
      return "bg-orange-100 text-orange-700";
    case "CANCELADO":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const CasosPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados para búsqueda y paginación
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [terminoDebounce, setTerminoDebounce] = useState("");
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(10);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminoDebounce(terminoBusqueda);
      setPagina(0); // Resetear a primera página al buscar
    }, 500);

    return () => clearTimeout(timer);
  }, [terminoBusqueda]);

  const { data, isLoading } = useQuery({
    queryKey: ["casos", terminoDebounce, pagina, tamanio],
    queryFn: () => getCasosPaginado(terminoDebounce, pagina, tamanio),
  });

  const casos = data?.content ?? [];
  const totalPaginas = data?.totalPages ?? 0;
  const totalElementos = data?.totalElements ?? 0;

  const deleteMutation = useMutation({
    mutationFn: deleteCaso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos"] });
      alert("Caso eliminado correctamente");
    },
    onError: () => {
      alert("Error al eliminar el caso");
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Casos</h1>
        <p className="mt-1 text-slate-500">Gestión y seguimiento de incidentes</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por SBAN, sede, número de caso o descripción..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && <p className="mt-2 text-sm text-slate-500">Buscando...</p>}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Caso</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Servicio</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Sede</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">SBAN</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Descripción</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Creado por</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Actualizado por</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {casos.map((caso: Caso) => (
              <tr key={caso.id} className="border-t hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{caso.numeroCasoInt}</td>
                <td className="px-6 py-4 text-slate-600">{caso.servicio}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoColor(caso.estado)}`}>
                    {caso.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{caso.sede}</td>
                <td className="px-6 py-4 font-semibold text-blue-600">{caso.sban}</td>
                <td className="px-6 py-4 text-slate-600">{caso.descripcionFalla}</td>
                <td className="px-6 py-4 text-slate-600">
                  {caso.creadoPorNombre ? `${caso.creadoPorNombre} ${caso.creadoPorApellido ?? ''}` : '—'}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {caso.actualizadoPorNombre ? `${caso.actualizadoPorNombre} ${caso.actualizadoPorApellido ?? ''}` : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/casos/${caso.id}`)}
                      className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/casos/${caso.id}/editar`)}
                      className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el caso ${caso.numeroCasoInt}?`)) {
                          deleteMutation.mutate(caso.id);
                        }
                      }}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {casos.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                  No se encontraron casos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Mostrando {casos.length} de {totalElementos} casos</span>
          <select
            value={tamanio}
            onChange={(e) => {
              setTamanio(Number(e.target.value));
              setPagina(0);
            }}
            className="rounded border border-slate-300 px-2 py-1"
          >
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
            <option value="50">50 por página</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className="flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {pagina + 1} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => p + 1)}
            disabled={pagina >= totalPaginas - 1}
            className="flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
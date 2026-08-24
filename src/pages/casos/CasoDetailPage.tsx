import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCasoById, deleteCaso } from "../../api/casos";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { HistorialCasoTimeline } from "../../components/casos/HistorialCasoTimeline";

export const CasoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: caso, isLoading } = useQuery({
    queryKey: ["caso", id],
    queryFn: () => getCasoById(Number(id)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCaso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos"] });
      alert("Caso eliminado correctamente");
      navigate("/casos");
    },
    onError: () => alert("Error al eliminar el caso"),
  });

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (!caso) return <p className="p-6">Caso no encontrado</p>;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "SOLUCIONADO": return "bg-green-100 text-green-700";
      case "ESCALADO": return "bg-yellow-100 text-yellow-700";
      case "EN PROCESO": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/casos")}
        className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Volver a casos
      </button>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{caso.numeroCasoInt}</h1>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEstadoColor(caso.estado)}`}>
              {caso.estado}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/casos/${id}/editar`)}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              <Pencil size={16} /> Editar
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar el caso ${caso.numeroCasoInt}?`)) {
                  deleteMutation.mutate(Number(id));
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} /> Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-slate-500">Servicio</p>
            <p className="font-medium text-slate-900">{caso.servicio}</p>
          </div>
          <div>
            <p className="text-slate-500">Sede</p>
            <p className="font-medium text-slate-900">{caso.sede}</p>
          </div>
          <div>
            <p className="text-slate-500">SBAN</p>
            <p className="font-medium text-blue-600">{caso.sban}</p>
          </div>
          <div>
            <p className="text-slate-500">Número E-Solution</p>
            <p className="font-medium text-slate-900">{caso.numeroCasoESolution || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500">Descripción de la falla</p>
            <p className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800">{caso.descripcionFalla}</p>
          </div>
          {caso.observaciones && (
            <div className="col-span-2">
              <p className="text-slate-500">Observaciones</p>
              <p className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800">{caso.observaciones}</p>
            </div>
          )}

          {/* ✅ Auditoría */}
          <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-slate-500">Creado por</p>
              <p className="font-medium text-slate-900">
                {caso.creadoPorNombre ? `${caso.creadoPorNombre} ${caso.creadoPorApellido ?? ''}` : 'Sistema'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Actualizado por</p>
              <p className="font-medium text-slate-900">
                {caso.actualizadoPorNombre ? `${caso.actualizadoPorNombre} ${caso.actualizadoPorApellido ?? ''}` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <HistorialCasoTimeline casoId={Number(id)} />
      </div>
    </div>
  );
};
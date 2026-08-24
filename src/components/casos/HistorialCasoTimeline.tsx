import { useQuery } from "@tanstack/react-query";
import { getHistorialCaso } from "../../api/Historial";
import { Clock, User, ArrowRight, FilePlus, Pencil, Trash2 } from "lucide-react";

interface Props {
  casoId: number;
}

const getAccionIcono = (accion: string) => {
  switch (accion) {
    case "CREAR": return <FilePlus size={16} className="text-green-600" />;
    case "ACTUALIZAR": return <Pencil size={16} className="text-blue-600" />;
    case "ELIMINAR": return <Trash2 size={16} className="text-red-600" />;
    default: return <Clock size={16} className="text-slate-500" />;
  }
};

const getAccionColor = (accion: string) => {
  switch (accion) {
    case "CREAR": return "bg-green-50 border-green-200";
    case "ACTUALIZAR": return "bg-blue-50 border-blue-200";
    case "ELIMINAR": return "bg-red-50 border-red-200";
    default: return "bg-slate-50 border-slate-200";
  }
};

export const HistorialCasoTimeline = ({ casoId }: Props) => {
  const { data: historial, isLoading } = useQuery({
    queryKey: ["historial", casoId],
    queryFn: () => getHistorialCaso(casoId),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Cargando historial...</p>;
  if (!historial || historial.length === 0) return <p className="text-sm text-slate-400">No hay historial para este caso.</p>;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Historial de cambios</h3>
      <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:h-full before:w-px before:bg-slate-200">
        {historial.map((item) => (
          <div key={item.id} className="relative">
            <div className={`absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 bg-white ${getAccionColor(item.accion).split(' ')[0].replace('bg-', 'border-')}`} />

            <div className={`rounded-xl border p-4 ${getAccionColor(item.accion)}`}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAccionIcono(item.accion)}
                  <span className="text-sm font-semibold text-slate-800">
                    {item.accion === "CREAR" ? "Caso creado" :
                     item.accion === "ACTUALIZAR" ? `Cambio en ${item.campoModificado}` :
                     item.accion === "ELIMINAR" ? "Caso eliminado" : item.accion}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{formatearFecha(item.fecha)}</span>
              </div>

              {item.campoModificado && item.accion === "ACTUALIZAR" && (
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                  <span className="rounded bg-white px-2 py-0.5 line-through decoration-red-400">
                    {item.valorAnterior || "—"}
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                  <span className="rounded bg-white px-2 py-0.5 font-medium text-slate-800">
                    {item.valorNuevo || "—"}
                  </span>
                </div>
              )}

              {item.observacion && (
                <p className="text-sm text-slate-600">{item.observacion}</p>
              )}

              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <User size={12} />
                {item.nombreUsuario ? `${item.nombreUsuario} ${item.apellidoUsuario ?? ''}` : 'Sistema'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
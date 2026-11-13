import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCasoById, deleteCaso } from "../../api/casos";
import { ArrowLeft, Pencil, Trash2, Clock } from "lucide-react";
import { HistorialCasoTimeline } from "../../components/casos/HistorialCasoTimeline";
import { useAuth } from "../../context/AuthContext";

export const CasoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: caso, isLoading } = useQuery({
    queryKey: ["caso", id],
    queryFn: () => getCasoById(Number(id)),
    enabled: !!id,
    refetchInterval: 60_000,
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

  const { user } = useAuth();
  const puedeModificar = user?.rol === "ADMIN" || user?.rol === "AGENTE";

  if (isLoading) return <p className="p-6">Cargando...</p>;
  if (!caso) return <p className="p-6">Caso no encontrado</p>;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "SOLUCIONADO":
        return "bg-green-100 text-green-700";
      case "ESCALADO":
        return "bg-yellow-100 text-yellow-700";
      case "EN PROCESO":
        return "bg-blue-100 text-blue-700";
      case "VENCIDO":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTiempoRestanteColor = () => {
    if (!caso.fechaVencimiento) return "text-gray-500";
    const segundosRestantes = caso.segundosAnsRestantes ?? 0;
    if (segundosRestantes <= 0) return "text-red-600";
    if (segundosRestantes < 4 * 60 * 60) return "text-orange-600";
    if (segundosRestantes < 12 * 60 * 60) return "text-yellow-600";
    return "text-green-700";
  };

  const segundosAnsRestantes = caso.segundosAnsRestantes ?? 0;
  const totalMinutosAns = Math.ceil(segundosAnsRestantes / 60);
  const horasAns = Math.floor(totalMinutosAns / 60);
  const minutosAns = totalMinutosAns % 60;
  const tiempoRestante = !caso.fechaVencimiento
    ? "Sin fecha límite"
    : segundosAnsRestantes <= 0
      ? "VENCIDO"
      : horasAns > 0
        ? `${horasAns} horas, ${minutosAns} minutos`
        : `${minutosAns} minutos`;

  return (
    <div className="p-6">
      {caso.activoName && (
        <div className="col-span-2 mb-4">
          <p className="text-slate-500">Activo afectado</p>
          <p className="font-medium text-slate-900">
            {caso.activoName} ({caso.activoSerial})
          </p>
        </div>
      )}
      
      <button
        onClick={() => navigate("/casos")}
        className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Volver a casos
      </button>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {caso.numeroCasoInt}
            </h1>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEstadoColor(caso.estado)}`}
            >
              {caso.estado}
            </span>
          </div>
          
          {/* ✅ Corregido: Botones en línea (flex) */}
          <div className="flex gap-2">
            {puedeModificar && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* ✅ Sección de ANS */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Clock size={18} /> Estado del ANS
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium">Tiempo restante</p>
              <p className={`text-lg font-bold ${getTiempoRestanteColor()}`}>
                {tiempoRestante}
              </p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Fecha límite</p>
              <p className="text-lg font-bold text-blue-900">
                {caso.fechaVencimiento
                  ? new Date(caso.fechaVencimiento).toLocaleString("es-CO")
                  : "No definido"}
              </p>
            </div>
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
            <p className="text-slate-500">Proyecto</p>
            <p className="font-medium text-slate-900">{caso.proyecto || "GENERAL"}</p>
          </div>
          <div>
            <p className="text-slate-500">Número E-Solution</p>
            <p className="font-medium text-slate-900">
              {caso.numeroCasoESolution || "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Canal de Escalamiento</p>
            <p className="font-medium text-slate-900">
              {caso.canalEscalamiento || "—"}
            </p>
          </div>



          <div>
            <p className="text-slate-500">Grupo de Escalamiento</p>
            <p className="font-medium text-amber-700">
              {caso.grupoEscalamiento || "No asignado"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Escalado a (Aliado)</p>
            <p className="font-medium text-amber-700">
              {caso.escaladoA || "No asignado"}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-slate-500">Descripción de la falla</p>
            <p className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800">
              {caso.descripcionFalla}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Equipo</p>
            <p className="font-medium text-slate-900">{caso.equipo || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Modelo</p>
            <p className="font-medium text-slate-900">{caso.modelo || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Serial</p>
            <p className="font-medium text-slate-900">{caso.serial || "—"}</p>
          </div>
          <div>
            <p className="text-slate-500">Placa</p>
            <p className="font-medium text-slate-900">{caso.placa || "—"}</p>
          </div>
          {caso.activoId && (
            <div className="col-span-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="font-semibold text-blue-900">Activo vinculado (datos actuales)</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-blue-700">Equipo / modelo</p>
                  <p className="font-medium text-slate-900">
                    {caso.activoName || caso.equipo || "—"} / {caso.activoDeviceType || caso.modelo || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Serial actual</p>
                  <p className="font-medium text-slate-900">{caso.activoSerial || "—"}</p>
                </div>
                <div>
                  <p className="text-blue-700">Placa actual</p>
                  <p className="font-medium text-slate-900">{caso.activoPlaca || "—"}</p>
                </div>
              </div>
            </div>
          )}
          {caso.observaciones && (
            <div className="col-span-2">
              <p className="text-slate-500">Observaciones</p>
              <p className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800">
                {caso.observaciones}
              </p>
            </div>
          )}

          {/* Auditoría */}
          <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-slate-500">Creado por</p>
              <p className="font-medium text-slate-900">
                {caso.creadoPorNombre
                  ? `${caso.creadoPorNombre} ${caso.creadoPorApellido ?? ""}`
                  : "Sistema"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Actualizado por</p>
              <p className="font-medium text-slate-900">
                {caso.actualizadoPorNombre
                  ? `${caso.actualizadoPorNombre} ${caso.actualizadoPorApellido ?? ""}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm mt-6">
        <HistorialCasoTimeline casoId={Number(id)} />
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import { getCasosFiltrados, deleteCaso, descargarCasosExcel } from "../../api/casos";
import { getEstados, getServicios, getSedes } from "../../api/Catalogos";
import { useAuth } from "../../context/AuthContext";
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
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [terminoDebounce, setTerminoDebounce] = useState("");
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(10);
  const [exportando, setExportando] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState<number | null>(null);
  const [filtroServicio, setFiltroServicio] = useState<number | null>(null);
  const [filtroSede, setFiltroSede] = useState<number | null>(null);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const { user } = useAuth();
  // ✅ Ahora es true si es ADMIN o AGENTE
  const puedeModificar = user?.rol === "ADMIN" || user?.rol === "AGENTE";
  const { data: estados = [] } = useQuery({
    queryKey: ["estados"],
    queryFn: getEstados,
  });
  const { data: servicios = [] } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });
  const { data: sedes = [] } = useQuery({
    queryKey: ["sedes"],
    queryFn: getSedes,
  });
  const [soloActivos, setSoloActivos] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminoDebounce(terminoBusqueda);
      setPagina(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [terminoBusqueda]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "casos",
      terminoDebounce,
      filtroEstado,
      filtroServicio,
      filtroSede,
      filtroFechaDesde,
      filtroFechaHasta,
      soloActivos,
      pagina,
      tamanio,
    ],
    queryFn: () =>
      getCasosFiltrados(
        terminoDebounce,
        filtroEstado,
        filtroServicio,
        filtroSede,
        filtroFechaDesde,
        filtroFechaHasta,
        soloActivos,
        pagina,
        tamanio,
      ),
  });

  const fechaParaInput = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
  };

  const aplicarRangoRapido = (dias: number | null) => {
    if (dias === null) {
      setFiltroFechaDesde("");
      setFiltroFechaHasta("");
    } else {
      const hasta = new Date();
      const desde = new Date();
      desde.setDate(desde.getDate() - dias + 1);
      setFiltroFechaDesde(fechaParaInput(desde));
      setFiltroFechaHasta(fechaParaInput(hasta));
    }
    setPagina(0);
  };

  const limpiarFiltros = () => {
    setFiltroEstado(null);
    setFiltroServicio(null);
    setFiltroSede(null);
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setTerminoBusqueda("");
    setTerminoDebounce("");
    setSoloActivos(true);
    setPagina(0);
  };

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      const archivo = await descargarCasosExcel(
        terminoBusqueda.trim(),
        filtroEstado,
        filtroServicio,
        filtroSede,
        filtroFechaDesde,
        filtroFechaHasta,
        soloActivos,
      );
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `casos_trazabilidad_${fechaParaInput(new Date())}.xlsx`;
      enlace.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (error) {
      console.error("Error exportando a Excel:", error);
      alert("Error al exportar a Excel");
    } finally {
      setExportando(false);
    }
  };

  const segundosRestantes = (caso: Caso) => {
    if (typeof caso.segundosAnsRestantes === "number") return caso.segundosAnsRestantes;
    if (!caso.fechaVencimiento) return null;
    return Math.floor((new Date(caso.fechaVencimiento).getTime() - Date.now()) / 1000);
  };

  const getTiempoRestanteColor = (caso: Caso) => {
    const segundos = segundosRestantes(caso);
    if (segundos == null) return "text-gray-500";
    const horasRestantes = segundos / 3600;
    if (segundos <= 0) return "text-red-600 font-bold";
    if (horasRestantes < 4) return "text-orange-600 font-bold";
    if (horasRestantes < 12) return "text-yellow-600";
    return "text-green-700";
  };

  const formatearTiempoRestante = (caso: Caso) => {
    const segundos = segundosRestantes(caso);
    if (segundos == null) return "—";
    if (segundos <= 0) return "VENCIDO";
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas} h ${minutos} min`;
  };

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
        <p className="mt-1 text-slate-500">
          Gestión y seguimiento de incidentes
        </p>
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
        {isLoading && (
          <p className="mt-2 text-sm text-slate-500">Buscando...</p>
        )}
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Filtros</h2>
            <p className="mt-0.5 text-sm text-slate-500">Combina criterios o usa un periodo rápido.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => aplicarRangoRapido(7)} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">7 días</button>
            <button onClick={() => aplicarRangoRapido(30)} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">30 días</button>
            <button onClick={() => aplicarRangoRapido(90)} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">90 días</button>
            <button onClick={() => aplicarRangoRapido(null)} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">Todo</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm font-medium text-slate-600">
            Estado
            <select value={filtroEstado ?? ""} onChange={(e) => { setFiltroEstado(e.target.value ? Number(e.target.value) : null); setPagina(0); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800">
              <option value="">Todos los estados</option>
              {estados.map((estado) => <option key={estado.id} value={estado.id}>{estado.nombre}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Servicio / proyecto
            <select value={filtroServicio ?? ""} onChange={(e) => { setFiltroServicio(e.target.value ? Number(e.target.value) : null); setPagina(0); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800">
              <option value="">Todos los servicios</option>
              {servicios.map((servicio) => <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Sede
            <select value={filtroSede ?? ""} onChange={(e) => { setFiltroSede(e.target.value ? Number(e.target.value) : null); setPagina(0); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800">
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => <option key={sede.id} value={sede.id}>{sede.sban} - {sede.nombreSede}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Desde
            <input type="date" value={filtroFechaDesde} max={filtroFechaHasta || undefined} onChange={(e) => { setFiltroFechaDesde(e.target.value); setPagina(0); }} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-slate-800" />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Hasta
            <input type="date" value={filtroFechaHasta} min={filtroFechaDesde || undefined} onChange={(e) => { setFiltroFechaHasta(e.target.value); setPagina(0); }} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-slate-800" />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={soloActivos} onChange={(e) => { setSoloActivos(e.target.checked); setPagina(0); }} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
            Solo casos activos (ABIERTO y ESCALADO)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">{isLoading ? "Actualizando resultados..." : `${casos.length} de ${totalElementos} casos`}</span>
            <button onClick={limpiarFiltros} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              <RotateCcw size={15} /> Limpiar filtros
            </button>
            <button onClick={handleExportarExcel} disabled={exportando} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
              <Download size={16} /> {exportando ? "Preparando Excel..." : "Exportar casos e historial"}
            </button>
          </div>
        </div>
      </section>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Caso
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Servicio
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Sede
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                SBAN
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Descripción
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Creado por
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Actualizado por
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Tiempo restante
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {casos.map((caso: Caso) => (
              <tr key={caso.id} className="border-t hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {caso.numeroCasoInt}
                </td>
                <td className="px-6 py-4 text-slate-600">{caso.servicio}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoColor(caso.estado)}`}
                  >
                    {caso.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{caso.sede}</td>
                <td className="px-6 py-4 font-semibold text-blue-600">
                  {caso.sban}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {caso.descripcionFalla}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {caso.creadoPorNombre
                    ? `${caso.creadoPorNombre} ${caso.creadoPorApellido ?? ""}`
                    : "—"}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {caso.actualizadoPorNombre
                    ? `${caso.actualizadoPorNombre} ${caso.actualizadoPorApellido ?? ""}`
                    : "—"}
                </td>
                <td
                  className={`px-6 py-4 font-medium ${getTiempoRestanteColor(caso)}`}
                >
                  {formatearTiempoRestante(caso)}
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
                    {puedeModificar && (
                      <>
                        <button
                          onClick={() => navigate(`/casos/${caso.id}/editar`)}
                          className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `¿Eliminar el caso ${caso.numeroCasoInt}?`,
                              )
                            ) {
                              deleteMutation.mutate(caso.id);
                            }
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {casos.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-8 text-center text-slate-500"
                >
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
          <span>
            Mostrando {casos.length} de {totalElementos} casos
          </span>
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

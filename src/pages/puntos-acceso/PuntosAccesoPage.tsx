import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPuntosPaginados,
  getSbansDisponibles,
  getRegionalesDisponibles,
  getTiposDisponibles,
  getProyectosDisponibles,
  eliminarPuntoAcceso,
  sincronizarPuntosAActivos,
} from "../../api/puntosAcceso";
import type { PuntoAcceso } from "../../types/PuntoAcceso";
import { useAuth } from "../../context/AuthContext";
import {
  Trash2, Loader2, Search, ChevronLeft, ChevronRight,
  Upload, Server, Wifi, Cpu, RefreshCw,
} from "lucide-react";
import { CargaPuntosAccesoModal } from "../../components/puntos-acceso/CargaPuntosAccesoModal";

export const PuntosAccesoPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const esAdmin = user?.rol === "ADMIN";

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [terminoDebounce, setTerminoDebounce] = useState("");
  const [filtroSban, setFiltroSban] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroRegional, setFiltroRegional] = useState<string | null>(null);
  const [filtroProyecto, setFiltroProyecto] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [tamanio] = useState(20);
  const [mostrarCarga, setMostrarCarga] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminoDebounce(terminoBusqueda);
      setPagina(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [terminoBusqueda]);

  const { data, isLoading } = useQuery({
    queryKey: ["puntos-acceso", terminoDebounce, filtroSban, filtroTipo, filtroRegional, filtroProyecto, pagina, tamanio],
    queryFn: () => getPuntosPaginados(terminoDebounce, filtroSban, filtroTipo, filtroRegional, filtroProyecto, pagina, tamanio),
    enabled: esAdmin,
  });

  const { data: sbans } = useQuery({
    queryKey: ["puntos-acceso", "sbans"],
    queryFn: getSbansDisponibles,
    enabled: esAdmin,
  });

  const { data: regionales } = useQuery({
    queryKey: ["puntos-acceso", "regionales"],
    queryFn: getRegionalesDisponibles,
    enabled: esAdmin,
  });

  const { data: tipos } = useQuery({
    queryKey: ["puntos-acceso", "tipos"],
    queryFn: getTiposDisponibles,
    enabled: esAdmin,
  });

  const { data: proyectos } = useQuery({
    queryKey: ["puntos-acceso", "proyectos"],
    queryFn: getProyectosDisponibles,
    enabled: esAdmin,
  });

  const puntos: PuntoAcceso[] = data?.content ?? [];
  const totalPaginas = data?.totalPages ?? 0;
  const totalElementos = data?.totalElements ?? 0;

  const mutationEliminar = useMutation({
    mutationFn: eliminarPuntoAcceso,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["puntos-acceso"] }),
    onError: (error: any) => alert(error.response?.data?.message || "Error al eliminar"),
  });

  const mutationSync = useMutation({
    mutationFn: sincronizarPuntosAActivos,
    onSuccess: (data) => {
      alert(data.mensaje);
      queryClient.invalidateQueries({ queryKey: ["activos"] });
      queryClient.invalidateQueries({ queryKey: ["puntos-acceso"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Error al sincronizar");
    },
  });

  if (!esAdmin) return <div className="p-6 text-red-600">No autorizado</div>;

  const getTipoIcon = (tipo: string) => {
    if (tipo === "CONTROLADORA") return <Server size={14} className="text-purple-600" />;
    if (tipo === "LECTORA") return <Wifi size={14} className="text-blue-600" />;
    return <Cpu size={14} className="text-slate-500" />;
  };

  const getTipoBadge = (tipo: string) => {
    if (tipo === "CONTROLADORA") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
          {getTipoIcon(tipo)} CONTROLADORA
        </span>
      );
    }
    if (tipo === "LECTORA") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
          {getTipoIcon(tipo)} LECTORA
        </span>
      );
    }
    return <span className="text-xs">{tipo}</span>;
  };

  return (
    <div className="p-6">
      {/* ✅ Header con título + botones alineados a la derecha */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventario CAS 1528 / CAS 1528A</h1>
          <p className="mt-1 text-slate-500">Controladoras y lectoras separadas por proyecto</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm("¿Actualizar el inventario CAS 1528 y CAS 1528A desde los puntos de acceso? Se actualizarán los proyectos y datos de los activos existentes.")) {
                mutationSync.mutate();
              }
            }}
            disabled={mutationSync.isPending}
            className="flex items-center gap-2 rounded-lg border border-green-600 px-4 py-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
          >
            {mutationSync.isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw size={16} /> Actualizar inventario CAS
              </>
            )}
          </button>
          <button
            onClick={() => setMostrarCarga(true)}
            className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
          >
            <Upload size={16} /> Cargar archivo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por serie, MAC, placa, área..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="w-full pl-10 rounded-lg border p-2"
          />
        </div>
        <select
          value={filtroSban ?? ""}
          onChange={(e) => { setFiltroSban(e.target.value || null); setPagina(0); }}
          className="rounded-lg border p-2"
        >
          <option value="">Todas las sedes</option>
          {sbans?.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filtroTipo ?? ""}
          onChange={(e) => { setFiltroTipo(e.target.value || null); setPagina(0); }}
          className="rounded-lg border p-2"
        >
          <option value="">Todos los tipos</option>
          {tipos?.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filtroRegional ?? ""}
          onChange={(e) => { setFiltroRegional(e.target.value || null); setPagina(0); }}
          className="rounded-lg border p-2"
        >
          <option value="">Todas las regionales</option>
          {regionales?.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filtroProyecto ?? ""}
          onChange={(e) => { setFiltroProyecto(e.target.value || null); setPagina(0); }}
          className="rounded-lg border p-2"
        >
          <option value="">Todos los proyectos</option>
          {proyectos?.map((proyecto) => <option key={proyecto} value={proyecto}>{proyecto}</option>)}
        </select>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Serie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Placa</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">MAC</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">SBAN</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Oficina</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Área</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Piso</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Regional</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Proyecto</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {puntos.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.serie}</td>
                    <td className="px-4 py-3">{getTipoBadge(p.tipo)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.placa ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{p.mac ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-medium">{p.sban ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{p.oficina ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{p.area ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.piso ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.regional ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-violet-700">{p.proyecto?.toUpperCase().includes("1528A") ? "CAS 1528A" : p.proyecto?.toUpperCase().includes("1528") ? "CAS 1528" : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el dispositivo "${p.serie}"?`)) {
                            mutationEliminar.mutate(p.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {puntos.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron puntos de acceso
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Mostrando {puntos.length} de {totalElementos}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={pagina === 0}
                className="flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-sm text-slate-600">
                Página {pagina + 1} de {totalPaginas || 1}
              </span>
              <button
                onClick={() => setPagina((p) => p + 1)}
                disabled={pagina >= totalPaginas - 1}
                className="flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {mostrarCarga && (
        <CargaPuntosAccesoModal onClose={() => setMostrarCarga(false)} />
      )}
    </div>
  );
};

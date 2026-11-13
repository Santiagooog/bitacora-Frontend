import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Search,
  Ticket,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getEstados, getServicios } from "../../api/Catalogos";
import { getDashboard } from "../../api/dashboard";
import type { Catalogo } from "../../types/Catalogo";
import type { DashboardFilters } from "../../types/Dashboard";
import { exportarHojasAExcel } from "../../utils/exportExcel";

type Periodo = "7" | "30" | "90" | "year" | "all" | "custom";

const coloresEstado: Record<string, string> = {
  ABIERTO: "#3b82f6",
  "EN PROCESO": "#8b5cf6",
  ESCALADO: "#f59e0b",
  SOLUCIONADO: "#10b981",
  CERRADO: "#64748b",
};

const fechaParaInput = (fecha: Date) => {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
};

const rangoInicial = () => {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - 29);
  return { desde: fechaParaInput(desde), hasta: fechaParaInput(hasta) };
};

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime())
    ? "Sin fecha"
    : valor.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
};

const TarjetaIndicador = ({
  titulo,
  valor,
  detalle,
  icono: Icono,
  tono,
}: {
  titulo: string;
  valor: number;
  detalle: string;
  icono: typeof Ticket;
  tono: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{titulo}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{valor}</p>
        <p className="mt-1 text-xs text-slate-500">{detalle}</p>
      </div>
      <span className={`rounded-xl p-3 ${tono}`}><Icono size={20} /></span>
    </div>
  </div>
);

export const DashboardPage = () => {
  const inicial = useMemo(rangoInicial, []);
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [servicioId, setServicioId] = useState("");
  const [estadoId, setEstadoId] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [terminoDebounce, setTerminoDebounce] = useState("");
  const [fechaDesde, setFechaDesde] = useState(inicial.desde);
  const [fechaHasta, setFechaHasta] = useState(inicial.hasta);

  const { data: servicios = [] } = useQuery<Catalogo[]>({
    queryKey: ["servicios"], queryFn: getServicios,
  });
  const { data: estados = [] } = useQuery<Catalogo[]>({
    queryKey: ["estados"], queryFn: getEstados,
  });

  useEffect(() => {
    const timer = setTimeout(() => setTerminoDebounce(busqueda.trim()), 350);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const filtros = useMemo<DashboardFilters>(() => ({
    termino: terminoDebounce,
    servicioId: servicioId ? Number(servicioId) : null,
    estadoId: estadoId ? Number(estadoId) : null,
    fechaDesde: fechaDesde || null,
    fechaHasta: fechaHasta || null,
  }), [terminoDebounce, servicioId, estadoId, fechaDesde, fechaHasta]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["dashboard", filtros],
    queryFn: () => getDashboard(filtros),
  });

  const dataPorEstado = Object.entries(data?.casosPorEstado || {}).map(([nombre, valor]) => ({ nombre, valor }));
  const dataPorServicio = Object.entries(data?.casosPorServicio || {}).map(([nombre, valor]) => ({ nombre, valor }));
  const dataPorSede = Object.entries(data?.casosPorSede || {}).map(([nombre, valor]) => ({ nombre, valor }));
  const tendenciaMensual = useMemo(() => {
    const porMes = data?.casosPorMes || {};
    const hoy = new Date();
    return Array.from({ length: 6 }, (_, indice) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - 5 + indice, 1);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      return {
        mes: fecha.toLocaleDateString("es-CO", { month: "short" }),
        casos: porMes[clave] || 0,
      };
    });
  }, [data?.casosPorMes]);
  const casosRecientes = data?.casosRecientes || [];
  const [graficaExportando, setGraficaExportando] = useState<string | null>(null);

  const exportarGraficaPng = (id: string, nombreArchivo: string) => {
    const svg = document.querySelector<SVGSVGElement>(`#${id} svg`);
    if (!svg) {
      alert("No se encontró la gráfica para exportar.");
      return;
    }

    const caja = svg.getBoundingClientRect();
    const ancho = Math.max(1, Math.ceil(caja.width));
    const alto = Math.max(1, Math.ceil(caja.height));
    const grafica = svg.cloneNode(true) as SVGSVGElement;
    const vistaOriginal = svg.getAttribute("viewBox");
    grafica.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    grafica.setAttribute("width", String(ancho));
    grafica.setAttribute("height", String(alto));
    if (vistaOriginal) {
      grafica.setAttribute("viewBox", vistaOriginal);
    } else {
      grafica.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
    }
    const nodosOriginales = [svg, ...Array.from(svg.querySelectorAll("*"))];
    const nodosClonados = [grafica, ...Array.from(grafica.querySelectorAll("*"))];
    nodosOriginales.forEach((nodo, indice) => {
      const estilo = window.getComputedStyle(nodo);
      const clon = nodosClonados[indice];
      ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity", "font-size", "font-family", "font-style", "font-weight", "letter-spacing", "text-anchor", "dominant-baseline", "visibility"].forEach((propiedad) => {
        const valor = estilo.getPropertyValue(propiedad);
        if (valor) clon?.setAttribute(propiedad, valor);
      });
    });

    const urlSvg = URL.createObjectURL(new Blob(
      [new XMLSerializer().serializeToString(grafica)],
      { type: "image/svg+xml;charset=utf-8" },
    ));
    const imagen = new Image();
    setGraficaExportando(id);
    imagen.onload = () => {
      const escala = 2;
      const canvas = document.createElement("canvas");
      canvas.width = ancho * escala;
      canvas.height = alto * escala;
      const contexto = canvas.getContext("2d");
      if (!contexto) {
        URL.revokeObjectURL(urlSvg);
        setGraficaExportando(null);
        alert("El navegador no pudo preparar la imagen.");
        return;
      }
      contexto.fillStyle = "#ffffff";
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(urlSvg);
        setGraficaExportando(null);
        if (!blob) {
          alert("No se pudo generar el archivo PNG.");
          return;
        }
        const urlPng = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = urlPng;
        enlace.download = `${nombreArchivo}_${fechaParaInput(new Date())}.png`;
        enlace.click();
        window.setTimeout(() => URL.revokeObjectURL(urlPng), 1_000);
      }, "image/png");
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(urlSvg);
      setGraficaExportando(null);
      alert("No se pudo convertir la gráfica a PNG.");
    };
    imagen.src = urlSvg;
  };

  const botonExportarGrafica = (id: string, nombre: string) => (
    <button
      type="button"
      onClick={() => exportarGraficaPng(id, nombre)}
      disabled={graficaExportando !== null}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
      aria-label={`Descargar gráfica ${nombre} en PNG`}
      title="Descargar gráfica como PNG"
    >
      <Download size={14} /> {graficaExportando === id ? "Preparando..." : "PNG"}
    </button>
  );

  const exportarDashboard = () => {
    const fechaExportacion = new Date().toLocaleString("es-CO");
    const resumen: Record<string, unknown>[] = [
      { Indicador: "Fecha de exportación", Valor: fechaExportacion },
      { Indicador: "Periodo", Valor: periodo === "custom" ? `${fechaDesde || "Sin límite"} a ${fechaHasta || "Sin límite"}` : periodo },
      { Indicador: "Servicio", Valor: servicios.find((item) => String(item.id) === servicioId)?.nombre || "Todos" },
      { Indicador: "Estado", Valor: estados.find((item) => String(item.id) === estadoId)?.nombre || "Todos" },
      { Indicador: "Búsqueda", Valor: terminoDebounce || "Sin filtro" },
      { Indicador: "Casos en filtro", Valor: data?.totalCasos ?? 0 },
      { Indicador: "Casos activos", Valor: data?.casosActivos ?? 0 },
      { Indicador: "Escalados", Valor: data?.casosEscalados ?? 0 },
      { Indicador: "ANS vencidos", Valor: data?.ansVencidos ?? 0 },
    ];
    exportarHojasAExcel([
      { nombre: "Resumen", datos: resumen, encabezados: ["Indicador", "Valor"] },
      { nombre: "Por estado", datos: dataPorEstado.map(({ nombre, valor }) => ({ Estado: nombre, Casos: valor })), encabezados: ["Estado", "Casos"] },
      { nombre: "Por servicio", datos: dataPorServicio.map(({ nombre, valor }) => ({ Servicio: nombre, Casos: valor })), encabezados: ["Servicio", "Casos"] },
      { nombre: "Por sede", datos: dataPorSede.map(({ nombre, valor }) => ({ Sede: nombre, Casos: valor })), encabezados: ["Sede", "Casos"] },
      { nombre: "Tendencia mensual", datos: tendenciaMensual.map(({ mes, casos }) => ({ Mes: mes, Casos: casos })), encabezados: ["Mes", "Casos"] },
      { nombre: "Casos recientes", datos: casosRecientes.map((caso) => ({ Caso: caso.numeroCasoInt, Servicio: caso.servicio, Sede: `${caso.sban} - ${caso.sede}`, Estado: caso.estado, Fecha: caso.fechaSolicitud })), encabezados: ["Caso", "Servicio", "Sede", "Estado", "Fecha"] },
    ], `dashboard_${fechaParaInput(new Date())}`);
  };

  const cambiarPeriodo = (nuevoPeriodo: Periodo) => {
    setPeriodo(nuevoPeriodo);
    if (nuevoPeriodo === "custom") return;
    if (nuevoPeriodo === "all") {
      setFechaDesde("");
      setFechaHasta("");
      return;
    }
    const hasta = new Date();
    const desde = nuevoPeriodo === "year"
      ? new Date(hasta.getFullYear(), 0, 1)
      : new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate() - Number(nuevoPeriodo) + 1);
    setFechaDesde(fechaParaInput(desde));
    setFechaHasta(fechaParaInput(hasta));
  };

  const limpiarFiltros = () => {
    setPeriodo("30");
    setServicioId("");
    setEstadoId("");
    setBusqueda("");
    setTerminoDebounce("");
    setFechaDesde(inicial.desde);
    setFechaHasta(inicial.hasta);
  };

  if (isLoading) return <p className="p-6 text-slate-600">Cargando indicadores...</p>;
  if (isError || !data) {
    return (
      <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-semibold">No se pudieron cargar los indicadores.</p>
        <button onClick={() => void refetch()} className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white">Reintentar</button>
      </div>
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Resumen operativo</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Indicadores calculados en el servidor según los filtros.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportarDashboard} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"><Download size={16} /> Exportar Excel</button>
          <button onClick={() => void refetch()} disabled={isFetching} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {isFetching ? "Actualizando..." : "Actualizar datos"}
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-800"><CalendarDays size={18} className="text-blue-700" /><h2 className="font-semibold">Filtros del dashboard</h2></div>
          <button onClick={limpiarFiltros} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"><X size={15} /> Limpiar filtros</button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm font-medium text-slate-600">Periodo
            <select value={periodo} onChange={(e) => cambiarPeriodo(e.target.value as Periodo)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800">
              <option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="year">Este año</option><option value="all">Todo el historial</option><option value="custom">Rango personalizado</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">Servicio
            <select value={servicioId} onChange={(e) => setServicioId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800">
              <option value="">Todos los servicios</option>{servicios.map((servicio) => <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">Estado
            <select value={estadoId} onChange={(e) => setEstadoId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800">
              <option value="">Todos los estados</option>{estados.map((estado) => <option key={estado.id} value={estado.id}>{estado.nombre}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">Buscar caso o sede
            <span className="relative mt-1 block"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Número, SBAN, sede o descripción" className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-slate-800" /></span>
          </label>
          <div className="text-sm font-medium text-slate-600">Fechas
            {periodo === "custom" ? (
              <div className="mt-1 grid grid-cols-2 gap-2"><input aria-label="Fecha desde" type="date" value={fechaDesde} max={fechaHasta || undefined} onChange={(e) => setFechaDesde(e.target.value)} className="min-w-0 rounded-lg border border-slate-300 p-2 text-slate-800" /><input aria-label="Fecha hasta" type="date" value={fechaHasta} min={fechaDesde || undefined} onChange={(e) => setFechaHasta(e.target.value)} className="min-w-0 rounded-lg border border-slate-300 p-2 text-slate-800" /></div>
            ) : <p className="mt-1 rounded-lg bg-slate-50 p-2.5 text-slate-500">Aplicadas por periodo</p>}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">{isFetching ? "Actualizando resultados..." : `${data.totalCasos} casos coinciden con los filtros`}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaIndicador titulo="Casos en el filtro" valor={data.totalCasos} detalle="Coinciden con los criterios seleccionados" icono={Ticket} tono="bg-blue-50 text-blue-700" />
        <TarjetaIndicador titulo="Casos activos" valor={data.casosActivos} detalle="Abiertos, en proceso o escalados" icono={Activity} tono="bg-violet-50 text-violet-700" />
        <TarjetaIndicador titulo="Escalados" valor={data.casosEscalados} detalle="Requieren seguimiento especializado" icono={Clock3} tono="bg-amber-50 text-amber-700" />
        <TarjetaIndicador titulo="ANS vencidos" valor={data.ansVencidos} detalle="Casos activos fuera de su fecha límite" icono={AlertTriangle} tono="bg-red-50 text-red-700" />
      </section>

      {data.totalCasos === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={32} /><h2 className="mt-3 font-semibold text-slate-800">No hay casos para estos filtros</h2><p className="mt-1 text-sm text-slate-500">Prueba otro periodo, servicio, estado o búsqueda.</p></section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Tendencia de casos</h2><p className="mb-4 text-sm text-slate-500">Solicitudes recibidas por mes · últimos seis meses</p></div>{botonExportarGrafica("grafica-tendencia", "tendencia_casos")}</div><div id="grafica-tendencia"><ResponsiveContainer width="100%" height={280}><LineChart data={tendenciaMensual} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="mes" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="casos" name="Casos" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb" }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Casos por estado</h2><p className="mb-4 text-sm text-slate-500">Distribución del resultado del filtro actual</p></div>{botonExportarGrafica("grafica-estado", "casos_por_estado")}</div><div id="grafica-estado"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={dataPorEstado} dataKey="valor" nameKey="nombre" innerRadius={62} outerRadius={96} paddingAngle={3}>{dataPorEstado.map((item) => <Cell key={item.nombre} fill={coloresEstado[item.nombre.toUpperCase()] || "#94a3b8"} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer></div></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Casos por servicio</h2><p className="mb-4 text-sm text-slate-500">Volumen por proyecto o servicio</p></div>{botonExportarGrafica("grafica-servicio", "casos_por_servicio")}</div><div id="grafica-servicio"><ResponsiveContainer width="100%" height={280}><BarChart data={dataPorServicio} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="nombre" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="valor" name="Casos" fill="#10b981" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Sedes con más casos</h2><p className="mb-4 text-sm text-slate-500">Top 8 sedes del filtro actual</p></div>{botonExportarGrafica("grafica-sede", "casos_por_sede")}</div><div id="grafica-sede"><ResponsiveContainer width="100%" height={280}><BarChart data={dataPorSede} layout="vertical" margin={{ top: 4, right: 18, left: 12, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="valor" name="Casos" fill="#f59e0b" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div></div>
          </section>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Casos recientes</h2><p className="text-sm text-slate-500">Últimos casos según los filtros aplicados</p></div><Link to="/casos" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Ver todos</Link></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Caso</th><th className="px-5 py-3">Servicio</th><th className="px-5 py-3">Sede</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Fecha</th></tr></thead><tbody className="divide-y divide-slate-100">{casosRecientes.map((caso) => <tr key={caso.id} className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold text-blue-700"><Link to={`/casos/${caso.id}`}>{caso.numeroCasoInt}</Link></td><td className="px-5 py-3 text-slate-700">{caso.servicio}</td><td className="px-5 py-3 text-slate-700">{caso.sban} - {caso.sede}</td><td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{caso.estado}</span></td><td className="px-5 py-3 text-slate-500">{formatearFecha(caso.fechaSolicitud)}</td></tr>)}</tbody></table></div>
          </section>
        </>
      )}
    </main>
  );
};

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSedesPaginadas,
  getRegionales,
  crearSede,
  actualizarSede,
  eliminarSede,
} from "../../api/sedes";
import type { Sede } from "../../types/Sede";
import { useAuth } from "../../context/AuthContext";
import {
  Plus, Pencil, Trash2, Loader2, Check, X, Search,
  ChevronLeft, ChevronRight, Upload,
} from "lucide-react";
import { CargaSedesModal } from "../../components/sedes/CargaSedesModal";

export const SedesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const esAdmin = user?.rol === "ADMIN";

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [terminoDebounce, setTerminoDebounce] = useState("");
  const [filtroRegional, setFiltroRegional] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [tamanio] = useState(20);
  const [mostrarCarga, setMostrarCarga] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    sban: "",
    nombreSede: "",
    municipio: "",
    regional: "",
    departamento: "",
    direccion: "",
    horario: "",
    atencion: "",
  });

  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Sede>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminoDebounce(terminoBusqueda);
      setPagina(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [terminoBusqueda]);

  const { data, isLoading } = useQuery({
    queryKey: ["sedes", terminoDebounce, filtroRegional, pagina, tamanio],
    queryFn: () => getSedesPaginadas(terminoDebounce, filtroRegional, pagina, tamanio),
    enabled: esAdmin,
  });

  const { data: regionales } = useQuery({
    queryKey: ["regionales"],
    queryFn: getRegionales,
    enabled: esAdmin,
  });

  const sedes: Sede[] = data?.content ?? [];
  const totalPaginas = data?.totalPages ?? 0;
  const totalElementos = data?.totalElements ?? 0;

  const mutationCrear = useMutation({
    mutationFn: () => crearSede(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sedes"] });
      queryClient.invalidateQueries({ queryKey: ["regionales"] });
      setForm({ sban: "", nombreSede: "", municipio: "", regional: "", departamento: "", direccion: "", horario: "", atencion: "" });
      setMostrarForm(false);
    },
    onError: (error: any) => alert(error.response?.data?.message || "Error al crear la sede"),
  });

  const mutationActualizar = useMutation({
    mutationFn: (id: number) => actualizarSede(id, editForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sedes"] });
      setIdEditando(null);
    },
    onError: (error: any) => alert(error.response?.data?.message || "Error al actualizar"),
  });

  const mutationEliminar = useMutation({
    mutationFn: eliminarSede,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sedes"] }),
    onError: (error: any) => alert(error.response?.data?.message || "Error al eliminar"),
  });

  if (!esAdmin) return <div className="p-6 text-red-600">No autorizado</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sedes</h1>
          <p className="mt-1 text-slate-500">Gestión de sedes y ubicaciones</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarCarga(true)}
            className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
          >
            <Upload size={16} /> Cargar archivo
          </button>
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Nueva sede
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 font-semibold text-blue-900">Crear nueva sede</h3>
          <div className="grid grid-cols-4 gap-3">
            <input placeholder="SBAN *" value={form.sban}
              onChange={(e) => setForm({ ...form, sban: e.target.value })}
              className="rounded-lg border p-2" />
            <input placeholder="Nombre sede *" value={form.nombreSede}
              onChange={(e) => setForm({ ...form, nombreSede: e.target.value })}
              className="rounded-lg border p-2 col-span-2" />
            <input placeholder="Regional" value={form.regional}
              onChange={(e) => setForm({ ...form, regional: e.target.value })}
              className="rounded-lg border p-2" />
            <input placeholder="Municipio" value={form.municipio}
              onChange={(e) => setForm({ ...form, municipio: e.target.value })}
              className="rounded-lg border p-2" />
            <input placeholder="Departamento" value={form.departamento}
              onChange={(e) => setForm({ ...form, departamento: e.target.value })}
              className="rounded-lg border p-2" />
            <input placeholder="Dirección" value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="rounded-lg border p-2 col-span-2" />
            <input placeholder="Horario" value={form.horario}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
              className="rounded-lg border p-2" />
            <input placeholder="Atención" value={form.atencion}
              onChange={(e) => setForm({ ...form, atencion: e.target.value })}
              className="rounded-lg border p-2 col-span-3" />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => mutationCrear.mutate()}
              disabled={!form.sban.trim() || !form.nombreSede.trim() || mutationCrear.isPending}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {mutationCrear.isPending ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
            </button>
            <button onClick={() => setMostrarForm(false)}
              className="rounded border border-slate-300 px-4 py-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input type="text" placeholder="Buscar por SBAN, nombre, municipio..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="w-full pl-10 rounded-lg border p-2" />
        </div>
        <select
          value={filtroRegional ?? ""}
          onChange={(e) => { setFiltroRegional(e.target.value || null); setPagina(0); }}
          className="rounded-lg border p-2"
        >
          <option value="">Todas las regionales</option>
          {regionales?.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">SBAN</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nombre sede</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Regional</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Municipio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Departamento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Dirección</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sedes.map((sede) => {
                  const editando = idEditando === sede.id;
                  return (
                    <tr key={sede.id} className="border-t">
                      <td className="px-4 py-3 font-medium text-blue-600">
                        {editando
                          ? <input value={editForm.sban ?? ""}
                              onChange={(e) => setEditForm({ ...editForm, sban: e.target.value })}
                              className="w-full rounded border p-1" />
                          : sede.sban}
                      </td>
                      <td className="px-4 py-3">
                        {editando
                          ? <input value={editForm.nombreSede ?? ""}
                              onChange={(e) => setEditForm({ ...editForm, nombreSede: e.target.value })}
                              className="w-full rounded border p-1" />
                          : sede.nombreSede}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editando
                          ? <input value={editForm.regional ?? ""}
                              onChange={(e) => setEditForm({ ...editForm, regional: e.target.value })}
                              className="w-full rounded border p-1" />
                          : sede.regional}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editando
                          ? <input value={editForm.municipio ?? ""}
                              onChange={(e) => setEditForm({ ...editForm, municipio: e.target.value })}
                              className="w-full rounded border p-1" />
                          : sede.municipio}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editando
                          ? <input value={editForm.departamento ?? ""}
                              onChange={(e) => setEditForm({ ...editForm, departamento: e.target.value })}
                              className="w-full rounded border p-1" />
                          : sede.departamento}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editando
                          ? <input value={editForm.direccion ?? ""}
                              onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                              className="w-full rounded border p-1" />
                          : sede.direccion}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editando ? (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => mutationActualizar.mutate(sede.id)}
                              className="text-green-600 hover:text-green-800">
                              <Check size={16} />
                            </button>
                            <button onClick={() => setIdEditando(null)}
                              className="text-red-600 hover:text-red-800">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => {
                              setIdEditando(sede.id);
                              setEditForm({
                                sban: sede.sban,
                                nombreSede: sede.nombreSede,
                                regional: sede.regional,
                                municipio: sede.municipio,
                                departamento: sede.departamento,
                                direccion: sede.direccion,
                                horario: sede.horario,
                                atencion: sede.atencion,
                                activa: sede.activa,
                              });
                            }} className="text-blue-600 hover:text-blue-800">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => {
                              if (confirm(`¿Eliminar la sede "${sede.nombreSede}"?`)) {
                                mutationEliminar.mutate(sede.id);
                              }
                            }} className="text-red-600 hover:text-red-800">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sedes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron sedes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Mostrando {sedes.length} de {totalElementos}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={pagina === 0}
                className="flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50">
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-sm text-slate-600">
                Página {pagina + 1} de {totalPaginas}
              </span>
              <button onClick={() => setPagina((p) => p + 1)}
                disabled={pagina >= totalPaginas - 1}
                className="flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50">
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
      {mostrarCarga && <CargaSedesModal onClose={() => setMostrarCarga(false)} />}
    </div>
  );
};
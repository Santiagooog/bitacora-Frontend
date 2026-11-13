import { useState, useEffect } from "react";
import { CargaActivosModal } from "../../components/activos/CargaActivosModal";
import { Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActivosPaginados,
  crearActivo,
  actualizarActivo,
  eliminarActivo,
  type Activo,
} from "../../api/activos";
import { useAuth } from "../../context/AuthContext";
import { getServicios } from "../../api/Catalogos";
import type { Catalogo } from "../../types/Catalogo";
import { Plus, Pencil, Trash2, Loader2, Check, X, Search, ChevronLeft, ChevronRight } from "lucide-react";

const nombreTipoServicio = (tipo: string) =>
  tipo === "CAS_1528" ? "CAS 1528" : tipo === "CAS_1528A" ? "CAS 1528A" : tipo;
const valorTipoServicio = (nombre: string) => {
  const normalizado = nombre.trim().toUpperCase().replace(/\s+/g, " ");
  if (normalizado === "CAS 1528A") return "CAS_1528A";
  if (normalizado === "CAS 1528") return "CAS_1528";
  if (["WIFI PUBLICO", "WIFI PÚBLICO", "WIFI ADMINISTRATIVO"].includes(normalizado)) return "WIFI";
  if (normalizado === "SDWAN") return "SDWAN";
  return nombre;
};

export const ActivosPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const esAdmin = user?.rol === "ADMIN";

  //Estados
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [terminoDebounce, setTerminoDebounce] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [tamanio] = useState(20);
  const [mostrarCarga, setMostrarCarga] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    serial: "",
    placa: "",
    name: "",
    sban: "",
    site: "",
    deviceType: "",
    tipoServicio: "",
    proyecto: "GENERAL",
  });

  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Activo>>({});
  const { data: servicios = [] } = useQuery<Catalogo[]>({
    queryKey: ["servicios"], queryFn: getServicios, enabled: esAdmin,
  });
  const tiposServicio = servicios.map((servicio) => servicio.nombre);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminoDebounce(terminoBusqueda);
      setPagina(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [terminoBusqueda]);

  const { data, isLoading } = useQuery({
    queryKey: ["activos", terminoDebounce, filtroTipo, pagina, tamanio],
    queryFn: () => getActivosPaginados(terminoDebounce, filtroTipo, pagina, tamanio),
    enabled: esAdmin,
  });

  const activos = data?.content ?? [];
  const totalPaginas = data?.totalPages ?? 0;
  const totalElementos = data?.totalElements ?? 0;

  const mutationCrear = useMutation({
    mutationFn: () => crearActivo(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activos"] });
      setForm({ serial: "", placa: "", name: "", sban: "", site: "", deviceType: "", tipoServicio: "", proyecto: "GENERAL" });
      setMostrarForm(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Error al crear el activo");
    },
  });

  const mutationActualizar = useMutation({
    mutationFn: (id: number) => actualizarActivo(id, editForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activos"] });
      setIdEditando(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Error al actualizar");
    },
  });

  const mutationEliminar = useMutation({
    mutationFn: eliminarActivo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activos"] }),
    onError: (error: any) => {
      alert(error.response?.data?.message || "Error al eliminar");
    },
  });

  if (!esAdmin) return <div className="p-6 text-red-600">No autorizado</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activos</h1>
          <p className="mt-1 text-slate-500">Gestión de equipos y dispositivos</p>
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
            <Plus size={16} /> Nuevo activo
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 font-semibold text-blue-900">Crear nuevo activo</h3>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Serial *"
              value={form.serial}
              onChange={(e) => setForm({ ...form, serial: e.target.value })}
              className="rounded-lg border p-2"
            />
            <input
              placeholder="Placa"
              value={form.placa}
              onChange={(e) => setForm({ ...form, placa: e.target.value })}
              className="rounded-lg border p-2"
            />
            <input
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border p-2"
            />
            <input
              placeholder="SBAN"
              value={form.sban}
              onChange={(e) => setForm({ ...form, sban: e.target.value })}
              className="rounded-lg border p-2"
            />
            <input
              placeholder="Site"
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
              className="rounded-lg border p-2"
            />
            <input
              placeholder="Tipo de dispositivo"
              value={form.deviceType}
              onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
              className="rounded-lg border p-2"
            />
            <select
              value={form.tipoServicio}
              onChange={(e) => setForm({ ...form, tipoServicio: e.target.value })}
              className="rounded-lg border p-2"
            >
              <option value="">Seleccione un servicio</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={valorTipoServicio(servicio.nombre)}>{servicio.nombre}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => mutationCrear.mutate()}
              disabled={!form.serial.trim() || !form.tipoServicio || mutationCrear.isPending}
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

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por serial, nombre, SBAN o site..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="w-full pl-10 rounded-lg border p-2"
          />
        </div>
        <select
          value={filtroTipo ?? ""}
          onChange={(e) => {
            setFiltroTipo(e.target.value || null);
            setPagina(0);
          }}
          className="rounded-lg border p-2"
        >
          <option value="">Todos los tipos</option>
          {servicios.map((servicio) => (
            <option key={servicio.id} value={valorTipoServicio(servicio.nombre)}>{servicio.nombre}</option>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold">Serial</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Placa</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">SBAN</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Site</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tipo Disp.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Servicio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Proyecto</th> {/* ✅ Nueva Columna */}
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activos.map((activo: Activo) => {
                  const editando = idEditando === activo.id;
                  return (
                    <tr key={activo.id} className="border-t">
                      <td className="px-4 py-3 font-medium text-blue-600">
                        {editando ? (
                          <input
                            value={editForm.serial ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, serial: e.target.value })}
                            className="w-full rounded border p-1"
                          />
                        ) : activo.serial}
                      </td>
                      <td className="px-4 py-3">
                        {editando ? (
                          <input
                            value={editForm.placa ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, placa: e.target.value })}
                            className="w-full rounded border p-1"
                          />
                        ) : (activo.placa || "—")}
                      </td>
                      <td className="px-4 py-3">
                        {editando ? (
                          <input
                            value={editForm.name ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full rounded border p-1"
                          />
                        ) : activo.name}
                      </td>
                      <td className="px-4 py-3">
                        {editando ? (
                          <input
                            value={editForm.sban ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, sban: e.target.value })}
                            className="w-full rounded border p-1"
                          />
                        ) : activo.sban}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editando ? (
                          <input
                            value={editForm.site ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, site: e.target.value })}
                            className="w-full rounded border p-1"
                          />
                        ) : activo.site}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editando ? (
                          <input
                            value={editForm.deviceType ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, deviceType: e.target.value })}
                            className="w-full rounded border p-1"
                          />
                        ) : activo.deviceType}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editando ? (
                          <select
                            value={editForm.tipoServicio ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, tipoServicio: e.target.value })}
                            className="w-full rounded border p-1"
                          >
                            {editForm.tipoServicio && !tiposServicio.includes(editForm.tipoServicio) && <option value={editForm.tipoServicio}>{nombreTipoServicio(editForm.tipoServicio)}</option>}
                            {servicios.map((servicio) => (
                              <option key={servicio.id} value={valorTipoServicio(servicio.nombre)}>{servicio.nombre}</option>
                            ))}
                          </select>
                        ) : nombreTipoServicio(activo.tipoServicio)}
                      </td>
                      {/* ✅ Nueva Celda de Proyecto (Editable) */}
                      <td className="px-4 py-3 text-sm">
                        {editando ? (
                          <select
                            value={editForm.proyecto ?? "GENERAL"}
                            onChange={(e) => setEditForm({ ...editForm, proyecto: e.target.value })}
                            className="w-full rounded border p-1"
                          >
                            <option value="GENERAL">GENERAL</option>
                            <option value="A">A</option>
                            <option value="CAS 1528">CAS 1528</option>
                            <option value="CAS 1528A">CAS 1528A</option>
                          </select>
                        ) : (activo.proyecto || "GENERAL")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editando ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => mutationActualizar.mutate(activo.id)}
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
                                setIdEditando(activo.id);
                                setEditForm({
                                  serial: activo.serial,
                                  placa: activo.placa,
                                  name: activo.name,
                                  sban: activo.sban,
                                  site: activo.site,
                                  deviceType: activo.deviceType,
                                  tipoServicio: activo.tipoServicio,
                                  proyecto: activo.proyecto,
                                  activo: activo.activo,
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar el activo "${activo.serial}"?`)) {
                                  mutationEliminar.mutate(activo.id);
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
                {activos.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron activos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Mostrando {activos.length} de {totalElementos}
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
                Página {pagina + 1} de {totalPaginas}
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
      {mostrarCarga && <CargaActivosModal onClose={() => setMostrarCarga(false)} />}
    </div>
  );
};

import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Plus, Loader2, UserCircle } from "lucide-react";
import { getServicios } from "../../api/Catalogos";
import type { Catalogo } from "../../types/Catalogo";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  activo: boolean;
  serviciosPermitidos?: string[];
}

interface Rol {
  id: number;
  nombre: string;
}

export function UsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [servicios, setServicios] = useState<Catalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    rolId: "",
    servicioIds: [] as number[],
  });

  useEffect(() => {
    if (user?.rol !== "ADMIN") return;
    const cargarDatos = async () => {
      try {
        const [resRoles, resUsuarios, serviciosDisponibles] = await Promise.all([
          api.get("/roles"), api.get("/usuarios"), getServicios(),
        ]);
        setRoles(resRoles.data);
        setUsuarios(resUsuarios.data);
        setServicios(serviciosDisponibles);
      } catch (error) {
        console.error("Error cargando datos de usuarios", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const esAdmin = roles.find((rol) => String(rol.id) === form.rolId)?.nombre.toUpperCase() === "ADMIN";
      await api.post("/auth/register", {
        ...form,
        rolId: form.rolId ? Number(form.rolId) : null,
        servicioIds: esAdmin ? [] : form.servicioIds,
      });
      // recargar usuarios
      const resUsuarios = await api.get("/usuarios");
      setUsuarios(resUsuarios.data);
      // limpiar formulario
      setForm({ nombre: "", apellido: "", correo: "", password: "", rolId: "", servicioIds: [] });
    } catch (error) {
      console.error("Error creando usuario", error);
      alert("No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  };

  if (user?.rol !== "ADMIN") {
    return <div className="p-6 text-red-600">No autorizado</div>;
  }

  if (loading) return <div className="p-6 flex items-center gap-2"><Loader2 className="animate-spin" /> Cargando...</div>;

  const rolSeleccionado = roles.find((rol) => String(rol.id) === form.rolId)?.nombre.toUpperCase();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white rounded-xl border p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <UserCircle size={20} /> Crear nuevo usuario
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            required
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Apellido"
            value={form.apellido}
            onChange={e => setForm({ ...form, apellido: e.target.value })}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Correo"
            value={form.correo}
            onChange={e => setForm({ ...form, correo: e.target.value })}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            className="border rounded px-3 py-2"
          />
          <select
            value={form.rolId}
            onChange={e => setForm({ ...form, rolId: e.target.value })}
            required
            className="border rounded px-3 py-2"
          >
            <option value="">Selecciona rol</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.id}>{rol.nombre}</option>
            ))}
          </select>
        </div>
        {form.rolId && rolSeleccionado !== "ADMIN" && (
          <fieldset className="mt-4 rounded-lg border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-700">Proyectos habilitados *</legend>
            <p className="mb-3 text-sm text-slate-500">Selecciona los proyectos a los que podrá acceder el usuario.</p>
            {servicios.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {servicios.map((servicio) => <label key={servicio.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-2.5 hover:bg-slate-50">
                <input type="checkbox" checked={form.servicioIds.includes(servicio.id)} onChange={(event) => setForm({ ...form, servicioIds: event.target.checked ? [...form.servicioIds, servicio.id] : form.servicioIds.filter((id) => id !== servicio.id) })} />
                <span className="text-sm text-slate-700">{servicio.nombre}</span>
              </label>)}
            </div> : <p className="text-sm text-amber-700">No hay servicios configurados.</p>}
            {form.servicioIds.length === 0 && <p className="mt-2 text-xs text-red-600">Selecciona al menos un proyecto.</p>}
          </fieldset>
        )}
        <button
          type="submit"
          disabled={saving || (Boolean(form.rolId) && rolSeleccionado !== "ADMIN" && form.servicioIds.length === 0)}
          className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          Crear Usuario
        </button>
      </form>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold">Nombre</th>
              <th className="px-4 py-3 text-sm font-semibold">Correo</th>
              <th className="px-4 py-3 text-sm font-semibold">Rol</th>
              <th className="px-4 py-3 text-sm font-semibold">Proyectos</th>
              <th className="px-4 py-3 text-sm font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id} className="border-t">
                <td className="px-4 py-3">{usuario.nombre} {usuario.apellido}</td>
                <td className="px-4 py-3">{usuario.correo}</td>
                <td className="px-4 py-3">{usuario.rol}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{usuario.rol === "ADMIN" ? "Todos" : usuario.serviciosPermitidos?.join(", ") || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-sm ${usuario.activo ? 'text-green-600' : 'text-red-600'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-gray-500">No hay usuarios</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

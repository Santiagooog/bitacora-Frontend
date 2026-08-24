import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Plus, Loader2, UserCircle } from "lucide-react";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  activo: boolean;
}

interface Rol {
  id: number;
  nombre: string;
}

interface Sede {
  id: number;
  nombreSede: string;
}

export function UsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    rolId: "",
  });

  useEffect(() => {
    if (user?.rol !== "ADMIN") return;
    const cargarDatos = async () => {
      try {
        const [resRoles, resUsuarios] = await Promise.all([
  api.get("/roles"),   // ✅
  api.get("/usuarios")
]);
        setRoles(resRoles.data);
        setUsuarios(resUsuarios.data);
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
      await api.post("/auth/register", {
        ...form,
        rolId: form.rolId ? Number(form.rolId) : null,
      });
      // recargar usuarios
      const resUsuarios = await api.get("/usuarios");
      setUsuarios(resUsuarios.data);
      // limpiar formulario
      setForm({ nombre: "", apellido: "", correo: "", password: "", rolId: "" });
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
        <button
          type="submit"
          disabled={saving}
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
              <th className="px-4 py-3 text-sm font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id} className="border-t">
                <td className="px-4 py-3">{usuario.nombre} {usuario.apellido}</td>
                <td className="px-4 py-3">{usuario.correo}</td>
                <td className="px-4 py-3">{usuario.rol}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-sm ${usuario.activo ? 'text-green-600' : 'text-red-600'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-gray-500">No hay usuarios</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, FolderOpen, PlusCircle, LogOut, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-xl font-bold">Bitácora</h1>
        <p className="text-xs text-slate-400">Soporte técnico</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 p-4">
        <button
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-blue-600 hover:text-white"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          onClick={() => navigate("/casos")}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-blue-600 hover:text-white"
        >
          <FolderOpen size={18} />
          Casos
        </button>

        <button
          onClick={() => navigate("/casos/crear")}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-blue-600 hover:text-white"
        >
          <PlusCircle size={18} />
          Crear caso
        </button>

        {/* ✅ Enlace visible solo para ADMIN */}
        {user?.rol === "ADMIN" && (
          <button
            onClick={() => navigate("/usuarios")}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-blue-600 hover:text-white"
          >
            <Users size={18} />
            Usuarios
          </button>
        )}
      </nav>

      {/* Footer: Usuario + Logout */}
      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 px-4">
          <p className="text-sm font-medium text-white">{user?.nombre}</p>
          <p className="text-xs text-slate-400">{user?.rol}</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
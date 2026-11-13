import { NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Building2,
  BriefcaseBusiness,
  Clock3,
  FolderOpen,
  HardDrive,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Radio,
  Tags,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const navItems: {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: string[];
  end?: boolean;
}[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Casos", to: "/casos", icon: FolderOpen },
  { label: "Crear caso", to: "/casos/crear", icon: PlusCircle, roles: ["ADMIN", "AGENTE"], end: true },
  { label: "Categorías", to: "/categorias", icon: Tags },
  { label: "Servicios", to: "/servicios", icon: BriefcaseBusiness, roles: ["ADMIN"] },
  { label: "ANS", to: "/ans", icon: Clock3, roles: ["ADMIN"] },
  { label: "Canales", to: "/canales", icon: Radio, roles: ["ADMIN"] },
  { label: "Activos", to: "/activos", icon: HardDrive, roles: ["ADMIN"] },
  { label: "Sedes", to: "/sedes", icon: Building2, roles: ["ADMIN"] },
  { label: "Usuarios", to: "/usuarios", icon: Users, roles: ["ADMIN"] },
];

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex min-w-0 flex-col items-start">
            <img
              src="https://www.comware.com.co/wp-content/uploads/logo-blanco.png"
              alt="ComWare"
              className="mb-1 h-8 w-auto max-w-40 object-contain object-left"
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Sistema de Bitácora</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar menú" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden">
            <X size={19} />
          </button>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">General</p>
          {navItems.filter((item) => !item.roles || item.roles.includes(user?.rol ?? "")).map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-blue-500/15 text-blue-200 ring-1 ring-inset ring-blue-400/20" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"}`}
            >
              <Icon size={18} className="shrink-0 opacity-90" />
              <span>{label}</span>
              {label === "Dashboard" && <Activity size={14} className="ml-auto text-blue-300/70" />}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-200">
              {(user?.nombre?.trim()?.[0] || "U").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.nombre || "Usuario"}</p>
              <p className="mt-0.5 text-xs text-slate-400">{user?.rol || ""}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

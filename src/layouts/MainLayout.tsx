import { useState } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";

const obtenerSeccion = (ruta: string) => {
  if (ruta === "/") return "Panel de control";
  if (ruta.startsWith("/casos/crear")) return "Crear caso";
  if (ruta.startsWith("/casos/") && ruta.endsWith("/editar")) return "Editar caso";
  if (ruta.startsWith("/casos/")) return "Detalle del caso";
  if (ruta.startsWith("/casos")) return "Casos";
  const secciones: Record<string, string> = {
    "/categorias": "Categorías",
    "/servicios": "Servicios y proyectos",
    "/ans": "ANS",
    "/canales": "Canales",
    "/activos": "Activos",
    "/sedes": "Sedes",
    "/usuarios": "Usuarios",
  };
  return secciones[ruta] || "Sistema de Bitácora";
};

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const seccion = obtenerSeccion(location.pathname);

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-slate-100 text-slate-900">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-[4.25rem] shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:block">Sistema de Bitácora</p>
              <h1 className="truncate text-base font-semibold text-slate-800 sm:text-lg">{seccion}</h1>
            </div>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-2.5 rounded-full bg-slate-50 py-1.5 pl-2 pr-3 ring-1 ring-slate-200/80">
            <span className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-blue-700"><ShieldCheck size={15} /></span>
            <div className="hidden sm:block">
              <p className="max-w-40 truncate text-xs font-semibold text-slate-700">{user?.nombre}</p>
              <p className="text-[10px] text-slate-500">{user?.rol}</p>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

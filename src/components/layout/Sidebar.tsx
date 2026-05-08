import {
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const links = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Casos",
    path: "/casos",
    icon: ClipboardList,
  },
  {
    label: "Crear caso",
    path: "/casos/crear",
    icon: PlusCircle,
  },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden w-64 flex-col bg-slate-950 text-white md:flex">
      <div className="border-b border-slate-800 px-6 py-6">
        <h1 className="text-2xl font-bold">
          Bitácora
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Soporte técnico
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {links.map((link) => {
          const Icon = link.icon;

          const active = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
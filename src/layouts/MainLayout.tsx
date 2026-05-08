import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";

export const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b bg-white px-6 py-4 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">
            Sistema de Bitácora
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
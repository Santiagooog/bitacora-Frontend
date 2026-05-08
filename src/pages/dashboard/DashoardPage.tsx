export const DashboardPage = () => {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Casos totales</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">1</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">En proceso</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Solucionados</p>
          <p className="mt-2 text-3xl font-bold text-green-600">1</p>
        </div>
      </div>
    </div>
  );
};
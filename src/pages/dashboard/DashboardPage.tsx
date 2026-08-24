import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../../api/dashboard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) return <p className="p-6">Cargando indicadores...</p>;
  if (!data) return <p className="p-6">No hay datos</p>;

  const dataPorEstado = Object.entries(data.casosPorEstado).map(([nombre, valor]) => ({ nombre, valor }));
  const dataPorServicio = Object.entries(data.casosPorServicio).map(([nombre, valor]) => ({ nombre, valor }));
  const dataPorSede = Object.entries(data.casosPorSede).map(([nombre, valor]) => ({ nombre, valor }));

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      {/* Tarjeta principal */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total de casos</p>
          <p className="text-3xl font-bold text-slate-900">{data.totalCasos}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Casos por estado</p>
          <p className="text-3xl font-bold text-slate-900">{dataPorEstado.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Servicios afectados</p>
          <p className="text-3xl font-bold text-slate-900">{dataPorServicio.length}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Casos por estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataPorEstado}>
              <XAxis dataKey="nombre" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#3b82f6" name="Casos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Casos por servicio</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataPorServicio}>
              <XAxis dataKey="nombre" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#10b981" name="Casos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Casos por sede</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataPorSede}>
              <XAxis dataKey="nombre" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#f59e0b" name="Casos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
import { useQuery } from "@tanstack/react-query";
import { getCasos } from "../../api/casos";
import type { Caso } from "../../types/caso";

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "SOLUCIONADO":
      return "bg-green-100 text-green-700";

    case "ESCALADO":
      return "bg-yellow-100 text-yellow-700";

    case "EN PROCESO":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const CasosPage = () => {
  const { data, isLoading } = useQuery<Caso[]>({
    queryKey: ["casos"],
    queryFn: getCasos,
  });

  if (isLoading) {
    return <div>Cargando casos...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Casos
        </h1>

        <p className="mt-1 text-slate-500">
          Gestión y seguimiento de incidentes
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Caso
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Servicio
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Estado
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Sede
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Descripción
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.map((caso) => (
              <tr
                key={caso.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-medium text-slate-800">
                  {caso.numeroCasoInt}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {caso.servicio}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoColor(
                      caso.estado
                    )}`}
                  >
                    {caso.estado}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {caso.sede}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {caso.descripcionFalla}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
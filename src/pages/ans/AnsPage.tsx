import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAnsPaginado, actualizarAns, type Ans } from "../../api/ans";
import {
  Pencil,
  Check,
  X,
  Loader2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { CargaAnsModal } from "../../components/ans/CargaAnsModal";
export const AnsPage = () => {
  const queryClient = useQueryClient();
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [terminoDebounce, setTerminoDebounce] = useState("");
  const [pagina, setPagina] = useState(0);
  const [tamanio] = useState(20);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [valoresTemp, setValoresTemp] = useState<Partial<Ans>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminoDebounce(terminoBusqueda);
      setPagina(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [terminoBusqueda]);

  const [mostrarCarga, setMostrarCarga] = useState(false);

  const { data } = useQuery({
    queryKey: ["ans", terminoDebounce, pagina, tamanio],
    queryFn: () => getAnsPaginado(terminoDebounce, pagina, tamanio),
  });

  const mutation = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<Ans> }) =>
      actualizarAns(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ans"] });
      setIdEditando(null);
      setValoresTemp({});
    },
  });

  const registros = data?.content ?? [];
  const totalPaginas = data?.totalPages ?? 0;
  const totalElementos = data?.totalElements ?? 0;

  const iniciarEdicion = (ans: Ans) => {
    setIdEditando(ans.id);
    setValoresTemp({
      tiempoSdwan: ans.tiempoSdwan,
      tiempoWifiPublico: ans.tiempoWifiPublico,
      tiempoControlAcceso: ans.tiempoControlAcceso,
    });
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setValoresTemp({});
  };

  const guardarEdicion = (id: number) => {
    mutation.mutate({ id, datos: valoresTemp });
  };

    return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">ANS por Sede</h1>
          <p className="mt-1 text-slate-500">
            Gestión de tiempos de solución por servicio (solo administradores)
          </p>
        </div>
        <button
          onClick={() => setMostrarCarga(true)}
          className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
        >
          <Upload size={16} /> Cargar archivo
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por SBAN, oficina o ciudad..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="w-full pl-10 rounded-lg border border-slate-300 px-4 py-2"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">SBAN</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Oficina</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Ciudad</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">SDWAN (h)</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">WiFi (h)</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Control Acceso (h)</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((ans: Ans) => {
              const estaEditando = idEditando === ans.id;
              return (
                <tr key={ans.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-blue-600">{ans.sban}</td>
                  <td className="px-4 py-3 text-slate-700">{ans.oficina}</td>
                  <td className="px-4 py-3 text-slate-600">{ans.ciudad}</td>

                  <td className="px-4 py-3 text-center">
                    {estaEditando ? (
                      <input
                        type="number"
                        value={valoresTemp.tiempoSdwan ?? ""}
                        onChange={(e) =>
                          setValoresTemp({
                            ...valoresTemp,
                            tiempoSdwan: Number(e.target.value),
                          })
                        }
                        className="w-20 rounded border p-1 text-center"
                      />
                    ) : (
                      <span className="font-medium">{ans.tiempoSdwan ?? "—"}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {estaEditando ? (
                      <input
                        type="number"
                        value={valoresTemp.tiempoWifiPublico ?? ""}
                        onChange={(e) =>
                          setValoresTemp({
                            ...valoresTemp,
                            tiempoWifiPublico: Number(e.target.value),
                          })
                        }
                        className="w-20 rounded border p-1 text-center"
                      />
                    ) : (
                      <span className="font-medium">{ans.tiempoWifiPublico ?? "—"}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {estaEditando ? (
                      <input
                        type="number"
                        value={valoresTemp.tiempoControlAcceso ?? ""}
                        onChange={(e) =>
                          setValoresTemp({
                            ...valoresTemp,
                            tiempoControlAcceso: Number(e.target.value),
                          })
                        }
                        className="w-20 rounded border p-1 text-center"
                      />
                    ) : (
                      <span className="font-medium">{ans.tiempoControlAcceso ?? "—"}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {estaEditando ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => guardarEdicion(ans.id)}
                          disabled={mutation.isPending}
                          className="text-green-600 hover:text-green-800"
                        >
                          {mutation.isPending ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => iniciarEdicion(ans)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-600">
          Mostrando {registros.length} de {totalElementos} registros
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className="flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {totalPaginas === 0 ? 0 : pagina + 1} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => p + 1)}
            disabled={pagina >= totalPaginas - 1}
            className="flex items-center gap-1 rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal de carga */}
      {mostrarCarga && (
        <CargaAnsModal onClose={() => setMostrarCarga(false)} />
      )}
    </div>
  );
};

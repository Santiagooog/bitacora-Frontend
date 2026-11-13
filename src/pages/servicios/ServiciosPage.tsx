import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BriefcaseBusiness, Loader2, Plus } from "lucide-react";
import axios from "axios";
import { crearServicio, getServicios } from "../../api/Catalogos";

const mensajeError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "No fue posible crear el servicio.";
  }
  return "No fue posible crear el servicio.";
};

export const ServiciosPage = () => {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errorGuardar, setErrorGuardar] = useState("");

  const { data: servicios = [], isLoading, isError } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });

  const mutation = useMutation({
    mutationFn: () => crearServicio(nombre.trim(), descripcion.trim()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["servicios"] });
      setNombre("");
      setDescripcion("");
      setErrorGuardar("");
    },
    onError: (error: unknown) => setErrorGuardar(mensajeError(error)),
  });

  const guardar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorGuardar("");
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-xl bg-blue-100 p-3 text-blue-700"><BriefcaseBusiness size={22} /></span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Servicios y proyectos</h1>
          <p className="mt-1 text-sm text-slate-500">Administra las opciones disponibles al crear casos.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form onSubmit={guardar} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Agregar servicio</h2>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="servicio-nombre">Nombre</label>
          <input
            id="servicio-nombre"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            maxLength={100}
            required
            placeholder="Ej. CAS 1530"
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="servicio-descripcion">Descripción <span className="font-normal text-slate-400">(opcional)</span></label>
          <textarea
            id="servicio-descripcion"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            maxLength={255}
            rows={3}
            placeholder="Descripción breve del servicio o proyecto"
            className="mb-4 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errorGuardar && (
            <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />{errorGuardar}
            </p>
          )}

          <button
            type="submit"
            disabled={!nombre.trim() || mutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {mutation.isPending ? "Guardando…" : "Agregar servicio"}
          </button>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Servicios disponibles</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{servicios.length}</span>
          </div>
          {isLoading ? (
            <p className="text-sm text-slate-500">Cargando servicios…</p>
          ) : isError ? (
            <p role="alert" className="text-sm text-red-600">No se pudieron cargar los servicios.</p>
          ) : servicios.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no hay servicios registrados.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {servicios.map((servicio) => (
                <li key={servicio.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-medium text-slate-800">{servicio.nombre}</p>
                  <p className="mt-0.5 text-xs text-slate-400">ID {servicio.id}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

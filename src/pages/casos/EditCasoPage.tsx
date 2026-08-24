import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { getCasoById, updateCaso } from "../../api/casos";
import { getServicios, getEstados, getSedes } from "../../api/Catalogos";

const editSchema = z.object({
  servicioId: z.number().min(1, "Seleccione un servicio"),
  estadoId: z.number().min(1, "Seleccione un estado"),
  sedeId: z.number().min(1, "Seleccione una sede"),
  numeroCasoESolution: z.string().optional(),
  descripcionFalla: z.string().min(1, "La descripción es requerida"),
  observaciones: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

export const EditCasoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: caso, isLoading: loadingCaso } = useQuery({
    queryKey: ["caso", id],
    queryFn: () => getCasoById(Number(id)),
    enabled: !!id,
  });

  const { data: servicios = [] } = useQuery({ queryKey: ["servicios"], queryFn: getServicios });
  const { data: estados = [] } = useQuery({ queryKey: ["estados"], queryFn: getEstados });
  const { data: sedes = [] } = useQuery({ queryKey: ["sedes"], queryFn: getSedes });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
  if (caso) {
    reset({
      servicioId: caso.servicioId,   // ✅ era caso.servicio (string)
      estadoId: caso.estadoId,       // ✅ era caso.estado (string)
      sedeId: caso.sedeId,           // ✅ era caso.sede (string)
      numeroCasoESolution: caso.numeroCasoESolution || "",
      descripcionFalla: caso.descripcionFalla,
      observaciones: caso.observaciones || "",
    });
  }
}, [caso, reset]);

  const mutation = useMutation({
    mutationFn: (data: EditForm) => {
      // ✅ Construir objeto completo con todos los campos que necesita el backend
      const payload = {
        fechaSolicitud: caso?.fechaSolicitud,
        servicioId: data.servicioId,
        tipoServicioId: Number(caso?.tipoServicioId),        // ✅ Del caso original
        numeroCasoInt: caso?.numeroCasoInt,          // ✅ Del caso original (no cambia)
        numeroCasoESolution: data.numeroCasoESolution || null,
        estadoId: data.estadoId,
        sedeId: data.sedeId,
        descripcionFalla: data.descripcionFalla,
        responsableId: null,     // Opcional: puedes agregarlo al formulario si quieres
        agenteRecibeId: null,    // Opcional
        agenteResolutorId: null, // Opcional
        fechaSolucion: null,     // Opcional
        observaciones: data.observaciones || null,
      };
      return updateCaso(Number(id), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos"] });
      queryClient.invalidateQueries({ queryKey: ["caso", id] });
      alert("Caso actualizado correctamente");
      navigate(`/casos/${id}`);
    },
    onError: (error: any) => {
      console.error(error);
      alert(error.response?.data?.message || "Error al actualizar el caso");
    },
  });

  if (loadingCaso) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Editar Caso</h1>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700">Servicio</label>
          <select {...register("servicioId", { valueAsNumber: true })} className="w-full rounded-lg border p-3">
            <option value={0}>Seleccione servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
          {errors.servicioId && <p className="text-xs text-red-500">{errors.servicioId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Estado</label>
          <select {...register("estadoId", { valueAsNumber: true })} className="w-full rounded-lg border p-3">
            <option value={0}>Seleccione estado</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
          {errors.estadoId && <p className="text-xs text-red-500">{errors.estadoId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Sede</label>
          <select {...register("sedeId", { valueAsNumber: true })} className="w-full rounded-lg border p-3">
            <option value={0}>Seleccione sede</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.sban} - {s.nombreSede}</option>
            ))}
          </select>
          {errors.sedeId && <p className="text-xs text-red-500">{errors.sedeId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Número E-Solution</label>
          <input {...register("numeroCasoESolution")} className="w-full rounded-lg border p-3" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Descripción de la falla</label>
          <textarea {...register("descripcionFalla")} className="w-full rounded-lg border p-3" rows={4} />
          {errors.descripcionFalla && <p className="text-xs text-red-500">{errors.descripcionFalla.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea {...register("observaciones")} className="w-full rounded-lg border p-3" rows={3} />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/casos/${id}`)}
            className="rounded-lg border border-slate-300 px-6 py-2.5 text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};
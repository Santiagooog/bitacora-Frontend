import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AsyncSelect from "react-select/async";
import { getServicios } from "../../api/Catalogos";
import { createCaso, getSugerencias } from "../../api/casos";
import { getCategoriasFallaPorServicio } from "../../api/categoriaFalla";
import { getActivosPorSede, type Activo } from "../../api/activos.ts";
import { getCanalesActivos } from "../../api/canales";  // ✅ nuevo import
import type { SedeCompleta } from "../../types/Catalogo";
import api from "../../api/axios";

type OpcionSede = { value: number; label: string; data: SedeCompleta };

// ✅ Schema con validaciones
const createCasoSchema = z.object({
  fechaSolicitud: z.string().min(1, "La fecha de solicitud es obligatoria"),
  servicioId: z.number().min(1, "Debe seleccionar un servicio"),
  tipoCaso: z.enum(["INC", "REQ"], {
    message: "Debe seleccionar el tipo de gestión",
  }),
  sedeId: z.number().min(1, "Debe seleccionar una sede"),
  numeroCasoESolution: z.string().optional(),
  descripcionFalla: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres"),
  observaciones: z.string().optional(),
  categoriaFallaId: z
    .number()
    .min(1, "Debe seleccionar una categoría de falla"),
  equipo: z.string().optional(),
  modelo: z.string().optional(),
  serial: z.string().optional(),
  placa: z.string().optional(),
  canalEscalamiento: z.string().optional(),
});

type CreateCasoForm = z.infer<typeof createCasoSchema>;

export const CreateCasoPage = () => {
  const navigate = useNavigate();

  const [sedeSeleccionada, setSedeSeleccionada] = useState<SedeCompleta | null>(null);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [numeroCasoInt, setNumeroCasoInt] = useState("");
  const [generandoNumero, setGenerandoNumero] = useState(false);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);
  const servicioAnterior = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCasoForm>({
    resolver: zodResolver(createCasoSchema),
    defaultValues: {
      fechaSolicitud: new Date().toISOString().slice(0, 16),
      servicioId: 0,
      sedeId: 0,
      numeroCasoESolution: "",
      descripcionFalla: "",
      observaciones: "",
      categoriaFallaId: 0,
    },
  });

  const servicioIdWatch = watch("servicioId");
  const tipoCasoWatch = watch("tipoCaso");
  const descripcionWatch = watch("descripcionFalla");
  const categoriaFallaWatch = watch("categoriaFallaId");

  useEffect(() => {
    if (servicioAnterior.current === null) {
      servicioAnterior.current = servicioIdWatch;
      return;
    }

    if (servicioAnterior.current !== servicioIdWatch) {
      setSedeSeleccionada(null);
      setValue("sedeId", 0, { shouldValidate: true });
      setActivos([]);
      setActivoSeleccionado(null);
      setValue("equipo", "");
      setValue("modelo", "");
      setValue("serial", "");
      setValue("placa", "");
    }

    servicioAnterior.current = servicioIdWatch;
  }, [servicioIdWatch, setValue]);

  const { data: servicios = [] } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });

  // ✅ Cargar canales desde el backend
  const { data: canales = [] } = useQuery({
    queryKey: ["canales"],
    queryFn: getCanalesActivos,
  });

  const { data: fallas = [] } = useQuery({
    queryKey: ["categoriasFalla", servicioIdWatch],
    queryFn: () => getCategoriasFallaPorServicio(servicioIdWatch),
    enabled: !!servicioIdWatch && servicioIdWatch > 0,
  });

  // Cargar activos según sede y servicio
  useEffect(() => {
    const cargarActivos = async () => {
      if (!sedeSeleccionada?.sban || !servicioIdWatch) {
        setActivos([]);
        return;
      }

      const servicioNombre =
        servicios.find((s) => s.id === servicioIdWatch)?.nombre || "";

      let tipoServicio = "";
      const nombreUpper = servicioNombre.toUpperCase();
      if (nombreUpper.trim() === "SDWAN") tipoServicio = "SDWAN";
      else if (["WIFI PUBLICO", "WIFI PÚBLICO", "WIFI ADMINISTRATIVO"].includes(nombreUpper.trim())) tipoServicio = "WIFI";
      else if (nombreUpper.trim() === "CAS 1528A") tipoServicio = "CAS_1528A";
      else if (nombreUpper.trim() === "CAS 1528") tipoServicio = "CAS_1528";
      else tipoServicio = servicioNombre;
      if (!tipoServicio) {
        setActivos([]);
        return;
      }

      try {
        const data = await getActivosPorSede(sedeSeleccionada.sban, tipoServicio);
        setActivos(data);
      } catch (error) {
        console.error("Error cargando activos:", error);
        setActivos([]);
      }
    };

    cargarActivos();
  }, [sedeSeleccionada, servicioIdWatch, servicios]);

  const handleActivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    const activo = activos.find((a) => a.id === id) || null;
    setActivoSeleccionado(activo);

    if (activo) {
      setValue("equipo", activo.name);
      setValue("modelo", activo.deviceType);
      setValue("serial", activo.serial);
    } else {
      setValue("equipo", "");
      setValue("modelo", "");
      setValue("serial", "");
    }
  };

  // Sugerencias automáticas según descripción
  useEffect(() => {
    if (!descripcionWatch || descripcionWatch.length < 5) {
      setSugerencias([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await getSugerencias(descripcionWatch);
        setSugerencias(data);
      } catch (error) {
        console.error(error);
        setSugerencias([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [descripcionWatch, categoriaFallaWatch]);

  // Generar número automático
  useEffect(() => {
    const generar = async () => {
      if (!servicioIdWatch || !tipoCasoWatch) {
        setNumeroCasoInt("");
        return;
      }
      setGenerandoNumero(true);
      try {
        const servicioSeleccionado = servicios.find(
          (s) => s.id === servicioIdWatch,
        );
        if (!servicioSeleccionado) return;

        const response = await api.get("/casos/generar-numero", {
          params: {
            servicio: servicioSeleccionado.nombre,
            tipo: tipoCasoWatch === "INC" ? "INCIDENTE" : "REQUERIMIENTO",
          },
        });
        setNumeroCasoInt(response.data);
      } catch (error) {
        console.error("Error generando número:", error);
        setNumeroCasoInt("");
      } finally {
        setGenerandoNumero(false);
      }
    };
    generar();
  }, [servicioIdWatch, tipoCasoWatch, servicios]);

  const cargarSedes = async (inputValue: string): Promise<OpcionSede[]> => {
    if (!servicioIdWatch) return [];

    try {
      const response = await api.get("/sedes/buscar-por-servicio", {
        params: { termino: inputValue, servicioId: servicioIdWatch },
      });
      return response.data.map((sede: SedeCompleta) => ({
        value: sede.id,
        label: `${sede.sban} - ${sede.nombreSede}`,
        data: sede,
      }));
    } catch (error) {
      console.error("Error cargando sedes", error);
      return [];
    }
  };

  const mutation = useMutation({
    mutationFn: createCaso,
    onSuccess: () => {
      alert("Caso creado correctamente");
      navigate("/casos");
    },
    onError: (error) => {
      console.error(error);
      alert("Error al crear el caso");
    },
  });

  const onSubmit = (data: CreateCasoForm) => {
    mutation.mutate({
      fechaSolicitud: data.fechaSolicitud,
      servicioId: data.servicioId,
      tipoServicioId: 1,
      numeroCasoInt: numeroCasoInt,
      numeroCasoESolution: data.numeroCasoESolution || null,
      estadoId: null,
      sedeId: data.sedeId,
      descripcionFalla: data.descripcionFalla,
      observaciones: data.observaciones || null,
      categoriaFallaId: data.categoriaFallaId,
      categoriaSolucionId: null,
      equipo: data.equipo || null,
      modelo: data.modelo || null,
      serial: data.serial || null,
      placa: data.placa || null,
      activoId: activoSeleccionado?.id || null,
      canalEscalamiento: data.canalEscalamiento || null,
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Crear Caso</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        {/* Fecha solicitud */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha de solicitud <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register("fechaSolicitud")}
            className="w-full rounded-lg border p-3"
          />
          {errors.fechaSolicitud && (
            <p className="text-xs text-red-500">
              {errors.fechaSolicitud.message}
            </p>
          )}
        </div>

        {/* Servicio */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Servicio <span className="text-red-500">*</span>
          </label>
          <select
            {...register("servicioId", { valueAsNumber: true })}
            className="w-full rounded-lg border p-3"
          >
            <option value={0}>Seleccione servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
          {errors.servicioId && (
            <p className="text-xs text-red-500">{errors.servicioId.message}</p>
          )}
        </div>

        {/* Aviso de estado por defecto */}
        <div className="rounded-lg bg-green-50 p-3 border border-green-200">
          <p className="text-sm text-green-800">
            ✅ El caso se creará en estado <strong>ABIERTO</strong>
          </p>
        </div>

        {/* Tipo gestión */}
        <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
          <label className="block text-sm font-semibold text-blue-900 mb-2">
            Tipo de Gestión <span className="text-red-500">*</span>
          </label>
          <select
            {...register("tipoCaso")}
            className="w-full rounded-lg border border-blue-300 p-2 bg-white"
          >
            <option value="">Seleccione tipo</option>
            <option value="INC">🔴 INCIDENTE</option>
            <option value="REQ">🟢 REQUERIMIENTO</option>
          </select>
          {errors.tipoCaso && (
            <p className="text-xs text-red-500">{errors.tipoCaso.message}</p>
          )}
        </div>

        {/* Canal de Escalamiento - ✅ ahora desde backend */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Canal de Escalamiento
          </label>
          <select
            {...register("canalEscalamiento")}
            className="w-full rounded-lg border p-3"
          >
            <option value="">Seleccione canal</option>
            {canales.map((canal) => (
              <option key={canal.id} value={canal.nombre}>
                {canal.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Sede */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Sede <span className="text-red-500">*</span>
          </label>
          <Controller
            name="sedeId"
            control={control}
            render={({ field }) => (
              <AsyncSelect<OpcionSede, false>
                key={servicioIdWatch}
                cacheOptions
                loadOptions={cargarSedes}
                defaultOptions
                onChange={(option) => {
                  field.onChange(option ? option.value : 0);
                  setSedeSeleccionada(option ? option.data : null);
                }}
                placeholder={servicioIdWatch ? "Buscar sedes con este servicio..." : "Seleccione un servicio primero"}
                noOptionsMessage={() => servicioIdWatch ? "No hay sedes con activos de este servicio" : "Seleccione un servicio primero"}
                isClearable
                isDisabled={!servicioIdWatch}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#cbd5e1",
                    borderRadius: "0.5rem",
                    minHeight: "42px",
                  }),
                }}
              />
            )}
          />
          {errors.sedeId && (
            <p className="text-xs text-red-500">{errors.sedeId.message}</p>
          )}
        </div>

        {/* Info sede */}
        {sedeSeleccionada && (
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">
              Información de la Sede
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-blue-800">SBAN:</span>
                <span className="ml-2 font-bold">{sedeSeleccionada.sban}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Nombre:</span>
                <span className="ml-2">{sedeSeleccionada.nombreSede}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Municipio:</span>
                <span className="ml-2">{sedeSeleccionada.municipio}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Departamento:</span>
                <span className="ml-2">{sedeSeleccionada.departamento}</span>
              </div>
            </div>
          </div>
        )}

        {/* Número interno */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Número Caso INT (Automático)
          </label>
          <input
            readOnly
            value={numeroCasoInt}
            className="w-full rounded-lg border p-3 bg-blue-50 border-blue-300 font-semibold"
            placeholder={
              generandoNumero ? "Generando..." : "Se generará automáticamente"
            }
          />
        </div>

        {/* E-Solution */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Número caso plataforma de gestión
          </label>
          <input
            {...register("numeroCasoESolution")}
            className="w-full rounded-lg border p-3"
            placeholder="Opcional"
          />
        </div>

        {/* Activo afectado + Equipo/Modelo/Serial/Placa */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium mb-1">
              Activo afectado (opcional)
            </label>
            <select
              onChange={handleActivoChange}
              className="w-full rounded-lg border p-3"
              disabled={!sedeSeleccionada || !servicioIdWatch}
            >
            
              <option value="">-- Seleccione un activo --</option>
              {activos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.serial})
                </option>
              ))}
            </select>
            {(!sedeSeleccionada || !servicioIdWatch) && (
              <p className="text-xs text-slate-500 mt-1">
                Seleccione servicio y sede primero para ver los activos disponibles
              </p>
            )}
            {sedeSeleccionada && servicioIdWatch && activos.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No hay activos registrados para esta sede y servicio
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Equipo</label>
            <input
              {...register("equipo")}
              readOnly
              className="w-full rounded-lg border p-3 bg-slate-50 text-slate-700 cursor-not-allowed"
              placeholder="Se autocompleta al elegir un activo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Modelo</label>
            <input
              {...register("modelo")}
              readOnly
              className="w-full rounded-lg border p-3 bg-slate-50 text-slate-700 cursor-not-allowed"
              placeholder="Se autocompleta al elegir un activo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Serial</label>
            <input
              {...register("serial")}
              readOnly
              className="w-full rounded-lg border p-3 bg-slate-50 text-slate-700 cursor-not-allowed"
              placeholder="Se autocompleta al elegir un activo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Placa</label>
            <input
              {...register("placa")}
              className="w-full rounded-lg border p-3"
              placeholder="Ej: PL-001"
            />
          </div>
        </div>

        {/* Categoría Falla */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Categoría de Falla <span className="text-red-500">*</span>
          </label>
          <select
            {...register("categoriaFallaId", { valueAsNumber: true })}
            className="w-full rounded-lg border p-3"
          >
            <option value={0}>Seleccione falla</option>
            {fallas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
          {errors.categoriaFallaId && (
            <p className="text-xs text-red-500">
              {errors.categoriaFallaId.message}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Descripción de la falla <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("descripcionFalla")}
            className="w-full rounded-lg border p-3"
            rows={4}
            placeholder="Describa el problema..."
          />
          {errors.descripcionFalla && (
            <p className="text-xs text-red-500">
              {errors.descripcionFalla.message}
            </p>
          )}
        </div>

        {/* Sugerencias */}
        {sugerencias.length > 0 && (
          <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">
              💡 Casos resueltos similares
            </h3>
            <ul className="space-y-3">
              {sugerencias.map((sug) => (
                <li key={sug.id} className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-700">
                      {sug.numeroCasoInt}
                    </span>
                    <span className="text-xs text-green-600 font-semibold">
                      ✓ {sug.estado}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">
                    {sug.descripcionFalla}
                  </p>
                  {sug.categoriaSolucionNombre && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-2 inline-block">
                      Solución: {sug.categoriaSolucionNombre}
                    </span>
                  )}
                  {sug.observaciones && (
                    <p className="text-sm text-green-700 mt-2">
                      <strong>Observación:</strong> {sug.observaciones}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium mb-1">Observaciones</label>
          <textarea
            {...register("observaciones")}
            className="w-full rounded-lg border p-3"
            rows={3}
            placeholder="Opcional"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || generandoNumero || !numeroCasoInt}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Guardando..."
            : generandoNumero
              ? "Generando número..."
              : "Guardar Caso"}
        </button>
      </form>
    </div>
  );
};

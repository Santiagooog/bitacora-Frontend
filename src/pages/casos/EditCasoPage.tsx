import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { getCasoById, updateCaso } from "../../api/casos";
import { getServicios, getEstados, getSedes } from "../../api/Catalogos";
import { getCategoriasFallaPorServicio } from "../../api/categoriaFalla";
import { getCategoriasSolucionPorServicio } from "../../api/categoriaSolucion";
import { getActivosPorSede, type Activo } from "../../api/activos";
import { getTransicionesValidas, type Estado } from "../../api/estados";
import { getCanalesActivos } from "../../api/canales"; // ✅ Nuevo

const esCategoriaCambioActivo = (nombre?: string) => {
  if (!nombre) return false;
  const normalizado = nombre.trim().toLowerCase().replace(/\s+/g, " ");
  return [
    "cambio de equipo",
    "cambio de sw",
    "cambio de fw",
    "cambio de usg",
    "cambio de ar",
    "cambio de ap",
    "cambio de poe",
    "ar dañado",
    "ap dañado",
  ].includes(normalizado);
};

const editSchema = z.object({
  servicioId: z.number().min(1, "Seleccione un servicio"),
  estadoId: z.number().optional(),
  sedeId: z.number().min(1, "Seleccione una sede"),
  numeroCasoESolution: z.string().optional(),
  descripcionFalla: z.string().min(1, "La descripción es requerida"),
  observaciones: z.string().optional(),
  equipo: z.string().optional(),
  modelo: z.string().optional(),
  serial: z.string().optional(),
  placa: z.string().optional(),
  activoId: z.number().optional(),
  canalEscalamiento: z.string().optional(),
  grupoEscalamiento: z.string().optional(),
  escaladoA: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

export const EditCasoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  

  const [categoriaFallaId, setCategoriaFallaId] = useState<number | null>(null);
  const [categoriaSolucionId, setCategoriaSolucionId] = useState<number | null>(null);
  const [servicioIdActual, setServicioIdActual] = useState<number | null>(null);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);
  const [serialNuevo, setSerialNuevo] = useState("");
  const [placaNueva, setPlacaNueva] = useState("");
  const [estadosDisponibles, setEstadosDisponibles] = useState<Estado[]>([]);

  const { data: caso, isLoading: loadingCaso } = useQuery({
    queryKey: ["caso", id],
    queryFn: () => getCasoById(Number(id)),
    enabled: !!id,
  });

  const { data: servicios = [] } = useQuery({ queryKey: ["servicios"], queryFn: getServicios });
  const { data: estados = [] } = useQuery({ queryKey: ["estados"], queryFn: getEstados });
  const { data: sedes = [] } = useQuery({ queryKey: ["sedes"], queryFn: getSedes });

  // ✅ Cargar canales desde el backend
  const { data: canales = [] } = useQuery({
    queryKey: ["canales"],
    queryFn: getCanalesActivos,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  const servicioWatch = watch("servicioId");
  const sedeWatch = watch("sedeId");
  const estadoWatch = watch("estadoId");
  const estadoIdWatch = watch("estadoId");
  const grupoEscalamientoWatch = watch("grupoEscalamiento");

  const esSolucionado =
    estadoWatch &&
    estados.find((e) => e.id === estadoWatch)?.nombre === "SOLUCIONADO";

  const estaCerrado = caso?.estado === "CERRADO";

  const { data: fallas = [] } = useQuery({
    queryKey: ["categoriasFalla", servicioIdActual],
    queryFn: () => getCategoriasFallaPorServicio(servicioIdActual!),
    enabled: !!servicioIdActual,
  });

  const { data: soluciones = [] } = useQuery({
    queryKey: ["categoriasSolucion", servicioIdActual],
    queryFn: () => getCategoriasSolucionPorServicio(servicioIdActual!),
    enabled: !!servicioIdActual && !!esSolucionado,
  });

  const categoriaSolucionNombre = soluciones.find((solucion) => solucion.id === categoriaSolucionId)?.nombre;
  const esCambioActivo = Boolean(esSolucionado && esCategoriaCambioActivo(categoriaSolucionNombre));

  // Refs
  const valoresPrevios = useRef({ servicioId: 0, sedeId: 0 });
  const primeraCarga = useRef(true);

  // ✅ 1. Cargar transiciones válidas
  useEffect(() => {
    const cargarTransiciones = async () => {
      const estadoActualNombre = caso?.estado;
      if (!estadoActualNombre) return;

      if (estadoActualNombre === "CERRADO") {
        setEstadosDisponibles([]);
        return;
      }

      try {
        const data = await getTransicionesValidas(estadoActualNombre);
        setEstadosDisponibles(data);
      } catch (error) {
        console.error("Error cargando transiciones:", error);
        setEstadosDisponibles([]);
      }
    };

    cargarTransiciones();
  }, [caso?.estado]);

  // ✅ 2. Cargar datos del caso en el formulario
  useEffect(() => {
    if (!caso) return;

    reset({
      servicioId: caso.servicioId,
      estadoId: caso.estadoId,
      sedeId: caso.sedeId,
      numeroCasoESolution: caso.numeroCasoESolution || "",
      descripcionFalla: caso.descripcionFalla,
      observaciones: caso.observaciones || "",
      equipo: caso.equipo || "",
      modelo: caso.modelo || "",
      serial: caso.serial || "",
      placa: caso.placa || "",
      activoId: caso.activoId || 0,
      canalEscalamiento: caso.canalEscalamiento || "",
      grupoEscalamiento: caso.grupoEscalamiento || "",
      escaladoA: caso.escaladoA || "",
    });

    setCategoriaFallaId(caso.categoriaFallaId ?? null);
    setCategoriaSolucionId(caso.categoriaSolucionId ?? null);
    setSerialNuevo(caso.activoSerial || "");
    setPlacaNueva(caso.activoPlaca || caso.placa || "");
    setServicioIdActual(caso.servicioId);

    valoresPrevios.current = {
      servicioId: caso.servicioId,
      sedeId: caso.sedeId,
    };
  }, [caso, reset]);

  // ✅ 3. Limpiar campos si el usuario cambia sede/servicio
  useEffect(() => {
    if (!caso) return;
    if (primeraCarga.current) {
      primeraCarga.current = false;
      valoresPrevios.current = {
        servicioId: caso.servicioId,
        sedeId: caso.sedeId,
      };
      return;
    }

    const servicioCambio =
      valoresPrevios.current.servicioId !== 0 &&
      valoresPrevios.current.servicioId !== servicioWatch;
    const sedeCambio =
      valoresPrevios.current.sedeId !== 0 &&
      valoresPrevios.current.sedeId !== sedeWatch;

    valoresPrevios.current = { servicioId: servicioWatch, sedeId: sedeWatch };

    if (servicioCambio || sedeCambio) {
      setActivoSeleccionado(null);
      setValue("equipo", "");
      setValue("modelo", "");
      setValue("serial", "");
      if (servicioCambio) {
        setServicioIdActual(servicioWatch);
        setCategoriaSolucionId(null);
      }
    }
  }, [servicioWatch, sedeWatch, caso, setValue]);

  // Recupera la categoría por nombre para casos cuyo API solo entregue el texto histórico.
  useEffect(() => {
    if (!caso?.categoriaFallaNombre || categoriaFallaId != null || fallas.length === 0) return;

    const nombreNormalizado = caso.categoriaFallaNombre.trim().toLocaleLowerCase();
    const categoriaGuardada = fallas.find(
      (falla) => falla.nombre.trim().toLocaleLowerCase() === nombreNormalizado,
    );
    if (categoriaGuardada) setCategoriaFallaId(categoriaGuardada.id);
  }, [caso, categoriaFallaId, fallas]);

  // ✅ 4. Cargar activos
  useEffect(() => {
    const cargarActivos = async () => {
      const sbanActual = sedeWatch
        ? sedes.find((s) => s.id === sedeWatch)?.sban
        : caso?.sban;

      const servicioNombreActual = servicioWatch
        ? servicios.find((s) => s.id === servicioWatch)?.nombre
        : caso?.servicio;

      if (!sbanActual || !servicioNombreActual) {
        setActivos([]);
        return;
      }

      let tipoServicio = "";
      const nombreUpper = servicioNombreActual.toUpperCase();
      if (nombreUpper.trim() === "SDWAN") tipoServicio = "SDWAN";
      else if (["WIFI PUBLICO", "WIFI PÚBLICO", "WIFI ADMINISTRATIVO"].includes(nombreUpper.trim())) tipoServicio = "WIFI";
      else if (nombreUpper.trim() === "CAS 1528A") tipoServicio = "CAS_1528A";
      else if (nombreUpper.trim() === "CAS 1528") tipoServicio = "CAS_1528";
      else if (["CONTROL DE ACCESO", "CONTROL DE ACCESOS"].includes(nombreUpper.trim())) tipoServicio = "ACCESOS";
      else tipoServicio = servicioNombreActual;

      if (!tipoServicio) {
        setActivos([]);
        return;
      }

      try {
        const data = await getActivosPorSede(sbanActual, tipoServicio);
        setActivos(data);
      } catch (error) {
        console.error("Error cargando activos:", error);
        setActivos([]);
      }
    };

    cargarActivos();
  }, [sedeWatch, servicioWatch, sedes, servicios, caso]);

    const estadoActualNombre =
      estados.find((e) => e.id === estadoIdWatch)?.nombre ||
      (estadoIdWatch === caso?.estadoId ? caso?.estado : undefined);
    const esEscalado = estadoActualNombre === "ESCALADO";

  const servicioNombreActual =
    servicios.find((servicio) => servicio.id === servicioWatch)?.nombre ||
    (servicioWatch === caso?.servicioId ? caso?.servicio : "");
  const proveedorSoporteSitio = (() => {
    const nombre = servicioNombreActual.toUpperCase().replace(/\s+/g, " ");
    if (nombre.includes("1528A") || nombre.includes("1528")) return "Binarity";
    if (nombre.includes("SDWAN") || nombre.includes("WIFI")) return "Enertecol";
    return "";
  })();
  const escalamientoSitioBloqueado =
    caso?.grupoEscalamiento?.trim().toUpperCase() === "SOPORTE EN SITIO" &&
    Boolean(caso.escaladoA?.trim());

  useEffect(() => {
    if (!esEscalado) {
      setValue("grupoEscalamiento", "");
      setValue("escaladoA", "");
      return;
    }

    if (grupoEscalamientoWatch !== "SOPORTE EN SITIO") {
      setValue("escaladoA", "");
      return;
    }

    setValue("escaladoA", proveedorSoporteSitio);
  }, [esEscalado, grupoEscalamientoWatch, proveedorSoporteSitio, setValue]);


  // ✅ 5. Autocompletar activo del caso
  useEffect(() => {
    if (!caso?.activoId || activos.length === 0) return;

    const activoDelCaso = activos.find((a) => a.id === caso.activoId);
    if (activoDelCaso) {
      setActivoSeleccionado(activoDelCaso);
      setValue("equipo", activoDelCaso.name);
      setValue("modelo", activoDelCaso.deviceType);
      setValue("serial", activoDelCaso.serial);
    }
  }, [caso?.activoId, activos, setValue]);

  const handleActivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idActivo = e.target.value ? Number(e.target.value) : null;
    const activo = activos.find((a) => a.id === idActivo) || null;
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

    if (esCambioActivo) {
      setSerialNuevo("");
      setPlacaNueva("");
    }
  };

  const onSubmit = (data: EditForm) => {
    if (!categoriaFallaId) {
      alert("Debe seleccionar una categoría de falla");
      return;
    }
    if (esSolucionado && !categoriaSolucionId) {
      alert("Debe seleccionar una categoría de solución para casos solucionados");
      return;
    }
    if (esCambioActivo && !serialNuevo.trim()) {
      alert("Ingrese el nuevo serial del equipo");
      return;
    }
    const grupoEscalamientoActual =
      data.grupoEscalamiento ||
      (escalamientoSitioBloqueado ? caso?.grupoEscalamiento : "");

    if (esEscalado && !grupoEscalamientoActual) {
      alert("Seleccione el grupo de escalamiento");
      return;
    }
    if (
      esEscalado &&
      grupoEscalamientoActual === "SOPORTE EN SITIO" &&
      !proveedorSoporteSitio
    ) {
      alert("No hay un proveedor de soporte en sitio configurado para este proyecto");
      return;
    }

    const payload = {
      fechaSolicitud: caso?.fechaSolicitud,
      servicioId: data.servicioId,
      tipoServicioId: Number(caso?.tipoServicioId),
      numeroCasoInt: caso?.numeroCasoInt,
      numeroCasoESolution: data.numeroCasoESolution || null,
      estadoId: data.estadoId || null,
      sedeId: data.sedeId,
      descripcionFalla: data.descripcionFalla,
      responsableId: null,
      agenteRecibeId: null,
      agenteResolutorId: null,
      fechaSolucion: null,
      observaciones: data.observaciones || null,
      categoriaFallaId: categoriaFallaId,
      categoriaSolucionId: esSolucionado ? categoriaSolucionId : null,
      equipo: data.equipo || null,
      modelo: data.modelo || null,
      serial: data.serial || null,
      placa: data.placa || null,
      activoId: activoSeleccionado?.id || null,
      serialNuevo: esCambioActivo ? serialNuevo.trim() : null,
      placaNueva: placaNueva.trim() || null,
      canalEscalamiento: data.canalEscalamiento || null,
      grupoEscalamiento: esEscalado ? grupoEscalamientoActual || null : null,
      escaladoA:
        esEscalado && grupoEscalamientoActual === "SOPORTE EN SITIO"
          ? proveedorSoporteSitio || caso?.escaladoA || null
          : null,
    };

    mutation.mutate(payload);
  };

  const mutation = useMutation({
    mutationFn: (payload: any) => updateCaso(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos"] });
      queryClient.invalidateQueries({ queryKey: ["caso", id] });
      queryClient.invalidateQueries({ queryKey: ["activos"] });
      alert("Caso actualizado correctamente");
      navigate(`/casos/${id}`);
    },
    onError: (error: any) => {
      console.error(error);
      alert(error.response?.data?.message || error.message || "Error al actualizar el caso");
    },
  });

  if (loadingCaso) return <p className="p-6">Cargando...</p>;

    return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Editar Caso</h1>

      {estaCerrado && (
        <div className="mb-4 rounded-lg bg-orange-50 p-4 border border-orange-200">
          <p className="text-sm text-orange-800">
            ⚠️ Este caso está cerrado y no puede modificarse. Si necesitas hacer cambios, crea un caso nuevo.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        {/* Servicio */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Servicio</label>
          <input type="hidden" {...register("servicioId", { valueAsNumber: true })} />
          <select
            value={servicioWatch ?? ""}
            className="w-full cursor-not-allowed rounded-lg border bg-slate-100 p-3"
            disabled
          >
            <option value={0}>Seleccione servicio</option>
            {caso && !servicios.some((servicio) => servicio.id === caso.servicioId) && (
              <option value={caso.servicioId}>{caso.servicio} (histórico)</option>
            )}
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
          {errors.servicioId && (
            <p className="text-xs text-red-500">{errors.servicioId.message}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Estado</label>
          <select
            {...register("estadoId", { valueAsNumber: true })}
            className="w-full rounded-lg border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed"
            disabled={estaCerrado}
          >
            <option value={caso?.estadoId || 0}>{caso?.estado} (actual)</option>
            {estadosDisponibles.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
          {estadosDisponibles.length === 0 && !estaCerrado && (
            <p className="text-xs text-slate-500 mt-1">
              No hay transiciones disponibles desde el estado actual
            </p>
          )}
        </div>

        {/* Campos condicionales de escalamiento */}
        {esEscalado && (
          <div className="mt-4 space-y-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Grupo de Escalamiento <span className="text-red-500">*</span>
              </label>
              <select
                {...register("grupoEscalamiento")}
                className="w-full rounded-lg border p-3"
                disabled={estaCerrado || escalamientoSitioBloqueado}
              >
                <option value="">Seleccione grupo</option>
                <option value="ESPECIALISTAS">ESPECIALISTAS</option>
                <option value="FABRICANTE">FABRICANTE</option>
                <option value="SOLUCIONADO">SOLUCIONADO</option>
                <option value="SOPORTE EN SITIO">SOPORTE A SITIO</option>
              </select>
            </div>

            {grupoEscalamientoWatch === "SOPORTE EN SITIO" && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Proveedor de soporte a sitio <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("escaladoA")}
                  className="w-full rounded-lg border bg-white p-3"
                  disabled={estaCerrado || escalamientoSitioBloqueado || !proveedorSoporteSitio}
                  required
                >
                  {proveedorSoporteSitio ? (
                    <option value={proveedorSoporteSitio}>{proveedorSoporteSitio}</option>
                  ) : (
                    <option value="">Proyecto sin proveedor configurado</option>
                  )}
                </select>
                <p className="mt-1 text-xs text-slate-600">
                  Proveedor asignado según el proyecto: {servicioNombreActual || "sin proyecto"}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Categoría de Solución - aparece cuando el estado es SOLUCIONADO */}
        {esSolucionado && (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Categoría de Solución <span className="text-red-500">*</span>
            </label>
            <select
              value={categoriaSolucionId ?? ""}
              onChange={(e) => {
                const nuevaCategoriaId = e.target.value ? Number(e.target.value) : null;
                setCategoriaSolucionId(nuevaCategoriaId);
                const nuevaCategoria = soluciones.find((solucion) => solucion.id === nuevaCategoriaId);
                if (esCategoriaCambioActivo(nuevaCategoria?.nombre) && nuevaCategoriaId !== categoriaSolucionId) {
                  setSerialNuevo("");
                  setPlacaNueva("");
                }
              }}
              className="w-full rounded-lg border p-3"
              disabled={estaCerrado}
            >
              <option value="">Seleccione solución</option>
              {soluciones.map((solucion) => (
                <option key={solucion.id} value={solucion.id}>{solucion.nombre}</option>
              ))}
            </select>
            {soluciones.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No hay categorías de solución para este servicio
              </p>
            )}
          </div>
        )}

        {esCambioActivo && (
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-blue-900">Datos del equipo nuevo</h3>
              <p className="text-sm text-blue-800">
                Al guardar, el nuevo serial y la placa actualizarán el activo vinculado a este caso.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Equipo</label>
                <input
                  value={activoSeleccionado?.name || caso?.activoName || ""}
                  readOnly
                  className="w-full rounded-lg border bg-slate-100 p-3 text-slate-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Modelo</label>
                <input
                  value={activoSeleccionado?.deviceType || caso?.activoDeviceType || caso?.modelo || ""}
                  readOnly
                  className="w-full rounded-lg border bg-slate-100 p-3 text-slate-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nuevo serial <span className="text-red-500">*</span>
                </label>
                <input
                  value={serialNuevo}
                  onChange={(e) => setSerialNuevo(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  disabled={estaCerrado}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nueva placa</label>
                <input
                  value={placaNueva}
                  onChange={(e) => setPlacaNueva(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  required
                  disabled={estaCerrado}
                />
              </div>
            </div>
          </section>
        )}

        {/* Canal de Escalamiento - ✅ desde el backend */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Canal de Escalamiento
          </label>
          <input type="hidden" {...register("canalEscalamiento")} />
          <select
            value={watch("canalEscalamiento") || ""}
            className="w-full cursor-not-allowed rounded-lg border bg-slate-100 p-3"
            disabled
          >
            <option value="">Seleccione canal</option>
            {caso?.canalEscalamiento && !canales.some((canal) => canal.nombre === caso.canalEscalamiento) && (
              <option value={caso.canalEscalamiento}>{caso.canalEscalamiento}</option>
            )}
            {canales.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Sede */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Sede</label>
          <input type="hidden" {...register("sedeId", { valueAsNumber: true })} />
          <select
            value={sedeWatch ?? ""}
            className="w-full cursor-not-allowed rounded-lg border bg-slate-100 p-3"
            disabled
          >
            <option value={0}>Seleccione sede</option>
            {caso && !sedes.some((sede) => sede.id === caso.sedeId) && (
              <option value={caso.sedeId}>{caso.sban} - {caso.sede}</option>
            )}
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.sban} - {s.nombreSede}</option>
            ))}
          </select>
          {errors.sedeId && (
            <p className="text-xs text-red-500">{errors.sedeId.message}</p>
          )}
        </div>

        {/* Categoría de Falla */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Categoría de Falla <span className="text-red-500">*</span>
          </label>
          <select
            value={categoriaFallaId ?? ""}
            className="w-full cursor-not-allowed rounded-lg border bg-slate-100 p-3"
            disabled
          >
            <option value="">Seleccione falla</option>
            {caso?.categoriaFallaId && !fallas.some((falla) => falla.id === caso.categoriaFallaId) && (
              <option value={caso.categoriaFallaId}>{caso.categoriaFallaNombre || `Categoría ${caso.categoriaFallaId}`}</option>
            )}
            {fallas.map((falla) => (
              <option key={falla.id} value={falla.id}>{falla.nombre}</option>
            ))}
          </select>
        </div>

        {/* Número plataforma de gestión */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Número plataforma de gestión
          </label>
          <input
            {...register("numeroCasoESolution")}
            className="w-full cursor-not-allowed rounded-lg border bg-slate-100 p-3"
            readOnly
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Descripción de la falla
          </label>
          <textarea
            {...register("descripcionFalla")}
            className="w-full rounded-lg border p-3"
            rows={4}
            disabled={estaCerrado}
          />
          {errors.descripcionFalla && (
            <p className="text-xs text-red-500">{errors.descripcionFalla.message}</p>
          )}
        </div>

        {/* Activo + Equipo/Modelo/Serial/Placa */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Activo afectado (opcional)
            </label>
            <select
              value={activoSeleccionado?.id || ""}
              onChange={handleActivoChange}
              className="w-full rounded-lg border p-3"
              disabled={estaCerrado}
            >
              <option value="">-- Seleccione un activo --</option>
              {activos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.serial})
                </option>
              ))}
            </select>
            {activos.length === 0 && !estaCerrado && (
              <p className="text-xs text-amber-600 mt-1">
                No hay activos registrados para esta sede y servicio
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Equipo</label>
            <input
              {...register("equipo")}
              readOnly
              className="w-full rounded-lg border p-3 bg-slate-50 text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
            <input
              {...register("modelo")}
              readOnly
              className="w-full rounded-lg border p-3 bg-slate-50 text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serial</label>
            <input
              {...register("serial")}
              readOnly
              className="w-full rounded-lg border p-3 bg-slate-50 text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
            <input
              {...register("placa")}
              className="w-full rounded-lg border p-3"
              placeholder="Ej: PL-001"
              readOnly={esCambioActivo}
              disabled={estaCerrado}
            />
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea
            {...register("observaciones")}
            className="w-full rounded-lg border p-3"
            rows={3}
            disabled={estaCerrado}
          />
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
            disabled={estaCerrado || isSubmitting || mutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

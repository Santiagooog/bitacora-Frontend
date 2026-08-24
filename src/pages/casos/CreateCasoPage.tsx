import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { getServicios, getEstados } from "../../api/Catalogos"; // eliminamos getSedes
import { createCaso } from "../../api/casos";
import type { SedeCompleta } from "../../types/Catalogo";
import api from "../../api/axios";

export const CreateCasoPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estado para la sede seleccionada (objeto completo)
  const [sedeSeleccionada, setSedeSeleccionada] = useState<SedeCompleta | null>(null);

  // Función para cargar sedes desde el backend (búsqueda por SBAN o nombre)
  const cargarSedes = async (inputValue: string) => {
    try {
      const response = await api.get("/sedes/buscar", {
        params: { termino: inputValue },
      });
      return response.data.map((sede: SedeCompleta) => ({
        value: sede.id,
        label: `${sede.sban} - ${sede.nombreSede}`,
        data: sede, // guardamos el objeto completo para usar después
      }));
    } catch (error) {
      console.error("Error cargando sedes", error);
      return [];
    }
  };

  const { data: servicios = [] } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });

  const { data: estados = [] } = useQuery({
    queryKey: ["estados"],
    queryFn: getEstados,
  });

  const [form, setForm] = useState({
    fechaSolicitud: new Date().toISOString().slice(0, 16),
    servicioId: "",
    estadoId: "",
    sedeId: "" as string | number,
    numeroCasoInt: "",
    numeroCasoESolution: "",
    descripcionFalla: "",
    observaciones: "",
  });

  const [tipoCaso, setTipoCaso] = useState<"INC" | "REQ" | "">("");
  const [generandoNumero, setGenerandoNumero] = useState(false);

  const generarNumeroCaso = async () => {
    if (!form.servicioId || !tipoCaso) {
      setForm({ ...form, numeroCasoInt: "" });
      return;
    }

    setGenerandoNumero(true);
    try {
      const servicioSeleccionado = servicios.find(
        (s) => s.id === Number(form.servicioId)
      );

      if (!servicioSeleccionado) {
        setForm({ ...form, numeroCasoInt: "" });
        return;
      }

      const response = await api.get("/casos/generar-numero", {
        params: {
          servicio: servicioSeleccionado.nombre,
          tipo: tipoCaso === "INC" ? "INCIDENTE" : "REQUERIMIENTO",
        },
      });

      setForm({ ...form, numeroCasoInt: response.data });
    } catch (error) {
      console.error("Error generando número de caso:", error);
      setForm({ ...form, numeroCasoInt: "" });
    } finally {
      setGenerandoNumero(false);
    }
  };

  useEffect(() => {
    if (form.servicioId && tipoCaso) {
      generarNumeroCaso();
    }
  }, [form.servicioId, tipoCaso]);

  // Handler para el cambio de sede en AsyncSelect
  const handleSedeChange = (option: any) => {
    setForm({ ...form, sedeId: option ? option.value : "" });
    setSedeSeleccionada(option ? option.data : null);
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutation.mutate({
      fechaSolicitud: form.fechaSolicitud,
      servicioId: Number(form.servicioId),
      tipoServicioId: 1, // Ajusta según tu BD (en el futuro podrías usar el tipoCaso)
      numeroCasoInt: form.numeroCasoInt,
      numeroCasoESolution: form.numeroCasoESolution,
      estadoId: Number(form.estadoId),
      sedeId: form.sedeId ? Number(form.sedeId) : null,
      descripcionFalla: form.descripcionFalla,
      observaciones: form.observaciones,
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Crear Caso</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <input
          type="datetime-local"
          name="fechaSolicitud"
          value={form.fechaSolicitud}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <select
          name="servicioId"
          value={form.servicioId}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        >
          <option value="">Seleccione servicio</option>
          {servicios.map((servicio) => (
            <option key={servicio.id} value={servicio.id}>
              {servicio.nombre}
            </option>
          ))}
        </select>

        <select
          name="estadoId"
          value={form.estadoId}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        >
          <option value="">Seleccione estado</option>
          {estados.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estado.nombre}
            </option>
          ))}
        </select>

        {/* ✅ Tipo de Gestión */}
        <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
          <label className="block text-sm font-semibold text-blue-900 mb-2">
            Tipo de Gestión
          </label>
          <select
            value={tipoCaso}
            onChange={(e) => setTipoCaso(e.target.value as "INC" | "REQ" | "")}
            className="w-full rounded-lg border border-blue-300 p-2 bg-white"
          >
            <option value="">Seleccione tipo de gestión</option>
            <option value="INC">🔴 INCIDENTE</option>
            <option value="REQ">🟢 REQUERIMIENTO</option>
          </select>
        </div>

        {/* ✅ Selector de sede con búsqueda asíncrona */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Sede
          </label>
          <AsyncSelect
            cacheOptions
            loadOptions={cargarSedes}
            defaultOptions
            onChange={handleSedeChange}
            placeholder="Buscar por SBAN o nombre..."
            noOptionsMessage={() => "No se encontraron sedes"}
            loadingMessage={() => "Buscando..."}
            isClearable
            className="react-select"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#cbd5e1",
                borderRadius: "0.5rem",
                minHeight: "42px",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                overflow: "hidden",
              }),
            }}
          />
        </div>

        {/* Información detallada de la sede seleccionada */}
        {sedeSeleccionada && (
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">
              Información de la Sede
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-blue-800">SBAN:</span>
                <span className="ml-2 text-blue-900 font-bold">
                  {sedeSeleccionada.sban}
                </span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Nombre:</span>
                <span className="ml-2 text-blue-900">
                  {sedeSeleccionada.nombreSede}
                </span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Municipio:</span>
                <span className="ml-2 text-blue-900">
                  {sedeSeleccionada.municipio}
                </span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Departamento:</span>
                <span className="ml-2 text-blue-900">
                  {sedeSeleccionada.departamento}
                </span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Dirección:</span>
                <span className="ml-2 text-blue-900">
                  {sedeSeleccionada.direccion}
                </span>
              </div>
              <div>
                <span className="font-semibold text-blue-800">Horario:</span>
                <span className="ml-2 text-blue-900">
                  {sedeSeleccionada.horario}
                </span>
              </div>
              {/* Quitamos enlaceTelefonica y medioEnlace porque no existen en el backend */}
            </div>
          </div>
        )}

        <div className="relative">
          <input
            name="numeroCasoInt"
            placeholder="Número Caso INT (Automático)"
            value={form.numeroCasoInt}
            readOnly
            className="w-full rounded-lg border p-3 bg-blue-50 border-blue-300 font-semibold"
          />
          {generandoNumero && (
            <div className="absolute right-3 top-3 text-blue-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
          <p className="text-xs text-blue-600 mt-1">
            * Se genera automáticamente según el servicio y tipo seleccionado
          </p>
        </div>

        <input
          name="numeroCasoESolution"
          placeholder="Número Caso E-Solution"
          value={form.numeroCasoESolution}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <textarea
          name="descripcionFalla"
          placeholder="Descripción de la falla"
          value={form.descripcionFalla}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={form.observaciones}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          disabled={generandoNumero || !form.numeroCasoInt}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {generandoNumero ? "Generando número..." : "Guardar Caso"}
        </button>
      </form>
    </div>
  );
};
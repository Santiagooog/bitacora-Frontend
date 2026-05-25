import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  getServicios,
  getTiposServicio,
  getEstados,
  getSedes,
} from "../../api/Catalogos";

import { createCaso } from "../../api/casos";

export const CreateCasoPage = () => {
  const navigate = useNavigate();

  const { data: servicios = [] } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });

  const { data: tiposServicio = [] } = useQuery({
    queryKey: ["tipos-servicio"],
    queryFn: getTiposServicio,
  });

  const { data: estados = [] } = useQuery({
    queryKey: ["estados"],
    queryFn: getEstados,
  });

  const { data: sedes = [] } = useQuery({
    queryKey: ["sedes"],
    queryFn: getSedes,
  });

  const [form, setForm] = useState({
    fechaSolicitud: new Date().toISOString().slice(0, 16),

    servicioId: "",
    tipoServicioId: "",
    estadoId: "",
    sedeId: "",

    numeroCasoInt: "",
    numeroCasoESolution: "",

    descripcionFalla: "",
    observaciones: "",
  });

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
      tipoServicioId: Number(form.tipoServicioId),

      numeroCasoInt: form.numeroCasoInt,
      numeroCasoESolution: form.numeroCasoESolution,

      estadoId: Number(form.estadoId),
      sedeId: Number(form.sedeId),

      descripcionFalla: form.descripcionFalla,
      observaciones: form.observaciones,
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Crear Caso
      </h1>

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
            <option
              key={servicio.id}
              value={servicio.id}
            >
              {servicio.nombre}
            </option>
          ))}
        </select>

        <select
          name="tipoServicioId"
          value={form.tipoServicioId}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        >
          <option value="">Seleccione tipo servicio</option>

          {tiposServicio.map((tipo) => (
            <option
              key={tipo.id}
              value={tipo.id}
            >
              {tipo.nombre}
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
            <option
              key={estado.id}
              value={estado.id}
            >
              {estado.nombre}
            </option>
          ))}
        </select>

        <select
          name="sedeId"
          value={form.sedeId}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        >
          <option value="">Seleccione sede</option>

          {sedes.map((sede) => (
            <option
              key={sede.id}
              value={sede.id}
            >
              {sede.nombre}
            </option>
          ))}
        </select>

        <input
          name="numeroCasoInt"
          placeholder="Número Caso INT"
          value={form.numeroCasoInt}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />

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
          className="rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Guardar Caso
        </button>
      </form>
    </div>
  );
};
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/auth";

const loginSchema = z.object({
  correo: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [error, setError] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError("");
      const response = await login(data);
      authLogin(response.token, {
        id: response.id,
        nombre: response.nombre,
        correo: response.correo,
        rol: response.rol,
      });
      navigate("/");
    } catch (err: unknown) {
      const mensajeServidor = axios.isAxiosError(err) ? err.response?.data?.message : null;
      setError(mensajeServidor || "No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.");
    }
  };

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex xl:px-20 xl:py-14">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[30rem] rounded-full bg-blue-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-36 size-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />

        <div className="relative z-10">
          <img
            src="https://www.comware.com.co/wp-content/uploads/logo-blanco.png"
            alt="ComWare"
            className="h-10 w-auto max-w-52 object-contain object-left"
          />
        </div>

        <div className="relative z-10 my-14 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium tracking-wide text-blue-100">
            <Sparkles size={14} /> OPERACIÓN Y SOPORTE
          </div>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
            Cada caso, con su historia completa.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Gestiona incidentes, seguimiento y tiempos de atención desde un solo lugar.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-blue-400/15 text-blue-200"><ShieldCheck size={18} /></span>
              <p className="text-sm font-medium text-white">Seguimiento seguro</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Acceso según tu perfil de trabajo.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200"><LockKeyhole size={18} /></span>
              <p className="text-sm font-medium text-white">Trazabilidad</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Historial y documentación por caso.</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">Sistema de Bitácora · Soporte técnico</p>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:bg-white">
        <div className="w-full max-w-[27rem]">
          <div className="mb-8 lg:hidden">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">B</span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">ComWare · Soporte</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-9 lg:border-0 lg:p-0 lg:shadow-none">
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-700">Bienvenido</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Inicia sesión</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Ingresa tus credenciales corporativas para continuar.</p>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">!</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div>
                <label htmlFor="correo" className="mb-2 block text-sm font-medium text-slate-700">Correo electrónico</label>
                <div className={`flex items-center rounded-xl border bg-white transition focus-within:ring-4 ${errors.correo ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100" : "border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-100"}`}>
                  <Mail size={18} className="ml-3.5 shrink-0 text-slate-400" />
                  <input
                    id="correo"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={!!errors.correo}
                    aria-describedby={errors.correo ? "correo-error" : undefined}
                    {...register("correo")}
                    placeholder="nombre@empresa.com"
                    className="w-full rounded-xl bg-transparent px-3.5 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                {errors.correo && <p id="correo-error" className="mt-1.5 text-xs text-red-600">{errors.correo.message}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                </div>
                <div className={`flex items-center rounded-xl border bg-white transition focus-within:ring-4 ${errors.password ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100" : "border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-100"}`}>
                  <LockKeyhole size={18} className="ml-3.5 shrink-0 text-slate-400" />
                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    {...register("password")}
                    placeholder="Ingresa tu contraseña"
                    className="w-full min-w-0 rounded-xl bg-transparent px-3.5 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((actual) => !actual)}
                    aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="mr-2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p id="password-error" className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? "Validando acceso…" : "Ingresar a Bitácora"}
                {!isSubmitting && <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>

            <p className="mt-7 text-center text-xs leading-5 text-slate-400">
              Si tienes problemas para ingresar, comunícate con el administrador del sistema.
            </p>
          </div>
          <p className="mt-6 text-center text-[11px] text-slate-400">© {new Date().getFullYear()} Sistema de Bitácora</p>
        </div>
      </section>
    </main>
  );
};

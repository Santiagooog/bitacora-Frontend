import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  cargarAnsCsv,
  type CargaMasivaAnsResponse,
  type TipoCargaAns,
} from "../../api/ans";

const TIPOS: { value: TipoCargaAns; label: string; ayuda: string }[] = [
  {
    value: "POR_SERVICIO",
    label: "ANS por Servicio",
    ayuda: "sban;tiempo_sdwan;tiempo_wifi_publico;tiempo_control_acceso",
  },
  {
    value: "SDWAN",
    label: "ANS SDWAN",
    ayuda: "sban;tiempo_sdwan",
  },
  {
    value: "WIFI_PUBLICO",
    label: "ANS WiFi Público",
    ayuda: "sban;tiempo_wifi_publico",
  },
  {
    value: "CONTROL_ACCESO",
    label: "ANS Control de Acceso",
    ayuda: "sban;tiempo_control_acceso",
  },
];

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CargaAnsModal = ({ onClose, onSuccess }: Props) => {
  const queryClient = useQueryClient();
  const [tipo, setTipo] = useState<TipoCargaAns>("POR_SERVICIO");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [resultado, setResultado] = useState<CargaMasivaAnsResponse | null>(
    null
  );

  const tipoActual = TIPOS.find((t) => t.value === tipo);

  const mutation = useMutation({
    mutationFn: () => cargarAnsCsv(file!, tipo),
    onSuccess: (data) => {
      setResultado(data);
      queryClient.invalidateQueries({ queryKey: ["ans"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Error al cargar el archivo");
    },
  });

  const handleFile = (f: File | null) => {
    setFile(f);
    setResultado(null);
    if (!f) {
      setPreview([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result ?? "");
      setPreview(text.split(/\r?\n/).slice(0, 4));
    };
    reader.readAsText(f);
  };

  const handleCambioTipo = (nuevoTipo: TipoCargaAns) => {
    setTipo(nuevoTipo);
    setResultado(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Cargar ANS desde archivo</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selector de tipo */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tipo de ANS
          </label>
          <select
            value={tipo}
            onChange={(e) => handleCambioTipo(e.target.value as TipoCargaAns)}
            className="w-full rounded-lg border p-2"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Input de archivo */}
        <div className="mb-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 hover:border-blue-400">
            <Upload size={28} className="mb-2 text-slate-400" />
            <span className="text-sm text-slate-600">
              {file ? file.name : "Haz clic para seleccionar .csv o .txt"}
            </span>
            <span className="mt-1 text-center text-xs text-slate-400">
              Delimitado por punto y coma (;). Formato:{" "}
              <code className="rounded bg-slate-100 px-1">
                {tipoActual?.ayuda}
              </code>
            </span>
            <input
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {/* Preview */}
        {preview.length > 0 && !resultado && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">
              <FileText size={14} />
              Vista previa
            </div>
            <pre className="overflow-x-auto text-xs text-slate-700">
              {preview.join("\n")}
            </pre>
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-medium text-green-800">
              <CheckCircle2 size={18} />
              Carga finalizada
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-900">
              <div>
                Total líneas: <strong>{resultado.totalLineas}</strong>
              </div>
              <div>
                Creados: <strong>{resultado.creados}</strong>
              </div>
              <div>
                Omitidos: <strong>{resultado.omitidos}</strong>
              </div>
              <div>
                Errores: <strong>{resultado.errores}</strong>
              </div>
            </div>
            {resultado.detalles.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-green-700">
                  <AlertTriangle size={12} className="inline" /> Ver detalles
                </summary>
                <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-slate-600">
                  {resultado.detalles.slice(0, 100).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                  {resultado.detalles.length > 100 && (
                    <li className="italic">
                      ...y {resultado.detalles.length - 100} más
                    </li>
                  )}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            {resultado ? "Cerrar" : "Cancelar"}
          </button>
          {!resultado && (
            <button
              onClick={() => mutation.mutate()}
              disabled={!file || mutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Procesando...
                </>
              ) : (
                "Cargar"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
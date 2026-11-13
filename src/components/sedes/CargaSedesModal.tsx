import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload, X, FileText, Download, Loader2, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { cargarSedesCsv, type CargaMasivaSedeResponse } from "../../api/sedes";

const PLANTILLA = `SBAN;SEDE;MUNICIPIO;REGIONAL;DPTO;Direccion;HORARIO;ATENCION
250;BOGOTA - PALOQUEMAO;Bogota D.C.;BOGOTA;Bogota D.C;Avenida Calle 19 No 25-04;LUNES A VIERNES;8:00 A.M. A 3:00 P.M.
590;BOGOTA - BARRIO RESTREPO;Bogota D.C.;BOGOTA;Bogota D.C;Cra.18 No.15-31;LUNES A VIERNES;9:00 A.M. A 4:00 P.M.
`;

interface Props {
  onClose: () => void;
}

export const CargaSedesModal = ({ onClose }: Props) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [resultado, setResultado] = useState<CargaMasivaSedeResponse | null>(null);

  const mutation = useMutation({
    mutationFn: () => cargarSedesCsv(file!),
    onSuccess: (data) => {
      setResultado(data);
      queryClient.invalidateQueries({ queryKey: ["sedes"] });
      queryClient.invalidateQueries({ queryKey: ["regionales"] });
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

  const descargarPlantilla = (formato: "csv" | "txt") => {
    const mime = formato === "csv" ? "text/csv" : "text/plain";
    const blob = new Blob([PLANTILLA], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla_sedes.${formato}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Cargar sedes desde archivo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 flex gap-3">
          <button
            onClick={() => descargarPlantilla("csv")}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Download size={16} />
            Plantilla .csv
          </button>
          <button
            onClick={() => descargarPlantilla("txt")}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Download size={16} />
            Plantilla .txt
          </button>
        </div>

        <div className="mb-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 hover:border-blue-400">
            <Upload size={28} className="mb-2 text-slate-400" />
            <span className="text-sm text-slate-600">
              {file ? file.name : "Haz clic para seleccionar .csv o .txt"}
            </span>
            <span className="mt-1 text-xs text-slate-400">
              Delimitado por punto y coma (;) — Headers: SBAN;SEDE;MUNICIPIO;REGIONAL;DPTO;Direccion;HORARIO;ATENCION
            </span>
            <input
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

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

        {resultado && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-medium text-green-800">
              <CheckCircle2 size={18} />
              Carga finalizada
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-900">
              <div>Total líneas: <strong>{resultado.totalLineas}</strong></div>
              <div>Creados: <strong>{resultado.creados}</strong></div>
              <div>Omitidos: <strong>{resultado.omitidos}</strong></div>
              <div>Errores: <strong>{resultado.errores}</strong></div>
            </div>
            {resultado.detalles.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-green-700">
                  <AlertTriangle size={12} className="inline" /> Ver detalles
                </summary>
                <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-slate-600">
                  {resultado.detalles.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

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
                <><Loader2 className="animate-spin" size={16} /> Procesando...</>
              ) : ("Cargar")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
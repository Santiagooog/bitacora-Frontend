import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const directorioDist = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const tiposContenido = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const servidor = createServer(async (solicitud, respuesta) => {
  try {
    const rutaUrl = new URL(solicitud.url || "/", "http://localhost");
    const rutaSolicitada = decodeURIComponent(rutaUrl.pathname);
    let archivo = resolve(directorioDist, `.${rutaSolicitada}`);

    if (archivo !== directorioDist && !archivo.startsWith(`${directorioDist}${sep}`)) {
      respuesta.writeHead(400).end("Solicitud inválida");
      return;
    }

    try {
      if ((await stat(archivo)).isDirectory()) archivo = resolve(archivo, "index.html");
    } catch {
      // React Router maneja rutas de la aplicación que no son archivos físicos.
      archivo = resolve(directorioDist, "index.html");
    }

    const contenido = await readFile(archivo);
    respuesta.writeHead(200, {
      "Content-Type": tiposContenido[extname(archivo)] || "application/octet-stream",
      "Cache-Control": archivo.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    respuesta.end(contenido);
  } catch {
    respuesta.writeHead(404).end("No encontrado");
  }
});

const puerto = Number(process.env.PORT || 4173);
servidor.listen(puerto, "0.0.0.0", () => {
  console.log(`Frontend disponible en el puerto ${puerto}`);
});

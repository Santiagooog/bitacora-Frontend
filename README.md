# Sistema de Bitácora

Aplicación web para registrar, asignar y dar seguimiento a casos de soporte en las sedes. El proyecto está separado en dos repositorios: este frontend y una API construida con Spring Boot.

## Repositorios

- Frontend: [bitacora-Frontend](https://github.com/Santiagooog/bitacora-Frontend)
- Backend: [bitacora-backend](https://github.com/Santiagooog/bitacora-backend)

## Funcionalidades

- Inicio de sesión y gestión de usuarios.
- Asignación de acceso a proyectos por usuario; los administradores tienen acceso a todos los proyectos.
- Catálogo de servicios y proyectos administrable.
- Gestión de casos, seguimiento de estados, escalamiento, categorías y trazabilidad.
- Consulta de activos por sede y servicio, con carga desde archivo.
- Configuración y visualización del ANS; el tiempo restante se muestra en horas y minutos.
- Dashboard con filtros, gráficas y exportación a Excel. Cada gráfica puede descargarse como PNG.
- Exportación a Excel del historial y la trazabilidad de los casos.

## Tecnologías

| Componente | Tecnologías |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Query, Recharts |
| Backend | Java 17, Spring Boot, Spring Security, Spring Data JPA, Maven |
| Base de datos | MySQL |

## Requisitos

- Node.js y pnpm.
- Java 17.
- MySQL.
- Git.

## Ejecutar el frontend

Desde la carpeta de este repositorio:

```bash
pnpm install
pnpm dev
```

Vite mostrará la dirección local; normalmente es `http://localhost:5173`. El cliente HTTP usa `VITE_API_URL` para ubicar el backend. Copia `.env.example` a `.env.local` para el desarrollo local; en el proveedor de despliegue configura la misma variable con la URL pública de la API, por ejemplo `https://api.ejemplo.com/api`.

Comandos disponibles:

```bash
pnpm build   # verifica TypeScript y genera la versión de producción en dist/
pnpm lint    # ejecuta ESLint
pnpm preview # sirve localmente el build generado
```

## Ejecutar el backend

Clona el repositorio del backend y entra en la carpeta del proyecto Maven:

```bash
git clone https://github.com/Santiagooog/bitacora-backend.git
cd bitacora-backend/bitacora
```

Configura las variables de entorno antes de iniciar Spring Boot. En PowerShell:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/bitacora_soporte?createDatabaseIfNotExist=true&serverTimezone=UTC"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "<contraseña-de-MySQL>"
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$env:BITACORA_INITIAL_ADMIN_PASSWORD = "<contraseña-inicial-segura>"
```

`JWT_SECRET` debe ser una clave Base64 aleatoria de al menos 32 bytes. En IntelliJ IDEA configura estas variables en la ejecución local sin guardar sus valores en Git. El backend exige `JWT_SECRET` al arrancar; cambiarla invalida las sesiones existentes. Para una publicación, configura también `FRONTEND_URL` con el origen HTTPS exacto del frontend.

Inicia la API:

```powershell
.\mvnw.cmd spring-boot:run
```

La API queda disponible en `http://localhost:8080/api`. Spring Boot actualiza el esquema de MySQL al iniciar (`spring.jpa.hibernate.ddl-auto=update`), adecuado para desarrollo y staging inicial. La cuenta administradora inicial se crea únicamente si aún no existe y `BITACORA_INITIAL_ADMIN_PASSWORD` tiene un valor. Su correo inicial es `admin@bitacora.com`; cambia la contraseña después del primer acceso.

También puedes configurar las variables de entorno en la configuración de ejecución de IntelliJ IDEA. No guardes contraseñas ni tokens en el repositorio.

## Datos operativos

Los archivos CSV con inventario, sedes y parámetros de ANS no están incluidos en el repositorio. Se excluyen porque contienen datos operativos de la empresa. Cárgalos desde las opciones de importación de la aplicación o mantenlos en un medio privado y autorizado. Los inicializadores del backend omiten la carga si los archivos no están disponibles.

## Acceso por proyectos

Al crear un usuario que no sea administrador, selecciona al menos un proyecto en la lista de permisos. El backend aplica ese alcance en las consultas de casos, dashboard, historial y exportaciones. Los usuarios ADMIN pueden consultar todos los proyectos.

## Desarrollo

Ejecuta frontend y backend en terminales separadas. El frontend requiere que la API esté activa y que la base de datos esté configurada. Para cambios de configuración local, usa variables de entorno o archivos locales ignorados por Git; no publiques credenciales ni datos reales de inventario.

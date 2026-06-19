# MiCasita SUS — Backend

API REST para la evaluación de usabilidad SUS del sistema MiCasita (OE4-I1).  
Stack: **Node.js · Express · PostgreSQL (pg)**

---

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/sessions` | Todas las sesiones registradas |
| POST | `/api/sessions` | Registrar nueva sesión SUS |
| DELETE | `/api/sessions/:id` | Eliminar sesión |
| GET | `/api/stats` | Estadísticas agregadas (avg, std, tarea rates, etc.) |
| GET | `/api/sessions/export/csv` | Exportar datos como CSV |

---

## Instalación local

```bash
npm install
cp .env.example .env   # completar con credenciales locales
node server.js          # producción
npm run dev             # desarrollo (nodemon con hot-reload)
```

La tabla `sus_sessions` se crea automáticamente al iniciar (`IF NOT EXISTS`).

## Cargar datos de prueba

```bash
node seed.js
```

Inserta los 20 participantes reales del experimento SUS (OE4-I1, Mayo 2026).  
**Ejecutar solo una vez** sobre una tabla vacía.

---

## Variables de entorno

Copiar `.env.example` → `.env` y completar:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `FRONTEND_URL` | URL(s) del frontend para CORS (comas) | `https://tu-app.netlify.app` |
| `PORT` | Puerto (Railway lo inyecta solo) | `3000` |

---

## Deploy en Railway

1. [railway.app](https://railway.app) → **New Project** → Deploy from GitHub repo
2. Agregar plugin **PostgreSQL** → Railway genera `DATABASE_URL` automáticamente
3. En **Variables** del servicio agregar:
   - `FRONTEND_URL` = URL de tu Netlify (ej. `https://micasita-sus.netlify.app`)
4. Railway detecta `npm start` y despliega solo
5. Tabla se crea al primer arranque — no necesitas migraciones manuales
6. Copiar la URL pública del servicio y pegarla en el frontend

---

## Deploy con Supabase

Supabase no despliega un servidor Express como `server.js`. Lo que sí te da gratis es la base de datos PostgreSQL, autenticación, storage y funciones serverless.

### Opción recomendada

1. Crear un proyecto en Supabase
2. Ir a `Project Settings` → `Database` → `Connection string`
3. Copiar la cadena `URI` y pegarla en `DATABASE_URL`
4. Agregar `PGSSLMODE=require` en tu `.env` o en las variables del host
5. Desplegar el backend Express en otro host gratuito para Node.js

### Si quieres que todo viva dentro de Supabase

Tendrías que reescribir este backend como `Supabase Edge Functions`.
Eso implica cambiar rutas Express por funciones Deno y adaptar la lógica de `Pool` y `app.get/app.post` a handlers de Supabase.

### Importante

El frontend no debe hacer fetch a `https://<tu-proyecto>.supabase.co/api/...`.
Ese dominio es de la base de datos y del panel de Supabase, no de tu API Express.
La URL que debe usar tu frontend es la del backend donde publiques `server.js`.

Si hoy ves errores de CORS con una URL de Supabase, significa que la variable de entorno del frontend apunta al host equivocado.
Corrígela para que apunte al backend real, por ejemplo `https://tu-backend.onrender.com` o `https://tu-backend.railway.app`.

Si lo vas a correr localmente, basta con crear tu `.env` así:

```bash
DATABASE_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres
PGSSLMODE=require
FRONTEND_URL=http://localhost:5173
PORT=3000
```

La tabla `sus_sessions` se crea sola al arrancar, así que no necesitas migraciones.

---

## Estructura

```
backend/
├── server.js        # API principal
├── seed.js          # Carga de datos de prueba (solo dev)
├── package.json
├── .env             # NO subir al repo (en .gitignore)
├── .env.example     # Plantilla de variables
└── .gitignore
```

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

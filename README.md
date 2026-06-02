# Slip — Catálogo

Web app para mostrar pantuflas: catálogo público, detalle con WhatsApp, panel admin (CRUD).

## Stack

- **Frontend:** React + Vite + Tailwind
- **Backend:** Node + Express
- **DB:** SQLite en `DATA_DIR` (volumen en Railway)
- **Imágenes:** carpeta `uploads` en el mismo volumen

## Desarrollo local

```bash
npm install
cp .env.example .env
# Editar .env: ADMIN_PASSWORD, JWT_SECRET, WHATSAPP_NUMBER

npm run db:seed   # productos de ejemplo (solo si la DB está vacía)
npm run dev       # API :3001 + web :5173
```

- Sitio: http://localhost:5173  
- Admin: http://localhost:5173/admin/login (contraseña en `ADMIN_PASSWORD`)

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATA_DIR` | Carpeta de datos (default `./data` local, `/data` en Railway) |
| `WHATSAPP_NUMBER` | Solo dígitos, ej. `595993290388` |
| `ADMIN_PASSWORD` | Contraseña del admin |
| `JWT_SECRET` | Secreto para sesión admin |
| `PORT` | Puerto del servidor (default `3001`) |

## Deploy en Railway

### 1. Subir el código a GitHub

```bash
git remote add origin https://github.com/mbeghe/slip.git
git branch -M main
git push -u origin main
```

### 2. Crear el proyecto en Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → elegí `slip`.
2. **Volume:** Add Volume → mount path **`/data`** (misma región que el servicio).
3. **Variables** (Settings → Variables):

| Variable | Valor |
|----------|--------|
| `DATA_DIR` | `/data` |
| `NODE_ENV` | `production` |
| `WHATSAPP_NUMBER` | solo dígitos, ej. `595993290388` |
| `ADMIN_PASSWORD` | contraseña fuerte (no la de desarrollo) |
| `JWT_SECRET` | string largo aleatorio |

4. Deploy automático con el `Dockerfile`. Healthcheck: `/api/config`.

### 3. Después del deploy

- Sitio: URL que te da Railway (Settings → Networking → **Generate Domain**).
- Admin: `https://tu-dominio.up.railway.app/admin/login`
- Cargá productos e imágenes; la DB y `uploads` quedan en el volumen.

Los deploys nuevos **no borran** productos ni fotos si el volumen sigue en `/data`.

## Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | API + web en desarrollo |
| `npm run build` | Build producción |
| `npm start` | Solo API (sirve `web/dist` si existe) |
| `npm run db:seed` | Datos de ejemplo |
| `npm run db:sync-prices` | Pone todos los productos en Gs. 250.000 |

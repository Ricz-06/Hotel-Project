# README: Setup y ejecución

## Requisitos
- Node.js LTS
- Postgres (con `DATABASE_URL` en `.env`)

## 1) Backend
Carpeta: `backend/`

### Instalar dependencias
```bash
npm install
```

### Variables de entorno
Crea `.env` dentro de `backend/` con al menos:
- `DATABASE_URL`
- `SESSION_SECRET` (opcional)

Ejemplo:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nombre_db"
SESSION_SECRET="hotel_aurora_secret"
```

### Migrar y generar Prisma
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Seed (crear admin + habitaciones)
```bash
npm run seed
```

### Ejecutar en desarrollo
```bash
npm run dev
```

El servidor escucha en:
- `http://127.0.0.1:3000`

## 2) Frontend
El frontend se sirve desde archivos estáticos (por los fetch a `http://127.0.0.1:3000`).

Asegúrate de servir la carpeta `Frontend/` desde un servidor estático compatible con CORS.
En el proyecto se contemplan:
- `http://localhost:5501`

## 3) Credenciales iniciales (seed)
- ADMIN: `admin@hotel.com`
- Password: `1234`

## 4) Comandos útiles
- Ver modelos Prisma:
  - `npx prisma studio`


# Documentación (Prisma + PostgreSQL) — Hotel Aurora

## 1) Resumen
Hotel Aurora es una aplicación web para gestionar reservas y habitaciones mediante una API REST.

- **Frontend**: HTML/CSS/JS (carpeta `Frontend/`).
- **Backend**: Node.js + Express (carpeta `backend/`).
- **Base de datos**: **PostgreSQL** usando **Prisma** (carpeta `backend/prisma/`).

> Nota: existen archivos `.sql` en `backend/sql/`, pero el backend principal usa Prisma como capa de datos.

---

## 2) Estructura del backend

- `backend/index.js`
  - Inicializa Express.
  - Define los endpoints (auth, clientes, habitaciones, solicitudes, facturas).
  - Inicia el servidor en `PORT` (default 3000).

- `backend/prisma/`
  - `schema.prisma`: modelo de datos + enums (incluye `Role`, `TipoCliente`, etc.).
  - `client.js`: PrismaClient.
  - `seed.js`: carga datos iniciales.

- `backend/controllers/`
  - `authController.js`: register/login/ver usuarios.
  - `clientesController.js`: CRUD de clientes.
  - `habitacionesController.js`: CRUD y ocupación/liberación.
  - `solicitudesController.js`: CRUD de solicitudes y aprobación/rechazo.
  - `facturasController.js`: CRUD de facturas.

---

## 3) Modelo de datos (Prisma)

### 3.1 Role (roles)
En `schema.prisma`:
- `enum Role { ADMIN, USER }`
- `Usuario.role` por defecto es `USER`.

**Objetivo del rol:** en una implementación completa, el backend debería aplicar permisos según `role`. En el repo actual, el control de acceso por role no está centralizado en un middleware visible; el panel se gestiona desde el frontend y la sesión local.

### 3.2 Usuario y unicidad
- `Usuario`:
  - `correo: String @unique`

Esto significa:
- No se pueden crear dos usuarios con el mismo `correo`.
- Si se intenta registrar un correo existente, Prisma/DB lanza un error y el backend responde un mensaje controlado (por ejemplo: `Correo ya registrado`).

---

## 4) Auth (login / register)
Archivos:
- `backend/controllers/authController.js`
- `backend/index.js` (rutas)

### 4.1 Endpoints
- `POST /registrar`
- `POST /login`
- `GET /db-users` (listar usuarios sin password; útil para pruebas)

### 4.2 Flujo de registro
1. El frontend manda `{ nombre, correo, password }`.
2. El backend hace `prisma.usuario.create(...)`.
3. Si el `correo` ya existe (UNIQUE):
   - responde con error `Correo ya registrado`.
4. Si no existe:
   - crea el usuario y retorna datos seguros (sin devolver password en respuesta de login; en register retorna lo seleccionado en select}).

### 4.3 Flujo de login
1. El frontend manda `{ correo, password }`.
2. El backend hace `prisma.usuario.findUnique({ where: { correo } })`.
3. Si no existe usuario o la contraseña no coincide:
   - responde `401 Datos incorrectos`.
4. Si coincide:
   - responde `Login correcto` y retorna el usuario sin `password`.

---

## 5) Clientes
Archivo:
- `backend/controllers/clientesController.js`

### Endpoints
- `GET /clientes`
- `POST /clientes`
- `POST /clientes/eliminar`
- `PUT /clientes/actualizar`

### Reglas
- Al eliminar un cliente:
  - se liberan sus habitaciones (`clienteId = null` y `estado = 'Libre'`).

---

## 6) Habitaciones
Archivo:
- `backend/controllers/habitacionesController.js`

### Endpoints
- `GET /habitaciones`
- `POST /habitaciones`
- `PUT /habitaciones/ocupar`
- `PUT /habitaciones/liberar`
- `POST /habitaciones/eliminar`

### Reglas VIP vs Normal
- Si el cliente es `VIP`:
  - solo puede ocupar habitación `VIP`.
- Si el cliente es `Normal`:
  - no puede ocupar habitación `VIP`.

Además:
- `numero` de habitación es único (`numero Int @unique` en Prisma).

---

## 7) Solicitudes de reserva
Archivo:
- `backend/controllers/solicitudesController.js`

### Endpoints
- `GET /solicitudes`
- `POST /solicitudes`
- `PUT /solicitudes/aprobar/:id`
- `PUT /solicitudes/rechazar/:id`

### Flujo al aprobar
1. Busca la solicitud por `id`.
2. Crea un `Cliente` con `nombre` y `tipo` derivado de `tipo_habitacion`.
3. Busca una habitación libre (`estado: 'Libre'`) del tipo requerido.
4. Si hay habitación libre:
   - marca habitación como `ocupada`
   - asigna `clienteId`
   - elimina la solicitud.
5. Si no hay habitación libre:
   - responde error `No hay habitaciones libres`.

### Flujo al rechazar
- Elimina la solicitud sin crear cliente ni asignar habitación.

---

## 8) Facturas
Archivo:
- `backend/controllers/facturasController.js`

### Endpoints
- `GET /facturas`
- `POST /facturas`

---

## 9) Cómo ejecutar (Prisma)

1. Entrar a `backend/`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar entorno para Prisma (variable `DATABASE_URL`) en `.env`:
   - debe apuntar a PostgreSQL.
4. Generar Prisma Client y ejecutar:
   ```bash
   npm run generate
   npm run dev   # o node server/index según tu configuración
   ```

5. (Opcional) Cargar seed:
   ```bash
   npm run seed
   ```

---

## 10) Resumen de “qué ve” cada rol (conceptual)
Con `Role` en Prisma:

- **ADMIN**: control total del sistema (panel admin).
- **USER**: acceso limitado (operaciones del día a día).

Para que esto sea 100% real en backend, se recomienda agregar un middleware `requireRole(ADMIN)` antes de rutas sensibles.

---

## 11) Documentación extra
- Archivo base: `Documentacion/Readme.md` (anterior)
- Nueva doc creada: `Documentacion/NuevaDocumentacionPrisma.md`


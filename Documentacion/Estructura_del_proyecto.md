# Estructura del proyecto

Este documento resume la estructura por carpetas del repo para ubicar rápidamente componentes.

---

## Mapa UML (carpetas y conexiones)

```mermaid
flowchart TB
  subgraph Repo[Hotel-Project]
    subgraph BE[Backend (Node/Express + Prisma)]
      BE_index[index.js] --> BE_core[app: rutas + middlewares]
      BE_mw[middleware/] --> BE_auth[authMiddleware.js]
      BE_ctrl[controllers/] --> BE_domains[dominios]
      BE_prisma[prisma/] --> BE_db[(Postgres)]
      BE_routes[Routes/] --> BE_core
      BE_seed[seed.js] --> BE_db
    end

    subgraph FE[Frontend]
      FE_pages[HTML pages] --> FE_scripts[JS scripts]
      FE_pages --> FE_ui[UI (admin/login/perfil/etc)]
    end

    subgraph DOC[Documentación]
      DOC1[README_API.md]
      DOC2[README_Rutas_y_Funciones.md]
      DOC3[README_Setup_y_Ejecucion.md]
      DOC4[Estructura_del_proyecto.md]
      DOC1 --- DOC2 --- DOC3 --- DOC4
    end
  end

  FE_scripts -->|fetch| BE_core
  FE_scripts -->|fetch| BE_auth
  BE_core -->|JSON responses| FE_scripts
  BE_db -->|datos| BE_prisma
```

---

## Raíz
- `backend/`
- `Frontend/`
- `Documentacion/`
- `Imagenes/`

---

## Árbol de carpetas (estilo consola)

```text
.
├─ backend/
│  ├─ index.js
│  ├─ server.js
│  ├─ package.json
│  ├─ controllers/
│  │  ├─ authController.js
│  │  ├─ clientesController.js
│  │  ├─ habitacionesController.js
│  │  ├─ solicitudesController.js
│  │  └─ facturasController.js
│  ├─ middleware/
│  │  └─ authMiddleware.js
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  ├─ client.js
│  │  └─ seed.js
│  ├─ Routes/
│  │  ├─ auth.js
│  │  ├─ clientes.js
│  │  ├─ habitaciones.js
│  │  ├─ solicitudes.js
│  │  ├─ facturas.js
│  │  └─ recover.js
│  ├─ sql/
│  │  └─ add_servicios_habitaciones.sql
│  └─ utils/
│
├─ Frontend/
│  ├─ *.html (index, login, admin, perfil, alojamiento, reserva, facturacion, restaurante, ...)
│  ├─ *.js (app.js, login.js, perfil.js, reservas.js, facturacion.js, restaurant.js, verHabitaciones.js, roleNav.js, script.js, ...)
│  └─ *.css (style.css, admin.css, login.css, ...)
│
├─ Documentacion/
│  ├─ README_API.md
│  ├─ README_Rutas_y_Funciones.md
│  ├─ README_Setup_y_Ejecucion.md
│  ├─ Roles_y_Estructura.md
│  └─ Estructura_del_proyecto.md
└─ Imagenes/
   └─ images.jpg
```


---

## `backend/`

### Archivos principales
- `index.js`
- `server.js`
- `package.json`

### Carpetas
- `controllers/`
  - `authController.js` (registrar/login/ver usuarios)
  - `clientesController.js` (CRUD clientes)
  - `habitacionesController.js` (CRUD/Ocupar/Liberar habitaciones)
  - `solicitudesController.js` (crear/ver/aprobar/rechazar)
  - `facturasController.js` (crear/ver)

- `middleware/`
  - `authMiddleware.js` (`requireAuth`, `requireRole`)

- `prisma/`
  - `schema.prisma` (modelos y enums)
  - `client.js` (instancia Prisma)
  - `seed.js` (seed con admin + habitaciones)
  - `migrations/` (migraciones de Prisma)

- `Routes/`
  - `auth.js`
  - `clientes.js`
  - `habitaciones.js`
  - `solicitudes.js`
  - `facturas.js`
  - `recover.js`

- `sql/`
  - `add_servicios_habitaciones.sql` (migración SQL para columna `servicios`)

- `utils/` (carpeta presente; contiene utilidades si existen)

---

## `Frontend/`

### Páginas HTML
- `index.html`
- `login.html`
- `admin.html`
- `perfil.html`
- `alojamiento.html`
- `reserva.html`
- `facturacion.html`
- `restaurante.html`

### Scripts JS
- `app.js`
- `login.js`
- `perfil.js`
- `reserva.js` (si aplica; revisa el nombre exacto en tu repo)
- `reservas.js`
- `facturacion.js`
- `restaurant.js`
- `verHabitaciones.js`
- `roleNav.js`
- `script.js`

### Estilos CSS
- `style.css`
- `admin.css`
- `login.css`

- `Readme.md` (si aplica)

---

## `Documentacion/`
- `Roles_y_Estructura.md`
- `README_API.md`
- `README_Rutas_y_Funciones.md`
- `README_Setup_y_Ejecucion.md`
- `Estructura_del_proyecto.md` (este archivo)

---

## `Imagenes/`
- `images.jpg` (u otras imágenes del proyecto)



Hecho: a continuación te entrego un README.md completo y reescrito en español, con estructura del proyecto, resumen de endpoints (tomado del README original), diagramas UML (mermaid) y notas de despliegue/verificación. He usado como evidencia el README original en:
c:/Users/Borut/OneDrive/Desktop/Hotel-Project-master/Hotel-Project-master/README.md
y la página Frontend facturacion.html (ruta: Frontend/facturacion.html) para asegurar consistencia con la estructura y convenciones del frontend.

Copia y pega el contenido siguiente a un archivo README.md en la raíz del proyecto:

---
# Hotel Transilvania — Documentación del proyecto

Resumen
- Proyecto full-stack para la gestión básica de un hotel: reservas, clientes, habitaciones y solicitudes administrativas.
- Backend: Node.js + Express (con posible uso de Prisma y MySQL según el README original).
- Frontend: páginas HTML estáticas en la carpeta Frontend con CSS y JS.
- Este README reemplaza/actualiza la documentación original y añade diagramas UML para facilitar comprensión.

Índice
1. Estructura del proyecto
2. Endpoints principales (resumen)
3. Diagramas UML (mermaid)
   - Arquitectura por capas
   - Flujo de reserva
4. Archivos clave del Frontend (ejemplo)
5. Cómo ejecutar / Verificación rápida
6. Cambios recientes y recomendaciones
7. Notas y próximos pasos

1) Estructura del proyecto (resumen)
Basado en la documentación original y en los ficheros del proyecto:

/
├─ backend/
│  ├─ server.js
│  ├─ db.js
│  ├─ controllers/
│  │  ├─ authController.js
│  │  ├─ clientesController.js
│  │  ├─ habitacionesController.js
│  │  └─ solicitudesController.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ clientes.js
│  │  ├─ habitaciones.js
│  │  └─ solicitudes.js
│  ├─ prisma/ (opcional)
│  │  └─ schema.prisma
│  └─ sql/
│     └─ add_servicios_habitaciones.sql
├─ Frontend/
│  ├─ index.html
│  ├─ alojamiento.html
│  ├─ reserva.html
│  ├─ admin.html
│  ├─ restaurante.html
│  ├─ facturacion.html                 ← ejemplo: presente y revisado
│  ├─ perfil.html
│  ├─ css/  ó style.css
│  ├─ js/   (restaurant.js, script.js, facturacion.js, roleNav.js, etc.)
│  └─ assets/ (imágenes, íconos)
└─ README.md  ← este archivo

Nota: la presencia de facturacion.html (Frontend/facturacion.html) se verificó en la copia de proyecto usada como referencia.

2) Endpoints principales (resumen)
(Extraído y consolidado del README original)

Autenticación
- POST /auth/register
- POST /auth/login

Clientes
- GET /clientes
- POST /clientes
- PUT /clientes/actualizar
- POST /clientes/eliminar

Habitaciones
- GET /habitaciones
- POST /habitaciones
- PUT /habitaciones/ocupar
- PUT /habitaciones/liberar
- POST /habitaciones/eliminar

Solicitudes / Reservas
- POST /solicitudes
- GET /solicitudes
- PUT /solicitudes/aprobar/:id
- PUT /solicitudes/rechazar/:id

Sistema
- GET /    (estado / landing)
- POST /reset

3) Diagramas UML (mermaid)

- Arquitectura por capas / Componentes

```mermaid
flowchart TB
  U[Usuario/Cliente] -->|Navega| FE[Frontend (HTML/JS/CSS)]
  FE -->|HTTP/REST| API[Backend - Node.js / Express]
  A[Admin] -->|Panel admin| FE2[Frontend Admin]
  FE2 --> API
  API --> DB[(MySQL)]
  API --> PRISMA[Prisma (schema.prisma)]
  API --> AUTH[Auth Controller]
  API --> CLI[Clientes Controller]
  API --> HAB[Habitaciones Controller]
  API --> SOL[Solicitudes Controller]
  AUTH --> DB
  CLI --> DB
  HAB --> DB
  SOL --> DB
```

- Flujo principal: Solicitud de reserva → aprobación → asignación

```mermaid
flowchart TD
  Cliente[Cliente completa formulario en reserva.html] -->|POST /solicitudes| API[Backend]
  API -->|guardar| DB[(solicitudes)]
  Admin[Administrador revisa solicitudes en admin.html] -->|GET /solicitudes| API
  Admin -->|PUT /solicitudes/aprobar/:id| API
  API --> BuscarSolicitud[1) Buscar solicitud en DB]
  BuscarSolicitud --> CrearCliente[2) Crear/actualizar cliente en tabla clientes]
  CrearCliente --> BuscarHabitacion[3) Buscar habitación libre del tipo solicitado]
  BuscarHabitacion --> AsignarHabitacion[4) Asignar habitación y marcar como ocupada]
  AsignarHabitacion --> EliminarSolicitud[5) Eliminar o marcar solicitud como procesada]
  EliminarSolicitud --> DB
  API --> FrontendAdmin[Actualizar UI del admin]
```

4) Archivos clave del Frontend (ejemplo)
- Frontend/facturacion.html — Página de facturación del restaurante, incluye cálculo de IVA, servicio y total; usa scripts: restaurant.js, script.js, facturacion.js (ver cabeceras del HTML).
- Frontend/restaurant.js, script.js, facturacion.js — scripts de UI (carrito, facturación, navegación por roles).
- style.css (o carpeta css/) — estilos globales; el proyecto usa Bootstrap 5 y fuentes de Google Fonts.

5) Cómo ejecutar / Verificación rápida

Backend
- Abrir terminal en la carpeta /backend
- Ejecutar:
  - npm install   (si es primera ejecución)
  - node server.js  (o npm start si está configurado)
- Verificar:
  - http://localhost:3000/  (o el puerto configurado)
  - Probar endpoints con curl/Postman (ej.: GET /habitaciones, GET /solicitudes)

Frontend
- Abrir archivos HTML desde la carpeta Frontend/ con un navegador.
- Recomendado: servir con Live Server o un servidor estático (python -m http.server 8000) para evitar problemas con rutas relativas a assets.
- Verificar que facturacion.html carga los scripts: restaurant.js, script.js y facturacion.js (tal como muestra el archivo revisado).

6) Cambios recientes y recomendaciones
- Origen de esta documentación: README original localizado en la ruta del proyecto y revisión de facturacion.html.
- Si añadiste archivos hoy (por ejemplo transilvania.html o imágenes), agrégalos a esta sección indicando ruta y motivo. Ejemplos de entradas sugeridas:
  - Frontend/transilvania.html — Nueva página temática Halloween/Transilvania (hero, galería, CTAs) — motivo: campaña estacional.
  - Frontend/assets/transilvania-hero.jpg — Imagen hero temática.
  - Frontend/style.css — Ajustes visuales para tema Transilvania.

Recomendaciones
- Mantener un CHANGELOG.md o usar mensajes de commit descriptivos para poder automatizar la sección "Cambios recientes" del README.
- Añadir un archivo CONTRIBUTING.md si el proyecto tendrá colaboradores.
- Documentar en README cualquier nueva ruta frontend que consuma el backend (nombre del endpoint y payload esperado).

7) Notas y próximos pasos
- Si quieres que incluya automáticamente una entrada "Cambios recientes" con los archivos que creaste hoy (por ejemplo transilvania.html y assets), dime exactamente las rutas de hasta 6 archivos y actualizaré el README con las descripciones formales.
- Puedo generar la página Frontend/transilvania.html temática y añadir las reglas CSS mínimas y placeholders de imágenes. Confirma si lo deseas y si quieres que actualice el README para reflejar esos archivos añadidos.
- Para visualizar los diagramas mermaid en el README, usa un visualizador compatible (VS Code con la extensión Mermaid o GitHub si soporta mermaid).

---

Si quieres, procedo a:
- 1) Guardar este contenido en README.md (dime que lo escriba).
- 2) Añadir la sección "Cambios recientes" con las rutas exactas si me ind

## TODO - Fix roles & recuperar

### Paso 1: Proteger `admin.html` por rol
- [ ] Actualizar `Frontend/app.js` para que haga guard al cargar:
  - llamar `GET /me` con `credentials: 'include'`
  - si no hay sesión => redirect `login.html`
  - si role !== 'ADMIN' => redirect `perfil.html`



### Paso 2: Arreglar redirección post-login
- [ ] Actualizar `Frontend/login.js`:
  - usar `credentials: 'include'` en `fetch` a `/login`
  - redirigir según `data.usuario.role`

### Paso 3: Recuperar con verificación (backend)
- [ ] Implementar endpoint en backend: `POST /recover`
- [ ] Actualizar `Frontend/login.js` para llamar ese endpoint en `type==='recuperar'`:
  - si no existe => error
  - si existe => éxito y volver a login

### Paso 4: Alinear reserva/solicitudes con autenticación
- [ ] Decidir si `POST /solicitudes` debe requerir login.
- [ ] Si aplica, agregar `requireAuth` a backend o validar en front.


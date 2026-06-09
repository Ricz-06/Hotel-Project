const API = "http://127.0.0.1:3000";

/* ===== LOGOUT ===== */
async function cerrarSesion() {
  try {
    await fetch(API + '/logout', { method: 'POST', credentials: 'include' });
  } catch (_) {}
  window.location.href = 'login.html';
}

/* ===== REGISTRO ===== */
async function handleRegistro() {
  const msg      = document.getElementById('registroMsg');
  const nombre   = document.getElementById('registroNombre').value.trim();
  const correo   = document.getElementById('registroCorreo').value.trim();
  const password = document.getElementById('registroPassword').value.trim();

  msg.style.display = 'none';

  if (!nombre || !correo || !password) {
    msg.style.display = 'block';
    msg.style.color = '#f87171';
    msg.textContent = 'Completa nombre, correo y contraseña.';
    return;
  }

  try {
    const res  = await fetch(API + '/registrar', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.style.display = 'block';
      msg.style.color = '#f87171';
      msg.textContent = data.error || 'Error al registrar.';
      return;
    }

    msg.style.display = 'block';
    msg.style.color = '#86efac';
    msg.textContent = '¡Cuenta creada! Redirigiendo al login...';
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);

  } catch (e) {
    msg.style.display = 'block';
    msg.style.color = '#f87171';
    msg.textContent = 'No se pudo conectar con el servidor.';
  }
}

/* ===== HELPERS ===== */
function mostrarNoAuth() {
  document.getElementById('noAuthBox').style.display        = 'block';
  document.getElementById('perfilAutenticado').style.display = 'none';
}

function estadoTag(estado) {
  const e = (estado || '').toLowerCase();
  const map = { pendiente: 'pendiente', aprobada: 'aprobada', rechazada: 'rechazada' };
  const cls = map[e] || 'pendiente';
  return `<span class="estado-tag ${cls}">${estado}</span>`;
}

/* ===== CARGAR PERFIL ===== */
async function cargarPerfil() {
  try {
    /* — /me — */
    const meRes = await fetch(API + '/me', { credentials: 'include' });
    if (!meRes.ok) { mostrarNoAuth(); return; }

    const meData = await meRes.json();
    const user   = meData.user;

    // Hero
    document.getElementById('perfilNombre').textContent = user.nombre  ?? '—';
    document.getElementById('perfilCorreo').textContent = user.correo  ?? '—';
    document.getElementById('perfilId').textContent     = `#${user.id}` ?? '—';
    document.getElementById('perfilAcceso').textContent =
      user.role === 'ADMIN' ? 'Administrador' : 'Usuario estándar';

    const badge = document.getElementById('perfilRoleBadge');
    badge.textContent  = user.role === 'ADMIN' ? 'ADMIN' : 'USER';
    badge.className    = `role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}`;
    badge.style.opacity = '1';

    if (user.role === 'ADMIN') {
      document.getElementById('avatarIcon').textContent = '⚙';
      document.getElementById('adminLinkBtn').style.display = 'inline-block';
    }

    /* — Solicitudes — */
    const solRes  = await fetch(API + '/mis-solicitudes', { credentials: 'include' });
    const solData = solRes.ok ? await solRes.json() : { solicitudes: [] };
    const solicitudes = Array.isArray(solData.solicitudes) ? solData.solicitudes : [];

    document.getElementById('countSolicitudes').textContent = solicitudes.length;

    if (solicitudes.length === 0) {
      document.getElementById('sinSolicitudes').style.display = 'block';
    } else {
      const tbody = document.getElementById('tablaSolicitudes');
      tbody.innerHTML = solicitudes.map(s => {
        const fecha = s.creadoEn ? new Date(s.creadoEn).toLocaleDateString('es-NI') : '—';
        return `
          <tr>
            <td>#${s.id}</td>
            <td>${s.tipo_habitacion}</td>
            <td>${estadoTag(s.estado)}</td>
            <td>${fecha}</td>
          </tr>`;
      }).join('');
    }

    /* — Facturas — */
    const facRes  = await fetch(API + '/mis-facturas', { credentials: 'include' });
    const facData = facRes.ok ? await facRes.json() : [];
    const facturas = Array.isArray(facData) ? facData : [];

    document.getElementById('countFacturas').textContent = facturas.length;

    if (facturas.length === 0) {
      document.getElementById('sinFacturas').style.display = 'block';
    } else {
      const tbody = document.getElementById('tablaFacturas');
      tbody.innerHTML = facturas.map(f => {
        const fecha = f.creadoEn ? new Date(f.creadoEn).toLocaleDateString('es-NI') : '—';
        const total = typeof f.total === 'number' ? `$${f.total.toFixed(2)}` : (f.total ?? '—');
        return `
          <tr>
            <td>#${f.id}</td>
            <td>${f.cliente ?? '—'}</td>
            <td>${f.servicio ?? '—'}</td>
            <td><strong>${total}</strong></td>
            <td>${fecha}</td>
          </tr>`;
      }).join('');
    }

  } catch (e) {
    mostrarNoAuth();
  }
}

window.addEventListener('DOMContentLoaded', cargarPerfil);
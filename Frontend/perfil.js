const API = "http://127.0.0.1:3000";

// Helper para obtener las cabeceras con el token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('hotel_token') || ''}`
});

/* ===== LOGOUT ===== */
async function cerrarSesion() {
  try {
    await fetch(API + '/logout', { 
        method: 'POST', 
        headers: getHeaders() 
    });
  } catch (_) {}
  localStorage.removeItem('hotel_token');
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
  document.getElementById('noAuthBox').style.display         = 'block';
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
  if (!localStorage.getItem('hotel_token')) { mostrarNoAuth(); return; }

  try {
    const headers = getHeaders();

    /* — /me — */
    const meRes = await fetch(API + '/me', { method: 'GET', headers });
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

    /* — Solicitudes y Habitaciones — */
    const solRes = await fetch(API + '/mis-solicitudes', { method: 'GET', headers });
    const solData = solRes.ok ? await solRes.json() : { solicitudes: [], habitacionesOcupadas: [] };
    
    const solicitudes = Array.isArray(solData.solicitudes) ? solData.solicitudes : [];
    const habitaciones = Array.isArray(solData.habitacionesOcupadas) ? solData.habitacionesOcupadas : [];

    document.getElementById('countSolicitudes').textContent = solicitudes.length + habitaciones.length;

    if (solicitudes.length === 0 && habitaciones.length === 0) {
      document.getElementById('sinSolicitudes').style.display = 'block';
    } else {
      document.getElementById('sinSolicitudes').style.display = 'none';
      const tbody = document.getElementById('tablaSolicitudes');
      
      let html = "";
      // Solicitudes
      html += solicitudes.map(s => {
        const fecha = s.creadoEn ? new Date(s.creadoEn).toLocaleDateString('es-NI') : '—';
        return `
          <tr>
            <td>#${s.id}</td>
            <td>${s.tipo_habitacion}</td>
            <td>${estadoTag(s.estado)}</td>
            <td>${fecha}</td>
          </tr>`;
      }).join('');

      // Habitaciones asignadas manualmente
      html += habitaciones.map(h => `
        <tr>
          <td>Habitación ${h.numero}</td>
          <td>${h.tipo}</td>
          <td><span class="estado-tag aprobada">Asignada</span></td>
          <td>—</td>
        </tr>`).join('');
      
      tbody.innerHTML = html;
    }

    /* — Facturas — */
    const facRes = await fetch(API + '/mis-facturas', { method: 'GET', headers });
    
    if (facRes.ok) {
        const facturas = await facRes.json();
        const listaFacturas = Array.isArray(facturas) ? facturas : [];
        document.getElementById('countFacturas').textContent = listaFacturas.length;

        if (listaFacturas.length === 0) {
            document.getElementById('sinFacturas').style.display = 'block';
        } else {
            const tbody = document.getElementById('tablaFacturas');
            tbody.innerHTML = listaFacturas.map(f => {
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
    } else {
        console.error("Error al cargar facturas");
        document.getElementById('sinFacturas').style.display = 'block';
    }

  } catch (e) {
    console.error(e);
    mostrarNoAuth();
  }
}

window.addEventListener('DOMContentLoaded', cargarPerfil);
const URL = "http://localhost:3000";

function cerrarSesion() {
  localStorage.removeItem('hotel_sesion_activa');
  localStorage.removeItem('hotel_empleado_nombre');
  window.location.href = 'login.html';
}

async function cargarPerfil() {
  const estadoEl = document.getElementById('perfilEstado');
  const resumen = document.getElementById('perfilResumen');
  const tabla = document.getElementById('tablaSolicitudes');
  const sin = document.getElementById('sinSolicitudes');

  try {
    estadoEl.textContent = 'Consultando...';

    const meRes = await fetch(URL + '/me', { credentials: 'include' });
    if (!meRes.ok) throw new Error('No autorizado');

    const meData = await meRes.json();
    const user = meData.user;

    resumen.innerHTML = `
      <p><strong>Nombre:</strong> ${user.nombre ?? '-'}</p>
      <p><strong>Correo:</strong> ${user.correo ?? '-'}</p>
      <p><strong>Rol:</strong> ${user.role ?? '-'}</p>
      <p><strong>Tipo de acceso:</strong> ${user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}</p>
    `;

    const solRes = await fetch(URL + '/mis-solicitudes', { credentials: 'include' });
    if (!solRes.ok) throw new Error('No se pudieron cargar solicitudes');

    const solData = await solRes.json();
    const solicitudes = Array.isArray(solData.solicitudes) ? solData.solicitudes : [];

    tabla.innerHTML = '';

    if (solicitudes.length === 0) {
      sin.style.display = 'block';
      return;
    }

    solicitudes.forEach(s => {
      const tr = document.createElement('tr');
      const creado = s.creadoEn ? new Date(s.creadoEn).toLocaleString() : '-';

      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.tipo_habitacion}</td>
        <td>${s.estado}</td>
        <td>${creado}</td>
      `;
      tabla.appendChild(tr);
    });
  } catch (e) {
    estadoEl.textContent = 'No estás autenticado (sesión inválida o expiró).';
    sin.style.display = 'none';
  }
}

window.addEventListener('DOMContentLoaded', cargarPerfil);


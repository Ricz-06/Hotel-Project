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

  const tablaFacturas = document.getElementById('tablaFacturas');
  const sinFacturas = document.getElementById('sinFacturas');

  const noAuthBox = document.getElementById('noAuthBox');

  // Estado inicial
  if (noAuthBox) noAuthBox.style.display = 'none';
  if (resumen) resumen.style.display = 'block';
  if (sin) sin.style.display = 'none';
  if (sinFacturas) sinFacturas.style.display = 'none';
  if (tabla) tabla.innerHTML = '';
  if (tablaFacturas) tablaFacturas.innerHTML = '';


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
      <p><strong>Tipo de acceso:</strong> ${user.role === 'ADMIN' ? 'Administrador (ADMIN)' : 'Usuario'}</p>
    `;

    // Mostrar link de admin solo para administradores
    const adminLink = document.getElementById('adminLink');
    if (adminLink && user.role === 'ADMIN') {
      adminLink.style.display = '';
    }

    // ================= SOLICITUDES =================
    const solRes = await fetch(URL + '/mis-solicitudes', { credentials: 'include' });
    if (!solRes.ok) throw new Error('No se pudieron cargar solicitudes');

    const solData = await solRes.json();
    const solicitudes = Array.isArray(solData.solicitudes) ? solData.solicitudes : [];

    tabla.innerHTML = '';

    if (solicitudes.length === 0) {
      sin.style.display = 'block';
    } else {
      sin.style.display = 'none';
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
    }

    // ================= FACTURAS =================
    const facRes = await fetch(URL + '/mis-facturas', { credentials: 'include' });
    if (!facRes.ok) throw new Error('No se pudieron cargar facturas');

    const facData = await facRes.json();
    const facturas = Array.isArray(facData) ? facData : [];

    tablaFacturas.innerHTML = '';

    if (facturas.length === 0) {
      sinFacturas.style.display = 'block';
    } else {
      sinFacturas.style.display = 'none';
      facturas.forEach(f => {
        const tr = document.createElement('tr');
        const creado = f.creadoEn ? new Date(f.creadoEn).toLocaleString() : '-';

        tr.innerHTML = `
          <td>${f.id}</td>
          <td>${f.cliente ?? '-'}</td>
          <td>${f.servicio ?? '-'}</td>
          <td>${typeof f.total === 'number' ? f.total.toFixed(2) : (f.total ?? '-')}</td>
          <td>${creado}</td>
        `;

        tablaFacturas.appendChild(tr);
      });
    }

  } catch (e) {
    estadoEl.textContent = 'No estás autenticado (sesión inválida o expiró).';

    if (noAuthBox) noAuthBox.style.display = 'block';

    if (resumen) resumen.style.display = 'none';
    if (sin) sin.style.display = 'none';
    if (sinFacturas) sinFacturas.style.display = 'none';

    if (tabla) tabla.style.display = 'none';
    if (tablaFacturas) tablaFacturas.style.display = 'none';
  }
}


window.addEventListener('DOMContentLoaded', cargarPerfil);

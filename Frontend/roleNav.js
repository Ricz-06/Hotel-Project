const ROLE_URL = "http://127.0.0.1:3000";

function getNavContainer() {
  return document.getElementById('navItems');
}

function hideAllAdminLinks(root) {
  const adminLinks = root.querySelectorAll('[data-role="ADMIN"]');
  adminLinks.forEach(a => (a.style.display = 'none'));
}

function showAdminLinks(root) {
  const adminLinks = root.querySelectorAll('[data-role="ADMIN"]');
  adminLinks.forEach(a => (a.style.display = ''));
}

async function aplicarRolEnNavbar() {
  const root = getNavContainer();
  if (!root) return;

  hideAllAdminLinks(root);

  // 1. Obtener el token del almacenamiento local
  const token = localStorage.getItem('hotel_token');
  if (!token) return; // Si no hay token, no intentamos llamar a /me

  try {
    // 2. Realizar el fetch enviando la cabecera Authorization
    const meRes = await fetch(`${ROLE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // <-- AQUÍ ESTABA EL ERROR
        'Content-Type': 'application/json'
      }
    });

    if (!meRes.ok) return;

    const meData = await meRes.json();
    const role = meData?.user?.role;

    if (role === 'ADMIN') {
      showAdminLinks(root);
    }
  } catch (e) {
    console.error("Error al obtener rol:", e);
  }
}

window.addEventListener('DOMContentLoaded', aplicarRolEnNavbar);
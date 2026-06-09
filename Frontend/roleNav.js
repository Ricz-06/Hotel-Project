const ROLE_URL = "http://localhost:3000";

function getNavContainer() {
  // Cualquier navbar que quiera usarlo debe tener este id.
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

  // Por defecto: normal (sin admin)
  hideAllAdminLinks(root);

  try {
    const meRes = await fetch(ROLE_URL + '/me', { credentials: 'include' });
    if (!meRes.ok) return;

    const meData = await meRes.json();
    const role = meData?.user?.role;

    if (role === 'ADMIN') {
      showAdminLinks(root);
    }
  } catch (e) {
    // Si falla la consulta, dejamos el navbar como Normal
  }
}

window.addEventListener('DOMContentLoaded', aplicarRolEnNavbar);


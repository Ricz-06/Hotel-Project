const AUTH_URL = 'http://localhost:3000/auth';

// Cambiar entre pestañas de Login, Registro y Recuperar
function switchTab(tab) {
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const recoverForm = document.getElementById('form-recover');
    const tabL = document.getElementById('tab-l');
    const tabR = document.getElementById('tab-r');
    const oauth = document.getElementById('oauth-container');

    // Resetear visibilidad
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    recoverForm.classList.add('hidden');
    if(tabL) tabL.classList.remove('active');
    if(tabR) tabR.classList.remove('active');
    if(oauth) oauth.classList.remove('hidden');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        if(tabL) tabL.classList.add('active');
    } else if (tab === 'register') {
        registerForm.classList.remove('hidden');
        if(tabR) tabR.classList.add('active');
    } else if (tab === 'recover') {
        recoverForm.classList.remove('hidden');
        if(oauth) oauth.classList.add('hidden'); // Ocultar redes sociales en recuperación
    }
}

// Control de ventanas emergentes corporativas
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeAllModales() { 
    document.getElementById('google-modal').classList.add('hidden'); 
    document.getElementById('apple-modal').classList.add('hidden'); 
}

// Sistema de alertas elegante (Toasts)
function showModernAlert(message, isSuccess = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${isSuccess ? 'success' : 'error'}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.remove(); }, 300);
    }, 3500);
}

// Lógica centralizada de peticiones
async function handleAuth(event, type, socialName = null) {
    if (event) event.preventDefault();

    if (type === 'oauth') {
        closeAllModales();
        irAlDashboard(socialName);
        return;
    }

    if (type === 'recuperar') {
        showModernAlert("📩 Petición de reinicio enviada a sistemas.", true);
        switchTab('login');
        return;
    }

    if (type === 'registro') {
        const nombre_completo = document.getElementById('name-r').value.trim();
        const usuario = document.getElementById('user-r').value.trim();
        const password = document.getElementById('pass-r').value;

        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre_completo, usuario, password })
            });
            const data = await response.json();
            if (response.ok) {
                showModernAlert("🎉 Empleado dado de alta con éxito.", true);
                document.getElementById('form-register').reset();
                setTimeout(() => switchTab('login'), 1200);
            } else {
                showModernAlert(`❌ ${data.error}`);
            }
        } catch (e) { showModernAlert("❌ Sin conexión con el servidor."); }
    }

    if (type === 'login') {
        const usuario = document.getElementById('user-l').value.trim();
        const password = document.getElementById('pass-l').value;

        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showModernAlert("🔑 Acceso autorizado.", true);
                irAlDashboard(data.nombre_completo);
            } else {
                showModernAlert(`❌ ${data.error}`);
            }
        } catch (e) { showModernAlert("❌ Servidor inalcanzable."); }
    }
}

// Transición al menú principal del hotel
function irAlDashboard(nombreEmpleado) {
    localStorage.setItem('hotel_sesion_activa', 'true');
    localStorage.setItem('hotel_empleado_nombre', nombreEmpleado);

    const card = document.getElementById('auth-card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';

    setTimeout(() => {
        card.classList.add('hidden');
        const menu = document.getElementById('main-menu');
        menu.classList.remove('hidden');
        
        // Seteo de textos dinámicos
        document.getElementById('user-title').innerText = `¡Bienvenido al sistema, ${nombreEmpleado}!`;
        document.getElementById('avatar-initial').innerText = nombreEmpleado.charAt(0).toUpperCase();
    }, 300);
}

// Verificación de persistencia al cargar la pestaña
document.addEventListener("DOMContentLoaded", () => {
    const activa = localStorage.getItem('hotel_sesion_activa');
    const nombre = localStorage.getItem('hotel_empleado_nombre');
    if (activa === 'true' && nombre) {
        document.getElementById('auth-card').classList.add('hidden');
        const menu = document.getElementById('main-menu');
        menu.classList.remove('hidden');
        document.getElementById('user-title').innerText = `¡Bienvenido al sistema, ${nombre}!`;
        document.getElementById('avatar-initial').innerText = nombre.charAt(0).toUpperCase();
    }
});

// Destrucción de variables de sesión
function cerrarSesion() {
    localStorage.removeItem('hotel_sesion_activa');
    localStorage.removeItem('hotel_empleado_nombre');
    window.location.reload();
}
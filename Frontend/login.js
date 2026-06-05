// Backend actual expone rutas en: /login y /registrar (no /auth/*)
const AUTH_URL = 'http://localhost:3000';


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
        const usuarioRecover = document.getElementById('user-recover').value.trim();
        const emailRecover = document.getElementById('email-recover').value.trim();

        if (!usuarioRecover && !emailRecover) {
            showModernAlert("⚠️ Ingresa tu usuario o tu correo para recuperar.");
            return;
        }

        try {
            const response = await fetch(`${AUTH_URL}/recover`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: usuarioRecover, correo: emailRecover })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                showModernAlert(`❌ ${data.error || data.mensaje || 'No existe la cuenta'}`);
                return;
            }

            showModernAlert("📩 Solicitud enviada. Revisa tu correo si aplica.", true);
            switchTab('login');
            return;
        } catch (e) {
            showModernAlert("❌ No hay conexión con el servidor.");
            return;
        }
    }

    if (type === 'registro') {
        const nombre_completo = document.getElementById('name-r').value.trim();
        const usuario = document.getElementById('user-r').value.trim();
        const password = document.getElementById('pass-r').value;

        try {
            const response = await fetch(`${AUTH_URL}/registrar`, {
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
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });
            const data = await response.json();
            if (response.ok && (data.success === true || data.mensaje === 'Login correcto')) {
                showModernAlert("🔑 Acceso autorizado.", true);
                const role = data?.usuario?.role;
                irAlDashboard(data.nombre_completo || (data.usuario && data.usuario.nombre) || 'Empleado', role);
            } else {
                showModernAlert(`❌ ${data.error || data.mensaje || 'Error en login'}`);
            }

        } catch (e) { showModernAlert("❌ Servidor inalcanzable."); }
    }
}

// Transición al menú principal del hotel
function irAlDashboard(nombreEmpleado, role) {

    localStorage.setItem('hotel_sesion_activa', 'true');
    localStorage.setItem('hotel_empleado_nombre', nombreEmpleado);

    if (role) {
        localStorage.setItem('hotel_empleado_role', role);
    }

    const card = document.getElementById('auth-card');

    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';

    setTimeout(() => {
        // Redirigimos al panel correcto según rol.
        if (role === 'ADMIN') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'perfil.html';
        }
    }, 250);
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
    localStorage.removeItem('hotel_empleado_role');
    window.location.reload();
}


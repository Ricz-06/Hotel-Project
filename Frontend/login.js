// =========================================================================
// 🌐 CONFIGURACIÓN: URL raíz de tu backend modularizada con el prefijo /auth
// =========================================================================
console.log("LOGIN JS CARGADO");

const AUTH_URL = 'http://localhost:3000';



// =========================================================
// 🟢 1. MANEJO DE PESTAÑAS (LOGIN / REGISTRO / RECUPERACIÓN)
// =========================================================
function switchTab(tab) {
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const recoverForm = document.getElementById('form-recover');
    const tabL = document.getElementById('tab-l');
    const tabR = document.getElementById('tab-r');
    const oauth = document.getElementById('oauth-container');

    // Resetear visibilidad
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (recoverForm) recoverForm.classList.add('hidden');
    if (tabL) tabL.classList.remove('active');
    if(tabR) tabR.classList.remove('active');
    if(oauth) oauth.classList.remove('hidden');

    if (tab === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if(tabL) tabL.classList.add('active');
    } else if (tab === 'register') {
        if (registerForm) registerForm.classList.remove('hidden');
        if(tabR) tabR.classList.add('active');
    } else if (tab === 'recover') {
        if (recoverForm) recoverForm.classList.remove('hidden');
        if(oauth) oauth.classList.add('hidden'); // Ocultar redes sociales en recuperación
    }
}

// Control de ventanas emergentes corporativas
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeAllModales() { 
    const googleModal = document.getElementById('google-modal');
    const appleModal = document.getElementById('apple-modal');
    if (googleModal) googleModal.classList.add('hidden'); 
    if (appleModal) appleModal.classList.add('hidden'); 
}

// Sistema de alertas elegante (Toasts)
function showModernAlert(message, isSuccess = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;
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

// =========================================================
// 🔥 2. LÓGICA CENTRALIZADA DE PETICIONES (CORREGIDA)
// =========================================================
async function handleAuth(event, type, socialName = null) {
    // Permite crear un usuario admin solo desde el frontend en modo debug
    // (no recomendado en producción). Se basa en un input con el id 'admin-code'.

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
            // Apunta a http://localhost:3000/recover
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

    // 🔒 REGISTRO REAL DE EMPLEADOS
    if (type === 'registro') {
        const nombre_completo = document.getElementById('name-r').value.trim();
        const usuario = document.getElementById('user-r').value.trim();
        const password = document.getElementById('pass-r').value;

        try {
            // ✨ SE MODIFICA: Ahora apunta correctamente a http://localhost:3000/auth/register
            const response = await fetch(`${AUTH_URL}/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre: nombre_completo,
                    usuario: usuario,
                    password: password
                })
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok || data.success) {
                showModernAlert("🎉 Nuevo miembro del staff registrado con éxito.", true);
                document.getElementById('form-register')?.reset?.();
                setTimeout(() => switchTab('login'), 1500);
            } else {
                showModernAlert(`❌ ${data.mensaje || data.error || 'Error al registrar'}`);
            }
        } catch (error) {
            showModernAlert("❌ No hay conexión con el servidor del hotel.");
        }
    }

    // -----------------------------------------------------
    // 🔑 FLUJO: LOGIN REAL (CONEXIÓN AL BACKEND)
    // -----------------------------------------------------
    if (type === 'login') {
        const usuario = document.getElementById('user-l').value.trim();
        const password = document.getElementById('pass-l').value;

        if (!usuario || !password) {
            showModernAlert("⚠️ Introduce tus credenciales de acceso.");
            return;
        }

        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuario: usuario,
                    password: password 
                })
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok || data.success) {
                showModernAlert("🔑 Credenciales verificadas. Accediendo...", true);

                // ✅ Verificar el rol del usuario para decidir a dónde redirigir
                const role = (data?.usuario?.role ?? '').toString().toUpperCase();
                const nombreEmpleado = data.nombre_completo || data.usuario || "Staff";

                irAlDashboard(nombreEmpleado);

                setTimeout(() => {
                    if (role === 'ADMIN') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 200);
            } else {
                showModernAlert(`❌ ${data.mensaje || data.error || 'Usuario o contraseña incorrectos.'}`);
            }
        } catch (error) {
            showModernAlert("❌ Error crítico al conectar con el backend.");
        }
    }
}

// =========================================================
// 🟢 5. TRANSICIÓN CINEMATOGRÁFICA AL DASHBOARD
// =========================================================
function irAlDashboard(finalName) {
    localStorage.setItem('hotel_auth', 'true');

    const card = document.getElementById('auth-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.92) translateY(20px)';
        card.style.filter = 'blur(10px)';
    }

    setTimeout(() => {
        if (card) {
            card.classList.add('hidden');
        }

        const menu = document.getElementById('main-menu');
        if (menu) {
            menu.style.opacity = '0';
            menu.style.transform = 'scale(0.96)';
            menu.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            menu.classList.remove('hidden');
        }

        const userTitle = document.getElementById('user-title');
        if (userTitle) userTitle.innerText = `¡Bienvenido al sistema, ${finalName}!`;

        const avatarInitial = document.getElementById('avatar-initial');
        if (avatarInitial) avatarInitial.innerText = finalName.charAt(0).toUpperCase();

        setTimeout(() => {
            if (menu) {
                menu.style.opacity = '1';
                menu.style.transform = 'scale(1)';
            }
        }, 30);
    }, 500);
}

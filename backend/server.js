// =========================================================
// 🟢 1. MANEJO DE PESTAÑAS (LOGIN / REGISTRO / RECUPERACIÓN)
// =========================================================
function switchTab(mode) {
    const isLogin = mode === 'login';
    const isRegister = mode === 'register';
    const isRecover = mode === 'recover';

    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', !isRegister);
    document.getElementById('form-recover').classList.toggle('hidden', !isRecover);

    document.getElementById('auth-tabs').classList.toggle('hidden', isRecover);
    document.getElementById('oauth-container').classList.toggle('hidden', isRecover);

    if (!isRecover) {
        document.getElementById('tab-l').classList.toggle('active', isLogin);
        document.getElementById('tab-r').classList.toggle('active', isRegister);
    }
}

// =========================================================
// 🟢 2. SISTEMA DE ALERTAS (TOASTS CON BARRA DE TIEMPO)
// =========================================================
function showModernAlert(message, isSuccess = false) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = `modern-toast ${isSuccess ? 'success-toast' : ''}`;
    toast.innerHTML = `
        <span>${message}</span>
        <div class="toast-progress"></div>
    `;
    
    container.appendChild(toast);
    const progressBar = toast.querySelector('.toast-progress');
    progressBar.style.transition = 'width 3500ms linear';
    
    void progressBar.offsetWidth; // Forzar reflow animático del navegador
    progressBar.style.width = '0%';

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
}

// =========================================================
// 🟢 3. EVENTOS DE VENTANAS MODALES (OAUTH)
// =========================================================
function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
function closeAllModales() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
window.onclick = function(e) { if (e.target.classList.contains('modal')) closeAllModales(); }


// =========================================================
// 🔥 4. LÓGICA DE AUTENTICACIÓN CENTRALIZADA (CONEXIÓN REAL)
// =========================================================
async function handleAuth(event, type, socialName = null) {
    if (event) event.preventDefault();
    
    // URL raíz de tu backend según tu app.listen y app.use('/auth')
    const API_URL = 'http://localhost:3000';

    // 📩 FLUJO: RECUPERACIÓN DE CONTRASEÑA (REPORTE)
    if (type === 'recuperar') {
        const userRecover = document.getElementById('user-recover').value;
        if (userRecover.trim()) {
            showModernAlert("📩 Solicitud enviada al equipo de sistemas del Hotel Luxe.", true);
            switchTab('login');
        }
        return;
    }

    //  / 🌐 FLUJO: REDES SOCIALES CORPORATIVAS (OAUTH SIMULADO)
    if (type === 'oauth') {
        closeAllModales();
        irAlDashboard(socialName);
        return;
    }

    // -----------------------------------------------------
    // 🔒 FLUJO: REGISTRO REAL (CONEXIÓN AL BACKEND)
    // -----------------------------------------------------
    if (type === 'registro') {
        const nombreCompleto = document.getElementById('name-r').value.trim();
        const usuario = document.getElementById('user-r').value.trim();
        const password = document.getElementById('pass-r').value;

        if (!nombreCompleto || !usuario || !password) {
            showModernAlert("⚠️ Por favor, rellena todos los campos de registro.");
            return;
        }

        try {
            // Nota: Si tus variables del backend se llaman diferente en req.body, cámbialas aquí a la izquierda del ":"
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre_completo: nombreCompleto, 
                    usuario: usuario, 
                    password: password 
                })
            });

            const data = await response.json();

            if (response.ok || data.success) {
                showModernAlert("🎉 Nuevo miembro del staff registrado con éxito.", true);
                document.getElementById('form-register').reset();
                setTimeout(() => switchTab('login'), 1500);
            } else {
                // Muestra el mensaje de error específico que mande tu backend (ej: "Usuario ya existe")
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuario: usuario, 
                    password: password 
                })
            });

            const data = await response.json();

            if (response.ok || data.success) {
                showModernAlert("🔑 Credenciales verificadas. Accediendo...", true);
                
                // Extraemos el nombre que viene desde tu BD. Si tu backend devuelve el objeto diferente, adáptalo.
                // Ej: si devuelve data.user.nombre, usa ese.
                const nombreEmpleado = data.nombre_completo || data.usuario || "Staff Luxe";
                
                irAlDashboard(nombreEmpleado);
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
    // Guarda el estado de autenticación en la sesión del navegador
    localStorage.setItem('hotel_auth', 'true');

    const card = document.getElementById('auth-card');
    card.style.opacity = '0';
    card.style.transform = 'scale(0.92) translateY(20px)';
    card.style.filter = 'blur(10px)';

    setTimeout(() => {
        card.classList.add('hidden');
        const menu = document.getElementById('main-menu');
        
        menu.style.opacity = '0';
        menu.style.transform = 'scale(0.96)';
        menu.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        menu.classList.remove('hidden');
        
        document.getElementById('user-title').innerText = `¡Bienvenido al sistema, ${finalName}!`;
        document.getElementById('avatar-initial').innerText = finalName.charAt(0).toUpperCase();
        
        setTimeout(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1)';
        }, 30);
    }, 500);
}
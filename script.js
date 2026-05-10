document.addEventListener("DOMContentLoaded", function() {
    // --- 1. PROTECCIÓN DE RUTA ---
    // Verifica si existe la sesión en el navegador
    const isAuth = localStorage.getItem('hotel_auth');
    
    if (isAuth !== 'true') {
        // Si no está logueado, redirige de inmediato al login
        window.location.href = "login.html";
        return; 
    }

    // --- 2. VARIABLES DE INTERFAZ ---
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const URL = "http://localhost:3000";

    // --- 3. EVENTOS DE UI ---
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }

    // --- 4. CARGA DE DATOS ---
    verHabitaciones();

    // Función para obtener habitaciones del "servidor"
    function verHabitaciones() {
        fetch(URL + "/habitaciones")
        .then(res => res.json())
        .then(data => {
            let html = "";
            data.forEach(h => {
                // Color de borde dinámico según estado
                let statusColor = h.estado === "ocupada" ? "#e74c3c" : "#2ecc71";
                
                html += `
                    <div class="card" style="background:white; padding:20px; border-radius:10px; border-top: 5px solid ${statusColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.05)">
                        <h3 style="margin-top:0">Habitación ${h.numero}</h3>
                        <p style="color: #666;">Tipo: <b>${h.tipo || 'Estándar'}</b></p>
                        <p>Estado: <span style="color:${statusColor}; font-weight:bold">${h.estado.toUpperCase()}</span></p>
                        <button class="btn-gold-fill" style="width:100%; margin-top:10px; font-size:0.8rem">Gestionar</button>
                    </div>
                `;
            });
            const container = document.getElementById("habitaciones");
            if (container) container.innerHTML = html;
        })
        .catch(err => {
            console.error("Error al conectar con el servidor:", err);
            document.getElementById("habitaciones").innerHTML = "<p>Inicia el servidor local para ver habitaciones.</p>";
        });
    }
});

// --- 5. FUNCIONES GLOBALES ---

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('hotel_auth');
    window.location.href = "login.html";
}

// Función ejemplo para clientes (local por ahora)
function crearCliente() {
    const nombre = document.getElementById('nombre').value;
    const tipo = document.getElementById('tipo').value;
    if(!nombre || !tipo) return alert("Completa los datos");

    alert(`Cliente ${nombre} registrado con éxito`);
    // Aquí iría el fetch POST para guardar en la base de datos

    const URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function() {
    // ... (Mantén tu código de protección de ruta aquí) ...
    verHabitaciones();
});

async function verHabitaciones() {
    try {
        const res = await fetch(`${URL}/habitaciones`);
        const data = await res.json();
        
        let html = "";
        let options = '<option value="">Seleccionar Habitación...</option>';
        let disponibles = 0;

        data.forEach(h => {
            const isLibre = h.estado === "disponible";
            if(isLibre) disponibles++;

            // Estilos dinámicos
            const statusColor = isLibre ? "#2ecc71" : "#e74c3c";
            const borderVIP = h.tipo === "VIP" ? "2px solid #c5a059" : "none";

            // Generar tarjetas
            html += `
                <div class="card" style="background:white; padding:20px; border-radius:10px; border-top: 6px solid ${statusColor}; outline: ${borderVIP}; box-shadow: 0 4px 10px rgba(0,0,0,0.05)">
                    <div style="display:flex; justify-content:space-between">
                        <small style="color:#888">${h.tipo}</small>
                        ${h.tipo === "VIP" ? "⭐" : ""}
                    </div>
                    <h3 style="margin: 10px 0">Hab. ${h.numero}</h3>
                    <p style="font-size: 0.8rem; color: ${statusColor}"><b>${h.estado.toUpperCase()}</b></p>
                </div>
            `;

            // Llenar el select de reservas solo con las disponibles
            if (isLibre) {
                options += `<option value="${h.id}">Hab. ${h.numero} (${h.tipo})</option>`;
            }
        });

        document.getElementById("habitaciones").innerHTML = html;
        document.getElementById("reserva-habitacion").innerHTML = options;
        document.getElementById("contador-habitaciones").innerText = `${disponibles} de ${data.length} Disponibles`;

    } catch (error) {
        console.error("Error cargando habitaciones:", error);
    }
}

async function hacerReserva() {
    const cliente = document.getElementById('reserva-cliente').value;
    const habitacionId = document.getElementById('reserva-habitacion').value;
    const fecha = document.getElementById('reserva-fecha').value;

    if (!cliente || !habitacionId || !fecha) {
        return alert("Por favor completa todos los campos de la reserva.");
    }

    // 1. Cambiar estado de la habitación a "ocupada"
    await fetch(`${URL}/habitaciones/${habitacionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: "ocupada" })
    });

    // 2. Guardar la reserva en la base de datos
    await fetch(`${URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente, habitacionId, fecha })
    });

    alert("¡Reserva confirmada!");
    
    // Limpiar campos y recargar vista
    document.getElementById('reserva-cliente').value = "";
    document.getElementById('reserva-fecha').value = "";
    verHabitaciones();
}
}
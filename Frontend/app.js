const URL = "http://127.0.0.1:3000";
const MAX_HABITACIONES = 50;

// =========================================================
// 🔒 GUARD DE ACCESO: VERIFICACIÓN JWT
// =========================================================
async function verificarAccesoAdmin() {
    const token = localStorage.getItem('hotel_token');
    const role = localStorage.getItem('hotel_user_role');

    // Si ni siquiera hay token o el rol no es ADMIN, rebota de inmediato al login
    if (!token || role !== 'ADMIN') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/* 🔥 GLOBAL */
let habitacionesGlobal = [];

const SERVICIOS_POR_TIPO = {
    Normal: ["WiFi", "Baño privado", "Aire acondicionado"],
    Deluxe: ["WiFi premium", "Desayuno incluido", "Acceso a piscina"],
    VIP: ["WiFi premium", "Desayuno buffet", "Spa privado"]
};

function obtenerServiciosPorTipo(tipo) {
    return SERVICIOS_POR_TIPO[tipo] || SERVICIOS_POR_TIPO.Normal;
}

// =========================================================
// 🛠️ FUNCIÓN AUXILIAR: AGREGAR EL TOKEN AUTOMÁTICAMENTE
// =========================================================
function getHeaders() {
    const token = localStorage.getItem('hotel_token');
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

/* ================= CLIENTES ================= */

function crearCliente() {
    const nombre = document.getElementById("nombre").value;
    const tipo = document.getElementById("tipo").value;

    if (!nombre || !tipo) {
        alert("Faltan datos");
        return;
    }

    fetch(URL + "/clientes", {
        method: "POST",
        headers: getHeaders(), // 🔑 Token inyectado
        body: JSON.stringify({ nombre, tipo })
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        return res.json();
    })
    .then(() => {
        alert("Cliente creado");
        document.getElementById("nombre").value = "";
        verClientes();
    });
}

/* ================= VER CLIENTES ================= */

function verClientes() {
    fetch(URL + "/clientes", { 
        method: "GET",
        headers: getHeaders() // 🔑 Token inyectado
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        return res.json();
    })
    .then(data => {
        if (!Array.isArray(data)) {
            console.error("No autorizado o error de formato:", data);
            return;
        }

        let html = "";
        data.forEach(c => {
            let color = c.tipo === "VIP" ? "vip" : "normal";

            html += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.nombre}</td>
                    <td>
                        <span class="${color}">
                            ${c.tipo}
                        </span>
                    </td>
                    <td>
                        <button class="normal-btn" onclick="cambiarTipo(${c.id}, 'Normal')">Normal</button>
                        <button class="deluxe-btn" onclick="cambiarTipo(${c.id}, 'Deluxe')">Deluxe</button>
                        <button class="vip-btn" onclick="cambiarTipo(${c.id}, 'VIP')">VIP</button>
                    </td>
                    <td>
                        <button class="delete-btn" onclick="eliminarCliente(${c.id})">🗑</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById("listaClientes").innerHTML = html;
    });
}

/* ================= VER SOLICITUDES ================= */

function verSolicitudes() {
    fetch(URL + "/solicitudes", { 
        method: "GET",
        headers: getHeaders() // 🔑 Token inyectado
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        return res.json();
    })
    .then(data => {
        if (!Array.isArray(data)) {
            console.error("No autorizado o error de formato:", data);
            return;
        }

        let html = "";
        data.forEach(s => {
            html += `
            <tr>
                <td>${s.id}</td>
                <td>${s.nombre}</td>
                <td>${s.correo}</td>
                <td>${s.tipo_habitacion}</td>
                <td>${s.estado}</td>
                <td>
                    <button class="btn-gold" onclick="aprobarSolicitud(${s.id})">✔</button>
                </td>
                <td>
                    <button class="btn-danger" onclick="rechazarSolicitud(${s.id})">✖</button>
                </td>
            </tr>
            `;
        });
        document.getElementById("listaSolicitudes").innerHTML = html;
    });
}

/* ================= APROBAR SOLICITUD ================= */

function aprobarSolicitud(id) {
    fetch(URL + "/solicitudes/aprobar/" + id, {
        method: "PUT",
        headers: getHeaders() // 🔑 Token inyectado
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        return res.json();
    })
    .then(data => {
        alert(data.mensaje || data.error);
        verSolicitudes();
        verClientes();
        verHabitaciones();
    });
}

/* ================= RECHAZAR SOLICITUD ================= */

function rechazarSolicitud(id) {
    fetch(URL + "/solicitudes/rechazar/" + id, {
        method: "PUT",
        headers: getHeaders() // 🔑 Token inyectado
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        verSolicitudes();
    });
}

/* ================= CAMBIAR TIPO CLIENTE ================= */

function cambiarTipo(id, nuevoTipo) {
    fetch(URL + "/clientes/actualizar", {
        method: "PUT",
        headers: getHeaders(), // 🔑 Token inyectado
        body: JSON.stringify({ id, tipo: nuevoTipo })
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        verClientes();
    });
}

/* ================= ELIMINAR CLIENTE ================= */

function eliminarCliente(id) {
    fetch(URL + "/clientes/eliminar", {
        method: "POST",
        headers: getHeaders(), // 🔑 Token inyectado
        body: JSON.stringify({ id })
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        verClientes();
        verHabitaciones();
    });
}

/* ================= CREAR HABITACION ================= */

function crearHabitacion() {
    const numero = document.getElementById("numero").value;
    const tipo = document.getElementById("tipoHab").value;

    if (!numero || !tipo) {
        alert("Faltan datos");
        return;
    }

    if (habitacionesGlobal.length >= MAX_HABITACIONES) {
        alert(`Solo se permiten ${MAX_HABITACIONES} habitaciones máximo`);
        return;
    }

    fetch(URL + "/habitaciones", {
        method: "POST",
        headers: getHeaders(), // 🔑 Token inyectado
        body: JSON.stringify({
            numero,
            tipo,
            estado: "Libre",
            servicios: obtenerServiciosPorTipo(tipo)
        })
    })
    .then(async (res) => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            alert(data.error || "No se pudo crear la habitación");
            return;
        }

        document.getElementById("numero").value = "";
        verHabitaciones();
    });
}

/* ================= VER HABITACIONES ================= */

function verHabitaciones() {
    fetch(URL + "/habitaciones", { 
        method: "GET",
        headers: getHeaders() // 🔑 Token inyectado
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        return res.json();
    })
    .then(data => {
        if (Array.isArray(data)) {
            habitacionesGlobal = data;
            renderHabitaciones(data);
            actualizarContadores(data);
        }
    });
}

/* ================= RENDER HABITACIONES ================= */

function renderHabitaciones(data) {
    let html = "";
    data.forEach(h => {
        let estadoClass = h.estado === "ocupada" ? "ocupada" : "libre";
        const servicios = Array.isArray(h.servicios) ? h.servicios : obtenerServiciosPorTipo(h.tipo);

        html += `
            <div class="card ${estadoClass}">
                <h3>🛏 ${h.numero}</h3>
                <p><strong>Tipo:</strong> ${h.tipo}</p>
                <p><strong>Estado:</strong> ${h.estado}</p>
                <p>👤 ${h.cliente || "Libre"}</p>
                <ul class="room-services">
                    ${servicios.map(servicio => `<li>${servicio}</li>`).join("")}
                </ul>
                <div class="room-buttons">
                    <button class="btn-ocupar" onclick="ocuparHabitacion(${h.numero})">Ocupar</button>
                    <button class="btn-liberar" onclick="liberarHabitacion(${h.numero})">Liberar</button>
                    <button class="btn-delete" onclick="eliminarHabitacion(${h.id})">Eliminar</button>
                </div>
            </div>
        `;
    });
    document.getElementById("habitaciones").innerHTML = html;
}

/* ================= CONTADORES ================= */

function actualizarContadores(data) {
    let libres = data.filter(h => h.estado !== "ocupada").length;
    let ocupadas = data.filter(h => h.estado === "ocupada").length;

    document.getElementById("libres").innerText = libres;
    document.getElementById("ocupadas").innerText = ocupadas;
}

/* ================= FILTROS ================= */

function filtrar(tipo) {
    if (tipo === "todas") renderHabitaciones(habitacionesGlobal);
    if (tipo === "libre") renderHabitaciones(habitacionesGlobal.filter(h => h.estado !== "ocupada"));
    if (tipo === "ocupada") renderHabitaciones(habitacionesGlobal.filter(h => h.estado === "ocupada"));
}

/* ================= OCUPAR HABITACION ================= */

function ocuparHabitacion(numero) {
    const cliente_id = document.getElementById("clienteAsignado").value;

    if (!cliente_id) {
        alert("Falta ID cliente");
        return;
    }

    fetch(URL + "/habitaciones/ocupar", {
        method: "PUT",
        headers: getHeaders(), // 🔑 Token inyectado
        body: JSON.stringify({ numero, cliente_id })
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        return res.json();
    })
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        verHabitaciones();
    });
}

/* ================= LIBERAR HABITACION ================= */

function liberarHabitacion(numero) {
    fetch(URL + "/habitaciones/liberar", {
        method: "PUT",
        headers: getHeaders(), // 🔑 Token inyectado
        body: JSON.stringify({ numero })
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        verHabitaciones();
    });
}

/* ================= ELIMINAR HABITACION ================= */

function eliminarHabitacion(id) {
    fetch(URL + "/habitaciones/eliminar", {
        method: "POST",
        headers: getHeaders(), // 🔑 Token inyectado
        body: JSON.stringify({ id })
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        verHabitaciones();
    });
}

/* ================= LOGOUT ================= */

async function cerrarSesion() {
    try {
        await fetch(URL + '/logout', { 
            method: 'POST', 
            headers: getHeaders() 
        });
    } catch (_) {}
    
    // Limpieza absoluta de almacenamiento JWT local
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('hotel_user_role');
    localStorage.removeItem('hotel_empleado_nombre');
    localStorage.removeItem('hotel_auth');
    window.location.href = 'login.html';
}

/* ================= RESET TOTAL ================= */

function resetearSistema() {
    const confirmar = confirm("⚠️ ¿Seguro que quieres borrar TODO el sistema?");
    if (!confirmar) return;

    fetch(URL + "/reset", {
        method: "POST",
        headers: getHeaders() // 🔑 Token inyectado
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
        return res.json();
    })
    .then(() => {
        alert("Sistema reiniciado 🚀");
        verClientes();
        verHabitaciones();
    });
}

/* ================= HAMBURGUESA ================= */

function toggleMenu() {
    const dropdown = document.getElementById("hamburgerDropdown");
    if (dropdown) dropdown.classList.toggle("show");
}

document.addEventListener("click", function (e) {
    const btn = document.getElementById("hamburgerBtn");
    const dropdown = document.getElementById("hamburgerDropdown");
    if (dropdown && dropdown.classList.contains("show") && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
    }
});

/* ================= AUTO LOAD ================= */

window.onload = async function () {
    // Primero validamos de forma síncrona/local que sea ADMIN
    const ok = await verificarAccesoAdmin();
    if (!ok) return;

    // Levantamos los datos reales enviando los tokens correspondientes
    verClientes();
    verHabitaciones();
    verSolicitudes();
};
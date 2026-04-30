const URL = "http://localhost:3000";

/* 🔥 GLOBAL */
let habitacionesGlobal = [];

/* ================= CLIENTES ================= */

// 🔥 FALTABA ESTA FUNCIÓN
function crearCliente() {
    const nombre = document.getElementById("nombre").value;
    const tipo = document.getElementById("tipo").value;

    if (!nombre || !tipo) {
        alert("Faltan datos");
        return;
    }

    fetch(URL + "/clientes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre,
            tipo
        })
    })
    .then(() => {
        alert("Cliente creado");
        verClientes();
    });
}

function verClientes() {
    fetch(URL + "/clientes")
    .then(res => res.json())
    .then(data => {

        let html = "";

        data.forEach(c => {

            let color = c.tipo === "VIP" ? "vip" : "normal";

            html += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.nombre}</td>
                    <td><span class="${color}">${c.tipo}</span></td>

                    <td>
                        <button onclick="cambiarTipo(${c.id}, 'VIP')">VIP</button>
                        <button onclick="cambiarTipo(${c.id}, 'Normal')">Normal</button>
                    </td>

                    <td>
                        <button onclick="eliminarCliente(${c.id})">🗑</button>
                    </td>
                </tr>
            `;
        });

        document.getElementById("listaClientes").innerHTML = html;
    });
}


function cambiarTipo(id, nuevoTipo) {

    fetch(URL + "/clientes/actualizar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id,
            tipo: nuevoTipo
        })
    })
    .then(() => {
        verClientes();
    });
}


/* ================= HABITACIONES ================= */

function crearHabitacion() {
    const numero = document.getElementById("numero").value;
    const tipo = document.getElementById("tipoHab").value;

    if (!numero || !tipo) {
        alert("Faltan datos");
        return;
    }

    fetch(URL + "/habitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            numero,
            tipo,
            estado: "Libre"
        })
    })
    .then(() => verHabitaciones());
}

function verHabitaciones() {
    fetch(URL + "/habitaciones")
    .then(res => res.json())
    .then(data => {

        habitacionesGlobal = data;

        renderHabitaciones(data);
        actualizarContadores(data);
    });
}

function renderHabitaciones(data) {
    let html = "";

    data.forEach(h => {

        let estadoClass = h.estado === "ocupada" ? "ocupada" : "libre";

        html += `
            <div class="card ${estadoClass}">
                <h3>🛏 ${h.numero}</h3>
                <p>Tipo: ${h.tipo}</p>
                <p>Estado: ${h.estado}</p>
                <p>👤 ${h.cliente || "Libre"}</p>

                <button onclick="ocuparHabitacion(${h.numero})">Ocupar</button>
                <button onclick="liberarHabitacion(${h.numero})">Liberar</button>
                <button onclick="eliminarHabitacion(${h.id})">Eliminar</button>
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

    if (tipo === "todas") {
        renderHabitaciones(habitacionesGlobal);
    }

    if (tipo === "libre") {
        renderHabitaciones(habitacionesGlobal.filter(h => h.estado !== "ocupada"));
    }

    if (tipo === "ocupada") {
        renderHabitaciones(habitacionesGlobal.filter(h => h.estado === "ocupada"));
    }
}

/* ================= ACCIONES ================= */

function ocuparHabitacion(numero) {
    const cliente_id = document.getElementById("clienteAsignado").value;

    if (!cliente_id) {
        alert("Falta ID cliente");
        return;
    }

    fetch(URL + "/habitaciones/ocupar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            numero,
            cliente_id
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.error) {
            alert(data.error);
            return;
        }

        verHabitaciones();
    });
}


function liberarHabitacion(numero) {
    fetch(URL + "/habitaciones/liberar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero })
    })
    .then(() => verHabitaciones());
}

function eliminarHabitacion(id) {
    fetch(URL + "/habitaciones/eliminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    })
    .then(() => verHabitaciones());
}

/* ================= CLIENTES ACCIONES ================= */

function eliminarCliente(id) {
    fetch(URL + "/clientes/eliminar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
    })
    .then(() => {
        verClientes();
        verHabitaciones();
    });
}

// 🔥 MEJORADO (SIN TEXTO LIBRE)
function editarCliente(id, tipoActual) {

    let opcion = prompt("Escribe:\n1 = VIP\n2 = Normal");

    if (!opcion) return;

    let nuevoTipo = "";

    if (opcion === "1") nuevoTipo = "VIP";
    else if (opcion === "2") nuevoTipo = "Normal";
    else {
        alert("Opción inválida");
        return;
    }

    fetch(URL + "/clientes/actualizar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id,
            tipo: nuevoTipo
        })
    })
    .then(() => {
        verClientes();
    });
}

function resetearSistema() {

    const confirmar = confirm("⚠️ ¿Seguro que quieres borrar TODO el sistema?");

    if (!confirmar) return;

    fetch(URL + "/reset", {
        method: "POST"
    })
    .then(res => res.json())
    .then(data => {
        alert("Sistema reiniciado 🚀");

        verClientes();
        verHabitaciones();
    });
}

/* ================= AUTO CARGA ================= */

window.onload = function() {
    verHabitaciones();
    verClientes();
};
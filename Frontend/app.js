const URL = "http://localhost:3000";

/* 🔥 GLOBAL */
let habitacionesGlobal = [];

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

        document.getElementById("nombre").value = "";

        verClientes();
    });
}

/* ================= VER CLIENTES ================= */

function verClientes() {

    fetch(URL + "/clientes")
    .then(res => res.json())
    .then(data => {

        let html = "";

        data.forEach(c => {

            let color =
                c.tipo === "VIP"
                ? "vip"
                : "normal";

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

                        <button
                            class="vip-btn"
                            onclick="cambiarTipo(${c.id}, 'VIP')"
                        >
                            VIP
                        </button>

                        <button
                            class="normal-btn"
                            onclick="cambiarTipo(${c.id}, 'Normal')"
                        >
                            Normal
                        </button>

                    </td>

                    <td>

                        <button
                            class="delete-btn"
                            onclick="eliminarCliente(${c.id})"
                        >
                            🗑
                        </button>

                    </td>

                </tr>
            `;
        });

        document.getElementById("listaClientes").innerHTML = html;
    });
}

/* ================= SOLICITUDES ================= */

function verSolicitudes() {

    fetch(URL + "/solicitudes")

    .then(res => res.json())

    .then(data => {

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

                    <button
                    class="btn-gold"

                    onclick="aprobarSolicitud(${s.id})">

                    ✔

                    </button>

                </td>

                <td>

                    <button
                    class="btn-danger"

                    onclick="rechazarSolicitud(${s.id})">

                    ✖

                    </button>

                </td>

            </tr>
            `;
        });

        document.getElementById(
            "listaSolicitudes"
        ).innerHTML = html;
    });
}

/* ================= APROBAR ================= */

function aprobarSolicitud(id) {

    fetch(URL + "/solicitudes/aprobar/" + id, {

        method: "PUT"
    })

    .then(res => res.json())

    .then(data => {

        alert(data.mensaje || data.error);

        verSolicitudes();

        verClientes();

        verHabitaciones();
    });
}

/* ================= RECHAZAR ================= */

function rechazarSolicitud(id) {

    fetch(URL + "/solicitudes/rechazar/" + id, {

        method: "PUT"
    })

    .then(() => {

        verSolicitudes();
    });
}

/* ================= CAMBIAR TIPO ================= */

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

/* ================= ELIMINAR CLIENTE ================= */

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

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            numero,
            tipo,
            estado: "Libre"
        })
    })
    .then(() => {

        document.getElementById("numero").value = "";

        verHabitaciones();
    });
}

/* ================= VER HABITACIONES ================= */

function verHabitaciones() {

    fetch(URL + "/habitaciones")
    .then(res => res.json())
    .then(data => {

        habitacionesGlobal = data;

        renderHabitaciones(data);

        actualizarContadores(data);
    });
}

/* ================= RENDER HABITACIONES ================= */

function renderHabitaciones(data) {

    let html = "";

    data.forEach(h => {

        let estadoClass =
            h.estado === "ocupada"
            ? "ocupada"
            : "libre";

        html += `
            <div class="card ${estadoClass}">

                <h3>🛏 ${h.numero}</h3>

                <p>
                    <strong>Tipo:</strong>
                    ${h.tipo}
                </p>

                <p>
                    <strong>Estado:</strong>
                    ${h.estado}
                </p>

                <p>
                    👤 ${h.cliente || "Libre"}
                </p>

                <div class="room-buttons">

                    <button
                        class="btn-ocupar"
                        onclick="ocuparHabitacion(${h.numero})"
                    >
                        Ocupar
                    </button>

                    <button
                        class="btn-liberar"
                        onclick="liberarHabitacion(${h.numero})"
                    >
                        Liberar
                    </button>

                    <button
                        class="btn-delete"
                        onclick="eliminarHabitacion(${h.id})"
                    >
                        Eliminar
                    </button>

                </div>

            </div>
        `;
    });

    document.getElementById("habitaciones").innerHTML = html;
}

/* ================= CONTADORES ================= */

function actualizarContadores(data) {

    let libres =
        data.filter(h => h.estado !== "ocupada").length;

    let ocupadas =
        data.filter(h => h.estado === "ocupada").length;

    document.getElementById("libres").innerText = libres;

    document.getElementById("ocupadas").innerText = ocupadas;
}

/* ================= FILTROS ================= */

function filtrar(tipo) {

    if (tipo === "todas") {

        renderHabitaciones(habitacionesGlobal);
    }

    if (tipo === "libre") {

        renderHabitaciones(
            habitacionesGlobal.filter(
                h => h.estado !== "ocupada"
            )
        );
    }

    if (tipo === "ocupada") {

        renderHabitaciones(
            habitacionesGlobal.filter(
                h => h.estado === "ocupada"
            )
        );
    }
}

/* ================= OCUPAR ================= */

function ocuparHabitacion(numero) {

    const cliente_id =
        document.getElementById("clienteAsignado").value;

    if (!cliente_id) {

        alert("Falta ID cliente");
        return;
    }

    fetch(URL + "/habitaciones/ocupar", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

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

/* ================= LIBERAR ================= */

function liberarHabitacion(numero) {

    fetch(URL + "/habitaciones/liberar", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ numero })
    })
    .then(() => {

        verHabitaciones();
    });
}

/* ================= ELIMINAR HABITACION ================= */

function eliminarHabitacion(id) {

    fetch(URL + "/habitaciones/eliminar", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ id })
    })
    .then(() => {

        verHabitaciones();
    });
}

/* ================= RESET ================= */

function resetearSistema() {

    const confirmar =
        confirm("⚠️ ¿Seguro que quieres borrar TODO el sistema?");

    if (!confirmar) return;

    fetch(URL + "/reset", {
        method: "POST"
    })
    .then(res => res.json())
    .then(() => {

        alert("Sistema reiniciado 🚀");

        verClientes();
        verHabitaciones();
    });
}

/* ================= AUTO LOAD ================= */

window.onload = function () {

    verClientes();

    verHabitaciones();

    verSolicitudes();
};
function verHabitaciones() {
    fetch(URL + "/habitaciones")
    .then(res => res.json())
    .then(data => {

        // 🔥 guardar global
        habitacionesGlobal = data;

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

        // 🔥 CORREGIDO ID
        document.getElementById("habitaciones").innerHTML = html;

        // 🔥 CONTADORES
        actualizarContadores(data);
    });
}
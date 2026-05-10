function verHabitaciones() {
    fetch(URL + "/habitaciones")
    .then(res => res.json())
    .then(data => {

        let html = "";

        data.forEach(h => {

            let estadoClass = h.estado === "ocupada" ? "ocupada" : "libre";

            html += `
                <div class="card ${estadoClass}">
                    <h3>Habitación ${h.numero}</h3>
                    <p><b>Tipo:</b> ${h.tipo}</p>
                    <p><b>Estado:</b> ${h.estado}</p>
                    <p><b>Cliente:</b> ${h.cliente || "Nadie"}</p>

                    <!-- 🗑 BOTÓN DELETE POR FILA -->
                    <button onclick="eliminarHabitacion(${h.numero})">
                        🗑 Eliminar
                    </button>
                </div>
            `;
        });

        document.getElementById("resultadoHabitaciones").innerHTML = html;
    });

}
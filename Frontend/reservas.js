const URL = "http://127.0.0.1:3000"; // ✅ fix 1

function seleccionarTipo(tipo){
    document.getElementById("habitacion").value = tipo;
}

function enviarSolicitud(){
    const nombre    = document.getElementById("nombre").value;
    const correo    = document.getElementById("correo").value;
    const telefono  = document.getElementById("telefono").value;
    const habitacion = document.getElementById("habitacion").value;

    if(!nombre || !correo || !telefono || !habitacion){
        alert("Complete todos los campos");
        return;
    }

    fetch(URL + "/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            correo,
            telefono,
            tipo_habitacion: habitacion  // ✅ fix 2 — campo correcto
        })
    })
    .then(res => res.json())
    .then(() => {
        alert("Solicitud enviada correctamente");
        document.getElementById("nombre").value    = "";
        document.getElementById("correo").value    = "";
        document.getElementById("telefono").value  = "";
        document.getElementById("habitacion").value = "";
    });
}
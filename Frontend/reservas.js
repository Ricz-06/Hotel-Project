// Usamos el API global ya definido en otro script (script.js o config.js)
// Si por alguna razón no existe, usamos la URL por defecto.
const API_URL = (typeof API !== 'undefined') ? API : "http://127.0.0.1:3000";

// Helper para obtener las cabeceras con el token de sesión
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('hotel_token') || ''}`
});

/* ===== GESTIÓN DE HABITACIONES ===== */
function seleccionarTipo(tipo) {
    const inputHabitacion = document.getElementById("habitacion");
    if (inputHabitacion) {
        inputHabitacion.value = tipo;
    }
}

async function enviarSolicitud() {
    const nombre     = document.getElementById("nombre").value.trim();
    const correo     = document.getElementById("correo").value.trim();
    const telefono   = document.getElementById("telefono").value.trim();
    const habitacion = document.getElementById("habitacion").value.trim();

    if (!nombre || !correo || !telefono || !habitacion) {
        alert("Por favor, complete todos los campos del formulario.");
        return;
    }

    try {
        const res = await fetch(API_URL + "/solicitudes", {
            method: "POST",
            headers: getHeaders(), // ✅ Token incluido aquí
            body: JSON.stringify({
                nombre,
                correo,
                telefono,
                tipo_habitacion: habitacion
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Solicitud enviada correctamente y vinculada a tu perfil.");
            // Limpiar formulario
            document.getElementById("nombre").value = "";
            document.getElementById("correo").value = "";
            document.getElementById("telefono").value = "";
            document.getElementById("habitacion").value = "";
        } else {
            alert(data.error || "Error al enviar la solicitud. Asegúrese de haber iniciado sesión.");
        }
    } catch (err) {
        console.error("Error de conexión:", err);
        alert("No se pudo conectar con el servidor. Intente más tarde.");
    }
}
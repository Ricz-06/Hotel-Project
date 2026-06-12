// 1. Efecto de scroll para la navbar
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        navbar.classList.toggle("navbar-scrolled", window.scrollY > 50);
    }
});

// 2. Manejo del formulario de reserva conectado a la API
const form = document.getElementById("reservationForm");

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Obtener datos del formulario
        const formData = {
            nombre: document.getElementById("nombre")?.value.trim(),
            correo: document.getElementById("correo")?.value.trim(),
            telefono: document.getElementById("telefono")?.value.trim(),
            tipo_habitacion: document.getElementById("habitacion")?.value.trim()
        };

        // Validación simple
        if (!formData.nombre || !formData.correo || !formData.telefono || !formData.tipo_habitacion) {
            alert("Por favor, rellene todos los campos.");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:3000/solicitudes", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('hotel_token') || ''}` 
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Reservación enviada y vinculada a tu cuenta");
                form.reset();
            } else {
                alert(data.error || "Error al guardar la reserva.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
}
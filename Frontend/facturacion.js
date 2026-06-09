const API = "http://127.0.0.1:3000";

// restaurant.js ya maneja: renderInvoice(), initInvoicePage(),
// carrito, totales, print y clear.
// Aquí solo sobreescribimos el submit para guardar en el backend.

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("invoiceForm");
    if (!form) return;

    // Clonar el form para eliminar el listener de restaurant.js
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const cart = readCart();
        if (!cart || cart.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        const nombre   = document.getElementById("customerName").value.trim();
        const correo   = document.getElementById("customerEmail").value.trim();
        const telefono = document.getElementById("customerPhone").value.trim();

        if (!nombre || !correo || !telefono) {
            alert("Completa los datos del cliente.");
            return;
        }

        const serviceMode = document.getElementById("invoiceServiceMode").value;
        const { subtotal, serviceCharge, iva, total } =
            getCurrentInvoiceTotals(cart, serviceMode);

        const datos = {
            cliente:  nombre,
            correo:   correo,
            telefono: telefono,
            servicio: serviceMode,
            subtotal: parseFloat(subtotal.toFixed(2)),
            iva:      parseFloat(iva.toFixed(2)),
            total:    parseFloat(total.toFixed(2))
        };

        try {
            const res  = await fetch(API + "/facturas", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(datos)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "No se pudo guardar la factura.");
                return;
            }

            alert("✅ Factura guardada correctamente");
            clearCart();
            newForm.reset();
            renderInvoice();

        } catch (err) {
            console.error(err);
            alert("Error al conectar con el servidor.");
        }
    });
});
const API = "http://127.0.0.1:3000";

// Función para vaciar el carrito (solución al error)
function clearCart() {
    localStorage.removeItem("ht_restaurant_cart");
}

// Función para leer el carrito desde localStorage
function readCart() {
    return JSON.parse(localStorage.getItem("ht_restaurant_cart")) || [];
}

// Lógica de cálculos ajustada para Nicaragua (IVA 15% + 10% servicio)
function getCurrentInvoiceTotals(cart) {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const serviceCharge = subtotal * 0.10; 
    const iva = (subtotal + serviceCharge) * 0.15;
    const total = subtotal + serviceCharge + iva;

    // Actualizamos el DOM solo si los elementos existen en el HTML
    if(document.getElementById('invoiceSubtotal')) document.getElementById('invoiceSubtotal').textContent = `C$${subtotal.toFixed(2)}`;
    if(document.getElementById('invoiceService')) document.getElementById('invoiceService').textContent = `C$${serviceCharge.toFixed(2)}`;
    if(document.getElementById('invoiceIva')) document.getElementById('invoiceIva').textContent = `C$${iva.toFixed(2)}`;
    if(document.getElementById('invoiceTotal')) document.getElementById('invoiceTotal').textContent = `C$${total.toFixed(2)}`;

    return { subtotal, serviceCharge, iva, total };
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("invoiceForm");
    if (!form) return;

    // Inicializar totales al cargar la página
    const cart = readCart();
    if (cart.length > 0) {
        getCurrentInvoiceTotals(cart);
    }

    form.addEventListener("submit", async (e) => {
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
        const { subtotal, iva, total } = getCurrentInvoiceTotals(cart);

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

            alert("✅ Factura generada y guardada correctamente");
            
            // Ahora la función existe y no dará error
            clearCart();
            form.reset();
            
            // Recargar vista o limpiar totales
            if (typeof renderInvoice === 'function') renderInvoice();
            else window.location.reload(); 

        } catch (err) {
            console.error(err);
            alert("Error al conectar con el servidor.");
        }
    });
});
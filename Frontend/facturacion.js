const URL = "http://localhost:3000";

console.log("FACTURACION CONECTADA");

const facturaForm =
document.getElementById("invoiceForm");

facturaForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    console.log("BOTON FUNCIONA");

    const datos = {

        cliente:
        document.getElementById("customerName").value,

        correo:
        document.getElementById("customerEmail").value,

        telefono:
        document.getElementById("customerPhone").value,

        servicio:
        document.getElementById("invoiceServiceMode").value,

        subtotal: 100,

        iva: 15,

        total: 125
    };

    console.log(datos);

    try {

        const res = await fetch(URL + "/facturas", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)
        });

        const data = await res.json();

        console.log(data);

        alert("Factura guardada 🔥");

        facturaForm.reset();

    } catch(error) {

        console.error(error);
    }
});
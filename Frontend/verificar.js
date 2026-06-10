const API = "http://127.0.0.1:3000";

/* =========================
   MENSAJES BONITOS
========================= */

function mostrarMensaje(texto, success = true){

    const mensaje = document.getElementById("mensaje");

    mensaje.textContent = texto;

    mensaje.className =
        `mensaje ${success ? "success" : "error"}`;

    mensaje.style.opacity = "1";

    setTimeout(() => {
        mensaje.style.opacity = "0";
    }, 4000);
}

/* =========================
   VERIFICAR CÓDIGO
========================= */

async function verificar() {

    const correo =
        document.getElementById("correo").value.trim();

    const codigo =
        document.getElementById("codigo").value.trim();

    if(!correo || !codigo){

        mostrarMensaje(
            "❌ Debes completar todos los campos",
            false
        );

        return;
    }

    try{

        const response = await fetch(`${API}/verificar`, {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                correo,
                codigo
            })
        });

        const data = await response.json();

        if(data.success){

            mostrarMensaje(
                "✅ Cuenta verificada correctamente",
                true
            );

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);

        }else{

            mostrarMensaje(
                `❌ ${data.error}`,
                false
            );
        }

    }catch(error){

        mostrarMensaje(
            "❌ Error de conexión con el servidor",
            false
        );
    }
}

/* =========================
   TEMPORIZADOR
========================= */

let segundos = 60;

const temporizador = setInterval(() => {

    const contador =
        document.getElementById("contador");

    const boton =
        document.getElementById("btnReenviar");

    segundos--;

    contador.textContent =
        `Reenviar código en ${segundos} segundos`;

    if(segundos <= 0){

        clearInterval(temporizador);

        contador.textContent =
            "Ya puedes reenviar el código";

        boton.disabled = false;

        boton.style.cursor = "pointer";
        boton.style.background = "#2563eb";
    }

},1000);

/* =========================
   REENVIAR CÓDIGO
========================= */

async function reenviarCodigo(){

    mostrarMensaje(
        "📩 Función de reenvío en construcción",
        true
    );
}
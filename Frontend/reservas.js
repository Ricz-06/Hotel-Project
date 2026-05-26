const URL = "http://localhost:3000";

function seleccionarTipo(tipo){

    document.getElementById("habitacion").value = tipo;
}

function enviarSolicitud(){

    const nombre =
    document.getElementById("nombre").value;

    const correo =
    document.getElementById("correo").value;

    const telefono =
    document.getElementById("telefono").value;

    const habitacion =
    document.getElementById("habitacion").value;

    if(
        !nombre ||
        !correo ||
        !telefono ||
        !habitacion
    ){
        alert("Complete todos los campos");
        return;
    }

    fetch(URL + "/solicitudes", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            nombre,
            correo,
            telefono,
            habitacion
        })
    })
    .then(res => res.json())
    .then(data => {

        alert("Solicitud enviada correctamente");

        document.getElementById("nombre").value = "";
        document.getElementById("correo").value = "";
        document.getElementById("telefono").value = "";
        document.getElementById("habitacion").value = "";
    });
}
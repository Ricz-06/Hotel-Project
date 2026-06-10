const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "leandroaguirre0110@gmail.com",
        pass: "vwfrnhizyhpuvsra"
    }
});

const enviarCodigo = async (correo, codigo) => {

    await transporter.sendMail({
        from: "Hotel Transilvania",
        to: correo,
        subject: "Código de Verificación",
        html: `
            <h2>Bienvenido al Hotel Transilvania</h2>
            <p>Tu código de verificación es:</p>
            <h1>${codigo}</h1>
        `
    });

};

module.exports = { enviarCodigo };  
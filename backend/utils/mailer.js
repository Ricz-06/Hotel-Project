const nodemailer = require('nodemailer');

// ✅ Lee las credenciales desde .env, nunca hardcodeadas
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// ✅ Ahora es async y tiene try/catch: si Gmail falla, el servidor NO muere
const enviarCorreo = async (destinatario, asunto, texto) => {
    try {
        await transporter.sendMail({
            from: `"Hotel Transilvania" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: asunto,
            text: texto
        });
        console.log(`✅ Correo enviado a ${destinatario}`);
    } catch (error) {
        // ⚠️ Solo loguea el error, NO lo lanza — el servidor sigue vivo
        console.error(`⚠️  No se pudo enviar correo a ${destinatario}:`, error.message);
    }
};

module.exports = enviarCorreo;
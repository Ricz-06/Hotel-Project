const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const { enviarCodigo } = require('../utils/email');

const SALT_ROUNDS = 10;

// REGISTRAR
const registrar = async (req, res) => {
    const { nombre, correo, password, nombre_completo, usuario } = req.body;

    const nombreFinal = (nombre ?? nombre_completo ?? '').trim();
    const correoFinal = (correo ?? usuario ?? '').trim();

    if (!nombreFinal || !correoFinal || !password) {
        return res.status(400).json({ success: false, error: 'Faltan datos para registrar' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

const codigo = Math.floor(
    100000 + Math.random() * 900000
).toString();

const nuevo = await prisma.usuario.create({
    data: {
        nombre: nombreFinal,
        correo: correoFinal,
        password: hashedPassword,
        role: 'USER',
        verificado: false,
        codigoVerificacion: codigo
    },
    select: {
        id: true,
        nombre: true,
        correo: true,
        role: true
    }
});

console.log("ENVIANDO CORREO A:", correoFinal);
console.log("CODIGO:", codigo);

await enviarCodigo(correoFinal, codigo);

        return res.json({
            success: true,
            mensaje: 'Usuario creado',
            usuario: nuevo,
            nombre_completo: nuevo.nombre
        });

    } catch (error) {
    console.error("ERROR REGISTRANDO:");
    console.error(error);

    return res.status(400).json({
        success: false,
        error: error.message
    });
}
};

// LOGIN
const login = async (req, res) => {
    const { correo, usuario, password } = req.body;
    const correoFinal = (correo ?? usuario ?? '').trim();

    if (!correoFinal || !password) {
        return res.status(400).json({ success: false, error: 'Faltan datos de login' });
    }

    try {
        const usuarioDb = await prisma.usuario.findUnique({
            where: { correo: correoFinal }
        });

        if (!usuarioDb) {
            return res.status(401).json({ success: false, error: 'Datos incorrectos' });
        }

        const passwordValido = await bcrypt.compare(password, usuarioDb.password);

        if (!passwordValido) {
            return res.status(401).json({ success: false, error: 'Datos incorrectos' });
        }

        // Guardar sesión y esperar confirmación antes de responder
        req.session.user = {
            id: usuarioDb.id,
            nombre: usuarioDb.nombre,
            correo: usuarioDb.correo,
            role: usuarioDb.role
        };

        req.session.save((err) => {
            if (err) {
                console.error("Error guardando sesión:", err);
                return res.status(500).json({ success: false, error: 'Error de sesión' });
            }

            console.log("=================================");
            console.log("SESION GUARDADA Y CONFIRMADA");
            console.log("SESSION ID:", req.sessionID);
            console.log("USER:", req.session.user);
            console.log("=================================");

            const { password: _, ...usuarioSinPassword } = usuarioDb;

            return res.json({
                success: true,
                mensaje: 'Login correcto',
                usuario: usuarioSinPassword,
                nombre_completo: usuarioSinPassword.nombre
            });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
};

// VER USUARIOS
const verUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: { id: true, nombre: true, correo: true, role: true }
        });
        return res.json(usuarios);
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

module.exports = { registrar, login, verUsuarios };
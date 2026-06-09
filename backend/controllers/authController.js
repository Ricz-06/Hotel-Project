const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');

const SALT_ROUNDS = 10;

// REGISTRAR
const registrar = async (req, res) => {
    // Front manda (nombre_completo, usuario, password)
    // DB usa (nombre, correo, password)
    const {
        nombre,
        correo,
        password,
        nombre_completo,
        usuario
    } = req.body;

    const nombreFinal = (nombre ?? nombre_completo ?? '').trim();
    // Si viene `usuario` desde el front, lo tratamos como correo
    const correoFinal = (correo ?? usuario ?? '').trim();

    if (!nombreFinal || !correoFinal || !password) {
        return res.status(400).json({ success: false, error: 'Faltan datos para registrar' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const nuevo = await prisma.usuario.create({
            data: { nombre: nombreFinal, correo: correoFinal, password: hashedPassword, role: 'USER' },
            select: { id: true, nombre: true, correo: true, role: true }
        });

        return res.json({
            success: true,
            mensaje: 'Usuario creado',
            usuario: nuevo,
            nombre_completo: nuevo.nombre
        });

    } catch (error) {
        return res.status(400).json({ success: false, error: 'Correo ya registrado' });
    }
};

// LOGIN
const login = async (req, res) => {
    // Front manda (usuario, password), DB usa (correo, password)
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

        // Iniciar sesión (para el panel admin)
        req.session.user = {
            id: usuarioDb.id,
            nombre: usuarioDb.nombre,
            correo: usuarioDb.correo,
            role: usuarioDb.role
        };

        // Nunca devolver el password
        const { password: _, ...usuarioSinPassword } = usuarioDb;

        return res.json({
            success: true,
            mensaje: 'Login correcto',
            usuario: usuarioSinPassword,
            nombre_completo: usuarioSinPassword.nombre
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
};

// VER USUARIOS (sin password — como el ejemplo del PDF)
const verUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                correo: true,
                role: true
                // password: NO se incluye
            }
        });

        return res.json(usuarios);

    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

module.exports = { registrar, login, verUsuarios };

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'TuClaveSecretaSuperSegura';

// ==========================================
// 1. REGISTRAR USUARIO
// ==========================================
const registrar = async (req, res) => {
    const { nombre, correo, password, nombre_completo, usuario } = req.body;

    const nombreFinal = (nombre ?? nombre_completo ?? '').trim();
    const correoFinal = (correo ?? usuario ?? '').trim();

    if (!nombreFinal || !correoFinal || !password) {
        return res.status(400).json({ success: false, error: 'Faltan datos para registrar' });
    }

    try {
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { correo: correoFinal }
        });

        if (usuarioExistente) {
            return res.status(400).json({ success: false, error: 'El correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const nuevo = await prisma.usuario.create({
            data: {
                nombre: nombreFinal,
                correo: correoFinal,
                password: hashedPassword,
                role: 'USER'
            },
            select: { id: true, nombre: true, correo: true, role: true }
        });

        // ✅ CORREGIDO: se agrega "nombre" al payload del JWT
        const token = jwt.sign(
            { id: nuevo.id, correo: nuevo.correo, role: nuevo.role, nombre: nuevo.nombre },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            success: true,
            mensaje: 'Usuario creado con éxito',
            token: token,
            usuario: nuevo,
            nombre_completo: nuevo.nombre
        });

    } catch (error) {
        console.error('❌ Error real en el proceso de registro:', error);
        return res.status(500).json({ success: false, error: 'Error interno al procesar el registro en la base de datos' });
    }
};

// ==========================================
// 2. INICIAR SESIÓN (LOGIN)
// ==========================================
const login = async (req, res) => {
    const { usuario, correo, password } = req.body;
    const correoFinal = (correo ?? usuario ?? '').trim();

    if (!correoFinal || !password) {
        return res.status(400).json({ success: false, error: 'Faltan datos para iniciar sesión' });
    }

    try {
        const usuarioDb = await prisma.usuario.findUnique({
            where: { correo: correoFinal }
        });

        if (!usuarioDb) {
            return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }

        const passwordCorrecto = await bcrypt.compare(password, usuarioDb.password);
        if (!passwordCorrecto) {
            return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }

        // ✅ CORREGIDO: se agrega "nombre" al payload del JWT
        const token = jwt.sign(
            {
                id: usuarioDb.id,
                correo: usuarioDb.correo,
                role: usuarioDb.role,
                nombre: usuarioDb.nombre
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.log('=================================');
        console.log(`JWT EMITIDO EXITOSAMENTE PARA: ${usuarioDb.correo}`);
        console.log(`ROL DEL USUARIO: ${usuarioDb.role}`);
        console.log('=================================');

        const { password: _, ...usuarioSinPassword } = usuarioDb;

        return res.json({
            success: true,
            mensaje: 'Login correcto',
            token: token,
            usuario: usuarioSinPassword,
            nombre_completo: usuarioSinPassword.nombre
        });

    } catch (error) {
        console.error('❌ Error en login controlador:', error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

// ==========================================
// 3. VER USUARIOS registrados
// ==========================================
const verUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: { id: true, nombre: true, correo: true, role: true }
        });
        return res.json(usuarios);
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

module.exports = { registrar, login, verUsuarios };
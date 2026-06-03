const prisma = require('../prisma/client');

// REGISTRAR
const registrar = async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        const usuario = await prisma.usuario.create({
            data: { nombre, correo, password },
            select: { id: true, nombre: true, correo: true, role: true }
        });

        res.json({ mensaje: 'Usuario creado', usuario });

    } catch (error) {
        res.status(400).json({ error: 'Correo ya registrado' });
    }
};

// LOGIN
const login = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { correo }
        });

        if (!usuario || usuario.password !== password) {
            return res.status(401).json({ error: 'Datos incorrectos' });
        }

        // Nunca devolver el password
        const { password: _, ...usuarioSinPassword } = usuario;

        res.json({ mensaje: 'Login correcto', usuario: usuarioSinPassword });

    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// VER USUARIOS (sin password — como el ejemplo del PDF)
const verUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id:     true,
                nombre: true,
                correo: true,
                role:   true
                // password: NO se incluye
            }
        });

        res.json(usuarios);

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

module.exports = { registrar, login, verUsuarios };

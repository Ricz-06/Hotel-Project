const db = require('../db');

// REGISTRAR
const registrar = (req, res) => {
    const { nombre, correo, password } = req.body;

    db.query(
        "INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)",
        [nombre, correo, password],
        (err) => {
            if (err) {
                return res.json({ error: "Correo ya registrado" });
            }

            res.json({ mensaje: "Usuario creado" });
        }
    );
};

// LOGIN
const login = (req, res) => {
    const { correo, password } = req.body;

    db.query(
        "SELECT * FROM usuarios WHERE correo=? AND password=?",
        [correo, password],
        (err, results) => {

            if (results.length === 0) {
                return res.json({ error: "Datos incorrectos" });
            }

            res.json({
                mensaje: "Login correcto",
                usuario: results[0]
            });
        }
    );
};

module.exports = {
    registrar,
    login
};
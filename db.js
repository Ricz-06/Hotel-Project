const mysql = require('mysql2');

/* 🔥 CONEXIÓN A BASE DE DATOS */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'hotel_db'
});

/* 🔥 CONECTAR */
connection.connect((err) => {
    if (err) {
        console.log('❌ Error conectando a MySQL:', err);
        return;
    }

    console.log('✅ MySQL conectado correctamente');
});

/* 🔥 EXPORTAR */
module.exports = connection;
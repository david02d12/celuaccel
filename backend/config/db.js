/**
 * config/db.js
 * Conexión a la base de datos MySQL (TiDB Cloud) de CeluAccel.
 */
const mysql = require('mysql2');
const path = require('path');

// Solo cargar archivo .env si estamos en entorno local
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

// Configuración de conexión con SSL activo para TiDB Cloud
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00'
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        console.error('Host intentado:', process.env.DB_HOST);
        return;
    }
    console.log('Conectado exitosamente a TiDB Cloud:', process.env.DB_NAME);
    connection.release();
});

const queryPromise = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
    );

module.exports = db;
module.exports.queryPromise = queryPromise;

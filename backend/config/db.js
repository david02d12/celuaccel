/**
 * config/db.js
 * Conexión a la base de datos MySQL (TiDB Cloud) de CeluAccel.
 */
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = mysql.createPool({
    host:             process.env.DB_HOST     || '127.0.0.1',
    user:             process.env.DB_USER     || 'root',
    password:         process.env.DB_PASSWORD || '',
    database:         process.env.DB_NAME     || 'celuaccel',
    port:             process.env.DB_PORT     || 4000, //SE CAMBIO EL PUETO 3000 POR EL PUERTO 4000 QUE ES LA NUEVA DE LA DB NUEW:)
    ssl: {
        rejectUnauthorized: true // Requerido por TiDB Cloud para cifrado seguro SSL
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00' // Mantiene la interpretación de fechas en UTC
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conectado exitosamente a TiDB Cloud:', process.env.DB_NAME || 'celuaccel');
    connection.release();
});

const queryPromise = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
    );

module.exports = db;
module.exports.queryPromise = queryPromise;
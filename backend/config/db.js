/**
 * config/db.js
 * Conexión a la base de datos MySQL de CeluAccel.
 *
 * Crea un pool de conexiones usando las variables de entorno:
 *   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
 *
 * Exporta:
 *   - db          : pool de mysql2 (para uso directo con callbacks)
 *   - queryPromise: versión Promise de db.query (para usar con async/await en los DAOs)
 *
 * Uso en un DAO:
 *   const { queryPromise } = require('../config/db');
 *   const rows = await queryPromise('SELECT * FROM Usuario WHERE ID_Usuario = ?', [id]);
 */
const mysql = require('mysql2');

const db = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'celuaccel',
    port:     process.env.DB_PORT     || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00' // Fuerzo a mysql2 a interpretar las fechas como UTC para arreglar el offset de 5h
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conectado a la base de datos:', process.env.DB_NAME || 'celuaccel');
    connection.release();
});

const queryPromise = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
    );

module.exports = db;
module.exports.queryPromise = queryPromise;

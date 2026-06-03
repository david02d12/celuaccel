const mysql = require('mysql2');

const db = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'celuaccel',
    port:     process.env.DB_PORT     || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conectado a la base de datos:', process.env.DB_NAME || 'celuaccel');
    connection.release();
});

// Convierte db.query (callback) en una Promise para poder usar async/await en los DAOs.
const queryPromise = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
    );

module.exports = db;
module.exports.queryPromise = queryPromise;

const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'celuaccel'
  });
  
  const [schema] = await connection.execute('DESCRIBE Usuario');
  console.log('--- SCHEMA ---');
  console.log(schema);

  const [users] = await connection.execute('SELECT ID_Usuario, Nombre, Correo FROM Usuario');
  console.log('--- USERS ---');
  console.log(users);
  
  await connection.end();
}
main().catch(console.error);

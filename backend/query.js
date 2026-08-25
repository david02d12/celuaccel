const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'celuaccel'
  });
  
  const [schema] = await connection.execute('DESCRIBE Historial_Servicios');
  console.log('--- SCHEMA ---');
  console.log(schema);

  await connection.end();
}
main().catch(console.error);

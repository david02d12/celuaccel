import { execSync } from 'child_process';
import path from 'path';

// Ejecuta un script en el contexto del backend donde mysql2 ya está instalado y configurado
export function runQuery(query) {
  try {
    const script = `
      const mysql = require('mysql2/promise');
      require('dotenv').config();
      async function run() {
        const c = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'celuaccel'
        });
        await c.execute(\`${query}\`);
        await c.end();
      }
      run();
    `;
    execSync(`node -e "${script.replace(/\n/g, ' ')}"`, { cwd: path.resolve(process.cwd(), '../backend') });
  } catch (err) {
    console.error('Error db-cleaner:', err.message);
  }
}

export async function getConexion() {
  // Mock para que no falle chat.spec.js al iniciar (no se usa conexion directa, sino execSync)
  return {
    execute: async (q, params) => {
      let finalQ = q;
      if (params) {
         params.forEach(p => {
           finalQ = finalQ.replace('?', "'" + p + "'");
         });
      }
      runQuery(finalQ);
    },
    end: async () => {}
  };
}

export async function limpiarUsuarioPrueba() {
  runQuery(`DELETE FROM Usuario WHERE ID_Usuario = '1234567890'`);
}

export async function limpiarComentarioPrueba() {
  runQuery(`DELETE FROM Comentarios WHERE Comentario LIKE '%Excelente servicio, muy rápidos y profesionales.%'`);
}

export async function limpiarPreguntaPrueba() {
  runQuery(`DELETE FROM pregunta WHERE Pregunta = '¿Cuánto tiempo demora una reparación de pantalla?'`);
}

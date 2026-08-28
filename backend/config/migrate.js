/**
 * config/migrate.js
 * Migraciones automáticas de base de datos para CeluAccel.
 *
 * Se ejecuta al arrancar el servidor y aplica cambios de esquema
 * de forma segura (idempotente: puede correr múltiples veces sin error).
 *
 * ──────────────────────────────────────────────────────────────────
 * Migraciones incluidas:
 *   M001 – Agrega columna Estado_Chat a la tabla Chat (2026-08-26)
 * ──────────────────────────────────────────────────────────────────
 */
const { queryPromise } = require('./db');

const migraciones = [
    {
        id: 'M001',
        descripcion: "Agrega columna Estado_Chat a la tabla Chat",
        sql: `ALTER TABLE Chat ADD COLUMN Estado_Chat VARCHAR(20) NOT NULL DEFAULT 'Activo'`,
        // Si la columna ya existe MySQL lanza ER_DUP_FIELDNAME — se ignora
        ignorarError: 'ER_DUP_FIELDNAME',
    },
    {
        id: 'M002',
        descripcion: "Pone 'Activo' en todos los chats que tengan Estado_Chat NULL o vacío",
        sql: `UPDATE Chat SET Estado_Chat = 'Activo' WHERE Estado_Chat IS NULL OR TRIM(Estado_Chat) = ''`,
    },
];

const runMigrations = async () => {
    for (const m of migraciones) {
        try {
            await queryPromise(m.sql);
            console.log(`[migrate] ✅ ${m.id}: ${m.descripcion}`);
        } catch (err) {
            if (m.ignorarError && err.code === m.ignorarError) {
                console.log(`[migrate] ⏭️  ${m.id}: ya aplicada — ${m.descripcion}`);
            } else {
                console.error(`[migrate] ❌ ${m.id}: ${err.message}`);
            }
        }
    }
};

module.exports = { runMigrations };

const { queryPromise: query } = require('../config/db');

// ─── LECTURA ─────────────────────────────────────────────────────────────────

/** Todas las notificaciones (admin) ordenadas por más reciente */
const getAll = () =>
    query(`
        SELECT *
        FROM   Notificaciones
        ORDER  BY Fecha DESC
    `);

/** Notificaciones para un usuario específico, opcionalmente solo las no leídas */
const getByUsuario = (idUsuario, soloNoLeidas = false) => {
    const sql = soloNoLeidas
        ? `SELECT * FROM Notificaciones
           WHERE ID_Usuario_Destino = ? AND Leida = 0
           ORDER BY Fecha DESC`
        : `SELECT * FROM Notificaciones
           WHERE ID_Usuario_Destino = ?
           ORDER BY Fecha DESC`;
    return query(sql, [idUsuario]);
};

/** Cuenta las no leídas de un usuario (para badge/indicador en el frontend) */
const contarNoLeidas = (idUsuario) =>
    query(
        `SELECT COUNT(*) AS total
         FROM   Notificaciones
         WHERE  ID_Usuario_Destino = ? AND Leida = 0`,
        [idUsuario]
    );

/** Busca una notificación por ID devolviendo todos los campos */
const findById = (id) =>
    query(
        'SELECT * FROM Notificaciones WHERE ID_Notificacion = ?',
        [id]
    );

// ─── ESCRITURA ────────────────────────────────────────────────────────────────

/**
 * Crea una notificación dirigida a un usuario concreto.
 * @param {object} data
 * @param {string}      data.ID_Usuario_Destino  - Usuario que recibirá la notif.
 * @param {string|null} data.ID_Usuario_Origen   - Usuario/sistema que la genera.
 * @param {number|null} data.ID_Servicio         - Servicio relacionado (opcional).
 * @param {string}      data.Tipo_Notificacion   - Texto del mensaje.
 */
const crearDirigida = ({ ID_Usuario_Destino, ID_Usuario_Origen = null, ID_Servicio = null, Mensaje }) =>
    query(
        `INSERT INTO Notificaciones
            (ID_Usuario_Destino, ID_Usuario_Origen, ID_Servicio, Mensaje, Leida)
         VALUES (?, ?, ?, ?, 0)`,
        [ID_Usuario_Destino, ID_Usuario_Origen, ID_Servicio, Mensaje]
    );

/**
 * Crea una notificación dirigida a un usuario.
 * El esquema de la base de datos exige ID_Usuario_Destino NOT NULL, por lo
 * que toda notificación requiere un destinatario.
 */
const create = ({ ID_Usuario_Destino, ID_Usuario_Origen = null, ID_Servicio = null, Mensaje }) =>
    query(
        `INSERT INTO Notificaciones
            (ID_Usuario_Destino, ID_Usuario_Origen, ID_Servicio, Mensaje, Leida)
         VALUES (?, ?, ?, ?, 0)`,
        [ID_Usuario_Destino, ID_Usuario_Origen, ID_Servicio, Mensaje]
    );

/** Actualiza el texto de una notificación */
const update = ({ Mensaje, ID_Notificacion }) =>
    query(
        `UPDATE Notificaciones
         SET    Mensaje = ?
         WHERE  ID_Notificacion = ?`,
        [Mensaje, ID_Notificacion]
    );

/** Marca una notificación como leída */
const marcarLeida = (id) =>
    query(
        `UPDATE Notificaciones SET Leida = 1 WHERE ID_Notificacion = ?`,
        [id]
    );

/** Marca todas las notificaciones de un usuario como leídas */
const marcarTodasLeidas = (idUsuario) =>
    query(
        `UPDATE Notificaciones SET Leida = 1 WHERE ID_Usuario_Destino = ?`,
        [idUsuario]
    );

const remove = (id) =>
    query('DELETE FROM Notificaciones WHERE ID_Notificacion = ?', [id]);

module.exports = {
    getAll,
    getByUsuario,
    contarNoLeidas,
    findById,
    crearDirigida,
    create,
    update,
    marcarLeida,
    marcarTodasLeidas,
    remove,
};

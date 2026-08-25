const { queryPromise: query } = require('../config/db');

// Query base con JOIN para traer nombre del usuario y último mensaje
const CHAT_SELECT = `
    SELECT
        c.Codigo_Chat,
        c.ID_Usuario,
        c.ID_Servicio,
        s.Etapa             AS Etapa_Servicio,
        u.Nombre            AS Nombre_Usuario,
        m.Mensaje           AS Ultimo_Mensaje,
        m.Fecha_Mensaje     AS Fecha_Ultimo_Mensaje,
        (
            SELECT u2.Nombre
            FROM Mensajes m2
            JOIN Usuario u2 ON m2.ID_Usuario = u2.ID_Usuario
            WHERE m2.Codigo_Chat = c.Codigo_Chat AND u2.Codigo_Rol IN (1, 3)
            ORDER BY m2.Codigo_Mensaje ASC
            LIMIT 1
        ) AS Nombre_Tecnico
    FROM Chat c
    LEFT JOIN Usuario u  ON TRIM(u.ID_Usuario) = TRIM(c.ID_Usuario)
    LEFT JOIN Servicio s ON s.ID_Servicio = c.ID_Servicio
    LEFT JOIN Mensajes m ON m.Codigo_Mensaje = (
        SELECT Codigo_Mensaje FROM Mensajes
        WHERE Codigo_Chat = c.Codigo_Chat
        ORDER BY Codigo_Mensaje DESC LIMIT 1
    )
`;

const getAll = () =>
    query(`${CHAT_SELECT} WHERE c.Estado_Chat = 'Activo' ORDER BY c.Codigo_Chat DESC`);

const getMios = (idUsuario) =>
    query(
        `${CHAT_SELECT}
         WHERE c.Estado_Chat = 'Activo' AND (TRIM(c.ID_Usuario) = TRIM(?)
            OR c.ID_Servicio IN (
                SELECT ID_Servicio FROM Servicio WHERE TRIM(ID_Usuario) = TRIM(?)
            ))
         ORDER BY c.Codigo_Chat DESC`,
        [idUsuario, idUsuario]
    );

const findByServicio = (ID_Servicio) => {
    if (ID_Servicio === null || ID_Servicio === undefined) return Promise.resolve([]);
    return query('SELECT Codigo_Chat FROM Chat WHERE ID_Servicio = ?', [ID_Servicio]);
};

const create = (ID_Usuario, ID_Servicio) => {
    if (ID_Servicio !== null && ID_Servicio !== undefined) {
        // Inserción atómica: solo inserta si no existe ya un chat para este servicio
        // Esto previene duplicados por condiciones de carrera
        return query(
            `INSERT INTO Chat (ID_Usuario, ID_Servicio)
             SELECT ?, ?
             FROM DUAL
             WHERE NOT EXISTS (SELECT 1 FROM Chat WHERE ID_Servicio = ?)`,
            [ID_Usuario, ID_Servicio, ID_Servicio]
        );
    }
    // Chat de consulta de catálogo: sin servicio asociado
    return query('INSERT INTO Chat (ID_Usuario) VALUES (?)', [ID_Usuario]);
};

const update = ({ ID_Usuario, ID_Servicio, Codigo_Chat }) =>
    query(
        'UPDATE Chat SET ID_Usuario = ?, ID_Servicio = ? WHERE Codigo_Chat = ?',
        [ID_Usuario, ID_Servicio, Codigo_Chat]
    );

const remove = (id) =>
    query('UPDATE Chat SET Estado_Chat = \'Inactivo\' WHERE Codigo_Chat = ?', [id]);

module.exports = { getAll, getMios, findByServicio, create, update, remove };

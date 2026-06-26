const { queryPromise: query } = require('../config/db');

// Query base con JOIN para traer nombre del usuario y último mensaje
const CHAT_SELECT = `
    SELECT
        c.Codigo_Chat,
        c.ID_Usuario,
        c.ID_Servicio,
        u.Nombre                    AS Nombre_Usuario,
        m.Mensaje                   AS Ultimo_Mensaje,
        m.Fecha_Mensaje             AS Fecha_Ultimo_Mensaje,
        s.Descripcion               AS Servicio_Descripcion,
        s.Movil_Nombre              AS Servicio_Movil
    FROM Chat c
    LEFT JOIN Usuario u      ON TRIM(u.ID_Usuario) = TRIM(c.ID_Usuario)
    LEFT JOIN Mensajes m     ON m.Codigo_Mensaje = (
        SELECT Codigo_Mensaje FROM Mensajes
        WHERE Codigo_Chat = c.Codigo_Chat
        ORDER BY Codigo_Mensaje DESC LIMIT 1
    )
    LEFT JOIN Servicio s     ON s.ID_Servicio = c.ID_Servicio
`;

const getAll = () =>
    query(`${CHAT_SELECT} ORDER BY c.Codigo_Chat DESC`);

const getMios = (idUsuario) =>
    query(
        `${CHAT_SELECT}
         WHERE TRIM(c.ID_Usuario) = TRIM(?)
            OR c.ID_Servicio IN (
                SELECT ID_Servicio FROM Servicio WHERE TRIM(ID_Usuario) = TRIM(?)
            )
         ORDER BY c.Codigo_Chat DESC`,
        [idUsuario, idUsuario]
    );

const findByServicio = (ID_Servicio) => {
    if (ID_Servicio === null || ID_Servicio === undefined) return Promise.resolve([]);
    return query('SELECT Codigo_Chat FROM Chat WHERE ID_Servicio = ?', [ID_Servicio]);
};

const create = (ID_Usuario, ID_Servicio) => {
    if (ID_Servicio !== null && ID_Servicio !== undefined) {
        return query('INSERT INTO Chat (ID_Usuario, ID_Servicio) VALUES (?, ?)', [ID_Usuario, ID_Servicio]);
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
    query('DELETE FROM Chat WHERE Codigo_Chat = ?', [id]);

module.exports = { getAll, getMios, findByServicio, create, update, remove };

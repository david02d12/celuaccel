const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM mensajes');

const create = ({ Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado }) =>
    query(
        `INSERT INTO mensajes (Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado) VALUES (?, ?, ?, ?, ?)`,
        [Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado]
    );

const update = ({ Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado, Codigo_Mensaje }) =>
    query(
        `UPDATE mensajes SET Codigo_Chat=?, ID_Usuario=?, Fecha_Mensaje=?, Mensaje=?, Estado=? WHERE Codigo_Mensaje=?`,
        [Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado, Codigo_Mensaje]
    );

const findWithOwnerCheck = (id, userId) =>
    query(
        `SELECT m.ID_Usuario AS dueno, u.Codigo_Rol AS rol
         FROM mensajes m
         JOIN usuario u ON u.ID_Usuario = ?
         WHERE m.Codigo_Mensaje = ?`,
        [userId, id]
    );

const remove = (id) =>
    query('DELETE FROM mensajes WHERE Codigo_Mensaje = ?', [id]);

const getByChat = (codigoChat) =>
    query(
        `SELECT m.*, u.Nombre AS Nombre_Usuario
         FROM mensajes m
         LEFT JOIN usuario u ON m.ID_Usuario = u.ID_Usuario
         WHERE m.Codigo_Chat = ?
         ORDER BY m.Codigo_Mensaje ASC`,
        [codigoChat]
    );

const marcarLeidos = (codigoChat, idUsuarioLector) =>
    query(
        `UPDATE mensajes 
         SET Estado = 1 
         WHERE Codigo_Chat = ? AND ID_Usuario != ? AND Estado = 0`,
        [codigoChat, idUsuarioLector]
    );

const contarNoLeidosGlobal = (idUsuario, rol) => {
    if (rol === 2) {
        return query(
            `SELECT COUNT(*) AS total
             FROM mensajes m
             JOIN chat c ON m.Codigo_Chat = c.Codigo_Chat
             WHERE m.Estado = 0 
               AND m.ID_Usuario != ? 
               AND TRIM(c.ID_Usuario) = TRIM(?)`,
            [idUsuario, idUsuario]
        );
    }
    return query(
        `SELECT COUNT(*) AS total
         FROM mensajes m
         WHERE m.Estado = 0 
           AND m.ID_Usuario != ?`,
        [idUsuario]
    );
};

module.exports = { getAll, create, update, findWithOwnerCheck, remove, getByChat, marcarLeidos, contarNoLeidosGlobal };

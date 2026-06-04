const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Mensajes');

const create = ({ Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado }) =>
    query(
        `INSERT INTO Mensajes (Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado) VALUES (?, ?, ?, ?, ?)`,
        [Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado]
    );

const update = ({ Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado, Codigo_Mensaje }) =>
    query(
        `UPDATE Mensajes SET Codigo_Chat=?, ID_Usuario=?, Fecha_Mensaje=?, Mensaje=?, Estado=? WHERE Codigo_Mensaje=?`,
        [Codigo_Chat, ID_Usuario, Fecha_Mensaje, Mensaje, Estado, Codigo_Mensaje]
    );

const findWithOwnerCheck = (id, userId) =>
    query(
        `SELECT m.ID_Usuario AS dueno, u.Codigo_Rol AS rol
         FROM Mensajes m
         JOIN Usuario u ON u.ID_Usuario = ?
         WHERE m.Codigo_Mensaje = ?`,
        [userId, id]
    );

const remove = (id) =>
    query('DELETE FROM Mensajes WHERE Codigo_Mensaje = ?', [id]);

const getByChat = (codigoChat) =>
    query(
        'SELECT * FROM Mensajes WHERE Codigo_Chat = ? ORDER BY Codigo_Mensaje ASC',
        [codigoChat]
    );

module.exports = { getAll, create, update, findWithOwnerCheck, remove, getByChat };

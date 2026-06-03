const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Chat');

const getMios = (idUsuario) =>
    query(
        `SELECT c.* FROM Chat c
         LEFT JOIN Servicio s ON c.ID_Servicio = s.ID_Servicio
         WHERE TRIM(s.ID_Usuario) = TRIM(?)
         UNION
         SELECT * FROM Chat WHERE TRIM(ID_Usuario) = TRIM(?)`,
        [idUsuario, idUsuario]
    );

const findByServicio = (ID_Servicio) =>
    query('SELECT Codigo_Chat FROM Chat WHERE ID_Servicio = ?', [ID_Servicio]);

const create = (ID_Usuario, ID_Servicio) =>
    query('INSERT INTO Chat (ID_Usuario, ID_Servicio) VALUES (?, ?)', [ID_Usuario, ID_Servicio]);

const update = ({ ID_Usuario, ID_Servicio, Codigo_Chat }) =>
    query(
        'UPDATE Chat SET ID_Usuario = ?, ID_Servicio = ? WHERE Codigo_Chat = ?',
        [ID_Usuario, ID_Servicio, Codigo_Chat]
    );

const remove = (id) =>
    query('DELETE FROM Chat WHERE Codigo_Chat = ?', [id]);

module.exports = { getAll, getMios, findByServicio, create, update, remove };

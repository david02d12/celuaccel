const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Notificaciones ORDER BY Codigo_Notificaciones DESC');

const findById = (id) =>
    query('SELECT Tipo_Notificacion FROM Notificaciones WHERE Codigo_Notificaciones = ?', [id]);

/** Inserta una notificación dirigida (payload JSON en Tipo_Notificacion) */
const crearDirigida = (payload) =>
    query('INSERT INTO Notificaciones (Tipo_Notificacion) VALUES (?)', [JSON.stringify(payload)]);

/** Actualiza el JSON de una notificación dirigida (ej: marcar como leída) */
const updatePayload = (id, payload) =>
    query(
        'UPDATE Notificaciones SET Tipo_Notificacion = ? WHERE Codigo_Notificaciones = ?',
        [JSON.stringify(payload), id]
    );

const create = ({ Codigo_Notificaciones, Tipo_Notificacion }) =>
    query(
        `INSERT INTO Notificaciones (Codigo_Notificaciones, Tipo_Notificacion) VALUES (?, ?)`,
        [Codigo_Notificaciones, Tipo_Notificacion]
    );

const update = ({ Tipo_Notificacion, Codigo_Notificaciones }) =>
    query(
        `UPDATE Notificaciones SET Tipo_Notificacion = ? WHERE Codigo_Notificaciones = ?`,
        [Tipo_Notificacion, Codigo_Notificaciones]
    );

const remove = (id) =>
    query('DELETE FROM Notificaciones WHERE Codigo_Notificaciones = ?', [id]);

module.exports = { getAll, findById, crearDirigida, updatePayload, create, update, remove };

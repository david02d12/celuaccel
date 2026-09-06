const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Tipo_Documento');

/** Verifica si el tipo de documento está asignado a algún usuario */
const isEnUso = (id) =>
    query('SELECT 1 FROM Usuario WHERE Codigo_Documento = ? LIMIT 1', [id]);

const create = (Codigo_Documento, Tipo_Documento) =>
    query(
        'INSERT INTO Tipo_Documento (Codigo_Documento, Tipo_Documento) VALUES (?, ?)',
        [Codigo_Documento, Tipo_Documento]
    );

const update = (Codigo_Documento, Tipo_Documento) =>
    query(
        'UPDATE Tipo_Documento SET Tipo_Documento=? WHERE Codigo_Documento=?',
        [Tipo_Documento, Codigo_Documento]
    );

const remove = (id) =>
    query('DELETE FROM Tipo_Documento WHERE Codigo_Documento = ?', [id]);

module.exports = { getAll, isEnUso, create, update, remove };


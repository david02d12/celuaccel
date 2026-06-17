const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Tipo_Documento');

const create = (Codigo_Documento, Nombre_Documento) =>
    query(
        'INSERT INTO Tipo_Documento (Codigo_Documento, Nombre_Documento) VALUES (?, ?)',
        [Codigo_Documento, Nombre_Documento]
    );

const update = (Codigo_Documento, Nombre_Documento) =>
    query(
        'UPDATE Tipo_Documento SET Nombre_Documento=? WHERE Codigo_Documento=?',
        [Nombre_Documento, Codigo_Documento]
    );

const remove = (id) =>
    query('DELETE FROM Tipo_Documento WHERE Codigo_Documento = ?', [id]);

module.exports = { getAll, create, update, remove };

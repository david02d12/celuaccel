const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM tipo_documento');

/** Verifica si el tipo de documento está asignado a algún usuario */
const isEnUso = (id) =>
    query('SELECT 1 FROM usuario WHERE Codigo_Documento = ? LIMIT 1', [id]);

const create = (Codigo_Documento, Tipo_Documento) =>
    query(
        'INSERT INTO tipo_documento (Codigo_Documento, Tipo_Documento) VALUES (?, ?)',
        [Codigo_Documento, Tipo_Documento]
    );

const update = (Codigo_Documento, Tipo_Documento) =>
    query(
        'UPDATE tipo_documento SET Tipo_Documento=? WHERE Codigo_Documento=?',
        [Tipo_Documento, Codigo_Documento]
    );

const remove = (id) =>
    query('DELETE FROM tipo_documento WHERE Codigo_Documento = ?', [id]);

module.exports = { getAll, isEnUso, create, update, remove };


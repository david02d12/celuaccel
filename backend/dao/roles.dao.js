const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM roles');

const findById = (id) =>
    query('SELECT 1 FROM roles WHERE Codigo_Rol = ? LIMIT 1', [id]);

/** Verifica si el rol está asignado a algún usuario */
const isEnUso = (id) =>
    query('SELECT 1 FROM usuario WHERE Codigo_Rol = ? LIMIT 1', [id]);

const create = (Codigo_Rol, Nombre_Rol) =>
    query('INSERT INTO roles (Codigo_Rol, Nombre_Rol) VALUES (?, ?)', [Codigo_Rol, Nombre_Rol]);

const update = (Codigo_Rol, Nombre_Rol) =>
    query('UPDATE roles SET Nombre_Rol=? WHERE Codigo_Rol=?', [Nombre_Rol, Codigo_Rol]);

const remove = (id) =>
    query('DELETE FROM roles WHERE Codigo_Rol = ?', [id]);

module.exports = { getAll, findById, isEnUso, create, update, remove };


const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Roles');

const create = (Codigo_Rol, Descripcion_Rol) =>
    query('INSERT INTO Roles (Codigo_Rol, Descripcion_Rol) VALUES (?, ?)', [Codigo_Rol, Descripcion_Rol]);

const update = (Codigo_Rol, Descripcion_Rol) =>
    query('UPDATE Roles SET Descripcion_Rol=? WHERE Codigo_Rol=?', [Descripcion_Rol, Codigo_Rol]);

const remove = (id) =>
    query('DELETE FROM Roles WHERE Codigo_Rol = ?', [id]);

module.exports = { getAll, create, update, remove };

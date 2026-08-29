const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Categoria');

const create = (ID_Categoria, Nombre_Categoria) =>
    query('INSERT INTO Categoria VALUES (?, ?)', [ID_Categoria, Nombre_Categoria]);

const update = (ID_Categoria, Nombre_Categoria) =>
    query('UPDATE Categoria SET Nombre_Categoria=? WHERE ID_Categoria=?', [Nombre_Categoria, ID_Categoria]);

const remove = (id) =>
    query('DELETE FROM Categoria WHERE ID_Categoria = ?', [id]);

module.exports = { getAll, create, update, remove };

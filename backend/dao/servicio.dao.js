const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Servicio');

const getByUsuario = (idUsuario) =>
    query('SELECT * FROM Servicio WHERE ID_Usuario = ? ORDER BY Fecha DESC', [idUsuario]);

const findById = (id) =>
    query('SELECT * FROM Servicio WHERE ID_Servicio = ?', [id]);

const create = ({ Descripcion, ID_Usuario, Precio, Movil_Nombre, Movil_Especificacion, Fecha, Etapa }) =>
    query(
        `INSERT INTO Servicio (Descripcion, ID_Usuario, Precio, Movil_Nombre, Movil_Especificacion, Fecha, Etapa)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [Descripcion, ID_Usuario, Precio, Movil_Nombre, Movil_Especificacion, Fecha, Etapa ?? 0]
    );

const update = ({ Descripcion, ID_Usuario, Precio, Movil_Nombre, Movil_Especificacion, Fecha, Etapa, ID_Servicio }) =>
    query(
        `UPDATE Servicio SET Descripcion=?, ID_Usuario=?, Precio=?, Movil_Nombre=?, Movil_Especificacion=?, Fecha=?, Etapa=? WHERE ID_Servicio=?`,
        [Descripcion, ID_Usuario, Precio, Movil_Nombre, Movil_Especificacion, Fecha, Etapa, ID_Servicio]
    );

const cancelar = (id) =>
    query('UPDATE Servicio SET Etapa = -1 WHERE ID_Servicio = ?', [id]);

const remove = (id) =>
    query('DELETE FROM Servicio WHERE ID_Servicio = ?', [id]);

module.exports = { getAll, getByUsuario, findById, create, update, cancelar, remove };

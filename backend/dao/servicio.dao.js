const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Servicio ORDER BY Fecha DESC');

const getByUsuario = (idUsuario) =>
    query('SELECT * FROM Servicio WHERE ID_Usuario = ? ORDER BY Fecha DESC', [idUsuario]);

/**
 * RF-045: Retorna un servicio Terminado (2) o Cancelado (-1) del usuario.
 * Usado para validar si el cliente puede crear un comentario.
 */
const getActivosByUsuario = (idUsuario) =>
    query(
        'SELECT ID_Servicio FROM Servicio WHERE ID_Usuario = ? AND (Etapa = 2 OR Etapa = -1) LIMIT 1',
        [idUsuario]
    );

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

module.exports = { getAll, getByUsuario, getActivosByUsuario, findById, create, update, cancelar, remove };


const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM Servicio ORDER BY Fecha DESC');

/** Servicios asignados a un técnico específico */
const getByTecnico = (idTecnico) =>
    query('SELECT * FROM Servicio WHERE ID_Tecnico = ? ORDER BY Fecha DESC', [idTecnico]);

const getByUsuario = (idUsuario) =>
    query('SELECT * FROM Servicio WHERE ID_Usuario = ? ORDER BY Fecha DESC', [idUsuario]);

/** Retorna servicios no cancelados (Etapa ≠ -1) del usuario — usado para validar si puede comentar */
const getActivosByUsuario = (idUsuario) =>
    query('SELECT ID_Servicio FROM Servicio WHERE ID_Usuario = ? AND Etapa <> -1 LIMIT 1', [idUsuario]);

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

/** RF-014: Asigna un técnico a la orden de servicio */
const asignarTecnico = (id, idTecnico) =>
    query('UPDATE Servicio SET ID_Tecnico = ? WHERE ID_Servicio = ?', [idTecnico, id]);

const remove = (id) =>
    query('DELETE FROM Servicio WHERE ID_Servicio = ?', [id]);

module.exports = { getAll, getByUsuario, getByTecnico, getActivosByUsuario, findById, create, update, asignarTecnico, cancelar, remove };

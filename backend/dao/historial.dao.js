const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query(`
        SELECT h.*, s.Movil_Nombre, s.Movil_Especificacion, s.ID_Usuario AS ID_Usuario_Servicio
        FROM historial_servicios h
        LEFT JOIN servicio s ON s.ID_Servicio = h.ID_Servicio
        ORDER BY h.Fecha_Evento DESC
    `);

const create = ({ ID_Servicio, Descripcion_Evento, Estado }) =>
    query(
        `INSERT INTO historial_servicios (ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado)
         VALUES (?, NOW(), ?, ?)`,
        [ID_Servicio, Descripcion_Evento, Estado]
    );

const update = ({ ID_Servicio, Descripcion_Evento, Estado, ID_Registro }) =>
    query(
        `UPDATE historial_servicios SET ID_Servicio=?, Descripcion_Evento=?, Estado=? WHERE ID_Registro=?`,
        [ID_Servicio, Descripcion_Evento, Estado, ID_Registro]
    );

const remove = (id) =>
    query('DELETE FROM historial_servicios WHERE ID_Registro = ?', [id]);

module.exports = { getAll, create, update, remove };

const { queryPromise: query } = require('../config/db');

const getAll = () =>
    query('SELECT * FROM historial_servicios');

const create = ({ ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado }) =>
    query(
        `INSERT INTO historial_servicios (ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado)
         VALUES (?, ?, ?, ?)`,
        [ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado]
    );

const update = ({ ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado, ID_Registro }) =>
    query(
        `UPDATE historial_servicios SET ID_Servicio=?, Fecha_Evento=?, Descripcion_Evento=?, Estado=? WHERE ID_Registro=?`,
        [ID_Servicio, Fecha_Evento, Descripcion_Evento, Estado, ID_Registro]
    );

const remove = (id) =>
    query('DELETE FROM historial_servicios WHERE ID_Registro = ?', [id]);

module.exports = { getAll, create, update, remove };
